# Fuzzing

In this workshop, we'll learn about techniques related to random testing called fuzzing, and its close relationship to mutation testing.

``` | {type: 'slides'}
https://www.youtube.com/embed/YFhdo68Z3qU
```

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

The goal of this workshop is to use fuzzing to test a tool called `marqdown`, which takes a markdown file 📄, and generates a html rendering of a survey 🗹. 

For example, the following markdown would be translated from: 📄

------

~~~md
What is your favorite pet?
> {rows:3}

### Install

![NPM version](https://badge.fury.io/js/marked.png)

Did running this command work for you?

``` bash
npm install marked --save
```
1. Yes
2. No

### Upload a screenshot
> {upload: true, name: 'hello'}
~~~

to: 🗹

![checkbox rendered](img/checkbox.png)

------

See `marqdown` in use at [checkbox.io](http://checkbox.io/researchers.html).

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

2. With a 25% chance, insert random characters into the string. 

  HINT: Consider using `array.splice` with spread operator: `array.splice( rand_position, 0, ...rand_string)`.
  HINT: See `mutator.random().string(10)` for creating a random string of length 10.

  🐕‍🦺: Run the code, did you see any new faults?

3. With a 50% chance, replace any single quote strings with a random integer.

   HINT: You can use a regex match/replace call like `val = val.replace(/'\w+'/g, randnum)`;

  🐕‍🦺: Run the code, did you see any new faults?

4. With a 25% chance, steps 1 and 2 (add a `do/while` loop).

  🐕‍🦺: Run the code, did you see any new faults?

See [random-js](https://www.npmjs.com/package/random-js) for tips on using some helpful random utilities.
```javascript
// for example, this will execute true for ~5% of evaluations.
if( mutator.random.bool(0.05) )
```

Note: Fuzzing may create many inputs that are revealing the same failure. This program attempts to reduce duplicate failures by discarding exceptions that reveal a failure location already found.

```js
var trace = failed.stack.split("\n");
var msg = trace[0];
var at = trace[1];

if( !reduced.hasOwnProperty( at ) )
{
    reduced[at] = `${chalk.red(msg)}\nFailed with input: .mutations/${failed.id}.txt\n${chalk.grey(failed.stack)}`; 
}
```

### Experiments

1. 🔙 Before your do while loop, make a change to *always* reverse the input string (simply call `array.reverse()`, which will change the array in memory).

   🤔 Do you think this will make the code find more faults or less? Why?

   Revert the change when done with experiment.

2. ⚖️ Increase the number of iterations run from 1000 to 15000. Did you find any new faults? Try with an even larger number, 100000. Did that make a difference?  Why do you think changing the number of runs might help reveal more faults (or not)?

   HINT: You can simply pass the number of iterations as an argument: `node index.js 15000`.

### lib/mutate.js

Make sure to click the "save" icon each time you edit the file.

```js | {type: 'file', path: 'lib/mutate.js'}
function mutateString (mutator, val) {

    // Step 3. Replace single quotes strings with integers

    var array = val.split('');

    if( mutator.random().bool(0.25) )
    {
        // Step 1. Randomly remove a random set of characters, from a random start position.
    }
    if( mutator.random().bool(0.25) )
    {
        // Step 2. Randomly add a set of characters.
    }

    return array.join('');
}

exports.mutateString = mutateString;
```

You can run `node index.js` to see what effects your mutations has on the code!

```| {type: 'terminal'}
```

### Integrating into pipeline stage

There are several ways this can be added into a pipeline stage. In a continuous deployment pipeline you could add a stage for fuzz testing. If the built program could receive input, then fuzzing could simply performed by sending input into the binary.

Alternatively, you could run fuzzing on specific methods with a codebase. One strategy would involve tagging code with a `@Fuzz` attribute, which could then be processed by a fuzzing program. Therefore, the fuzzing tool would generate random inputs for all the given methods, looking for failures.

```
@Fuzz
private void exampleFunction2(String sTest, DataClass[] daTest) {
    System.out.println("\tRunning with values: " + sTest + ", " + Arrays.toString(daTest));
}
```

An previous undergrad student at NCSU, Johnny Rockett, built such a tool for Java/Maven, available here:
https://github.com/johnnyrockett/ROG-Fuzzer

### Minification

In order to make revealing a fault easier, it is possible to automatically reduce the input, by systematically deleting the input and checking to see if the fault is still revealed. Typically, the process involves deleting parts of the input, until the smallest version of the input that still produces the error remains.

An effective tool for doing this is `creduce`:

https://embed.cs.utah.edu/creduce/


### Mutation Testing

How is fuzzing related to mutation testing?

Well, rather than randomly mutate inputs for a program, we can simply randomly mutate the program itself.
We then check to see if our test suite will *pass* or *fail* on the faulty version of the program.