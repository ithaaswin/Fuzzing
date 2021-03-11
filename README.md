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

```| {type: 'terminal'}
```

Running `node main.js` will output:

    passed 1000, failed 0, reduced 0
    
The program is simply reading an input file and for a 1000 times

* asking a fuzzer to randomly change the string
* passing the fuzzed input to marqdown and simply checking for exceptions being thrown (our *test oracle*):

```javascript
    var markDown = fs.readFileSync('test.md','utf-8');
    //var markDown = fs.readFileSync('simple.md','utf-8');

    for (var i = 0; i < 1000; i++) {

        var mutuatedString = fuzzer.mutate.string(markDown);

        try
        {
            marqdown.render(mutuatedString);
            passedTests++;
        }
        catch(e)
        {
            failedTests.push( {input:mutuatedString, stack: e.stack} );
        }
    }
```

```js | {type: 'file', path: 'lib/mutate.js'}
    function mutateString (fuzzer, val) {
        // MUTATE IMPLEMENTATION HERE
        var array = val.split('');

        if( fuzzer.random().bool(0.05) )
        {
            // REVERSE
        }
        // With 25% chance, remove a random set of characters, from a random start position
        if( fuzzer.random().bool(0.25) )
        {
            //fuzzer.random.integer(0,99)
        }

        // add random characters
        // fuzzer.random().string(10)

        return array.join('');
    }

    exports.mutateString = mutateString;
```


But the fuzzer right now is just returning the same string!

### Generating Fuzzed Input Files

Now, we need to generate mutations to the input file in order to discover failures. Add the following functionality:

1. With 5% chance, reverse the input string.

2. Alternate between templates (simple.md/test.md)

3. With 25% chance, remove a random set of characters, from a random start position:
  HINT: [See `Array.splice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
  HINT: See `fuzzer.random.integer(0,99)` for creating a random number between 0-99.

4. With a 25% chance, insert random characters into the string
  HINT: [See insert array into another](http://stackoverflow.com/questions/7032550/javascript-insert-an-array-inside-another-array)
  HINT: See `fuzzer.random.string(10)` for creating a random string of length 10.

5. With a 5% chance, repeat. HINT: `do/while`

See [random-js](https://www.npmjs.com/package/random-js) for tips on using some helpful random utilities.
```javascript
// for example, this will execute true for 5% of evaluations.
if( fuzzer.random.bool(0.05) )
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
