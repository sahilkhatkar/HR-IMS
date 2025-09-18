'use client';

import { motion, AnimatePresence } from 'framer-motion';
import styles from './ModalWrapper.module.css';

export default function ModalWrapper({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // outside click handle
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()} // prevent close on inside click
          >
            <button className={styles.closeBtn} onClick={onClose}>
              ×
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
