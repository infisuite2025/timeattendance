// =========================================================================
// InfiTimePro - Design Tokens & Theme Specifications
// =========================================================================

export const InfiTimeProTokens = {
  colors: {
    brand: {
      primary: '#2563EB', // TimePro Blue
      primaryHover: '#1D4ED8',
      primaryActive: '#1E40AF',
      primaryLight: '#EFF6FF',
      primaryBorder: '#BFDBFE',
    },
    status: {
      present: {
        bg: '#ECFDF5',
        text: '#047857',
        dot: '#10B981',
        border: '#A7F3D0',
      },
      absent: {
        bg: '#FEF2F2',
        text: '#B91C1C',
        dot: '#EF4444',
        border: '#FECACA',
      },
      late: {
        bg: '#FFFBEB',
        text: '#B45309',
        dot: '#F59E0B',
        border: '#FDE68A',
      },
      onLeave: {
        bg: '#F5F3FF',
        text: '#6D28D9',
        dot: '#8B5CF6',
        border: '#DDD6FE',
      },
      wfh: {
        bg: '#EFF6FF',
        text: '#1D4ED8',
        dot: '#3B82F6',
        border: '#BFDBFE',
      },
      fieldDuty: {
        bg: '#F0FDFA',
        text: '#0F766E',
        dot: '#14B8A6',
        border: '#99F6E4',
      },
      missingPunch: {
        bg: '#FFF1F2',
        text: '#BE123C',
        dot: '#F43F5E',
        border: '#FECDD3',
      },
      holiday: {
        bg: '#F8FAFC',
        text: '#475569',
        dot: '#94A3B8',
        border: '#E2E8F0',
      },
    },
    neutral: {
      canvas: '#F8FAFC',
      surface: '#FFFFFF',
      border: '#E2E8F0',
      borderSubtle: '#F1F5F9',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      textMuted: '#94A3B8',
    },
  },
  borderRadius: {
    card: '0.75rem', // 12px
    button: '0.5rem', // 8px
    pill: '9999px',
    input: '0.5rem',
  },
  shadows: {
    subtle: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
    card: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
    drawer: '-4px 0 24px 0 rgb(0 0 0 / 0.12)',
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    sizes: {
      kpiNumber: '1.75rem', // 28px
      kpiSubtext: '0.75rem', // 12px
      pageTitle: '1.5rem', // 24px
      sectionHeader: '1.125rem', // 18px
      body: '0.875rem', // 14px
      caption: '0.75rem', // 12px
    },
  },
} as const;

export default InfiTimeProTokens;
