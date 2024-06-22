/**
 * Test: 
 * 
 * Delete a blog
 */

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const request = require('request');
const some_utils = require('./utils')
const edit_params = some_utils.edit_params

var myEnv = dotenv.config();
dotenvExpand(myEnv);

// const local_host = "http://localhost:7000";
const local_host = process.env.APP_URL;


async function create_generic_blog(){
    
    var data = {
        user_name   :'Jhon',
        user_last_n :'Doe',
        post_title  :'Post-test-to-delete',
        post_text   :'Another text from the post under the test.'  
    };

    var route = edit_params(local_host + '/post', data);

    var options = {
        'method': 'POST',
        'url': route.url
    };
    
    request(options,  (error, res) => {
        if (error) throw new Error(error);
    });
}

/**
 * This test will delete a blog by the title.
 * 
 * Also, this test will create a blog and this same
 * blog will be deleted. Avoiding dependencies or the
 * obligation to create a blog from the outside of the test.
 */
test('DELETE Route: post/:title', async ()=>{

    await create_generic_blog();

    // Now continue with the test.
    var options = {
        'method': 'DELETE',
        'url': local_host + '/post/Post-test-to-delete'
    };
    
    request(options,  (error, res) => {
        if (error) throw new Error(error);

        if(res.statusCode == 200)
            expect(JSON.parse(res.body).msg)
                .toBe("content deleted");

        else if (res.statusCode == 400)   
            expect(JSON.parse(res.body).msg).
                toBe('Error: post do not exist');        
    });
 });
