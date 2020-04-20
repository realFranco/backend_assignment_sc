/**
 * Convert a Object into a correct url, to trigger an
 * API route.
 * 
 * @param {String} endPoint Route of the endpoint
 * @param {Object} filter Object, query parameters for the query.
 */
function edit_params(endPoint, filter){

    let params = "";
    let goTo = "";

    for(var key in filter){
        item = filter[key]
        if (item != "")  params += `${key}=${item}&`
    }
    params = params.slice(0,-1);
    goTo = endPoint + "?" +params;

    return {
        "url": goTo,
        "filter": filter
    };
}

module.exports = {
    edit_params
};
