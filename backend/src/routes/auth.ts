import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/db';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { UserRole } from '../types';

const router = Router();

// ─── Register (New Customer) ──────────────────────────────────────────────────
const registerSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit mobile number required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().optional().or(z.literal('')),
  firmName: z.string().optional(),
});

router.post(
  '/register',
  validateBody(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, password, name, email, firmName } = req.body;
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);

      if (cleanPhone.length !== 10) {
        throw new BadRequestError('Please enter a valid 10-digit mobile number');
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { phone: cleanPhone },
      });

      if (existingUser) {
        throw new BadRequestError('An account with this mobile number already exists. Please login instead.');
      }

      // Check email uniqueness if provided
      const effectiveEmail = email ? email.toLowerCase().trim() : undefined;
      if (effectiveEmail) {
        const emailExists = await prisma.user.findUnique({
          where: { email: effectiveEmail },
        });
        if (emailExists) {
          throw new BadRequestError('An account with this email already exists.');
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user (always CUSTOMER role via registration)
      const user = await prisma.user.create({
        data: {
          phone: cleanPhone,
          password: hashedPassword,
          name,
          email: effectiveEmail,
          firmName: firmName || undefined,
          role: UserRole.CUSTOMER,
        },
        include: { addresses: true },
      });

      // Generate tokens and auto-login
      const tokens = generateTokens({
        userId: user.id,
        phone: user.phone,
        role: user.role,
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to Prasad Cement Products.',
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          firmName: user.firmName,
          role: user.role,
          addresses: user.addresses,
        },
        ...tokens,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── Login (Mobile + Password) ───────────────────────────────────────────────
const loginSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit mobile number required'),
  password: z.string().min(1, 'Password is required'),
});

router.post(
  '/login',
  validateBody(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, password } = req.body;
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);

      if (cleanPhone.length !== 10) {
        throw new BadRequestError('Please enter a valid 10-digit mobile number');
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { phone: cleanPhone },
        include: { addresses: true },
      });

      if (!user) {
        throw new UnauthorizedError('No account found with this mobile number. Please register first.');
      }

      if (!user.isActive) {
        throw new UnauthorizedError('Your account has been deactivated. Please contact admin.');
      }

      if (!user.password) {
        throw new UnauthorizedError('Please set a password by registering again, or contact admin.');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Incorrect password. Please try again.');
      }

      const tokens = generateTokens({
        userId: user.id,
        phone: user.phone,
        role: user.role,
      });

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          firmName: user.firmName,
          role: user.role,
          addresses: user.addresses,
        },
        ...tokens,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── Refresh Access Token ────────────────────────────────────────────────────
const refreshSchema = z.object({
  refreshToken: z.string(),
});

router.post(
  '/refresh',
  validateBody(refreshSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const payload = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError('User account not found or deactivated');
      }

      const tokens = generateTokens({
        userId: user.id,
        phone: user.phone,
        role: user.role,
      });

      res.json({
        success: true,
        ...tokens,
      });
    } catch (err) {
      next(new UnauthorizedError('Invalid or expired refresh token'));
    }
  }
);

// ─── Get Current User Profile ────────────────────────────────────────────────
router.get(
  '/me',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: { addresses: true },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          firmName: user.firmName,
          role: user.role,
          addresses: user.addresses,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── Update Profile ──────────────────────────────────────────────────────────
const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal('')),
  firmName: z.string().optional(),
  phone: z.string().min(10).optional(),
});

router.put(
  '/profile',
  authenticate,
  validateBody(updateProfileSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { name, email, firmName, phone } = req.body;
      const data: any = {};

      if (name !== undefined) data.name = name;
      if (email !== undefined) data.email = email ? email.toLowerCase().trim() : null;
      if (firmName !== undefined) data.firmName = firmName;
      if (phone !== undefined) data.phone = phone.replace(/\D/g, '').slice(-10);

      const updated = await prisma.user.update({
        where: { id: req.user!.userId },
        data,
        include: { addresses: true },
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updated.id,
          phone: updated.phone,
          name: updated.name,
          email: updated.email,
          firmName: updated.firmName,
          role: updated.role,
          addresses: updated.addresses,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── Add delivery address ────────────────────────────────────────────────────
const addAddressSchema = z.object({
  label: z.string().optional(),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().optional(),
});

router.post(
  '/address',
  authenticate,
  validateBody(addAddressSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const data = req.body;

      if (data.isDefault) {
        await prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.create({
        data: {
          ...data,
          userId,
        },
      });

      res.status(201).json({
        success: true,
        address,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
