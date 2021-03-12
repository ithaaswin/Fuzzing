# Fuzzing and Mutation Testing

In this workshop, we'll learn about techniques related to random testing called fuzzing, and its close relationship to mutation testing.

## Setup

### Before you get started

Import this as a notebook or clone this repo locally. Also, ensure you [install latest version of docable](https://github.com/ottomatica/docable-notebooks/blob/master/docs/install.md)!

```bash
docable-server import https://github.com/CSC-DevOps/Fuzzing
```

Install dependencies for our code.

```bash | {type: 'command', failed_when: 'exitCode!=0'}
npm install
```


## Fuzzing Concepts

Fuzzing is a random testing techique. Fuzzing can be divided into "black-box" (dumb) and "white-box" (smart) approaches. In this workshop, we focus on "black-box" fuzzing. Generally, black-box fuzzing can be implemented in two ways:

1. **generative**: test input is randomly created. Generation can be guided by grammars or other domain knowledge. This approach is commonly used for security testing.
2. **mutation**: test input is randomly *modified*. The test input can be existing templates, input files, or captured network traffic that is replayed. Imagine you were testing Microsoft Word and you had a 200 page document. If you randomly made changes to the document and attempted to open it with Word&mdash;chances are you might be able to discover a bug.

## Workshop

The goal of this workshop is to use fuzzing to test a tool called `marqdown`, which takes a markdown file, and generates a html rendering of a survey:

See marqdown in use at [checkbox.io](http://checkbox.io/researchers.html).

### Getting Started

We will be using a mutation approach in this workshop. To assist, two files have been provided, `simple.md`, and `test.md`, which are markdown files read by the program.

```js
const mtfuzz = require('./lib/driver').mtfuzz;
const fs = require('fs');

// Code under test...
const marqdown = require('./test/marqdown');

// Seed inputs
let mdA = fs.readFileSync('test/test.md','utf-8');
let mdB = fs.readFileSync('test/simple.md','utf-8');

let args = process.argv.slice(2);
const runs = args.length > 0 ? args[0] : 1000;

// Fuzz function 1000 (or given) times, with given seed string inputs.
mtfuzz(runs, [mdA, mdB], (md) => marqdown.render(md) );
```

Running `node index.js` will output something like this:

```
Fuzzing '(md) => marqdown.render(md)' with 1000 randomly generated-inputs.

Finished 1000 runs.
passed: 1000, exceptions: 0, faults: 0

Discovered faults.
```

```| {type: 'terminal'}
```

The `mtfuzz` function will run 1000 times, each time:

* Picking one of the seed inputs.
* Applying a mutation calling `mutater.str(s)` to randomly change the string.
* Passing the random input to system under test, and simply checking for exceptions being thrown (our *test oracle*).

The code for these steps can be seen in `lib/driver.js`, which essentially looks something like this:

```javascript
function mtfuzz(iterations, seeds, testFn)
{    
    var failedTests = [];
    var passedTests = 0;

    mutater.seed(0);
    
    for (var i = 1; i <= iterations; i++) {

        // Toggle between seed files
        let idx = ((i % seeds.length) + seeds.length) % seeds.length;

        // apply random mutation to seed input
        let s = seeds[ idx ];
        let mutuatedString = mutater.str(s);
        
        // run given function under test with input
        try
        {
            testFn(mutuatedString);
            passedTests++;
        }
        catch(e)
        {
            failedTests.push( {input:mutuatedString, stack: e.stack} );
        }
    }
    ...
```

### Fuzzing Seed Inputs

Right now, inside `mtfuzz`, the call `mutater.str(s)` is just returning the same string `s`!

It will be our job to modify this function in order to try all sorts of interesting ways to randomly change a string. And as a consquence, see if we can *reveal* faults in the code (i.e. Exceptions being thrown).

We will be adding the following functionality, while changing the effects it has on discovering faults:

1. With 25% chance, remove a random set of characters, using [array.splice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) from a random start position.

  HINT: You can use the call `mutator.random().integer(0,num)` to randomly generate a number in a given range.

  🐕‍🦺: Run the code, did you see any faults?

2. With a 25% chance, insert random characters into the string

  HINT: See `mutator.random().string(10)` for creating a random string of length 10.

  🐕‍🦺: Run the code, did you see any new faults?

3. With a 25% chance, replace any single quote strings with a random integer.

   HINT: You can use a regex match/replace call like `val = val.replace(/'\w+'/g, randnum)`;

  🐕‍🦺: Run the code, did you see any new faults?

4. With a 25% chance, repeat (add a `do/while` loop).

  🐕‍🦺: Run the code, did you see any new faults?

See [random-js](https://www.npmjs.com/package/random-js) for tips on using some helpful random utilities.
```javascript
// for example, this will execute true for ~5% of evaluations.
if( mutator.random.bool(0.05) )
```

### Experiments

1. Before any of your mutations, make a change to *always* reverse the input string (simply call `array.reverse()`, which will change the array in memory).

   🤔 Do you think this will make the code find more faults or less? Why?

   🔙 Revert the change when done with experiment.

2. Increase the number of iterations run from 1000 to 15000. Did you find any new faults? Try with an even larger number, 100000. Did that make a difference?  Why do you think changing the number of runs might help reveal more faults (or not)?

   HINT: You can simply pass the number of iterations as an argument: `node index.js 15000`.

### lib/mutate.js

```js | {type: 'file', path: 'lib/mutate.js'}
function mutateString (mutator, val) {
    var array = val.split('');

    if( mutator.random().bool(0.05) )
    {
        // 1. REVERSE
    }
    // With 25% chance, remove a random set of characters, from a random start position
    if( mutator.random().bool(0.25) )
    {
        // 2. mutator.random.integer(0,99)
    }

    // add random characters
    // 3. mutator.random().string(10)

    return array.join('');
}

exports.mutateString = mutateString;
```

You can run `node index.js` to see what effects your mutations has on the code!

```| {type: 'terminal'}
```

### Minification

Fuzzing may create many inputs that are exercising the same bug.  A test suite minification step will attempt to discard test cases that are not any more effective.  Use stack trace to help determine if you are triggering the same bug, then only save the minimum tests needed (Inside `reducedTests`).

### Reports

Now that you've generated some failing test cases, what can you do?

In a continuous deployment pipeline you could add a fuzzing component on new commits, and then reject them if you can generate failures. You might then generate a report, such as this:

##### Example Report: 

The following commit: "Add new JSON5 parser" failed with the following exception. See attached test case.
```
SyntaxError: Expected ':' instead of '' JSON5.parse.error
    at JSON5.parse.error (/Users/gameweld/workshops/Fuzzing/node_modules/json5/lib/json5.js:50:25)
    at JSON5.parse.next (/Users/gameweld/workshops/Fuzzing/node_modules/json5/lib/json5.js:62:17)
    at JSON5.parse.object (/Users/gameweld/workshops/Fuzzing/node_modules/json5/lib/json5.js:443:21)
    at JSON5.parse.value (/Users/gameweld/workshops/Fuzzing/node_modules/json5/lib/json5.js:467:20)
    at Object.parse (/Users/gameweld/workshops/Fuzzing/node_modules/json5/lib/json5.js:491:18)
    at ProcessTokens (/Users/gameweld/workshops/Fuzzing/marqdown.js:287:22)
    at Object.exports.render (/Users/gameweld/workshops/Fuzzing/marqdown.js:25:18)
    at mutationTesting (/Users/gameweld/workshops/Fuzzing/main.js:60:22)
    at Object.<anonymous> (/Users/gameweld/workshops/Fuzzing/main.js:84:1)
    at Module._compile (module.js:460:26)
```

### Bonus

Consider a generative approach based on the grammar of markdown.

* Headers
* Lists
* Inline HTML
* etc.
