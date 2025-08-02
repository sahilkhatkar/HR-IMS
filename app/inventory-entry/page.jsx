'use client';
import { useState, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import styles from './page.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TransferStockModal from '../components/TransferStockModal';

import dynamic from 'next/dynamic';
import { addResponseToResponses } from '../../store/slices/formResponsesSlice';
const Select = dynamic(() => import('react-select'), { ssr: false });

export default function InventoryForm() {

    const dispatch = useDispatch();

    const [isOpen, setIsOpen] = useState(false);

    const { masterData, loading, error } = useSelector((state) => state.masterData);
    const { salesOrder } = useSelector((state) => state.salesOrder);
    const [isInward, setIsInward] = useState(true);
    const [rows, setRows] = useState([createNewRow()]);
    const [inputValue, setInputValue] = useState('');
    const [saleOrderInputValue, setSaleOrderInputValue] = useState('');

    const [formErrors, setFormErrors] = useState([]);



    const [isSubmitting, setIsSubmitting] = useState(false);

    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // "2025-06-26"
    });

    const allItemOptions = masterData?.map((item) => ({
        value: item.item_code,
        label: `${item.description} - ${item.item_code}`,
    }));

    const filteredItemOptions = useMemo(() => {
        if (!allItemOptions) return [];
        const lowerInput = inputValue.toLowerCase();
        return allItemOptions
            .filter(option => option.label.toLowerCase().includes(lowerInput))
            .slice(0, 30);
    }, [inputValue, allItemOptions]);


    const allPlantOptions = Array.from(new Set(masterData?.map(item => item.plant_name)))
        .filter(Boolean)
        .map(plant => ({
            value: plant,
            label: plant,
        }));

    const filteredSaleOrderOptions = useMemo(() => {
    if (!salesOrder || !Array.isArray(salesOrder)) return [];

    const lowerInput = saleOrderInputValue.toLowerCase();

    const filtered = salesOrder
        .filter(order =>
            order.sales_order_no.toLowerCase().includes(lowerInput)
        )
        .slice(0, 30)
        .map(order => ({
            value: order.sales_order_no,
            label: `${order.sales_order_no} (PI: ${order.pi}, Qty: ${order.qty_new_bags})`,
        }));

    // Add static option for Advance Packing
    const advancePackingOption = {
        value: 'Advance Packing',
        label: 'Advance Packing',
    };

    // Agar user "advance" ya similar kuch likhe to usko show karo
    if ('advance packing'.includes(lowerInput)) {
        filtered.unshift(advancePackingOption); // Add at the top
    }

    return filtered;
}, [salesOrder, saleOrderInputValue]);



    function createNewRow() {
        return {
            itemCode: '',
            qty: 1,
            plant: '',
            saleOrder: '',
            remarks: '',
            description: '',
        };
    }

    const handleToggle = () => {
        setIsInward(!isInward);
        setRows([createNewRow()]);
        setFormErrors([]);
    };

    const handleItemSelect = (index, selectedOption) => {
        const selectedItem = masterData.find(
            (item) => item.item_code === selectedOption?.value
        );

        const updatedRows = [...rows];
        updatedRows[index].itemCode = selectedOption?.value || '';
        updatedRows[index].plant = selectedItem?.plant_name || '';
        updatedRows[index].description = selectedItem?.description || '';
        setRows(updatedRows);
    };

    const handleChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
    };

    const addRow = () => {
        setRows([...rows, createNewRow()]);
        setFormErrors([...formErrors, {}]);
    };

    const removeRow = (index) => {
        const updatedRows = [...rows];
        updatedRows.splice(index, 1);
        setRows(updatedRows.length > 0 ? updatedRows : [createNewRow()]);

        const updatedErrors = [...formErrors];
        updatedErrors.splice(index, 1);
        setFormErrors(updatedErrors.length > 0 ? updatedErrors : [{}]);
    };

    const validateRows = () => {
        const errors = rows.map((row) => {
            const rowErrors = {};
            if (!row.itemCode) rowErrors.itemCode = 'Item code is required';
            if (!row.qty || isNaN(row.qty) || row.qty <= 0) rowErrors.qty = 'Quantity must be > 0';
            if (!isInward && !row.saleOrder) rowErrors.saleOrder = 'Sale order no. is required';
            return rowErrors;
        });

        const hasErrors = errors.some((e) => Object.keys(e).length > 0);
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

        setIsSubmitting(true); // 🟢 Start spinner + disable button

        const payload = {
            formType: isInward ? 'Inward' : 'Outward',
            date: formatDateForPayload(date),
            entries: rows,
        };

        // const flatArray = payload.entries.map(entry => ({
        //     ...entry,
        //     formType: payload.formType,
        //     date: payload.date
        // }));

        const flatArray = payload.entries.map(entry => ({
            item_code: entry.itemCode,
            stock_qty: isInward ? entry.qty : -Math.abs(entry.qty),
            plant_name: entry.plant,
            sales_order: entry.saleOrder,
            remarks: entry.remarks,
            form_type: payload.formType,
            date: payload.date,
            timestamp: new Date().toLocaleString('en-GB').replace(',', ''),
        }));


        try {
            const response = await fetch('/api/stock-in-out-entries', {
                method: 'POST',
                // body: JSON.stringify(flatArray),
                body: JSON.stringify({ items: flatArray }),
            });

            if (response.ok) {
                toast.success('Inventory submitted successfully!');

                dispatch(addResponseToResponses(flatArray));

                setRows([createNewRow()]); // ✅ Clear after success
                setFormErrors([]);
            } else {
                toast.error('Failed to submit inventory');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error submitting inventory');
        } finally {
            setIsSubmitting(false); // 🟢 Re-enable button
        }
    };


    // if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;

    return (
        // <form className={styles.inventoryContainer} onSubmit={handleSubmit}>
        <form
            className={`${styles.inventoryContainer} ${isSubmitting ? styles.submitting : ''}`}
            onSubmit={handleSubmit}
        >

            <div className={styles.switchAndDate}>
                {/* <button type="button" onClick={handleToggle} className={styles.toggleBtn}>
                    Switch form
                </button> */}


                <h2 className={styles.heading}>

                    <div className={styles.toggleWrapper}>
                        <label className={styles.toggleSwitch}>
                            <input
                                type="checkbox"
                                checked={isInward}
                                onChange={handleToggle}
                            />
                            <span className={styles.slider}></span>
                        </label>
                        <span className={styles.toggleLabel}>
                            {/* {isInward ? 'Inward' : 'Outward'} */}
                        </span>
                    </div>

                    <span className={`${styles.subheading} ${isInward ? styles.inward : styles.outward}`}>
                        [ {isInward ? 'Inward' : 'Outward'} ]
                    </span>

                </h2>


                <button className={styles.button} onClick={() => setIsOpen(true)}>Transfer Stock</button>
                <TransferStockModal isOpen={isOpen} onClose={() => setIsOpen(false)} />


                <div className={styles.datePickerWrapper}>
                    <label className={styles.dateLabel}>
                        Date:
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={styles.dateInput}
                            required
                        />
                    </label>
                </div>
            </div>


            <motion.div
                key={isInward ? 'inward' : 'outward'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={styles.tableWrapper}
            >
                <table className={styles.inventoryTable}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th className={styles.itemCodeCol}>
                                Item Code<span className={styles.required}>*</span>
                            </th>
                            <th className={styles.midWidth}>
                                Qty<span className={styles.required}>*</span>
                            </th>
                            <th className={styles.midWidth}>Plant</th>
                            {!isInward && (
                                <th className={styles.saleOrderCol}>
                                    Sale Order No.<span className={styles.required}>*</span>
                                </th>
                            )}
                            <th className={styles.midWidth}>Remarks</th>
                            <th>Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    <Select
                                        className={styles.reactSelect}
                                        placeholder="Select item code..."
                                        value={
                                            row.itemCode
                                                ? {
                                                    value: row.itemCode,
                                                    label: allItemOptions.find(opt => opt.value === row.itemCode)?.label || row.itemCode
                                                }
                                                : null
                                        }
                                        options={filteredItemOptions}
                                        onInputChange={(value) => setInputValue(value)}
                                        filterOption={null}
                                        onChange={(selected) => handleItemSelect(index, selected)}
                                        isClearable
                                        isSearchable
                                    />

                                    {row.description && (
                                        <div className={styles.itemDescription}>{row.description}</div>
                                    )}
                                    {formErrors[index]?.itemCode && (
                                        <div className={styles.errorMsg}>{formErrors[index].itemCode}</div>
                                    )}
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        min="1"
                                        value={row.qty}
                                        onChange={(e) => handleChange(index, 'qty', e.target.value)}
                                    />
                                    {formErrors[index]?.qty && (
                                        <div className={styles.errorMsg}>{formErrors[index].qty}</div>
                                    )}
                                </td>
                                <td>
                                    <Select
                                        className={styles.reactSelect}
                                        placeholder="Select plant..."
                                        value={
                                            row.plant
                                                ? { value: row.plant, label: row.plant }
                                                : null
                                        }
                                        options={allPlantOptions}
                                        onChange={(selected) => handleChange(index, 'plant', selected?.value || '')}
                                        isClearable
                                    />

                                </td>
                                {!isInward && (



                                    // <td>
                                    //     <input
                                    //         type="text"
                                    //         value={row.saleOrder}
                                    //         onChange={(e) => handleChange(index, 'saleOrder', e.target.value)}
                                    //         placeholder="Enter Sale Order No."
                                    //     />
                                    //     {formErrors[index]?.saleOrder && (
                                    //         <div className={styles.errorMsg}>{formErrors[index].saleOrder}</div>
                                    //     )}
                                    // </td>


                                    <td>
                                        <Select
                                            className={styles.reactSelect}
                                            placeholder="Select sale order..."
                                            value={
                                                row.saleOrder
                                                    ? {
                                                        value: row.saleOrder,
                                                        label:
                                                            salesOrder.find(order => order.sales_order_no === row.saleOrder)?.sales_order_no ||
                                                            row.saleOrder
                                                    }
                                                    : null
                                            }
                                            options={filteredSaleOrderOptions}
                                            onInputChange={(value) => setSaleOrderInputValue(value)}
                                            filterOption={null}
                                            onChange={(selected) => handleChange(index, 'saleOrder', selected?.value || '')}
                                            isClearable
                                            isSearchable
                                        />

                                        {formErrors[index]?.saleOrder && (
                                            <div className={styles.errorMsg}>{formErrors[index].saleOrder}</div>
                                        )}
                                    </td>






                                )}
                                <td>
                                    <input
                                        type="text"
                                        value={row.remarks}
                                        onChange={(e) => handleChange(index, 'remarks', e.target.value)}
                                    />
                                </td>
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
                <button type="button" onClick={addRow} className={styles.addBtn}>
                    Add Row
                </button>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <span className={styles.spinner}></span> Submitting...
                        </>
                    ) : (
                        'Submit'
                    )}
                </button>

            </div>

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />


        </form>

    );
}