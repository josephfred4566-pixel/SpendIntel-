import React, { useState, useEffect } from 'react';
import { CompanyType, UserRole, AuthSession } from '../types';
import { authenticateUser, registerAccount } from '../utils/auth';
import { SpendIntelLogo } from './SpendIntelLogo';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Layers, 
  Globe, 
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  X,
  FileText,
  Scale,
  Shield
} from 'lucide-react';

interface AuthViewProps {
  onAuthSuccess: (session: AuthSession, isNewRegistration: boolean) => void;
  onNotify: (message: string) => void;
}

type LegalModalType = 'soc2' | 'privacy' | 'security' | 'terms' | null;

interface LegalModalContent {
  title: string;
  badge: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const LEGAL_DOCUMENTS: Record<Exclude<LegalModalType, null>, LegalModalContent> = {
  soc2: {
    title: 'SOC 2 Compliance Notice',
    badge: 'AICPA Trust Services Criteria',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p>
          SpendIntel maintains compliance with the Service Organization Control 2 (SOC 2) framework developed by the American Institute of Certified Public Accountants (AICPA). Our systems are continuously audited against the five trust service principles: security, privacy, availability, confidentiality, and processing integrity. We hold a SOC 2 Type 2 attestation, demonstrating the operational effectiveness of our security controls over time. All sensitive financial data is encrypted both at rest and during transit.
        </p>
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1.5 text-xs text-emerald-900">
          <div className="font-semibold flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-700" />
            Active Continuous Audit Verification
          </div>
          <p className="text-emerald-800/90 text-[11px]">
            Independent third-party auditor report is renewed on an annual basis with automated daily control evidence gathering.
          </p>
        </div>
      </div>
    ),
  },
  privacy: {
    title: 'Privacy Policy Summary',
    badge: 'GDPR & CCPA Compliant',
    icon: <FileText className="w-5 h-5 text-slate-700" />,
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p>
          SpendIntel is committed to protecting your personal and financial data. We collect technical information such as IP addresses, operating system types, and unique device IDs to facilitate secure access to our web application. We do not process sensitive personal data about racial origin, political opinions, or religious beliefs. You maintain the right to restrict the use of your information, object to processing, or request data portability at any time.
        </p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-700">
          <span className="font-semibold text-slate-900">Data Subject Rights</span>
          <p className="text-[11px] text-slate-500">
            You may request an immediate export or deletion of your organization records by contacting our Data Protection Officer at privacy@spendintel.corp.
          </p>
        </div>
      </div>
    ),
  },
  security: {
    title: 'Security Policy',
    badge: 'Enterprise Defense Architecture',
    icon: <Shield className="w-5 h-5 text-blue-600" />,
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p>
          SpendIntel safeguards critical infrastructure by deploying integrated security measures across all digital environments.
        </p>
        <div className="space-y-3 pt-1">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-semibold text-slate-900 text-xs block mb-0.5">Access Control:</span>
            <p className="text-xs text-slate-600">Authentication requires mandatory Multi-Factor Authentication (MFA) and is governed by strict identity lifecycle management.</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-semibold text-slate-900 text-xs block mb-0.5">Data Protection:</span>
            <p className="text-xs text-slate-600">All confidential data is encrypted at rest and in transit.</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-semibold text-slate-900 text-xs block mb-0.5">Continuous Monitoring:</span>
            <p className="text-xs text-slate-600">Our architecture utilizes continuous evidence mapping and automated anomaly detection to prevent unauthorized access and data breaches.</p>
          </div>
        </div>
      </div>
    ),
  },
  terms: {
    title: 'Terms of Service (ToS) Excerpt',
    badge: 'Master Services Agreement',
    icon: <Scale className="w-5 h-5 text-indigo-600" />,
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p>
          By accessing the SpendIntel web application, you agree to these terms. You must provide accurate billing and entity information to facilitate payment processing. SpendIntel utilizes cookies and tracking technologies to ensure functionality and verify user identity. We reserve the right to aggregate and process de-identified data for analytics and system improvements. Unauthorized attempts to bypass security controls or reverse-engineer the platform will result in immediate account termination.
        </p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
          <span className="font-semibold text-slate-900 block mb-0.5">Acceptable Use & Compliance</span>
          <p className="text-[11px] text-slate-500">
            Users must comply with all applicable financial governance and export regulations when utilizing automated expense parsing and currency conversions.
          </p>
        </div>
      </div>
    ),
  },
};

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess, onNotify }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState<CompanyType>('Enterprise');
  const [userRole, setUserRole] = useState<UserRole>('Financial Controller');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Legal Modal State
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    if (activeModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModal]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    try {
      if (authMode === 'signin') {
        const result = await authenticateUser(email, password, companyType);
        setIsLoading(false);
        if (result.success && result.session) {
          onNotify(`Welcome back, ${result.session.user.name}! Session authenticated.`);
          onAuthSuccess(result.session, false);
        } else {
          setFormError(result.error || 'Invalid credentials. Please verify your email and password.');
        }
      } else {
        const result = await registerAccount(
          fullName,
          email,
          password,
          companyName || `${fullName}'s Organization`,
          companyType,
          userRole
        );
        setIsLoading(false);
        if (result.success && result.session) {
          onNotify(`Account created successfully for ${result.session.user.companyName}!`);
          onAuthSuccess(result.session, true);
        } else {
          setFormError(result.error || 'Registration failed. Please check all required fields.');
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setFormError(err?.message || 'Authentication request failed.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      
      {/* Top Bar Header */}
      <header className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SpendIntelLogo size="sm" showWordmark={true} />
          <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-wider text-slate-500 pl-3 border-l border-slate-200">
            Enterprise Spend Governance Standard
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="font-mono text-[11px]">Secure SSO & 2FA Enabled</span>
        </div>
      </header>

      {/* Main Authentication Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50/40">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Pitch & Features */}
          <div className="lg:col-span-5 space-y-6 text-slate-600 hidden lg:block pr-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                <span>Financial Intelligence Platform</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                Autonomous Corporate Spend & Accounting Governance
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect live corporate card feeds, automate policy audit scans, convert 160+ world currencies, and reconcile directly to QuickBooks, Xero, and Ramp.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-3 pt-1">
              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/80">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900">Instant Policy Auditing</h2>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Real-time GSA meal & hotel per-diem compliance checks and duplicate detection.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/80">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900">Global Sovereign Currencies</h2>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Alphabetical A–Z conversion registry across all department ledgers.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200/80">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900">Zero Data-Loss Guarantee</h2>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Persistent local storage engine ensures your vouchers and audit logs stay safe.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Authentication Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              
              {/* Top Mode Switcher Tabs */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {authMode === 'signin' ? 'Sign In to SpendIntel' : 'Create Organization Account'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {authMode === 'signin'
                      ? 'Access your corporate ledger, audit alerts, and department budgets.'
                      : 'Provision your financial workspace in under 60 seconds.'}
                  </p>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                  <button
                    type="button"
                    id="auth-tab-signin"
                    onClick={() => {
                      setAuthMode('signin');
                      setFormError(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      authMode === 'signin'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    id="auth-tab-register"
                    onClick={() => {
                      setAuthMode('register');
                      setFormError(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      authMode === 'register'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {formError && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Mandatory Company Type Selector Cards */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Select Account Classification <span className="text-slate-900">*</span></span>
                    <span className="text-[10px] text-slate-500 font-normal font-mono">Role-Based Data Schema</span>
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    
                    {/* Small Business */}
                    <button
                      type="button"
                      id="account-type-small-business"
                      onClick={() => setCompanyType('Small Business')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        companyType === 'Small Business'
                          ? 'bg-slate-900/5 border-slate-900 ring-1 ring-slate-900 text-slate-900'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 flex items-center">
                          <Building2 className="w-3.5 h-3.5 mr-1 text-slate-700" />
                          Small Business
                        </span>
                        {companyType === 'Small Business' && (
                          <Check className="w-3.5 h-3.5 text-slate-900" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        1–50 employees. Smart receipt OCR & tax reports.
                      </p>
                    </button>

                    {/* Enterprise */}
                    <button
                      type="button"
                      id="account-type-enterprise"
                      onClick={() => setCompanyType('Enterprise')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        companyType === 'Enterprise'
                          ? 'bg-slate-900/5 border-slate-900 ring-1 ring-slate-900 text-slate-900'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 flex items-center">
                          <Layers className="w-3.5 h-3.5 mr-1 text-slate-700" />
                          Enterprise
                        </span>
                        {companyType === 'Enterprise' && (
                          <Check className="w-3.5 h-3.5 text-slate-900" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        50–1,000 employees. Multi-dept budgets & ERP sync.
                      </p>
                    </button>

                    {/* Corporate */}
                    <button
                      type="button"
                      id="account-type-corporate"
                      onClick={() => setCompanyType('Corporate')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        companyType === 'Corporate'
                          ? 'bg-slate-900/5 border-slate-900 ring-1 ring-slate-900 text-slate-900'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 flex items-center">
                          <Globe className="w-3.5 h-3.5 mr-1 text-slate-700" />
                          Corporate
                        </span>
                        {companyType === 'Corporate' && (
                          <Check className="w-3.5 h-3.5 text-slate-900" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        1,000+ staff. Multi-currency, card webhooks & SOC2.
                      </p>
                    </button>

                  </div>
                </div>

                {/* Additional Register Fields */}
                {authMode === 'register' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-slate-900">*</span>
                      </label>
                      <input
                        id="register-fullname-input"
                        type="text"
                        required
                        placeholder="e.g. Alex Morgan"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Company / Entity Name <span className="text-slate-900">*</span>
                      </label>
                      <input
                        id="register-company-input"
                        type="text"
                        required
                        placeholder="e.g. Morgan Capital Partners"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder-slate-400"
                      />
                    </div>
                  </div>
                )}

                {/* Standard Credential Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Work Email Address <span className="text-slate-900">*</span>
                    </label>
                    <input
                      id="auth-email-input"
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Password <span className="text-slate-900">*</span>
                      </label>
                      {authMode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => onNotify('Password reset instructions sent to your corporate email.')}
                          className="text-[11px] text-slate-600 hover:text-slate-900 underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="auth-password-input"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Role Selector (on register) */}
                {authMode === 'register' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Your Corporate Role
                    </label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="Financial Controller">Financial Controller</option>
                      <option value="VP of Finance">VP of Finance</option>
                      <option value="Senior Auditor">Senior Internal Auditor</option>
                      <option value="Corporate Accountant">Corporate Accountant</option>
                      <option value="Staff Employee">Staff Employee</option>
                    </select>
                  </div>
                )}

                {/* Remember Session & Security Notes */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-[11px]">Remember session on this device</span>
                  </label>

                  <span className="text-[11px] text-slate-500 font-mono flex items-center">
                    <Lock className="w-3 h-3 mr-1 text-slate-500" /> 256-bit TLS
                  </span>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="auth-submit-btn"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating Session...</span>
                      </div>
                    ) : (
                      <>
                        <span>{authMode === 'signin' ? 'Sign In & Launch Dashboard' : 'Complete Setup & Launch Tour'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          </div>

        </div>
      </main>

      {/* Footer Assurances & Compliance Footer */}
      <footer className="px-6 py-5 border-t border-slate-200 bg-white text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl gap-2 text-[11px]">
          <p>© 2026 SpendIntel Global Inc. All rights reserved.</p>
          <div className="flex items-center space-x-3 text-slate-500 font-medium">
            <button
              type="button"
              id="footer-privacy-btn"
              onClick={() => setActiveModal('privacy')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              id="footer-terms-btn"
              onClick={() => setActiveModal('terms')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              type="button"
              id="footer-security-btn"
              onClick={() => setActiveModal('security')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Security
            </button>
            <span>•</span>
            <button
              type="button"
              id="footer-soc2-btn"
              onClick={() => setActiveModal('soc2')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              SOC 2 Compliance
            </button>
          </div>
        </div>

        {/* Distinct SOC 2 Type 2 Certified Badge directly below legal links */}
        <div className="pt-1 flex items-center justify-center">
          <button
            type="button"
            id="footer-soc2-badge-btn"
            onClick={() => setActiveModal('soc2')}
            className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/90 font-mono text-[11px] font-semibold shadow-2xs hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer group"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>SOC 2 Type 2 Certified</span>
            <span className="mx-1.5 text-emerald-300">•</span>
            <span className="text-[10px] text-emerald-600/90 font-sans font-medium">GAAP ASC 606</span>
          </button>
        </div>
      </footer>

      {/* Reusable Legal & Compliance Modal System */}
      {activeModal && LEGAL_DOCUMENTS[activeModal] && (
        <div
          id="legal-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveModal(null);
            }
          }}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 transition-all duration-200 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
        >
          <div
            id="legal-modal-content"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Fixed Header */}
            <div className="px-5 py-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  {LEGAL_DOCUMENTS[activeModal].icon}
                </div>
                <div>
                  <h3 id="legal-modal-title" className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {LEGAL_DOCUMENTS[activeModal].title}
                  </h3>
                  <span className="text-[10px] font-medium font-mono text-slate-500 uppercase tracking-wide">
                    {LEGAL_DOCUMENTS[activeModal].badge}
                  </span>
                </div>
              </div>

              <button
                type="button"
                id="legal-modal-close-icon"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {LEGAL_DOCUMENTS[activeModal].content}
            </div>

            {/* Sticky Footer */}
            <div className="px-5 py-3.5 sm:px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block">
                SpendIntel Legal & Compliance
              </span>
              <div className="flex items-center space-x-2.5 ml-auto">
                <button
                  type="button"
                  id="legal-modal-close-btn"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  id="legal-modal-agree-btn"
                  onClick={() => {
                    onNotify(`Acknowledged ${LEGAL_DOCUMENTS[activeModal].title}.`);
                    setActiveModal(null);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  I Agree
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

