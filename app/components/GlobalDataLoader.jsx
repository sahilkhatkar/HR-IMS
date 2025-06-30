// GlobalWrapper.jsx
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMasterData, fetchStockData } from '../../store/slices/gSheetData';

export default function GlobalWrapper({ children }) {
  const dispatch = useDispatch();
  const { masterData, stockData } = useSelector((state) => state.data);

  useEffect(() => {
    if (!masterData) {
      dispatch(fetchMasterData());
    }
    if (!stockData) {
      dispatch(fetchStockData());
    }
  }, [dispatch, masterData, stockData]);

  return <>{children}</>;
}
