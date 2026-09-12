import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../services/db';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { generateOrderNumber } from '../utils/errors';
import { QuoteStatus, OrderStatus } from '../types';

const router = Router();

// SUBMIT Quote Request
const submitQuoteSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  customWidth: z.number().positive().optional(),
  customHeight: z.number().positive().optional(),
  customDepth: z.number().positive().optional(),
  quantity: z.number().int().min(1).default(1),
  deliveryLocation: z.string().min(3),
  deliveryPincode: z.string().optional(),
  phone: z.string().min(10),
  notes: z.string().optional(),
});

router.post(
  '/',
  authenticate,
  validateBody(submitQuoteSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const data = req.body;

      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      });

      if (!product || !product.isActive) {
        throw new NotFoundError('Product');
      }

      const quote = await prisma.quoteRequest.create({
        data: {
          ...data,
          userId,
          status: QuoteStatus.PENDING,
        },
        include: {
          product: {
            include: {
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
          },
          variant: true,
        },
      });

      console.log(`\n📝 [New Quote Request #${quote.id}]`);
      console.log(`Product: ${product.name}, Qty: ${data.quantity}`);
      console.log(`Dimensions: ${data.customWidth || '-'} x ${data.customHeight || '-'} x ${data.customDepth || '-'}`);
      console.log(`Delivery: ${data.deliveryLocation}, Phone: ${data.phone}\n`);

      res.status(201).json({
        success: true,
        message: 'Quote request submitted successfully. Prasad will contact you shortly!',
        quote,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET user's quote requests
router.get(
  '/',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const quotes = await prisma.quoteRequest.findMany({
        where: { userId: req.user!.userId },
        include: {
          product: {
            include: {
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
          },
          variant: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        quotes,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET quote request detail
router.get(
  '/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const quote = await prisma.quoteRequest.findFirst({
        where: { id, userId: req.user!.userId },
        include: {
          product: {
            include: {
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
          },
          variant: true,
        },
      });

      if (!quote) {
        throw new NotFoundError('Quote request');
      }

      res.json({
        success: true,
        quote,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ACCEPT Quoted Price & Turn into Order
router.post(
  '/:id/accept',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const userId = req.user!.userId;

      const quote = await prisma.quoteRequest.findFirst({
        where: { id, userId },
        include: { product: true, variant: true },
      });

      if (!quote) {
        throw new NotFoundError('Quote request');
      }

      if (quote.status !== QuoteStatus.QUOTED || !quote.quotedPrice) {
        throw new BadRequestError('Quote has not been priced by the admin yet or is already closed');
      }

      const orderNumber = generateOrderNumber();
      const grandTotal = quote.quotedPrice;

      const fallbackVariant = await prisma.productVariant.findFirst({
        where: { productId: quote.productId },
      });

      const effectiveVariantId = quote.variantId || fallbackVariant?.id;
      if (!effectiveVariantId) {
        throw new BadRequestError('Cannot create order without a variant');
      }

      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.CONFIRMED,
          totalAmount: grandTotal,
          deliveryFee: 0,
          grandTotal,
          notes: `Created from Quote Request #${quote.id}. Notes: ${quote.notes || ''}`,
          items: {
            create: [
              {
                variant: { connect: { id: effectiveVariantId } },
                quantity: quote.quantity,
                unitPrice: Math.round(grandTotal / quote.quantity),
                totalPrice: grandTotal,
                variantSnapshot: JSON.stringify({
                  productName: quote.product.name,
                  category: quote.product.category,
                  customWidth: quote.customWidth,
                  customHeight: quote.customHeight,
                  customDepth: quote.customDepth,
                  deliveryLocation: quote.deliveryLocation,
                  adminNotes: quote.adminNotes,
                }),
              },
            ],
          },
        },
      });

      await prisma.quoteRequest.update({
        where: { id: quote.id },
        data: { status: QuoteStatus.ACCEPTED },
      });

      res.json({
        success: true,
        message: 'Quote accepted! Order has been created.',
        order,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
