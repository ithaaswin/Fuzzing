
function mutateString (mutator, val) {


    val = val.replace(/'\w+'/g, 33);

    var array = val.split('');


    if( mutator.random().bool(0.01) )
    {
        return '';
    }


    if( mutator.random().bool(0.25) )
    {
        //array.reverse();
    }

    if( mutator.random().bool(0.75) )
    {

    }
    // With 25% chance, remove a random set of characters, from a random start position
    if( mutator.random().bool(.25) )
    {
        // 2. HINT use `mutator.random().integer(0,99)`
        array.splice( mutator.random().integer(0,array.length), 99 );
    }

    // add random characters
    // 3. mutator.random().string(10)
    if( mutator.random().bool(.25) )
    {
    array.splice( mutator.random().integer(0,array.length), 0, ...mutator.random().string(10) );
    }

    return array.join('');
}

exports.mutateString = mutateString;
