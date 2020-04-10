/**
 * Triangle checker
 * @param {object} sides Side of the Triangule or angule dimms of the Triangule
 */
function get_triangule(sides){
    let output = "Incorrect",
        all_nums = (typeof(sides.a) == "number" && typeof(sides.b) == "number" && 
            typeof(sides.c) == "number");

    if( (sides["length"] == 3) && all_nums )
        // Passing data type verificaction
        if ( sides.a == sides.c )
            output = (sides.a == sides.b ?
                "Equilateral" : "Isosceles");
        else
            if( sides.a == sides.b || sides.b == sides.c )
                output = "Isosceles";
            else
                output = "Scalene";
    
    return output;
}

/**
 * Add the length of the object as a new own attr.
 * and convert the strings in numbers or delete the property if NaN.
 * @param {object} obj 
 */
function meta_triangule(obj){
    let obj_keys = Object.keys(obj);

    obj_keys.forEach(key =>{
        let item = Number(obj[key]);
        
        if( typeof(item) == "number" && !Number.isNaN(item) && item > 0 )
            obj[key] = item;
        else
            delete obj[key];
    });

    obj["length"] = Object.values(obj).length;;

    return obj;
}

// Exporting the function to become imported outside
module.exports = {
    get_triangule: get_triangule,
    meta_triangule: meta_triangule
};

