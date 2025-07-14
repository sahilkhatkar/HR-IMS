'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './StockTable.module.css';
import { useSelector } from 'react-redux';
import { IoIosSearch } from "react-icons/io";

function parseDate(str) {
    const [day, month, year] = str.split('-');
    return new Date(`${month} ${day}, ${year}`);
}

export default function StockEntriesPage() {
    const { formResponses = [] } = useSelector((state) => state.formResponses);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);

    const allKeys = useMemo(() => {
        const keySet = new Set();
        formResponses.forEach((entry) => Object.keys(entry).forEach((key) => keySet.add(key)));
        return Array.from(keySet);
    }, [formResponses]);

    const filtered = useMemo(() => {
        const reversed = [...formResponses].reverse();
        return reversed.filter((entry) => {
            const d = parseDate(entry.date);
            const from = startDate ? new Date(startDate) : null;
            const to = endDate ? new Date(endDate) : null;

            const matchesDate = (!from || d >= from) && (!to || d <= to);
            const matchesSearch =
                !searchTerm ||
                Object.values(entry)
                    .join(' ')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            return matchesDate && matchesSearch;
        });
    }, [formResponses, startDate, endDate, searchTerm]);

    const sorted = useMemo(() => {
        if (!sortConfig.key) return filtered;

        return [...filtered].sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            if (sortConfig.key === 'stock_qty') {
                valA = parseFloat(valA) || 0;
                valB = parseFloat(valB) || 0;
            } else if (sortConfig.key === 'date') {
                valA = parseDate(valA);
                valB = parseDate(valB);
            } else if (sortConfig.key === 'timestamp') {
                valA = new Date(valA);
                valB = new Date(valB);
            } else {
                valA = valA?.toString().toLowerCase() || '';
                valB = valB?.toString().toLowerCase() || '';
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sortConfig]);

    const totalPages = Math.ceil(sorted.length / pageSize);
    const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

    const requestSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleExport = () => {
        const csv = [
            ['S. No.', ...allKeys], // Include S. No. in CSV
            ...filtered.map((row, index) =>
                [`"${index + 1}"`, ...allKeys.map((key) => `"${row[key] ?? ''}"`)].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stock-entries.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>📦 Stock Entries</h1>

            <div className={styles.toolbar}>
                <div className={styles.leftControls}>
                    <input
                        type="text"
                        // placeholder="🔍 Search entries..."
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

                <div className={styles.rightControls}>
                    <label className={styles.rowsPerPage}>
                        Rows:
                        <select value={pageSize} onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value)); }}>
                            {[5, 10, 25, 50, 100].map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </label>
                    <button className={styles.exportBtn} onClick={handleExport}>⬇ Export CSV</button>
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
                                    onClick={() => setSelectedRow(entry)}
                                    className={styles.row}
                                >
                                    <td>{(page - 1) * pageSize + i + 1}</td>
                                    {allKeys.map((key) => {
                                        const val = entry[key];
                                        const isQty = key === 'stock_qty';
                                        const isType = key === 'form_type';
                                        return (
                                            <td
                                                key={key}
                                                className={
                                                    `${isQty ? (val < 0 ? styles.negative : styles.positive) : ''} 
                ${isType ? (val === 'Inward' ? styles.inward : styles.outward) : ''} 
                ${key === 'remarks' ? styles.remarksColumn : ''}`
                                                }
                                            >
                                                {val ?? '-'}
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
                                    <span className={styles.modalValue}>{selectedRow[key] ?? '-'}</span>
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
