#!/usr/bin/env python3

import sys
import time
import base64
import struct
from datetime import datetime, timedelta

def milliseconds_to_days_and_time_since_midnight(millis):
    """
    Convert milliseconds since epoch to:
    1. Number of days since 1970
    2. Milliseconds since midnight

    Returns a tuple of (days_since_epoch, millis_since_midnight)
    """
    # Convert to seconds for datetime operations
    seconds = millis / 1000

    # Create datetime object
    dt = datetime.fromtimestamp(seconds)

    # Calculate days since epoch (1970-01-01)
    epoch = datetime(1970, 1, 1)
    days_since_epoch = (dt.date() - epoch.date()).days

    # Calculate milliseconds since midnight
    midnight = datetime(dt.year, dt.month, dt.day)
    seconds_since_midnight = (dt - midnight).total_seconds()
    millis_since_midnight = int(seconds_since_midnight * 1000)

    return (days_since_epoch, millis_since_midnight)

def compress_millis_base64(millis):
    """
    Compress milliseconds into a base64 string.
    This packs the milliseconds as a 64-bit integer, then encodes to base64.
    """
    # Pack as a 64-bit integer (8 bytes)
    packed = struct.pack('>Q', millis)
    # Convert to base64
    compressed = base64.b64encode(packed).decode('ascii')
    return compressed

def compress_millis_custom(millis):
    """
    Compress milliseconds into a custom alphanumeric format.
    Uses base36 encoding (0-9, a-z) for more compact representation than base64.
    """
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    base = len(chars)
    result = ""

    # Convert to base36
    number = millis
    while number > 0:
        result = chars[number % base] + result
        number //= base

    return result or "0"

def compress_millis_base62(millis):
    """
    Compress milliseconds into a base62 format (0-9, a-z, A-Z).
    This is the most compact alphanumeric representation possible
    where case sensitivity is preserved (lowercase != uppercase).
    """
    chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    base = len(chars)  # 62
    result = ""

    # Convert to base62
    number = millis
    while number > 0:
        result = chars[number % base] + result
        number //= base

    return result or "0"

def compress_split_days_time(millis):
    """
    Compress timestamp by splitting into days since epoch and milliseconds since midnight,
    then encode each component separately using base62.
    """
    chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    base = len(chars)  # 62

    # Split into days since epoch and milliseconds since midnight
    days, millis_since_midnight = milliseconds_to_days_and_time_since_midnight(millis)

    # Convert days to base62
    days_result = ""
    days_number = days
    while days_number > 0:
        days_result = chars[days_number % base] + days_result
        days_number //= base

    # Ensure we have at least one character for days
    if not days_result:
        days_result = "0"

    # Convert milliseconds since midnight to base62
    time_result = ""
    time_number = millis_since_midnight
    while time_number > 0:
        time_result = chars[time_number % base] + time_result
        time_number //= base

    # Ensure we have at least one character for time
    if not time_result:
        time_result = "0"

    # Add a separator between the two components - using ":" as it's readable and common for time
    return days_result + ":" + time_result

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

def process_timestamp(millis):
    """Process a timestamp and print all representations."""
    print(f"Original timestamp: {millis} milliseconds since epoch")
    print("-" * 50)

    # Format 1: Days since epoch and milliseconds since midnight
    days, millis_since_midnight = milliseconds_to_days_and_time_since_midnight(millis)
    days_repr = f"Days since epoch: {days}, Milliseconds since midnight: {millis_since_midnight}"
    print(days_repr)
    days_info = get_size_info(millis, f"{days},{millis_since_midnight}")
    print(f"Size: {days_info['representation_size']} chars, {days_info['efficiency']}")
    print("-" * 50)

    # Format 2: Base64 compression
    base64_repr = compress_millis_base64(millis)
    print(f"Base64 representation: {base64_repr}")
    base64_info = get_size_info(millis, base64_repr)
    print(f"Size: {base64_info['representation_size']} chars, {base64_info['efficiency']}")
    print("-" * 50)

    # Format 3: Custom base36 compression
    base36_repr = compress_millis_custom(millis)
    print(f"Base36 representation: {base36_repr}")
    base36_info = get_size_info(millis, base36_repr)
    print(f"Size: {base36_info['representation_size']} chars, {base36_info['efficiency']}")
    print("-" * 50)

    # Format 4: Case-sensitive base62 compression (most compact alphanumeric)
    base62_repr = compress_millis_base62(millis)
    print(f"Base62 representation: {base62_repr}")
    base62_info = get_size_info(millis, base62_repr)
    print(f"Size: {base62_info['representation_size']} chars, {base62_info['efficiency']}")
    print("-" * 50)

    # Format 5: Split days/time with base62 encoding for each part
    split_base62_repr = compress_split_days_time(millis)
    print(f"Split Days/Time (Base62): {split_base62_repr}")
    split_base62_info = get_size_info(millis, split_base62_repr)
    print(f"Size: {split_base62_info['representation_size']} chars, {split_base62_info['efficiency']}")
    print("-" * 50)

    # Format 6: Hexadecimal representation
    hex_repr = format(millis, 'x')
    print(f"Hexadecimal representation: {hex_repr}")
    hex_info = get_size_info(millis, hex_repr)
    print(f"Size: {hex_info['representation_size']} chars, {hex_info['efficiency']}")
    print("-" * 50)

    # Summary
    print("Summary of representations:")
    print(f"1. Original:          {millis} ({len(str(millis))} chars)")
    print(f"2. Days/Millis:       {days},{millis_since_midnight} ({days_info['representation_size']} chars)")
    print(f"3. Base64:            {base64_repr} ({base64_info['representation_size']} chars)")
    print(f"4. Base36:            {base36_repr} ({base36_info['representation_size']} chars)")
    print(f"5. Base62:            {base62_repr} ({base62_info['representation_size']} chars)")
    print(f"6. Split Days/Time:   {split_base62_repr} ({split_base62_info['representation_size']} chars)")
    print(f"7. Hexadecimal:       {hex_repr} ({hex_info['representation_size']} chars)")

def main():
    if len(sys.argv) > 1:
        try:
            millis = int(sys.argv[1])
            process_timestamp(millis)
        except ValueError:
            print("Error: Please provide a valid integer for milliseconds.")
            sys.exit(1)
    else:
        # Use current time if no argument provided
        current_millis = int(time.time() * 1000)
        print("No timestamp provided. Using current time.")
        process_timestamp(current_millis)

if __name__ == "__main__":
    main()
