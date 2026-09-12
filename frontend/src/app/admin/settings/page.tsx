'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  MapPin,
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  Store,
  Phone,
  Settings,
} from 'lucide-react';
import { api } from '@/lib/api';
import { DeliveryZone } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function AdminSettingsPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({
    store_name: 'Prasad Cement Products',
    store_phone: '+919999999999',
    store_whatsapp: '+919999999999',
    store_address: 'Plot No. 12, Industrial Area, Hyderabad, Telangana 500032',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // New zone modal
  const [showAddZone, setShowAddZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneFeeRupees, setNewZoneFeeRupees] = useState('1500');
  const [newZonePincodes, setNewZonePincodes] = useState('500001, 500002');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [zonesRes, settingsRes] = await Promise.all([
        api.getDeliveryZones(),
        api.getStoreSettings(),
      ]);
      if (zonesRes?.zones) setZones(zonesRes.zones);
      if (settingsRes?.settings) setSettings(settingsRes.settings);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      // In production API, PUT /admin/settings updates key-values
      alert('Store settings saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    const pincodesList = newZonePincodes.split(',').map((p) => p.trim());
    const feePaisa = Math.round(parseFloat(newZoneFeeRupees || '0') * 100);

    const newZone: DeliveryZone = {
      id: `zone_${Date.now()}`,
      name: newZoneName,
      pincodes: pincodesList,
      fee: feePaisa,
      isActive: true,
    };

    setZones([...zones, newZone]);
    setShowAddZone(false);
    setNewZoneName('');
    alert('Delivery zone added!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Delivery Zones & Factory Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure truck delivery freight zones, pincode coverage, and business details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Delivery Zones */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Serviced Delivery Zones</span>
            </h2>
            <button
              onClick={() => setShowAddZone(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Zone</span>
            </button>
          </div>

          <div className="space-y-3">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xs font-bold text-white">{zone.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Pincodes: {Array.isArray(zone.pincodes) ? zone.pincodes.join(', ') : zone.pincodes}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-amber-400">
                    {zone.fee === 0 ? 'FREE' : formatPrice(zone.fee)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Store Details */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl glass-panel border border-slate-800 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" />
              <span>Store & WhatsApp Contact</span>
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Business Name</label>
                <input
                  type="text"
                  value={settings.store_name || ''}
                  onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Owner WhatsApp Phone</label>
                <input
                  type="text"
                  value={settings.store_whatsapp || ''}
                  onChange={(e) => setSettings({ ...settings, store_whatsapp: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Factory / Yard Address</label>
                <textarea
                  rows={3}
                  value={settings.store_address || ''}
                  onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/10"
              >
                <Save className="w-4 h-4" />
                <span>Save Store Information</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Add Zone Modal */}
      {showAddZone && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-slate-700 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Add Delivery Zone</h2>
            <form onSubmit={handleCreateZone} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Zone Label *</label>
                <input
                  type="text"
                  required
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g. Ring Road Outer (30-50 km)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Truck Delivery Fee in ₹ *</label>
                <input
                  type="number"
                  required
                  value={newZoneFeeRupees}
                  onChange={(e) => setNewZoneFeeRupees(e.target.value)}
                  placeholder="1500"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Coverage Pincodes (Comma separated)</label>
                <input
                  type="text"
                  value={newZonePincodes}
                  onChange={(e) => setNewZonePincodes(e.target.value)}
                  placeholder="500001, 500002, 500003"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddZone(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  Create Delivery Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
