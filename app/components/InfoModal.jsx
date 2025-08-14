'use client';
import { motion } from 'framer-motion';
import styles from './InfoModal.module.css';
import { useEffect, useRef } from 'react';

export default function InfoModal({ item, onClose }) {
  if (!item) return null;

  const modalRef = useRef();

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);



  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      key="modal-overlay"
    >
      <motion.div
        className={styles.modal}
        ref={modalRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.25 }}
        key="modal-content"
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
