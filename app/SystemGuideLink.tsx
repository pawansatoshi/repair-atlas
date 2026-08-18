'use client';

import { usePathname } from 'next/navigation';

export default function SystemGuideLink() {
  const pathname = usePathname();
  if (pathname === '/architecture') return null;

  return (
    <a
      href="/architecture"
      aria-label="Open RepairAtlas system guide"
      style={{
        position: 'fixed',
        top: 14,
        right: 16,
        zIndex: 900,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '9px 12px',
        borderRadius: 999,
        border: '1px solid rgba(116,215,176,.24)',
        background: 'rgba(10,15,21,.9)',
        color: 'var(--text)',
        textDecoration: 'none',
        fontSize: 12,
        fontWeight: 750,
        boxShadow: '0 8px 28px rgba(0,0,0,.22)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <span aria-hidden="true" style={{ color: 'var(--accent)' }}>↗</span>
      <span>System guide</span>
    </a>
  );
}
