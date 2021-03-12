const Random = require('random-js');
const stackTrace = require('stacktrace-parser');
const fs = require('fs');
const path = require('path');
const mutateStr = require('./mutate').mutateString;
const { mutateString } = require('./mutate');

class mutater {
    static random() {
        return mutater._random || fuzzer.seed(0)
    }
    
    static seed (kernel) {
        mutater._random = new Random.Random(Random.MersenneTwister19937.seed(kernel));
        return mutater._random;
    }

    static str( str )
    {
        return mutateStr(this, str);        
    }

};

function mtfuzz(iterations, seeds, testFn)
{    
    var failedTests = [];
    var reducedTests = [];
    var passedTests = 0;

    mutater.seed(0);
    
    for (var i = 1; i <= iterations; i++) {

        // Toggle between seed files
        let idx = ((i % seeds.length) + seeds.length) % seeds.length;

        // apply random mutation to seed input
        let s = seeds[ idx ];
        let mutuatedString = mutater.str(s);
        
        if( !fs.existsSync('.mutations') )
        {
            fs.mkdirSync('.mutations');
        }
        fs.writeFileSync(path.join( '.mutations', `${i}.txt`), mutuatedString);

        // run given function under test with input
        try
        {
            testFn(mutuatedString);
            passedTests++;
        }
        catch(e)
        {
            failedTests.push( {input:mutuatedString, stack: e.stack, id: i} );
        }
    }

    reduced = {};
    // RESULTS OF FUZZING
    for( var i =0; i < failedTests.length; i++ )
    {
        var failed = failedTests[i];

        var trace = stackTrace.parse( failed.stack );
        var msg = failed.stack.split("\n")[0];
        console.log( msg, trace[0].methodName, trace[0].lineNumber, `input: .mutations/${failed.id}.txt`);
        // console.log( require('child_process').execSync(`head -n3 .mutations/${i+1}.txt`).toString() );

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

exports.mtfuzz = mtfuzz;

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