import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, EyeOff, CheckCircle2, TrendingUp, ShieldCheck, Activity, ArrowRight } from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';

export const LoginPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('naresh@company.com');
  const [password, setPassword] = useState('Admin@123');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const role = login(email, password);
    if (role === 'EMPLOYEE') {
      navigate('/attendance/my');
    } else if (role === 'MANAGER') {
      navigate('/approvals');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-slate-50">
      {/* Left Hero Section */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 p-12 lg:flex">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center">
              <span className="text-xl font-bold tracking-tight text-blue-600">Infi</span>
              <span className="text-xl font-bold tracking-tight text-slate-900">TimePro</span>
            </div>
            <p className="text-xs text-slate-500">People. Time. A Smarter Tomorrow.</p>
          </div>
        </div>

        {/* Hero Copy & Value Props */}
        <div className="my-auto max-w-lg space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold leading-tight text-slate-900">
              A Smarter Way to <br />
              <span className="text-blue-600">Manage Your Workforce</span>
            </h1>
            <p className="text-base text-slate-600">
              Time & Attendance made simple, so your people can do extraordinary things.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 rounded-xl bg-white/80 p-3.5 shadow-sm ring-1 ring-slate-100">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Track Attendance</h4>
                <p className="text-[11px] text-slate-500">Real-time visibility across all locations</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-white/80 p-3.5 shadow-sm ring-1 ring-slate-100">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Improve Productivity</h4>
                <p className="text-[11px] text-slate-500">Empower people and teams to do more</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-white/80 p-3.5 shadow-sm ring-1 ring-slate-100">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Ensure Compliance</h4>
                <p className="text-[11px] text-slate-500">Stay audit-ready with confident records</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-white/80 p-3.5 shadow-sm ring-1 ring-slate-100">
              <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Better Decisions</h4>
                <p className="text-[11px] text-slate-500">Turn data into a stronger tomorrow</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Footer */}
        <div className="border-t border-slate-200/60 pt-4">
          <p className="text-xs font-semibold text-slate-700">Smarter People. Brighter Workplaces.</p>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-24">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md lg:hidden">
              <Clock className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{t('auth.welcome_to_infitimepro', 'Welcome to InfiTimePro')}</h2>
            <p className="text-xs text-slate-500">Sign in to access your Time & Attendance workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">{t('auth.email_or_username', 'Email or Username')}</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.name_company_com_or_username', 'name@company.com or username')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">{t('auth.password', 'Password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.enter_your_password', 'Enter your password')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="font-semibold text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-50 px-2 text-slate-400">OR</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-100/60 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fast Login / Test Personas</p>
              <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">1-Click Demo</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  login('naresh@company.com', 'Admin@123', 'ADMIN');
                  navigate('/dashboard');
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-sm transition text-center group"
              >
                <span className="text-lg">🏢</span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 mt-1">Admin</span>
                <span className="text-[9px] text-slate-400">Full System</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  login('vikram.singh@company.com', 'Manager@123', 'MANAGER');
                  navigate('/approvals');
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-sm transition text-center group"
              >
                <span className="text-lg">👔</span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 mt-1">Manager</span>
                <span className="text-[9px] text-slate-400">Approvals & Team</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  login('sarah.jenkins@company.com', 'Employee@123', 'EMPLOYEE');
                  navigate('/attendance/my');
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-sm transition text-center group"
              >
                <span className="text-lg">👷</span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 mt-1">Employee</span>
                <span className="text-[9px] text-slate-400">Self-Service (ESS)</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            New to InfiTimePro?{' '}
            <a href="#contact" className="font-semibold text-blue-600 hover:underline">
              Contact your administrator.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
