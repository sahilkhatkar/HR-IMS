'use client';

import { useState, useMemo } from 'react';
import './Store.module.css';

const sampleData = [
  { item_code: '11BBB20KG', description: '11 Brand Bopp Bag 20Kg', pack_size: '20Kg', pack_type: 'BOPP', hsn_code: '3923', plant: 'Plant Alpha', quantity: 150, value: 45000 },
  { item_code: '786S1B39KG', description: '786 S-Gold 1121 Bopp 39Kg', pack_size: '39Kg', pack_type: 'BOPP', hsn_code: '3923', plant: 'Plant Beta', quantity: 89, value: 67000 },
  { item_code: 'ABUJBB20KG', description: 'Abu Jadeed Brand Bopp Bag Of 20Kg', pack_size: '20Kg', pack_type: 'BOPP', hsn_code: '3923', plant: 'Plant Alpha', quantity: 200, value: 56000 },
  { item_code: 'ABUJBB35KG', description: 'Abu Jadeed Brand Bopp Bag Of 35Kg', pack_size: '35Kg', pack_type: 'BOPP', hsn_code: '3923', plant: 'Plant Gamma', quantity: 120, value: 78000 },
  { item_code: 'ABUJBB5KG', description: 'Abu Jadeed Brand Bopp Bag Of 5Kg', pack_size: '5KG', pack_type: 'BOPP', hsn_code: '3923', plant: 'Plant Alpha', quantity: 300, value: 25000 },
  { item_code: 'ACANBBB25KG', description: 'Acan Brand Bopp Bag 25Kg', pack_size: '25Kg', pack_type: 'BOPP', hsn_code: '3923', plant: 'Plant Beta', quantity: 180, value: 52000 },
  { item_code: 'ALEB220KG', description: 'Al Eryaf Bopp 20Kg ( 1121 Creamy )', pack_size: '20 Kg', pack_type: 'BOPP', hsn_code: '3923', plant: 'Plant Gamma', quantity: 95, value: 41000 },
  { item_code: 'ALEB220KG-1', description: 'Al Eryaf Bopp 20Kg ( Sugandha Creamy )', pack_size: '20 Kg', pack_type: 'BOPP', hsn_code: '3923', plant: 'Plant Alpha', quantity: 160, value: 48000 },
  { item_code: 'ALFB(10KG', description: 'Al Fakhama Bopp (Blue) 10Kg', pack_size: '10KG', pack_type: 'BOPP', hsn_code: '3923', plant: 'Plant Beta', quantity: 250, value: 32000 },
  { item_code: 'ALFB(10KG-1', description: 'Al Fakhama Bopp (Green) 10Kg', pack_size: '10KG', pack_type: 'BOPP', hsn_code: '3923', plant: 'Plant Gamma', quantity: 220, value: 29000 },
];

export default function StorePage() {
  const [selectedPlant, setSelectedPlant] = useState('All');
  const [sortBy, setSortBy] = useState('quantity');
  const [viewMode, setViewMode] = useState('cards');

  const plantAnalytics = useMemo(() => {
    const analytics = {};
    sampleData.forEach(item => {
      const p = analytics[item.plant] ||= { totalItems: 0, totalQuantity: 0, totalValue: 0, items: [], packSizes: new Set(), avgValue: 0 };
      p.totalItems += 1;
      p.totalQuantity += item.quantity;
      p.totalValue += item.value;
      p.items.push(item);
      p.packSizes.add(item.pack_size);
    });
    Object.keys(analytics).forEach(plant => {
      const p = analytics[plant];
      p.avgValue = Math.round(p.totalValue / p.totalItems);
      p.packSizes = Array.from(p.packSizes);
    });
    return analytics;
  }, []);

  const plants = Object.keys(plantAnalytics);
  const totalPlants = plants.length;
  const totalItems = sampleData.length;
  const totalQuantity = sampleData.reduce((sum, i) => sum + i.quantity, 0);
  const totalValue = sampleData.reduce((sum, i) => sum + i.value, 0);

  const filteredData = selectedPlant === 'All'
    ? sampleData
    : sampleData.filter(item => item.plant === selectedPlant);

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'quantity') return b.quantity - a.quantity;
    if (sortBy === 'value') return b.value - a.value;
    if (sortBy === 'pack_size') return parseFloat(a.pack_size) - parseFloat(b.pack_size);
    return a.description.localeCompare(b.description);
  });

  const overviewCards = [
    { num: totalPlants, label: 'Active Plants', trend: '↗ 12%', width: '85%' },
    { num: totalItems, label: 'SKU Items', trend: '↗ 8%', width: '92%' },
    { num: `${(totalQuantity / 1000).toFixed(1)}K`, label: 'Total Units', trend: '↗ 15%', width: '78%' },
    { num: `₹${(totalValue / 100000).toFixed(1)}L`, label: 'Portfolio Value', trend: '↗ 23%', width: '95%' },
  ];
  const cardKeys = ['primary', 'secondary', 'tertiary', 'quaternary'];

  return (
    <div className="store-container">
      <div className="background-animation">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
        <div className="floating-orb orb-3" />
        <div className="floating-orb orb-4" />
      </div>

      <div className="hero-header">
        <div className="hero-content">
          <div className="hero-badge"><span className="pulse-dot" /> Live Dashboard</div>
          <h1 className="hero-title">
            Store Intelligence <span className="gradient-text">Analytics</span>
          </h1>
          <p className="hero-subtitle">
            Advanced plant‑wise inventory management with real‑time insights and predictive analytics
          </p>
        </div>
        <div className="hero-visual">
          <div className="hologram-effect">
            <div className="hologram-ring ring-1" />
            <div className="hologram-ring ring-2" />
            <div className="hologram-ring ring-3" />
            <div className="hologram-center">📊</div>
          </div>
        </div>
      </div>

      <div className="overview-section">
        <div className="section-header">
          <h2>Performance Overview</h2>
          <div className="header-line" />
        </div>
        <div className="glass-grid">
          {overviewCards.map((card, idx) => (
            <div key={idx} className={`glass-card card-${cardKeys[idx]}`}>
              <div className="card-glow" />
              <div className="card-header">
                <div className="card-icon"><div className="icon-wrapper">💼</div></div>
                <div className="card-trend positive">{card.trend}</div>
              </div>
              <div className="card-content">
                <h3 className="card-number">{card.num}</h3>
                <p className="card-label">{card.label}</p>
                <div className="card-progress"><div className="progress-bar" style={{ width: card.width }} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <div className="section-header">
          <h2>Plant Performance Matrix</h2>
          <div className="header-line" />
        </div>
        <div className="plant-matrix">
          {plants.map((plant, idx) => {
            const data = plantAnalytics[plant];
            const score = Math.round((data.totalValue / totalValue) * 100);
            return (
              <div key={plant} className="plant-card-3d" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="card-inner">
                  <div className="card-front">
                    <div className="plant-header-3d">
                      <div className="plant-avatar">{plant.split(' ')[1]?.charAt(0) || 'P'}</div>
                      <div className="plant-info">
                        <h3>{plant}</h3>
                        <div className="performance-ring">
                          <svg viewBox="0 0 36 36" className="circular-chart">
                            <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="circle" strokeDasharray={`${score},100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <text x="18" y="20.35" className="percentage">{score}%</text>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="plant-metrics">
                      <div className="metric">
                        <div className="metric-icon">📋</div>
                        <span className="metric-value">{data.totalItems}</span>
                        <span className="metric-label">Items</span>
                      </div>
                      <div className="metric">
                        <div className="metric-icon">📊</div>
                        <span className="metric-value">{(data.totalQuantity / 1000).toFixed(1)}K</span>
                        <span className="metric-label">Units</span>
                      </div>
                      <div className="metric">
                        <div className="metric-icon">💰</div>
                        <span className="metric-value">₹{(data.totalValue / 1000).toFixed(0)}K</span>
                        <span className="metric-label">Value</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="controls-panel">
        <div className="panel-header">
          <h3>Control Center</h3>
          <div className="view-toggle">
            <button className={viewMode === 'cards' ? 'active' : ''} onClick={() => setViewMode('cards')}>
              <span className="toggle-icon">⊞</span>Cards
            </button>
            <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>
              <span className="toggle-icon">☰</span>Table
            </button>
          </div>
        </div>
        <div className="controls-content">
          <div className="filter-group-advanced">
            <label>Plant Filter</label>
            <div className="select-wrapper">
              <select value={selectedPlant} onChange={e => setSelectedPlant(e.target.value)}>
                <option value="All">All Plants</option>
                {plants.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div className="select-arrow">▼</div>
            </div>
          </div>
          <div className="filter-group-advanced">
            <label>Sort Criteria</label>
            <div className="select-wrapper">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="quantity">Quantity</option>
                <option value="value">Value</option>
                <option value="pack_size">Pack Size</option>
                <option value="description">Description</option>
              </select>
              <div className="select-arrow">▼</div>
            </div>
          </div>
          <div className="results-badge">
            <span className="badge-dot" />
            {filteredData.length} Results{selectedPlant !== 'All' && ` • ${selectedPlant}`}
          </div>
        </div>
      </div>

      <div className="data-section">
        {viewMode === 'cards' ? (
          <div className="inventory-grid">
            {sortedData.map((item, idx) => (
              <div key={item.item_code} className="inventory-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="card-ribbon">
                  <span className={`plant-badge plant-${item.plant.toLowerCase().replace(' ', '-')}`}>
                    {item.plant.split(' ')[1]}
                  </span>
                </div>
                <div className="inventory-header">
                  <div className="item-code-display">{item.item_code}</div>
                  <div className="hsn-code">{item.hsn_code}</div>
                </div>
                <div className="inventory-body">
                  <h4 className="item-description">{item.description}</h4>
                  <div className="item-specs">
                    <div className="spec"><span className="spec-icon">📏</span><span className="spec-value">{item.pack_size}</span></div>
                    <div className="spec"><span className="spec-icon">📦</span><span className="spec-value">{item.pack_type}</span></div>
                  </div>
                </div>
                <div className="inventory-footer">
                  <div className="quantity-display"><span className="quantity-label">Qty</span><span className="quantity-value">{item.quantity.toLocaleString()}</span></div>
                  <div className="value-display"><span className="value-label">Value</span><span className="value-amount">₹{(item.value / 1000).toFixed(0)}K</span></div>
                </div>
                <div className="card-glow-effect" />
              </div>
            ))}
          </div>
        ) : (
          <div className="table-wrapper">
            <div className="table-container-modern">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th><span className="th-content">Item Code</span></th>
                    <th><span className="th-content">Description</span></th>
                    <th><span className="th-content">Plant</span></th>
                    <th><span className="th-content">Pack Size</span></th>
                    <th><span className="th-content">Type</span></th>
                    <th><span className="th-content">Quantity</span></th>
                    <th><span className="th-content">Value</span></th>
                    <th><span className="th-content">HSN</span></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((item, idx) => (
                    <tr key={item.item_code} style={{ animationDelay: `${idx * 0.02}s` }}>
                      <td><div className="code-cell">{item.item_code}</div></td>
                      <td><div className="desc-cell">{item.description}</div></td>
                      <td><span className={`modern-plant-tag plant-${item.plant.toLowerCase().replace(' ', '-')}`}>{item.plant}</span></td>
                      <td><div className="size-cell">{item.pack_size}</div></td>
                      <td><div className="type-badge">{item.pack_type}</div></td>
                      <td><div className="quantity-cell">{item.quantity.toLocaleString()}</div></td>
                      <td><div className="value-cell">₹{item.value.toLocaleString()}</div></td>
                      <td><div className="hsn-cell">{item.hsn_code}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



// import React from 'react'

// export default function Store() {
//   return (
//     <div>Under Process</div>
//   )
// }
