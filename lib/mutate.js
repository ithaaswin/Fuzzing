
function mutateString (fuzzer, val) {
    var array = val.split('');

    if( fuzzer.random().bool(0.05) )
    {
        // 1. REVERSE
    }
    // With 25% chance, remove a random set of characters, from a random start position
    if( fuzzer.random().bool(0.25) )
    {
        // 2. fuzzer.random.integer(0,99)
    }

    // add random characters
    // 3. fuzzer.random().string(10)

    return array.join('');
}

exports.mutateString = mutateString;
