import crypto from 'crypto';
import Razorpay from 'razorpay';
import { BadRequestError } from '../utils/errors';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const isConfigured = Boolean(keyId && keySecret);

const razorpayInstance = isConfigured
  ? new Razorpay({
      key_id: keyId!,
      key_secret: keySecret!,
    })
  : null;

export async function createRazorpayOrder(params: {
  amountPaisa: number;
  orderNumber: string;
  notes?: Record<string, string>;
}) {
  if (!razorpayInstance) {
    // Return mock order for seamless local testing
    return {
      id: `order_mock_${Date.now()}`,
      entity: 'order',
      amount: params.amountPaisa,
      amount_paid: 0,
      amount_due: params.amountPaisa,
      currency: 'INR',
      receipt: params.orderNumber,
      status: 'created',
      mock: true,
    };
  }

  try {
    const order = await razorpayInstance.orders.create({
      amount: params.amountPaisa,
      currency: 'INR',
      receipt: params.orderNumber,
      notes: params.notes || {},
    });
    return order;
  } catch (error: any) {
    console.error('[Razorpay Order Creation Error]', error);
    throw new BadRequestError(error?.error?.description || 'Failed to create payment order');
  }
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!isConfigured) {
    // In mock mode, allow mock payment IDs
    return params.paymentId.startsWith('pay_mock') || params.signature === 'mock_signature';
  }

  const body = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret!)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === params.signature;
}
