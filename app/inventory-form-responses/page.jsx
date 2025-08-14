'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { FiMoreVertical, FiDownload, FiRepeat, FiSettings } from 'react-icons/fi';
import InOutFormModal from './InOutFormModal';

import styles from './page.module.css';

// Utility to parse DD-MM-YYYY to Date
const parseDate = (str) => {
    if (!str) return new Date(0);
    const [day, month, year] = str.split('-');
    return new Date(`${month} ${day}, ${year}`);
};

export default function StockEntriesPage() {
    const { masterData = [] } = useSelector((state) => state.masterData);
    const { formResponses = [] } = useSelector((state) => state.formResponses);


    const [showInOutModal, setShowInOutModal] = useState(false);


    const [menuOpen, setMenuOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);

    // Build key list dynamically and include 'description'
    const allKeys = useMemo(() => {
        const keys = new Set();
        formResponses.forEach((entry) => Object.keys(entry).forEach((key) => keys.add(key)));
        const result = Array.from(keys);
        const idx = result.indexOf('item_code');
        if (idx !== -1) result.splice(idx, 0, 'description');
        return result;
    }, [formResponses]);

    // Pre-map masterData for faster lookup
    const itemCodeMap = useMemo(() => {
        const map = {};
        masterData.forEach((item) => {
            map[item.item_code] = item.description || '';
        });
        return map;
    }, [masterData]);

    const filtered = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const from = startDate ? new Date(startDate) : null;
        const to = endDate ? new Date(endDate) : null;

        return [...formResponses].reverse().filter((entry) => {
            const entryDate = parseDate(entry.date);
            const matchesDate = (!from || entryDate >= from) && (!to || entryDate <= to);

            const description = itemCodeMap[entry.item_code] || '';
            const combined = `${Object.values(entry).join(' ')} ${description}`.toLowerCase();
            const matchesSearch = !searchTerm || combined.includes(lowerSearch);

            return matchesDate && matchesSearch;
        });
    }, [formResponses, startDate, endDate, searchTerm, itemCodeMap]);

    const sorted = useMemo(() => {
        if (!sortConfig.key) return filtered;

        return [...filtered].sort((a, b) => {
            const getValue = (entry) => {
                if (sortConfig.key === 'description') return itemCodeMap[entry.item_code]?.toLowerCase() || '';
                if (sortConfig.key === 'stock_qty') return parseFloat(entry.stock_qty) || 0;
                if (sortConfig.key === 'date') return parseDate(entry.date);
                if (sortConfig.key === 'timestamp') return new Date(entry.timestamp);
                return entry[sortConfig.key]?.toString().toLowerCase() || '';
            };

            const valA = getValue(a);
            const valB = getValue(b);

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sortConfig, itemCodeMap]);

    const totalPages = Math.ceil(sorted.length / pageSize);
    const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

    const requestSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleExport = useCallback(() => {
        const csvRows = [
            ['S. No.', ...allKeys],
            ...filtered.map((entry, index) => {
                const row = [index + 1];
                allKeys.forEach((key) => {
                    if (key === 'description') {
                        row.push(`"${itemCodeMap[entry.item_code] || ''}"`);
                    } else {
                        row.push(`"${entry[key] ?? ''}"`);
                    }
                });
                return row.join(',');
            }),
        ];
        const csv = csvRows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-entries-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [filtered, allKeys, itemCodeMap]);

    // Auto-close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(`.${styles.menuWrapper}`)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>📦 Stock Entries</h1>

            <div className={styles.toolbar}>
                <div className={styles.leftControls}>
                    <input
                        type="text"
                        placeholder="Search entries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />

                    <div className={styles.dateRange}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="fromDate">From</label>
                            <input
                                id="fromDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={styles.animatedInput}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="toDate">To</label>
                            <input
                                id="toDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={styles.animatedInput}
                            />
                        </div>
                    </div>
                </div>

                <button
                    className={styles.addBtn}
                    onClick={() => setShowInOutModal(true)}
                >
                    ➕ Add (In-Out)
                </button>

                <div className={styles.rightControls}>
                    <label className={styles.rowsPerPage}>
                        Rows:
                        <select value={pageSize} onChange={(e) => { setPage(1); setPageSize(+e.target.value); }}>
                            {[5, 10, 25, 50, 100].map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </label>

                    <div className={styles.menuWrapper}>
                        <button
                            className={styles.menuTrigger}
                            onClick={() => setMenuOpen((prev) => !prev)}
                            aria-label="More options"
                        >
                            <FiMoreVertical size={20} />
                        </button>

                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div
                                    className={styles.popupMenu}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => { handleExport(); setMenuOpen(false); }}
                                    >
                                        <motion.span
                                            className={styles.menuIcon}
                                            animate={{ rotate: [0, 15, -15, 0] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            style={{ color: '#4CAF50' }}
                                        >
                                            <FiDownload />
                                        </motion.span>
                                        <span className={styles.menuText}>Export CSV</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <motion.span
                                            className={styles.menuIcon}
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            style={{ color: '#2196F3' }}
                                        >
                                            <FiRepeat />
                                        </motion.span>
                                        <span className={styles.menuText}>Transfer Stock</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <motion.span
                                            className={styles.menuIcon}
                                            animate={{ y: [0, -2, 2, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.2 }}
                                            style={{ color: '#FF5722' }}
                                        >
                                            <FiSettings />
                                        </motion.span>
                                        <span className={styles.menuText}>More Options</span>
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>S. No.</th>
                            {allKeys.map((key) => (
                                <th key={key} onClick={() => requestSort(key)}>
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                    {sortConfig.key === key && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {paginated.map((entry, i) => (
                                <motion.tr
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    
                                    onDoubleClick={() => setSelectedRow(entry)}
                                    className={styles.row}
                                >
                                    <td>{(page - 1) * pageSize + i + 1}</td>
                                    {allKeys.map((key) => {
                                        let val = key === 'description'
                                            ? itemCodeMap[entry.item_code] || '—'
                                            : entry[key] ?? '-';

                                        const isQty = key === 'stock_qty';
                                        const isType = key === 'form_type';

                                        return (
                                            <td
                                                key={key}
                                                className={[
                                                    isQty ? (val < 0 ? styles.negative : styles.positive) : '',
                                                    isType ? (val === 'Inward' ? styles.physical : val === 'Outward' ? styles.outward : styles.inward) : '',
                                                    key === 'remarks' ? styles.remarksColumn : ''
                                                ].join(' ').trim()}
                                            >
                                                {key === 'form_type' && entry.remarks === 'Data from Inward'
                                                    ? 'Inward'
                                                    : val === 'Inward'
                                                        ? 'Physical'
                                                        : val === 'Outward'
                                                            ? 'Outward'
                                                            : val}
                                            </td>
                                        );
                                    })}
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            <div className={styles.entriesInfo}>
                Showing {paginated.length} of {filtered.length} entries
            </div>

            <div className={styles.pagination}>
                <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>← Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next →</button>
            </div>


            <InOutFormModal
                isOpen={showInOutModal}
                onClose={() => setShowInOutModal(false)}
            />



            {selectedRow && (
                <div className={styles.modalBackdrop} onClick={() => setSelectedRow(null)}>
                    <motion.div
                        className={styles.modal}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className={styles.modalTitle}>📄 Entry Details</h2>
                        <div className={styles.modalContent}>
                            {allKeys.map((key) => (
                                <div className={styles.modalRow} key={key}>
                                    <span className={styles.modalKey}>{key.replace(/_/g, ' ')}</span>
                                    <span className={styles.modalValue}>
                                        {key === 'description'
                                            ? itemCodeMap[selectedRow.item_code] || '-'
                                            : selectedRow[key] ?? '-'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button className={styles.closeBtn} onClick={() => setSelectedRow(null)}>✖ Close</button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
