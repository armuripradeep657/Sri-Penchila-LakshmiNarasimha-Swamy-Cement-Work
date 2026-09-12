'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  productName?: string;
  phoneNumber?: string;
}

export default function WhatsAppButton({
  productName,
  phoneNumber = '+919999999999',
}: WhatsAppButtonProps) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const message = productName
    ? `Hello Prasad Cement Products, I am interested in inquiring about "${productName}". Could you please provide pricing and delivery timeline?`
    : `Hello Prasad Cement Products, I would like to inquire about your precast cement products.`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group border border-emerald-400/30"
      aria-label="Chat with Prasad on WhatsApp"
    >
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </span>

      <MessageCircle className="w-6 h-6 animate-pulse" />
      <span className="font-medium text-sm hidden sm:inline-block">
        Chat with Prasad
      </span>
    </a>
  );
}
