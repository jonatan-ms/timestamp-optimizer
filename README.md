# Time Compression Utility

This utility converts millisecond timestamps into various formats:

1. Number of days since 1970 (epoch) and milliseconds since midnight
2. Compressed format using alphanumerical characters to save space
3. Different representations with information about format and size

## Features

- Converts milliseconds to days since 1970 and milliseconds since midnight
- Compresses timestamps using Base64 encoding
- Custom Base36 encoding for even more compact representation
- Shows size information and efficiency for each representation

## Usage

The utility is available in both Python and JavaScript.

### Python Version

Run with a specific timestamp (milliseconds since epoch):

```bash
python3 time_converter.py 1757546400000
```

Or run with the current timestamp:

```bash
python3 time_converter.py
```

### JavaScript Version

Run with a specific timestamp (milliseconds since epoch):

```bash
node time_converter.js 1757546400000
```

Or run with the current timestamp:

```bash
node time_converter.js
```

## Example Output

```
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
Hexadecimal representation: 19935c900000
Size: 11 chars, Saved 2 characters (15.38%)
--------------------------------------------------
Summary of representations:
1. Original:          1757546400000 (13 chars)
2. Days/Millis:       20342,0 (11 chars)
3. Base64:            AAABn3KQwAA= (12 chars)
4. Base36:            ofw0zdzyo0 (10 chars)
5. Base62:            4AKAfDtq0 (8 chars)
6. Split Days/Time:   5cG:0 (4 chars)
7. Hexadecimal:       19935c900000 (11 chars)
```

## How It Works

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

## License

MIT
