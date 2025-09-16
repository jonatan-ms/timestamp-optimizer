#!/usr/bin/env node

/**
 * Time Compression Utility
 *
 * This script converts millisecond timestamps to different formats:
 * 1. Number of days since 1970 and milliseconds since midnight
 * 2. Compressed formats using alphanumerical characters
 * 3. Shows different representations with information about format and size
 */

/**
 * Convert milliseconds since epoch to days since 1970 and milliseconds since midnight
 * @param {number} millis - milliseconds since epoch
 * @returns {object} Object containing days since epoch and milliseconds since midnight
 */
function millisecondsToDaysAndTime(millis) {
  // Create date object from milliseconds
  const date = new Date(millis);

  // Calculate days since epoch (Jan 1, 1970)
  const epoch = new Date(0); // 0 = Jan 1, 1970
  const daysSinceEpoch = Math.floor((date - epoch) / (24 * 60 * 60 * 1000));

  // Calculate milliseconds since midnight
  const midnight = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const millisSinceMidnight = date - midnight;

  return {
    daysSinceEpoch,
    millisSinceMidnight
  };
}

/**
 * Compress milliseconds into a base64 string
 * @param {number} millis - milliseconds since epoch
 * @returns {string} Base64 encoded string
 */
function compressMillisBase64(millis) {
  // Convert to a buffer (8 bytes for a 64-bit integer)
  const buffer = Buffer.alloc(8);

  // Write the number as a 64-bit big-endian integer
  buffer.writeBigInt64BE(BigInt(millis), 0);

  // Convert to base64
  return buffer.toString('base64');
}

/**
 * Compress milliseconds into a custom base36 format (0-9, a-z)
 * @param {number} millis - milliseconds since epoch
 * @returns {string} Base36 encoded string
 */
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

/**
 * Compress milliseconds into a base62 format (0-9, a-z, A-Z)
 * This is the most compact alphanumeric representation possible
 * where case sensitivity is preserved (lowercase != uppercase)
 * @param {number} millis - milliseconds since epoch
 * @returns {string} Base62 encoded string
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

/**
 * Compress timestamp by splitting into days since epoch and milliseconds since midnight,
 * then encode each component separately using base62
 * @param {number} millis - milliseconds since epoch
 * @returns {string} Compact base62 encoded string with day and time components
 */
function compressSplitDaysTime(millis) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const base = chars.length; // 62

  // Split into days since epoch and milliseconds since midnight
  const { daysSinceEpoch, millisSinceMidnight } = millisecondsToDaysAndTime(millis);

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
 * Process a timestamp and print all representations
 * @param {number} millis - milliseconds since epoch
 */
function processTimestamp(millis) {
  console.log(`Original timestamp: ${millis} milliseconds since epoch`);
  console.log("-".repeat(50));

  // Format 1: Days since epoch and milliseconds since midnight
  const { daysSinceEpoch, millisSinceMidnight } = millisecondsToDaysAndTime(millis);
  const daysRepr = `${daysSinceEpoch},${millisSinceMidnight}`;
  console.log(`Days since epoch: ${daysSinceEpoch}, Milliseconds since midnight: ${millisSinceMidnight}`);
  const daysInfo = getSizeInfo(millis, daysRepr);
  console.log(`Size: ${daysInfo.representationSize} chars, ${daysInfo.efficiency}`);
  console.log("-".repeat(50));

  // Format 2: Base64 compression
  const base64Repr = compressMillisBase64(millis);
  console.log(`Base64 representation: ${base64Repr}`);
  const base64Info = getSizeInfo(millis, base64Repr);
  console.log(`Size: ${base64Info.representationSize} chars, ${base64Info.efficiency}`);
  console.log("-".repeat(50));

  // Format 3: Custom base36 compression
  const base36Repr = compressMillisCustom(millis);
  console.log(`Base36 representation: ${base36Repr}`);
  const base36Info = getSizeInfo(millis, base36Repr);
  console.log(`Size: ${base36Info.representationSize} chars, ${base36Info.efficiency}`);
  console.log("-".repeat(50));

  // Format 4: Case-sensitive base62 compression (most compact alphanumeric)
  const base62Repr = compressMillisBase62(millis);
  console.log(`Base62 representation: ${base62Repr}`);
  const base62Info = getSizeInfo(millis, base62Repr);
  console.log(`Size: ${base62Info.representationSize} chars, ${base62Info.efficiency}`);
  console.log("-".repeat(50));

  // Format 5: Split days/time with base62 encoding for each part
  const splitBase62Repr = compressSplitDaysTime(millis);
  console.log(`Split Days/Time (Base62): ${splitBase62Repr}`);
  const splitBase62Info = getSizeInfo(millis, splitBase62Repr);
  console.log(`Size: ${splitBase62Info.representationSize} chars, ${splitBase62Info.efficiency}`);
  console.log("-".repeat(50));

  // Format 6: Hexadecimal representation
  const hexRepr = millis.toString(16);
  console.log(`Hexadecimal representation: ${hexRepr}`);
  const hexInfo = getSizeInfo(millis, hexRepr);
  console.log(`Size: ${hexInfo.representationSize} chars, ${hexInfo.efficiency}`);
  console.log("-".repeat(50));

  // Summary
  console.log("Summary of representations:");
  console.log(`1. Original:          ${millis} (${millis.toString().length} chars)`);
  console.log(`2. Days/Millis:       ${daysRepr} (${daysInfo.representationSize} chars)`);
  console.log(`3. Base64:            ${base64Repr} (${base64Info.representationSize} chars)`);
  console.log(`4. Base36:            ${base36Repr} (${base36Info.representationSize} chars)`);
  console.log(`5. Base62:            ${base62Repr} (${base62Info.representationSize} chars)`);
  console.log(`6. Split Days/Time:   ${splitBase62Repr} (${splitBase62Info.representationSize} chars)`);
  console.log(`7. Hexadecimal:       ${hexRepr} (${hexInfo.representationSize} chars)`);
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

  processTimestamp(millis);
}

// Run the main function
main();
