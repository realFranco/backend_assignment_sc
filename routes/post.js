/**
 * Dev: f97gp1@gmail.com
 * Description: Endpoint's Post
 * Filename: /routes/post.js
 */

const db = require('../db/index');
const post_db = require('../db/post')
const utils = require('../utils/utilities.js');
const { v4: uuidv4 } = require('uuid'); 
const path = require('path');
const fs = require('fs')
const express = require('express');

const multer  = require('multer');
const bodyParser = require('body-parser');


var access = express.Router();

// Configure multer
// The disk storage, give full control on storing files to disk.
var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            let route = "./public/img_cover/", go = false
            let r_folder = ""

            // Create folder, the while avoid the match of folders
            while( !go ){
                r_folder = utils.randomValueHex(8)
                if ( !fs.existsSync(route + r_folder) ){
                    go = true // break the while
                    fs.mkdirSync(route + r_folder)
                    cb(null, route + r_folder)
                }
            }
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })

var upload = multer({ 
    fileFilter : (req, file, cb) =>{
        _pass = utils.check_img_extension( file.originalname );
        if ( !_pass )
            return cb(new Error('Image extension not allowed'), _pass);
        cb(null, _pass)
    
    },
    // limits: { fileSize: 10 * 1024 }, // 10 mb
    storage: storage,
}).single('cover_img');

access.use(bodyParser.json());
access.use(bodyParser.urlencoded({ extended: true }));

// > post/ 
// Render partially all the post and show it
access.get('/main',  (req, res) =>{
    res.sendFile('post.html', { root: path.join(__dirname, '../view/post/') });
});

// > post/create 
// Send a .html file as a resposne
access.get('/create',  (req, res) =>{
    res.sendFile('make_post.html', { root: path.join(__dirname, '../view/post/') });
});

// > post/my-title/view
// Partial render view of a post
access.get('/:title/view',  (req, res) =>{
    res.sendFile('one_post.html', { root: path.join(__dirname, '../view/post/') });
});

// Show all the rows from table Post
// If limit is passed, will limit the size of rows to show.
// No exist order over the way of send the content
// No exist pagginnation on the results, this is a 
// complete scan of the tables from the project.
access.get('/', async (req, res) =>{
    
    var _err = false
    var _t_query = {}, query = []

    try{
        query_title = await db.query("SELECT title FROM Post");
        for(let i = 0; i < query_title.rowCount; i++){
            title = query_title.rows[i].title

            _t_query = await post_db.get_post_n_resources( db, title, false )

            // Weird check to the object it is empty !!
            if( Object.entries( _t_query ).length  )
                query.push( _t_query )
        }
        if( query == [] )
            throw new Error("no data returned")

    }catch(err){
        _err = err
    }

    
    return res
        .status( !_err ? 200 : 400 )
        .send( !_err ? 
            {"data": query } :
            {"msg":  String(_err) } );
});

// Create a post
access.post('/', async (req, res) =>{

    var _id_user = null,
        _id_post = null,
        _id_resource = null,
        _err = false,
        client = db.get_pool();

    var user_values = {
        "id_user" : _id_user,
        "user_name": req.query.user_name,
        "user_last_n": req.query.user_last_n,
        "date" : new Date(),
        "user_role": "public"
    },
        blog_values = {
            "id_post" : _id_post,
            "id_user" : _id_user,
            "id_resource" : _id_resource,
            "post_tittle" : req.query.post_title,
            "post_text": req.query.post_text,
            "date": new Date(),
            "avaliable": true                    // Post.avaliable
        };
                
    upload(req, res, async function (err) {
        
        if (err instanceof multer.MulterError)
            _err = "Error during uploading"
        else if (err)
            _err = String(err)
        else{
            // All clear
            file = req.file
            try{
                await client.query("BEGIN");

                // Updating the user object
                blog_values["id_user"] = user_values["id_user"] = uuidv4();
                
                await client.query(
                        `INSERT INTO 
                            "User" (id_user, name, last_name, created, role) 
                            VALUES ($1, $2, $3, $4, $5)`,
                        Object.values(user_values))
                
                // The resource it is optional
                if ( file ){
                    blog_values["id_resource"] = _id_resource = uuidv4();
                    await client.query(
                        `INSERT INTO 
                            Resource(id_resource, route_name)
                            VALUES ($1, $2)`, 
                        [ _id_resource, file.path.slice(6,) ])
                }

                blog_values["id_post"] = uuidv4();
                await client.query(
                            `INSERT INTO 
                                Post(id_post, id_user, id_resource, 
                                    title, text, created, avaliable)
                                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                                Object.values(blog_values))

                await client.query("COMMIT");
            }
            catch(err){
                await client.query("ROLLBACK") // No land_space to rollback, only rollback
                _err = err

                // File it is optional
                if (file)
                    try{
                        _del = utils.delete_file(file.path, file.destination)
                    }catch(err){
                        _err = err
                    }
            }
        }

        return res
            .status( !_err ? 200 : 400 )
            .send( !_err ? 
                {msg: "content created"} :
                {msg:  String(_err) } );
    })
});

// Show a post using the title as parameter
access.get('/:title', async (req, res) =>{

    var _err = false,
        query = {};
    
    try{
        query = await post_db.get_post_n_resources( db, req.params.title, true )
    }catch(err){
        _err = err
    }

    return res
        .status( !_err ? 200 : 400 )
        .send( !_err ? 
            {"data": query } :
            {"msg":  String(_err) } );

});

// > example post/my-title
// edit the post content using params from the request and persits the changes
// Only 4 elements can modified [title, text, avaliable, resource]
access.put('/:title', async (req, res) =>{

    var _err = false;
    var id_resource = null;
    var table_name = "Post"
    var query_generated = {}, query_res = {}
    
    // update triger multer
    upload(req, res, async function (err){
        
        if (err instanceof multer.MulterError)
            _err = "Error during uploading"
        else if (err)
            _err = String(err)
        else{
            // All clear
            file = req.file
            try{
                // Check if the title to edit already exist
                query_res = await db.query(
                        `SELECT p.title, rsc.route_name
                        FROM Post p, Resource rsc
                        WHERE p.title = $1 AND
                            p.id_resource = rsc.id_resource`, [req.params.title])
                
                if ( query_res.rowCount == 0 )
                    throw new Error("post trying to edit do not exist")
                
                if (file){
                    id_resource = uuidv4();
                    await db.query(
                        `INSERT INTO 
                            Resource(id_resource, route_name)
                            VALUES ($1, $2)`, 
                        [ id_resource, file.path.slice(6,)  ])
                    
                    req.query  = Object.assign(req.query, {id_resource})
                }

                // Make use of my own ORM
                // req.query can contain variations, write a static query
                // will not be usefull in this case
                query_generated = db.gen_update_query(table_name, req.query, 
                    req.params, false)

                await db.query(query_generated.query, 
                    query_generated.values)

                
                try{
                    // Delete the actual image from the disc
                    temp_path = './public'+ query_res.rows[0].route_name
                    temp_dir = temp_path.split("/")
                    temp_dir.pop()
                    temp_dir = temp_dir.join("/")
    
                    utils.delete_file(temp_path.slice(2,), temp_dir)
                }catch(err){
                    throw err
                }
                
            }catch(err){
                _err = err

                if (file)
                    // Error during the insertion, delete the resource
                    try{
                        utils.delete_file(file.path, file.destination)
                    }catch(err){
                        _err = err
                    }
            }
        }

        return res
            .status( !_err ? 200 : 400 )
            .send( !_err ? 
                {"msg": "content updated" } :
                {"msg":  String(_err) } );
    });
});

// > post/
// delete all
access.delete('/', async (req, res) =>{
    var _err = false, query = {}

    try{
        query = await db.query(`SELECT title FROM Post`)
        
        for(let i = 0; i < query.rowCount; i++){
            row = query.rows[i]
            await post_db.delete_post( db, row.title )
        }
    }catch(err){
        _err = err
    }
    
    return res
        .status( !_err ? 200 : 400 )
        .send( !_err ? 
            {"msg": "Post table it is now empty" } :
            {"msg":  String(_err) } );
});

// > post/my-post
// para [id_post] given a post id, delete the post and
// the post components, points and comments
access.delete('/:title', async (req, res) =>{
    var _err = false
    var title = decodeURI(req.params.title)

    try{
        // Handler to delete the post correctly from the DB
        await post_db.delete_post( db, title )
    }catch(err){
        _err = err
    }

    return res
            .status( !_err ? 200 : 400 )
            .send( !_err ? 
                {"msg": "content deleted" } :
                {"msg":  String(_err) } );

});

module.exports = access;
