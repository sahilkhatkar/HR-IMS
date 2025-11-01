'use client';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './InfoModal.module.css';
import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';

export default function InfoModal({ item, onClose }) {
  const { formResponses } = useSelector((state) => state.formResponses);
  if (!item) return null;

  const inStockItems = useMemo(() => (
    (formResponses || [])
      .filter(it => it.item_code === item.item_code && Number(it.stock_qty) > 0 && (it.form_type === 'Finished' || it.form_type === 'Finish' || !it.form_type))
      .slice(-30).slice(-5).reverse()
  ), [formResponses, item.item_code]);

  const plannedStockItems = useMemo(() => (
    (formResponses || [])
      .filter(it => it.item_code === item.item_code && it.form_type === 'Planned')
      .slice(-30).slice(-5).reverse()
  ), [formResponses, item.item_code]);

  const finishedGoodsItems = useMemo(() => (
    (formResponses || [])
      .filter(it => it.item_code === item.item_code && (it.form_type === 'Finished' || it.form_type === 'Finish'))
      .slice(-30).slice(-5).reverse()
  ), [formResponses, item.item_code]);

  const sumQty = rows => rows.reduce((a, r) => a + (Number(r.stock_qty) || 0), 0);
  const totalInStock = sumQty(inStockItems);
  const totalPlanned = sumQty(plannedStockItems);
  const totalFinished = sumQty(finishedGoodsItems);
  const atp = Math.max(0, totalFinished - totalPlanned);

  const modalRef = useRef(null);
  const handleClickOutside = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  }, [onClose]);
  const handleEsc = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [handleClickOutside, handleEsc]);

  const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(n || 0));
  const fmtDate = (d) => {
    if (!d) return '—';
    try { return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(d)); }
    catch { return d; }
  };
  const Chip = ({ children }) => <span className={styles.chip}>{children}</span>;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: .14 }}
      >
        <motion.div
          className={styles.modal}
          ref={modalRef}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 6, opacity: 0 }}
          transition={{ duration: .18 }}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerMain}>
              <h2 id="modalTitle" className={styles.title}>{item.description || 'Item'}</h2>
              <div className={styles.metaRow}>
                <Chip>{item.item_code}</Chip>
                {item.brand ? <Chip>{item.brand}</Chip> : null}
                {item.pack_size ? <Chip>Pack: {item.pack_size}</Chip> : null}
                {item.pack_type ? <Chip>{item.pack_type}</Chip> : null}
              </div>
            </div>
            <button aria-label="Close" className={styles.iconBtn} onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Info row */}
          <div className={styles.infoRow}>
            <div><span>Plant</span><strong>{item.plant_name || '—'}</strong></div>
            <div><span>HSN</span><strong>{item.hsn_code || '—'}</strong></div>
            <div><span>Pack Size</span><strong>{item.pack_size || '—'}</strong></div>
            <div><span>Pack Type</span><strong>{item.pack_type || '—'}</strong></div>
          </div>

          {/* KPIs (compact) */}
          <div className={styles.kpis}>
            <div className={styles.kpi}><span>In Stock</span><strong className={styles.num}>{fmt(totalInStock)}</strong></div>
            <div className={styles.kpi}><span>Planned</span><strong className={styles.num}>{fmt(totalPlanned)}</strong></div>
            <div className={styles.kpi}><span>Finished</span><strong className={styles.num}>{fmt(totalFinished)}</strong></div>
            <div className={`${styles.kpi} ${atp <= 0 ? styles.kpiWarn : ''}`}><span>ATP</span><strong className={styles.num}>{fmt(atp)}</strong></div>
          </div>

          {/* Tables */}
          <div className={styles.grid3}>
            <section className={styles.card}>
              <div className={styles.cardHead}><h3>In Stock</h3></div>
              <div className={styles.tableWrap}>
                <table className={styles.table} role="grid">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Plant</th>
                      <th className={styles.thNum}>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inStockItems.length ? inStockItems.map((r, i) => (
                      <tr key={`ins-${r.id || i}`}>
                        <td>{i + 1}</td>
                        <td title={r.date || ''}>{fmtDate(r.date)}</td>
                        <td className={styles.cellTrunc}>{r.plant_name || '—'}</td>
                        <td className={styles.tdNum}>{fmt(r.stock_qty)}</td>
                      </tr>
                    )) : <tr className={styles.empty}><td colSpan={4}>No recent entries</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHead}><h3>Planned</h3></div>
              <div className={styles.tableWrap}>
                <table className={styles.table} role="grid">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Sales Order</th>
                      <th>Plant</th>
                      <th className={styles.thNum}>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plannedStockItems.length ? plannedStockItems.map((r, i) => (
                      <tr key={`pln-${r.id || i}`}>
                        <td>{i + 1}</td>
                        <td className={styles.cellTrunc}>{r.sales_order || '—'}</td>
                        <td className={styles.cellTrunc}>{r.plant_name || '—'}</td>
                        <td className={styles.tdNum}>{fmt(r.stock_qty)}</td>
                      </tr>
                    )) : <tr className={styles.empty}><td colSpan={4}>Nothing planned</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHead}><h3>Finished Goods</h3></div>
              <div className={styles.tableWrap}>
                <table className={styles.table} role="grid">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Sales Order</th>
                      <th>Plant</th>
                      <th className={styles.thNum}>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finishedGoodsItems.length ? finishedGoodsItems.map((r, i) => (
                      <tr key={`fin-${r.id || i}`}>
                        <td>{i + 1}</td>
                        <td className={styles.cellTrunc}>{r.sales_order || '—'}</td>
                        <td className={styles.cellTrunc}>{r.plant_name || '—'}</td>
                        <td className={styles.tdNum}>{fmt(r.stock_qty)}</td>
                      </tr>
                    )) : <tr className={styles.empty}><td colSpan={4}>No finished records</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className={styles.footer}>
            <span>Press <kbd>Esc</kbd> to close</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
