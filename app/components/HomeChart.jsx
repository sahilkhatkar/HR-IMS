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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

export default function HomeChart() {
    const { stockData = [], loading2, error2 } = useSelector((state) => state.data);

    if (loading2) return <div style={{ padding: '2rem' }}>Loading charts...</div>;
    if (error2) return <div style={{ padding: '2rem', color: 'red' }}>Error loading data: {error2}</div>;
    if (!stockData.length) return <div style={{ padding: '2rem' }}>No live stock data available.</div>;

    // ✅ Bar Chart: Quantity per Plant
    const plantQtyMap = stockData.reduce((acc, curr) => {
        const plant_name = curr.plant_name || 'Unknown';
        acc[plant_name] = (acc[plant_name] || 0) + (parseFloat(curr.stock_qty) || 0);
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

    const containerStyle = {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem',
        // backgroundColor: '#f7f9fc',
        borderRadius: '12px',
        // boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    };

    const chartBoxStyle = {
        marginBottom: '3rem',
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    };

    return (
        <div style={containerStyle}>
            {/* <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                📊 Live Inventory Overview
            </motion.h2> */}

            <motion.div
                style={chartBoxStyle}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
                <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Total Stock by Plant</h3>
                <Bar data={barData} />
            </motion.div>

            {/* <motion.div
                style={chartBoxStyle}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
            >
                <h3 style={{ marginBottom: '1rem', color: '#2c3e50', }}>Stock Distribution by Plant</h3>
                <Pie data={pieData}/>
            </motion.div> */}
        </div>
    );
}
