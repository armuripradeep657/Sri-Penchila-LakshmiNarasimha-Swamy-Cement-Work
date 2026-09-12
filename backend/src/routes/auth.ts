import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../services/db';
import { sendOtp, verifyOtp } from '../services/otp';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { UserRole } from '../types';

const router = Router();

// Send OTP
const sendOtpSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit mobile number required'),
  email: z.string().email().optional().or(z.literal('')),
});

router.post(
  '/send-otp',
  validateBody(sendOtpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone } = req.body;
      const result = await sendOtp(phone);
      res.json({
        message: 'OTP sent successfully',
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Verify OTP & Login
const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6, 'OTP must be 6 digits'),
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  firmName: z.string().optional(),
});

router.post(
  '/verify-otp',
  validateBody(verifyOtpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, code, name, email, firmName } = req.body;
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);

      await verifyOtp(cleanPhone, code);

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { phone: cleanPhone },
        include: { addresses: true },
      });

      const effectiveEmail = email ? email.toLowerCase().trim() : undefined;

      if (!user) {
        const isAdminPhone = cleanPhone === '9912179771' || cleanPhone === '9999999999';
        const role = isAdminPhone ? UserRole.ADMIN : UserRole.CUSTOMER;
        const defaultName = isAdminPhone ? 'Prasad (Owner)' : 'Customer';
        const defaultEmail = isAdminPhone ? 'prasad.owner@cementproducts.com' : effectiveEmail;
        const defaultFirm = isAdminPhone ? 'Prasad Cement Products Industries' : firmName;

        user = await prisma.user.create({
          data: {
            phone: cleanPhone,
            name: name || defaultName,
            email: defaultEmail,
            firmName: defaultFirm,
            role,
          },
          include: { addresses: true },
        });
      } else {
        // Update user fields if provided
        const updateData: any = {};
        if (name && !user.name) updateData.name = name;
        if (effectiveEmail && !user.email) updateData.email = effectiveEmail;
        if (firmName && !user.firmName) updateData.firmName = firmName;

        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            include: { addresses: true },
          });
        }
      }

      const tokens = generateTokens({
        userId: user.id,
        phone: user.phone,
        role: user.role,
      });

      res.json({
        success: true,
        message: 'Authentication successful',
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

// Refresh Access Token
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

// Get Current User Profile
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

// Update Profile
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

// Add delivery address
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
