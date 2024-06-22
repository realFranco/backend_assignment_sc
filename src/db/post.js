/**
 * Filename: db/post.js
 * 
 * Description:
 * 
 * functions that handle the Post table resources
 * usefull to decrease the complexitiy over the main endpoints
 * or routes.
 */

// const db = require('../db/index');
const fs = require('fs')
const utils = require('../utils/utilities');

/**
 * Delete the a post from the table correctly
 * 
 * This function open a new pool of connections
 * at the end of the execution, ending with errors or not
 * close or end the pool.
 * 
 * @param {Pool Object} client Pool of the db, need to exec. queries 
 *  from the actual user.
 * @param {String} title Title of the post to delete
 */
async function delete_post(client, title){
    var query = params = file = {};
    var temp_dir = temp_path = "";

    // Delete the Post
    try{
        query = await client.query(
            `SELECT id_post, id_resource, id_user 
            FROM Post 
            WHERE title = $1`, [ title ])
        
        if ( await query.rowCount == 0 )
            throw new Error("post do not exist")
        
        params = await query.rows[0]
        
        // Check the route of the file to delete
        file = await client.query(
            `SELECT route_name 
            FROM Resource
            WHERE id_resource = $1`, [ params.id_resource ])
        
        commentors = await client.query(
            `SELECT comm.id_user
            FROM "User" usr, 
                Commentary comm
            WHERE 
                comm.id_post = $1 AND 
                usr.id_user = comm.id_user`, [ params.id_post ])

        // Delete section
        if ( await file.rowCount ){
            try{
                temp_path = './public'+ file.rows[0].route_name
                temp_dir = temp_path.split("/")
                temp_dir.pop()
                temp_dir = temp_dir.join("/")

                if( fs.existsSync(temp_path) )
                    utils.delete_file(temp_path.slice(2,), temp_dir)
            }catch(err){
                throw err
            }
        }

        // Deleting comments from the Post
        await client.query(
            `DELETE FROM Commentary 
            WHERE id_post = $1`, [ params.id_post ])

        // Delete the Post
        await client.query(`
            DELETE FROM Post
            WHERE id_post = $1`, [ params.id_post ])
        
        // Delete the user creator of the Post
        await client.query(
            `DELETE FROM "User"
            WHERE id_user = $1`, [ params.id_user ])
        
        // Delete all the commentors from the post
        if( commentors.rowCount ){
            await commentors.rows.forEach(async row =>{
                await client.query(
                    `DELETE FROM "User"
                    WHERE id_user = $1`, [ row.id_user ])
            });
        }
            
        // Delete the resource from the Post
        await client.query(`
            DELETE FROM Resource
            WHERE id_resource = $1`, [ params.id_resource ])

        
    }catch(err){
        console.log("delete err:", err)
        throw err
    }
}

/**
 * Get all the resources from a post given the title.
 * 
 * @param {Object} client Database client to make the queries.
 * @param {String} title Title of the post to fetch the data.
 * @param {Boolean} all_resources If true all the contents will
 *  returned, in the other hand, only post info will be returned.
 */
async function get_post_n_resources(client, title, all_resources){
    var post = comments = {}
        out = {};
                
    try{
        post = await client.query(
                `SELECT 
                    -- Post content
                    post.id_post,
                    post.title      as post_title,
                    post.text       as post_text,
                    post.created,

                    -- User content
                    usr.id_user, 
                    usr.name        as post_creator_name, 
                    usr.last_name   as post_creator_l_name,

                    -- No Commentary rows on this query

                    -- Resource content
                    rsc.route_name  as post_cover_img
                FROM
                    Post post
                        INNER JOIN "User" usr
                        ON post.id_user = usr.id_user

                        INNER JOIN Resource rsc
                        ON post.id_resource = rsc.id_resource
                WHERE 
                    post.title = $1`, [ title ])

        if( all_resources )
            comments = await client.query(
                    `SELECT 
                        -- Commentary
                        comm.id_comentary,
                        comm.text       as comm_text,
                        comm.created    as comm_created,
                        comm.edited     as comm_edited,

                        -- User content
                        usr.id_user,
                        usr.name        as comm_creator_name, 
                        usr.last_name   as comm_creator_l_name
                        
                        -- No Resource rows on this query

                        -- No Post rows on this query
                    FROM 
                        Post post
                            INNER JOIN "User" usr
                            ON post.id_user = usr.id_user

                            INNER JOIN Commentary comm
                            ON post.id_post = comm.id_post
                    WHERE 
                        post.title = $1`, [ title ])
    
        if( post.rowCount > 0 ){
            if( comments.rowCount > 0 )
                post.rows[0].comments = comments.rows // Array <Object>
            out = post.rows[0]
        }    
        
        return out
    }catch(err){
        throw err
    }
}

module.exports = {
    delete_post,
    get_post_n_resources
};
