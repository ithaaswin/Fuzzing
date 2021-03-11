const Random = require('random-js');
const stackTrace = require('stacktrace-parser');

const mutate = require('./mutate').mutateString;

class fuzzer {
    static random() {
        return fuzzer._random || fuzzer.seed(0)
    }
    
    static seed (kernel) {
        fuzzer._random = new Random.Random(Random.MersenneTwister19937.seed(kernel));
        return fuzzer._random;
    }

    static mutateString( str )
    {
        return mutate(this, str);        
    }

};

function mutationTesting(iterations, inputFn, testFn)
{    
    var failedTests = [];
    var reducedTests = [];
    var passedTests = 0;

    fuzzer.seed(0);
    
    for (var i = 0; i < iterations; i++) {

        let str = inputFn();
        let mutuatedString = fuzzer.mutateString(str);
        
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

    reduced = {};
    // RESULTS OF FUZZING
    for( var i =0; i < failedTests.length; i++ )
    {
        var failed = failedTests[i];

        var trace = stackTrace.parse( failed.stack );
        var msg = failed.stack.split("\n")[0];
        console.log( msg, trace[0].methodName, trace[0].lineNumber );

        let key = trace[0].methodName + "." + trace[0].lineNumber;
        if( !reduced.hasOwnProperty( key ) )
        {
        }
    }

    console.log( "passed {0}, failed {1}, reduced {2}".format(passedTests, failedTests.length, reducedTests.length) );
    
    for( var key in reduced )
    {
        console.log( reduced[key] );
    }

}

exports.mutationTesting = mutationTesting;
//exports.fuzzer = fuzzer;

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}