import React, { useState, useRef } from 'react';
import { 
  X, 
  User, 
  Upload, 
  Camera, 
  Briefcase, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Check, 
  Trash2, 
  Sparkles, 
  Layers, 
  Globe, 
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';
import { AuthUser, CompanyType, Department, UserRole } from '../types';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onSaveProfile: (updatedData: Partial<AuthUser>) => void;
  onNotify?: (message: string) => void;
}

// Curated high quality executive avatar presets
const PRESET_AVATARS = [
  {
    id: 'preset-1',
    label: 'Executive 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-2',
    label: 'Executive 2',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-3',
    label: 'Executive 3',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-4',
    label: 'Executive 4',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-5',
    label: 'Executive 5',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-6',
    label: 'Executive 6',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-7',
    label: 'Executive 7',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-8',
    label: 'Executive 8',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  },
];

const AVAILABLE_ROLES: UserRole[] = [
  'Financial Controller',
  'VP of Finance',
  'Senior Auditor',
  'Corporate Accountant',
  'Staff Employee',
];

const AVAILABLE_DEPARTMENTS: Department[] = [
  'Finance',
  'Executive',
  'Engineering',
  'Sales',
  'Marketing',
  'Operations',
  'Legal & HR',
];

const AVAILABLE_COMPANY_TYPES: CompanyType[] = [
  'Small Business',
  'Enterprise',
  'Corporate',
];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
  onNotify,
}) => {
  const [name, setName] = useState(user.name || '');
  const [title, setTitle] = useState(user.title || (user.role === 'Financial Controller' ? 'Head of Global Financial Operations & Treasury' : user.role));
  const [role, setRole] = useState<UserRole>(user.role || 'Financial Controller');
  const [department, setDepartment] = useState<Department | string>(user.department || 'Finance');
  const [email, setEmail] = useState(user.email || '');
  const [companyName, setCompanyName] = useState(user.companyName || '');
  const [companyType, setCompanyType] = useState<CompanyType>(user.companyType || 'Corporate');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [location, setLocation] = useState(user.location || 'San Francisco, CA (HQ)');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeAvatarTab, setActiveAvatarTab] = useState<'upload' | 'presets' | 'url'>('presets');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local image file upload & base64 conversion
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      if (onNotify) onNotify('Image is too large. Please select a photo under 4MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setAvatarUrl(base64Data);
      setIsUploading(false);
      if (onNotify) onNotify('Profile picture updated successfully!');
    };
    reader.onerror = () => {
      setIsUploading(false);
      if (onNotify) onNotify('Failed to process uploaded image.');
    };
    reader.readAsDataURL(file);
  };

  // Handle Custom URL apply
  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    setAvatarUrl(customUrlInput.trim());
    setCustomUrlInput('');
    setShowUrlInput(false);
    if (onNotify) onNotify('Custom avatar image URL applied.');
  };

  // Handle Save
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      if (onNotify) onNotify('Please enter a valid full name.');
      return;
    }

    onSaveProfile({
      name: name.trim(),
      title: title.trim(),
      role: role,
      department: department,
      email: email.trim(),
      companyName: companyName.trim(),
      companyType: companyType,
      phoneNumber: phoneNumber.trim(),
      location: location.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
    });

    onClose();
  };

  return (
    <div 
      id="profile-edit-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div 
        id="profile-edit-modal-card"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden my-6 transition-colors duration-200 flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Edit User Profile & Executive Identity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize your name, corporate job title, avatar photo, and signature permissions.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-profile-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Live Profile Card Preview Banner */}
          <div className="p-4 rounded-2xl border border-emerald-200/90 dark:border-emerald-800/80 bg-linear-to-r from-emerald-50/70 to-slate-50/70 dark:from-emerald-950/30 dark:to-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              {/* Avatar Preview */}
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name || 'User Avatar'}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/80 shadow-md ring-2 ring-white dark:ring-slate-800 shrink-0"
                    onError={() => setAvatarUrl('')}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-emerald-400/60 shrink-0">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" title="Active Status" />
              </div>

              {/* Dynamic Text Preview */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {name || 'Full Name'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {role}
                  </span>
                </div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-0.5 truncate">
                  {title || 'Job Title / Corporate Designation'}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>{companyName || 'Company'}</span>
                  <span>•</span>
                  <span>{department} Dept</span>
                  <span>•</span>
                  <span>{location || 'HQ'}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs">
                {companyType === 'Corporate' && <Globe className="w-3.5 h-3.5 mr-1.5 text-indigo-600 dark:text-indigo-400" />}
                {companyType === 'Enterprise' && <Layers className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />}
                {companyType === 'Small Business' && <Building2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />}
                {companyType} Edition
              </span>
            </div>
          </div>

          {/* Avatar Customization Sub-section */}
          <div className="p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
                  <Camera className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                  Profile Photo & Avatar Options
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose an executive portrait preset, upload your own photo, or enter an image URL.
                </p>
              </div>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Remove Photo
                </button>
              )}
            </div>

            {/* Avatar Navigation Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <button
                type="button"
                onClick={() => setActiveAvatarTab('presets')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeAvatarTab === 'presets'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                Executive Presets
              </button>
              <button
                type="button"
                onClick={() => setActiveAvatarTab('upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeAvatarTab === 'upload'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                Upload Photo
              </button>
              <button
                type="button"
                onClick={() => setActiveAvatarTab('url')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeAvatarTab === 'url'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                Image URL
              </button>
            </div>

            {/* Tab 1: Presets Gallery */}
            {activeAvatarTab === 'presets' && (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 pt-1">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = avatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAvatarUrl(preset.url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group ${
                        isSelected 
                          ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:scale-102'
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Upload File */}
            {activeAvatarTab === 'upload' && (
              <div className="pt-1">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-900 rounded-2xl p-6 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-200 dark:border-emerald-800">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {isUploading ? 'Processing upload...' : 'Click to browse or drag and drop a headshot'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Supports PNG, JPG, or WEBP (Max 4MB)
                  </p>
                </div>
              </div>
            )}

            {/* Tab 3: Image URL Input */}
            {activeAvatarTab === 'url' && (
              <div className="pt-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://example.com/my-photo.jpg"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ensure the image link is publicly accessible via HTTPS.
                </p>
              </div>
            )}

          </div>

          {/* Profile Core Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  id="profile-fullname-input"
                  placeholder="e.g. Joseph Frederick"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Job Title / Corporate Designation */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Professional Job Title / Designation <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  id="profile-jobtitle-input"
                  placeholder="e.g. Head of Global Treasury & FP&A"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Corporate Role Tier */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Authority Role Tier
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  id="profile-role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {AVAILABLE_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary Department */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Primary Department
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  id="profile-department-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {AVAILABLE_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Business Email */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Business Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  id="profile-email-input"
                  placeholder="e.g. name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Direct Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  id="profile-phone-input"
                  placeholder="e.g. +1 (415) 555-0192"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Organization / Company Entity
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="profile-companyname-input"
                  placeholder="e.g. SpendIntel Global Technologies, Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Company Type Edition */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Company Tier Edition
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  id="profile-companytype-select"
                  value={companyType}
                  onChange={(e) => setCompanyType(e.target.value as CompanyType)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {AVAILABLE_COMPANY_TYPES.map((t) => (
                    <option key={t} value={t}>{t} Edition</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Office Location */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Office Location / Base
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="profile-location-input"
                  placeholder="e.g. San Francisco HQ / London / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Bio / Authority Scope */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Executive Bio & Spending Authority Limit
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {bio.length}/250
                </span>
              </div>
              <textarea
                rows={2}
                id="profile-bio-textarea"
                maxLength={250}
                placeholder="e.g. Authorized spending approver for Engineering & Cloud infra up to $100,000. SOC2 compliant."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="submit"
                id="save-profile-btn"
                className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ring-1 ring-emerald-700/20"
              >
                <Check className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                Save Profile Changes
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
