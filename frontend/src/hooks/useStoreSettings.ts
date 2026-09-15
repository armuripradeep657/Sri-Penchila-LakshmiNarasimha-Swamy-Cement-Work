'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface StoreSettings {
  store_name: string;
  store_phone: string;
  store_whatsapp: string;
  store_email: string;
  store_address: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  store_name: 'Sri Lakshmi Penchila Narasimha Swamy Cement Work',
  store_phone: '+919912179771',
  store_whatsapp: '+918919526315',
  store_email: 'armuriprasad@gmail.com',
  store_address:
    'Jagtial - Velgatoor Road, Opposite to Sudha Hospital, Velagatoor, Velagatoor Mandal, Jagtial District, Telangana - 505526',
};

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  const loadSettings = () => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('pcp_store_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {}

    api.getStoreSettings()
      .then((res) => {
        if (res?.settings) {
          const sMap: Partial<StoreSettings> = {};
          if (Array.isArray(res.settings)) {
            res.settings.forEach((item: any) => {
              if (item.key && item.value) {
                (sMap as any)[item.key] = item.value;
              }
            });
          } else if (typeof res.settings === 'object') {
            Object.assign(sMap, res.settings);
          }

          setSettings((prev) => {
            const merged = { ...prev, ...sMap };
            if (typeof window !== 'undefined') {
              localStorage.setItem('pcp_store_settings', JSON.stringify(merged));
            }
            return merged;
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadSettings();

    const handleSettingsUpdated = (e: any) => {
      if (e.detail) {
        setSettings((prev) => ({ ...prev, ...e.detail }));
      } else {
        loadSettings();
      }
    };

    window.addEventListener('pcp_settings_updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('pcp_settings_updated', handleSettingsUpdated);
    };
  }, []);

  return {
    settings,
    email: settings.store_email || 'armuriprasad@gmail.com',
    phone: settings.store_phone || '+919912179771',
    cleanPhone: (settings.store_phone || '9912179771').replace(/\D/g, '').slice(-10),
    whatsapp: settings.store_whatsapp || '+918919526315',
    address: settings.store_address || DEFAULT_STORE_SETTINGS.store_address,
  };
}
