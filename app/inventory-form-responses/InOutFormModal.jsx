'use client';

import { motion, AnimatePresence } from 'framer-motion';
import InventoryForm from '../inventory-entry/page'; // Adjust this path

import styles from './InOutFormModal.module.css'; // Create new styles file

export default function InOutFormModal({ isOpen, onClose }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.backdrop}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className={styles.modal}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className={styles.closeBtn}>✖</button>
                        <InventoryForm />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
