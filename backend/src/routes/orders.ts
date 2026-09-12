import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../services/db';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/payment';
import { sendCustomerNotification } from '../services/notification';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { generateOrderNumber } from '../utils/errors';
import { OrderStatus, PaymentStatus } from '../types';

const router = Router();

// GET delivery zones (Available zones with live fees)
router.get('/zones', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let zones = await prisma.deliveryZone.findMany({
      where: { isActive: true },
      orderBy: { fee: 'asc' },
    });

    if (zones.length === 0) {
      await prisma.deliveryZone.createMany({
        data: [
          {
            name: 'Local Velagatoor Mandal (0-10 km)',
            pincodes: JSON.stringify(['505526']),
            fee: 0,
            isActive: true,
          },
          {
            name: 'Jagtial District & Surrounds (10-30 km)',
            pincodes: JSON.stringify(['505327']),
            fee: 150000,
            isActive: true,
          },
          {
            name: 'Karimnagar / Mancherial Border (30-60 km)',
            pincodes: JSON.stringify(['505001']),
            fee: 350000,
            isActive: true,
          },
        ],
      });
      zones = await prisma.deliveryZone.findMany({
        where: { isActive: true },
        orderBy: { fee: 'asc' },
      });
    }

    res.json({
      success: true,
      zones,
    });
  } catch (err) {
    next(err);
  }
});

// PLACE ORDER (Checkout)
const placeOrderSchema = z.object({
  addressId: z.string().optional(),
  deliveryAddress: z
    .object({
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      pincode: z.string(),
    })
    .optional(),
  deliveryZoneId: z.string().optional(),
  notes: z.string().optional(),
});

router.post(
  '/',
  authenticate,
  validateBody(placeOrderSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { addressId, deliveryAddress, deliveryZoneId, notes } = req.body;

      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestError('Cart is empty');
      }

      const quoteOnlyItems = cart.items.filter((item) => !item.variant.price);
      if (quoteOnlyItems.length > 0) {
        throw new BadRequestError(
          'Some items in your cart require a custom quote. Please submit a quote request instead.'
        );
      }

      let totalAmount = 0;
      for (const item of cart.items) {
        totalAmount += (item.variant.price || 0) * item.quantity;
      }

      let deliveryFee = 0;
      let validDeliveryZoneId: string | null = null;
      if (deliveryZoneId && typeof deliveryZoneId === 'string' && deliveryZoneId.trim() !== '') {
        const zone = await prisma.deliveryZone.findUnique({
          where: { id: deliveryZoneId },
        });
        if (zone) {
          deliveryFee = zone.fee;
          validDeliveryZoneId = zone.id;
        }
      }

      const grandTotal = totalAmount + deliveryFee;

      let effectiveAddressId: string | null = null;
      if (addressId && typeof addressId === 'string' && addressId.trim() !== '') {
        const existingAddress = await prisma.address.findUnique({
          where: { id: addressId },
        });
        if (existingAddress) {
          effectiveAddressId = existingAddress.id;
        }
      }

      if (!effectiveAddressId && deliveryAddress && deliveryAddress.line1) {
        const newAddress = await prisma.address.create({
          data: {
            line1: deliveryAddress.line1,
            line2: deliveryAddress.line2 || '',
            city: deliveryAddress.city || 'Velagatoor',
            state: deliveryAddress.state || 'Telangana',
            pincode: deliveryAddress.pincode || '505526',
            userId,
          },
        });
        effectiveAddressId = newAddress.id;
      }

      const orderNumber = generateOrderNumber();

      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId,
            status: OrderStatus.CONFIRMED,
            totalAmount,
            deliveryFee,
            grandTotal,
            deliveryAddressId: effectiveAddressId,
            deliveryZoneId: validDeliveryZoneId,
            notes: notes || null,
            items: {
              create: cart.items.map((item) => ({
                variant: { connect: { id: item.variantId } },
                quantity: item.quantity,
                unitPrice: item.variant?.price || 0,
                totalPrice: (item.variant?.price || 0) * item.quantity,
                variantSnapshot: JSON.stringify({
                  productName: item.variant?.product?.name || 'Precast Item',
                  category: item.variant?.product?.category || 'GENERAL',
                  variantName: item.variant?.name || 'Standard',
                  sku: item.variant?.sku,
                  width: item.variant?.width,
                  height: item.variant?.height,
                  depth: item.variant?.depth,
                  attributes: item.variant?.attributes,
                }),
              })),
            },
          },
          include: {
            items: true,
            deliveryAddress: true,
          },
        });

        for (const item of cart.items) {
          if (item.variant.stock > 0) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stock: Math.max(0, item.variant.stock - item.quantity),
              },
            });
          }
        }

        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        return newOrder;
      });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.phone) {
        await sendCustomerNotification({
          toPhone: user.phone,
          orderNumber: order.orderNumber,
          type: 'ORDER_CONFIRMED',
          message: `Your order ${order.orderNumber} for ₹${(order.grandTotal / 100).toLocaleString('en-IN')} has been placed successfully. Thank you for choosing Prasad Cement Products!`,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        order,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET user's orders
router.get(
  '/',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const orders = await prisma.order.findMany({
        where: { userId: req.user!.userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { take: 1, orderBy: { sortOrder: 'asc' } },
                    },
                  },
                },
              },
            },
          },
          deliveryAddress: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        orders,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET single order detail & tracking
router.get(
  '/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const order = await prisma.order.findFirst({
        where: {
          id,
          userId: req.user!.userId,
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { take: 1, orderBy: { sortOrder: 'asc' } },
                    },
                  },
                },
              },
            },
          },
          deliveryAddress: true,
          deliveryZone: true,
        },
      });

      if (!order) {
        throw new NotFoundError('Order');
      }

      res.json({
        success: true,
        order,
      });
    } catch (err) {
      next(err);
    }
  }
);

// CREATE Razorpay Payment for Order
router.post(
  '/:id/payment',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const order = await prisma.order.findFirst({
        where: { id, userId: req.user!.userId },
      });

      if (!order) {
        throw new NotFoundError('Order');
      }

      if (order.paymentStatus === PaymentStatus.PAID) {
        throw new BadRequestError('Order is already paid');
      }

      const razorpayOrder = await createRazorpayOrder({
        amountPaisa: order.grandTotal,
        orderNumber: order.orderNumber,
        notes: {
          orderId: order.id,
          userId: order.userId,
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          razorpayOrderId: razorpayOrder.id,
        },
      });

      res.json({
        success: true,
        razorpayOrder,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
      });
    } catch (err) {
      next(err);
    }
  }
);

// VERIFY Razorpay Payment Callback
const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

router.post(
  '/:id/payment/verify',
  authenticate,
  validateBody(verifyPaymentSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      const order = await prisma.order.findFirst({
        where: { id, userId: req.user!.userId },
      });

      if (!order) {
        throw new NotFoundError('Order');
      }

      const isValid = verifyRazorpaySignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      });

      if (!isValid) {
        throw new BadRequestError('Payment signature verification failed');
      }

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.CONFIRMED,
          razorpayPaymentId,
          razorpaySignature,
        },
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        order: updated,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
