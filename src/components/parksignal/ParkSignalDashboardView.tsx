import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { parkSignalService } from '../../services/parkSignalService';
import { ParkSignalLogo } from './ParkSignalLogo';
import {
  ParkSignalUser,
  ParkSignalVehicle,
  ParkSignalAlertLog,
  ParkSignalVehicleSettings
} from '../../types';
import {
  Car,
  QrCode,
  ShieldCheck,
  BellRing,
  Bot,
  User,
  Settings,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
  Sliders,
  Printer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Clock,
  Mic,
  Eye,
  EyeOff,
  Copy,
  Check,
  PhoneCall
} from 'lucide-react';
import { ParkSignalStickerModal } from './ParkSignalStickerModal';

type DashboardTab =
  | 'overview'
  | 'vehicles'
  | 'stickers'
  | 'history'
  | 'notifications'
  | 'telegram'
  | 'account'
  | 'privacy';

interface ParkSignalDashboardViewProps {
  initialTab?: DashboardTab;
}

export const ParkSignalDashboardView: React.FC<ParkSignalDashboardViewProps> = ({
  initialTab = 'overview'
}) => {
  const { navigateToParkSignal, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<DashboardTab>(
    (initialTab === 'telegram' || initialTab === 'privacy') ? 'account' : initialTab
  );
  const [currentUser, setCurrentUser] = useState<ParkSignalUser | null>(null);
  const [vehicles, setVehicles] = useState<ParkSignalVehicle[]>([]);
  const [alerts, setAlerts] = useState<ParkSignalAlertLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Sticker Modal
  const [selectedStickerVehicle, setSelectedStickerVehicle] = useState<ParkSignalVehicle | null>(null);

  // Vehicle Registration Modal
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicleNumber, setNewVehicleNumber] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('Car');
  const [newNickname, setNewNickname] = useState('');
  const [newDisplayPlate, setNewDisplayPlate] = useState(true);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [showAdvancedRules, setShowAdvancedRules] = useState(false);
  const [newVehicleRules, setNewVehicleRules] = useState({
    allow_blocking: true,
    allow_move_vehicle: true,
    allow_emergency: true,
    allow_child_person_inside: true,
    allow_lights_on: true,
    allow_window_door_open: true,
    allow_damage_alert: true,
    allow_custom_text: true,
    allow_voice_messages: true,
  });

  // Vehicle Settings Customizer Modal
  const [settingsVehicle, setSettingsVehicle] = useState<ParkSignalVehicle | null>(null);
  const [vehicleSettingsForm, setVehicleSettingsForm] = useState<ParkSignalVehicleSettings>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Telegram Linking State
  const [tgLinkLoading, setTgLinkLoading] = useState(false);
  const [tgDeepLink, setTgDeepLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Account Settings Form
  const [accountName, setAccountName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Delete Account Confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load Data
  const loadDashboardData = async () => {
    setLoading(true);
    const user = parkSignalService.getCurrentUser();
    if (!user) {
      navigateToParkSignal('login');
      return;
    }
    setCurrentUser(user);
    setAccountName(user.fullName || '');

    const [vRes, aRes, pRes] = await Promise.all([
      parkSignalService.getVehicles(),
      parkSignalService.getAlertHistory(),
      parkSignalService.getProfile()
    ]);

    setVehicles(vRes.vehicles);
    setAlerts(aRes.alerts);
    if (pRes.user) {
      setCurrentUser(pRes.user);
      setAccountName(pRes.user.fullName);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    await parkSignalService.logout();
    showToast('Logged out securely.', 'info');
    navigateToParkSignal('landing');
  };

  // Add Vehicle
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleNumber.trim()) return;

    setIsAddingVehicle(true);
    const res = await parkSignalService.registerVehicle({
      vehicleNumber: newVehicleNumber,
      vehicleType: newVehicleType,
      nickname: newNickname,
      displayPlatePublicly: newDisplayPlate,
      rules: newVehicleRules,
    });
    setIsAddingVehicle(false);

    if (res.success) {
      showToast('Vehicle registered successfully!', 'success');
      setShowAddVehicleModal(false);
      setNewVehicleNumber('');
      setNewNickname('');
      loadDashboardData();
    } else {
      showToast(res.error || 'Failed to add vehicle.', 'error');
    }
  };

  // Open Vehicle Settings Modal
  const openSettingsModal = (v: ParkSignalVehicle) => {
    setSettingsVehicle(v);
    setVehicleSettingsForm({
      allow_blocking: v.allow_blocking !== 0,
      allow_move_vehicle: v.allow_move_vehicle !== 0,
      allow_emergency: v.allow_emergency !== 0,
      allow_child_person_inside: v.allow_child_person_inside !== 0,
      allow_lights_on: v.allow_lights_on !== 0,
      allow_window_door_open: v.allow_window_door_open !== 0,
      allow_damage_alert: v.allow_damage_alert !== 0,
      allow_custom_text: v.allow_custom_text !== 0,
      allow_voice_messages: Boolean(v.allow_voice_messages),
      max_custom_text_length: v.max_custom_text_length || 200,
      max_voice_duration_seconds: v.max_voice_duration_seconds || 60,
      display_plate_publicly: v.display_plate_publicly !== 0,
      nickname: v.nickname || ''
    });
  };

  // Save Vehicle Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsVehicle) return;

    setIsSavingSettings(true);
    const res = await parkSignalService.updateVehicleSettings(settingsVehicle.id, vehicleSettingsForm);
    setIsSavingSettings(false);

    if (res.success) {
      showToast('Vehicle alert settings updated!', 'success');
      setSettingsVehicle(null);
      loadDashboardData();
    } else {
      showToast(res.error || 'Failed to update settings.', 'error');
    }
  };

  // Toggle Vehicle Status
  const handleToggleStatus = async (vehicleId: string) => {
    const res = await parkSignalService.toggleVehicleStatus(vehicleId);
    if (res.success) {
      showToast(res.isActive ? 'Vehicle alerts activated.' : 'Vehicle alerts paused.', 'info');
      loadDashboardData();
    }
  };

  // Regenerate QR
  const handleRegenerateQR = async (vehicleId: string) => {
    if (!window.confirm('Regenerating this QR code will permanently invalidate the old physical sticker. Proceed?')) {
      return;
    }
    const res = await parkSignalService.regenerateQR(vehicleId);
    if (res.success) {
      showToast('New QR code generated! Please print your updated sticker.', 'success');
      loadDashboardData();
    }
  };

  // Delete Vehicle
  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle and all its associated QR codes?')) {
      return;
    }
    const res = await parkSignalService.deleteVehicle(vehicleId);
    if (res.success) {
      showToast('Vehicle removed from your account.', 'info');
      loadDashboardData();
    }
  };

  // Connect Telegram
  const handleConnectTelegram = async (intent: 'CONNECT' | 'RECONNECT' = 'CONNECT') => {
    setTgLinkLoading(true);
    const res = await parkSignalService.createTelegramLink(intent);
    setTgLinkLoading(false);
    if (res.success && res.deepLink) {
      setTgDeepLink(res.deepLink);
    } else {
      showToast(res.error || 'Failed to create Telegram link token.', 'error');
    }
  };

  // Disconnect Telegram
  const handleDisconnectTelegram = async () => {
    if (!window.confirm('Are you sure you want to disconnect Telegram? You will stop receiving parking alerts.')) {
      return;
    }
    const res = await parkSignalService.disconnectTelegram();
    if (res.success) {
      showToast('Telegram unlinked.', 'info');
      loadDashboardData();
    }
  };

  // Update Profile Name
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) return;
    const res = await parkSignalService.updateProfile(accountName.trim());
    if (res.success) {
      showToast('Name updated successfully.', 'success');
      loadDashboardData();
    } else {
      showToast(res.error || 'Failed to update name.', 'error');
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    const res = await parkSignalService.changePassword(currentPassword, newPassword);
    if (res.success) {
      showToast('Password updated successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      showToast(res.error || 'Failed to change password.', 'error');
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    const res = await parkSignalService.deleteAccount();
    if (res.success) {
      showToast('Your account and all vehicle records have been permanently deleted.', 'info');
      navigateToParkSignal('landing');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
          Loading Owner Dashboard...
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4 space-y-4">
      {/* ── Top Header & Profile Strip (Compact, Zero Wasted Space) ── */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-3 sm:p-4 border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
            {currentUser?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black font-display text-neutral-900 dark:text-white leading-none">
                {currentUser?.fullName}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20 leading-none">
                Verified Owner
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">{currentUser?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddVehicleModal(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-rose-600 text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* ── Dashboard Navigation Tabs (Compact) ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-200/80 dark:border-neutral-800 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'vehicles'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Car className="w-3.5 h-3.5" /> My Vehicles ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('stickers')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'stickers'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" /> QR Stickers
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" /> Alert History ({alerts.length})
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'account'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Settings className="w-3.5 h-3.5" /> Account &amp; Settings
        </button>
      </div>

      {/* ── TAB 1: OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Registered Vehicles
              </span>
              <div className="text-2xl sm:text-3xl font-black font-display text-neutral-900 dark:text-white">
                {vehicles.length}
              </div>
              <p className="text-[11px] text-neutral-500">
                {vehicles.filter(v => v.is_active).length} Active • Fastag Ready
              </p>
            </div>

            <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Telegram Bot
              </span>
              <div className="text-base sm:text-lg font-black text-neutral-900 dark:text-white flex items-center gap-1.5 pt-0.5">
                {currentUser?.isTelegramLinked ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Connected
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> Not Linked
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500">
                <button
                  onClick={() => setActiveTab('account')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  @ParkSignal_bot →
                </button>
              </p>
            </div>

            <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Alerts Received
              </span>
              <div className="text-2xl sm:text-3xl font-black font-display text-neutral-900 dark:text-white">
                {alerts.length}
              </div>
              <p className="text-[11px] text-neutral-500">Instant via Telegram</p>
            </div>

            <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Privacy Protection
              </span>
              <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-0.5">
                <ShieldCheck className="w-4 h-4 shrink-0" /> 100% Private
              </div>
              <p className="text-[11px] text-neutral-500">Number never exposed</p>
            </div>
          </div>

          {/* Quick Telegram Warning if Not Linked */}
          {!currentUser?.isTelegramLinked && (
            <div className="p-4 sm:p-5 bg-amber-50 dark:bg-amber-950/40 rounded-3xl border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Bot className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Connect Telegram to Receive Real-Time Parking Alerts
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Bystanders cannot notify you until your account is linked with official bot @ParkSignal_bot.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('account')}
                className="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs shrink-0 hover:bg-amber-700 transition-colors"
              >
                Connect Telegram Now →
              </button>
            </div>
          )}

          {/* Registered Vehicles Quick Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-indigo-600" />
                <span>Your Vehicles &amp; Windshield Passes</span>
              </h2>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Vehicle
              </button>
            </div>

            {vehicles.length === 0 ? (
              <div className="p-8 sm:p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
                <Car className="w-10 h-10 text-neutral-400 mx-auto" />
                <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
                  No vehicles registered yet
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Add your car or two-wheeler to generate your first printable Fastag-size QR sticker.
                </p>
                <button
                  onClick={() => setShowAddVehicleModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                >
                  Register Your First Vehicle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black font-mono text-neutral-900 dark:text-white">
                              {v.vehicle_number}
                            </span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                v.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              title={v.is_active ? 'Active' : 'Inactive'}
                            />
                          </div>
                          <span className="text-xs text-neutral-400">
                            {v.vehicle_type} {v.nickname ? `• ${v.nickname}` : ''}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleStatus(v.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors shrink-0 ${
                          v.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {v.is_active ? '🟢 Active' : '🔴 Paused'}
                      </button>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                      <button
                        onClick={() => setSelectedStickerVehicle(v)}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print / Download Sticker
                      </button>
                      <button
                        onClick={() => openSettingsModal(v)}
                        className="py-2 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold flex items-center gap-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        title="Alert Rules"
                      >
                        <Sliders className="w-3.5 h-3.5" /> Rules
                      </button>
                      <button
                        onClick={() => handleRegenerateQR(v.id)}
                        className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-indigo-600 hover:bg-neutral-50"
                        title="Regenerate QR Token"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Alerts Activity Feed */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Recent Alerts Feed
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('history')}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                View All History ({alerts.length}) →
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 text-center space-y-1">
                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  ✨ All quiet — No alerts received yet
                </p>
                <p className="text-[11px] text-neutral-400">
                  When someone scans your windshield QR pass, notification details and voice recordings will show here and in Telegram.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">
                        {a.alert_type === 'BLOCKING' ? '🚗' : a.alert_type === 'EMERGENCY' ? '🚨' : a.alert_type === 'LIGHTS_ON' ? '💡' : a.alert_type === 'WINDOW_OPEN' ? '🪟' : a.alert_type === 'TOWING' ? '🚜' : '⚠️'}
                      </span>
                      <div className="truncate">
                        <div className="font-bold text-neutral-900 dark:text-white truncate">
                          {a.alert_type.replace('_', ' ')} • {a.vehicle_number}
                        </div>
                        <span className="text-[11px] text-neutral-400">
                          {new Date(a.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        a.delivery_status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {a.delivery_status === 'DELIVERED' ? '✓ Delivered' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compact 24x7 Emergency Helplines Bar */}
          <div className="bg-rose-50/80 dark:bg-rose-950/30 p-4 rounded-3xl border border-rose-200/80 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
              <div>
                <span className="font-bold text-rose-900 dark:text-rose-200">
                  National Emergency Helplines (24x7):
                </span>
                <span className="text-[11px] text-rose-700 dark:text-rose-300 ml-1.5 hidden sm:inline">
                  Direct tap to dial in case of serious road accidents or safety crises
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <a
                href="tel:112"
                className="px-2.5 py-1 rounded-xl bg-rose-600 text-white font-extrabold text-[11px] hover:bg-rose-700 shadow-2xs"
              >
                112 All-in-One
              </a>
              <a
                href="tel:100"
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-800 font-bold text-rose-700 dark:text-rose-300 text-[11px] hover:bg-rose-50"
              >
                100 Police
              </a>
              <a
                href="tel:108"
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-800 font-bold text-rose-700 dark:text-rose-300 text-[11px] hover:bg-rose-50"
              >
                108 Ambulance
              </a>
              <a
                href="tel:1033"
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-800 font-bold text-rose-700 dark:text-rose-300 text-[11px] hover:bg-rose-50"
              >
                1033 Highway
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: MY VEHICLES ── */}
      {activeTab === 'vehicles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Vehicle Fleet Management
              </h2>
              <p className="text-xs text-neutral-500">
                Manage registered plates, vehicle types, nicknames, and active status
              </p>
            </div>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> Add Vehicle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 block">
                      {v.vehicle_type}
                    </span>
                    <h3 className="text-xl font-black font-mono text-neutral-900 dark:text-white">
                      {v.vehicle_number}
                    </h3>
                    {v.nickname && (
                      <p className="text-xs text-neutral-500 font-medium">"{v.nickname}"</p>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                      v.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {v.is_active ? '🟢 Alerts Active' : '🔴 Inactive'}
                  </span>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl text-xs space-y-1.5 border border-neutral-200/50 dark:border-neutral-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Public Plate Visibility:</span>
                    <span className="font-bold">
                      {v.display_plate_publicly ? 'Full Number Visible' : 'Masked (••••)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Voice Messages:</span>
                    <span className={`font-bold ${Boolean(v.allow_voice_messages) ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`}>
                      {Boolean(v.allow_voice_messages) ? `🟢 Active (${v.max_voice_duration_seconds || 60}s)` : '⚪ Disabled'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedStickerVehicle(v)}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Sticker
                  </button>
                  <button
                    onClick={() => openSettingsModal(v)}
                    className="flex-1 py-2 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-neutral-50"
                  >
                    <Sliders className="w-3.5 h-3.5" /> Customize Rules
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(v.id)}
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
                    title="Delete Vehicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: QR CODES & STICKERS ── */}
      {activeTab === 'stickers' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Printable Windshield Stickers
            </h2>
            <p className="text-xs text-neutral-500">
              Download automotive-grade vector SVG and high-res PNG stickers ready for placement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 mx-auto flex items-center justify-center font-bold">
                  <QrCode className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-mono text-neutral-900 dark:text-white">
                    {v.vehicle_number}
                  </h3>
                  <p className="text-xs text-neutral-400">{v.vehicle_type}</p>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl text-[11px] text-neutral-500 font-mono break-all">
                  https://bharatutility.tech/parksignal/alert/{v.qr_token || '...'}
                </div>

                <button
                  onClick={() => setSelectedStickerVehicle(v)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  <Printer className="w-4 h-4" /> Open Print & Download Card
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: ALERT NOTIFICATION HISTORY ── */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Notification & Alert History
            </h2>
            <p className="text-xs text-neutral-500">
              Log of parking alerts and voice notes dispatched to your Telegram
            </p>
          </div>

          {alerts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <BellRing className="w-8 h-8 text-neutral-400 mx-auto" />
              <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                No alerts received yet
              </h3>
              <p className="text-xs text-neutral-500">
                When someone scans your vehicle QR sticker, the notification will appear here and in your Telegram app.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-sm">
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {alerts.map((a) => (
                  <div key={a.id} className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs font-mono text-neutral-900 dark:text-white">
                          {a.vehicle_number}
                        </span>
                        <span className="text-[10px] text-neutral-400">({a.vehicle_type})</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                          {a.alert_type === 'VOICE' ? '🎙️ Voice Note' : '📝 Text Alert'}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {a.alert_category}
                      </div>
                      {a.custom_message && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 italic">
                          "{a.custom_message}"
                        </p>
                      )}
                      <div className="text-[10px] text-neutral-400 flex items-center gap-1 pt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(a.created_at).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${
                        a.delivery_status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {a.delivery_status === 'DELIVERED' ? '✓ Delivered' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: ACCOUNT, TELEGRAM BOT & PRIVACY SETTINGS (MERGED) ── */}
      {(activeTab === 'account' || activeTab === 'telegram' || activeTab === 'privacy') && (
        <div className="space-y-6 max-w-3xl">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              <span>Account, Telegram Bot &amp; Privacy Settings</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Manage your @ParkSignal_bot connection, owner profile, phone privacy guarantees, and account security in one unified place.
            </p>
          </div>

          {/* ── SECTION 1: TELEGRAM BOT SETTINGS ── */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>Telegram Alert Bot</span>
                    <span className="text-xs font-mono font-semibold text-blue-600">@ParkSignal_bot</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Parking alerts &amp; voice notes arrive in your Telegram app privately in 5 seconds
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                  currentUser?.isTelegramLinked
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {currentUser?.isTelegramLinked ? '✓ Linked & Active' : '⚠️ Not Linked'}
              </span>
            </div>

            {currentUser?.isTelegramLinked ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Real-Time Notifications Active
                  </div>
                  <p>
                    Your account is securely linked to @ParkSignal_bot. Whenever someone scans any of your registered vehicle QR stickers, alerts will arrive in your Telegram app instantly.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => handleConnectTelegram('RECONNECT')}
                    className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Connect Different Telegram Account
                  </button>
                  <button
                    onClick={handleDisconnectTelegram}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition-colors"
                  >
                    Disconnect Telegram
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Click the button below to generate a secure 10-minute linking token. You will be redirected to @ParkSignal_bot in Telegram. Simply tap <strong>START</strong> to bind your account.
                </p>

                <button
                  onClick={() => handleConnectTelegram('CONNECT')}
                  disabled={tgLinkLoading}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-extrabold text-xs flex items-center gap-2 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-colors"
                >
                  {tgLinkLoading ? 'Generating Secure Token...' : 'Connect Telegram with @ParkSignal_bot →'}
                </button>
              </div>
            )}

            {/* Deep link box if generated */}
            {tgDeepLink && (
              <div className="p-4 sm:p-5 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-3">
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  Step 2: Open Deep Link in Telegram
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={tgDeepLink}
                    className="flex-1 p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-indigo-200 text-xs font-mono text-neutral-800 dark:text-neutral-200"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tgDeepLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={tgDeepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-indigo-700"
                  >
                    Open @ParkSignal_bot Now <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => {
                      setTgDeepLink(null);
                      loadDashboardData();
                    }}
                    className="text-xs font-bold text-neutral-500 hover:underline"
                  >
                    I've Tapped Start (Refresh)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── SECTION 2: OWNER PROFILE & CREDENTIALS ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profile Name & Details */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Profile Details</span>
              </h3>
              <form onSubmit={handleUpdateName} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-400 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-neutral-400">Primary login email (verified)</span>
                </div>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
                >
                  Save Profile Name
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Change Password</span>
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                    New Password (Min 8 chars)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>

          {/* ── SECTION 3: PRIVACY & SECURITY CONTROLS ── */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Active Privacy &amp; Security Protections</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1">
                <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  🔒 Zero Phone Number Sharing
                </span>
                <p className="text-neutral-500 leading-relaxed text-[11px]">
                  Your mobile number and email are never shown to any QR code scanner or caller.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1">
                <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  ⚡ Anti-Spam Rate Limiting
                </span>
                <p className="text-neutral-500 leading-relaxed text-[11px]">
                  Each vehicle QR is rate-limited to 3 notifications per 15 minutes to block prank alerts.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1">
                <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  🎙️ Ephemeral Voice Notes
                </span>
                <p className="text-neutral-500 leading-relaxed text-[11px]">
                  Bystander voice messages are streamed directly to Telegram and immediately wiped from edge storage.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1">
                <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  🔐 Single-Use Cryptographic Tokens
                </span>
                <p className="text-neutral-500 leading-relaxed text-[11px]">
                  Account linking tokens expire after 10 minutes. Telegram chat IDs are never exposed in HTML.
                </p>
              </div>
            </div>
          </div>

          {/* ── SECTION 4: DANGER ZONE (DELETE ACCOUNT) ── */}
          <div className="bg-rose-50/60 dark:bg-rose-950/20 rounded-3xl p-5 sm:p-6 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
            <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Danger Zone: Permanent Account Deletion
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Permanently delete your owner account. This will invalidate all your vehicle QR stickers, delete all alert histories, and remove your Telegram bindings immediately. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="py-2.5 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-colors"
            >
              Delete My Account Permanently
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 1: ADD VEHICLE MODAL ── */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-md w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-neutral-900 dark:text-white">
                  Register New Vehicle
                </h3>
                <p className="text-xs text-neutral-500">
                  Add vehicle plate to generate unique QR sticker
                </p>
              </div>
              <button
                onClick={() => setShowAddVehicleModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Vehicle Registration Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH 12 AB 1234, DL 01 A 1234, 22 BH 1234 AA"
                  value={newVehicleNumber}
                  onChange={(e) => setNewVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-mono font-bold tracking-wider outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-neutral-400">
                  Accepts standard state, vintage, and Bharat (BH) series
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Vehicle Type
                </label>
                <select
                  value={newVehicleType}
                  onChange={(e) => setNewVehicleType(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold outline-none"
                >
                  <option value="Car">Car / SUV</option>
                  <option value="Bike">Motorcycle / Bike</option>
                  <option value="Scooter">Scooter / Moped</option>
                  <option value="Other">Commercial / Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Optional Nickname
                </label>
                <input
                  type="text"
                  placeholder="e.g. Office Honda City, Red Activa"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  className="w-full p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="displayPlate"
                  checked={newDisplayPlate}
                  onChange={(e) => setNewDisplayPlate(e.target.checked)}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="displayPlate" className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                  Display registration number publicly on scanner page (Uncheck to mask)
                </label>
              </div>

              {/* Alert Rules Quick Config */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAdvancedRules(!showAdvancedRules)}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    Configure Alert Rules (Optional)
                  </span>
                  <span className="text-[11px] text-indigo-600">
                    {showAdvancedRules ? '▲ Hide' : '▼ Customize'}
                  </span>
                </button>

                {showAdvancedRules && (
                  <div className="space-y-2 pt-2 text-xs animate-fadeIn">
                    <p className="text-[11px] text-neutral-500 pb-1">
                      Choose which alert categories bystanders can send to this vehicle:
                    </p>
                    <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                      <span>🚗 Vehicle blocking car/gate</span>
                      <input
                        type="checkbox"
                        checked={newVehicleRules.allow_blocking}
                        onChange={(e) => setNewVehicleRules({ ...newVehicleRules, allow_blocking: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                      <span>🅿️ Move vehicle request</span>
                      <input
                        type="checkbox"
                        checked={newVehicleRules.allow_move_vehicle}
                        onChange={(e) => setNewVehicleRules({ ...newVehicleRules, allow_move_vehicle: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                      <span>⚠️ Emergency alert</span>
                      <input
                        type="checkbox"
                        checked={newVehicleRules.allow_emergency}
                        onChange={(e) => setNewVehicleRules({ ...newVehicleRules, allow_emergency: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                      <span>💡 Lights left ON</span>
                      <input
                        type="checkbox"
                        checked={newVehicleRules.allow_lights_on}
                        onChange={(e) => setNewVehicleRules({ ...newVehicleRules, allow_lights_on: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                      <span>🪟 Window or door open</span>
                      <input
                        type="checkbox"
                        checked={newVehicleRules.allow_window_door_open}
                        onChange={(e) => setNewVehicleRules({ ...newVehicleRules, allow_window_door_open: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                      <span>🎙️ 60-second voice notes</span>
                      <input
                        type="checkbox"
                        checked={newVehicleRules.allow_voice_messages}
                        onChange={(e) => setNewVehicleRules({ ...newVehicleRules, allow_voice_messages: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingVehicle}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                >
                  {isAddingVehicle ? 'Generating...' : 'Add & Generate QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: VEHICLE ALERT CUSTOMIZATION ── */}
      {settingsVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-lg w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-black text-neutral-900 dark:text-white">
                  Alert Rules: {settingsVehicle.vehicle_number}
                </h3>
                <p className="text-xs text-neutral-500">
                  Configure what messages scanners can send without reprinting your QR sticker
                </p>
              </div>
              <button
                onClick={() => setSettingsVehicle(null)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Category Toggles */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                  Allowed Alert Categories:
                </span>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                    <span>🚗 Vehicle blocking my vehicle</span>
                    <input
                      type="checkbox"
                      checked={Boolean(vehicleSettingsForm.allow_blocking)}
                      onChange={(e) =>
                        setVehicleSettingsForm({ ...vehicleSettingsForm, allow_blocking: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                    <span>🅿️ Please move your vehicle</span>
                    <input
                      type="checkbox"
                      checked={Boolean(vehicleSettingsForm.allow_move_vehicle)}
                      onChange={(e) =>
                        setVehicleSettingsForm({ ...vehicleSettingsForm, allow_move_vehicle: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                    <span>⚠️ Emergency alert</span>
                    <input
                      type="checkbox"
                      checked={Boolean(vehicleSettingsForm.allow_emergency)}
                      onChange={(e) =>
                        setVehicleSettingsForm({ ...vehicleSettingsForm, allow_emergency: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                    <span>👶 Possible child or person inside</span>
                    <input
                      type="checkbox"
                      checked={Boolean(vehicleSettingsForm.allow_child_person_inside)}
                      onChange={(e) =>
                        setVehicleSettingsForm({ ...vehicleSettingsForm, allow_child_person_inside: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                    <span>💡 Vehicle lights left ON</span>
                    <input
                      type="checkbox"
                      checked={Boolean(vehicleSettingsForm.allow_lights_on)}
                      onChange={(e) =>
                        setVehicleSettingsForm({ ...vehicleSettingsForm, allow_lights_on: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                    <span>🪟 Window or door open</span>
                    <input
                      type="checkbox"
                      checked={Boolean(vehicleSettingsForm.allow_window_door_open)}
                      onChange={(e) =>
                        setVehicleSettingsForm({ ...vehicleSettingsForm, allow_window_door_open: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                    <span>💥 Possible vehicle damage</span>
                    <input
                      type="checkbox"
                      checked={Boolean(vehicleSettingsForm.allow_damage_alert)}
                      onChange={(e) =>
                        setVehicleSettingsForm({ ...vehicleSettingsForm, allow_damage_alert: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>

              {/* Custom Text Permissions */}
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl space-y-3">
                <label className="flex items-center justify-between text-xs font-bold cursor-pointer">
                  <span>Allow Custom Text Notes</span>
                  <input
                    type="checkbox"
                    checked={Boolean(vehicleSettingsForm.allow_custom_text)}
                    onChange={(e) =>
                      setVehicleSettingsForm({ ...vehicleSettingsForm, allow_custom_text: e.target.checked })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
                {vehicleSettingsForm.allow_custom_text && (
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1">
                      Max Note Length: {vehicleSettingsForm.max_custom_text_length || 200} characters
                    </label>
                    <input
                      type="range"
                      min={50}
                      max={300}
                      step={25}
                      value={vehicleSettingsForm.max_custom_text_length || 200}
                      onChange={(e) =>
                        setVehicleSettingsForm({
                          ...vehicleSettingsForm,
                          max_custom_text_length: parseInt(e.target.value, 10)
                        })
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>
                )}
              </div>

              {/* Voice Message Permissions */}
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl space-y-3">
                <label className="flex items-center justify-between text-xs font-bold cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-indigo-600" /> Allow Voice Messages
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(vehicleSettingsForm.allow_voice_messages)}
                    onChange={(e) =>
                      setVehicleSettingsForm({ ...vehicleSettingsForm, allow_voice_messages: e.target.checked })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
                {vehicleSettingsForm.allow_voice_messages && (
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1">
                      Max Voice Duration: {vehicleSettingsForm.max_voice_duration_seconds || 60} seconds
                    </label>
                    <select
                      value={vehicleSettingsForm.max_voice_duration_seconds || 60}
                      onChange={(e) =>
                        setVehicleSettingsForm({
                          ...vehicleSettingsForm,
                          max_voice_duration_seconds: parseInt(e.target.value, 10)
                        })
                      }
                      className="w-full p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 text-xs"
                    >
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={45}>45 seconds</option>
                      <option value={60}>60 seconds (Standard)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Plate Privacy */}
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl">
                <label className="flex items-center justify-between text-xs font-bold cursor-pointer">
                  <span>Display Registration Plate Publicly</span>
                  <input
                    type="checkbox"
                    checked={Boolean(vehicleSettingsForm.display_plate_publicly)}
                    onChange={(e) =>
                      setVehicleSettingsForm({ ...vehicleSettingsForm, display_plate_publicly: e.target.checked })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
                <p className="text-[10px] text-neutral-400 mt-1">
                  When unchecked, the scanner sees <code>MH 12 •••• 1234</code>.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSettingsVehicle(null)}
                  className="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  {isSavingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: STICKER MODAL ── */}
      {selectedStickerVehicle && (
        <ParkSignalStickerModal
          vehicle={selectedStickerVehicle}
          isOpen={Boolean(selectedStickerVehicle)}
          onClose={() => setSelectedStickerVehicle(null)}
        />
      )}

      {/* ── MODAL 4: DELETE ACCOUNT CONFIRMATION ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-sm w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-neutral-900 dark:text-white">
              Permanently Delete Account?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              This will remove all {vehicles.length} vehicle stickers and unlink your Telegram. Active QR stickers will stop working immediately.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
