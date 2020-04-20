/**
 * Dev: f97gp1@gmail.com
 * 
 * Filename: utils/utilities.js
 * 
 * Description:
 * Set of functions that help to decrese the complexitiy
 * over the main files.
 * 
 * This functions can be imported from the outside
 */


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

var callback = (error, res) => {
    if (error !== null)
        return "Caught error: " + String(error)

    return res;
};

/**
 * Grant the correct extension of an image file
 * @param   {String} attr 
 * @return  {Boolean}
 */
function check_img_extension(attr){
    // Adding raster and vector img files formats

    let ext_avaliable = [
        "bmp", "gif", "jpg", "jpeg", "png", "webp",
        "svg", "svgz"]

    return ext_avaliable.includes(
        attr.split(".").pop().toLowerCase())
}

function randomValueHex(len) {
    // lazy-loading
    // stackoverflow.com/questions/9132772/lazy-loading-in-node-js
    let crypto = require('crypto');

    return crypto
      .randomBytes(Math.ceil(len / 2))
      .toString('hex') // convert to hexadecimal format
      .slice(0, len) // return required number of characters
}

/**
 * Delete the file from a folder and then, the folder.
 * 
 * @param {String} folder Relative route of the folder to delete.
 * @param {String} file Relative route of the file.
 */
function delete_file(folder, file){
    let fs = require('fs')

    try{
        fs.unlinkSync(folder)
        fs.rmdir(file, err =>{
            if (err)
                throw err
        });
        
    }catch(err){
        throw err
    }
    
    return true
}

// Exporting the function to become imported outside
module.exports = {
    get_triangule,
    meta_triangule,
    callback,
    check_img_extension,
    randomValueHex,
    delete_file
};
