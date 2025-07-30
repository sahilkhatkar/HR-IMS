'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './CustomDropdown.module.css'; // Create a new CSS module or reuse existing styles

export default function CustomDropdown({
  options = [],
  selected,
  onSelect,
  label,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.dropdownWrapper} ref={dropdownRef}>
      {label && <label className={styles.label}>{label}</label>}
      <button
        className={styles.dropdownTrigger}
        onClick={() => setOpen((prev) => !prev)}
      >
        {selected.charAt(0).toUpperCase() + selected.slice(1)}
        <span className={styles.arrow}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <ul className={styles.dropdownMenu}>
          {options.map((option) => (
            <li
              key={option}
              className={`${styles.dropdownItem} ${
                option === selected ? styles.active : ''
              }`}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
