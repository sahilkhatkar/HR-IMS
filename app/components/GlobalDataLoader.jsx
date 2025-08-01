// GlobalWrapper.jsx
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMasterData, fetchStockData } from '../../store/slices/gSheetData';
import { setSheetData } from '../../store/slices/masterDataSlice';
import { setLiveStockData } from '../../store/slices/liveStockDataSlice';
import { setFormResponses } from '../../store/slices/formResponsesSlice';
import { setDamageStockResponses } from '../../store/slices/damageItemsEntriesSlice';
import { setSalesOrderData } from '../../store/slices/salesOrderDataSlice';


export default function GlobalWrapper({ children }) {
  const dispatch = useDispatch();
  // const { stockData } = useSelector((state) => state.data);
  const { masterData } = useSelector((state) => state.masterData);
  const { stockData } = useSelector((state) => state.liveStockData);
  const { formResponses } = useSelector((state) => state.formResponses);
  const { damageStockResponses } = useSelector((state) => state.damageStock);
  const { salesOrder } = useSelector((state) => state.salesOrder);

  useEffect(() => {


    const fetchMasterData = async () => {
      try {
        const res = await fetch(`/api/master-data`);
        if (!res.ok) throw new Error('Failed to fetch data');

        const data = await res.json();

        console.log('Fetched sheet data:', data);
        dispatch(setSheetData(data));

      } catch (err) {
        console.error('Error fetching sheet data:', err);
      }
    };

    console.log(masterData.length, "Master Data Length");
    if (masterData.length === 0) {
      fetchMasterData();
    }


    // Live Stock Data
    // const fetchStockData = async () => {
    //   try {
    //     const res = await fetch(`/api/live-stock-data`);
    //     if (!res.ok) throw new Error('Failed to fetch data');

    //     const data = await res.json();
    //     console.log('Fetched sheet data:', data);
    //     // dispatch(setLiveStockData(data));

    //   } catch (err) {
    //     console.error('Error fetching sheet data:', err);
    //   }
    // };

    // console.log(stockData.length, "Stock Data Length");
    // if (stockData.length === 0)
    //   fetchStockData();

    // Form Responses Data
    // const fetchFormResponses = async () => {
    //   try {
    //     const res = await fetch(`/api/form-responses-stock-data`);
    //     if (!res.ok) throw new Error('Failed to fetch data');

    //     const data = await res.json();
    //     // console.log('Fetched sheet data:', data);
    //     dispatch(setFormResponses(data));

    //     return data;
    //   } catch (err) {
    //     console.error('Error fetching sheet data:', err);
    //   }
    // };

    // console.log(formResponses.length, "Form Responses Length");
    // if (formResponses.length === 0) {
    //   fetchFormResponses();
    // }























    // Live Stock Data
    const fetchStockData = async () => {
      try {
        // Fetch live stock data
        const res = await fetch(`/api/live-stock-data`);
        if (!res.ok) throw new Error('Failed to fetch live stock data');
        const liveStockData = await res.json();

        // Fetch form responses
        const resFormResponses = await fetch(`/api/form-responses-stock-data`);
        if (!resFormResponses.ok) throw new Error('Failed to fetch form responses');
        const formResponses = await resFormResponses.json();

        dispatch(setFormResponses(formResponses));

        // Step 1: Get latest unique form response per item_code
        const uniqueMap = new Map();  // item_code → object
        for (let i = formResponses.length - 1; i >= 0; i--) {
          const item = formResponses[i];
          if (!uniqueMap.has(item.item_code)) {
            uniqueMap.set(item.item_code, item);
          }
        }

        // Step 2: Enhance liveStockData with age (in days)
        const today = new Date();
        const enhancedData = liveStockData.map(stockItem => {
          const formItem = uniqueMap.get(stockItem.item_code);

          if (!formItem || !formItem.date) {
            return { ...stockItem, age: "" };
          }

          const itemDate = new Date(formItem.date);
          const diffTime = today - itemDate;
          const ageInDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          return { ...stockItem, age: Number(ageInDays) };
        });

        console.log("Data with age", enhancedData);
        dispatch(setLiveStockData(enhancedData));

      } catch (err) {
        console.error('Error fetching stock data:', err);
      }
    };

    // Call function if needed
    if (stockData.length === 0 || formResponses.length === 0) {
      fetchStockData();
    }










    const fetchDamageStockData = async () => {
      try {
        const res = await fetch(`/api/damage-stock-entries-data`);
        if (!res.ok) throw new Error('Failed to fetch data');

        const data = await res.json();
        // console.log('Fetched sheet data:', data);

        dispatch(setDamageStockResponses(data));

      } catch (err) {
        console.error('Error fetching sheet data:', err);
      }
    };

    console.log(damageStockResponses.length, "Damage Stock Responses Length");
    if (damageStockResponses.length === 0) {
      fetchDamageStockData();
    }

    const fetchSalesOrderData = async () => {
      try {
        const res = await fetch(`/api/sales-order-data`);
        if (!res.ok) throw new Error('Failed to fetch data');

        const data = await res.json();
        console.log('Fetched Sales Order data:', data);

        dispatch(setSalesOrderData(data));

      } catch (err) {
        console.error('Error fetching sheet data:', err);
      }
    };

    console.log(salesOrder.length, "Sales Order Responses Length");
    if (salesOrder.length === 0) {
      fetchSalesOrderData();
    }

    //   if (!masterData || masterData.length === 0) {
    //   dispatch(fetchMasterData());
    // }

    // if (!masterData) {
    //   dispatch(fetchMasterData());
    // }
    // if (!stockData) {
    //   dispatch(fetchStockData());
    // }
  }, [dispatch, masterData]);

  return <>{children}</>;
}
