'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { motion } from 'framer-motion';
import styles from './page.module.css';

/* ------------------ tiny utils ------------------ */
const toNum = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  const n = Number(String(v).replace(/,/g, '').trim());
  return isNaN(n) ? 0 : n;
};
const safe = (s) => (s ?? '').toString().trim();
const aggregateBy = (rows, key, qtyKey) => {
  const map = new Map();
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const k = safe(r[key]) || 'Unknown';
    const qty = toNum(r[qtyKey]);
    map.set(k, (map.get(k) || 0) + qty);
  }
  return Array.from(map, ([name, value]) => ({ name, value }));
};
const downloadCSV = (rows, filename = 'inventory.csv', cols) => {
  if (!rows?.length) return;
  const keys = cols?.length ? cols.map((c) => c.key) : Object.keys(rows[0]);
  const header = (cols?.length ? cols.map((c) => c.label) : keys).join(',');
  const lines = rows.map((r) =>
    keys.map((k) => {
      const val = r[k] ?? '';
      const s = typeof val === 'number' ? String(val) : String(val).replace(/"/g, '""');
      return /[,"\n]/.test(s) ? `"${s}"` : s;
    }).join(',')
  );
  const csv = [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

/* ------------------ lightweight bars ------------------ */
const MiniBar = React.memo(function MiniBar({ value = 0, max = 1 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={styles.miniBarWrap}>
      <div className={styles.miniBarTrack}>
        <div className={styles.miniBarFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.miniBarValue}>{value.toLocaleString()}</span>
    </div>
  );
});

const SparkBar = React.memo(function SparkBar({ value = 0, max = 1 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={styles.sparkWrap}>
      <div className={styles.sparkTrack}>
        <div className={styles.sparkFill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
});

const InlineProgress = React.memo(function InlineProgress({ value = 0, denom = 0, showValue = true }) {
  const pct = denom > 0 ? Math.max(0, Math.min(100, Math.round((value / denom) * 100))) : 0;
  return (
    <div className={styles.inlineProgWrap}>
      <div className={styles.inlineProgTrack}><div className={styles.inlineProgFill} style={{ width: `${pct}%` }} /></div>
      {showValue && <span className={styles.inlineProgValue}>{value.toLocaleString()}</span>}
    </div>
  );
});

/* ------------------ main page ------------------ */
export default function OverviewPage() {
  // prevent re-renders if object identity changes but values same
  const { stockData = [], loading, error } = useSelector(
    (s) => s.liveStockData || {},
    shallowEqual
  );

  /* ---------- UI state ---------- */
  const [q, setQ] = useState('');
  const [packFilter, setPackFilter] = useState('All');
  const [plantFilter, setPlantFilter] = useState('All Plants');
  const [sortKey, setSortKey] = useState('pending_purchase_qty');
  const [sortDir, setSortDir] = useState('desc');
  const [warnPct, setWarnPct] = useState(20);
  const [dangerPct, setDangerPct] = useState(40);

  // attention list pagination
  const [lowPage, setLowPage] = useState(1);
  const [lowPageSize, setLowPageSize] = useState(10);

  // columns (visibility)
  const defaultColumns = useMemo(() => ([
    { key: 'item_code', label: 'Item Code', type: 'text', visible: true, className: 'tdCode' },
    { key: 'description', label: 'Description', type: 'text', visible: true, className: 'tdDesc' },
    { key: 'pack_size', label: 'Pack', type: 'text', visible: true, className: 'tdSm' },
    { key: 'pack_type', label: 'Type', type: 'text', visible: true, className: 'tdSm' },
    { key: 'planned_stock_qty', label: 'Planned', type: 'num', visible: true, className: 'tdNum' },
    { key: 'unplanned_stock_qty', label: 'Unplanned', type: 'num', visible: true, className: 'tdNum' },
    { key: 'pending_purchase_qty', label: 'Pending', type: 'num', visible: true, className: 'tdNum' },
    { key: 'plant_name', label: 'Plant', type: 'text', visible: true, className: 'tdSm' },
    { key: 'max_level', label: 'Max', type: 'num', visible: true, className: 'tdNum' },
    { key: 'gap', label: 'Gap', type: 'num', visible: true, className: 'tdNum' },
    { key: 'status', label: 'Status', type: 'status', visible: true, className: 'tdSm' },
  ]), []);
  const [columns, setColumns] = useState(defaultColumns);

  /* ---------- debounced search (cheap) ---------- */
  const [debouncedQ, setDebouncedQ] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), q.length > 2 ? 120 : 50);
    return () => clearTimeout(t);
  }, [q]);

  /* ---------- normalize rows once ---------- */
  const rows = useMemo(() => {
    const src = stockData || [];
    const out = new Array(src.length);
    for (let i = 0; i < src.length; i++) {
      const r = src[i];
      out[i] = {
        id: i,
        item_code: safe(r.item_code),
        description: safe(r.description),
        pack_size: safe(r.pack_size),
        pack_type: safe(r.pack_type),
        unit: safe(r.unit),
        plant_name: safe(r.plant_name),
        max_level: toNum(r.max_level),
        unplanned_stock_qty: toNum(r.unplanned_stock_qty),
        planned_stock_qty: toNum(r.planned_stock_qty),
        pending_purchase_qty: toNum(r.pending_purchase_qty),
      };
    }
    return out;
  }, [stockData]);

  /* ---------- plant tabs ---------- */
  const plantTabs = useMemo(() => {
    const counts = new Map();
    for (let i = 0; i < rows.length; i++) {
      const k = rows[i].plant_name || 'Unknown';
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    const arr = Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
    return [{ name: 'All Plants', count: rows.length }, ...arr];
  }, [rows]);

  /* ---------- annotate fast path ---------- */
  const annotate = useCallback((r) => {
    const total = r.planned_stock_qty + r.unplanned_stock_qty;
    const gap = r.max_level > 0 ? (r.max_level - total > 0 ? r.max_level - total : 0) : 0;
    let status = 'ok', gapPct = 0;
    if (r.max_level > 0) {
      gapPct = r.max_level ? Math.round((gap / r.max_level) * 100) : 0;
      if (gapPct >= dangerPct) status = 'danger';
      else if (gapPct >= warnPct) status = 'warn';
    } else if (r.pending_purchase_qty > 0) {
      status = 'pending';
    }
    return { ...r, total, gap, gapPct, status };
  }, [warnPct, dangerPct]);

  const baseByPlant = useMemo(() => {
    const base = plantFilter === 'All Plants'
      ? rows
      : rows.filter((r) => (r.plant_name || 'Unknown') === plantFilter);
    // annotate in one pass
    return base.map(annotate);
  }, [rows, plantFilter, annotate]);

  /* ---------- KPIs / breakdowns (memo) ---------- */
  const kpis = useMemo(() => {
    const base = baseByPlant;
    let totalPlanned = 0, totalUnplanned = 0, totalPending = 0, filled = 0;
    const packTypesSet = new Set();
    for (let i = 0; i < base.length; i++) {
      const r = base[i];
      totalPlanned += r.planned_stock_qty;
      totalUnplanned += r.unplanned_stock_qty;
      totalPending += r.pending_purchase_qty;
      if (r.planned_stock_qty || r.unplanned_stock_qty || r.pending_purchase_qty) filled++;
      packTypesSet.add(r.pack_type || 'Unknown');
    }
    const totalSKUs = base.length;
    const dataCompleteness = totalSKUs ? Math.round((filled / totalSKUs) * 100) : 0;
    return {
      totalSKUs,
      totalPlanned,
      totalUnplanned,
      totalPending,
      dataCompleteness,
      distinctPackTypes: packTypesSet.size,
    };
  }, [baseByPlant]);

  const packTypeAgg = useMemo(() => {
    const agg = aggregateBy(baseByPlant, 'pack_type', 'unplanned_stock_qty');
    let mx = 0;
    for (let i = 0; i < agg.length; i++) if (agg[i].value > mx) mx = agg[i].value;
    return { agg, max: mx };
  }, [baseByPlant]);

  const sizeAgg = useMemo(() => {
    const agg = aggregateBy(baseByPlant, 'pack_size', 'planned_stock_qty').sort((a, b) => b.value - a.value);
    let mx = 0;
    for (let i = 0; i < agg.length; i++) if (agg[i].value > mx) mx = agg[i].value;
    return { agg, max: mx };
  }, [baseByPlant]);

  /* ---------- attention list + pagination ---------- */
  const lowAll = useMemo(() => {
    const res = [];
    for (let i = 0; i < baseByPlant.length; i++) {
      const r = baseByPlant[i];
      if ((r.max_level > 0 && r.total < r.max_level) || r.pending_purchase_qty > 0) res.push(r);
    }
    return res;
  }, [baseByPlant]);
  const lowTotalPages = Math.max(1, Math.ceil(lowAll.length / lowPageSize));
  const lowPageSafe = Math.min(Math.max(1, lowPage), lowTotalPages);
  const lowSlice = useMemo(() => {
    const start = (lowPageSafe - 1) * lowPageSize;
    return lowAll.slice(start, start + lowPageSize);
  }, [lowAll, lowPageSafe, lowPageSize]);

  useEffect(() => { setLowPage(1); }, [plantFilter, packFilter, debouncedQ, lowPageSize]);

  /* ---------- search + sort for full table (deferred) ---------- */
  const packTypes = useMemo(() => {
    const set = new Set();
    for (let i = 0; i < rows.length; i++) set.add(rows[i].pack_type || 'Unknown');
    return ['All', ...Array.from(set)];
  }, [rows]);

  const filtered = useMemo(() => {
    const qLower = debouncedQ.toLowerCase();
    const list = [];
    for (let i = 0; i < baseByPlant.length; i++) {
      const r = baseByPlant[i];
      if (
        (packFilter === 'All' || r.pack_type === packFilter) &&
        (r.item_code.toLowerCase().includes(qLower) ||
         r.description.toLowerCase().includes(qLower) ||
         r.pack_size.toLowerCase().includes(qLower) ||
         (r.plant_name || 'Unknown').toLowerCase().includes(qLower))
      ) list.push(r);
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const av = a[sortKey] ?? 0, bv = b[sortKey] ?? 0;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return list;
  }, [baseByPlant, debouncedQ, packFilter, sortKey, sortDir]);

  /* ---------- per-plant compare (spark) ---------- */
  const plantCompare = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i], k = r.plant_name || 'Unknown';
      const o = map.get(k) || { planned: 0, unplanned: 0, max: 0, pending: 0, skus: 0 };
      o.planned += r.planned_stock_qty; o.unplanned += r.unplanned_stock_qty;
      o.max += r.max_level; o.pending += r.pending_purchase_qty; o.skus += 1;
      map.set(k, o);
    }
    const arr = Array.from(map, ([plant, v]) => {
      const total = v.planned + v.unplanned;
      const gap = v.max > 0 ? Math.max(0, v.max - total) : 0;
      const gapPct = v.max ? Math.round((gap / v.max) * 100) : 0;
      return { plant, ...v, total, gap, gapPct };
    }).sort((a, b) => a.plant.localeCompare(b.plant));
    let maxTotal = 1, maxPending = 1;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].total > maxTotal) maxTotal = arr[i].total;
      if (arr[i].pending > maxPending) maxPending = arr[i].pending;
    }
    return { arr, maxTotal, maxPending };
  }, [rows]);

  /* ---------- columns visible ---------- */
  const visibleCols = useMemo(() => columns.filter((c) => c.visible), [columns]);

  /* ---------- UI states ---------- */
  if (error) {
    return (
      <div className={styles.stateWrap}>
        <div className={styles.error}>Failed to load live stock data.</div>
        <div className={styles.muted}>{String(error)}</div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className={styles.stateWrap}>
        <div className={styles.skeleton} /><div className={styles.skeleton} /><div className={styles.skeleton} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.left}>
          Inventory Overview <span className={styles.subtleTag}>Live</span>
        </div>
        <div className={styles.filters}>
          <input className={styles.search} placeholder="Search item code, name, size, plant…"
            value={q} onChange={(e) => setQ(e.target.value)} />
          <select className={styles.select} value={packFilter} onChange={(e) => setPackFilter(e.target.value)}>
            {packTypes.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className={styles.btn}
            onClick={() => downloadCSV(filtered, 'inventory_filtered.csv', visibleCols)}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs + thresholds */}
      <div className={styles.toolsRow}>
        <div className={styles.tabsScroll}>
          {plantTabs.map((t) => {
            const active = plantFilter === t.name;
            return (
              <button key={t.name}
                className={`${styles.tabBtn} ${active ? styles.tabBtnActive : ''}`}
                onClick={() => setPlantFilter(t.name)}>
                <span className={styles.tabLabel}>{t.name}</span>
                <span className={styles.tabCount}>{t.count}</span>
              </button>
            );
          })}
        </div>
        <div className={styles.thresholds}>
          <span className={styles.legendDot + ' ' + styles.legendOk} /> OK
          <span className={styles.legendDot + ' ' + styles.legendWarn} /> Warn
          <span className={styles.legendDot + ' ' + styles.legendDanger} /> Danger
          <span className={styles.legendDot + ' ' + styles.legendPending} /> Pending
          <div className={styles.sliders}>
            <label className={styles.sliderItem}>
              Warn ≥ <input type="number" min={0} max={100} value={warnPct}
                onChange={(e) => setWarnPct(Number(e.target.value) || 0)} />%
            </label>
            <label className={styles.sliderItem}>
              Danger ≥ <input type="number" min={0} max={100} value={dangerPct}
                onChange={(e) => setDangerPct(Number(e.target.value) || 0)} />%
            </label>
          </div>
        </div>
      </div>

      {/* Per-plant compare */}
      <div className={styles.compareStrip}>
        {plantCompare.arr.map((p) => (
          <div key={p.plant} className={styles.compareCard}>
            <div className={styles.compareHead}>
              <div className={styles.comparePlant}>{p.plant}</div>
              <div className={styles.compareSkus}>{p.skus} SKUs</div>
            </div>
            <div className={styles.compareRow}><span>Total</span><SparkBar value={p.total} max={plantCompare.maxTotal} /><strong>{p.total.toLocaleString()}</strong></div>
            <div className={styles.compareRow}><span>Pending</span><SparkBar value={p.pending} max={plantCompare.maxPending} /><strong>{p.pending.toLocaleString()}</strong></div>
            <div className={styles.compareRow}><span>Gap%</span><div className={styles.gapPctBadge}>{p.gapPct}%</div></div>
          </div>
        ))}
      </div>

      {/* KPIs */}
      <div className={styles.kpiRow}>
        <KPI title="Total SKUs" value={kpis.totalSKUs} />
        <KPI title="Planned Qty" value={kpis.totalPlanned} format="number" />
        <KPI title="Unplanned Qty" value={kpis.totalUnplanned} format="number" />
        <KPI title="Pending Purchase" value={kpis.totalPending} format="number" />
        <KPI title="Data Completeness" value={kpis.dataCompleteness} suffix="%" />
        <KPI title="Pack Types" value={kpis.distinctPackTypes} />
      </div>

      {/* Breakdown */}
      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.cardHead}><h3>Pack Type — Unplanned Stock</h3></div>
          <ul className={styles.barList}>
            {packTypeAgg.agg.map((row) => (
              <li key={row.name} className={styles.barItem}>
                <span className={styles.barLabel}>{row.name}</span>
                <MiniBar value={row.value} max={packTypeAgg.max} />
              </li>
            ))}
            {packTypeAgg.agg.length === 0 && <div className={styles.emptyLine}>No data</div>}
          </ul>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHead}><h3>Pack Size — Planned Stock</h3></div>
          <ul className={styles.barList}>
            {sizeAgg.agg.slice(0, 8).map((row) => (
              <li key={row.name} className={styles.barItem}>
                <span className={styles.barLabel}>{row.name}</span>
                <MiniBar value={row.value} max={sizeAgg.max} />
              </li>
            ))}
            {sizeAgg.agg.length === 0 && <div className={styles.emptyLine}>No data</div>}
          </ul>
        </div>
      </div>

      {/* Attention Needed (paginated) */}
      {/* <div className={styles.card}>
        <div className={styles.cardHead}>
          <h3>Attention Needed (Low vs. Max / Pending)</h3>
          <span className={styles.cardHint}>Paginated list • threshold coloring applied</span>
        </div>
        <div className={styles.tableControlsRow}>
          <div className={styles.pagination}>
            <button className={styles.btnLight} onClick={() => setLowPage((p) => Math.max(1, p - 1))} disabled={lowPageSafe <= 1}>Prev</button>
            <span className={styles.pageInfo}>Page {lowPageSafe} / {lowTotalPages}</span>
            <button className={styles.btnLight} onClick={() => setLowPage((p) => Math.min(lowTotalPages, p + 1))} disabled={lowPageSafe >= lowTotalPages}>Next</button>
            <select className={styles.select} value={lowPageSize} onChange={(e) => setLowPageSize(Number(e.target.value))}>
              {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>
          <button className={styles.btn} onClick={() => downloadCSV(lowAll, 'attention_needed_full.csv', visibleCols)}>Export CSV (All)</button>
          <button className={styles.btnLight} onClick={() => downloadCSV(lowSlice, `attention_needed_p${lowPageSafe}.csv`, visibleCols)}>Export CSV (This page)</button>
        </div>
        <div className={styles.tableWrap}>
          <VirtualTable rows={lowSlice} columns={visibleCols} />
        </div>
      </div> */}

      {/* Full table (VIRTUALIZED) */}
      {/* <div className={styles.card}>
        <div className={styles.cardHead}>
          <h3>All Live Stock</h3>
          <div className={styles.tableControls}>
            <SortSelect sortKey={sortKey} sortDir={sortDir} setSortKey={setSortKey} setSortDir={setSortDir} />
          </div>
        </div>
        <div className={styles.tableWrap}>
          <VirtualTable rows={filtered} columns={visibleCols} />
        </div>
      </div> */}
    </div>
  );
}

/* ------------------ small components ------------------ */
function KPI({ title, value, suffix, format }) {
  const display = format === 'number' && typeof value === 'number' ? value.toLocaleString() : value;
  return (
    <motion.div className={styles.kpi} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <div className={styles.kpiTitle}>{title}</div>
      <div className={styles.kpiValue}>{display}{suffix ? <span className={styles.kpiSuffix}>{suffix}</span> : null}</div>
    </motion.div>
  );
}
function SortSelect({ sortKey, sortDir, setSortKey, setSortDir }) {
  return (
    <div className={styles.sortWrap}>
      <select className={styles.select} value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
        <option value="pending_purchase_qty">Pending Purchase</option>
        <option value="planned_stock_qty">Planned Qty</option>
        <option value="unplanned_stock_qty">Unplanned Qty</option>
        <option value="item_code">Item Code</option>
        <option value="pack_type">Pack Type</option>
        <option value="pack_size">Pack Size</option>
        <option value="plant_name">Plant</option>
        <option value="gapPct">Gap %</option>
      </select>
      <button className={styles.sortBtn} onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}>
        {sortDir === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  );
}

/* ------------------ Status + Row ------------------ */
function StatusBadge({ status, gapPct }) {
  if (status === 'danger') return <span className={`${styles.badge} ${styles.badgeDanger}`}>Danger {gapPct}%</span>;
  if (status === 'warn') return <span className={`${styles.badge} ${styles.badgeWarn}`}>Warn {gapPct}%</span>;
  if (status === 'pending') return <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>;
  return <span className={`${styles.badge} ${styles.badgeOk}`}>OK</span>;
}

const TableRow = React.memo(function TableRow({ r, columns }) {
  const total = r.total ?? (r.planned_stock_qty + r.unplanned_stock_qty);
  const gap = r.gap ?? (r.max_level > 0 ? Math.max(0, r.max_level - total) : 0);
  const status = r.status || 'ok';
  const rowClass =
    status === 'danger' ? styles.rowDanger :
    status === 'warn' ? styles.rowWarn :
    status === 'pending' ? styles.rowPending : '';

  return (
    <div className={`${styles.tr} ${rowClass}`} role="row">
      {columns.map((c) => {
        const key = c.key;
        const cls = styles[c.className];
        if (c.type === 'status') return <div key={key} className={cls}><StatusBadge status={status} gapPct={r.gapPct} /></div>;
        if (c.type === 'num') {
          const denom = key === 'pending_purchase_qty' ? Math.max(1, r.max_level || 0, r.pending_purchase_qty || 0) : (r.max_level || (total > 0 ? total : 1));
          const val = r[key] ?? 0;
          return <div key={key} className={cls}><InlineProgress value={val} denom={denom} /></div>;
        }
        return <div key={key} className={cls}>{r[key] || '—'}</div>;
      })}
    </div>
  );
});

/* ------------------ Virtualized Table ------------------ */
function VirtualTable({ rows, columns, rowHeight = 44, overscan = 8 }) {
  const containerRef = useRef(null);
  const [height, setHeight] = useState(400); // default viewport
  const [scrollTop, setScrollTop] = useState(0);

  // measure container height once and on resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onResize = () => setHeight(el.clientHeight);
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const total = rows.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(total - 1, Math.floor((scrollTop + height) / rowHeight) + overscan);
  const visible = rows.slice(startIndex, endIndex + 1);
  const topPad = startIndex * rowHeight;
  const bottomPad = Math.max(0, (total - endIndex - 1) * rowHeight);

  // header (sticky) outside the scrollable body for perf
  return (
    <div className={styles.virtualTable}>
      <div className={`${styles.tr} ${styles.th}`} style={{ gridTemplateColumns: columns.map(() => 'minmax(80px,auto)').join(' ') }}>
        {columns.map((c) => <div key={c.key} className={styles[c.className]}>{c.label}</div>)}
      </div>

      <div ref={containerRef} className={styles.virtualBody} onScroll={onScroll}>
        <div style={{ height: topPad }} />
        <div style={{ gridTemplateColumns: columns.map(() => 'minmax(80px,auto)').join(' ') }} className={styles.virtualStack}>
          {visible.map((r) => (
            <TableRow key={r.id + r.item_code} r={r} columns={columns} />
          ))}
        </div>
        <div style={{ height: bottomPad }} />
      </div>

      {rows.length === 0 && <div className={styles.emptyLine}>No rows found</div>}
    </div>
  );
}
