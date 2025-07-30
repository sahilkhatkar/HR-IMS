'use client';

import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaInfoCircle, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import styles from './page.module.css';
import EditModal from '../components/EditModal';
import InfoModal from '../components/InfoModal';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import Link from 'next/link';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ITEMS_PER_PAGE = 10;

export default function AnimatedTable() {
  // const { masterData, loading, error } = useSelector((state) => state.data);
  const { masterData, loading, error } = useSelector((state) => state.masterData);

  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [infoItem, setInfoItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Separate columns
  const DISPLAY_COLUMNS = [
    { key: 'description', label: 'Description' },
    { key: 'pack_size', label: 'Pack Size' },
    { key: 'pack_type', label: 'Pack Type' },
    { key: 'hsn_code', label: 'HSN Code' },
  ];

  const FILTERABLE_COLUMNS = [
    { key: 'pack_size', label: 'Pack Size' },
    { key: 'pack_type', label: 'Pack Type' },
    { key: 'hsn_code', label: 'HSN Code' },
  ];

  const getUniqueValues = (key) =>
    Array.from(new Set((Array.isArray(masterData) ? masterData : []).map((item) => item[key]).filter(Boolean))).sort();

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const filteredData = (Array.isArray(masterData) ? masterData : []).filter((item) => {
    const searchMatch = Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columnFiltersMatch = Object.entries(filters).every(([key, value]) => {
      if (value === 'all') return true;
      return String(item[key]).trim().toLowerCase() === String(value).trim().toLowerCase();
    });

    return searchMatch && columnFiltersMatch;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (!aValue || !bValue) return 0;
    return sortConfig.direction === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentItems = sortedData.slice(startIndex, startIndex + rowsPerPage);

  if (loading) return <p>Loading masterData data...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!masterData) return <p>No data found.</p>;

  return (
    <div className={styles.tableContainer}>
      <motion.h1
        className={styles.tableTitle}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Welcome to Master IMS
      </motion.h1>

      {/* Search bar */}
      <div className={styles.searchBarWrapper}>
        <input
          type="text"
          placeholder="Search here..."
          className={styles.searchBar}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filtersWrapper}>
          {FILTERABLE_COLUMNS.map((col) => {
            const options = getUniqueValues(col.key).map((val) => ({
              value: val,
              label: val,
            }));
            return (
              <div key={col.key} className={styles.columnFilter}>
                <label>{col.label}</label>
                <Select
                  className={styles.reactSelect}
                  options={[{ value: 'all', label: 'All' }, ...options]}
                  value={
                    filters[col.key]
                      ? options.find((opt) => opt.value === filters[col.key]) || { value: 'all', label: 'All' }
                      : { value: 'all', label: 'All' }
                  }
                  onChange={(selected) => {
                    setFilters((prev) => ({
                      ...prev,
                      [col.key]: selected.value,
                    }));
                    setCurrentPage(1);
                  }}
                  isSearchable
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    control: (base) => ({
                      ...base,
                      minHeight: '34px',
                      fontSize: '0.9rem',
                      borderColor: '#ccc',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#007bff' },
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                      fontSize: '0.9rem',
                    }),
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Rows selector & Add button */}
        <div className={styles.controls}>
          <motion.div
            className={styles.rowsPerPage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <label>Rows:</label>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[10, 20, 30, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </motion.div>

          <Link href="/additems">
            <motion.button
              className={styles.addButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              + Add New Items
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Filter summary */}
      <motion.p
        className={styles.tableSubTitle}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {(searchTerm.trim() || Object.values(filters).some((val) => val && val !== 'all'))
          ? `Found ${filteredData.length} out of ${masterData.length} items`
          : `Total ${masterData.length} items in stock`}
      </motion.p>

      {/* Table */}
      <motion.div
        className={styles.tableWrapper}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.table className={styles.animatedTable} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <thead>
            <tr>
              <th>#</th>
              {DISPLAY_COLUMNS.map((col) => (
                <th key={col.key} onClick={() => handleSort(col.key)}>
                  {col.label} {getSortIcon(col.key)}
                </th>
              ))}
              <th className={styles.actionsCol}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>
                  No results found.
                </td>
              </tr>
            ) : (
              currentItems.map((item, idx) => (
                <motion.tr key={item.item_code || idx} className={styles.tableRow}>
                  <td>{startIndex + idx + 1}</td>
                  {DISPLAY_COLUMNS.map((col) => (
                    <td key={col.key}>{item[col.key]}</td>
                  ))}
                  <td className={styles.actionsCell}>


                    {/* Edit button */}
                    {/* <button className={styles.iconBtn} onClick={() => setSelectedItem(item)} title="Edit">
                      <FaEdit />
                    </button> */}
                    <button className={styles.iconBtn} onClick={() => setInfoItem(item)} title="View Details">
                      <FaInfoCircle />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </motion.table>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className={styles.pageBtn}>
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className={styles.pageBtn}>
            Next
          </button>
        </div>
      </motion.div>

      {/* Modals */}
      {selectedItem && <EditModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {infoItem && <InfoModal item={infoItem} onClose={() => setInfoItem(null)} />}

      {/* Toasts */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
