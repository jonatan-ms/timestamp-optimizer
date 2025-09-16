#!/usr/bin/env python3

"""
Benchmark Script for Python Timestamp Compression Methods

This script runs all compression methods on a variety of timestamps
and reports on their efficiency, size, and performance.
"""

import sys
import time
import json
import struct
import base64
from datetime import datetime, timedelta
import time as timer

# Import compression methods
from time_converter import compress_millis_base64, compress_millis_custom, compress_millis_base62, compress_split_days_time
from enhanced_compression import compress_millis_base94, compress_millis_variable, compress_millis_bit_packed

def generate_test_timestamps():
    """Generate a range of test timestamps."""
    timestamps = []

    # Current time
    current_time = int(time.time() * 1000)
    timestamps.append(current_time)

    # Recent timestamps (past week)
    timestamps.append(current_time - 1000 * 60 * 60 * 24 * 1)  # 1 day ago
    timestamps.append(current_time - 1000 * 60 * 60 * 24 * 7)  # 1 week ago

    # Timestamps from different periods
    timestamps.append(int(datetime(2020, 1, 1).timestamp() * 1000))  # Beginning of 2020
    timestamps.append(int(datetime(2000, 1, 1).timestamp() * 1000))  # Y2K
    timestamps.append(int(datetime(1980, 1, 1).timestamp() * 1000))  # 1980
    timestamps.append(int(datetime(1970, 1, 1).timestamp() * 1000) + 100000)  # Just after epoch

    # Future timestamps
    timestamps.append(current_time + 1000 * 60 * 60 * 24 * 365)  # 1 year in future

    # Very large timestamp - Python can handle even larger ones than JS
    timestamps.append(8640000000000000)  # Max date - JavaScript limit

    # 20 timestamps per day during a period of 60 days starting from 2023-01-01
    start = int(datetime(2023, 1, 1).timestamp() * 1000)
    for i in range(60 * 20):
        timestamps.append(int(start + i * (60 * 24 * 60 * 60 * 1000) / (60 * 20)))  # Spread over 60 days

    return timestamps

def get_size_info(original, representation):
    """Calculate size information about a representation."""
    original_bytes = len(str(original))
    representation_bytes = len(representation)
    saving = original_bytes - representation_bytes
    saving_percent = (saving / original_bytes) * 100 if original_bytes > 0 else 0

    if saving >= 0:
        efficiency = f"Saved {saving} chars ({saving_percent:.2f}%)"
    else:
        efficiency = f"Increased by {abs(saving)} chars ({abs(saving_percent):.2f}%)"

    return {
        "original_size": original_bytes,
        "representation_size": representation_bytes,
        "efficiency": efficiency,
        "saving_percent": saving_percent
    }

def run_benchmark():
    """Run benchmark for all methods and output results."""
    timestamps = generate_test_timestamps()
    results = {}

    print(f"Running Python benchmark on {len(timestamps)} timestamps...")
    print("-" * 80)

    # Define methods to test
    methods = [
        {"name": "Base64", "func": compress_millis_base64},
        {"name": "Base36", "func": compress_millis_custom},
        {"name": "Base62", "func": compress_millis_base62},
        {"name": "Split Base62", "func": compress_split_days_time},
        {"name": "Base94", "func": compress_millis_base94},
        {"name": "Variable", "func": compress_millis_variable},
        {"name": "BitPacked", "func": compress_millis_bit_packed}
    ]

    # Initialize results
    for method in methods:
        results[method["name"]] = {
            "totalSavingPercent": 0,
            "avgSize": 0,
            "totalSize": 0,
            "totalTime": 0,
            "avgTime": 0,
            "examples": []
        }

    # Process each timestamp
    print(f"Processing {len(timestamps)} timestamps...")
    print(f"[0%", end="", flush=True)

    for i, timestamp in enumerate(timestamps):
        # Show progress every 10%
        if (i + 1) % max(1, len(timestamps) // 10) == 0:
            progress = (i + 1) / len(timestamps) * 100
            print(f"...{progress:.0f}%", end="", flush=True)

        # For each method, run the compression and store results
        for method in methods:
            try:
                start_time = timer.time()
                compressed = method["func"](timestamp)
                end_time = timer.time()

                time_taken = (end_time - start_time) * 1000  # Convert to milliseconds
                info = get_size_info(timestamp, compressed)

                results[method["name"]]["totalSavingPercent"] += info["saving_percent"]
                results[method["name"]]["totalSize"] += info["representation_size"]
                results[method["name"]]["totalTime"] += time_taken

                # Store example (only for first few timestamps)
                if i < 3:
                    try:
                        dt = datetime.fromtimestamp(timestamp/1000).isoformat()
                    except (ValueError, OverflowError):
                        dt = "Date too large for Python datetime"

                    results[method["name"]]["examples"].append({
                        "timestamp": timestamp,
                        "timestamp_iso": dt,
                        "compressed": compressed,
                        "size": info["representation_size"],
                        "timeTaken": f"{time_taken:.3f}"
                    })
            except Exception as e:
                # If a method fails, we still want to continue with other methods
                pass

    print(f"...100%]")
    print("-" * 80)    # Calculate averages
    for method_name in results:
        results[method_name]["avgSavingPercent"] = results[method_name]["totalSavingPercent"] / len(timestamps)
        results[method_name]["avgSize"] = results[method_name]["totalSize"] / len(timestamps)
        results[method_name]["avgTime"] = results[method_name]["totalTime"] / len(timestamps)

    # Print summary
    print("\nSUMMARY OF RESULTS")
    print("=" * 80)
    print("Method".ljust(15) + "Avg Size".ljust(15) + "Avg Saving %".ljust(15) + "Avg Time (ms)".ljust(15))
    print("-" * 80)

    # Sort methods by average size (most efficient first)
    sorted_methods = sorted(results.keys(), key=lambda m: results[m]["avgSize"])

    for method in sorted_methods:
        print(
            method.ljust(15) +
            f"{results[method]['avgSize']:.2f}".ljust(15) +
            f"{results[method]['avgSavingPercent']:.2f}".ljust(15) + "%" +
            f"{results[method]['avgTime']:.3f}".ljust(15)
        )

    # Print example compressions for the first timestamp
    if any(len(results[m]["examples"]) > 0 for m in results):
        print("\nEXAMPLE COMPRESSIONS (first timestamp)")
        print("=" * 80)
        first_method = sorted_methods[0]
        if results[first_method]["examples"]:
            example = results[first_method]["examples"][0]
            timestamp = example["timestamp"]
            try:
                ts_iso = example.get("timestamp_iso") or datetime.fromtimestamp(timestamp/1000).isoformat()
            except (ValueError, OverflowError):
                ts_iso = "Date too large"
            print(f"Timestamp: {timestamp} ({ts_iso})")
            print("-" * 80)
            for method in sorted_methods:
                if results[method]["examples"]:
                    ex = results[method]["examples"][0]
                    print(f"{method.ljust(15)}: {ex['compressed'].ljust(20)} ({ex['size']} chars, {ex['timeTaken']}ms)")
            print("-" * 80)

    # Save results to JSON file for comparison
    with open('python_benchmark_results.json', 'w') as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    run_benchmark()
