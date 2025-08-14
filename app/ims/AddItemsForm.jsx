'use client';

import { useState, useMemo, useCallback } from 'react';
import CreatableSelect from 'react-select/creatable';
import styles from './AddItemsForm.module.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { generateUniqueItemCodes } from '../components/generateItemCodes';
import { addItemsToMasterData } from '../../store/slices/masterDataSlice';

const fields = {
  description: { label: 'Description', type: 'text', required: true },
  pack_size: { label: 'Pack Size', type: 'select', required: false },
  pack_type: { label: 'Pack Type', type: 'select', required: false },
  unit: { label: 'Unit', type: 'select', required: false },
  hsn_code: { label: 'HSN Code', type: 'select', required: false },
  lead_time: { label: 'Lead Time', type: 'select', required: false },
  max_level: { label: 'Max Level', type: 'text', required: false },
  season: { label: 'Season', type: 'select', required: true },
};

const fieldKeys = Object.keys(fields);
const createEmptyRow = () =>
  Object.fromEntries(fieldKeys.map((key) => [key, '']));

export default function AddItemsForm({
  pack_sizeOptions = [],
  pack_typeOptions = [],
  hsn_codeOptions = [],
  lead_timeOptions = [],
  unitOptions = [],
  plant_nameOptions = [],
  seasonOptions = [],
  onClose
}) {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([createEmptyRow()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getSortedOptions = useCallback((options) =>
    [...options].map((val) => (val ? { label: val, value: val } : val)), []);

  const memoizedDropdownOptions = useMemo(() => ({
    pack_size: getSortedOptions(pack_sizeOptions),
    pack_type: getSortedOptions(pack_typeOptions),
    hsn_code: getSortedOptions(hsn_codeOptions),
    lead_time: getSortedOptions(lead_timeOptions),
    plant_name: getSortedOptions(plant_nameOptions),
    season: getSortedOptions(seasonOptions),
    unit: getSortedOptions(unitOptions),
  }), [
    getSortedOptions,
    pack_sizeOptions,
    pack_typeOptions,
    hsn_codeOptions,
    lead_timeOptions,
    plant_nameOptions,
    seasonOptions,
    unitOptions,
  ]);

  const masterData = useSelector((state) => state.masterData);
  const existingCodes = new Set(
    masterData?.masterData?.map((item) => item.item_code).filter(Boolean) || []
  );

  const handleChange = useCallback((idx, field, value) => {
    setRows((prevRows) => {
      const newRows = [...prevRows];
      newRows[idx] = { ...newRows[idx], [field]: value };
      return newRows;
    });
  }, []);

  const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const itemMap = new Map();

    for (let [key, value] of formData.entries()) {
      const match = key.match(/^rows\[(\d+)\]\.(.+)$/);
      if (!match) continue;
      const [, index, field] = match;
      if (!itemMap.has(index)) itemMap.set(index, {});
      itemMap.get(index)[field] = value;
    }

    const items = Array.from(itemMap.values()).filter(
      (item) => item.description?.trim()
    );

    if (!items.length) {
      toast.error("Please fill at least one item with a description.");
      return;
    }

    const missingFields = [];
    items.forEach((item, idx) => {
      Object.entries(fields).forEach(([fieldKey, config]) => {
        if (config.required && !item[fieldKey]?.trim()) {
          missingFields.push(`Row ${idx + 1}: ${config.label}`);
        }
      });
    });

    if (missingFields.length > 0) {
      toast.error(`Missing fields:\n${missingFields.join('\n')}`);
      return;
    }

    const itemsWithCodes = generateUniqueItemCodes(items, existingCodes);

    try {
      setIsSubmitting(true);

      const res = await fetch('/api/master-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsWithCodes }),
      });

      const data = await res.json();
      const createdCodes = data?.itemCodes || [];

      if (!data.success) throw new Error('Failed to submit');

      dispatch(addItemsToMasterData(itemsWithCodes));

      createdCodes.forEach((code, index) => {
        setTimeout(() => {
          toast.success(`Created item code: ${code}`, {
            autoClose: 3000,
          });
        }, index * 500);
      });

      setRows([createEmptyRow()]);
      onClose?.();

    } catch (err) {
      toast.error('Error submitting: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const customSelectStyles = useMemo(() => ({
    control: (base) => ({
      ...base,
      minHeight: '38px',
      borderRadius: '6px',
      fontSize: '0.9rem',
      boxShadow: 'none',
      borderColor: '#ccc',
    }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  }), []);

  return (
    <form onSubmit={handleSubmit}>
      <h2>Master IMS</h2>
      {rows.map((row, i) => (
        <div key={i} className={styles.formGrid}>
          {fieldKeys.map((field) => {
            const config = fields[field];
            const value = row[field];
            return (
              <div key={field} className={styles.formField}>
                <label>
                  {config.label}
                  {config.required && <span className={styles.required}> *</span>}
                </label>
                {config.type === 'text' ? (
                  <input
                    type="text"
                    name={`rows[${i}].${field}`}
                    value={value}
                    onChange={(e) => handleChange(i, field, e.target.value)}
                  />
                ) : (
                  <>
                    <CreatableSelect
                      styles={customSelectStyles}
                      value={value ? { label: value, value: value } : null}
                      onChange={(selected) =>
                        handleChange(i, field, selected?.value || '')
                      }
                      options={memoizedDropdownOptions[field] || []}
                    />
                    <input
                      type="hidden"
                      name={`rows[${i}].${field}`}
                      value={value}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div className={styles.actions}>
        <button type="button" onClick={addRow}>Add Row</button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
      <ToastContainer />
    </form>
  );
}
