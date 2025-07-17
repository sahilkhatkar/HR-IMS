'use client';

import React from 'react';
import styles from './Table.module.css';
import { motion } from 'framer-motion';

const data = [
  {
    name: 'Rosemary Beach The Sea Psalms 72 New Pro...',
    id: '6948',
    optionSet: 'Default',
    status: 'Validated',
    createdAt: 'Apr 10, 2023 7:20 PM',
  },
  {
    name: 'Seagrove Beach Shore To Have Fun 69 Live...',
    id: '6622',
    optionSet: 'Default',
    status: 'Validated',
    createdAt: 'Apr 7, 2023 7:21 AM',
  },
  {
    name: 'Destin White Pearl 4659 Destiny Way...',
    id: '6651',
    optionSet: 'Default',
    status: 'Validated',
    createdAt: 'Apr 7, 2023 7:21 AM',
  },
  {
    name: 'Seacrest Beach Coastal Comfort 8055 E Cou...',
    id: '6621',
    optionSet: 'Default',
    status: 'Validated',
    createdAt: 'Apr 7, 2023 7:21 AM',
  },
  {
    name: 'Seagrove Beach Mischievous Mermaid 46 Hi...',
    id: '6620',
    optionSet: 'Default',
    status: 'Validated',
    createdAt: 'Apr 7, 2023 7:21 AM',
  },
];

export default function Table() {
  return (
    <motion.table
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={styles.table}
    >
      <thead>
        <tr>
          <th>Name</th>
          <th>PMS Listing ID</th>
          <th>Option Set</th>
          <th>Status</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <motion.tr
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <td>{row.name}</td>
            <td>{row.id}</td>
            <td>{row.optionSet}</td>
            <td>
              <span className={styles.status}>{row.status}</span>
            </td>
            <td>{row.createdAt}</td>
          </motion.tr>
        ))}
      </tbody>
    </motion.table>
  );
}
