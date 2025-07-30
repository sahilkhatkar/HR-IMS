"use client";

import { useState } from "react";
import styles from "./PlantAnalysis.module.css";
import tableStyles from "./TopInventory.module.css";
import { mockItems } from "./mockData";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

function groupByPlant(items) {
    const m = new Map();
    items.forEach(item => {
        m.has(item.plant_name) ? m.get(item.plant_name).push(item)
            : m.set(item.plant_name, [item]);
    });
    return Array.from(m.entries());
}

export default function PlantPage() {
    const [season, setSeason] = useState("All");
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [search, setSearch] = useState("");

    const filtered = mockItems.filter(item =>
        (season === "All" || item.season === season) &&
        (item.item_code.includes(search) || item.description.toLowerCase().includes(search.toLowerCase()))
    );

    const sorted = [...filtered].sort((a, b) => {
        if (!sortField) return 0;
        return (sortOrder === "asc"
            ? parseFloat(a[sortField]) - parseFloat(b[sortField])
            : parseFloat(b[sortField]) - parseFloat(a[sortField])
        );
    });

    const grouped = groupByPlant(sorted);

    const reset = () => {
        setSeason("All");
        setSortField("");
        setSortOrder("asc");
        setSearch("");
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Plant Analysis Dashboard</h1>

            <div className={styles.controls}>
                <select value={season} onChange={e => setSeason(e.target.value)} className={styles.select}>
                    <option value="All">All Seasons</option>
                    <option>Summer</option><option>Winter</option><option>Monsoon</option>
                </select>

                <select value={sortField} onChange={e => setSortField(e.target.value)} className={styles.select}>
                    <option value="">Sort By</option>
                    <option value="avg_monthly_consumption_normal">Monthly Normal</option>
                    <option value="avg_monthly_consumption_off">Monthly Off</option>
                    <option value="avg_daily_consumption_peak">Daily Peak</option>
                    <option value="lead_time">Lead Time</option>
                </select>

                <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className={styles.select}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>

                <input
                    type="text"
                    placeholder="Search code or description"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={styles.searchInput}
                />

                <button onClick={reset} className={styles.resetBtn}>Reset Filters</button>
            </div>

            {grouped.map(([plantName, items]) => {
                if (items.length === 0) return null;

                const avgNormal = (items.reduce((s, i) => s + parseFloat(i.avg_monthly_consumption_normal), 0) / items.length).toFixed(2);

                // Top 5 inventory items for this plant
                const top5 = [...items]
                    .sort((a, b) => parseFloat(b.avg_monthly_consumption_normal) - parseFloat(a.avg_monthly_consumption_normal))
                    .slice(0, 5);

                const chartData = items.map(i => ({
                    name: i.item_code,
                    normal: parseFloat(i.avg_monthly_consumption_normal)
                })).slice(0, 10);

                return (
                    <div key={plantName} className={styles.plantCard}>
                        <div className={styles.plantName}>{plantName}</div>
                        <p>Total Items: {items.length}</p>

                        <div className={styles.statGrid}>
                            <div className={styles.statItem}><strong>Avg Monthly Normal:</strong> {avgNormal}</div>
                        </div>

                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="normal" fill="#1976d2" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className={tableStyles.tableWrapper}>
                            <table className={tableStyles.table}>
                                <thead className={tableStyles.headerRow}>
                                    <tr>
                                        <th className={tableStyles.headerCell}>Item Code</th>
                                        <th className={tableStyles.headerCell}>Description</th>
                                        <th className={tableStyles.headerCell}>Monthly Normal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {top5.map(item => (
                                        <tr key={item.item_code} className={tableStyles.row}>
                                            <td className={tableStyles.cell}>{item.item_code}</td>
                                            <td className={tableStyles.cell}>{item.description}</td>
                                            <td className={tableStyles.cell}>{item.avg_monthly_consumption_normal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
