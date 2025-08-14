'use client';

import React, { useState } from 'react';
import styles from './TestingTable.module.css';
import Dropdown from '../components/CustomDropdown';

export default function TestingPage() {
  const [selectedOption, setSelectedOption] = useState('Option 1');

  return (
    <div className={styles.container}>
      <Dropdown
        options={['Option 1', 'Option 2', 'Option 3']}
        selected={selectedOption}
        onSelect={(option) => {
          setSelectedOption(option);
          console.log(`Selected: ${option}`);
        }}
        label="Select an option"
      />
    </div>
  );
}
