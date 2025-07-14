'use client';

import { motion, AnimatePresence } from 'framer-motion';
import styles from './EditModal.module.css';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { updateMasterItem } from '../../store/slices/masterDataSlice'; // adjust this path


// const scriptURL = "https://script.google.com/macros/s/AKfycbx-qJ_5XoQbBW7I30RF4KEFPMtqt6MZcUBvdNV1l4I4KUYktMCUbNb9gBrjZ-VlY3cH/exec";
const scriptURL = "https://script.google.com/macros/s/AKfycbxDcz6zbGv2o5R2us9Sm9UbrX8OCbO7LakqV_0rf6GaxfL9vFmDyDZKnrv9ZVca8p9oLA/exec";

const dropdownConfig = {
  season: ['Peak', 'Off', 'Normal'],
  // unit: ['kg', 'g', 'liters', 'pcs'], // example future use
};

export default function EditModal({ item, onClose }) {
  if (!item) return null;

  const [formData, setFormData] = useState({ ...item });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const formDataRaw = new FormData(e.target);
    const formObject = {};

    // Convert FormData to plain object
    for (let [key, value] of formDataRaw.entries()) {
      formObject[key] = value;
    }

    console.log("Form data object:", formObject);

    if (!formObject.item_code) {
      toast.warning('Item Code is required to modify an item!');
      return;
    }


    try {

      // const response = await fetch(scriptURL, {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     ...formObject, modify: true
      //   }),
      // });


      const response = await fetch('/api/update-item', {
        method: 'POST',
        body: JSON.stringify(formObject),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Response from server:", response);

      if (!response.ok) throw new Error('Failed to submit form');

      // Dispatch local Redux update
      dispatch(updateMasterItem(formObject));

      toast.success('Item saved successfully!');
      onClose(); // Optionally close modal


      console.log('Form submitted successfully', response);
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error('Failed to save item ❌');
      onClose(); // Optionally close modal
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.8, opacity: 0, y: -50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -50 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <h2>Edit Item</h2>

          <form onSubmit={handleSubmit}>
            {Object.entries(formData).map(([key, value]) => (
              <div className={styles.formGroup} key={key}>
                <label>{formatLabel(key)}</label>
                {dropdownConfig[key] ? (
                  <select
                    name={key}
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                  >
                    <option value="">Select {formatLabel(key)}</option>
                    {dropdownConfig[key].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    name={key}
                    readOnly={key === 'item_code'}
                  />
                )}
              </div>
            ))}

            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper to format field labels nicely (e.g. pack_size → Pack Size)
function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
