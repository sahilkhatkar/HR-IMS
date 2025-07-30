// lib/mockData.js

const plants = ["Plant A", "Plant B", "Plant C", "Plant D", "Plant E"];

function getRandomNumber(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

export const mockItems = Array.from({ length: 50 }, (_, i) => ({
  avg_daily_consumption_peak: getRandomNumber(100, 500),
  avg_monthly_consumption_normal: getRandomNumber(1000, 3000),
  avg_monthly_consumption_off: getRandomNumber(800, 2500),
  brand: `Brand ${String.fromCharCode(65 + (i % 5))}`,
  description: `Item ${i + 1} - BOPP Bag 20Kg`,
  hsn_code: "3923",
  item_code: `ITEM${i + 1}`,
  lead_time: `${10 + (i % 10)}`,
  max_level: getRandomNumber(500, 1500),
  pack_size: "20Kg",
  pack_type: "BOPP",
  plant_name: plants[i % 5],
  safety_factor: getRandomNumber(1.2, 2),
  season: ["Summer", "Winter", "Monsoon"][i % 3],
  unit: "Kg",
}));
