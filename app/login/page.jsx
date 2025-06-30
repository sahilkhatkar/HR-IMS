'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from './page.module.css';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <div className={styles.background}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to IMS
        </motion.h1>

        <p className={styles.subtitle}>Please log in to continue</p>

        <div className={styles.buttons}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => signIn('google', { callbackUrl })}
          >
            Sign in with Google
          </motion.button>

          <motion.button
            className={styles.admin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              signIn('credentials', {
                username: 'admin',
                password: 'mis@admin',
                callbackUrl,
              })
            }
          >
            Sign in as User
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
