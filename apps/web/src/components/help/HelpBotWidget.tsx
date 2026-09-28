import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useI18n } from '../../context/I18nContext.tsx';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  intent?: string;
  suggestedActions?: Array<{
    label: string;
    path?: string;
    query?: string;
    type: string;
  }>;
  readOnlySourcesUsed?: string[];
  timestamp: string;
}

export const HelpBotWidget: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Hello! 👋 Welcome to **InfiTimePro**. I am **InfiBot**, your personal 24/7 **AI Help Desk Guide**.

I am here to assist you with everything across the platform! Feel free to ask me about:

• 🗓️ **Shifts & Work Schedules**: Swapping shifts with coworkers, viewing rosters & shift timings
• 🌴 **Leaves & Time Off**: Checking your leave balances, holiday rules & encashment options
• ⏰ **Attendance & Overtime**: Resolving missing punches, understanding overtime & check-in rules
• 💼 **Projects & Timesheets**: Logging project hours, tracking billable time & client invoicing
• 💰 **Payroll & Payslips**: Understanding salary calculations, tax deductions & payslips

How can I help you today? Simply type your question below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [suggestions, setSuggestions] = useState<Array<{ label: string; query: string }>>([
    { label: t('help.how_to_swap', 'How to request shift swap?'), query: 'How do I request a shift swap?' },
    { label: t('help.check_leave', 'Check my leave balance'), query: 'What is my leave balance?' },
    { label: t('help.explain_ot', 'Explain overtime calculation'), query: 'How is overtime calculated?' },
    { label: t('help.tm_guide', 'T&M project billing guide'), query: 'How do T&M project timesheets work?' },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      loadSuggestions(location.pathname);
    }
  }, [isOpen, location.pathname, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestions = async (path: string) => {
    try {
      const res = await apiClient.get<any>(`/help-bot/suggestions?path=${encodeURIComponent(path)}`);
      if (res.data?.suggestions && Array.isArray(res.data.suggestions)) {
        setSuggestions(res.data.suggestions);
      }
    } catch {
      // Keep default fallback suggestions
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || query).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setQuery('');
    setLoading(true);

    try {
      const res = await apiClient.post<any>('/help-bot/query', {
        query: text,
        contextPath: location.pathname,
      });
      const payload = res.data;

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: payload?.answer || "I'm sorry, I couldn't process your question right now.",
        intent: payload?.intent,
        suggestedActions: payload?.suggestedActions || [],
        readOnlySourcesUsed: payload?.readOnlySourcesUsed || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'bot',
        text: 'I apologize, but I encountered an error retrieving information. Please try again or check back shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const getPageContextLabel = (path: string) => {
    if (path.startsWith('/shifts')) return 'Shifts & Rostering';
    if (path.startsWith('/attendance')) return 'Attendance & Punches';
    if (path.startsWith('/policies') || path.startsWith('/leaves')) return 'Policies & Leaves';
    if (path.startsWith('/tm')) return 'Time & Materials';
    if (path.startsWith('/payroll') || path.startsWith('/global-payroll')) return 'Payroll & Disbursement';
    if (path.startsWith('/field-force') || path.startsWith('/geofencing')) return 'Field Force & Geofencing';
    if (path.startsWith('/security') || path.startsWith('/devices')) return 'Biometric Security & Devices';
    if (path.startsWith('/admin') || path.startsWith('/billing')) return 'Admin & Settings';
    return 'General Help';
  };

  const renderMarkdownText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\)|`.*?`|\n)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={idx} className="rounded bg-slate-100 px-1 py-0.5 text-[11px] font-mono text-blue-700">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('[') && part.includes('](')) {
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          const [, label, url] = linkMatch;
          return (
            <button
              key={idx}
              onClick={() => {
                setIsOpen(false);
                navigate(url);
              }}
              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2"
            >
              {label} <ArrowRight className="h-3 w-3 inline" />
            </button>
          );
        }
      }
      if (part === '\n') {
        return <br key={idx} />;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-blue-600 px-4 py-3 text-white shadow-xl shadow-blue-500/25 transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 group"
          title={t('help.bot_title', 'InfiBot AI Help Desk')}
        >
          <div className="relative">
            <Bot className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-xs font-bold tracking-wide">{t('help.ai_help', 'AI Help Desk')}</span>
        </button>
      )}

      {/* Slide-Up Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[360px] sm:w-[420px] h-[560px] rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-200 overflow-hidden">
          {/* Drawer Header */}
          <div className="flex flex-col border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 p-4 text-white gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-inner">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold tracking-tight">InfiBot AI Assistant</h3>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                      ONLINE
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-0.5">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    <span>Verified Help Assistant</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Route Context Badge */}
            <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-[10px] text-slate-200 border border-white/10">
              <Compass className="h-3 w-3 text-blue-400 shrink-0" />
              <span>Page Context: <strong>{getPageContextLabel(location.pathname)}</strong></span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 text-xs shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none font-medium'
                      : 'bg-white border border-slate-200/80 text-slate-700 rounded-bl-none leading-relaxed'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{renderMarkdownText(msg.text)}</div>

                  {/* Read-Only Source Badge */}
                  {msg.readOnlySourcesUsed && msg.readOnlySourcesUsed.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span className="truncate">Sources: {msg.readOnlySourcesUsed.join(', ')}</span>
                    </div>
                  )}

                  {/* Suggested Action Nav Buttons */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (action.path) {
                              setIsOpen(false);
                              navigate(action.path);
                            } else if (action.query) {
                              handleSend(action.query);
                            }
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                        >
                          <span>{action.label}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`mt-1 text-[9px] text-right ${
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Human-like Typing Indicator */}
            {loading && (
              <div className="flex gap-2.5 items-center">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <Bot className="h-4 w-4 animate-bounce" />
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 text-xs text-slate-500 shadow-xs flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">{t('help.bot_thinking', 'InfiBot is researching the best answer for you...')}</span>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse delay-150"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse delay-300"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Context-Aware Prompt Suggestion Chips */}
          <div className="border-t border-slate-100 bg-white p-2 flex gap-1.5 overflow-x-auto no-scrollbar">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug.query)}
                className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/80 transition"
              >
                {sug.label}
              </button>
            ))}
          </div>

          {/* Chat Input Field */}
          <div className="border-t border-slate-200 bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('help.input_placeholder', 'Ask InfiBot a question...')}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition"
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
