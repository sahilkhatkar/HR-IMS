'use client';

import { useState, useMemo, useCallback } from 'react';
import CreatableSelect from 'react-select/creatable';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AddItemsForm.module.css';
import PreviewModal from '../components/PreviewModal';
import { useSelector, useDispatch } from 'react-redux';
import { generateUniqueItemCodes } from '../components/generateItemCodes';
import toast from 'react-hot-toast';
import { addItemsToMasterData } from '../../store/slices/masterDataSlice';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const fields = {
  description: { label: 'Description', type: 'text', required: false },
  brand: { label: 'Brand', type: 'select', required: true },
  pack_type: { label: 'Pack Type', type: 'select', required: true },
  pack_size: { label: 'Pack Size', type: 'select', required: true },
  unit: { label: 'Unit', type: 'select', required: true },
  hsn_code: { label: 'HSN Code', type: 'select', required: true },
  lead_time: { label: 'Lead Time', type: 'select', required: false },
  max_level: { label: 'Max Level', type: 'text', required: false },
  season: { label: 'Season', type: 'select', required: true },
};

const fieldKeys = Object.keys(fields);
const createEmptyRow = () =>
  Object.fromEntries(fieldKeys.map((key) => [key, '']));

export default function AddItemsForm({
  brandOptions = [],
  pack_sizeOptions = [],
  pack_typeOptions = [],
  hsn_codeOptions = [],
  lead_timeOptions = [],
  unitOptions = [],
  plant_nameOptions = [],
  seasonOptions = [],
}) {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([createEmptyRow()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const getSortedOptions = useCallback(
    (options) =>
      [...options].map((val) => (val ? { label: val, value: val } : val)),
    []
  );

  const memoizedDropdownOptions = useMemo(
    () => ({
      brand: getSortedOptions(brandOptions),
      pack_size: getSortedOptions(pack_sizeOptions),
      pack_type: getSortedOptions(pack_typeOptions),
      hsn_code: getSortedOptions(hsn_codeOptions),
      lead_time: getSortedOptions(lead_timeOptions),
      plant_name: getSortedOptions(plant_nameOptions),
      season: getSortedOptions(seasonOptions),
      unit: getSortedOptions(unitOptions),
    }),
    [
      getSortedOptions,
      pack_sizeOptions,
      pack_typeOptions,
      hsn_codeOptions,
      lead_timeOptions,
      plant_nameOptions,
      seasonOptions,
      unitOptions,
    ]
  );

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
  const removeRow = (idx) =>
    setRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out rows which are completely empty
    const nonEmptyRows = rows.filter((row) =>
      Object.values(row).some((val) => val?.trim())
    );

    if (!nonEmptyRows.length) {
      toast.error('Please fill at least one item.');
      return;
    }

    const missingFields = [];
    nonEmptyRows.forEach((item, idx) => {
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

    const itemsWithCodes = generateUniqueItemCodes(nonEmptyRows, existingCodes);


    console.log('Submitting items:', itemsWithCodes);
    try {
      setIsSubmitting(true);

      const res = await fetch('/api/master-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsWithCodes }),
      });

      const data = await res.json();
      if (!data.success) throw new Error('Failed to submit');

      dispatch(addItemsToMasterData(itemsWithCodes));

      itemsWithCodes.forEach((item, index) => {
        setTimeout(() => {
          toast.success(`Created item code: ${item.item_code}`, {
            autoClose: 3000,
          });
        }, index * 500);
      });

      setRows([createEmptyRow()]);
    } catch (err) {
      toast.error('Error submitting: ' + err.message, { autoClose: 5000 });
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };


  const customSelectStyles = useMemo(
    () => ({
      control: (base) => ({
        ...base,
        minHeight: '38px',
        borderRadius: '6px',
        fontSize: '0.9rem',
        boxShadow: 'none',
        borderColor: '#ccc',
      }),
      menu: (base) => ({ ...base, zIndex: 9999 }),
    }),
    []
  );

  return (
    <form onSubmit={handleSubmit} className={styles.pageContainer}>
      <h2 className={styles.heading}>Add New Items</h2>

      <AnimatePresence>
        {rows.map((row, i) => (
          <motion.div
            key={i}
            className={styles.gridCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.rowHeader}>
              <h3>Item {i + 1}</h3>
              {rows.length > 1 && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeRow(i)}
                >
                  ×
                </button>
              )}
            </div>

            <div className={styles.gridLayout}>
              {fieldKeys.map((field) => {
                const config = fields[field];
                const value = row[field];

                return (
                  <div key={field} className={styles.gridField}>
                    <label>
                      {config.label}
                      {config.required && (
                        <span className={styles.required}> *</span>
                      )}
                    </label>
                    {config.type === 'text' ? (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          handleChange(i, field, e.target.value)
                        }
                        className={styles.inputField}
                        required={config.required}
                      />
                    ) : (
                      <CreatableSelect
                        styles={customSelectStyles}
                        className={styles.selectField}
                        value={value ? { label: value, value: value } : null}
                        onChange={(selected) =>
                          handleChange(i, field, selected?.value || '')
                        }
                        options={memoizedDropdownOptions[field] || []}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className={styles.actions}>
        <motion.button
          type="button"
          className={styles.addRowBtn}
          onClick={addRow}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Add Item
        </motion.button>

        <motion.button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </motion.button>

        <motion.button
          type="button"
          className={styles.previewBtn}
          onClick={() => setShowPreview(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          👁 Preview
        </motion.button>
      </div>

      {showPreview && (
        <PreviewModal
          rows={rows}
          fields={fields}
          fieldKeys={fieldKeys}
          onClose={() => setShowPreview(false)}
        />
      )}

      <ToastContainer position="top-right" autoClose={5000} />
    </form>
  );
}
