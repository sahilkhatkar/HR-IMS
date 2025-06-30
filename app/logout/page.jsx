'use client';

import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from './page.module.css';

export default function LogoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = () => {
    setLoggingOut(true);
    signOut({ redirect: false }).then(() => {
      router.replace('/login');
    });
  };

  return (
    <motion.div
      className={styles.fullscreenContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.profileCard}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={user?.image || '/default-avatar.png'}
          alt="Profile"
          className={styles.profileImage}
        />
        <h1 className={styles.title}>Profile</h1>
        <div className={styles.info}>
          <p className={styles.name}>{user?.name || 'No Name'}</p>
          <p className={styles.email}>{user?.email || 'No Email'}</p>
        </div>

        <p className={styles.confirmation}>
          Are you sure you want to log out from the dashboard?
        </p>

        <button
          className={styles.logoutBtn}
          onClick={handleSignOut}
          disabled={loggingOut}
        >
          {loggingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </motion.div>
    </motion.div>
  );
}
