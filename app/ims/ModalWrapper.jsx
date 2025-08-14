'use client';

import styles from './ModalWrapper.module.css';

export default function ModalWrapper({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
