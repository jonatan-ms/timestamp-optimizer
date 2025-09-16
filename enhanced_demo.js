#!/usr/bin/env node

/**
 * Enhanced Timestamp Compression Demo
 *
 * This script demonstrates the additional compression methods from enhanced_compression.js
 * and compares them with the existing methods.
 */

// Import the enhanced compression methods
const enhancedCompression = require('./enhanced_compression.js');

// Define the base62 function directly to avoid import issues
function compressMillisBase62(millis) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const base = chars.length; // 62

  // Convert to Base62
  let result = "";
  let number = millis;

  do {
    result = chars[number % base] + result;
    number = Math.floor(number / base);
  } while (number > 0);

  return result;
}

/**
 * Calculate size information about a representation
 * @param {number} original - Original milliseconds value
 * @param {string} representation - The encoded representation
 * @returns {object} Size and efficiency information
 */
function getSizeInfo(original, representation) {
  const originalBytes = original.toString().length;
  const representationBytes = representation.toString().length;
  const saving = originalBytes - representationBytes;
  const savingPercent = originalBytes > 0 ? (saving / originalBytes) * 100 : 0;

  let efficiency;
  if (saving >= 0) {
    efficiency = `Saved ${saving} characters (${savingPercent.toFixed(2)}%)`;
  } else {
    efficiency = `Increased by ${Math.abs(saving)} characters (${Math.abs(savingPercent).toFixed(2)}%)`;
  }

  return {
    originalSize: originalBytes,
    representationSize: representationBytes,
    efficiency
  };
}

/**
 * Process a timestamp with enhanced compression methods
 * @param {number} millis - milliseconds since epoch
 */
function processTimestampEnhanced(millis) {
  console.log(`Original timestamp: ${millis} milliseconds since epoch`);
  console.log("-".repeat(50));

  // Existing Base62 method for comparison
  const base62Repr = compressMillisBase62(millis);
  const base62Info = getSizeInfo(millis, base62Repr);
  console.log(`Base62 representation (existing): ${base62Repr}`);
  console.log(`Size: ${base62Info.representationSize} chars, ${base62Info.efficiency}`);
  console.log("-".repeat(50));

  // Enhanced Method 1: Base94 compression
  const base94Repr = enhancedCompression.compressMillisBase94(millis);
  const base94Info = getSizeInfo(millis, base94Repr);
  console.log(`Base94 representation: ${base94Repr}`);
  console.log(`Size: ${base94Info.representationSize} chars, ${base94Info.efficiency}`);
  console.log("-".repeat(50));

  // Enhanced Method 2: Variable-length compression
  const variableRepr = enhancedCompression.compressMillisVariable(millis);
  const variableInfo = getSizeInfo(millis, variableRepr);
  console.log(`Variable-length representation: ${variableRepr}`);
  console.log(`Size: ${variableInfo.representationSize} chars, ${variableInfo.efficiency}`);
  console.log("-".repeat(50));

  // Enhanced Method 3: Bit-packed compression
  const bitPackedRepr = enhancedCompression.compressMillisBitPacked(millis);
  const bitPackedInfo = getSizeInfo(millis, bitPackedRepr);
  console.log(`Bit-packed representation: ${bitPackedRepr}`);
  console.log(`Size: ${bitPackedInfo.representationSize} chars, ${bitPackedInfo.efficiency}`);
  console.log("-".repeat(50));

  // Enhanced Method 4: Delta encoding (using a series for demonstration)
  const series = [millis, millis + 5000, millis + 12000];
  const seriesRepr = enhancedCompression.compressTimestampSeries(series);
  console.log("Timestamp Series:");
  console.log(`Original series: [${series.join(", ")}]`);
  console.log(`Delta encoded: ${seriesRepr}`);
  console.log(`Size: ${seriesRepr.length} chars for 3 timestamps (avg: ${(seriesRepr.length / 3).toFixed(2)} per timestamp)`);
  console.log("-".repeat(50));

  // Summary
  console.log("Summary of enhanced representations:");
  console.log(`1. Original:          ${millis} (${millis.toString().length} chars)`);
  console.log(`2. Base62 (existing): ${base62Repr} (${base62Info.representationSize} chars)`);
  console.log(`3. Base94:            ${base94Repr} (${base94Info.representationSize} chars)`);
  console.log(`4. Variable-length:   ${variableRepr} (${variableInfo.representationSize} chars)`);
  console.log(`5. Bit-packed:        ${bitPackedRepr} (${bitPackedInfo.representationSize} chars)`);
}

/**
 * Main function to handle CLI arguments
 */
function main() {
  // Get milliseconds from command line arguments or use current time
  let millis;

  if (process.argv.length > 2) {
    millis = parseInt(process.argv[2], 10);
    if (isNaN(millis)) {
      console.error("Error: Please provide a valid integer for milliseconds.");
      process.exit(1);
    }
  } else {
    // Use current time if no argument provided
    millis = Date.now();
    console.log("No timestamp provided. Using current time.");
  }

  processTimestampEnhanced(millis);
}

// Run the main function
main();
