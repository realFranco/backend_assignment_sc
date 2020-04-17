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

// > commentary/by_post
// param [id_post]
// get all commentary from a post
comm.get("/by_post", (req, res) =>{
    console.log(`> Welcome to commentary!`);

    res.send('welcome to commentary');
})

// > commentary/create
comm.post("/create", async (req, res) =>{
    var comm_data = {
        "id_comm" : uuidv4(), // Raw declaration the id
        "id_user" : req.query.id_user,
        "id_post" : req.query.id_post,
        "text"    : req.query.comm_text,
        "created" : new Date()
    }, _err = false;

    try{
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

// > commentary/edit
// edit commentary given the id
// [text] only that params can be edited
comm.post("/edit", async (req, res) =>{
    var query_param = {
        "text": req.query.text,
        "edited" : new Date()
    }, query_cond = {
        "id_comentary" : req.query.id_comentary,
    }
    query_generated = {},
    _err = false;

    try{
        query_generated = db.gen_update_query("Commentary", query_param, 
            query_cond, false)

        await db.query(query_generated.query, query_generated.values)        
    }catch(err){
        _err = err
    }

    return res
            .status( !_err ? 200 : 400 )
            .send( !_err ? 
                {"msg": "commentary editd"} :
                {"msg":  String(_err) } );
})

// > commentary/
// params [id_comentary, id_post] only one params
// delete a commntary given the id
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
            throw new Error(`${_pre_attr} do not exist`)

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
