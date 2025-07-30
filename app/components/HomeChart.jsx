'use client';

import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import styles from './HomeChart.module.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

export default function HomeChart() {
    const { stockData, loading, error } = useSelector((state) => state.liveStockData);

    if (loading) return <div className={styles.loading}>Loading charts...</div>;
    if (error) return <div className={styles.error}>Error loading data: {error}</div>;
    if (!stockData?.length) return <div className={styles.noData}>No live stock data available.</div>;

    const plantQtyMap = stockData.reduce((acc, curr) => {
        const plant_name = curr.plant_name || 'Unknown';
        acc[plant_name] = (acc[plant_name] || 0) + (parseFloat(curr.unplanned_stock_qty) || 0);
        return acc;
    }, {});

    const barData = {
        labels: Object.keys(plantQtyMap),
        datasets: [
            {
                label: 'Total Stock per Plant',
                data: Object.values(plantQtyMap),
                backgroundColor: '#4CAF50',
                borderRadius: 5,
            },
        ],
    };

    const pieData = {
        labels: Object.keys(plantQtyMap),
        datasets: [
            {
                data: Object.values(plantQtyMap),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#8E44AD',
                    '#2ECC71', '#F39C12', '#1ABC9C', '#E74C3C'
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className={styles.container}>
            <motion.div
                className={styles.chartBox}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
                <h3 className={styles.heading}>Total Stock by Plant</h3>
                <Bar data={barData} />
            </motion.div>

            {/* Uncomment to enable Pie Chart */}
            {/* <motion.div
                className={styles.chartBox}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
            >
                <h3 className={styles.heading}>Stock Distribution by Plant</h3>
                <Pie data={pieData} />
            </motion.div> */}
        </div>
    );
}
