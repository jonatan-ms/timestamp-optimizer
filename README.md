# Timestamp Optimizer (tz-compr)

A comprehensive timestamp compression utility that provides various encoding methods for efficiently representing millisecond timestamps. Available in both JavaScript and Python.

This utility converts millisecond timestamps into various formats:

1. Number of days since 1970 (epoch) and milliseconds since midnight
2. Multiple compressed formats using different character sets to save space
3. Enhanced compression methods for maximum space efficiency
4. Cross-language implementation in JavaScript and Python
5. Detailed benchmarking and comparison tools

## Features

### Standard Compression Methods

- Converts milliseconds to days since 1970 and milliseconds since midnight
- Compresses timestamps using Base64 encoding
- Custom Base36 encoding (0-9, a-z) for more compact representation
- Base62 encoding (0-9, a-z, A-Z) for even more compact alphanumeric representation
- Split days/time encoding for optimal human-readable compression

### Enhanced Compression Methods

- Base94 encoding using printable ASCII characters for maximum density
- Variable-length encoding that uses fewer characters for timestamps near a reference date
- Bit-packed encoding that uses separate byte allocations for days and milliseconds
- Delta encoding for efficiently representing series of timestamps

### Tools and Utilities

- Comprehensive benchmarking across all compression methods
- Cross-language comparison between JavaScript and Python implementations
- Size and efficiency statistics for each compression method
- Performance timing measurements

## Usage

The utility is available in both Python and JavaScript.

### Basic Usage

#### Python Version

Run with a specific timestamp (milliseconds since epoch):

```bash
python3 time_converter.py 1757546400000
```

Or run with the current timestamp:

```bash
python3 time_converter.py
```

#### JavaScript Version

Run with a specific timestamp (milliseconds since epoch):

```bash
node time_converter.js 1757546400000
```

Or run with the current timestamp:

```bash
node time_converter.js
```

### Enhanced Compression Demo

Try the enhanced compression methods:

```bash
# JavaScript
npm run enhanced
# or directly
node enhanced_demo.js 1757546400000

# Python
python3 enhanced_demo.py 1757546400000
```

### Cross-Language Comparison

Compare JavaScript and Python implementations:

```bash
# Basic methods
npm run compare

# Enhanced methods
npm run compare-enhanced
```

### Benchmarking

Run benchmarks to compare performance and compression efficiency:

```bash
# JavaScript benchmark
npm run benchmark

# Python benchmark
python3 benchmark.py

# Simple benchmark for quick comparison
npm run simple-benchmark

# Cross-language benchmark
npm run cross-benchmark
# or directly
./cross_benchmark.sh
```

## Benchmark Results

The repository includes comprehensive benchmark results comparing:

- Size efficiency across all compression methods
- Performance metrics for both JavaScript and Python implementations
- Cross-language comparison showing speed ratios
- Example outputs for various timestamp values

Results are stored in JSON files:

- `js_benchmark_results.json` - JavaScript benchmarks
- `python_benchmark_results.json` - Python benchmarks

## Example Output

```text
Original timestamp: 1757546400000 milliseconds since epoch
--------------------------------------------------
Days since epoch: 20342, Milliseconds since midnight: 0
Size: 11 chars, Saved 2 characters (15.38%)
--------------------------------------------------
Base64 representation: AAABn3KQwAA=
Size: 12 chars, Saved 1 characters (7.69%)
--------------------------------------------------
Base36 representation: ofw0zdzyo0
Size: 10 chars, Saved 3 characters (23.08%)
--------------------------------------------------
Base62 representation: 4AKAfDtq0
Size: 8 chars, Saved 5 characters (38.46%)
--------------------------------------------------
Split Days/Time (Base62): 5cG:0
Size: 4 chars, Saved 9 characters (69.23%)
--------------------------------------------------
Base94 representation: tVf$p
Size: 5 chars, Saved 8 characters (61.54%)
--------------------------------------------------
Variable-length representation: +ar5t9
Size: 6 chars, Saved 7 characters (53.85%)
--------------------------------------------------
Summary of representations:
1. Original:          1757546400000 (13 chars)
2. Days/Millis:       20342,0 (11 chars)
3. Base64:            AAABn3KQwAA= (12 chars)
4. Base36:            ofw0zdzyo0 (10 chars)
5. Base62:            4AKAfDtq0 (8 chars)
6. Split Days/Time:   5cG:0 (4 chars)
7. Base94:            tVf$p (5 chars)
8. Variable:          +ar5t9 (6 chars)
```

## Compression Methods

### Basic Methods

1. **Days and Milliseconds**:
   - Converts the timestamp into days since epoch (January 1, 1970)
   - Calculates milliseconds elapsed since midnight of the current day

2. **Base64 Compression**:
   - Stores the millisecond value as a 64-bit integer
   - Encodes it using standard Base64 encoding

3. **Base36 Compression**:
   - Converts the millisecond value to Base36 (using digits 0-9 and letters a-z)
   - Provides a compact representation

4. **Base62 Compression**:
   - Converts the millisecond value to Base62 (using digits 0-9, letters a-z, and letters A-Z)
   - Provides a very compact alphanumeric representation
   - Requires case-sensitivity (lowercase and uppercase letters are distinct)

5. **Split Days/Time Base62 Compression**:
   - Splits timestamp into days since epoch and milliseconds since midnight
   - Encodes each component separately using Base62
   - Joins with a separator (":") for readability
   - Often provides the most compact human-readable representation

6. **Hexadecimal Representation**:
   - Converts the millisecond value to base 16 (digits 0-9, letters a-f)
   - Provides a common representation used in computing

### Enhanced Methods

1. **Base94 Compression**:
   - Uses 94 printable ASCII characters for maximum density
   - Excludes problematic characters (space, ", ', \, and `)
   - Provides the highest density for printable ASCII
   - May be less compatible with systems that restrict special characters

2. **Variable-length Compression**:
   - Uses fewer characters for timestamps closer to a reference date
   - Stores the difference from a reference date (default: Jan 1, 2020)
   - Encodes the sign (+ or -) and the absolute difference
   - More efficient for recent or clustered timestamps

3. **Bit-packed Compression**:
   - Uses separate byte allocations for days (16 bits) and milliseconds (27 bits)
   - More efficient than standard 64-bit encoding
   - Supports timestamps up to ~179 years from epoch (with fallback)
   - Encoded as Base64 for transmission

4. **Delta Encoding for Timestamp Series**:
   - Encodes the first timestamp fully
   - Subsequent timestamps stored as differences from previous values
   - Highly efficient for sequences of related timestamps
   - Perfect for time series data or event logs

## License

MIT
