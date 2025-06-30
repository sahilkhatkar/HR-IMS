'use client';

import Link from 'next/link';
import styles from './page.module.css';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className={styles.hero}>
        <h1 className={styles.title}>About Inventory Management System</h1>
        <p className={styles.subtitle}>
          A streamlined solution to track, manage, and optimize your inventory operations from a
          single, intuitive dashboard.
        </p>
      </header>

      <section className={styles.section}>
        <h2>📦 Purpose</h2>
        <p>
          This IMS dashboard is designed to help businesses maintain accurate inventory records,
          reduce stock discrepancies, monitor supply chain metrics, and support real-time decision-making.
        </p>
      </section>

      <section className={styles.section}>
        <h2>🛠️ Features</h2>
        <ul className={styles.techList}>
          <li>Real-time item tracking and stock level updates</li>
          <li>Google Sheets backend integration for quick data control</li>
          <li>Interactive UI with Framer Motion for smooth transitions</li>
          <li>Form-based data editing and item creation</li>
          <li>Notification system using React Toastify</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>💻 Built With</h2>
        <ul className={styles.techList}>
          <li>Next.js + React</li>
          <li>Framer Motion (animations)</li>
          <li>Google Apps Script (for form submissions)</li>
          <li>React Toastify (alert system)</li>
          <li>CSS Modules for scoped styling</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>🙋 Developer</h2>
        <p>
          This IMS platform was designed and built by <strong>Team</strong>, with a focus on
          usability, performance, and flexibility. It aims to serve small and medium-sized teams
          looking for a lean inventory management alternative.
        </p>
      </section>

      <section className={styles.section}>
        <h2>📬 Contact</h2>
        <p>
          For feature requests, bug reports, or integration help, reach out at{' '}
          <Link href="mailto:support@example.com">support@mail.com</Link>.
        </p>
      </section>
    </motion.div>
  );
}
