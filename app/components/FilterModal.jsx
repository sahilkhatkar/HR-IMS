'use client';

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import SmallSelect from "./SmallSelect";
import styles from "./filterModal.module.css";

const COLOR_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Over 100%', value: 'over_100' },
  { label: '66% - 100%', value: '66_100' },
  { label: '33% - 66%', value: '33_66' },
  { label: 'Below 33%', value: 'below_33' },
];

const FilterModal = ({
  open,
  onClose,
  onApply,
  initialFilters,
  initialRowsPerPage,
  filterOptions, // { pack_size: Option[], pack_type: Option[], plant_name: Option[], max_level: Option[] }
}) => {
  const [localFilters, setLocalFilters] = useState(initialFilters || { colorRange: 'all' });
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage || 10);

  useEffect(() => {
    if (open) {
      setLocalFilters(initialFilters || { colorRange: 'all' });
      setRowsPerPage(initialRowsPerPage || 10);
    }
  }, [open, initialFilters, initialRowsPerPage]);

  if (!open) return null;

  const content = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Filters</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Pack Size</label>
            <SmallSelect
              options={[{ value: 'all', label: 'All' }, ...(filterOptions.pack_size || [])]}
              value={
                localFilters.pack_size && localFilters.pack_size !== 'all'
                  ? { value: localFilters.pack_size, label: localFilters.pack_size }
                  : { value: 'all', label: 'All' }
              }
              onChange={(opt) => setLocalFilters((p) => ({ ...p, pack_size: opt ? opt.value : 'all' }))}
              isSearchable={false}
              maxWidth="100%"
            />
          </div>

          <div className={styles.field}>
            <label>Pack Type</label>
            <SmallSelect
              options={[{ value: 'all', label: 'All' }, ...(filterOptions.pack_type || [])]}
              value={
                localFilters.pack_type && localFilters.pack_type !== 'all'
                  ? { value: localFilters.pack_type, label: localFilters.pack_type }
                  : { value: 'all', label: 'All' }
              }
              onChange={(opt) => setLocalFilters((p) => ({ ...p, pack_type: opt ? opt.value : 'all' }))}
              isSearchable={false}
              maxWidth="100%"
            />
          </div>

          <div className={styles.field}>
            <label>Plant</label>
            <SmallSelect
              options={[{ value: 'all', label: 'All' }, ...(filterOptions.plant_name || [])]}
              value={
                localFilters.plant_name && localFilters.plant_name !== 'all'
                  ? { value: localFilters.plant_name, label: localFilters.plant_name }
                  : { value: 'all', label: 'All' }
              }
              onChange={(opt) => setLocalFilters((p) => ({ ...p, plant_name: opt ? opt.value : 'all' }))}
              isSearchable={false}
              maxWidth="100%"
            />
          </div>

          <div className={styles.field}>
            <label>Max Level</label>
            <SmallSelect
              options={[{ value: 'all', label: 'All' }, ...(filterOptions.max_level || [])]}
              value={
                localFilters.max_level && localFilters.max_level !== 'all'
                  ? { value: localFilters.max_level, label: localFilters.max_level }
                  : { value: 'all', label: 'All' }
              }
              onChange={(opt) => setLocalFilters((p) => ({ ...p, max_level: opt ? opt.value : 'all' }))}
              isSearchable={false}
              maxWidth="100%"
            />
          </div>

          <div className={styles.field}>
            <label>Stock Level %</label>
            <SmallSelect
              options={COLOR_FILTERS}
              value={COLOR_FILTERS.find((o) => o.value === (localFilters.colorRange || 'all'))}
              onChange={(opt) => setLocalFilters((p) => ({ ...p, colorRange: opt ? opt.value : 'all' }))}
              isSearchable={false}
              maxWidth="100%"
            />
          </div>

          <div className={styles.field}>
            <label>Rows per page</label>
            <SmallSelect
              options={[10, 20, 30, 50, 100].map((n) => ({ value: n, label: String(n) }))}
              value={{ value: rowsPerPage, label: String(rowsPerPage) }}
              onChange={(opt) => setRowsPerPage(Number(opt?.value || 10))}
              isSearchable={false}
              maxWidth="100%"
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.clearBtn}
            onClick={() => {
              setLocalFilters({ colorRange: 'all' });
            }}
          >
            Clear
          </button>
          <div className={styles.footerRight}>
            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button
              className={styles.applyBtn}
              onClick={() => onApply(localFilters, rowsPerPage)}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default FilterModal;
