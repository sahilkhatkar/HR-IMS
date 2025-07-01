'use client';

import { motion } from 'framer-motion';
import { FaEdit, FaTrash } from 'react-icons/fa';
import styles from '../components/imsStyles.module.css';
import EditModal from '../components/EditModal';
// import AddItemsModal from './AddItemsModal';
import InfoModal from '../components/InfoModal';
import { fetchMasterData } from '../../store/slices/gSheetData';

import { FaInfoCircle } from 'react-icons/fa';
import { useData } from '../DataProvider';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Link from 'next/link';
import { useSelector } from 'react-redux';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ITEMS_PER_PAGE = 10;

const tableVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function AnimatedTable() {

  // const { data } = useData();

  // Using REDUX Toolkit
  const { masterData, loading1, error1 } = useSelector((state) => state.data);
  // End


  const handleEdit = (item) => {
    setSelectedItem(item);
  };

  const handleDelete = (id) => {
    alert(`Delete entry with ID: ${id}`);
  };

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

  const handleAddItems = (newItems) => {
    // Implement data update logic, e.g. context update
    console.log('New items added:', newItems);
  };


  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE); // Default 10

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [infoItem, setInfoItem] = useState(null);


  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination stuff
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({});

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

  const COLUMNS = [
    { key: 'item_code', label: 'Item Code', filterable: false },
    { key: 'description', label: 'Description', filterable: false },
    { key: 'pack_size', label: 'Pack Size', filterable: true },
    { key: 'pack_type', label: 'Pack Type', filterable: true },
    // { key: 'plant_name', label: 'Plant', filterable: true },
    { key: 'hsn_code', label: 'HSN Code', filterable: true },
  ];


  const getUniqueValues = (key) => Array.from(
    new Set((Array.isArray(masterData) ? masterData : []).map((item) => item[key]).filter(Boolean))
  ).sort();

  const packSizeOptions = getUniqueValues('pack_size');
  const packTypeOptions = getUniqueValues('pack_type');
  const hsnCodeOptions = getUniqueValues('hsn_code');


  if (loading1) return <p>Loading masterData data...</p>;
  if (error1) return <p>Error: {error1}</p>;
  if (!masterData) return <p>No data found.</p>;


  return (
    <div className={styles.tableContainer}>

      <motion.h1
        className={styles.tableTitle}
        variants={{
          initial: { opacity: 0, y: 50 },
          animate: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' },
          }
        }}
        initial="initial"
        animate="animate"
      >
        Welcome to Master IMS
      </motion.h1>

      <div className={styles.searchBarWrapper}>
        <input
          type="text"
          placeholder="Search here..."
          className={styles.searchBar}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on new search
          }}
        />
      </div>




      {/* <div className={styles.controls}>

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
      </div> */}



      <div className={styles.filters}>
        <div className={styles.filtersWrapper}>


          {COLUMNS.filter(col => col.filterable).map((col) => {
            const options = getUniqueValues(col.key).map(val => ({
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
                      ? options.find(opt => opt.value === filters[col.key]) || { value: 'all', label: 'All' }
                      : { value: 'all', label: 'All' }
                  }
                  onChange={(selected) => {
                    const value = selected.value;
                    setFilters((prev) => ({
                      ...prev,
                      [col.key]: value,
                    }));
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

        </div>


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

          <Link href="/additems"
          // target='_blank'
          >
            <motion.button
              className={styles.addButton}
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              + Add New Items
            </motion.button>
          </Link>
        </div>




      </div>



      <motion.p
        className={styles.tableSubTitle}
        variants={{
          initial: { opacity: 0, y: -50 },
          animate: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: 'easeOut' },
          },
        }}
        initial="initial"
        animate="animate"
      >
        {
          (searchTerm.trim() || Object.values(filters).some(val => val && val !== 'all'))
            ? `Found ${filteredData.length} out of ${masterData.length} items`
            : `Total ${masterData.length} items in stock`
        }

      </motion.p>








      <motion.div
        className={styles.tableWrapper}
        variants={{
          initial: { opacity: 0, y: 50 },
          animate: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' },
          }
        }}
        initial="initial"
        animate="animate"
      >
        <motion.table
          className={styles.animatedTable}
          // variants={tableVariants}
          // initial="hidden"
          // animate="visible"

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



              {/* <th onClick={() => handleSort('item_code')}>
                  Item Code {getSortIcon('item_code')}
                </th>

                <th onClick={() => handleSort('description')}>
                  Description {getSortIcon('description')}
                </th>
                <th onClick={() => handleSort('pack_size')}>
                  Pack Size {getSortIcon('pack_size')}
                </th>
                <th onClick={() => handleSort('pack_type')}>
                  Pack Type {getSortIcon('pack_type')}
                </th>
                <th onClick={() => handleSort('hsn_code')}>
                  HSN Code {getSortIcon('hsn_code')}
                </th> */}
              <th className={styles.actionsCol}>Actions</th>
            </tr>
          </thead>
          <tbody>

            {currentItems.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>
                  No results found.
                </td>
              </tr>
            )}



            {currentItems.map((item, _) => (
              <motion.tr
                key={item.item_code}
                // variants={rowVariants}
                className={styles.tableRow}

                whileHover={{ scale: 1.02 }}
              // transition={{ type: 'spring', stiffness: 3000 }}
              >
                <td>{startIndex + _ + 1}</td>

                {COLUMNS.map((col) => (
                  <td key={col.key}>{item[col.key]}</td>
                ))}


                {/* <td>{item.item_code}</td>
                  <td>{item.description}</td>
                  <td>{item.pack_size}</td>
                  <td>{item.pack_type}</td>
                  <td>{item.hsn_code}</td> */}


                <td className={styles.actionsCell}>
                  <button
                    className={styles.iconBtn}
                    onClick={() => handleEdit(item)}
                    aria-label="Edit"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>

                  <button
                    className={styles.iconBtn}
                    onClick={() => setInfoItem(item)}
                    aria-label="Info"
                    title="View Details"
                  >
                    <FaInfoCircle />
                  </button>

                  {/* <button
                      className={styles.iconBtn}
                      onClick={() => handleDelete(item.id)}
                      aria-label="Delete"
                    >
                      <FaTrash />
                    </button> */}
                </td>
              </motion.tr>
            ))}
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

          {/* <strong>of {filteredData.length} items</strong>  */}
        </div>



      </motion.div>

      {selectedItem && (
        <EditModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {infoItem && (
        <InfoModal item={infoItem} onClose={() => setInfoItem(null)} />
      )}


      <ToastContainer position="top-right" autoClose={3000} />

    </div>
  );
}
