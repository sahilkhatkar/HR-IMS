'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './TransferStockModal.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { addResponseToResponses } from '../../store/slices/formResponsesSlice';
import { FaSpinner } from 'react-icons/fa';

export default function TransferStockModal({ isOpen, onClose }) {

  const dispatch = useDispatch();
  const { stockData, loading, error } = useSelector((state) => state.liveStockData);
  const { plantData } = useSelector((state) => state.plantData);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [item, setItem] = useState({ description: 'Select Item' });
  const [salesOrder, setSalesOrder] = useState('');
  const [qty, setQty] = useState('');
  const available = item?.unplanned_stock_qty || 0;

  const handleSubmit = async () => {
    const numericQty = parseFloat(qty);

    // Check if item is selected
    if (!item || item.description === 'Select Item') {
      alert('Please select a valid item.');
      return;
    }

    // Check if quantity is valid
    if (isNaN(numericQty) || numericQty <= 0) {
      alert('Qty must be greater than 0.');
      return;
    }

    if (numericQty > available) {
      alert(`Qty cannot be more than available (${available}).`);
      return;
    }

    setIsSubmitting(true);

    // ✅ Prepare payload in same structure as bulk submit
    const flatArray = [
      {
        item_code: item.item_code,
        stock_qty: -numericQty, // Or negative based on transfer direction logic
        plant_name: from,
        sales_order: salesOrder, // Optional if applicable
        remarks: `Stock Transfer: ${from} → ${to}`,
        form_type: 'Outward',
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        timestamp: new Date().toLocaleString('en-GB').replace(',', ''), // Same as original
      },
      {
        item_code: item.item_code,
        stock_qty: numericQty, // Or negative based on transfer direction logic
        plant_name: to,
        sales_order: salesOrder, // Optional if applicable
        remarks: `Stock Transfer: ${from} → ${to}`,
        form_type: 'Inward',
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        timestamp: new Date().toLocaleString('en-GB').replace(',', ''), // Same as original
      },

    ];

    try {
      const response = await fetch('/api/stock-in-out-entries', {
        method: 'POST',

        body: JSON.stringify({ items: flatArray }),
      });

      if (response.ok) {
        toast.success('Transfer Success');
        dispatch(addResponseToResponses(flatArray));
        handleClose(); // ✅ Clear form + close modal
      } else {
        toast.error('Failed to submit inventory');
      }

      if (!response.ok) {
        throw new Error(`Failed to submit: ${response.statusText}`);
      }

      onClose();
    } catch (err) {
      console.error('Transfer Error:', err);
      alert('Error during transfer. Please try again.');
    } finally {
      setIsSubmitting(false); // ✅ STOP SPINNER
    }
  };


  const handleClose = () => {
    setItem({ description: 'Select Item' });
    setQty('');
    setSalesOrder('');
    setSearchQuery('');
    onClose();
  };



  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };


  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // const filteredItems = itemOptions.filter(item =>
  //   item.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );


  const filteredItems = stockData.filter(item =>
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchQuery.toLowerCase())
  );


  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (plantData.length >= 2 && !from && !to) {
      setFrom(plantData[0]);
      setTo(plantData[1]);
    }
  }, [plantData, from, to]);



  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay}>
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <h2>Transfer</h2>
              <button className={styles.closeButton} onClick={onClose}>✕</button>
            </div>

            {/* From / To */}
            <div className={styles.transferSection}>

              <div className={styles.fromToGroup}>
                <div className={styles.selectWrapper}>
                  <label>From</label>
                  <select value={from} onChange={(e) => setFrom(e.target.value)} className={styles.select}>
                    {plantData.map((plant, index) => (
                      <option key={index} value={plant} disabled={plant === from}>{plant}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.selectWrapper}>
                  <label>To</label>
                  <select value={to} onChange={(e) => setTo(e.target.value)} className={styles.select}>
                    {plantData.map((plant, index) => (
                      <option key={index} value={plant} disabled={plant === from}>{plant}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button className={styles.swapButton} onClick={handleSwap}>⇅</button>
            </div>

            {/* Item Selector */}
            <div className={styles.inputGroup} ref={dropdownRef}>
              <label>Item</label>

              <div className={styles.customDropdown} ref={dropdownRef}>
                <div
                  className={styles.selectedItem}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  <span>{item.description}</span>
                  <span className={styles.arrow}>{dropdownOpen ? '▲' : '▼'}</span>
                </div>


                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <input
                      type="text"
                      placeholder="Search Item"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={styles.searchInput}
                    />
                    <div className={styles.dropdownList}>
                      {(searchQuery ? filteredItems.slice(0, 30) : filteredItems.slice(0, 30)).length > 0 ? (
                        (searchQuery ? filteredItems.slice(0, 30) : filteredItems.slice(0, 30)).map((opt, index) => (
                          <div
                            key={index}
                            className={styles.dropdownItem}
                            onClick={() => {
                              setItem(opt);
                              setDropdownOpen(false);
                            }}
                          >
                            <div className={styles.itemName}>{opt.description}</div>
                            <div className={styles.itemDetails}>
                              <span>{opt.unplanned_stock_qty}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.noResults}>No items found</div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>


            {/* Sales Order */}
            <div className={styles.inputGroup}>
              <label>Sales Order</label>
              <div className={styles.qtyRow}>
                <input
                  type="text"
                  value={salesOrder}
                  onChange={(e) => setSalesOrder(e.target.value)}
                  className={styles.input}
                  placeholder="Sales Order"
                />
              </div>
            </div>

            {/* Qty */}
            <div className={styles.inputGroup}>
              <label>Qty</label>
              <div className={styles.qtyRow}>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numeric = parseFloat(value);

                    // Allow empty string (for clearing input)
                    if (value === '') {
                      setQty('');
                      return;
                    }

                    // Disallow negative, zero, or over-max values
                    if (numeric > 0 && numeric <= available) {
                      setQty(value);
                    }
                  }}
                  className={styles.input}
                  placeholder="Minimum 1"
                />

                <button onClick={() => setQty(available)} className={styles.maxButton}>MAX</button>
              </div>
              <div className={styles.availableText}>Available: {available}</div>
            </div>

            {/* Confirm */}
            <div className={styles.footer}>
              <button className={styles.confirmButton} onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className={styles.spinner}>
                    <FaSpinner className={styles.spin} />
                    Transferring...
                  </span>
                ) : (
                  'Confirm'
                )}
              </button>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
