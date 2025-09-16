#!/bin/zsh

# Cross-language benchmark wrapper for tz-compr
# This script runs both JavaScript and Python benchmarks and generates a comparison

echo "TZ-COMPR CROSS-LANGUAGE BENCHMARK"
echo "=================================="
echo

# Run JavaScript benchmark
echo "Running JavaScript benchmark..."
node benchmark.js

# Run Python benchmark
echo "\nRunning Python benchmark..."
python3 benchmark.py

# Create a comparison report using Node.js
echo "\nGenerating comparison report..."

node -e "
const fs = require('fs');

// Load benchmark results
const jsResults = JSON.parse(fs.readFileSync('js_benchmark_results.json', 'utf8'));
const pyResults = JSON.parse(fs.readFileSync('python_benchmark_results.json', 'utf8'));

// Get all method names from both benchmarks
const methods = new Set([...Object.keys(jsResults), ...Object.keys(pyResults)]);

// Print comparison
console.log('\nCROSS-LANGUAGE COMPARISON');
console.log('='.repeat(100));
console.log('Method'.padEnd(15) +
            'JS Size'.padEnd(12) +
            'PY Size'.padEnd(12) +
            'Size Diff %'.padEnd(12) +
            'JS Time (ms)'.padEnd(14) +
            'PY Time (ms)'.padEnd(14) +
            'Speed Ratio'.padEnd(12));
console.log('-'.repeat(100));

// Sort methods by average JS size
const sortedMethods = [...methods].sort((a, b) =>
    (jsResults[a]?.avgSize || 999) - (jsResults[b]?.avgSize || 999)
);

// Compare each method
for (const method of sortedMethods) {
    const jsResult = jsResults[method];
    const pyResult = pyResults[method];

    if (!jsResult || !pyResult) {
        console.log(\`\${method.padEnd(15)}NOT IMPLEMENTED IN \${!jsResult ? 'JAVASCRIPT' : 'PYTHON'}\`);
        continue;
    }

    const jsSize = jsResult.avgSize.toFixed(2);
    const pySize = pyResult.avgSize.toFixed(2);

    // Calculate size difference as percentage
    const sizeDiff = ((pySize - jsSize) / jsSize * 100).toFixed(2);

    const jsTime = jsResult.avgTime.toFixed(3);
    const pyTime = pyResult.avgTime.toFixed(3);

    // Calculate speed ratio (which is faster and by how much)
    const speedRatio = (pyTime / jsTime).toFixed(2);
    const speedComparison = speedRatio > 1
        ? \`JS \${speedRatio}x\`
        : \`PY \${(1/speedRatio).toFixed(2)}x\`;

    console.log(
        \`\${method.padEnd(15)}\${jsSize.padEnd(12)}\${pySize.padEnd(12)}\` +
        \`\${sizeDiff.padEnd(12)}\${jsTime.padEnd(14)}\${pyTime.padEnd(14)}\` +
        \`\${speedComparison.padEnd(12)}\`
    );
}

// Find the most efficient method for each language
const jsEfficient = Object.entries(jsResults)
    .sort((a, b) => a[1].avgSize - b[1].avgSize)[0][0];
const pyEfficient = Object.entries(pyResults)
    .sort((a, b) => a[1].avgSize - b[1].avgSize)[0][0];

console.log('\\nSUMMARY:');
console.log(\`- Most efficient JavaScript method: \${jsEfficient} (\${jsResults[jsEfficient].avgSize.toFixed(2)} chars)\`);
console.log(\`- Most efficient Python method: \${pyEfficient} (\${pyResults[pyEfficient].avgSize.toFixed(2)} chars)\`);

// Find the fastest method for each language
const jsFastest = Object.entries(jsResults)
    .sort((a, b) => a[1].avgTime - b[1].avgTime)[0][0];
const pyFastest = Object.entries(pyResults)
    .sort((a, b) => a[1].avgTime - b[1].avgTime)[0][0];

console.log(\`- Fastest JavaScript method: \${jsFastest} (\${jsResults[jsFastest].avgTime.toFixed(3)} ms)\`);
console.log(\`- Fastest Python method: \${pyFastest} (\${pyResults[pyFastest].avgTime.toFixed(3)} ms)\`);

// Overall language comparison
const jsAvgTime = Object.values(jsResults).reduce((sum, r) => sum + r.avgTime, 0) / Object.keys(jsResults).length;
const pyAvgTime = Object.values(pyResults).reduce((sum, r) => sum + r.avgTime, 0) / Object.keys(pyResults).length;
const overallRatio = (pyAvgTime / jsAvgTime).toFixed(2);

console.log(\`\\nOverall, \${overallRatio > 1 ? 'JavaScript' : 'Python'} is \${Math.max(overallRatio, 1/overallRatio).toFixed(2)}x faster on average.\`);
"

echo "\nBenchmark complete! Results saved to js_benchmark_results.json and python_benchmark_results.json"
