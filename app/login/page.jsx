'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';
import { FaSpinner } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.warning('Please enter both email and password');
      setError('Both fields are required');
      return;
    }

    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      username: email,
      password,
      callbackUrl,
    });

    setLoading(false);

    if (res?.error) {
      toast.error('Invalid username or password');
      setError('Invalid username or password');
    } else if (res?.ok && res?.url) {
      toast.success('Login successful!');
      router.push(res.url);
    } else {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className={styles.background}>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        pauseOnHover
        theme="colored"
      />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.icon}>
          <span>🔐</span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to IMS
        </motion.h2>

        <input
          type="email"
          placeholder="Email"
          className={styles.input}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
        />
        <input
          type="password"
          placeholder="Password"
          className={styles.input}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
        />

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.forgot}>
          <a href="#">Forgot password?</a>
        </div>

        <motion.button
          className={styles.button}
          whileHover={!loading ? { scale: 1.03 } : {}}
          whileTap={!loading ? { scale: 0.97 } : {}}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <span className={styles.spinner}>
              <FaSpinner className={styles.spin} />
              Logging in...
            </span>
          ) : (
            'Get Started'
          )}
        </motion.button>

        <div className={styles.divider}>Or sign in with</div>

        <div className={styles.socials}>
          <motion.button
            className={styles.social}
            whileHover={{ scale: 1.1 }}
            onClick={() => signIn('google', { callbackUrl })}
          >
            <FcGoogle />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
