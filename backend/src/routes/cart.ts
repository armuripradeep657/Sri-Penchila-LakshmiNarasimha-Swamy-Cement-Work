import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../services/db';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { BadRequestError, NotFoundError } from '../utils/errors';

const router = Router();

// Helper to get or create cart for user
async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
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
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
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
                images: { take: 1, orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    });
  }

  return cart;
}

// GET user cart
router.get(
  '/',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const cart = await getOrCreateCart(req.user!.userId);

      let subtotal = 0;
      let quoteRequiredCount = 0;

      for (const item of cart.items) {
        if (item.variant.price) {
          subtotal += item.variant.price * item.quantity;
        } else {
          quoteRequiredCount++;
        }
      }

      res.json({
        success: true,
        cart: {
          id: cart.id,
          items: cart.items,
          subtotal,
          totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          quoteRequiredCount,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ADD item to cart
const addItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
});

router.post(
  '/items',
  authenticate,
  validateBody(addItemSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { variantId, quantity } = req.body;
      const userId = req.user!.userId;

      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true },
      });

      if (!variant || !variant.isActive || !variant.product.isActive) {
        throw new NotFoundError('Product variant');
      }

      if (quantity < variant.product.minOrderQuantity) {
        throw new BadRequestError(
          `Minimum order quantity for ${variant.product.name} is ${variant.product.minOrderQuantity}`
        );
      }

      const cart = await getOrCreateCart(userId);

      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId,
          },
        },
      });

      let cartItem;
      if (existingItem) {
        cartItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
          include: { variant: { include: { product: true } } },
        });
      } else {
        cartItem = await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            variantId,
            quantity,
          },
          include: { variant: { include: { product: true } } },
        });
      }

      res.status(201).json({
        success: true,
        message: 'Item added to cart',
        cartItem,
      });
    } catch (err) {
      next(err);
    }
  }
);

// UPDATE item quantity
const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1),
});

router.patch(
  '/items/:id',
  authenticate,
  validateBody(updateQuantitySchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const { quantity } = req.body;
      const userId = req.user!.userId;

      const cart = await getOrCreateCart(userId);
      const item = await prisma.cartItem.findFirst({
        where: { id, cartId: cart.id },
        include: { variant: { include: { product: true } } },
      });

      if (!item) {
        throw new NotFoundError('Cart item');
      }

      if (quantity < item.variant.product.minOrderQuantity) {
        throw new BadRequestError(
          `Minimum order quantity is ${item.variant.product.minOrderQuantity}`
        );
      }

      const updated = await prisma.cartItem.update({
        where: { id },
        data: { quantity },
        include: { variant: { include: { product: true } } },
      });

      res.json({
        success: true,
        cartItem: updated,
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE single item
router.delete(
  '/items/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const userId = req.user!.userId;

      const cart = await getOrCreateCart(userId);
      await prisma.cartItem.deleteMany({
        where: { id, cartId: cart.id },
      });

      res.json({
        success: true,
        message: 'Item removed from cart',
      });
    } catch (err) {
      next(err);
    }
  }
);

// CLEAR entire cart
router.delete(
  '/clear',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const cart = await getOrCreateCart(req.user!.userId);
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      res.json({
        success: true,
        message: 'Cart cleared',
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
