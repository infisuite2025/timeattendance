import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useI18n, SUPPORTED_LANGUAGES, SupportedLanguage } from '../context/I18nContext.tsx';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, isRtl } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition shadow-sm"
        title="Change Language & Direction"
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span>{currentLang.nativeName}</span>
        {currentLang.direction === 'rtl' && (
          <span className="rounded bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2">
            RTL
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className={`absolute mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 ${
          isRtl ? 'left-0' : 'right-0'
        }`}>
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Language / اللغة</p>
          </div>

          <div className="space-y-0.5 mt-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div className="text-left">
                      <div className="leading-tight">{lang.nativeName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{lang.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {lang.direction === 'rtl' && (
                      <span className="rounded bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5">
                        RTL
                      </span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
