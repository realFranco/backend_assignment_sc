/**
 * Test: 
 * 
 * Edit a blog
 */

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const request = require('request');
const fs = require('fs');
const some_utils = require('./utils');
const edit_params = some_utils.edit_params;

var myEnv = dotenv.config();
dotenvExpand(myEnv);

// const local_host = "http://localhost:7000";
const local_host = process.env.APP_URL;

async function create_generic_blog(){
    
    var data = {
        user_name   :'Jhon',
        user_last_n :'Doe',
        post_title  :'Post1',
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
 * Assuming the a post named "Post1" has been created in the past.
 */
test('PUT Route: post/:title', async () =>{

    var post_to_edit = '/Post1'

    create_generic_blog();

    var data = {
        title       :'New-Post1',
        text        :'Assuming changes over the post',
        avaliable   :'true'
    };

    var route = edit_params(local_host + '/post' + post_to_edit, data);

    // Static declaration of the resource (image)
    var options = {
        'method': 'PUT',
        'url': route.url,
        formData: {
            'cover_img': {
                'value': fs.createReadStream('./__test__/img_post.jpg'),
                'options': {
                    'filename': 'img_post.jpg',
                    'contentType': null
                }
            }
        }
    };

    request(options,  (error, res) => {
        if (error) throw new Error(error);

        if(res.statusCode == 200)
            expect("content updated").toBe(JSON.parse(res.body).msg);

        else if (res.statusCode == 400){
            expect(JSON.parse(res.body).msg)
            .toMatch(/directory|duplicate|error|Error/);
        }
    });
});

