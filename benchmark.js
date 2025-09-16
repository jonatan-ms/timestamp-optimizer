#!/usr/bin/env node

/**
 * Benchmark Script for Timestamp Compression Methods
 *
 * This script runs all compression methods on a variety of timestamps
 * and reports on their efficiency, size, and performance.
 */

// Import the enhanced compression module
const enhancedCompression = require('./enhanced_compression.js');

// Import individual functions directly to avoid issues
function compressMillisBase64(millis) {
  // Convert to a buffer (8 bytes for a 64-bit integer)
  const buffer = Buffer.alloc(8);

  // Write the number as a 64-bit big-endian integer
  buffer.writeBigInt64BE(BigInt(millis), 0);

  // Convert to base64
  return buffer.toString('base64');
}

function compressMillisCustom(millis) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  const base = chars.length;

  // Convert to Base36
  let result = "";
  let number = millis;

  do {
    result = chars[number % base] + result;
    number = Math.floor(number / base);
  } while (number > 0);

  return result;
}

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

function compressSplitDaysTime(millis) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const base = chars.length; // 62

  // Split into days since epoch and milliseconds since midnight
  const daysSinceEpoch = Math.floor(millis / (24 * 60 * 60 * 1000));
  const midnight = new Date(new Date(millis).setHours(0, 0, 0, 0)).getTime();
  const millisSinceMidnight = millis - midnight;

  // Convert days to Base62
  let daysResult = "";
  let daysNumber = daysSinceEpoch;

  do {
    daysResult = chars[daysNumber % base] + daysResult;
    daysNumber = Math.floor(daysNumber / base);
  } while (daysNumber > 0);

  // Convert milliseconds since midnight to Base62
  let timeResult = "";
  let timeNumber = millisSinceMidnight;

  do {
    timeResult = chars[timeNumber % base] + timeResult;
    timeNumber = Math.floor(timeNumber / base);
  } while (timeNumber > 0);

  // Add a separator between the two components - using ":" as it's readable and common for time
  return daysResult + ":" + timeResult;
}

/**
 * Function to generate a range of test timestamps
 * @returns {Array} Array of test timestamps
 */
function generateTestTimestamps() {
  const timestamps = [];

  // Current time
  timestamps.push(Date.now());

  // Recent timestamps (past week)
  const now = Date.now();
  timestamps.push(now - 1000 * 60 * 60 * 24 * 1); // 1 day ago
  timestamps.push(now - 1000 * 60 * 60 * 24 * 7); // 1 week ago

  // Timestamps from different periods
  timestamps.push(new Date('2020-01-01').getTime());  // Beginning of 2020
  timestamps.push(new Date('2000-01-01').getTime());  // Y2K
  timestamps.push(new Date('1980-01-01').getTime());  // 1980
  timestamps.push(new Date('1970-01-01').getTime() + 100000);  // Just after epoch

  // Future timestamps
  timestamps.push(now + 1000 * 60 * 60 * 24 * 365);  // 1 year in future

  // Very large timestamp
  timestamps.push(8640000000000000); // Max date - JavaScript limit

  // 20 timestamps per day during a period of 60 days starting from 2023-01-01
  const start = new Date('2023-01-01').getTime();
  for (let i = 0; i < 60 * 20; i++) {
    timestamps.push(start + i * (60 * 24 * 60 * 60 * 1000) / (60 * 20)); // Spread over 60 days
  }

  // Return the array of timestamps
  return timestamps;
}

/**
 * Get size information about a representation
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
    efficiency = `Saved ${saving} chars (${savingPercent.toFixed(2)}%)`;
  } else {
    efficiency = `Increased by ${Math.abs(saving)} chars (${Math.abs(savingPercent).toFixed(2)}%)`;
  }

  return {
    originalSize: originalBytes,
    representationSize: representationBytes,
    efficiency,
    savingPercent
  };
}

/**
 * Run benchmark for all methods
 */
function runBenchmark() {
  const timestamps = generateTestTimestamps();
  const results = {};

  console.log(`Running benchmark on ${timestamps.length} timestamps...`);
  console.log("-".repeat(80));

  // Define the methods we want to test
  const methods = [
    { name: 'Base64', func: compressMillisBase64 },
    { name: 'Base36', func: compressMillisCustom },
    { name: 'Base62', func: compressMillisBase62 },
    { name: 'Split Base62', func: compressSplitDaysTime },
    { name: 'Base94', func: enhancedCompression.compressMillisBase94 },
    { name: 'Variable', func: enhancedCompression.compressMillisVariable },
    { name: 'BitPacked', func: enhancedCompression.compressMillisBitPacked }
  ];

  // Initialize results
  methods.forEach(method => {
    results[method.name] = {
      totalSavingPercent: 0,
      avgSize: 0,
      totalSize: 0,
      totalTime: 0,
      avgTime: 0,
      examples: []
    };
  });

  // Process each timestamp
  console.log(`Processing ${timestamps.length} timestamps...`);
  process.stdout.write(`[0%`);

  timestamps.forEach((timestamp, index) => {
    // Show progress every 10%
    if ((index + 1) % Math.max(1, Math.floor(timestamps.length / 10)) === 0) {
      const progress = ((index + 1) / timestamps.length * 100).toFixed(0);
      process.stdout.write(`...${progress}%`);
    }

    // For each method, run the compression and store results
    methods.forEach(method => {
      const start = performance.now();
      const compressed = method.func(timestamp);
      const end = performance.now();

      const info = getSizeInfo(timestamp, compressed);
      const timeTaken = end - start;

      results[method.name].totalSavingPercent += info.savingPercent;
      results[method.name].totalSize += info.representationSize;
      results[method.name].totalTime += timeTaken;

      // Store example (only for first few timestamps)
      if (index < 3) {
        results[method.name].examples.push({
          timestamp,
          timestamp_iso: new Date(timestamp).toISOString(),
          compressed,
          size: info.representationSize,
          timeTaken: (end - start).toFixed(3)
        });
      }
    });
  });

  console.log(`...100%]`);
  console.log("-".repeat(80));

  // Calculate averages
  Object.keys(results).forEach(method => {
    results[method].avgSavingPercent = results[method].totalSavingPercent / timestamps.length;
    results[method].avgSize = results[method].totalSize / timestamps.length;
    results[method].avgTime = results[method].totalTime / timestamps.length;
  });

  // Print summary
  console.log("\nSUMMARY OF RESULTS");
  console.log("=".repeat(80));
  console.log("Method".padEnd(15) + "Avg Size".padEnd(15) + "Avg Saving %".padEnd(15) + "Avg Time (ms)".padEnd(15));
  console.log("-".repeat(80));

  // Sort methods by average size (most efficient first)
  const sortedMethods = Object.keys(results).sort((a, b) => {
    return results[a].avgSize - results[b].avgSize;
  });

  sortedMethods.forEach(method => {
    console.log(
      method.padEnd(15) +
      results[method].avgSize.toFixed(2).padEnd(15) +
      results[method].avgSavingPercent.toFixed(2).padEnd(15) + "%" +
      results[method].avgTime.toFixed(3).padEnd(15)
    );
  });

  // Print example compressions for the first timestamp
  if (sortedMethods.some(m => results[m].examples && results[m].examples.length > 0)) {
    console.log("\nEXAMPLE COMPRESSIONS (first timestamp)");
    console.log("=".repeat(80));
    const firstMethod = sortedMethods[0];
    if (results[firstMethod].examples && results[firstMethod].examples.length > 0) {
      const example = results[firstMethod].examples[0];
      console.log(`Timestamp: ${example.timestamp} (${example.timestamp_iso || new Date(example.timestamp).toISOString()})`);
      console.log("-".repeat(80));
      sortedMethods.forEach(method => {
        if (results[method].examples && results[method].examples.length > 0) {
          const ex = results[method].examples[0];
          console.log(`${method.padEnd(15)}: ${ex.compressed.padEnd(20)} (${ex.size} chars, ${ex.timeTaken}ms)`);
        }
      });
      console.log("-".repeat(80));
    }
  }

  // Save results to JSON file for comparison
  const fs = require('fs');
  fs.writeFileSync('js_benchmark_results.json', JSON.stringify(results, null, 2));
}

runBenchmark();
