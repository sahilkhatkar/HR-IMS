"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./StockTable.module.css";

/** Merge formResponses (live stock) with masterData (meta) */
const mergeData = (formResponses = [], masterData = []) => {
  const grouped = {};

  formResponses.forEach((resp) => {
    const {
      item_code = "",
      stock_qty = 0,
      plant_name = "",
    } = resp || {};

    if (!item_code) return;

    const details =
      masterData.find((m) => m.item_code === item_code) || {};

    if (!grouped[item_code]) {
      grouped[item_code] = {
        item_code,
        description: details.description || "N/A",
        max_level: details.max_level ?? "-",
        plants: {},
      };
    }

    const plantKey = plant_name?.trim() || "UNKNOWN";
    const qtyNum = Number(stock_qty || 0);

    grouped[item_code].plants[plantKey] =
      (grouped[item_code].plants[plantKey] || 0) + qtyNum;
  });

  // Convert to array and compute total stock
  return Object.values(grouped).map((row) => ({
    ...row,
    totalStock: Object.values(row.plants).reduce((a, b) => a + Number(b || 0), 0),
  }));
};

const sortFns = {
  sno: (a, b) => 0, // will sort by index after pagination default; we handle separately
  description: (a, b) =>
    (a.description || "").localeCompare(b.description || ""),
  max_level: (a, b) =>
    Number(a.max_level || 0) - Number(b.max_level || 0),
  totalStock: (a, b) => Number(a.totalStock || 0) - Number(b.totalStock || 0),
};

export default function StockTable() {
  const { masterData = [] } = useSelector((state) => state.masterData);
  const { formResponses = [] } = useSelector((state) => state.formResponses);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("description");
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc'
  const [query, setQuery] = useState("");

  const baseData = useMemo(
    () => mergeData(formResponses, masterData),
    [formResponses, masterData]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseData;
    return baseData.filter((r) => {
      const inDesc = (r.description || "").toLowerCase().includes(q);
      const inCode = (r.item_code || "").toLowerCase().includes(q);
      return inDesc || inCode;
    });
  }, [baseData, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortKey === "sno") return arr; // keep current order for S.No.
    const fn = sortFns[sortKey] || (() => 0);
    arr.sort(fn);
    if (sortDir === "desc") arr.reverse();
    return arr;
  }, [filtered, sortKey, sortDir]);

  // Reset to first page on data/filter/sort change
  useEffect(() => {
    setPage(1);
  }, [rowsPerPage, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const clampedPage = Math.min(page, totalPages);
  const start = (clampedPage - 1) * rowsPerPage;
  const pageData = sorted.slice(start, start + rowsPerPage);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortIndicator = (key) =>
    sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <div className={styles.container}>
      {/* Header / Controls */}
      <motion.div
        className={styles.toolbar}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className={styles.title}>
          Stock Overview
          <span className={styles.badge}>
            {baseData.length} items
          </span>
        </h1>

        <div className={styles.controls}>
          <input
            className={styles.search}
            placeholder="Search by description or item code…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className={styles.rowsControl}>
            <label htmlFor="rpp">Rows:</label>
            <select
              id="rpp"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th
                className={styles.sortable}
                onClick={() => toggleSort("sno")}
                title="Serial order (page-local)"
              >
                # {sortIndicator("sno")}
              </th>
              <th
                className={styles.sortable}
                onClick={() => toggleSort("description")}
              >
                Description {sortIndicator("description")}
              </th>
              <th
                className={styles.sortable}
                onClick={() => toggleSort("max_level")}
              >
                Max Level {sortIndicator("max_level")}
              </th>
              <th
                className={styles.sortable}
                onClick={() => toggleSort("totalStock")}
              >
                Total Stock {sortIndicator("totalStock")}
              </th>
              <th>Bifurcate Stock</th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence initial={false}>
              {pageData.length === 0 ? (
                <motion.tr
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td className={styles.empty} colSpan={5}>
                    No data to display
                  </td>
                </motion.tr>
              ) : (
                pageData.map((item, idx) => (
                  <motion.tr
                    key={item.item_code}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    whileHover={{ scale: 1.01 }}
                    className={styles.row}
                  >
                    <td>
                      {start + idx + 1}
                    </td>
                    <td>
                      <div className={styles.descWrap}>
                        <p className={styles.desc}>{item.description}</p>
                        <p className={styles.code}>{item.item_code}</p>
                      </div>
                    </td>
                    <td>
                      <span className={styles.levelChip}>
                        {item.max_level === "" || item.max_level == null
                          ? "-"
                          : item.max_level}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.totalChip} ${
                          Number(item.totalStock) < 0
                            ? styles.negative
                            : Number(item.totalStock) === 0
                            ? styles.zero
                            : styles.positive
                        }`}
                      >
                        {item.totalStock}
                      </span>
                    </td>
                    <td>
                      <div className={styles.plantWrap}>
                        {Object.entries(item.plants).map(([plant, qty], i) => (
                          <motion.div
                            key={`${plant}-${i}`}
                            className={styles.plantRow}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                          >
                            <p
                              className={`${styles.qty} ${
                                Number(qty) < 0
                                  ? styles.negativeText
                                  : Number(qty) === 0
                                  ? styles.muted
                                  : ""
                              }`}
                            >
                              {qty}
                            </p>
                            <p className={styles.plant}>{plant}</p>
                          </motion.div>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <motion.div
        className={styles.pagination}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          className={styles.pageBtn}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={clampedPage === 1}
        >
          ‹ Prev
        </button>

        <span className={styles.pageInfo}>
          Page <strong>{clampedPage}</strong> of <strong>{totalPages}</strong>
        </span>

        <button
          className={styles.pageBtn}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={clampedPage === totalPages}
        >
          Next ›
        </button>
      </motion.div>
    </div>
  );
}
