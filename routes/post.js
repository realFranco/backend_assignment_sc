/**
 * Dev: f97gp1@gmail.com
 * Description: Endpoint's Post
 * Filename: /routes/post.js
 */

const db = require('../db/index');
const utils = require('../utils/utilities.js');
const { v4: uuidv4 } = require('uuid'); 
const path = require('path');
const fs = require('fs')
const express = require('express');

const multer  = require('multer');
const bodyParser = require('body-parser');


var access = express.Router();

// configure multer
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
// render all the post and show it
access.get('/',  (req, res) =>{

    console.log(`> Welcome to post!`);
    // res.send('Hello Blog!');
    res.sendFile('post.html', { root: path.join(__dirname, '../view/post/') });
});

// > post/create 
// render the formularie to put data
access.get('/create',  (req, res) =>{
    console.log(`> Creating a post!`);
    // res.send('Hello Blog!');
    res.sendFile('make_post.html', { root: path.join(__dirname, '../view/post/') });

});

// > post/scan [?limit=number]
// show all the post on the db
// adding a "limit" params the quantity of row to
// send will be limited
access.get('/scan', async (req, res) =>{
    
    var _err = false
    var limit = req.query.limit
    var query = {}
    var query_text = "SELECT * FROM Post"

    try{
        if (limit)
            query_text = query_text + " LIMIT " + String(limit);

        query = await db.query(query_text)        
    }catch(err){
        _err = err
    }

    return res
        .status( !_err ? 200 : 400 )
        .send( !_err ? 
            {"data": query.rows } :
            {"msg":  String(_err) } );
});

// > post/create_handler
// endpoint to  create a post and persist data
// https://attacomsian.com/blog/express-file-upload-multer#
access.post('/create_handler', async (req, res) =>{

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
        "user_role": req.query.user_role    // "public"
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
                if (file){
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
                                Post(id_post, id_user, id_resource, title, text, created, avaliable)
                                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                                Object.values(blog_values))

                await client.query("COMMIT");
            }
            catch(err){
                await client.query("ROLLBACK") // No land_space to rollback, only rollback
                // File it is optional
                if (file){
                    dir = file.destination
                    fs.unlinkSync(file.path)
                    fs.rmdir(dir, (err) =>{
                        if (err)
                            console.log("Problem erasing: ", err)
                    });
                }
                _err = err
            }
        }

        return res
            .status( !_err ? 200 : 400 )
            .send( !_err ? 
                {"msg": "content created"} :
                {"msg":  String(_err) } );
    })
});

// > post/my-title
// given a exact title return the post
access.get('/:title', async (req, res) =>{

    var _err = false;
    var query = {}
                
    try{
        query = await db.query(
                `SELECT * 
                FROM Post 
                WHERE title = $1`, Object.values(req.params))
    }catch(err){
        _err = err
    }

    return res
        .status( !_err ? 200 : 400 )
        .send( !_err ? 
            {"data": query.rows[0] } :
            {"msg":  String(_err) } );

});

// > example post/my-title
// edit the post content using params from the request and persits the changes
// Only 4 elements can modified [title, text, avaliable, resource]
access.post('/:title', async (req, res) =>{

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
                        `SELECT title
                        FROM Post
                        WHERE title = $1`, [req.params.title])
                
                if ( query_res.rowCount == 0 )
                    throw new Error("post trying to edit do not exist")

                // Check if the title to set already exist
                query_res = await db.query(`SELECT title
                            FROM Post
                            WHERE title = $1`, [req.query.title])
                
                console.log("Edit: ", query_res.row)

                if ( query_res.rowCount == 0 ){
                    
                    if (file){
                        id_resource = uuidv4();
                        await db.query(
                            `INSERT INTO 
                                Resource(id_resource, route_name)
                                VALUES ($1, $2)`, 
                            [ id_resource, file.path.slice(6,)  ])
                        
                        req.query  = Object.assign(req.query, {id_resource})
                        console.log(req.query)
                    }

                    // Make use of my own ORM
                    // req.query can contain variations, write a static query
                    // will not be usefull in this case
                    query_generated = db.gen_update_query(table_name, req.query, 
                        req.params, false)

                    query_res = await db.query(query_generated.query, query_generated.values)
                }else{
                    // Title not avaliable
                    throw new Error("duplicate key title please set a distinct one")
                }
            }catch(err){
                _err = err

                if (file){
                    dir = file.destination
                    fs.unlinkSync(file.path)
                    fs.rmdir(dir, (err) =>{
                        if (err)
                            console.log("Problem erasing: ", err)
                    });
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
// para [id_post] given a post id, delete the post and
// the post components, points and comments
access.delete('/', async (req, res) =>{
    var _err = false
    var id_post = req.query.id_post
    var query = {}, file = [], temp_path = "", temp_dir ="";

    try{
        // Query the resource & user associated with the post
        query = await db.query(
            `SELECT id_resource, id_user 
            FROM Post 
            WHERE id_post = $1`, [ id_post ])

        if ( await query.rowCount == 0 )
            throw new Error("post do not exist")
        
        // Check the route of the file to delete
        file = await db.query(
            `SELECT route_name FROM Resource
            WHERE id_resource = $1`, [ query.rows[0].id_resource ])
        
        // Delete the post before the resource and the user.
        await db.query(`
            DELETE FROM Post
            WHERE id_post = $1`, [ id_post ])
    
        // Deleting comments from Post (all of it)
        await db.query(
            `DELETE FROM Commentary 
            WHERE id_post = $1`, [ id_post ])

       
        if ( await query.rowCount == 1 ){
            // Exist a user and (sometimes) a resource, then delete it
            await query.rows.forEach( async row => {
                if( row.id_resource )
                    await db.query(
                        `DELETE FROM Resource 
                        WHERE id_resource = $1`, [ row.id_resource ])
                
                // Delete a set of commentary created by the user.
                // If this not happend,  
                // violates foreign key constraint "add_commentary"
                await db.query(
                    `DELETE FROM Commentary 
                    WHERE id_user = $1`, [ row.id_user ])  // add OR id_post = $2

                await db.query(
                    `DELETE FROM "User"
                    WHERE id_user = $1`, [ row.id_user ])
            });
        }

        // Delete the image and the folder, only if all the queries
        // will be ended without problems
        temp_path = './public'+ file.rows[0].route_name
        temp_dir = temp_path.split("/")
        temp_dir.pop()
        temp_dir = temp_dir.join("/")

        fs.unlinkSync(temp_path.slice(2,))
        fs.rmdir(temp_dir, (err) =>{
            if (err)
                console.log("Problem erasing: ", err)
        });
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
