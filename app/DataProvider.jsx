// // context/SettingsContext.tsx
// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';

// const scriptURL = "https://script.google.com/macros/s/AKfycbx-qJ_5XoQbBW7I30RF4KEFPMtqt6MZcUBvdNV1l4I4KUYktMCUbNb9gBrjZ-VlY3cH/exec";

// const DataContext = createContext();

// // export const DataProvider = ({ children, data }) => {
// export const DataProvider = ({ children }) => {

//     const [data, setData] = useState([]);

//     useEffect(() => {
//         const getSettings = async () => {
//             try {
//                 const res = await fetch(scriptURL);
//                 const json = await res.json();
//                 setData(json);
//                 console.log('Fetched settings:', json);
//             } catch (error) {
//                 console.error('Failed to fetch settings:', error);
//             }
//         };


//         getSettings();
//     }, []);


//     return (
//         <DataContext.Provider value={{ data }}>
//             {children}
//         </DataContext.Provider>
//     );
// };

// export const useData = () => {
//     const context = useContext(DataContext);
//     if (!context) {
//         throw new Error('useSettings must be used within a SettingsProvider');
//     }
//     return context;
// };