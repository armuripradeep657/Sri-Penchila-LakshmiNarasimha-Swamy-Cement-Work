export interface NotificationPayload {
  toPhone: string;
  message: string;
  orderNumber?: string;
  type: 'ORDER_CONFIRMED' | 'STATUS_UPDATED' | 'ORDER_CANCELLED' | 'QUOTE_RESPONDED';
}

export function cleanIndianPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // Already has 91
  }
  return cleaned;
}

export function createWhatsAppShareUrl(phone: string, text: string): string {
  const cleanedPhone = cleanIndianPhoneNumber(phone);
  return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(text)}`;
}

export function buildOrderConfirmedWhatsAppMessage(params: {
  orderNumber: string;
  customerName?: string;
  grandTotal: number;
  paymentMethod?: string;
  items?: Array<{ name: string; variantName?: string; quantity: number }>;
  address?: string;
}): string {
  const { orderNumber, customerName = 'Valued Customer', grandTotal, paymentMethod, items = [], address } = params;
  const itemsText = items.map((i) => `• ${i.name} (${i.variantName || 'Standard'}) × ${i.quantity}`).join('\n');

  return (
    `*SRI PENCHILA LAKSHMINARASIMHA SWAMY CEMENT WORK*\n` +
    `*(PRASAD CEMENT WORK)*\n` +
    `Opp. Sudha Hospital, Jagtial - Velagatoor Road, Telangana\n` +
    `Phone / WhatsApp: 8919526315\n\n` +
    `Dear ${customerName},\n` +
    `✅ *YOUR ORDER HAS BEEN CONFIRMED!*\n\n` +
    `📋 *Order Ref:* ${orderNumber}\n` +
    `💰 *Grand Total:* ₹${(grandTotal / 100).toLocaleString('en-IN')}\n` +
    `💳 *Payment Mode:* ${paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Online Payment'}\n` +
    (address ? `📍 *Site Address:* ${address}\n` : '') +
    (itemsText ? `\n📦 *Items Scheduled for Dispatch:*\n${itemsText}\n` : '') +
    `\n🚚 *Dispatch Note:* 53-grade steam cured precast items prepped for crane truck dispatch from our Velagatoor yard.\n\n` +
    `For immediate dispatch tracking, reply directly to this chat or call owner at 8919526315.\n` +
    `Thank you for trusting PRASAD CEMENT WORK!`
  );
}

export function buildOrderCancelledWhatsAppMessage(params: {
  orderNumber: string;
  customerName?: string;
  reason?: string;
}): string {
  const { orderNumber, customerName = 'Valued Customer', reason } = params;
  return (
    `*SRI PENCHILA LAKSHMINARASIMHA SWAMY CEMENT WORK*\n` +
    `*(PRASAD CEMENT WORK)*\n` +
    `Phone: 8919526315\n\n` +
    `Dear ${customerName},\n` +
    `⚠️ *ORDER STATUS UPDATE: CANCELLED*\n\n` +
    `📋 *Order Ref:* ${orderNumber}\n` +
    (reason ? `📝 *Reason:* ${reason}\n` : '') +
    `\nYour order has been cancelled in our factory dispatch system. If any online advance was collected, refund has been queued.\n\n` +
    `If this was an error or you need custom sizing/assistance, please contact owner Prasad directly at 8919526315.`
  );
}

export async function sendCustomerNotification(payload: NotificationPayload) {
  console.log(`\n📢 [WhatsApp & SMS Notification to +${cleanIndianPhoneNumber(payload.toPhone)}]`);
  console.log(`Type: ${payload.type}`);
  console.log(`Content: "${payload.message}"\n`);
  return {
    success: true,
    whatsappUrl: createWhatsAppShareUrl(payload.toPhone, payload.message),
  };
}
