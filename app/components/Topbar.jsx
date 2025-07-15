'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import styles from './Topbar.module.css';

export default function Topbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const user = session?.user;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (status === 'loading') {
    return <div className={styles.header}>Loading...</div>;
  }

  const pageTitle = (() => {
    const parts = pathname.split('/').filter(Boolean);
    // Get the last segment or default to 'home'
    const lastSegment = parts.length > 0 ? parts[parts.length - 1] : 'home';
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  })();


  const displayTitle =
    pageTitle === 'Home'
      ? `Hi, ${user?.name
        ? user.name.split(' ')[0].charAt(0).toUpperCase() +
        user.name.split(' ')[0].slice(1).toLowerCase()
        : 'User'
      }`
      : pageTitle;

  return (
    <motion.header
      className={styles.topbar}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className={styles.left}>{displayTitle}</div>

      <div className={styles.right} ref={menuRef}>
        <motion.img
          src={user?.image || '/avatar.png'}
          alt="avatar"
          className={styles.avatar}
          onClick={() => setMenuOpen((prev) => !prev)}
          whileHover={{ scale: 1.05 }}
        />

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className={styles.dropdown}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className={styles.name}>{user?.name}</p>
              <p className={styles.email}>{user?.email}</p>
              <button
                className={styles.logout}
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
