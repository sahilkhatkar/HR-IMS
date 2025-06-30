'use client';
import { motion } from 'framer-motion';
import styles from './InfoModal.module.css';

export default function InfoModal({ item, onClose }) {
  if (!item) return null;

  console.log("items::", item);
  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h2 className={styles.title}>Item Details</h2>

        <div className={styles.details}>
          {Object.entries(item).map(([key, value]) => (
            <div key={key} className={styles.detailRow}>
              <span className={styles.key}>{key.replace('_', ' ')}:</span>
              <span className={styles.value}>{value || '-'}</span>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.closeBtn}>Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
