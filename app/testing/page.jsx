import React from 'react';
import Table from './Table';
import styles from './TestingTable.module.css';

export default function TestingPage() {
  return (
    <div className={styles.container}>
      <h1>Properties</h1>
      <Table />
    </div>
  );
}
