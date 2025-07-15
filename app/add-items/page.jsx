'use client';

import AddItemsForm from '../components/AddItemsForm'; // renamed!
import { useData } from '../DataProvider'; // make sure this path is correct
import { useSelector } from 'react-redux';

export default function AddItemsPage() {
    // const { data } = useData();

    // Using REDUX Toolkit
    // const { masterData, loading1, error1 } = useSelector((state) => state.data);
    const { masterData, loading1, error1 } = useSelector((state) => state.masterData);
    // End

    const getUniqueValues = (field) => {
        const values = masterData?.map((item) => item[field]).filter(Boolean);
        return [...new Set(values)];
    };

    const handleAddItems = (items) => {
        console.log('Submitted Items:', items);
        // submit items to API or backend
    };

    return (
        <AddItemsForm
            onSubmit={handleAddItems}
            pack_sizeOptions={getUniqueValues('pack_size')}
            pack_typeOptions={getUniqueValues('pack_type')}
            hsn_codeOptions={getUniqueValues('hsn_code')}
            unitOptions={getUniqueValues('unit')}
            plant_nameOptions={getUniqueValues('plant_name')}
            lead_timeOptions={getUniqueValues('lead_time')}
            seasonOptions={['Peak', 'Off', 'Normal']}
        />
    );
}
