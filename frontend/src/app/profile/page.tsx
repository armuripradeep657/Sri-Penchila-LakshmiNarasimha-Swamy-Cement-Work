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
  Users,
  Search,
  Copy,
  Check,
  Calendar,
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

  // Registered Accounts Directory State (Owner Access)
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

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

    if (isAdmin) {
      setIsLoadingUsers(true);
      api.getRegisteredUsers().then((res) => {
        setRegisteredUsers(res?.users || []);
        setUsersCount(res?.totalCount || res?.users?.length || 0);
      }).catch((err) => {
        console.warn('Failed to load registered users', err);
      }).finally(() => {
        setIsLoadingUsers(false);
      });
    }
  }, [user, isAdmin, authLoading, router]);

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

      {/* ─── 3. Owner Only: Registered Customer Accounts Directory ──────────── */}
      {isAdmin && (
        <div className="rounded-3xl glass-panel border border-slate-800 p-6 sm:p-8 space-y-6 bg-slate-900/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">
                  Registered Customer Accounts ({usersCount})
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Live customer directory for Sri Lakshmi Penchila Narasimha Swamy Cement Works (with mobile, email & village)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
                👥 Total: {usersCount} Accounts
              </span>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Registered
              </span>
              <p className="text-2xl font-black text-amber-400 mt-1">{usersCount}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Direct yard accounts</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Customer Buyers
              </span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {registeredUsers.filter((u) => u.role === 'CUSTOMER').length}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Phone verified buyers</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Villages Represented
              </span>
              <p className="text-2xl font-black text-blue-400 mt-1">
                {new Set(registeredUsers.map((u) => u.village).filter(Boolean)).size}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Mandals & villages</p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search by customer name, mobile (+91), email, or village..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Directory List / Cards */}
          {isLoadingUsers ? (
            <div className="p-8 text-center text-slate-500 text-xs animate-pulse">
              Loading registered accounts directory...
            </div>
          ) : registeredUsers.filter((u) => {
              if (!userSearchQuery.trim()) return true;
              const q = userSearchQuery.toLowerCase();
              return (
                (u.name && u.name.toLowerCase().includes(q)) ||
                (u.phone && u.phone.includes(q)) ||
                (u.email && u.email.toLowerCase().includes(q)) ||
                (u.village && u.village.toLowerCase().includes(q)) ||
                (u.firmName && u.firmName.toLowerCase().includes(q))
              );
            }).length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No registered accounts found matching &quot;{userSearchQuery}&quot;
            </div>
          ) : (
            <div className="space-y-3">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                    <tr>
                      <th className="py-3 px-4">Customer Name & Firm</th>
                      <th className="py-3 px-4">Mobile Number</th>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4">Village / Town</th>
                      <th className="py-3 px-4 text-right">Role & Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                    {registeredUsers
                      .filter((u) => {
                        if (!userSearchQuery.trim()) return true;
                        const q = userSearchQuery.toLowerCase();
                        return (
                          (u.name && u.name.toLowerCase().includes(q)) ||
                          (u.phone && u.phone.includes(q)) ||
                          (u.email && u.email.toLowerCase().includes(q)) ||
                          (u.village && u.village.toLowerCase().includes(q)) ||
                          (u.firmName && u.firmName.toLowerCase().includes(q))
                        );
                      })
                      .map((u) => (
                        <tr key={u.id || u.phone} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-bold text-white text-xs">{u.name}</p>
                            {u.firmName && (
                              <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{u.firmName}</p>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-amber-400">
                            <div className="flex items-center gap-2">
                              <span>+91 {u.phone}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(u.phone);
                                  setCopiedPhone(u.phone);
                                  setTimeout(() => setCopiedPhone(null), 2000);
                                }}
                                className="p-1 rounded text-slate-500 hover:text-slate-300"
                                title="Copy Mobile Number"
                              >
                                {copiedPhone === u.phone ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              <a
                                href={`https://wa.me/91${u.phone.replace(/\D/g, '').slice(-10)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] font-bold"
                                title="Chat on WhatsApp"
                              >
                                WhatsApp
                              </a>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-300 text-[11px] font-mono">
                            {u.email || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              <MapPin className="w-3 h-3" />
                              <span>{u.village || 'Velagatoor'}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                u.role === 'ADMIN'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {u.role === 'ADMIN' ? '👑 Owner' : 'Customer'}
                            </span>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                            </p>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (Touch-Friendly Responsive View) */}
              <div className="md:hidden space-y-2.5">
                {registeredUsers
                  .filter((u) => {
                    if (!userSearchQuery.trim()) return true;
                    const q = userSearchQuery.toLowerCase();
                    return (
                      (u.name && u.name.toLowerCase().includes(q)) ||
                      (u.phone && u.phone.includes(q)) ||
                      (u.email && u.email.toLowerCase().includes(q)) ||
                      (u.village && u.village.toLowerCase().includes(q)) ||
                      (u.firmName && u.firmName.toLowerCase().includes(q))
                    );
                  })
                  .map((u) => (
                    <div
                      key={u.id || u.phone}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-white text-sm">{u.name}</p>
                          {u.firmName && (
                            <p className="text-[11px] text-slate-400">{u.firmName}</p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {u.role === 'ADMIN' ? '👑 Owner' : 'Customer'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Mobile Number:</span>
                          <div className="flex items-center gap-1.5 font-mono font-bold text-amber-400 mt-0.5">
                            <span>+91 {u.phone}</span>
                            <a
                              href={`https://wa.me/91${u.phone.replace(/\D/g, '').slice(-10)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 text-[10px] font-bold"
                            >
                              WA
                            </a>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 block">Village / Town:</span>
                          <span className="inline-flex items-center gap-1 text-amber-300 font-semibold text-[11px] mt-0.5">
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{u.village || 'Velagatoor'}</span>
                          </span>
                        </div>

                        <div className="col-span-2">
                          <span className="text-[10px] text-slate-500 block">Email:</span>
                          <span className="font-mono text-slate-300 truncate block">{u.email || '—'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
