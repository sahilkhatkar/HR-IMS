'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

export default function Header() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const user = session?.user;

  // Close dropdown when clicking outside
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

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        {user ? `Hi, ${user.name?.split(' ')[0] || 'User'}` : 'Welcome'}
      </div>

      <div className={styles.right} ref={menuRef}>
        <motion.img
          src={user?.image || '/avatar.png'}
          alt="avatar"
          className={styles.avatar}
          onClick={() => setMenuOpen(!menuOpen)}
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
              <button className={styles.logout} onClick={() => signOut({ callbackUrl: '/login' })}>
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
