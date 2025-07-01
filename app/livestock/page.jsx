'use client';

import { motion } from 'framer-motion';
import { FaEdit, FaInfoCircle, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import styles from '../components/imsStyles.module.css';
import EditModal from '../components/EditModal';
import InfoModal from '../components/InfoModal';
import { useState, useMemo } from 'react';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ITEMS_PER_PAGE = 10;

export default function Livestock() {
    const { stockData, loading2, error2 } = useSelector((state) => state.data);

    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
    const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE);
    const [selectedItem, setSelectedItem] = useState(null);
    const [infoItem, setInfoItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({});

    const handleEdit = (item) => setSelectedItem(item);

    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort />;
        return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    const COLUMNS = [
        { key: 'item_code', label: 'Item Code', filterable: false },
        { key: 'description', label: 'Description', filterable: false },
        { key: 'pack_size', label: 'Pack Size', filterable: true },
        { key: 'pack_type', label: 'Pack Type', filterable: true },
        { key: 'unit', label: 'Unit', filterable: true },
        { key: 'plant_name', label: 'Plant', filterable: true },
        { key: 'max_level', label: 'Max Level', filterable: true },
        { key: 'stock_qty', label: 'Stock Qty', filterable: false },
        { key: 'unplanned_stock_qty', label: 'Unplanned Stock', filterable: false },
        { key: 'pending_purchase_qty', label: 'Pending Purchase Qty', filterable: false },
    ];

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

    const getUniqueValues = (key) => Array.from(
        new Set((Array.isArray(stockData) ? stockData : []).map((item) => item[key]).filter(Boolean))
    ).sort();

    if (loading2) return <p>Loading stock data...</p>;
    if (error2) return <p>Error: {error2}</p>;
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
                {COLUMNS.filter(col => col.filterable).map((col) => {
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
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </motion.div>
                </div>


                <div className={styles.totalStockQty}>
                    <span>
                        Total Stock
                    </span>
                    <p>
                        {filteredData.reduce((sum, obj) => {
                            return sum + (Number(obj.stock_qty) || 0); // safely convert to number
                        }, 0)}
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
                <motion.table
                    className={styles.animatedTable}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <thead>
                        <tr>
                            <th>#</th>
                            {COLUMNS.map((col) => (
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
                                <motion.tr
                                    key={item.item_code || index}
                                    className={styles.tableRow}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <td>{startIndex + index + 1}</td>
                                    {COLUMNS.map((col) => (
                                        <td key={col.key}>{item[col.key]}</td>
                                    ))}
                                    <td className={styles.actionsCell}>
                                        {/* <button
                                            className={styles.iconBtn}
                                            onClick={() => handleEdit(item)}
                                            aria-label="Edit"
                                            title="Edit"
                                        >
                                            <FaEdit />
                                        </button> */}
                                        <button
                                            className={styles.iconBtn}
                                            onClick={() => setInfoItem(item)}
                                            aria-label="Info"
                                            title="View Details"
                                        >
                                            <FaInfoCircle />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </motion.table>

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
