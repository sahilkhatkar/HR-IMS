'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  FaInfoCircle,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import styles from './page.module.css';
import EditModal from '../components/EditModal';
import InfoModal from '../components/InfoModal';
import { useState, useMemo } from 'react';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ITEMS_PER_PAGE = 10;

// Column configurations
const COLUMNS_DISPLAY = [
  // { key: 'item_code', label: 'Item Code' },
  { key: 'description', label: 'Description' },
  { key: 'plant_name', label: 'Plant' },
  { key: 'max_level', label: 'Max Level' },
  { key: 'stock_qty', label: 'Stock Qty' },
  // { key: 'sales_order', label: 'Sales Order' },
  { key: 'remarks', label: 'Remarks' },
  // { key: 'date', label: 'Date' },
];


const COLUMNS_FILTERABLE = [
  { key: 'plant_name', label: 'Plant' },
  { key: 'sales_order', label: 'Sales Order' },
];

const PLANT_NAMES = ['CHETRAM', 'HANUMAN', 'PK', 'R.T AGRO', 'SURYA', 'VIRANIYA'];



export default function Store() {
  const { formResponses, loading, error } = useSelector((state) => state.formResponses);
  const { stockData } = useSelector((state) => state.liveStockData);

  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE);
  const [selectedItem, setSelectedItem] = useState(null);
  const [infoItem, setInfoItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    plant_name: PLANT_NAMES[0], // Default filter
    sales_order: 'all',
    colorRange: 'all',
  });


  const COLOR_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Over 100%', value: 'over_100' },
    { label: '66% - 100%', value: '66_100' },
    { label: '33% - 66%', value: '33_66' },
    { label: 'Below 33%', value: 'below_33' },
  ];


  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const filteredData = useMemo(() => {
    if (!Array.isArray(formResponses)) return [];

    // 1. Create a lookup map from stockData using item_code
    const stockMap = Array.isArray(stockData)
      ? stockData.reduce((map, item) => {
        if (item.item_code) {
          map[item.item_code] = {
            max_level: item.max_level,
            description: item.description,
          };
        }
        return map;
      }, {})
      : {};

    // 2. Filter and enrich data
    const baseFiltered = formResponses
      .map((item) => {


        const stockInfo = stockMap[item.item_code] || {};

        const searchString = [
          item.item_code,
          stockInfo.description,
          item.plant_name,
          stockInfo.max_level,
          item.stock_qty,
          item.sales_order,
          item.remarks,
          item.date
        ].map(val => String(val || '').toLowerCase()).join(' ');

        const searchMatch = searchString.includes(searchTerm.toLowerCase());


        const columnFiltersMatch = Object.entries(filters).every(([key, value]) => {
          if (key === 'colorRange' || value === 'all') return true;
          return String(item[key]).trim().toLowerCase() === String(value).trim().toLowerCase();
        });

        const max = Number(stockInfo.max_level);
        const qty = Number(item.stock_qty);
        const percentage = max > 0 ? (qty / max) * 100 : null;

        const colorMatch = (() => {
          switch (filters.colorRange) {
            case 'over_100':
              return percentage !== null && percentage > 100;
            case '66_100':
              return percentage !== null && percentage > 66 && percentage <= 100;
            case '33_66':
              return percentage !== null && percentage > 33 && percentage <= 66;
            case 'below_33':
              return percentage !== null && percentage <= 33;
            default:
              return true;
          }
        })();

        return searchMatch && columnFiltersMatch && colorMatch
          ? {
            ...item,
            max_level: stockInfo.max_level || 0,
            description: stockInfo.description || '', // ✅ Add description properly
          }
          : null;
      })
      .filter(Boolean);

    // 3. Group by item_code and aggregate
    const grouped = baseFiltered.reduce((acc, curr) => {
      const key = curr.item_code;
      const existing = acc[key];

      if (existing) {
        existing.stock_qty = String(Number(existing.stock_qty || 0) + Number(curr.stock_qty || 0));

        const dateA = new Date(existing.date || '2000-01-01');
        const dateB = new Date(curr.date || '2000-01-01');

        if (dateB > dateA) {
          acc[key] = { ...existing, ...curr, stock_qty: existing.stock_qty };
        }
      } else {
        acc[key] = { ...curr };
      }

      return acc;
    }, {});

    return Object.values(grouped);
  }, [formResponses, stockData, searchTerm, filters]);



  // Step 1: Base filtered data (used to populate dynamic filter options)
  const filteredBaseData = useMemo(() => {
    if (!Array.isArray(formResponses)) return [];

    return formResponses.filter(item => {
      const plantMatch =
        filters.plant_name === 'all' ||
        String(item.plant_name).trim().toLowerCase() === filters.plant_name.trim().toLowerCase();

      return plantMatch;
    });
  }, [formResponses, filters.plant_name]);



  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a?.[sortConfig.key];
      const bVal = b?.[sortConfig.key];

      const aNum = Number(aVal);
      const bNum = Number(bVal);

      const isNumeric = !isNaN(aNum) && !isNaN(bNum);

      if (isNumeric) {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      } else {
        const aStr = String(aVal || '');
        const bStr = String(bVal || '');
        return sortConfig.direction === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      }
    });
  }, [filteredData, sortConfig]);







  const handleExportCSV = (data) => {
    if (!data || data.length === 0) {
      alert('No data to export.');
      return;
    }

    // Dynamically get all unique keys from the data
    const allKeys = Array.from(
      new Set(data.flatMap(item => Object.keys(item)))
    );

    // Optional: sort keys alphabetically (remove this if you want raw order)
    allKeys.sort();

    const replacer = (key, value) => (value === null || value === undefined ? '' : value);

    const csv = [
      allKeys.join(','), // header row
      ...data.map(row =>
        allKeys.map(fieldName =>
          JSON.stringify(row[fieldName], replacer)
        ).join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `live_stock_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentItems = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const getUniqueValues = (key) => {
    const dataToScan = filteredBaseData.length ? filteredBaseData : formResponses;

    return Array.from(new Set(
      (Array.isArray(dataToScan) ? dataToScan : [])
        .map((item) => item[key])
        .filter(Boolean)
    )).sort();
  };



  const getCellStyle = (max, unplanned) => {
    const maxNum = Number(max);
    const unplannedNum = Number(unplanned);

    if (isNaN(maxNum) || maxNum === 0) {
      return {
        backgroundColor: '#f0f0f0',
        color: '#888',
        fontWeight: 'bold',
      }; // Grey for missing or 0 max_level
    }

    const percentage = (unplannedNum / maxNum) * 100;

    if (percentage > 100) {
      return {
        backgroundColor: '#f3e5f5', // light purple
        color: '#9c27b0',
        fontWeight: 'bold',
      };
    } else if (percentage > 66) {
      return {
        backgroundColor: '#e8f5e9', // light green
        color: '#4caf50',
        fontWeight: 'bold',
      };
    } else if (percentage > 33) {
      return {
        backgroundColor: '#fff3e0', // light orange
        color: '#ff9800',
        fontWeight: 'bold',
      };
    } else {
      return {
        backgroundColor: '#ffebee', // light red
        color: '#f44336',
        fontWeight: 'bold',
      };
    }
  };

  const getBubbleColor = (percentage) => {
    if (percentage > 100) return '#6a1b9a';      // Purple
    if (percentage > 66) return '#2e7d32';        // Green
    if (percentage > 33) return '#f9a825';        // Yellow
    return '#c62828';                             // Red
  };



  if (loading) return <p>Loading stock data...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!formResponses || !Array.isArray(formResponses)) return <p>No data found.</p>;

  return (
    <div className={styles.tableContainer}>
      <motion.h1
        className={styles.tableTitle}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }}
      >Store
        {/* <span className={styles.liveDot} /> */}
      </motion.h1>

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

      <div className={styles.filters}>
        {COLUMNS_FILTERABLE.map((col) => {
          const options = getUniqueValues(col.key).map(val => ({ value: val, label: val }));
          const value = filters[col.key] && filters[col.key] !== 'all'
            ? { value: filters[col.key], label: filters[col.key] }
            : { value: 'all', label: 'All' };

          return (
            <div key={col.key} className={styles.columnFilter}>
              <label>{col.label}</label>
              <Select
                className={styles.reactSelect}
                options={[{ value: 'all', label: 'All' }, ...options]}
                value={value}
                onChange={(selected) => {
                  setFilters(prev => ({ ...prev, [col.key]: selected.value }));
                  setCurrentPage(1);
                }}
                isSearchable
                menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                styles={{
                  menuPortal: base => ({ ...base, zIndex: 9999 }),
                  control: base => ({
                    ...base,
                    minHeight: '34px',
                    fontSize: '0.9rem',
                    borderColor: '#ccc',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#007bff' }
                  }),
                  menu: base => ({
                    ...base,
                    zIndex: 9999,
                    fontSize: '0.9rem'
                  }),
                }}
              />
            </div>

          );
        })}



        <div className={styles.columnFilter}>
          <label>Stock Level %</label>
          <Select
            className={styles.reactSelect}
            options={COLOR_FILTERS}
            value={COLOR_FILTERS.find(opt => opt.value === filters.colorRange)}
            onChange={(selected) => {
              setFilters(prev => ({ ...prev, colorRange: selected.value }));
              setCurrentPage(1);
            }}
            isSearchable={false}
            menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
            styles={{
              menuPortal: base => ({ ...base, zIndex: 9999 }),
              control: base => ({
                ...base,
                minHeight: '34px',
                fontSize: '0.9rem',
                borderColor: '#ccc',
                boxShadow: 'none',
                '&:hover': { borderColor: '#007bff' }
              }),
              menu: base => ({
                ...base,
                zIndex: 9999,
                fontSize: '0.9rem'
              }),
            }}
          />
        </div>


        <div className={styles.controls}>
          <div className={styles.rowsPerPage}>
            <label>Rows:</label>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[10, 20, 30, 50].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>






          <div className={styles.totalStockQty}>
            <span>Total Stock</span>
            <p>
              {filteredData.reduce((sum, obj) => sum + (Number(obj.stock_qty) || 0), 0)}
            </p>
          </div>

          {/* Export Button */}
          <button
            className={styles.exportBtn}
            onClick={() => handleExportCSV(filteredData)}
          >
            Export CSV
          </button>
        </div>

      </div>

      <motion.p
        className={styles.tableSubTitle}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }}
      >
        {
          (searchTerm.trim() || Object.values(filters).some(val => val && val !== 'all'))
            ? `Found ${filteredData.length} out of ${formResponses.length} items`
            : `Total ${formResponses.length} items in stock`
        }
      </motion.p>

      <motion.div
        className={styles.tableWrapper}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }}
      >
        <table className={styles.animatedTable}>
          <thead>
            <tr>
              <th>#</th>
              {COLUMNS_DISPLAY.map((col) => (
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
                <td colSpan="100%" style={{ textAlign: 'center', padding: '1rem' }}>
                  No results found.
                </td>
              </tr>
            ) : (
              currentItems.map((item, index) => (
                <tr key={item.item_code || index} className={styles.tableRow}>
                  <td>{startIndex + index + 1}</td>


                  {COLUMNS_DISPLAY.map((col) => {
                    const value = item[col.key];
                    const isStyledCol = col.key === 'max_level' || col.key === 'stock_qty';
                    const baseStyle = getCellStyle(item.max_level, item.stock_qty);

                    const percentage = item.max_level > 0
                      ? ((Number(item.stock_qty) / Number(item.max_level)) * 100).toFixed(0)
                      : null;

                    return (
                      <td key={col.key}>
                        <span
                          style={{
                            ...baseStyle,
                            backgroundColor: isStyledCol ? baseStyle.backgroundColor : 'transparent',
                            padding: isStyledCol ? '8px 12px' : undefined,
                            borderRadius: isStyledCol ? '6px' : undefined,
                            position: 'relative',
                            display: 'inline-block',
                          }}
                        >
                          {value}

                          {col.key === 'stock_qty' && percentage !== null && (
                            <span
                              className={styles.percentageBubble}
                            // style={{ backgroundColor: getBubbleColor(percentage) }}
                            >
                              {percentage}%
                            </span>
                          )}
                        </span>
                      </td>
                    );
                  })}






                  <td className={styles.actionsCell}>
                    <button
                      className={styles.iconBtn}
                      onClick={() => setInfoItem(item)}
                      aria-label="Info"
                      title="View Details"
                    >
                      <FaInfoCircle />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* <div className={styles.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className={styles.pageBtn}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className={styles.pageBtn}
          >
            Next
          </button>
        </div> */}

      </motion.div>
      <div className={styles.tableFooter}>

        <div className={styles.entriesInfo}>
          Showing {filteredData.length} of {formResponses.length} entries
        </div>

        <div className={styles.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className={styles.pageBtn}
          >← Prev</button>
          <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className={styles.pageBtn}
          >Next →</button>
        </div>
      </div>

      {selectedItem && (
        <EditModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
      <AnimatePresence>
        {infoItem && (
          <InfoModal item={infoItem} onClose={() => setInfoItem(null)} />
        )}
      </AnimatePresence>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
