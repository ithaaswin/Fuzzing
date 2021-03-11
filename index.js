const mtTest = require('./lib/driver').mutationTesting;
const fs = require('fs');

// Code under test...
const marqdown = require('./test/marqdown');

// Inputs
let mdA = fs.readFileSync('test/test.md','utf-8');
let mdB = fs.readFileSync('test/simple.md','utf-8');

// Fuzz function 1000 times, given seed inputs.
mtTest(1000, () => [mdA, mdB], (md) => marqdown.render(md) );