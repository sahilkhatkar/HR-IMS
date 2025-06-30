'use client';

import { motion, AnimatePresence } from 'framer-motion';
import styles from './PreviewModal.module.css';

export default function PreviewModal({ rows, fields, fieldKeys, onClose }) {
    const validRows = rows.filter(row => row.description.trim());

    return (
        <AnimatePresence>
            <motion.div
                className={styles.previewOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className={styles.previewBox}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    //   exit={{ y: 50, opacity: 0 }}
                    exit={{
                        y: -30,
                        opacity: 0,
                        transition: {
                            type: 'spring',
                            bounce: 0.6,
                            duration: 1.5,
                        },
                    }}
                    transition={{ duration: 0.4 }}
                >
                    <h3>Preview Orders</h3>
                    {validRows.length === 0 ? (
                        <p>No filled rows to preview.</p>
                    ) : (
                        <ul className={styles.previewList}>
                            {validRows.map((row, idx) => (
                                <li key={idx} className={styles.previewItem}>
                                    <div className={styles.previewItemHeader}><strong>Item {idx + 1}</strong></div>
                                    <div className={styles.previewItemContent}>
                                        {fieldKeys.map((key) =>
                                            row[key] ? (
                                                <div key={key} className={styles.previewField}>
                                                    <strong>{fields[key].label}:</strong> {row[key]}
                                                </div>
                                            ) : null
                                        )}
                                    </div>
                                </li>
                            ))}

                        </ul>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.closePreviewBtn}
                    >Close Preview</button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
