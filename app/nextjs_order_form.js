// package.json
{
  "name": "order-form-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "eslint": "^8.57.0",
    "eslint-config-next": "15.0.3"
  }
}

// app/layout.js
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Order Form App',
  description: 'Modern order form with beautiful animations',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'Inter, sans-serif'
        }}>
          {children}
        </div>
      </body>
    </html>
  )
}

// app/page.js
'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '12px',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  fontSize: '16px',
  outline: 'none',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(10px)',
}

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '14px',
  fontWeight: '500',
  letterSpacing: '0.5px'
}

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6,9 12,15 18,9\'%3e%3c/polyline%3e%3c/svg%3e")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '20px',
  paddingRight: '40px'
}

export default function OrderForm() {
  const [formData, setFormData] = useState({
    itemCode: '',
    description: '',
    packSize: '',
    packType: '',
    hsnCode: '',
    unit: '',
    plantName: '',
    avgMonthlyNormal: '',
    avgMonthlyPeak: '',
    avgMonthlyOff: '',
    leadTime: '',
    safetyFactor: '',
    season: '',
    maxLevel: ''
  })

  const [focusedField, setFocusedField] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Order submitted successfully!')
  }

  const getInputStyle = (fieldName) => ({
    ...inputStyle,
    borderColor: focusedField === fieldName ? '#4ade80' : 'rgba(255, 255, 255, 0.2)',
    backgroundColor: focusedField === fieldName ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
    transform: focusedField === fieldName ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: focusedField === fieldName ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.1)'
  })

  const getSelectStyle = (fieldName) => ({
    ...selectStyle,
    borderColor: focusedField === fieldName ? '#4ade80' : 'rgba(255, 255, 255, 0.2)',
    backgroundColor: focusedField === fieldName ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
    transform: focusedField === fieldName ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: focusedField === fieldName ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.1)'
  })

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          width: '100%',
          maxWidth: '1200px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)'
        }}
      >
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 16px 0',
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
          }}>
            Order Form
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.8)',
            margin: 0
          }}>
            Fill in the details to place your order
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            <motion.div variants={itemVariants}>
              <label style={labelStyle}>Item Code</label>
              <input
                type="text"
                name="itemCode"
                value={formData.itemCode}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('itemCode')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('itemCode')}
                placeholder="Enter item code"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label style={labelStyle}>Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('description')}
                placeholder="Enter description"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label style={labelStyle}>Pack Size</label>
              <input
                type="number"
                name="packSize"
                value={formData.packSize}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('packSize')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('packSize')}
                placeholder="Enter pack size"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label style={labelStyle}>Pack Type</label>
              <select
                name="packType"
                value={formData.packType}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('packType')}
                onBlur={() => setFocusedField(null)}
                style={getSelectStyle('packType')}
                required
              >
                <option value="">Select pack type</option>
                <option value="box">Box</option>
                <option value="bag">Bag</option>
                <option value="bottle">Bottle</option>
                <option value="can">Can</option>
                <option value="carton">Carton</option>
                <option value="drum">Drum</option>
                <option value="pallet">Pallet</option>
              </select>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label style={labelStyle}>HSN Code</label>
              <input
                type="text"
                name="hsnCode"
                value={formData.hsnCode}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('hsnCode')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('hsnCode')}
                placeholder="Enter HSN code"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label style={labelStyle}>Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('unit')}
                onBlur={() => setFocusedField(null)}
                style={getSelectStyle('unit')}
                required
              >
                <option value="">Select unit</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="l">Liter (l)</option>
                <option value="ml">Milliliter (ml)</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="m">Meter (m)</option>
                <option value="cm">Centimeter (cm)</option>
                <option value="tons">Tons</option>
              </select>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label style={labelStyle}>Plant Name</label>
              <input
                type="text"
                name="plantName"
                value={formData.plantName}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('plantName')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('plantName')}
                placeholder="Enter plant name"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label style={labelStyle}>Avg Monthly Consumption (Normal)</label>
              <input
                type="number"
                name="avgMonthlyNormal"
                value={formData.avgMonthlyNormal}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('avgMonthlyNormal')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('avgMonthlyNormal')}
                placeholder="Enter normal consumption"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label style={labelStyle}>Avg Monthly Consumption (Peak)</label>
              <input
                type="number"
                name="avgMonthlyPeak"
                value={formData.avgMonthlyPeak}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('avgMonthlyPeak')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('avgMonthlyPeak')}
                placeholder="Enter peak consumption"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label style={labelStyle}>Avg Monthly Consumption (Off)</label>
              <input
                type="number"
                name="avgMonthlyOff"
                value={formData.avgMonthlyOff}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('avgMonthlyOff')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('avgMonthlyOff')}
                placeholder="Enter off-season consumption"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label style={labelStyle}>Lead Time (Days)</label>
              <input
                type="number"
                name="leadTime"
                value={formData.leadTime}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('leadTime')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('leadTime')}
                placeholder="Enter lead time in days"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label style={labelStyle}>Safety Factor (%)</label>
              <input
                type="number"
                name="safetyFactor"
                value={formData.safetyFactor}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('safetyFactor')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('safetyFactor')}
                placeholder="Enter safety factor percentage"
                min="0"
                max="100"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label style={labelStyle}>Season</label>
              <select
                name="season"
                value={formData.season}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('season')}
                onBlur={() => setFocusedField(null)}
                style={getSelectStyle('season')}
                required
              >
                <option value="">Select season</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="monsoon">Monsoon</option>
                <option value="autumn">Autumn</option>
                <option value="winter">Winter</option>
                <option value="year-round">Year Round</option>
              </select>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label style={labelStyle}>Max Level</label>
              <input
                type="number"
                name="maxLevel"
                value={formData.maxLevel}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('maxLevel')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('maxLevel')}
                placeholder="Enter maximum level"
                required
              />
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            style={{
              marginTop: '40px',
              display: 'flex',
              gap: '16px',
              justifyContent: 'center'
            }}
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFormData({
                itemCode: '',
                description: '',
                packSize: '',
                packType: '',
                hsnCode: '',
                unit: '',
                plantName: '',
                avgMonthlyNormal: '',
                avgMonthlyPeak: '',
                avgMonthlyOff: '',
                leadTime: '',
                safetyFactor: '',
                season: '',
                maxLevel: ''
              })}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                backgroundColor: 'transparent',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              Reset Form
            </motion.button>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)'
              }}
            >
              Submit Order
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  )
}

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig