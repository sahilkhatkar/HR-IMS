'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import styles from './ItemSearchForm.module.css';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function ItemSearchForm() {
    const { masterData } = useSelector((state) => state.data);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [entryType, setEntryType] = useState('Inward');
    const [quantity, setQuantity] = useState('');
    const [date, setDate] = useState('');
    const [remarks, setRemarks] = useState('');

    const handleSearchChange = (e) => {
        const text = e.target.value;
        setSearchText(text);

        if (!text.trim()) {
            setSearchResults([]);
            return;
        }

        const filtered = masterData
            .filter(item =>
                item.item_code.toLowerCase().includes(text.toLowerCase()) ||
                item.description.toLowerCase().includes(text.toLowerCase())
            )
            .slice(0, 10);

        setSearchResults(filtered);
    };

    const handleItemSelect = (item) => {
        setSelectedItem(item);
        setSearchText(item.item_code);
        setSearchResults([]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedItem) {
            toast.error('Please select a valid item');
            return;
        }

        const payload = {
            item_code: selectedItem.item_code,
            entry_type: entryType,
            quantity,
            date,
            remarks,
        };

        console.log("Inventory Entry:", payload);
        toast.success('Entry submitted! ✅');
    };

    return (
        <motion.div className={styles.wrapper} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={styles.searchSection}>
                <input
                    type="text"
                    placeholder="Search by code or description"
                    value={searchText}
                    onChange={handleSearchChange}
                    className={styles.input}
                />

                <AnimatePresence>
                    {searchResults.length > 0 && (
                        <motion.ul
                            className={styles.searchResults}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {searchResults.map(item => (
                                <motion.li
                                    key={item.item_code}
                                    className={styles.resultItem}
                                    whileHover={{ scale: 1.02, backgroundColor: '#f0f0f0' }}
                                    onClick={() => handleItemSelect(item)}
                                >
                                    <strong>{item.item_code}</strong> – {item.description}
                                </motion.li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>

            {selectedItem && (
                <motion.form
                    className={styles.form}
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className={styles.itemDetails}>
                        <strong>{selectedItem.description}</strong> ({selectedItem.item_code})
                    </div>

                    <div className={styles.formGroup}>
                        {/* <label>Entry Type</label> */}
                        <div className={styles.entryTypeRow}>
                            <span className={styles.entryLabel}>{entryType}</span>
                            <motion.div
                                className={`${styles.smallToggle} ${entryType === 'Inward' ? styles.inward : styles.outward}`}
                                onClick={() =>
                                    setEntryType((prev) => (prev === 'Inward' ? 'Outward' : 'Inward'))
                                }
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.div
                                    className={styles.knob}
                                    layout
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            </motion.div>
                        </div>
                    </div>


                    <div className={styles.formGroup}>
                        <label>Quantity</label>
                        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Remarks</label>
                        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} />
                    </div>

                    <button type="submit" className={styles.submitBtn}>
                        Submit Entry
                    </button>
                </motion.form>
            )}
        </motion.div>
    );
}

