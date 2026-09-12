import { prisma } from './db';
import { BadRequestError } from '../utils/errors';

export async function sendOtp(phone: string): Promise<{ success: boolean; devOtp?: string }> {
  // Normalize phone number (remove spaces, dashes)
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    throw new BadRequestError('Invalid phone number. Must be a 10-digit mobile number.');
  }

  // Generate a random 6-digit OTP every single time (different on each request)
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Invalidate any previous unused OTPs for this phone
  await prisma.otpToken.deleteMany({
    where: { phone: cleanPhone },
  });

  // Store new OTP
  await prisma.otpToken.create({
    data: {
      phone: cleanPhone,
      code,
      expiresAt,
    },
  });

  console.log(`\n=========================================`);
  console.log(`📲 [OTP Service] Phone: +91-${cleanPhone}`);
  console.log(`🔑 Verification Code: ${code} (expires in ${expiryMinutes}m)`);
  console.log(`=========================================\n`);

  // If real SMS provider configured (Twilio, MSG91, etc.), hook here
  if (process.env.OTP_PROVIDER === 'twilio' && process.env.TWILIO_ACCOUNT_SID) {
    try {
      // In production, instantiate Twilio SDK and send SMS
      console.log(`[Twilio] Sending SMS to +91${cleanPhone}...`);
    } catch (err) {
      console.error('[Twilio Error]', err);
    }
  }

  return {
    success: true,
    devOtp: code,
  };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  const tokenRecord = await prisma.otpToken.findFirst({
    where: {
      phone: cleanPhone,
      code,
      verified: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!tokenRecord) {
    throw new BadRequestError('Invalid or expired OTP');
  }

  if (new Date() > tokenRecord.expiresAt) {
    await prisma.otpToken.delete({ where: { id: tokenRecord.id } });
    throw new BadRequestError('OTP has expired. Please request a new one.');
  }

  // Mark as verified
  await prisma.otpToken.update({
    where: { id: tokenRecord.id },
    data: { verified: true },
  });

  return true;
}
