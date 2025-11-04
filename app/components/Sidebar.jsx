'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiMenu } from 'react-icons/fi';

import {
  TbLayoutDashboard,
  TbDatabase,
  TbPackages,
  TbArrowsLeftRight,
  TbFileSpreadsheet,
  TbAlertTriangle,
  TbBuildingWarehouse,
  TbSettings,
} from 'react-icons/tb';

import styles from './Sidebar.module.css';

/** Route Configuration + color keys (for gradient badges) */
const sidebarRoutes = [
  { href: '/', label: 'Dashboard', icon: TbLayoutDashboard, color: 'blue' },
  { href: '/ims', label: 'IMS Master', icon: TbDatabase, color: 'purple' },
  { href: '/live-stock', label: 'Live Stock', icon: TbPackages, color: 'teal' },
  { href: '/inventory-entry', label: 'In - Out', icon: TbArrowsLeftRight, color: 'orange' },
  { href: '/inventory-form-responses', label: 'Stock entries', icon: TbFileSpreadsheet, color: 'indigo' },
  { href: '/damage-material-form', label: 'Damage', icon: TbAlertTriangle, color: 'pink' },
  { href: '/damage-material-form-responses', label: 'Damage Entries', icon: TbFileSpreadsheet, color: 'cyan' },
  { href: '/stores', label: 'Stores', icon: TbBuildingWarehouse, color: 'green' },
  { href: '/settings', label: 'Settings', icon: TbSettings, color: 'slate' },
];

const STORAGE_KEY = 'sidebar_collapsed';

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) setCollapsed(saved === '1');
    } catch {}
  }, []);

  const persistCollapsed = useCallback((val) => {
    setCollapsed(val);
    try {
      localStorage.setItem(STORAGE_KEY, val ? '1' : '0');
    } catch {}
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isActive = useCallback((href) => pathname === href, [pathname]);

  return (
    <>
      {/* Hamburger (mobile) */}
      <button
        aria-label="Toggle navigation"
        className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ''}`}
        onClick={() => setOpen(!open)}
      >
        <FiMenu />
      </button>

      {/* Backdrop (mobile) */}
      {open && <div className={styles.backdrop} onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={[
          styles.sidebar,
          open ? styles.show : '',
          collapsed ? styles.collapsed : '',
        ].join(' ')}
        aria-label="Main navigation"
      >
        {/* Brand / Collapse control */}
        <div className={styles.brandRow}>
          <div className={styles.logo} title="H.R. Exports" aria-label="H.R. Exports">
            <span className={styles.logoDot} />
            <span className={styles.logoText}>H.R. Exports</span>
          </div>

          <button
            className={styles.collapseBtn}
            onClick={() => persistCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <span className={styles.collapseGlyph} />
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {sidebarRoutes.map(({ href, label, icon: Icon, color }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={[styles.link, active ? styles.active : ''].join(' ')}
                aria-current={active ? 'page' : undefined}
                title={collapsed ? label : undefined}
                onClick={() => setOpen(false)}
              >
                {/* 🎨 iPhone-style colorful squircle badge */}
                <span
                  className={[
                    styles.iconBadge,
                    styles[`grad_${color}`],
                    active ? styles.iconBadgeActive : '',
                  ].join(' ')}
                  aria-hidden
                >
                  <Icon size={18} />
                </span>

                <span className={styles.linkText}>{label}</span>
                <span className={styles.tooltip}>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.version}>v1.0.0</span>
        </div>
      </aside>
    </>
  );
}
