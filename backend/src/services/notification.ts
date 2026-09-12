export interface NotificationPayload {
  toPhone: string;
  message: string;
  orderNumber?: string;
  type: 'ORDER_CONFIRMED' | 'STATUS_UPDATED' | 'QUOTE_RESPONDED';
}

export async function sendCustomerNotification(payload: NotificationPayload) {
  console.log(`\n📢 [Notification to +91-${payload.toPhone}]`);
  console.log(`Type: ${payload.type}`);
  console.log(`Content: "${payload.message}"\n`);
  // Hook external SMS gateway here (Twilio, Fast2SMS, MSG91)
  return { success: true };
}
