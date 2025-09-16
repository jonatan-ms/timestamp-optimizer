#!/usr/bin/env python3

"""
Enhanced Timestamp Compression Demo

This script demonstrates the additional compression methods from enhanced_compression.py
and compares them with the existing methods.
"""

import sys
import time
from time_converter import compress_millis_base62
from enhanced_compression import (
    compress_millis_base94,
    compress_millis_variable,
    compress_millis_bit_packed,
    compress_timestamp_series
)

def get_size_info(original, representation):
    """Calculate size information about a representation."""
    original_bytes = len(str(original))
    representation_bytes = len(representation)
    saving = original_bytes - representation_bytes
    saving_percent = (saving / original_bytes) * 100 if original_bytes > 0 else 0

    if saving >= 0:
        efficiency = f"Saved {saving} characters ({saving_percent:.2f}%)"
    else:
        efficiency = f"Increased by {abs(saving)} characters ({abs(saving_percent):.2f}%)"

    return {
        "original_size": original_bytes,
        "representation_size": representation_bytes,
        "efficiency": efficiency
    }

def process_timestamp_enhanced(millis):
    """Process a timestamp with enhanced compression methods."""
    print(f"Original timestamp: {millis} milliseconds since epoch")
    print("-" * 50)

    # Existing Base62 method for comparison
    base62_repr = compress_millis_base62(millis)
    base62_info = get_size_info(millis, base62_repr)
    print(f"Base62 representation (existing): {base62_repr}")
    print(f"Size: {base62_info['representation_size']} chars, {base62_info['efficiency']}")
    print("-" * 50)

    # Enhanced Method 1: Base94 compression
    base94_repr = compress_millis_base94(millis)
    base94_info = get_size_info(millis, base94_repr)
    print(f"Base94 representation: {base94_repr}")
    print(f"Size: {base94_info['representation_size']} chars, {base94_info['efficiency']}")
    print("-" * 50)

    # Enhanced Method 2: Variable-length compression
    variable_repr = compress_millis_variable(millis)
    variable_info = get_size_info(millis, variable_repr)
    print(f"Variable-length representation: {variable_repr}")
    print(f"Size: {variable_info['representation_size']} chars, {variable_info['efficiency']}")
    print("-" * 50)

    # Enhanced Method 3: Bit-packed compression
    bit_packed_repr = compress_millis_bit_packed(millis)
    bit_packed_info = get_size_info(millis, bit_packed_repr)
    print(f"Bit-packed representation: {bit_packed_repr}")
    print(f"Size: {bit_packed_info['representation_size']} chars, {bit_packed_info['efficiency']}")
    print("-" * 50)

    # Enhanced Method 4: Delta encoding (using a series for demonstration)
    series = [millis, millis + 5000, millis + 12000]
    series_repr = compress_timestamp_series(series)
    print("Timestamp Series:")
    print(f"Original series: {series}")
    print(f"Delta encoded: {series_repr}")
    print(f"Size: {len(series_repr)} chars for 3 timestamps (avg: {len(series_repr)/3:.2f} per timestamp)")
    print("-" * 50)

    # Summary
    print("Summary of enhanced representations:")
    print(f"1. Original:          {millis} ({len(str(millis))} chars)")
    print(f"2. Base62 (existing): {base62_repr} ({base62_info['representation_size']} chars)")
    print(f"3. Base94:            {base94_repr} ({base94_info['representation_size']} chars)")
    print(f"4. Variable-length:   {variable_repr} ({variable_info['representation_size']} chars)")
    print(f"5. Bit-packed:        {bit_packed_repr} ({bit_packed_info['representation_size']} chars)")

def main():
    if len(sys.argv) > 1:
        try:
            millis = int(sys.argv[1])
            process_timestamp_enhanced(millis)
        except ValueError:
            print("Error: Please provide a valid integer for milliseconds.")
            sys.exit(1)
    else:
        # Use current time if no argument provided
        current_millis = int(time.time() * 1000)
        print("No timestamp provided. Using current time.")
        process_timestamp_enhanced(current_millis)

if __name__ == "__main__":
    main()
