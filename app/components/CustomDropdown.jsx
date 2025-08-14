'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiX } from 'react-icons/fi';
import styles from './CustomDropdown.module.css';

export default function CustomDropdown({
  options = [],
  selected,
  onSelect,
  label,
  clearable = true,
  searchable = true,
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onSelect(option);
    setOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onSelect('');
    setSearchTerm('');
  };

  return (
    <div className={styles.dropdownWrapper} ref={dropdownRef}>
      {label && <label className={styles.label}>{label}</label>}

      <motion.div
        className={styles.dropdownTrigger}
        onClick={() => setOpen((prev) => !prev)}
        whileTap={{ scale: 0.97 }}
      >
        <span className={styles.selectedText}>
          {selected ? selected.charAt(0).toUpperCase() + selected.slice(1) : 'Select...'}
        </span>

        <div className={styles.icons}>
          {clearable && selected && (
            <FiX
              size={18}
              className={styles.clearIcon}
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
          <motion.span
            className={styles.arrow}
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <FiChevronDown size={20} />
          </motion.span>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.ul
            className={styles.dropdownMenu}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {searchable && (
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <motion.li
                  key={option}
                  className={`${styles.dropdownItem} ${option === selected ? styles.active : ''}`}
                  onClick={() => handleSelect(option)}
                  whileTap={{ scale: 0.98 }}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </motion.li>
              ))
            ) : (
              <li className={styles.noOptions}>No options found</li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
