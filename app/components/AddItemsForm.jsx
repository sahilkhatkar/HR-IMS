'use client';

import { useState, useMemo, useCallback } from 'react';
import CreatableSelect from 'react-select/creatable';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AddItemsForm.module.css';
import PreviewModal from './PreviewModal';
import { useSelector, useDispatch } from 'react-redux';
import { generateUniqueItemCodes } from './generateItemCodes';
import { addItemsToMasterData } from '../../store/slices/gSheetData'; // Adjust path

const scriptURL = "https://script.google.com/macros/s/AKfycbxDcz6zbGv2o5R2us9Sm9UbrX8OCbO7LakqV_0rf6GaxfL9vFmDyDZKnrv9ZVca8p9oLA/exec";

const fields = {
  description: { label: 'Description', type: 'text', required: true },
  pack_size: { label: 'Pack Size', type: 'select', required: false },
  pack_type: { label: 'Pack Type', type: 'select', required: false },
  unit: { label: 'Unit', type: 'select', required: true },
  hsn_code: { label: 'HSN Code', type: 'select', required: false },
  plant_name: { label: 'Plant', type: 'select', required: false },
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
}) {

  const dispatch = useDispatch();


  const [rows, setRows] = useState([createEmptyRow()]);
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPreview, setShowPreview] = useState(false);


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


  const masterData = useSelector((state) => state.masterData); // adjust based on your store
  const existingCodes = new Set(
    masterData?.items?.map((item) => item.item_code).filter(Boolean) || []
  );



  const handleChange = useCallback((idx, field, value) => {
    setRows((prevRows) => {
      const newRows = [...prevRows];
      newRows[idx] = { ...newRows[idx], [field]: value };
      return newRows;
    });
  }, []);

  const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);
  const removeRow = (idx) => setRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const itemMap = new Map();

    console.log(formData)

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
      alert("Please fill at least one item with a description.");
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
      alert(`Please fill all required fields:\n\n${missingFields.join('\n')}`);
      return;
    }

    console.log({ items });

    const itemsWithCodes = generateUniqueItemCodes(items, existingCodes);

    console.log({ items: itemsWithCodes });

    try {
      setIsSubmitting(true);
      const res = await fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify({ items: itemsWithCodes }),
      });

      if (!res.ok) throw new Error('Failed to submit');

      // ✅ Add new items to Redux
      dispatch(addItemsToMasterData(itemsWithCodes));

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setRows([createEmptyRow()]);

      console.log(res);

    } catch (err) {
      alert('Error submitting: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }

    console.log("Items: ", items);

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
    <form onSubmit={handleSubmit} className={styles.pageContainer}>
      <h2 className={styles.heading}>Add New Items</h2>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              {fieldKeys.map((field) => (
                <th key={field}>
                  {fields[field].label}
                  {fields[field].required && (
                    <span className={styles.required}> *</span>
                  )}
                </th>
              ))}
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {rows.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <td>{i + 1}</td>
                  {fieldKeys.map((field) => {
                    const config = fields[field];
                    const value = row[field];
                    return (
                      <td key={field}>
                        {config.type === 'text' ? (
                          <input
                            type="text"
                            name={`rows[${i}].${field}`}
                            value={value}
                            onChange={(e) =>
                              handleChange(i, field, e.target.value)
                            }
                            className={styles.inputField}
                            required={config.required}
                          />
                        ) : (
                          <>
                            <CreatableSelect
                              styles={customSelectStyles}
                              className={styles.selectField}
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
                              required={config.required}
                            />
                          </>
                        )}
                      </td>
                    );
                  })}
                  <td>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeRow(i)}
                      >
                        ×
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.addRowBtn} onClick={addRow}>Add Row</button>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>

        <button
          type="button"
          className={styles.previewBtn}
          onClick={() => setShowPreview(true)}
        >
          👁 Preview
        </button>

      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className={styles.toast}
          >
            ✅ Items submitted!
          </motion.div>
        )}
      </AnimatePresence>


      {showPreview && (
        <PreviewModal
          rows={rows}
          fields={fields}
          fieldKeys={fieldKeys}
          onClose={() => setShowPreview(false)}
        />
      )}

    </form>
  );
}
