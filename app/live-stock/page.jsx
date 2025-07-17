'use client';

import { motion } from 'framer-motion';
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
    { key: 'description', label: 'Description' },
    { key: 'unit', label: 'Unit' },
    { key: 'plant_name', label: 'Plant' },
    { key: 'max_level', label: 'Max Level' },
    { key: 'unplanned_stock_qty', label: 'Unplanned Stock' },
    { key: 'planned_stock_qty', label: 'Planned Stock Qty' },
    // { key: 'pending_purchase_qty', label: 'Pending Purchase Qty' },
];

const COLUMNS_FILTERABLE = [
    { key: 'pack_size', label: 'Pack Size' },
    { key: 'pack_type', label: 'Pack Type' },
    { key: 'unit', label: 'Unit' },
    { key: 'plant_name', label: 'Plant' },
    { key: 'max_level', label: 'Max Level' },
];

export default function Livestock() {
    const { stockData, loading, error } = useSelector((state) => state.liveStockData);

    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
    const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE);
    const [selectedItem, setSelectedItem] = useState(null);
    const [infoItem, setInfoItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({});

    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort />;
        return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    const filteredData = useMemo(() => {
        if (!Array.isArray(stockData)) return [];

        return stockData.filter((item) => {
            const searchMatch = Object.values(item).some((val) =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            );

            const columnFiltersMatch = Object.entries(filters).every(([key, value]) => {
                if (value === 'all') return true;
                return String(item[key]).trim().toLowerCase() === String(value).trim().toLowerCase();
            });

            return searchMatch && columnFiltersMatch;
        });
    }, [stockData, searchTerm, filters]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a?.[sortConfig.key] ?? '';
            const bValue = b?.[sortConfig.key] ?? '';
            return sortConfig.direction === 'asc'
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
        });
    }, [filteredData, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentItems = sortedData.slice(startIndex, startIndex + rowsPerPage);

    const getUniqueValues = (key) =>
        Array.from(new Set((Array.isArray(stockData) ? stockData : []).map((item) => item[key]).filter(Boolean))).sort();

    const getCellStyle = (max, unplanned) => {
        if (!max || Number(max) === 0) {
            return {
                backgroundColor: '#f0f0f0',
                color: '#888',
                fontWeight: 'bold',
            }; // Grey bg for 0 max_level
        }

        const percentage = (Number(unplanned) / Number(max)) * 100;

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



    if (loading) return <p>Loading stock data...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!stockData || !Array.isArray(stockData)) return <p>No data found.</p>;

    return (
        <div className={styles.tableContainer}>
            <motion.h1
                className={styles.tableTitle}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }}
            >
                Live Stock Analysis
                <span className={styles.liveDot} />
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
                </div>

                <div className={styles.totalStockQty}>
                    <span>Total Stock</span>
                    <p>
                        {filteredData.reduce((sum, obj) => sum + (Number(obj.unplanned_stock_qty) || 0), 0)}
                    </p>
                </div>
            </div>

            <motion.p
                className={styles.tableSubTitle}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }}
            >
                {
                    (searchTerm.trim() || Object.values(filters).some(val => val && val !== 'all'))
                        ? `Found ${filteredData.length} out of ${stockData.length} items`
                        : `Total ${stockData.length} items in stock`
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
                                    {/* {COLUMNS_DISPLAY.map((col) => (
                                        <td key={col.key}>{item[col.key]}</td>
                                    ))} */}


                                    {COLUMNS_DISPLAY.map((col) => {
                                        const value = item[col.key];

                                        // Apply style only for these two columns
                                        const isStyledCol = col.key === 'max_level' || col.key === 'unplanned_stock_qty';
                                        const style =
                                            // isStyledCol
                                            true
                                                ? getCellStyle(item.max_level, item.unplanned_stock_qty)
                                                : {};

                                        return (

                                            isStyledCol ? (
                                                <td key={col.key}>
                                                    <span
                                                        style={
                                                            value
                                                                ? {
                                                                    padding: '8px 12px',
                                                                    borderRadius: '6px',
                                                                    ...style,
                                                                }
                                                                : undefined
                                                        }
                                                    >
                                                        {value}
                                                    </span>
                                                </td>

                                            ) : (
                                                <td key={col.key}>
                                                    <span
                                                        style={{
                                                            ...style,
                                                            backgroundColor: 'transparent',
                                                        }}
                                                    >
                                                        {value}
                                                    </span>
                                                </td>
                                            )


                                            // <td key={col.key} style={style}>
                                            //     {value}
                                            // </td>
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

                <div className={styles.pagination}>
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
                </div>
            </motion.div>

            {selectedItem && (
                <EditModal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}
            {infoItem && (
                <InfoModal item={infoItem} onClose={() => setInfoItem(null)} />
            )}
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}
