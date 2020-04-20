/**
 * Dev: f97gp1@gmail.com
 * Description: Endpoint's Comments
 * Filename: /routes/commentary.js
 * 
 * An user can make 1 or many commentaries over a post.
 * 
 * This route will help to handle it.
 */

const db = require('../db/index');
const { v4: uuidv4 } = require('uuid');
const express = require('express');

var comm = express.Router();


// > Create a a commentary
comm.post("/", async (req, res) =>{
    var comm_data = {
        "id_comm" : uuidv4(),
        "id_user" : req.query.id_user,
        "post_title_id" : req.query.post_title, // title or id from a post
        "text"    : req.query.comm_text,
        "created" : new Date()
    }, user_values = {}, _err = false;

    try{
        if( !comm_data.id_user ){
            if( !req.query.user_name  )
                throw new Error("No user defined")
            else{
                // Insert new user
                user_values = {
                    "id_user" : uuidv4(),
                    "name" : req.query.user_name,
                    "last_name" : "",
                    "created" : new Date(),
                    "role" : "commentor"
                }
                
                comm_data["id_user"] = user_values["id_user"]

                await db.query(
                    `INSERT INTO 
                        "User" (id_user, name, last_name, created, role) 
                        VALUES ($1, $2, $3, $4, $5)`,
                    Object.values(user_values))
            }
        }else{
            // Validations before creation
            query_user = await db.query(
                `SELECT id_user
                FROM "User"
                WHERE id_user = $1`, [ comm_data.id_user ])

            if (query_user.rowCount == 0)
                throw new Error("User row do not exist")
        }
            
        query_post = await db.query(
            `SELECT id_post
            FROM Post
            WHERE title = $1`, [ comm_data.post_title_id ])

        if (query_post.rowCount == 0)
            throw new Error("Post sended do not exist")
        
        // Put the id_post in the correct possition to insert
        comm_data.post_title_id = query_post.rows[0].id_post
        
        await db.query(
                `INSERT INTO 
                Commentary(id_comentary, id_user, id_post, text, created)
                VALUES ($1, $2, $3, $4, $5)`, Object.values(comm_data))
        
    }catch(err){
        _err = err
    }

    return res
            .status( !_err ? 200 : 400 )
            .send( !_err ? 
                {"msg": "commentary created"} :
                {"msg":  String(_err) } );
})

// Edit a commentary
comm.put("/", async (req, res) =>{
    var query_param = {
        "text": req.query.text,
        "edited" : new Date()
    }, query_cond = {
        "id_comentary" : req.query.id_comentary,
    }
    query = query_generated = {},
    _err = false;

    try{
        query = await db.query(`
            SELECT text 
            FROM Commentary 
            WHERE id_comentary = $1`, [ query_cond.id_comentary ])
        
        if( query.rowCount == 0 )
            throw new Error("commentary do not exist")

        query_generated = db.gen_update_query("Commentary", query_param, 
            query_cond, false)

        await db.query(query_generated.query, query_generated.values)        
    }catch(err){
        _err = err
    }

    return res
            .status( !_err ? 200 : 400 )
            .send( !_err ? 
                {"msg": "commentary edited"} :
                {"msg":  String(_err) } );
})

// Delete a commentary
// If id_comentary is passed -> only that commentary will be deleted
// If id_post is passed -> del. all commentaries from that post
comm.delete("/", async (req, res) =>{
    var comm_data = {
        "id_comentary" : req.query.id_comentary, 
        "id_post" : req.query.id_post 
    }, query = [], _err = false, 
    _pre_query = {}, _pre_attr = ""
    _temp_iterator = []; // Helpfull to avoid the replicate of code.

    try{
        if ( comm_data.id_post ){
            _pre_query = comm_data.id_post
            _pre_attr = "post"
        }
        else if ( comm_data.id_comentary ){
            _pre_query = comm_data.id_comentary
            _pre_attr = "comentary"
        }
        else
            throw new Error("no params avaliable during call")
        
        query = await db.query(
            `SELECT id_comentary
            FROM Commentary
            WHERE id_${_pre_attr} = $1`, [ _pre_query ])
        
        if ( query.rowCount == 0 )
            throw new Error(`${_pre_attr} row do not exist`)

        await query.rows.forEach(async (comm) => {
            await db.query(
                `DELETE FROM Commentary 
                WHERE id_comentary = $1`, [comm.id_comentary])
        });
    }catch(err){
        _err = err
    }

    return res
            .status( !_err ? 200 : 400 )
            .send( !_err ? 
                {"msg": "commentary deleted"} :
                {"msg":  String(_err) } );
})

module.exports = comm;
