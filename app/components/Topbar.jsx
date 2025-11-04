'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiBell, FiChevronDown, FiSun, FiMoon, FiSearch, FiPlus, FiCommand,
} from 'react-icons/fi';
import { AiOutlineAppstoreAdd } from 'react-icons/ai';
import { BiTransferAlt } from 'react-icons/bi';
import { PiWarehouseFill } from 'react-icons/pi';
import styles from './Topbar.module.css';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const MOD_KEYS = navigator?.platform?.toLowerCase().includes('mac') ? '⌘' : 'Ctrl';

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  // UI state
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [theme, setTheme] = useState('light'); // 'light' | 'dark'
  const [search, setSearch] = useState('');

  // refs
  const userBtnRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifBtnRef = useRef(null);
  const notifMenuRef = useRef(null);
  const cmdRef = useRef(null);
  const searchRef = useRef(null);

  // ------------------------
  // Theme toggle (persist)
  // ------------------------
  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_theme') || 'light';
      setTheme(saved);
      document.documentElement.dataset.theme = saved;
    } catch { }
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('app_theme', next); } catch { }
    document.documentElement.dataset.theme = next;
  }, [theme]);

  // ------------------------
  // Title + breadcrumbs
  // ------------------------
  const segments = useMemo(() => (pathname || '/').split('/').filter(Boolean), [pathname]);

  const pageTitle = useMemo(() => {
    const last = segments.at(-1) || 'home';
    const title = last
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    if (title === 'Home') {
      const first = (user?.name || 'User').split(' ')[0];
      return `Hi, ${first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()}`;
    }
    return title;
  }, [segments, user?.name]);

  // Breadcrumb links
  const crumbs = useMemo(() => {
    const out = [];
    let acc = '';
    segments.forEach((seg, i) => {
      acc += `/${seg}`;
      out.push({
        href: acc,
        label: seg
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' '),
        isLast: i === segments.length - 1,
      });
    });
    return out;
  }, [segments]);

  // ------------------------
  // Search
  // ------------------------
  // Cmd/Ctrl + K focuses search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setNotifOpen(false);
        setCmdOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    // Example: route to a search page
    router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  // ------------------------
  // Close menus on route change
  // ------------------------
  useEffect(() => {
    setMenuOpen(false);
    setNotifOpen(false);
    setCmdOpen(false);
  }, [pathname]);

  // ------------------------
  // Click outside to close menus
  // ------------------------
  useEffect(() => {
    const onDocClick = (e) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target) &&
        userBtnRef.current &&
        !userBtnRef.current.contains(e.target)
      ) setMenuOpen(false);

      if (
        notifMenuRef.current &&
        !notifMenuRef.current.contains(e.target) &&
        notifBtnRef.current &&
        !notifBtnRef.current.contains(e.target)
      ) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // ------------------------
  // Sample notifications
  // ------------------------
  const notifications = [
    { id: 1, title: 'Stock threshold', detail: 'Basmati 1121 below 33% at CHETRAM', time: '2m ago', tone: 'warn' },
    { id: 2, title: 'New entry', detail: 'Planned stock updated for SKU BG-09', time: '23m ago', tone: 'info' },
    { id: 3, title: 'Finished goods', detail: 'PK plant closed 12 crates', time: '1h ago', tone: 'success' },
  ];

  // ------------------------
  // Command palette shortcuts
  // ------------------------
  const commands = [
    { label: 'Dashboard', href: '/' },
    { label: 'IMS Master', href: '/ims' },
    { label: 'Live Stock', href: '/live-stock' },
    { label: 'In - Out', href: '/inventory-entry' },
    { label: 'Stock entries', href: '/inventory-form-responses' },
    { label: 'Damage', href: '/damage-material-form' },
    { label: 'Damage Entries', href: '/damage-material-form-responses' },
    { label: 'Stores', href: '/stores' },
    { label: 'Settings', href: '/settings' },
  ];
  const [cmdQuery, setCmdQuery] = useState('');
  const filteredCmd = useMemo(() => {
    const q = cmdQuery.toLowerCase().trim();
    if (!q) return commands;
    return commands.filter(c => c.label.toLowerCase().includes(q));
  }, [cmdQuery]);

  if (status === 'loading') {
    return (
      <header className={styles.topbar} aria-busy="true">
        <div className={styles.left}>
          <span className={styles.skeletonTitle} />
        </div>
        <div className={styles.right}>
          <span className={styles.skeletonAvatar} />
        </div>
      </header>
    );
  }

  const motionOK = !prefersReduced();

  return (
    <>
      <motion.header
        className={styles.topbar}
        initial={motionOK ? { y: -10, opacity: 0 } : false}
        animate={motionOK ? { y: 0, opacity: 1 } : false}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* LEFT: breadcrumb + title */}
        <div className={styles.left}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link className={styles.crumb} href="/">Home</Link>
            {crumbs.map(({ href, label, isLast }) => (
              <span key={href} className={styles.crumbWrap}>
                <span className={styles.sep}>/</span>
                {isLast ? (
                  <span className={`${styles.crumb} ${styles.crumbCurrent}`} aria-current="page">{label}</span>
                ) : (
                  <Link className={styles.crumb} href={href}>{label}</Link>
                )}
              </span>
            ))}
          </nav>
          {/* <div className={styles.title} title={pageTitle}>{pageTitle}</div> */}
        </div>

        {/* RIGHT: search, quick actions, theme, notifications, user */}
        <div className={styles.right}>
          {/* Global search */}
          <form onSubmit={onSearchSubmit} className={styles.searchWrap} role="search">
            <FiSearch className={styles.searchIcon} aria-hidden />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.search}
              placeholder={`Search… (${MOD_KEYS}+K)`}
              aria-label="Search"
            />
          </form>

          {/* Quick actions */}
          <div className={styles.quick}>
            <Link href="/ims" className={styles.quickBtn} title="Add Item">
              <AiOutlineAppstoreAdd /> <span className={styles.quickText}>Add Item</span>
            </Link>
            <Link href="/inventory-entry" className={styles.quickBtn} title="In - Out">
              <BiTransferAlt /> <span className={styles.quickText}>In - Out</span>
            </Link>
            <Link href="/stores" className={styles.quickBtn} title="Stores">
              <PiWarehouseFill /> <span className={styles.quickText}>Stores</span>
            </Link>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            className={styles.iconBtn}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>

          {/* Notifications */}
          <div className={styles.popWrap}>
            <button
              ref={notifBtnRef}
              type="button"
              className={styles.iconBtn}
              aria-haspopup="menu"
              aria-expanded={notifOpen}
              aria-controls="notif-menu"
              onClick={() => setNotifOpen(v => !v)}
              title="Notifications"
            >
              <FiBell />
              {notifications.length > 0 && <span className={styles.badge}>{notifications.length}</span>}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  id="notif-menu"
                  role="menu"
                  ref={notifMenuRef}
                  className={styles.dropdown}
                  initial={motionOK ? { opacity: 0, y: -6 } : false}
                  animate={motionOK ? { opacity: 1, y: 0 } : false}
                  exit={motionOK ? { opacity: 0, y: -6 } : false}
                  transition={{ duration: 0.18 }}
                >
                  <div className={styles.dropHeader}>
                    <span>Notifications</span>
                    <span className={styles.count}>{notifications.length}</span>
                  </div>
                  <ul className={styles.notifList}>
                    {notifications.map(n => (
                      <li key={n.id} className={`${styles.notifItem} ${styles[`tone_${n.tone}`]}`}>
                        <div className={styles.notifTitle}>{n.title}</div>
                        <div className={styles.notifDetail}>{n.detail}</div>
                        <div className={styles.notifMeta}>{n.time}</div>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.dropFooter}>
                    <Link href="/notifications" className={styles.linkBtn}>View all</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Command palette */}
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setCmdOpen(true)}
            title="Command palette"
            aria-label="Open command palette"
          >
            <FiCommand />
          </button>

          {/* User menu */}
          <div className={styles.popWrap}>
            <button
              ref={userBtnRef}
              type="button"
              className={styles.userBtn}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls="user-menu"
              onClick={() => setMenuOpen(v => !v)}
            >
              <img
                src={user?.image || '/avatar.png'}
                alt={user?.name ? `${user.name} avatar` : 'User avatar'}
                className={styles.avatar}
              />
              <span className={styles.userName}>{user?.name || 'User'}</span>
              <FiChevronDown className={styles.chev} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  id="user-menu"
                  role="menu"
                  ref={userMenuRef}
                  className={styles.dropdown}
                  initial={motionOK ? { opacity: 0, y: -6 } : false}
                  animate={motionOK ? { opacity: 1, y: 0 } : false}
                  exit={motionOK ? { opacity: 0, y: -6 } : false}
                  transition={{ duration: 0.18 }}
                >
                  <div className={styles.userBlock}>
                    <p className={styles.name} title={user?.name || ''}>{user?.name || 'User'}</p>
                    <p className={styles.email} title={user?.email || ''}>{user?.email || '—'}</p>
                  </div>
                  <div className={styles.menuDivider} />
                  <Link role="menuitem" className={styles.menuItem} href="/settings">Profile</Link>
                  <Link role="menuitem" className={styles.menuItem} href="/settings">Settings</Link>
                  <div className={styles.menuDivider} />
                  <button
                    role="menuitem"
                    className={styles.logout}
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* Command palette modal */}
      <AnimatePresence>
        {cmdOpen && (
          <motion.div
            className={styles.cmdOverlay}
            initial={motionOK ? { opacity: 0 } : false}
            animate={motionOK ? { opacity: 1 } : false}
            exit={motionOK ? { opacity: 0 } : false}
            onClick={() => setCmdOpen(false)}
          >
            <motion.div
              className={styles.cmd}
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              ref={cmdRef}
              initial={motionOK ? { opacity: 0, y: -10 } : false}
              animate={motionOK ? { opacity: 1, y: 0 } : false}
              exit={motionOK ? { opacity: 0, y: -10 } : false}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.cmdHeader}>
                <FiCommand />
                <input
                  autoFocus
                  className={styles.cmdInput}
                  placeholder="Type a command…"
                  value={cmdQuery}
                  onChange={(e) => setCmdQuery(e.target.value)}
                />
              </div>

              <ul className={styles.cmdList}>
                {filteredCmd.map(c => (
                  <li key={c.href}>
                    <Link
                      className={styles.cmdItem}
                      href={c.href}
                      onClick={() => setCmdOpen(false)}
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
                {filteredCmd.length === 0 && (
                  <li className={styles.cmdEmpty}>No matches</li>
                )}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
