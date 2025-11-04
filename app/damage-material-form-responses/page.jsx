'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './StockTable.module.css';
import { useSelector } from 'react-redux';
import { IoIosSearch } from 'react-icons/io';
import { GrAdd } from 'react-icons/gr';

/* ---------- Utils (JS only) ---------- */
function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime());
}

/** Accepts:
 *  - "dd-mm-yyyy"
 *  - "yyyy-mm-dd"/ISO
 *  - Date
 *  - number (timestamp)
 * Returns Date or null
 */
function parseDateSafe(input) {
  if (!input && input !== 0) return null;

  if (input instanceof Date) return isValidDate(input) ? input : null;

  if (typeof input === 'number' || /^\d+$/.test(String(input))) {
    const d = new Date(Number(input));
    return isValidDate(d) ? d : null;
  }

  if (typeof input === 'string') {
    const s = input.trim();
    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
      const [day, month, year] = s.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return isValidDate(d) ? d : null;
    }
    const d = new Date(s);
    return isValidDate(d) ? d : null;
  }

  return null;
}

function toCsvValue(v) {
  const text = v == null ? '' : String(v);
  return `"${text.replace(/"/g, '""')}"`;
}

function classNames(...arr) {
  return arr.filter(Boolean).join(' ');
}

/* ---------- Component (.jsx) ---------- */
export default function StockEntriesPage() {
  const { masterData = [] } = useSelector((state) => state.masterData);
  const { damageStockResponses = [] } = useSelector((state) => state.damageStock);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, startDate, endDate, pageSize]);

  // item_code -> description map
  const descriptionMap = useMemo(() => {
    const m = new Map();
    for (const item of masterData) {
      if (item?.item_code) m.set(item.item_code, item.description ?? '');
    }
    return m;
  }, [masterData]);

  // dynamic headers with injected "description"
  const allKeys = useMemo(() => {
    const keySet = new Set();
    damageStockResponses.forEach((entry) => Object.keys(entry || {}).forEach((k) => keySet.add(k)));
    const keys = Array.from(keySet);
    const idx = keys.indexOf('item_code');
    if (idx !== -1) keys.splice(idx, 0, 'description');
    else keys.unshift('description');
    return keys;
  }, [damageStockResponses]);

  // filtering
  const filtered = useMemo(() => {
    const from = startDate ? new Date(startDate) : null;
    const to = endDate ? new Date(endDate) : null;
    const reversed = [...damageStockResponses].reverse();

    return reversed.filter((entry) => {
      const entryDate = parseDateSafe(entry?.date);

      if ((from || to) && !isValidDate(entryDate)) return false;

      const matchesDate =
        (!from || (entryDate && entryDate >= from)) &&
        (!to || (entryDate && entryDate <= to));

      if (!matchesDate) return false;

      if (!debouncedSearch) return true;

      const derivedDescription = descriptionMap.get(entry?.item_code) || '';
      const haystack = (Object.values(entry || {}).join(' ') + ' ' + derivedDescription)
        .toLowerCase();

      return haystack.includes(debouncedSearch);
    });
  }, [damageStockResponses, startDate, endDate, debouncedSearch, descriptionMap]);

  // sorting
  const sorted = useMemo(() => {
    if (!sortConfig?.key) return filtered;

    const { key, direction } = sortConfig;
    const dir = direction === 'asc' ? 1 : -1;

    return [...filtered].sort((a, b) => {
      let valA = a?.[key];
      let valB = b?.[key];

      if (key === 'description') {
        valA = descriptionMap.get(a?.item_code) || '';
        valB = descriptionMap.get(b?.item_code) || '';
      } else if (key === 'stock_qty') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      } else if (key === 'date' || key === 'timestamp') {
        valA = parseDateSafe(valA);
        valB = parseDateSafe(valB);
      } else {
        valA = valA == null ? '' : String(valA).toLowerCase();
        valB = valB == null ? '' : String(valB).toLowerCase();
      }

      if (valA instanceof Date && valB instanceof Date) return (valA - valB) * dir;
      if (typeof valA === 'number' && typeof valB === 'number') return (valA - valB) * dir;
      if (typeof valA === 'string' && typeof valB === 'string') return valA.localeCompare(valB) * dir;
      return String(valA).localeCompare(String(valB)) * dir;
    });
  }, [filtered, sortConfig, descriptionMap]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const paginated = sorted.slice(startIdx, startIdx + pageSize);

  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      return { key, direction: 'asc' };
    });
  };

  const handleExport = () => {
    const header = ['S. No.', ...allKeys];
    const rows = filtered.map((row, index) => {
      const values = allKeys.map((key) => {
        if (key === 'description') return toCsvValue(descriptionMap.get(row.item_code) || '');
        return toCsvValue(row?.[key]);
      });
      return [toCsvValue(index + 1), ...values].join(',');
    });

    const csv = [header.map(toCsvValue).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `damage-material-entries-${timestamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>📦 Damage Entries</h1>
        <div className={styles.actionsRight}>
          <button className={styles.newEntry} type="button">
            <GrAdd /> <span>Add new entry</span>
          </button>
          <button className={styles.exportBtn} onClick={handleExport} type="button">⬇ Export CSV</button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.leftControls}>
          <div className={styles.searchWrapper}>
            <IoIosSearch aria-hidden className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search entries…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              aria-label="Search entries"
            />
          </div>

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
            <select
              value={pageSize}
              onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value)); }}
              aria-label="Rows per page"
            >
              {[5, 10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className={styles.tableWrapper} role="region" aria-label="Damage entries table">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>S. No.</th>
              {allKeys.map((key) => (
                <th key={key}>
                  <button
                    type="button"
                    className={styles.sortBtn}
                    onClick={() => requestSort(key)}
                    aria-sort={sortConfig.key === key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                    aria-label={`Sort by ${key}`}
                    title={`Sort by ${key}`}
                  >
                    {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    {sortConfig.key === key && (
                      <span className={styles.sortIndicator}>
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <AnimatePresence>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={allKeys.length + 1}>
                    <div className={styles.emptyState}>
                      <div className={styles.emptyTitle}>No entries found</div>
                      <div className={styles.emptySub}>
                        Try adjusting the date range or search keywords.
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {paginated.map((entry, i) => {
                const rowIdx = (page - 1) * pageSize + i + 1;
                return (
                  <motion.tr
                    key={entry?.id ?? `${rowIdx}-${entry?.item_code ?? 'row'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onDoubleClick={() => setSelectedRow(entry)}
                    className={styles.row}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') setSelectedRow(entry); }}
                  >
                    <td>{rowIdx}</td>
                    {allKeys.map((key) => {
                      let val = entry?.[key];
                      if (key === 'description') val = descriptionMap.get(entry?.item_code) || '—';

                      const isQty = key === 'stock_qty';
                      const isType = key === 'form_type';
                      const isRemarks = key === 'remarks';

                      return (
                        <td
                          key={key}
                          className={classNames(
                            isQty ? (Number(val) < 0 ? styles.negative : styles.positive) : '',
                            isType ? (val === 'Inward' ? styles.inward : styles.outward) : '',
                            isRemarks ? styles.remarksColumn : ''
                          )}
                          title={val ?? '-'}
                        >
                          {val ?? '-'}
                        </td>
                      );
                    })}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className={styles.footerRow}>
        <div className={styles.entriesInfo}>
          Showing {paginated.length} of {filtered.length} entries
        </div>

        <div className={styles.pagination}>
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} type="button">
            ← Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} type="button">
            Next →
          </button>
        </div>
      </div>

      {selectedRow && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedRow(null)}>
          <motion.div
            role="dialog"
            aria-modal="true"
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.modalTitle}>📄 Entry Details</h2>
            <div className={styles.modalContent}>
              {allKeys.map((key) => {
                let value = selectedRow?.[key];
                if (key === 'description') value = descriptionMap.get(selectedRow?.item_code) || '—';
                return (
                  <div className={styles.modalRow} key={key}>
                    <span className={styles.modalKey}>{key.replace(/_/g, ' ')}</span>
                    <span className={styles.modalValue}>{value ?? '-'}</span>
                  </div>
                );
              })}
            </div>
            <button className={styles.closeBtn} onClick={() => setSelectedRow(null)} type="button">
              ✖ Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
