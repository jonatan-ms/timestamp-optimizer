#!/usr/bin/env node

/**
 * Simple Benchmark for Timestamp Compression Methods
 */

// Import the enhanced compression module
const enhancedCompression = require('./enhanced_compression.js');

// Basic implementations
function compressMillisBase64(millis) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(millis), 0);
  return buffer.toString('base64');
}

function compressMillisBase36(millis) {
  return millis.toString(36);
}

function compressMillisBase62(millis) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const base = chars.length;
  let result = "";
  let number = millis;

  do {
    result = chars[number % base] + result;
    number = Math.floor(number / base);
  } while (number > 0);

  return result;
}

// Simple size comparison
function compareSize(millis, name, value) {
  const originalSize = millis.toString().length;
  const encodedSize = value.toString().length;
  const savings = originalSize - encodedSize;
  const percent = (savings / originalSize * 100).toFixed(2);

  console.log(`${name.padEnd(20)}: ${value.padEnd(20)} (${encodedSize} chars, ${savings >= 0 ? 'saves' : 'adds'} ${Math.abs(savings)} chars, ${savings >= 0 ? percent : '-' + percent}%)`);
}

// Run tests on different timestamps
function runTests() {
  const timestamps = [
    Date.now(),                                  // Current time
    new Date('2020-01-01T00:00:00Z').getTime(), // Start of 2020
    new Date('2000-01-01T00:00:00Z').getTime(), // Y2K
    1000000000000,                              // 1 trillion milestone (Sept 2001)
    8640000000000000                            // Max JavaScript date value
  ];

  timestamps.forEach((ts, i) => {
    console.log(`\nTimestamp ${i+1}: ${ts} (${new Date(ts).toISOString()})`);
    console.log('-'.repeat(80));

    // Basic methods
    compareSize(ts, 'Base64', compressMillisBase64(ts));
    compareSize(ts, 'Base36', compressMillisBase36(ts));
    compareSize(ts, 'Base62', compressMillisBase62(ts));

    // Enhanced methods
    compareSize(ts, 'Base94', enhancedCompression.compressMillisBase94(ts));
    compareSize(ts, 'Variable-length', enhancedCompression.compressMillisVariable(ts));
    compareSize(ts, 'Bit-packed', enhancedCompression.compressMillisBitPacked(ts));

    // Binary representation (showing byte count)
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(ts));
    console.log(`Binary (64-bit)      : [${buffer.length} bytes]`);

    // Hex representation
    const hex = ts.toString(16);
    compareSize(ts, 'Hexadecimal', hex);
  });

  // Demonstrate series compression with delta encoding
  console.log('\nTIMESTAMP SERIES TEST');
  console.log('-'.repeat(80));
  const series = [Date.now(), Date.now() + 5000, Date.now() + 12000];
  console.log(`Original series: ${JSON.stringify(series)}`);

  // Individual encoding
  const totalIndividualChars = series.map(ts => compressMillisBase62(ts)).join(',').length;
  console.log(`Individual encoding (Base62): ${totalIndividualChars} chars total, ${(totalIndividualChars/series.length).toFixed(2)} chars/timestamp`);

  // Delta encoding
  const deltaEncoding = enhancedCompression.compressTimestampSeries(series);
  console.log(`Delta encoding: ${deltaEncoding} (${deltaEncoding.length} chars total, ${(deltaEncoding.length/series.length).toFixed(2)} chars/timestamp)`);
}

runTests();
