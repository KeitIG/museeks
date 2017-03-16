import http from 'axios';

const rpc = (data) => http({
    method : 'POST',
    url : 'http://localhost:54321/api/rpc',
    body : data,
    json : true
});

const modelOperations = ['find', 'findOne', 'insert', 'update', 'remove'];

// libraries to call remotely
const libraries = {
    playlist : modelOperations,
    track : modelOperations
}

const lib = Object.keys(libraries).reduce((lib, library) => {

    const functions = libraries[library];

    // create a handler for each rpc function
    const rpcFunctions = functions.reduce((hash, fn) => {
        hash[fn] = function() {
            return rpc({ library, fn, arguments });
        }
        return hash;
    }, {});

    lib[library] = rpcFunctions;

    return lib;
}, {});

export default lib;
