/**
 * Enhanced Timestamp Compression
 *
 * This file contains additional timestamp compression methods that provide
 * greater compression than the standard implementations.
 */

/**
 * Compress milliseconds into a Base94 string using nearly all printable ASCII characters
 * This provides the highest density for printable ASCII, but may be less compatible
 * with some systems that have restrictions on special characters
 *
 * @param {number} millis - milliseconds since epoch
 * @returns {string} Base94 encoded string
 */
function compressMillisBase94(millis) {
  // Use 94 printable ASCII characters (excluding space, ", ', \, and `)
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&()*+,-./:;<=>?@[]^_{|}~";
  const base = chars.length; // 94

  // Convert to Base94
  let result = "";
  let number = millis;

  do {
    result = chars[number % base] + result;
    number = Math.floor(number / base);
  } while (number > 0);

  return result;
}

/**
 * Variable-length encoding for timestamps
 * Uses fewer characters for more recent timestamps (closer to reference date)
 *
 * @param {number} millis - milliseconds since epoch
 * @param {number} referenceDate - reference date in milliseconds (default: Jan 1, 2020)
 * @returns {string} Variable-length encoded string
 */
function compressMillisVariable(millis, referenceDate = 1577836800000) { // Jan 1, 2020
  // Calculate difference from reference date
  const diff = millis - referenceDate;

  // Encode sign
  const sign = diff >= 0 ? '+' : '-';
  const absDiff = Math.abs(diff);

  // Use Base62 for the absolute difference
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const base = chars.length; // 62

  let result = "";
  let number = absDiff;

  do {
    result = chars[number % base] + result;
    number = Math.floor(number / base);
  } while (number > 0);

  // Return sign + encoded absolute difference
  return sign + result;
}

/**
 * Efficient bit-packed encoding for timestamps
 * Uses separate byte allocations for days (16 bits) and milliseconds (27 bits)
 * More efficient than standard 64-bit encoding
 *
 * @param {number} millis - milliseconds since epoch
 * @returns {string} Base64 encoded string of the bit-packed value
 */
function compressMillisBitPacked(millis) {
  // Split into days and milliseconds
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const days = Math.floor(millis / MS_PER_DAY);
  const msInDay = millis % MS_PER_DAY;

  // Check if days exceeds 16-bit limit (65535)
  if (days > 65535) {
    // For timestamps beyond ~179 years from epoch, fall back to Base62 encoding
    // with a marker to indicate it's not bit-packed
    return "F_" + compressMillisBase62(millis);
  }

  // Create a buffer with 6 bytes (instead of 8)
  const buffer = Buffer.alloc(6);

  // Write 16 bits (2 bytes) for days - supports ~179 years from epoch
  buffer.writeUInt16BE(days, 0);

  // Write 32 bits (4 bytes) for ms in day - only need 27 bits but using full 4 bytes for simplicity
  buffer.writeUInt32BE(msInDay, 2);

  // Convert to base64
  return buffer.toString('base64');
}

/**
 * Delta encoding for a series of timestamps
 * First timestamp is encoded fully, subsequent ones as differences
 *
 * @param {Array<number>} timestamps - Array of millisecond timestamps
 * @returns {string} Encoded string with deltas
 */
function compressTimestampSeries(timestamps) {
  if (timestamps.length === 0) {
    return '';
  }

  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const base = chars.length; // 62

  // Encode first timestamp fully
  let result = compressMillisBase62(timestamps[0]);
  let prev = timestamps[0];

  // Add deltas for subsequent timestamps
  for (let i = 1; i < timestamps.length; i++) {
    const delta = timestamps[i] - prev;
    prev = timestamps[i];

    // Encode delta in base62
    let deltaEncoded = "";
    let number = Math.abs(delta);

    do {
      deltaEncoded = chars[number % base] + deltaEncoded;
      number = Math.floor(number / base);
    } while (number > 0);

    // Add sign for delta
    const signChar = delta >= 0 ? '+' : '-';
    result += signChar + deltaEncoded;
  }

  return result;
}

/**
 * Helper function for Base62 encoding (used by delta encoding)
 */
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

// Export the functions
module.exports = {
  compressMillisBase94,
  compressMillisVariable,
  compressMillisBitPacked,
  compressTimestampSeries
};
