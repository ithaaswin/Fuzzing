
function mutateString (mutator, val) {
    var array = val.split('');

    if( mutator.random().bool(0.05) )
    {
        // 1. REVERSE
        array.reverse();
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
