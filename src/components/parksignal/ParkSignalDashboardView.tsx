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
  AlertTriangle,
  ExternalLink,
  Clock,
  Mic,
  Copy,
  Check,
  PhoneCall,
  LayoutDashboard,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { ParkSignalStickerModal } from './ParkSignalStickerModal';

type DashboardTab = 'overview' | 'vehicles' | 'stickers' | 'history' | 'account' | 'telegram' | 'privacy';

interface ParkSignalDashboardViewProps {
  initialTab?: DashboardTab;
}

export const ParkSignalDashboardView: React.FC<ParkSignalDashboardViewProps> = ({
  initialTab = 'overview'
}) => {
  const { navigateToParkSignal, showToast } = useApp();

  // Normalize initialTab: merge 'stickers' into 'vehicles', and 'telegram'/'privacy' into 'account'
  const normalizedTab: 'overview' | 'vehicles' | 'history' | 'account' =
    initialTab === 'stickers'
      ? 'vehicles'
      : initialTab === 'telegram' || initialTab === 'privacy'
      ? 'account'
      : initialTab === 'history'
      ? 'history'
      : initialTab === 'vehicles'
      ? 'vehicles'
      : 'overview';

  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'history' | 'account'>(normalizedTab);
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
    allow_voice_messages: true
  });

  // Vehicle Settings Customizer Modal
  const [settingsVehicle, setSettingsVehicle] = useState<ParkSignalVehicle | null>(null);
  const [vehicleSettingsForm, setVehicleSettingsForm] = useState<ParkSignalVehicleSettings>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Telegram Linking State
  const [tgLinkLoading, setTgLinkLoading] = useState(false);
  const [tgDeepLink, setTgDeepLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedVehicleId, setCopiedVehicleId] = useState<string | null>(null);

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
    const res = await parkSignalService.registerVehicle(
      newVehicleNumber.trim().toUpperCase(),
      newVehicleType,
      newNickname.trim() || undefined,
      newDisplayPlate
    );
    setIsAddingVehicle(false);

    if (res.success && res.vehicle) {
      showToast(`Vehicle ${res.vehicle.vehicle_number} registered!`, 'success');
      setShowAddVehicleModal(false);
      setNewVehicleNumber('');
      setNewNickname('');
      loadDashboardData();
      setSelectedStickerVehicle(res.vehicle);
    } else {
      showToast(res.error || 'Failed to register vehicle.', 'error');
    }
  };

  // Toggle Vehicle Active Status
  const handleToggleStatus = async (vehicleId: string) => {
    const res = await parkSignalService.toggleVehicleStatus(vehicleId);
    if (res.success) {
      showToast(
        res.vehicle?.is_active
          ? 'Alerts resumed for this vehicle.'
          : 'Alerts paused for this vehicle.',
        'info'
      );
      loadDashboardData();
    } else {
      showToast(res.error || 'Failed to update vehicle status.', 'error');
    }
  };

  // Regenerate QR Token
  const handleRegenerateQR = async (vehicleId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to regenerate this QR token? The old printed QR sticker will immediately stop working!'
      )
    ) {
      return;
    }
    const res = await parkSignalService.regenerateQR(vehicleId);
    if (res.success) {
      showToast('QR token regenerated! Please print the new sticker.', 'success');
      loadDashboardData();
    } else {
      showToast(res.error || 'Failed to regenerate QR code.', 'error');
    }
  };

  // Delete Vehicle
  const handleDeleteVehicle = async (vehicleId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to remove this vehicle? Its QR sticker and alert history will be permanently deleted.'
      )
    ) {
      return;
    }
    const res = await parkSignalService.deleteVehicle(vehicleId);
    if (res.success) {
      showToast('Vehicle deleted.', 'info');
      loadDashboardData();
    } else {
      showToast(res.error || 'Failed to delete vehicle.', 'error');
    }
  };

  // Open Settings Modal
  const openSettingsModal = (v: ParkSignalVehicle) => {
    setSettingsVehicle(v);
    setVehicleSettingsForm({
      allow_blocking: Boolean(v.allow_blocking),
      allow_move_vehicle: Boolean(v.allow_move_vehicle),
      allow_emergency: Boolean(v.allow_emergency),
      allow_child_person_inside: Boolean(v.allow_child_person_inside),
      allow_lights_on: Boolean(v.allow_lights_on),
      allow_window_door_open: Boolean(v.allow_window_door_open),
      allow_damage_alert: Boolean(v.allow_damage_alert),
      allow_custom_text: Boolean(v.allow_custom_text),
      allow_voice_messages: Boolean(v.allow_voice_messages),
      max_custom_text_length: v.max_custom_text_length || 200,
      max_voice_duration_seconds: v.max_voice_duration_seconds || 60,
      display_plate_publicly: Boolean(v.display_plate_publicly)
    });
  };

  // Save Vehicle Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsVehicle) return;

    setIsSavingSettings(true);
    const res = await parkSignalService.updateVehicleSettings(
      settingsVehicle.id,
      vehicleSettingsForm
    );
    setIsSavingSettings(false);

    if (res.success) {
      showToast('Vehicle alert rules updated!', 'success');
      setSettingsVehicle(null);
      loadDashboardData();
    } else {
      showToast(res.error || 'Failed to update vehicle settings.', 'error');
    }
  };

  // Connect Telegram
  const handleConnectTelegram = async (mode: 'CONNECT' | 'RECONNECT' = 'CONNECT') => {
    setTgLinkLoading(true);
    const res = await parkSignalService.getTelegramLinkToken();
    setTgLinkLoading(false);

    if (res.success && res.deepLink) {
      setTgDeepLink(res.deepLink);
      window.open(res.deepLink, '_blank', 'noopener,noreferrer');
    } else {
      showToast(res.error || 'Failed to create Telegram link token.', 'error');
    }
  };

  // Disconnect Telegram
  const handleDisconnectTelegram = async () => {
    if (
      !window.confirm(
        'Are you sure you want to disconnect Telegram? You will stop receiving parking alerts.'
      )
    ) {
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

  // Copy Alert Link helper
  const handleCopyAlertLink = (vehicle: ParkSignalVehicle) => {
    const url = `https://bharatutility.tech/parksignal/alert/${vehicle.qr_token}`;
    navigator.clipboard.writeText(url);
    setCopiedVehicleId(vehicle.id);
    showToast(`Copied QR Alert Link for ${vehicle.vehicle_number}`, 'success');
    setTimeout(() => setCopiedVehicleId(null), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
          Loading Owner Dashboard...
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-5 py-2.5 sm:py-3.5 space-y-3">
      {/* ── Top Header Strip (Clean, Zero Wasted Padding) ── */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-2.5 sm:p-3 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
            {currentUser?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <h1 className="text-sm font-black font-display text-neutral-900 dark:text-white">
                {currentUser?.fullName}
              </h1>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold border border-emerald-500/20">
                Verified Owner
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {currentUser?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAddVehicleModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-rose-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* ── 4 Unified Navigation Tabs (Merged Vehicles & Stickers, Low Vertical Gap) ── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'vehicles'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>My Vehicles &amp; QR Stickers ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Alert History ({alerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'account'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Account &amp; Settings</span>
        </button>
      </div>

      {/* ── TAB 1: OVERVIEW (COMPACT) ── */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Registered Vehicles
              </span>
              <div className="text-xl sm:text-2xl font-black font-display text-neutral-900 dark:text-white leading-none pt-0.5">
                {vehicles.length}
              </div>
              <p className="text-[10px] text-neutral-500 pt-0.5">
                {vehicles.filter((v) => v.is_active).length} Active • Fastag Ready
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Telegram Bot Link
              </span>
              <div className="text-sm sm:text-base font-black text-neutral-900 dark:text-white flex items-center gap-1 leading-none pt-0.5">
                {currentUser?.isTelegramLinked ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Connected
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Not Linked
                  </span>
                )}
              </div>
              <p className="text-[10px] text-neutral-500 pt-0.5">
                <button
                  onClick={() => setActiveTab('account')}
                  className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  @ParkSignal_bot →
                </button>
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Alerts Received
              </span>
              <div className="text-xl sm:text-2xl font-black font-display text-neutral-900 dark:text-white leading-none pt-0.5">
                {alerts.length}
              </div>
              <p className="text-[10px] text-neutral-500 pt-0.5">Instant via Telegram</p>
            </div>

            <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Driver Privacy
              </span>
              <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 leading-none pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> 100% Protected
              </div>
              <p className="text-[10px] text-neutral-500 pt-0.5">Zero Phone Sharing</p>
            </div>
          </div>

          {/* Quick Telegram Warning if Not Linked */}
          {!currentUser?.isTelegramLinked && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <Bot className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Connect Telegram to Receive Real-Time Parking Alerts
                  </h3>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                    Bystanders cannot notify you until your account is linked with @ParkSignal_bot.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('account')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs shrink-0 hover:bg-amber-700 transition-colors cursor-pointer"
              >
                Connect Telegram →
              </button>
            </div>
          )}

          {/* Vehicles Quick Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase font-extrabold tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Your Vehicles &amp; Windshield Passes</span>
              </h2>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Vehicle
              </button>
            </div>

            {vehicles.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                <Car className="w-8 h-8 text-neutral-400 mx-auto" />
                <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  No vehicles registered yet
                </h3>
                <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
                  Add your car or two-wheeler to generate your first printable Fastag-size QR sticker.
                </p>
                <button
                  onClick={() => setShowAddVehicleModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 cursor-pointer"
                >
                  Register Your First Vehicle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Mini Indian Plate */}
                        <div className="inline-flex items-stretch rounded-md border border-neutral-900 overflow-hidden bg-white text-neutral-950 font-mono shadow-2xs">
                          <span className="bg-[#002B7F] text-white px-1.5 py-0.5 text-[8px] font-black flex items-center">
                            IND
                          </span>
                          <span className="px-2 py-0.5 text-xs font-black tracking-wider uppercase">
                            {v.vehicle_number}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400">
                          {v.vehicle_type} {v.nickname ? `• ${v.nickname}` : ''}
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleStatus(v.id)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors shrink-0 cursor-pointer ${
                          v.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {v.is_active ? '🟢 Active' : '🔴 Paused'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        onClick={() => setSelectedStickerVehicle(v)}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Sticker
                      </button>
                      <button
                        onClick={() => handleCopyAlertLink(v)}
                        className="py-1.5 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold flex items-center gap-1 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Copy QR Alert Link"
                      >
                        {copiedVehicleId === v.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Link</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openSettingsModal(v)}
                        className="py-1.5 px-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Alert Rules"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Alerts Activity Feed */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-3 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-neutral-500 dark:text-neutral-400">
                  Recent Alerts Feed
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('history')}
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                View All History ({alerts.length}) →
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 text-center space-y-0.5">
                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  ✨ No alerts received yet
                </p>
                <p className="text-[11px] text-neutral-400">
                  When someone scans your windshield QR pass, notification details will show here and in Telegram.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {alerts.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">
                        {a.alert_type === 'BLOCKING'
                          ? '🚗'
                          : a.alert_type === 'EMERGENCY'
                          ? '🚨'
                          : a.alert_type === 'LIGHTS_ON'
                          ? '💡'
                          : a.alert_type === 'WINDOW_OPEN'
                          ? '🪟'
                          : a.alert_type === 'TOWING'
                          ? '🚜'
                          : '⚠️'}
                      </span>
                      <div className="truncate">
                        <div className="font-bold text-neutral-900 dark:text-white truncate">
                          {a.alert_type.replace('_', ' ')} • {a.vehicle_number}
                        </div>
                        <span className="text-[10px] text-neutral-400">
                          {new Date(a.created_at).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded shrink-0 ${
                        a.delivery_status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
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
          <div className="bg-rose-50/70 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-200/70 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="font-bold text-rose-900 dark:text-rose-200">
                National Emergency Helplines (India 24x7):
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1 shrink-0 text-[10px]">
              <a
                href="tel:112"
                className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black hover:bg-rose-700"
              >
                112 All-in-One
              </a>
              <a
                href="tel:100"
                className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-800 font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-50"
              >
                100 Police
              </a>
              <a
                href="tel:108"
                className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-800 font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-50"
              >
                108 Ambulance
              </a>
              <a
                href="tel:1033"
                className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-800 font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-50"
              >
                1033 Highway
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: MY VEHICLES & QR STICKERS (MERGED) ── */}
      {activeTab === 'vehicles' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">
                Vehicle Fleet &amp; Smart QR Passes
              </h2>
              <p className="text-xs text-neutral-500">
                Manage vehicle plates, alert preferences, and print Fastag-size windshield stickers
              </p>
            </div>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Vehicle
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <Car className="w-10 h-10 text-neutral-400 mx-auto" />
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                No vehicles registered
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Add your car or motorcycle to generate your free printable Fastag-size windshield QR sticker.
              </p>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 cursor-pointer"
              >
                Register Vehicle Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 sm:p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-3"
                >
                  {/* Card Header: Plate & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      {/* Realistic Indian Number Plate Display */}
                      <div className="inline-flex items-stretch rounded-lg border-2 border-neutral-900 shadow-xs overflow-hidden bg-white text-neutral-950 font-mono">
                        <div className="bg-[#002B7F] text-white px-2 py-1 flex items-center justify-center text-[10px] font-black border-r border-blue-900 select-none">
                          IND
                        </div>
                        <div className="px-3 py-1 flex items-center bg-gradient-to-b from-white to-neutral-100">
                          <span className="text-base font-black tracking-widest uppercase">
                            {v.vehicle_number}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 pt-0.5">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                          {v.vehicle_type}
                        </span>
                        {v.nickname && <span>• "{v.nickname}"</span>}
                        <span>•</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-medium">
                          Fastag Size Pass
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(v.id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors shrink-0 cursor-pointer ${
                        v.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {v.is_active ? '🟢 Alerts Active' : '🔴 Paused'}
                    </button>
                  </div>

                  {/* QR Link & Privacy Settings Strip */}
                  <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl text-xs space-y-2 border border-neutral-200/60 dark:border-neutral-700/60">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <QrCode className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-300 truncate">
                          bharatutility.tech/parksignal/alert/{v.qr_token?.slice(0, 8)}...
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyAlertLink(v)}
                        className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedVehicleId === v.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-200/60 dark:border-neutral-700/40 text-[11px]">
                      <div>
                        <span className="text-neutral-400 block text-[10px] uppercase font-bold">Plate Privacy</span>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">
                          {v.display_plate_publicly ? 'Number Visible' : 'Masked (••••)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px] uppercase font-bold">Voice Notes</span>
                        <span className={`font-bold ${Boolean(v.allow_voice_messages) ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`}>
                          {Boolean(v.allow_voice_messages) ? `Enabled (${v.max_voice_duration_seconds || 60}s)` : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar (Compact) */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <button
                      onClick={() => setSelectedStickerVehicle(v)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print / Download Sticker
                    </button>
                    <button
                      onClick={() => openSettingsModal(v)}
                      className="py-2 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center gap-1 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Customize Alert Rules"
                    >
                      <Sliders className="w-3.5 h-3.5" /> Rules
                    </button>
                    <button
                      onClick={() => handleRegenerateQR(v.id)}
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-cyan-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Regenerate QR Token"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(v.id)}
                      className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: ALERT HISTORY (COMPACT) ── */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-black text-neutral-900 dark:text-white">
              Notification &amp; Alert History
            </h2>
            <p className="text-xs text-neutral-500">
              Log of parking alerts and voice notes dispatched to your Telegram
            </p>
          </div>

          {alerts.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-1.5">
              <BellRing className="w-8 h-8 text-neutral-400 mx-auto" />
              <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                No alerts received yet
              </h3>
              <p className="text-[11px] text-neutral-500">
                When someone scans your vehicle QR sticker, the notification will appear here and in your Telegram app.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-2xs divide-y divide-neutral-100 dark:divide-neutral-800">
              {alerts.map((a) => (
                <div key={a.id} className="p-3 sm:p-3.5 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">
                        {a.vehicle_number}
                      </span>
                      <span className="text-[10px] text-neutral-400">({a.vehicle_type})</span>
                      <span className="px-1.5 py-0.2 rounded bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
                        {a.alert_type === 'VOICE' ? '🎙️ Voice Note' : '📝 Text'}
                      </span>
                    </div>
                    <div className="font-bold text-neutral-800 dark:text-neutral-200">
                      {a.alert_category}
                    </div>
                    {a.custom_message && (
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 italic">
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
                    className={`text-[9px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      a.delivery_status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                    }`}
                  >
                    {a.delivery_status === 'DELIVERED' ? '✓ Delivered' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: ACCOUNT, TELEGRAM BOT & PRIVACY SETTINGS (COMPACT) ── */}
      {activeTab === 'account' && (
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Account, Telegram Bot &amp; Privacy Controls</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Manage your @ParkSignal_bot connection, profile name, password, and privacy settings in one unified screen.
            </p>
          </div>

          {/* 1. Telegram Alert Bot Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-3.5 sm:p-4 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <span>Telegram Alert Bot</span>
                    <span className="text-[11px] font-mono font-semibold text-blue-600">@ParkSignal_bot</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Parking alerts &amp; voice notes arrive privately in your Telegram in under 3 seconds
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  currentUser?.isTelegramLinked
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {currentUser?.isTelegramLinked ? '✓ Connected' : '⚠️ Not Linked'}
              </span>
            </div>

            {currentUser?.isTelegramLinked ? (
              <div className="space-y-2.5">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 space-y-0.5">
                  <div className="font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Real-Time Notifications Active
                  </div>
                  <p className="text-[11px]">
                    Your account is securely bound to @ParkSignal_bot. Whenever someone scans any of your registered vehicle QR stickers, alerts will arrive in your Telegram app instantly.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <button
                    onClick={() => handleConnectTelegram('RECONNECT')}
                    className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Change Telegram Account
                  </button>
                  <button
                    onClick={handleDisconnectTelegram}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Disconnect Telegram
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Click the button below to generate a secure 10-minute linking token. You will be redirected to @ParkSignal_bot in Telegram. Simply tap <strong>START</strong> to bind your account.
                </p>

                <button
                  onClick={() => handleConnectTelegram('CONNECT')}
                  disabled={tgLinkLoading}
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-extrabold text-xs flex items-center gap-1.5 hover:bg-cyan-700 shadow-2xs transition-colors cursor-pointer"
                >
                  {tgLinkLoading ? 'Generating Secure Token...' : 'Connect Telegram with @ParkSignal_bot →'}
                </button>
              </div>
            )}

            {/* Deep link box if generated */}
            {tgDeepLink && (
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/60 rounded-xl border border-cyan-200 dark:border-cyan-800 space-y-2">
                <div className="text-xs font-bold text-cyan-900 dark:text-cyan-200">
                  Step 2: Open Deep Link in Telegram
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={tgDeepLink}
                    className="flex-1 p-2 rounded-lg bg-white dark:bg-neutral-900 border border-cyan-200 text-xs font-mono text-neutral-800 dark:text-neutral-200"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tgDeepLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-cyan-200 text-cyan-600 hover:bg-cyan-50 cursor-pointer"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={tgDeepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-600 text-white font-bold text-xs inline-flex items-center gap-1 hover:bg-cyan-700"
                  >
                    Open @ParkSignal_bot Now <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => {
                      setTgDeepLink(null);
                      loadDashboardData();
                    }}
                    className="text-xs font-bold text-neutral-500 hover:underline cursor-pointer"
                  >
                    I've Tapped Start (Refresh)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Profile Details & Password Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Profile Name & Details */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-3.5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2.5">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Profile Details</span>
              </h3>
              <form onSubmit={handleUpdateName} className="space-y-2">
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-400 cursor-not-allowed"
                  />
                </div>
                <button
                  type="submit"
                  className="py-1.5 px-3 rounded-lg bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-700 transition-colors cursor-pointer"
                >
                  Save Profile Name
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-3.5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2.5">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Change Password</span>
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-2">
                <div>
                  <input
                    type="password"
                    required
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    required
                    placeholder="New Password (Min 8 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    required
                    placeholder="Confirm New Password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="py-1.5 px-3 rounded-lg bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-700 transition-colors cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>

          {/* 3. Active Privacy & Security Protections */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-3.5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Active Privacy &amp; Security Guarantees</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-0.5">
                <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1 text-[11px]">
                  🔒 Zero Phone Number Sharing
                </span>
                <p className="text-neutral-500 text-[10px]">
                  Your mobile number and email are never shown to any QR code scanner or bystander.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-0.5">
                <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1 text-[11px]">
                  ⚡ Anti-Spam Rate Limiting
                </span>
                <p className="text-neutral-500 text-[10px]">
                  Each vehicle QR is rate-limited to 3 notifications per 15 minutes to block prank alerts.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-0.5">
                <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1 text-[11px]">
                  🎙️ Ephemeral Voice Notes
                </span>
                <p className="text-neutral-500 text-[10px]">
                  Bystander voice messages are streamed directly to Telegram and immediately wiped from edge storage.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-0.5">
                <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1 text-[11px]">
                  🔐 Single-Use Cryptographic Tokens
                </span>
                <p className="text-neutral-500 text-[10px]">
                  Account linking tokens expire in 10 minutes. Telegram chat IDs are never exposed in HTML.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Danger Zone (Delete Account) */}
          <div className="bg-rose-50/60 dark:bg-rose-950/20 rounded-xl p-3 border border-rose-200/80 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="space-y-0.5">
              <h3 className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Danger Zone: Permanent Account Deletion
              </h3>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                Permanently delete your account, invalidating all {vehicles.length} vehicle QR stickers.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="py-1.5 px-3 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shrink-0 cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 1: ADD VEHICLE MODAL (COMPACT) ── */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 max-w-sm w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-black text-neutral-900 dark:text-white">
                  Register New Vehicle
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Add vehicle plate to generate unique QR sticker
                </p>
              </div>
              <button
                onClick={() => setShowAddVehicleModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Vehicle Registration Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GJ 06 RA 1111, DL 01 AB 1234"
                  value={newVehicleNumber}
                  onChange={(e) => setNewVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono font-bold tracking-wider outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Vehicle Type
                </label>
                <select
                  value={newVehicleType}
                  onChange={(e) => setNewVehicleType(e.target.value)}
                  className="w-full p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold outline-none"
                >
                  <option value="Car">Car / SUV</option>
                  <option value="Bike">Motorcycle / Bike</option>
                  <option value="Scooter">Scooter / Moped</option>
                  <option value="Other">Commercial / Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Optional Nickname
                </label>
                <input
                  type="text"
                  placeholder="e.g. Office Sedan, Red Activa"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  className="w-full p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="displayPlate"
                  checked={newDisplayPlate}
                  onChange={(e) => setNewDisplayPlate(e.target.checked)}
                  className="rounded border-neutral-300 text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="displayPlate" className="text-[11px] text-neutral-700 dark:text-neutral-300 font-medium cursor-pointer">
                  Display number publicly on scanner page (Uncheck to mask)
                </label>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingVehicle}
                  className="flex-1 py-2 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 shadow-2xs cursor-pointer"
                >
                  {isAddingVehicle ? 'Generating...' : 'Add & Generate QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: VEHICLE ALERT CUSTOMIZATION (COMPACT) ── */}
      {settingsVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 max-w-md w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-black text-neutral-900 dark:text-white">
                  Alert Rules: {settingsVehicle.vehicle_number}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Configure what messages scanners can send without reprinting sticker
                </p>
              </div>
              <button
                onClick={() => setSettingsVehicle(null)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Allowed Alert Categories:
                </span>
                <div className="space-y-1 text-xs">
                  <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                    <span>🚗 Vehicle blocking car/gate</span>
                    <input
                      type="checkbox"
                      checked={Boolean(vehicleSettingsForm.allow_blocking)}
                      onChange={(e) =>
                        setVehicleSettingsForm({ ...vehicleSettingsForm, allow_blocking: e.target.checked })
                      }
                      className="rounded text-cyan-600"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                    <span>🅿️ Please move your vehicle</span>
                    <input
                      type="checkbox"
                      checked={Boolean(vehicleSettingsForm.allow_move_vehicle)}
                      onChange={(e) =>
                        setVehicleSettingsForm({ ...vehicleSettingsForm, allow_move_vehicle: e.target.checked })
                      }
                      className="rounded text-cyan-600"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                    <span>⚠️ Emergency alert</span>
                    <input
                      type="checkbox"
                      checked={Boolean(vehicleSettingsForm.allow_emergency)}
                      onChange={(e) =>
                        setVehicleSettingsForm({ ...vehicleSettingsForm, allow_emergency: e.target.checked })
                      }
                      className="rounded text-cyan-600"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                    <span>👶 Possible child or pet inside</span>
                    <input
                      type="checkbox"
                      checked={Boolean(vehicleSettingsForm.allow_child_person_inside)}
                      onChange={(e) =>
                        setVehicleSettingsForm({ ...vehicleSettingsForm, allow_child_person_inside: e.target.checked })
                      }
                      className="rounded text-cyan-600"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                    <span>💡 Vehicle lights left ON</span>
                    <input
                      type="checkbox"
                      checked={Boolean(vehicleSettingsForm.allow_lights_on)}
                      onChange={(e) =>
                        setVehicleSettingsForm({ ...vehicleSettingsForm, allow_lights_on: e.target.checked })
                      }
                      className="rounded text-cyan-600"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                    <span>🪟 Window or door open</span>
                    <input
                      type="checkbox"
                      checked={Boolean(vehicleSettingsForm.allow_window_door_open)}
                      onChange={(e) =>
                        setVehicleSettingsForm({ ...vehicleSettingsForm, allow_window_door_open: e.target.checked })
                      }
                      className="rounded text-cyan-600"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 cursor-pointer">
                    <span>💥 Possible vehicle damage</span>
                    <input
                      type="checkbox"
                      checked={Boolean(vehicleSettingsForm.allow_damage_alert)}
                      onChange={(e) =>
                        setVehicleSettingsForm({ ...vehicleSettingsForm, allow_damage_alert: e.target.checked })
                      }
                      className="rounded text-cyan-600"
                    />
                  </label>
                </div>
              </div>

              {/* Custom Text Permissions */}
              <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl space-y-2">
                <label className="flex items-center justify-between text-xs font-bold cursor-pointer">
                  <span>Allow Custom Text Notes</span>
                  <input
                    type="checkbox"
                    checked={Boolean(vehicleSettingsForm.allow_custom_text)}
                    onChange={(e) =>
                      setVehicleSettingsForm({ ...vehicleSettingsForm, allow_custom_text: e.target.checked })
                    }
                    className="rounded text-cyan-600"
                  />
                </label>
                {vehicleSettingsForm.allow_custom_text && (
                  <div>
                    <label className="text-[10px] text-neutral-500 block mb-0.5">
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
                      className="w-full accent-cyan-600"
                    />
                  </div>
                )}
              </div>

              {/* Voice Message Permissions */}
              <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl space-y-2">
                <label className="flex items-center justify-between text-xs font-bold cursor-pointer">
                  <span className="flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5 text-cyan-600" /> Allow Voice Messages
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(vehicleSettingsForm.allow_voice_messages)}
                    onChange={(e) =>
                      setVehicleSettingsForm({ ...vehicleSettingsForm, allow_voice_messages: e.target.checked })
                    }
                    className="rounded text-cyan-600"
                  />
                </label>
                {vehicleSettingsForm.allow_voice_messages && (
                  <div>
                    <label className="text-[10px] text-neutral-500 block mb-0.5">
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
                      className="w-full p-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 text-xs"
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
              <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl">
                <label className="flex items-center justify-between text-xs font-bold cursor-pointer">
                  <span>Display Registration Plate Publicly</span>
                  <input
                    type="checkbox"
                    checked={Boolean(vehicleSettingsForm.display_plate_publicly)}
                    onChange={(e) =>
                      setVehicleSettingsForm({ ...vehicleSettingsForm, display_plate_publicly: e.target.checked })
                    }
                    className="rounded text-cyan-600"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSettingsVehicle(null)}
                  className="flex-1 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="flex-1 py-2 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 max-w-sm w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-3 text-center">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-neutral-900 dark:text-white">
              Permanently Delete Account?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              This will remove all {vehicles.length} vehicle stickers and unlink your Telegram. Active QR stickers will stop working immediately.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
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
