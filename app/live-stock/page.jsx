'use client';

import { useMemo, useState, useDeferredValue, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import styles from './page.module.css';
import SmallSelect from '../components/SmallSelectNew';
import EditModal from '../components/EditModal';
import InfoModal from '../components/InfoModal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ITEMS_PER_PAGE = 10;

const COLUMNS_DISPLAY = [
  { key: 'description', label: 'Description', width: '36ch', minWidth: '220px' },
  { key: 'plant_name', label: 'Plant', width: '16ch', minWidth: '120px' },
  { key: 'max_level', label: 'Max Level', width: '12ch', align: 'right' },
  { key: 'unplanned_stock_qty', label: 'Unplanned', width: '12ch', align: 'right' },
  { key: 'planned_stock_qty', label: 'Planned', width: '12ch', align: 'right' },
  { key: 'age', label: 'Age (Days)', width: '10ch', align: 'right' },
];

const COLUMNS_FILTERABLE = [
  { key: 'pack_size', label: 'Pack Size' },
  { key: 'pack_type', label: 'Pack Type' },
  { key: 'plant_name', label: 'Plant' },
  { key: 'max_level', label: 'Max Level' },
];

export default function Livestock() {
  const { stockData } = useSelector((s) => s.liveStockData);
  const { masterData } = useSelector((s) => s.masterData);
  const { formResponses } = useSelector((s) => s.formResponses);

  // parse 26-Jun-2025, 2025-06-26, 06/26/2025
  const parseDate = useCallback((raw) => {
    if (!raw) return null;
    const iso = new Date(raw);
    if (!Number.isNaN(iso.getTime())) return iso;
    const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(raw);
    if (m) {
      const [, d, mon, y] = m;
      const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
      const mm = months[mon];
      if (mm !== undefined) return new Date(Number(y), mm, Number(d));
    }
    const n = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
    if (n) {
      const [, mm, dd, yyyy] = n;
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    }
    return null;
  }, []);

  // aggregate
  const aggregatedStock = useMemo(() => {
    if (!Array.isArray(formResponses) || formResponses.length === 0) return [];
    const map = new Map();
    const now = Date.now();

    for (const row of formResponses) {
      const { item_code, stock_qty = 0, form_type, date, plant_name } = row || {};
      if (!item_code) continue;

      const e = map.get(item_code) || {
        item_code, stock_qty: 0, planned_stock_qty: 0, latestDate: null, plant_name: null
      };

      if (form_type === 'Planned') {
        e.planned_stock_qty += Number(stock_qty) || 0;
        e.stock_qty -= Number(stock_qty) || 0;
      } else if (form_type === 'Finished') {
        e.planned_stock_qty -= Number(stock_qty) || 0;
      } else {
        e.stock_qty += Number(stock_qty) || 0;
        const d = parseDate(date);
        if ((Number(stock_qty) || 0) > 0 && d && (!e.latestDate || d > e.latestDate)) {
          e.latestDate = d;
          e.plant_name = plant_name || null;
        }
      }
      map.set(item_code, e);
    }

    const out = [];
    for (const v of map.values()) {
      let age = '';
      if (v.latestDate) {
        const days = Math.floor((now - v.latestDate.getTime()) / 86400000);
        age = String(days < 0 ? 0 : days);
      }
      out.push({
        item_code: v.item_code,
        stock_qty: Number(v.stock_qty) || 0,
        planned_stock_qty: Number(v.planned_stock_qty) || 0,
        plant_name: v.plant_name || '',
        age,
      });
    }
    return out;
  }, [formResponses, parseDate]);

  // merge to master
  const merged = useMemo(() => {
    if (!Array.isArray(masterData) || masterData.length === 0) return [];
    const map = new Map(aggregatedStock.map((x) => [x.item_code, x]));
    return masterData.map((p) => {
      const s = map.get(p.item_code);
      return {
        ...p,
        unplanned_stock_qty: Number(s?.stock_qty ?? 0),
        planned_stock_qty: Number(s?.planned_stock_qty ?? 0),
        age: s?.age ?? '',
        plant_name: s?.plant_name ?? (p.plant_name ?? ''),
      };
    });
  }, [masterData, aggregatedStock]);

  // state
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE);
  const [selectedItem, setSelectedItem] = useState(null);
  const [infoItem, setInfoItem] = useState(null); // keeping if InfoModal still used elsewhere; not rendering button.
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ colorRange: 'all' });

  const deferredSearch = useDeferredValue(searchTerm.trim().toLowerCase());

  const COLOR_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Over 100%', value: 'over_100' },
    { label: '66% - 100%', value: '66_100' },
    { label: '33% - 66%', value: '33_66' },
    { label: 'Below 33%', value: 'below_33' },
  ];

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      const direction = prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc';
      return { key, direction };
    });
  }, []);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const uniqueFor = useCallback((key) => {
    if (key === 'plant_name') {
      const src = Array.isArray(merged) ? merged : [];
      return Array.from(new Set(src.map((x) => x.plant_name).filter(Boolean))).sort();
    }
    const src = Array.isArray(stockData) ? stockData : [];
    return Array.from(new Set(src.map((x) => x?.[key]).filter(Boolean))).sort();
  }, [merged, stockData]);

  // filter
  const filteredData = useMemo(() => {
    if (!Array.isArray(merged)) return [];
    return merged.filter((item) => {
      const q = deferredSearch;
      const searchMatch = q
        ? Object.values(item).some((v) => String(v ?? '').toLowerCase().includes(q))
        : true;

      const columnFiltersMatch = Object.entries(filters).every(([k, v]) => {
        if (k === 'colorRange' || v === 'all' || v === undefined || v === null || v === '') return true;
        return String(item[k] ?? '').trim().toLowerCase() === String(v).trim().toLowerCase();
      });

      const max = Number(item.max_level);
      const unplanned = Number(item.unplanned_stock_qty);
      const pct = max > 0 ? (unplanned / max) * 100 : null;
      const colorMatch = (() => {
        switch (filters.colorRange) {
          case 'over_100': return pct !== null && pct > 100;
          case '66_100': return pct !== null && pct > 66 && pct <= 100;
          case '33_66': return pct !== null && pct > 33 && pct <= 66;
          case 'below_33': return pct !== null && pct <= 33;
          default: return true;
        }
      })();

      return searchMatch && columnFiltersMatch && colorMatch;
    });
  }, [merged, deferredSearch, filters]);

  // sort
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const { key, direction } = sortConfig;
    const dir = direction === 'asc' ? 1 : -1;
    return [...filteredData].sort((a, b) => {
      const av = a?.[key]; const bv = b?.[key];
      const an = Number(av); const bn = Number(bv);
      const bothNum = !Number.isNaN(an) && !Number.isNaN(bn);
      if (bothNum) return dir * (an - bn);
      return dir * String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [filteredData, sortConfig]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(sortedData.length, startIndex + rowsPerPage);
  const currentItems = useMemo(() => sortedData.slice(startIndex, endIndex), [sortedData, startIndex, endIndex]);

  // csv
  const handleExportCSV = useCallback((data) => {
    if (!data?.length) { alert('No data to export.'); return; }
    const keys = Array.from(new Set(data.flatMap(Object.keys))).sort();
    const esc = (v) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [keys.join(','), ...data.map((row) => keys.map((k) => esc(row[k])).join(','))].join('\r\n');
    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `live_stock_${Date.now()}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }, []);

  const getCellStyle = (max, unplanned) => {
    const maxNum = Number(max);
    const unplannedNum = Number(unplanned);
    if (!maxNum) return { backgroundColor: 'var(--lynch_15)', color: 'var(--lynch_75)', fontWeight: 600 };
    const pct = (unplannedNum / maxNum) * 100;
    if (pct > 100) return { backgroundColor: '#f3e5f5', color: '#9c27b0', fontWeight: 700 };
    if (pct > 66) return { backgroundColor: '#e8f5e9', color: '#4caf50', fontWeight: 700 };
    if (pct > 33) return { backgroundColor: '#fff3e0', color: '#ff9800', fontWeight: 700 };
    return { backgroundColor: '#ffebee', color: '#f44336', fontWeight: 700 };
  };

  if (!Array.isArray(stockData)) {
    return <p className={styles.emptyState}>No data found.</p>;
  }

  return (
    <div className={styles.tableContainer}>
      {/* heading with search on the right */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
        className={styles.headerBar}
      >
        <h1 className={styles.tableTitle}>
          Live Stock <span className={styles.liveDot} />
        </h1>

        <div className={styles.headerSearchWrap}>
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchBar}
            value={searchTerm}
            aria-label="Search"
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </motion.div>

      {/* top KPIs (compact) */}
      <div className={styles.kpis}>
        <div className={styles.kpi}><span>Total Items</span><strong>{merged.length}</strong></div>
        <div className={styles.kpi}><span>Visible</span><strong>{filteredData.length}</strong></div>
        <div className={styles.kpi}><span>Total Stock</span><strong>{filteredData.reduce((s, o) => s + (Number(o.unplanned_stock_qty) || 0), 0)}</strong></div>
      </div>

      {/* filters + controls */}
      <div className={styles.filters}>
        {COLUMNS_FILTERABLE.map((col) => {
          const options = uniqueFor(col.key).map((v) => ({ value: v, label: v }));
          const selected =
            filters[col.key] && filters[col.key] !== 'all'
              ? { value: filters[col.key], label: filters[col.key] }
              : { value: 'all', label: 'All' };

          return (
            <div key={col.key} className={styles.columnFilter}>
              <label>{col.label}</label>
              <SmallSelect
                options={[{ value: 'all', label: 'All' }, ...options]}
                value={selected}
                onChange={(opt) => { setFilters((p) => ({ ...p, [col.key]: opt ? opt.value : 'all' })); setCurrentPage(1); }}
                isSearchable={false}
                maxWidth="150px"
              />
            </div>
          );
        })}

        <div className={styles.columnFilter}>
          <label>Stock Level %</label>
          <SmallSelect
            options={[
              { label: 'All', value: 'all' },
              { label: 'Over 100%', value: 'over_100' },
              { label: '66% - 100%', value: '66_100' },
              { label: '33% - 66%', value: '33_66' },
              { label: 'Below 33%', value: 'below_33' },
            ]}
            value={COLOR_FILTERS.find((o) => o.value === filters.colorRange)}
            onChange={(opt) => { setFilters((p) => ({ ...p, colorRange: opt ? opt.value : 'all' })); setCurrentPage(1); }}
            isSearchable={false}
            maxWidth="150px"
          />
        </div>

        <div className={styles.controls}>
          <div className={styles.rowsPerPage}>
            <label>Rows</label>
            <SmallSelect
              options={[10, 20, 30, 50, 100].map((n) => ({ value: n, label: String(n) }))}
              value={{ value: rowsPerPage, label: String(rowsPerPage) }}
              onChange={(opt) => { setRowsPerPage(Number(opt?.value || ITEMS_PER_PAGE)); setCurrentPage(1); }}
              maxWidth="100px"
              isSearchable={false}
            />
          </div>

          <button className={styles.exportBtn} onClick={() => handleExportCSV(filteredData)} aria-label="Export CSV">
            Export CSV
          </button>
        </div>
      </div>

      {/* table */}
      <motion.div
        className={styles.tableWrapper}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
      >
        <table className={styles.animatedTable}>
          <colgroup>
            {/* index column */}
            <col style={{ width: '48px' }} />
            {COLUMNS_DISPLAY.map(col => (
              <col
                key={col.key}
                style={{
                  width: col.width || 'auto',
                  minWidth: col.minWidth,
                  maxWidth: col.maxWidth,
                }}
              />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th style={{ width: 48 }}>#</th>
              {COLUMNS_DISPLAY.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  aria-sort={sortConfig.key === col.key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <span className={styles.thInner}>
                    {col.label} {getSortIcon(col.key)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS_DISPLAY.length + 1} className={styles.emptyCell}>No results found.</td>
              </tr>
            ) : (
              currentItems.map((item, idx) => {
                const colorStyle = getCellStyle(item.max_level, item.unplanned_stock_qty);
                return (
                  <tr
                    key={item.item_code ?? `${startIndex}-${idx}`}
                    className={styles.tableRow}
                    onDoubleClick={() => setInfoItem(item)}
                    tabIndex={0}
                  >
                    <td>{startIndex + idx + 1}</td>

                    {/* Description ONLY (no SKU) */}
                    <td className={styles.wrapCol} style={{ color: colorStyle.color }}>{item.description || '-'}</td>

                    {/* Plant */}
                    <td><span className={styles.badge} style={{ color: colorStyle.color }}>{item.plant_name || '-'}</span></td>

                    {/* Max */}
                    <td><span className={styles.pill} style={colorStyle}>{item.max_level ?? ''}</span></td>

                    {/* Unplanned */}
                    <td><span className={styles.pill} style={colorStyle}>{item.unplanned_stock_qty}</span></td>

                    {/* Planned */}
                    <td><span className={styles.pillOutline} style={{ color: colorStyle.color }}>{item.planned_stock_qty}</span></td>

                    {/* Age */}
                    <td><span className={styles.age} style={{ color: colorStyle.color }}>{item.age !== '' ? item.age : '-'}</span></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </motion.div>

      {/* pagination (outside) */}
      <div className={styles.paginationBar}>
        <div className={styles.pageMeta}>
          Showing <strong>{sortedData.length ? startIndex + 1 : 0}</strong>–<strong>{endIndex}</strong> of <strong>{sortedData.length}</strong>
        </div>
        <div className={styles.pagination}>
          <button
            disabled={page <= 1}
            onClick={() => setCurrentPage(1)}
            className={styles.pageBtn}
            title="First page"
          >
            « First
          </button>
          <button
            disabled={page <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className={styles.pageBtn}
            title="Previous page"
          >
            ‹ Prev
          </button>
          <span className={styles.pageInfo}>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
          <button
            disabled={page >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className={styles.pageBtn}
            title="Next page"
          >
            Next ›
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className={styles.pageBtn}
            title="Last page"
          >
            Last »
          </button>
        </div>
      </div>

      {selectedItem && <EditModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {infoItem && <InfoModal item={infoItem} onClose={() => setInfoItem(null)} />}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
