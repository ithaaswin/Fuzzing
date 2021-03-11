const fs = require('fs');

const marqdown = require('./test/marqdown');
paths = ['test/test.md','test/simple.md'];

var markDownA = fs.readFileSync(paths[0],'utf-8');
var markDownB = fs.readFileSync(paths[1],'utf-8');

const mutationTesting = require('./lib/driver').mutationTesting;

mutationTesting(1000, () => markDownA, (x) => marqdown.render(x) );