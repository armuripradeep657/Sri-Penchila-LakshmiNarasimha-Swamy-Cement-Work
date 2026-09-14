'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Phone,
  Mail,
  Building,
  Shield,
  Save,
  CheckCircle2,
  ArrowLeft,
  MapPin,
  Sparkles,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAdmin, updateProfile, isLoading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firmName, setFirmName] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [pwdSuccessMessage, setPwdSuccessMessage] = useState('');
  const [pwdErrorMessage, setPwdErrorMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/profile');
      return;
    }

    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setFirmName(user.firmName || '');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    setIsSaving(true);
    try {
      await updateProfile({
        name,
        email: email || undefined,
        phone,
        firmName: firmName || undefined,
      });
      setSuccessMessage('Profile details updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccessMessage('');
    setPwdErrorMessage('');

    if (newPassword.length < 6) {
      setPwdErrorMessage('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdErrorMessage('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setPwdSuccessMessage('Password changed successfully! Keep it secure for your next login.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccessMessage(''), 5000);
    } catch (err: any) {
      setPwdErrorMessage(err.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-slate-400 text-xs">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <Link
          href={isAdmin ? '/admin' : '/orders'}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isAdmin ? 'Back to Admin Operations' : 'Back to Dashboard'}</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Edit Account Profile
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your personal, business credentials and account security
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto border ${
              isAdmin
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
            }`}
          >
            {isAdmin ? '👑 ADMINISTRATOR (Owner Prasad)' : '🏗️ VERIFIED CUSTOMER'}
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* ─── 1. Basic Profile Details Form ─────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 space-y-6 bg-slate-900/60"
      >
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-amber-400" />
          <span>Personal & Business Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Full Name *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Prasad Rao"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Business / Firm Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Company / Firm Name
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                placeholder="e.g. Prasad Cement Products Industries"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Mobile Number (Login & SMS) *
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. armuriprasad@gmail.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Role Privileges Overview */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
          <p className="font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Assigned Permissions & Capabilities</span>
          </p>
          {isAdmin ? (
            <ul className="text-slate-400 space-y-1 text-[11px]">
              <li>• Full access to Owner Admin Desk (`/admin`)</li>
              <li>• Direct in-page product stock quantity updater and price configuration</li>
              <li>• Review, price (accept) and reject customer custom dimension quote requests</li>
              <li>• Update order status (In Production, Out for Delivery, Delivered) with SMS triggers</li>
            </ul>
          ) : (
            <ul className="text-slate-400 space-y-1 text-[11px]">
              <li>• Direct cart checkout and site delivery booking</li>
              <li>• Multi-step booking modal with instant invoice download</li>
              <li>• Custom dimension quote requests with owner review</li>
              <li>• Order tracking with live curing and truck dispatch timeline</li>
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
        </button>
      </form>

      {/* ─── 2. Security & Change Password Card ─────────────────────────────── */}
      <div className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 space-y-6 bg-slate-900/60">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Security & Change Password</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Update your account password for secure access to the portal
          </p>
        </div>

        {pwdSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{pwdSuccessMessage}</span>
          </div>
        )}

        {pwdErrorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{pwdErrorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Current Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isAdmin && (
              <span className="text-[10px] text-amber-400/80 block">
                (Owner default: 905250)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isChangingPassword || !currentPassword || !newPassword}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>{isChangingPassword ? 'Updating Password...' : 'Update Account Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
