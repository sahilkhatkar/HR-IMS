'use client';
import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import styles from './page.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import dynamic from 'next/dynamic';
import { addDamageStockResponses } from '../../store/slices/damageItemsEntriesSlice';
const Select = dynamic(() => import('react-select'), { ssr: false });

export default function DamageItemForm() {
    const columns = [
        { name: 'sale_order', label: 'Sale Order', type: 'text', required: true },
        { name: 'item_code', label: 'Item Code', type: 'select-search', required: true },
        { name: 'bags_required', label: 'Bags Required', type: 'number', required: true },
        { name: 'bags_issued', label: 'Bags Issued', type: 'number', required: true },
        { name: 'plant_name', label: 'Plant', type: 'select', required: true },
        { name: 'date_of_issue', label: 'Date of Issue', type: 'date', required: true },
        { name: 'bags_consumed', label: 'Bags Consumed', type: 'number' },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'damage', label: 'Damage', type: 'number' },
        { name: 'remarks', label: 'Remarks', type: 'text' },
    ];

    const dispatch = useDispatch();
    const { masterData, error } = useSelector((state) => state.masterData);
    const [rows, setRows] = useState([createNewRow()]);
    const [formErrors, setFormErrors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const filteredOptions = useRef([]);

    function createNewRow() {
        const row = {};
        columns.forEach(col => {
            row[col.name] = '';
        });
        return row;
    }

    const allItemOptions = masterData?.map(item => ({
        value: item.item_code,
        label: `${item.description} - ${item.item_code}`,
    })) || [];

    const allPlantOptions = Array.from(new Set(masterData?.map(item => item.plant_name)))
        .filter(Boolean)
        .map(plant => ({ value: plant, label: plant }));

    const handleChange = (index, field, value) => {
        const updated = [...rows];
        updated[index][field] = value;

        if (field === 'item_code') {
            const selectedItem = masterData.find(item => item.item_code === value);
            if (selectedItem) {
                updated[index].plant_name = selectedItem.plant_name || '';
                updated[index].description = selectedItem.description || '';
            }
        }

        setRows(updated);
    };

    const addRow = () => {
        setRows([...rows, createNewRow()]);
        setFormErrors([...formErrors, {}]);
    };

    const removeRow = (index) => {
        const updatedRows = [...rows];
        updatedRows.splice(index, 1);
        setRows(updatedRows.length ? updatedRows : [createNewRow()]);

        const updatedErrors = [...formErrors];
        updatedErrors.splice(index, 1);
        setFormErrors(updatedErrors.length ? updatedErrors : [{}]);
    };

    const validateRows = () => {
        const errors = rows.map(row => {
            const rowErrors = {};
            columns.forEach(col => {
                if (col.required && (!row[col.name] || (col.type === 'number' && row[col.name] <= 0))) {
                    rowErrors[col.name] = `${col.label} is required`;
                }
            });
            return rowErrors;
        });

        const hasErrors = errors.some(e => Object.keys(e).length > 0);
        setFormErrors(errors);
        return !hasErrors;
    };

    const formatDateForPayload = (dateStr) => {
        const dateObj = new Date(dateStr);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return dateObj.toLocaleDateString('en-GB', options).replace(/ /g, '-');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateRows()) return;

        setIsSubmitting(true);

        const flatArray = rows.map(entry => ({
            ...entry,
            date: formatDateForPayload(entry.date),
            timestamp: new Date().toLocaleString('en-GB').replace(',', ''),
        }));

        try {
            const response = await fetch('/api/damage-stock-entries-data', {
                method: 'POST',
                body: JSON.stringify({ items: flatArray }),
            });

            if (response.ok) {
                toast.success('Inventory submitted successfully!');
                dispatch(addDamageStockResponses(flatArray));
                setRows([createNewRow()]);
                setFormErrors([]);
            } else {
                toast.error('Failed to submit inventory');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error submitting inventory');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (error) return <div className={styles.error}>Error: {error}</div>;

    return (
        <form className={`${styles.inventoryContainer} ${isSubmitting ? styles.submitting : ''}`} onSubmit={handleSubmit}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // ⛔ Prevent form submission via Enter key
                }
            }}>
            {/* <h2 className={styles.heading}>Damage Material Form</h2> */}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={styles.tableWrapper}
            >
                <table className={styles.inventoryTable}>
                    <thead>
                        <tr>
                            <th>#</th>
                            {columns.map(col => (
                                <th key={col.name}>
                                    {col.label}
                                    {col.required && <span className={styles.required}>*</span>}
                                </th>
                            ))}
                            <th>Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                {columns.map(col => (
                                    <td key={col.name}>
                                        {col.type === 'select-search' ? (
                                            <>
                                                <Select
                                                    className={styles.reactSelect}
                                                    placeholder={`Select ${col.label.toLowerCase()}...`}
                                                    value={
                                                        row[col.name]
                                                            ? {
                                                                value: row[col.name],
                                                                label: allItemOptions.find(opt => opt.value === row[col.name])?.label || row[col.name],
                                                            }
                                                            : null
                                                    }
                                                    options={filteredOptions.current}
                                                    filterOption={null}
                                                    onInputChange={(value) => {
                                                        setInputValue(value);
                                                        filteredOptions.current = allItemOptions
                                                            .filter(option => option.label.toLowerCase().includes(value.toLowerCase()))
                                                            .slice(0, 30);
                                                    }}
                                                    onChange={(selected) => handleChange(index, col.name, selected?.value || '')}
                                                    isClearable
                                                />
                                                {row.description && col.name === 'item_code' && (
                                                    <div className={styles.itemDescription}>{row.description}</div>
                                                )}
                                            </>
                                        ) : col.type === 'select' ? (
                                            <Select
                                                className={styles.reactSelect}
                                                placeholder={`Select ${col.label.toLowerCase()}...`}
                                                value={row[col.name] ? { value: row[col.name], label: row[col.name] } : null}
                                                options={allPlantOptions}
                                                onChange={(selected) => handleChange(index, col.name, selected?.value || '')}
                                                isClearable
                                            />
                                        ) : (
                                            <input
                                                type={col.type}
                                                min={col.type === 'number' ? '0' : undefined}
                                                value={row[col.name]}
                                                onChange={(e) => handleChange(index, col.name, e.target.value)}
                                            />
                                        )}
                                        {formErrors[index]?.[col.name] && (
                                            <div className={styles.errorMsg}>{formErrors[index][col.name]}</div>
                                        )}
                                    </td>
                                ))}
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => removeRow(index)}
                                        disabled={rows.length === 1}
                                        className={styles.removeBtn}
                                    >
                                        ✖
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            <div className={styles.actionButtons}>
                <button type="button" onClick={addRow} className={styles.addBtn}>Add Row</button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <span className={styles.spinner}></span> Submitting...
                        </>
                    ) : 'Submit'}
                </button>
            </div>

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </form>
    );
}
