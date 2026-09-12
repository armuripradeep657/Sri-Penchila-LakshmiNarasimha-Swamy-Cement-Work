import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/db';
import { NotFoundError } from '../utils/errors';
import { ProductCategory, AvailabilityStatus } from '../types';

const router = Router();

// GET all products with filtering, search, pagination
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      category,
      subType,
      search,
      availability,
      minPrice,
      maxPrice,
      sort = 'sortOrder',
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build query conditions
    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = category.toUpperCase();
    }

    if (subType) {
      where.subType = { contains: subType };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { subType: { contains: search } },
      ];
    }

    // Availability filter on variants
    if (availability) {
      where.variants = {
        some: {
          availability: availability.toUpperCase(),
          isActive: true,
        },
      };
    }

    // Price filter (paisa)
    if (minPrice || maxPrice) {
      const priceFilter: any = {};
      if (minPrice) priceFilter.gte = parseInt(minPrice, 10);
      if (maxPrice) priceFilter.lte = parseInt(maxPrice, 10);
      where.variants = {
        ...(where.variants || {}),
        some: {
          ...(where.variants?.some || {}),
          price: priceFilter,
          isActive: true,
        },
      };
    }

    let orderBy: any = { sortOrder: 'asc' };
    if (sort === 'name-asc') orderBy = { name: 'asc' };
    if (sort === 'name-desc') orderBy = { name: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          variants: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET categories summary with product counts
router.get('/categories/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = [
      {
        id: ProductCategory.WINDOW,
        name: 'Cement Windows',
        slug: 'windows',
        description: 'Durable precast window frames with custom dimensions and grill patterns.',
        icon: 'Grid3x3',
      },
      {
        id: ProductCategory.DOOR,
        name: 'Cement Doors (Darwajas)',
        slug: 'doors',
        description: 'Heavy-duty single & double precast cement door frames and jambs.',
        icon: 'DoorOpen',
      },
      {
        id: ProductCategory.BRICK,
        name: 'Cement Bricks',
        slug: 'bricks',
        description: 'Solid, hollow, and fly-ash bricks sold per piece or in bulk lots of 1000.',
        icon: 'Layers',
      },
      {
        id: ProductCategory.POOL,
        name: 'Cement Pools',
        slug: 'pools',
        description: 'Precast modular garden pools and swimming installations tailored to size.',
        icon: 'Waves',
      },
    ];

    const counts = await Promise.all(
      categories.map(async (cat) => {
        const count = await prisma.product.count({
          where: { category: cat.id, isActive: true },
        });
        return {
          ...cat,
          productCount: count,
        };
      })
    );

    res.json({
      success: true,
      categories: counts,
    });
  } catch (err) {
    next(err);
  }
});

// GET product detail by slug
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = String(req.params.slug);
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          where: { isActive: true },
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product || !product.isActive) {
      throw new NotFoundError('Product');
    }

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
