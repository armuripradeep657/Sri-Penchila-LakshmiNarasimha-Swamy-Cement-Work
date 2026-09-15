import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/db';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { NotFoundError, BadRequestError } from '../utils/errors';
import {
  sendCustomerNotification,
  buildOrderConfirmedWhatsAppMessage,
  buildOrderCancelledWhatsAppMessage,
  createWhatsAppShareUrl,
} from '../services/notification';
import { OrderStatus, QuoteStatus, ProductCategory, UnitOfSale, AvailabilityStatus } from '../types';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// ─── 1. Dashboard Overview ───────────────────────────────────────────────────
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalOrders,
      monthOrders,
      monthRevenueResult,
      totalRevenueResult,
      pendingQuotesCount,
      lowStockVariants,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          status: { not: OrderStatus.CANCELLED },
        },
        _sum: { grandTotal: true },
      }),
      prisma.order.aggregate({
        where: { status: { not: OrderStatus.CANCELLED } },
        _sum: { grandTotal: true },
      }),
      prisma.quoteRequest.count({
        where: { status: QuoteStatus.PENDING },
      }),
      prisma.productVariant.findMany({
        where: {
          stock: { lte: 10 },
          availability: AvailabilityStatus.IN_STOCK,
          isActive: true,
        },
        include: { product: true },
        take: 10,
        orderBy: { stock: 'asc' },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, phone: true } },
          items: { take: 2 },
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        monthOrders,
        monthRevenuePaisa: monthRevenueResult._sum.grandTotal || 0,
        totalRevenuePaisa: totalRevenueResult._sum.grandTotal || 0,
        pendingQuotesCount,
        lowStockCount: lowStockVariants.length,
      },
      lowStockVariants,
      recentOrders,
      ordersByStatus: ordersByStatus.reduce((acc, curr) => {
        acc[curr.status] = curr._count.id;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (err) {
    next(err);
  }
});

// ─── 2. Products Management ──────────────────────────────────────────────────
router.get('/products', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: { orderBy: { sortOrder: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    next(err);
  }
});

const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  category: z.string().min(2),
  subType: z.string().optional(),
  unitOfSale: z.nativeEnum(UnitOfSale).default(UnitOfSale.PIECE),
  minOrderQuantity: z.number().int().min(1).default(1),
  isFeatured: z.boolean().default(false),
  images: z.array(z.object({ url: z.string(), altText: z.string().optional() })).optional(),
  initialVariant: z
    .object({
      name: z.string().optional(),
      sku: z.string().optional(),
      width: z.number().nullable().optional(),
      height: z.number().nullable().optional(),
      depth: z.number().nullable().optional(),
      dimensionUnit: z.string().default('ft'),
      price: z.number().nullable().optional(),
      stock: z.number().int().default(0),
      availability: z.nativeEnum(AvailabilityStatus).default(AvailabilityStatus.IN_STOCK),
    })
    .optional(),
});

router.post(
  '/products',
  validateBody(createProductSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { images, initialVariant, ...data } = req.body;

      const product = await prisma.product.create({
        data: {
          ...data,
          ...(images && images.length > 0 && {
            images: {
              create: images.map((img: any, idx: number) => ({
                url: img.url,
                altText: img.altText || `${data.name} image`,
                sortOrder: idx,
              })),
            },
          }),
          ...(initialVariant && {
            variants: {
              create: [
                {
                  name:
                    initialVariant.name ||
                    (initialVariant.width && initialVariant.height
                      ? `${initialVariant.width}×${initialVariant.height} ${initialVariant.dimensionUnit || 'ft'}`
                      : `${data.name} Standard`),
                  sku:
                    initialVariant.sku ||
                    `PCP-${data.slug.toUpperCase().slice(0, 6)}-01`,
                  width: initialVariant.width ?? null,
                  height: initialVariant.height ?? null,
                  depth: initialVariant.depth ?? null,
                  dimensionUnit: initialVariant.dimensionUnit || 'ft',
                  price: initialVariant.price ?? null,
                  stock: initialVariant.stock ?? 0,
                  availability: initialVariant.availability || AvailabilityStatus.IN_STOCK,
                },
              ],
            },
          }),
        },
        include: { images: true, variants: true },
      });

      res.status(201).json({ success: true, product });
    } catch (err) {
      next(err);
    }
  }
);

router.put('/products/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { images, ...data } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { variants: true, images: true },
    });

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

router.delete('/products/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) throw new NotFoundError('Product');

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: !current.isActive },
    });

    res.json({
      success: true,
      message: `Product ${updated.isActive ? 'activated' : 'deactivated'}`,
      product: updated,
    });
  } catch (err) {
    next(err);
  }
});

// Variants CRUD
const variantSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  depth: z.number().nullable().optional(),
  dimensionUnit: z.string().default('ft'),
  attributes: z.record(z.any()).optional(),
  price: z.number().nullable().optional(),
  comparePrice: z.number().nullable().optional(),
  stock: z.number().int().default(0),
  availability: z.nativeEnum(AvailabilityStatus).default(AvailabilityStatus.IN_STOCK),
  sortOrder: z.number().int().default(0),
});

router.post(
  '/products/:id/variants',
  validateBody(variantSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const { attributes, ...rest } = req.body;
      const variant = await prisma.productVariant.create({
        data: {
          ...rest,
          ...(attributes && { attributes: JSON.stringify(attributes) }),
          productId: id,
        },
      });

      res.status(201).json({ success: true, variant });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/products/:id/variants/:variantId',
  validateBody(variantSchema.partial()),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const variantId = String(req.params.variantId);
      const { attributes, ...rest } = req.body;
      const variant = await prisma.productVariant.update({
        where: { id: variantId },
        data: {
          ...rest,
          ...(attributes !== undefined && {
            attributes: attributes ? JSON.stringify(attributes) : null,
          }),
        },
      });

      res.json({ success: true, variant });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/products/:id/variants/:variantId/quick',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const variantId = String(req.params.variantId);
      const { price, stock, width, height, depth, dimensionUnit } = req.body;
      const data: any = {};

      if (price !== undefined) data.price = price;
      if (stock !== undefined) data.stock = parseInt(stock, 10);
      if (width !== undefined) data.width = width ? parseFloat(width) : null;
      if (height !== undefined) data.height = height ? parseFloat(height) : null;
      if (depth !== undefined) data.depth = depth ? parseFloat(depth) : null;
      if (dimensionUnit !== undefined) data.dimensionUnit = dimensionUnit;

      const variant = await prisma.productVariant.update({
        where: { id: variantId },
        data,
      });

      res.json({ success: true, message: 'Variant updated', variant });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/products/:id/variants/:variantId',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const variantId = String(req.params.variantId);
      await prisma.productVariant.delete({ where: { id: variantId } });
      res.json({ success: true, message: 'Variant deleted' });
    } catch (err) {
      next(err);
    }
  }
);

// ─── 3. Orders Management ────────────────────────────────────────────────────
router.get('/orders', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, search } = req.query as { status?: string; search?: string };
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { user: { phone: { contains: search } } },
        { user: { name: { contains: search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
        deliveryAddress: true,
        deliveryZone: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
});

const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional(),
});

router.patch(
  '/orders/:id/status',
  validateBody(updateOrderStatusSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const { status, notes } = req.body;

      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { id },
            { orderNumber: id },
          ],
        },
        include: {
          user: true,
          items: {
            include: {
              variant: { include: { product: true } },
            },
          },
          deliveryAddress: true,
        },
      });

      if (!order) throw new NotFoundError('Order');

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          status,
          ...(notes && { notes }),
        },
      });

      let whatsappMsg = '';
      let whatsappUrl = '';

      if (order.user.phone) {
        if (status === 'CONFIRMED') {
          const itemsFormatted = order.items.map((i) => ({
            name: i.variant?.product?.name || 'Precast Item',
            variantName: i.variant?.name || 'Standard',
            quantity: i.quantity,
          }));
          const addressFormatted = order.deliveryAddress
            ? `${order.deliveryAddress.line1}, ${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}`
            : 'Factory Yard Pickup (Velagatoor)';

          whatsappMsg = buildOrderConfirmedWhatsAppMessage({
            orderNumber: order.orderNumber,
            customerName: order.user.name || 'Valued Customer',
            grandTotal: order.grandTotal,
            items: itemsFormatted,
            address: addressFormatted,
          });
        } else if (status === 'CANCELLED') {
          whatsappMsg = buildOrderCancelledWhatsAppMessage({
            orderNumber: order.orderNumber,
            customerName: order.user.name || 'Valued Customer',
            reason: notes || 'Site delivery inaccessible or customer requested cancellation.',
          });
        } else {
          whatsappMsg = `*PRASAD CEMENT WORK*\nDear ${order.user.name || 'Customer'},\nOrder #${order.orderNumber} status updated to: *${status.replace(/_/g, ' ')}*.\nFactory Yard contact: 8919526315.`;
        }

        whatsappUrl = createWhatsAppShareUrl(order.user.phone, whatsappMsg);

        await sendCustomerNotification({
          toPhone: order.user.phone,
          orderNumber: order.orderNumber,
          type: status === 'CANCELLED' ? 'ORDER_CANCELLED' : 'STATUS_UPDATED',
          message: whatsappMsg,
        });
      }

      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        order: updated,
        whatsappUrl,
        whatsappMsg,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── 4. Quotes Management ────────────────────────────────────────────────────
router.get('/quotes', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query as { status?: string };
    const where: any = {};
    if (status) where.status = status;

    const quotes = await prisma.quoteRequest.findMany({
      where,
      include: {
        user: { select: { name: true, phone: true } },
        product: { include: { images: { take: 1 } } },
        variant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, quotes });
  } catch (err) {
    next(err);
  }
});

const respondQuoteSchema = z.object({
  quotedPrice: z.number().int().positive(),
  adminNotes: z.string().optional(),
  validUntilDays: z.number().int().default(7),
});

router.post(
  '/quotes/:id/respond',
  validateBody(respondQuoteSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const { quotedPrice, adminNotes, validUntilDays } = req.body;

      const quote = await prisma.quoteRequest.findUnique({
        where: { id },
        include: { user: true, product: true },
      });

      if (!quote) throw new NotFoundError('Quote request');

      const validUntil = new Date(Date.now() + validUntilDays * 24 * 60 * 60 * 1000);

      const updated = await prisma.quoteRequest.update({
        where: { id },
        data: {
          quotedPrice,
          adminNotes,
          validUntil,
          status: QuoteStatus.QUOTED,
        },
      });

      const phone = quote.phone || quote.user?.phone;
      if (phone) {
        await sendCustomerNotification({
          toPhone: phone,
          type: 'QUOTE_RESPONDED',
          message: `Prasad Cement Products has responded to your quote request for ${quote.product.name}. Quoted Price: ₹${(quotedPrice / 100).toLocaleString('en-IN')}. Log in to view & confirm!`,
        });
      }

      res.json({
        success: true,
        message: 'Quote response sent to customer',
        quote: updated,
      });
    } catch (err) {
      next(err);
    }
  }
);

const rejectQuoteSchema = z.object({
  rejectionReason: z.string().optional(),
});

router.post(
  '/quotes/:id/reject',
  validateBody(rejectQuoteSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const { rejectionReason } = req.body;

      const quote = await prisma.quoteRequest.findUnique({
        where: { id },
        include: { user: true, product: true },
      });

      if (!quote) throw new NotFoundError('Quote request');

      const updated = await prisma.quoteRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          adminNotes: rejectionReason || 'Dimension cannot be manufactured with current precast moulds.',
        },
      });

      const phone = quote.phone || quote.user?.phone;
      if (phone) {
        await sendCustomerNotification({
          toPhone: phone,
          type: 'QUOTE_RESPONDED',
          message: `Update from Prasad Cement Products regarding your quote request for ${quote.product.name}: Request could not be accommodated (${rejectionReason || 'Non-standard custom mold'}). Please call 8919526315 for alternatives.`,
        });
      }

      res.json({
        success: true,
        message: 'Quote request rejected with reason recorded.',
        quote: updated,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── 5. Delivery Zones Management ────────────────────────────────────────────
router.get('/delivery-zones', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const zones = await prisma.deliveryZone.findMany({
      orderBy: { fee: 'asc' },
    });
    const parsedZones = zones.map((z) => ({
      ...z,
      pincodes: typeof z.pincodes === 'string' ? JSON.parse(z.pincodes || '[]') : z.pincodes,
    }));
    res.json({ success: true, zones: parsedZones });
  } catch (err) {
    next(err);
  }
});

const deliveryZoneSchema = z.object({
  name: z.string().min(2),
  pincodes: z.array(z.string()),
  fee: z.number().int().min(0),
  isActive: z.boolean().default(true),
});

router.post(
  '/delivery-zones',
  validateBody(deliveryZoneSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { pincodes, ...rest } = req.body;
      const zone = await prisma.deliveryZone.create({
        data: {
          ...rest,
          pincodes: JSON.stringify(pincodes),
        },
      });
      res.status(201).json({
        success: true,
        zone: { ...zone, pincodes },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/delivery-zones/:id',
  validateBody(deliveryZoneSchema.partial()),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const { pincodes, ...rest } = req.body;
      const zone = await prisma.deliveryZone.update({
        where: { id },
        data: {
          ...rest,
          ...(pincodes && { pincodes: JSON.stringify(pincodes) }),
        },
      });
      res.json({
        success: true,
        zone: {
          ...zone,
          pincodes: typeof zone.pincodes === 'string' ? JSON.parse(zone.pincodes || '[]') : zone.pincodes,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/delivery-zones/:id',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      await prisma.deliveryZone.delete({ where: { id } });
      res.json({ success: true, message: 'Delivery zone deleted' });
    } catch (err) {
      next(err);
    }
  }
);

// ─── 6. Store Settings ───────────────────────────────────────────────────────
router.get('/settings', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.storeSetting.findMany();
    const map = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    res.json({ success: true, settings: map });
  } catch (err) {
    next(err);
  }
});

router.put('/settings', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updates = req.body as Record<string, string>;

    for (const [key, value] of Object.entries(updates)) {
      await prisma.storeSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    res.json({ success: true, message: 'Settings updated' });
  } catch (err) {
    next(err);
  }
});

// ─── 7. Customer Accounts Management (Directory) ─────────────────────────────
router.get('/users', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        firmName: true,
        role: true,
        createdAt: true,
        addresses: {
          select: {
            city: true,
            state: true,
          },
        },
      },
    });

    const parsed = users.map((u) => ({
      id: u.id,
      name: u.name || 'Customer',
      phone: u.phone,
      email: u.email,
      firmName: u.firmName,
      village: u.addresses[0]?.city || 'Velagatoor',
      role: u.role,
      createdAt: u.createdAt,
    }));

    res.json({
      success: true,
      totalCount: parsed.length,
      customersCount: parsed.filter((u) => u.role === 'CUSTOMER').length,
      users: parsed,
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [{ id }, { phone: id }],
      },
    });

    if (!targetUser) {
      return res.json({ success: true, message: 'Customer account removed successfully' });
    }

    if (targetUser.role === 'ADMIN' || targetUser.phone === '9912179771') {
      throw new BadRequestError('Cannot remove administrator/owner account');
    }

    // Delete user (cascades addresses, cart, etc.)
    await prisma.user.delete({
      where: { id: targetUser.id },
    });

    res.json({
      success: true,
      message: `Customer account for ${targetUser.name || targetUser.phone} removed successfully`,
    });
  } catch (err) {
    next(err);
  }
});

const changeCustomerPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

router.patch(
  '/users/:id/password',
  validateBody(changeCustomerPasswordSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const { newPassword } = req.body;

      const targetUser = await prisma.user.findFirst({
        where: {
          OR: [{ id }, { phone: id }],
        },
      });

      if (!targetUser) {
        throw new NotFoundError('Customer account');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: targetUser.id },
        data: { password: hashedPassword },
      });

      res.json({
        success: true,
        message: `Password updated successfully for ${targetUser.name || targetUser.phone}`,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
