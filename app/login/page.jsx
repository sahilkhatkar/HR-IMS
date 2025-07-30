'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc'; // Google
import { FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa'; // Spinner & Eye
import Image from 'next/image';
import 'react-toastify/dist/ReactToastify.css';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
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
      <ToastContainer position="top-right" autoClose={1800} pauseOnHover theme="colored" />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 35, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo and Brand name */}
        <div className={styles.logo}>
          <span style={{fontSize:'2rem'}}>🔐</span>
          {/* <Image src="/logo.png" alt="IMS Logo" width={48} height={48} priority /> */}
        </div>
        <h2 className={styles.heading}>Welcome to IMS</h2>
        <p className={styles.subtitle}>
          Your Inventory Management System
        </p>
        <form
          className={styles.form}
          onSubmit={e => { e.preventDefault(); handleLogin(); }}
          autoComplete="on"
        >
          {/* <label htmlFor="email" className={styles.label}>
            Username or Email
          </label> */}
          <input
            id="email"
            type="text"
            autoComplete="username"
            value={email}
            className={styles.input}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="Username"
            disabled={loading}
          />

          <div className={styles.passwordGroup}>
            {/* <label htmlFor="password" className={styles.label}>
              Password
            </label> */}
            <input
              id="password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              className={styles.input}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              disabled={loading}
            />
            <button
              tabIndex={-1}
              type="button"
              className={styles.pwdToggle}
              aria-label={showPwd ? "Hide password" : "Show password"}
              onClick={() => setShowPwd(s => !s)}
              disabled={loading}
            >
              {showPwd ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                key={error}
                className={styles.error}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className={styles.forgot}>
            <a tabIndex={loading ? -1 : 0} href="#" aria-disabled={loading}>Forgot password?</a>
          </div>
          <motion.button
            className={styles.button}
            type="submit"
            whileHover={!loading ? { scale: 1.03 } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            disabled={loading || !email || !password}
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
        </form>

        {/* Animated divider */}
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>Or sign in with</span>
          <span className={styles.dividerLine} />
        </div>
        {/* Social login(s) */}
        <div className={styles.socials}>
          <motion.button
            className={styles.social}
            aria-label="Sign in with Google"
            whileHover={{ scale: 1.08 }}
            onClick={() => signIn('google', { callbackUrl })}
            disabled={loading}
          >
            <FcGoogle size={20} />
          </motion.button>
          {/* If more providers: add buttons here */}
        </div>
      </motion.div>
    </div>
  );
}
