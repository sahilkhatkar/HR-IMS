// GlobalWrapper.jsx
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLiveStockData } from '../../store/slices/liveStockDataSlice';
import { setFormResponses } from '../../store/slices/formResponsesSlice';
import { refreshAllData } from '../../store/slices/globalDataWrapper';


export default function GlobalWrapper({ children }) {
  const dispatch = useDispatch();

  const { stockData } = useSelector((state) => state.liveStockData);
  const { formResponses } = useSelector((state) => state.formResponses);

  useEffect(() => {

    // console.log(masterData.length, "Master Data Length");
    // if (masterData.length === 0) {
    //   dispatch(fetchMasterData());
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
    if (stockData.length === 0 || formResponses.length === 0)
      fetchStockData();

    dispatch(refreshAllData());

  }, [dispatch, stockData, formResponses]);

  return <>{children}</>;
}
