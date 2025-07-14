// GlobalWrapper.jsx
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMasterData, fetchStockData } from '../../store/slices/gSheetData';
import { setSheetData } from '../../store/slices/masterDataSlice';
import { setLiveStockData } from '../../store/slices/liveStockDataSlice';
import { setFormResponses } from '../../store/slices/formResponsesSlice';
import { setDamageStockResponses } from '../../store/slices/damageItemsEntriesSlice';


export default function GlobalWrapper({ children }) {
  const dispatch = useDispatch();
  // const { stockData } = useSelector((state) => state.data);
  const { masterData } = useSelector((state) => state.masterData);
  const { stockData } = useSelector((state) => state.liveStockData);
  const { formResponses } = useSelector((state) => state.formResponses);
  const { damageStockResponses } = useSelector((state) => state.damageStock);

  useEffect(() => {


    const fetchMasterData = async () => {
      try {
        const res = await fetch(`/api/master-data`);
        if (!res.ok) throw new Error('Failed to fetch data');

        const data = await res.json();

        dispatch(setSheetData(data));

      } catch (err) {
        console.error('Error fetching sheet data:', err);
      }
    };

    console.log(masterData.length, "Master Data Length");
    if (masterData.length === 0) {
      fetchMasterData();
    }

    const fetchStockData = async () => {
      try {
        const res = await fetch(`/api/live-stock-data`);
        if (!res.ok) throw new Error('Failed to fetch data');

        const data = await res.json();
        // console.log('Fetched sheet data:', data);

        dispatch(setLiveStockData(data));

      } catch (err) {
        console.error('Error fetching sheet data:', err);
      }
    };

    console.log(stockData.length, "Stock Data Length");
    if (stockData.length === 0) {
      fetchStockData();
    }

    const fetchFormResponses = async () => {
      try {
        const res = await fetch(`/api/form-responses-stock-data`);
        if (!res.ok) throw new Error('Failed to fetch data');

        const data = await res.json();
        // console.log('Fetched sheet data:', data);

        dispatch(setFormResponses(data));

      } catch (err) {
        console.error('Error fetching sheet data:', err);
      }
    };

    console.log(formResponses.length, "Form Responses Length");
    if (formResponses.length === 0) {
      fetchFormResponses();
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

    //   if (!masterData || masterData.length === 0) {
    //   dispatch(fetchMasterData());
    // }

    // if (!masterData) {
    //   dispatch(fetchMasterData());
    // }
    // if (!stockData) {
    //   dispatch(fetchStockData());
    // }
  }, [dispatch, masterData
    // , stockData

  ]);

  return <>{children}</>;
}
