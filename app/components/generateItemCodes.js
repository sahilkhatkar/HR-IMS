// utils/generateItemCodes.js

function createBaseCode(name) {
  const clean = name.replace(/\(.*?\)/g, "").trim().toUpperCase();
  const words = clean.split(/\s+/);

  // Brand
  let brand = words[0];
  if (words[1] && words[1] === "BRAND") {
    brand += words[1][0];
  }

  // Short initials
  let short = "";
  for (let j = 1; j < words.length; j++) {
    const word = words[j];
    if (
      ["BRAND", "CARTON", "MASTER", "PACK", "FOR", "JAR", "BAG", "BAGS", "OF", "NONWOVEN", "BOPP", "JUTE"].includes(word)
    ) continue;

    if (word.length > 2 && !/^\d/.test(word)) {
      short += word[0];
      if (short.length >= 3) break;
    }
  }

  // Weight
  let weight = "UNK";
  const comboPattern = /(\d{1,2})\s*[X×x]\s*(\d+(?:\.\d+)?)\s*(KG|G|GM|LBS)/i;
  const comboMatch = clean.match(comboPattern);
  if (comboMatch) {
    const qty = comboMatch[1];
    const size = comboMatch[2];
    const unit = comboMatch[3].toUpperCase().replace(/\s+/g, "");
    weight = `${qty}X${size}${unit}`;
  } else {
    const singlePattern = /(\d+(?:\.\d+)?)\s*(KG|G|GM|LBS)/i;
    const singleMatch = clean.match(singlePattern);
    if (singleMatch) {
      const size = singleMatch[1];
      const unit = singleMatch[2].toUpperCase().replace(/\s+/g, "");
      weight = `${size}${unit}`;
    }
  }

  return `${brand}${short}${weight}`;
}

/**
 * Generates unique codes for a list of items.
 * 
 * @param {Array} items - Array of item objects
 * @param {Set<string>} existingCodes - A Set of existing codes (from Redux or backend)
 */
export function generateUniqueItemCodes(items, existingCodes) {
  const allCodes = new Set(existingCodes);

  return items.map((item) => {
    const itemName = item.description;
    if (!itemName) return { ...item };

    let code = createBaseCode(itemName);
    let originalCode = code;
    let suffix = 1;

    while (allCodes.has(code)) {
      code = `${originalCode}-${suffix}`;
      suffix++;
    }

    allCodes.add(code);

    return {
      ...item,
      item_code: code,
    };
  });
}
