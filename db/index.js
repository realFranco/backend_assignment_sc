/**
 * Data access code 
 * CRUD <=> postgreSQL 
 *
 * Instructions to manage the database:
 * 
 * Connect To postgres using the current username
 * > psql -d postgres -U "$whoami"
 * 
 * Create the db sc_p0st_n_c0ments database:
 * > CREATE DATABASE sc_p0st_n_c0ments;
 * 
 * After the DB creation, turn on the set of tables:
 * > node -p "require('./db/index.js').create_tables()"
 * 
 * To drop the set of tables, before drop the DB:
 * > node -p "require('./db/index.js').drop_tables()"
 * 
 * Drop the DB:
 * > psql -d postgres -U "$whoami"
 * > DROP DATABASE sc_p0st_n_c0ments;
 */

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const fs = require('fs');
const { Pool } = require('pg');


var myEnv = dotenv.config();
dotenvExpand(myEnv);

// Select the correct way to access into the DB
const connectionString = process.env.DB_CONN;

// Creating the Pool 
const pool = new Pool({
    connectionString: connectionString
});

function get_pool(){
    return pool
}

// > node -p "require('./db/index.js').create_tables()"
async function create_tables(){
    var queryText = fs.readFileSync("./db/create_db.sql").toString();

    // No errors reported during database creation.
    await pool.query(queryText, (error, res) => {
        if (error)
            throw error;
        else
            console.log("Tables created.");
    });
    
    await pool.end();    
}

// > node -p "require('./db/index.js').drop_tables()"
async function drop_tables(){
    var queryText = fs.readFileSync("./db/drop_db.sql").toString();
    
    await pool.query(queryText, (error, res) =>{
        if( error){
            _continue = false;
            throw error;
        }
        else
            console.log("Tables droped.");
    });

    await pool.end();
}

/**
 * Function to execute general queries over the Tables.
 * @param {*} text Set of instructions to pass.
 * @param {*} values Params of the string passed.
 */
async function query(text, values){
    
    var rslt = null;

    try{
        rslt = await pool.query(text, values);
    }catch (err){
        throw err;
    }
    
    return rslt
}

/**
 * UPDATE ORM: Given table name, a set of "new" data and the set of 
 * outs create an UPDATE query.
 * 
 * If the the last param. it is true will show the content of the 2nd and 
 * 3rd param.
 * 
 * @param {String} header 
 * @param {object} data_object 
 * @param {object} query_object 
 * @param {boolean} debug_update_query
 * @returns Object
 */
function gen_update_query(table, data_object, query_object, debug_update_query){

    // Header of the query
    var query = `UPDATE ${table} SET ` 
    var i = 1, data_keys = Object.keys(data_object)
    var out = {}
    // Clean data_object
    data_keys.forEach(key =>{
        if ( data_object[key] == '' )
            delete data_object[key]
    });

    // Set of data
    data_keys = Object.keys(data_object)
    data_values = Object.values(data_object)

    // Set the new values
    for(; i < data_keys.length + 1; i++){
        query = query + `${data_keys[i-1]} = \$${i}`

        if ( i-1 < data_keys.length-1  )
            query += ", "
    }

    query += " WHERE "
    
    // Set of conditions
    query_keys = Object.keys(query_object)
    query_values = Object.values(query_object)

    let n = query_keys.length + data_keys.length

    // Set the condition
    for(let j = 0; j < query_keys.length; i++, j++){
        query = query + `${query_keys[j]} = \$${i}`

        if ( i < n )
            query += ","
    }

    data_values = data_values.concat(query_values)

    out = {"query": query, "values": data_values}

    if (debug_update_query){
        console.log("data object: ", data_object)
        console.log("condition: ", query_object)
        console.log("out: ", out)
    }

    return out
}

module.exports = {
    create_tables,
    drop_tables,
    query,
    get_pool,
    gen_update_query
};
