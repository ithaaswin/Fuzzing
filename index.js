const fuzz = require('./lib/driver').fuzz;
const fs = require('fs');

// Code under test...
const marqdown = require('./test/marqdown');

// Seed inputs
let mdA = fs.readFileSync('test/test.md','utf-8');
let mdB = fs.readFileSync('test/simple.md','utf-8');

// Fuzz function 1000 times, with given seed string inputs.
fuzz(1000, [mdA, mdB], (md) => marqdown.render(md) );