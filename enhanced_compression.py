#!/usr/bin/env python3

"""
Enhanced Timestamp Compression

This module contains additional timestamp compression methods that provide
greater compression than the standard implementations.
"""

import base64
import struct
from datetime import datetime, timedelta

def compress_millis_base94(millis):
    """
    Compress milliseconds into a Base94 string using nearly all printable ASCII characters.
    This provides the highest density for printable ASCII, but may be less compatible
    with some systems that have restrictions on special characters.

    Args:
        millis (int): Milliseconds since epoch

    Returns:
        str: Base94 encoded string
    """
    # Use 94 printable ASCII characters (excluding space, ", ', \, and `)
    chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&()*+,-./:;<=>?@[]^_{|}~"
    base = len(chars)  # 94

    # Convert to Base94
    result = ""
    number = millis

    while number > 0:
        result = chars[number % base] + result
        number //= base

    return result or "0"

def compress_millis_variable(millis, reference_date=1577836800000):  # Jan 1, 2020
    """
    Variable-length encoding for timestamps.
    Uses fewer characters for more recent timestamps (closer to reference date).

    Args:
        millis (int): Milliseconds since epoch
        reference_date (int): Reference date in milliseconds

    Returns:
        str: Variable-length encoded string
    """
    # Calculate difference from reference date
    diff = millis - reference_date

    # Encode sign
    sign = '+' if diff >= 0 else '-'
    abs_diff = abs(diff)

    # Use Base62 for the absolute difference
    chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    base = len(chars)  # 62

    result = ""
    number = abs_diff

    while number > 0:
        result = chars[number % base] + result
        number //= base

    if not result:
        result = "0"

    # Return sign + encoded absolute difference
    return sign + result

def compress_millis_bit_packed(millis):
    """
    Efficient bit-packed encoding for timestamps.
    Uses separate byte allocations for days (16 bits) and milliseconds (27 bits).
    More efficient than standard 64-bit encoding.

    Args:
        millis (int): Milliseconds since epoch

    Returns:
        str: Base64 encoded string of the bit-packed value
    """
    # Split into days and milliseconds
    MS_PER_DAY = 24 * 60 * 60 * 1000
    days = millis // MS_PER_DAY
    ms_in_day = millis % MS_PER_DAY

    # Pack days into 2 bytes (16 bits) - supports ~179 years from epoch
    days_bytes = struct.pack('>H', days)

    # Pack ms_in_day into 4 bytes (32 bits) - only need 27 bits but using full 4 bytes for simplicity
    ms_bytes = struct.pack('>I', ms_in_day)

    # Combine and convert to base64
    combined = days_bytes + ms_bytes
    return base64.b64encode(combined).decode('ascii')

def compress_timestamp_series(timestamps):
    """
    Delta encoding for a series of timestamps.
    First timestamp is encoded fully, subsequent ones as differences.

    Args:
        timestamps (list): Array of millisecond timestamps

    Returns:
        str: Encoded string with deltas
    """
    if not timestamps:
        return ''

    chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    base = len(chars)  # 62

    # Helper function for Base62 encoding
    def compress_base62(value):
        result = ""
        number = value

        while number > 0:
            result = chars[number % base] + result
            number //= base

        return result or "0"

    # Encode first timestamp fully
    result = compress_base62(timestamps[0])
    prev = timestamps[0]

    # Add deltas for subsequent timestamps
    for timestamp in timestamps[1:]:
        delta = timestamp - prev
        prev = timestamp

        # Encode delta in base62
        delta_encoded = compress_base62(abs(delta))

        # Add sign for delta
        sign_char = '+' if delta >= 0 else '-'
        result += sign_char + delta_encoded

    return result

if __name__ == "__main__":
    # Example usage
    import time
    current_millis = int(time.time() * 1000)

    print(f"Original timestamp: {current_millis}")
    print(f"Base94: {compress_millis_base94(current_millis)}")
    print(f"Variable: {compress_millis_variable(current_millis)}")
    print(f"BitPacked: {compress_millis_bit_packed(current_millis)}")

    # Series example
    series = [current_millis, current_millis + 5000, current_millis + 12000]
    print(f"Series: {compress_timestamp_series(series)}")
