/**
 * Test: 
 * 
 * Creation of new blog.
 */

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const request = require('request');
const fs = require('fs');
const some_utils = require('./utils')
const edit_params = some_utils.edit_params

var myEnv = dotenv.config();
dotenvExpand(myEnv);

// const local_host = "http://localhost:7000";
const local_host = process.env.APP_URL;

/**
 * This test will create a Post. The endpoint that let create content
 * can return two diferents status codes, this test will catch both.
 */
test('Create a Blog entry using image at the request.', async () => {

    var data = {
        user_name   :'Jhon',
        user_last_n :'Doe',
        post_title  :'Post-test',
        post_text   :'Text from the post under the test.'  
    };

    var route = edit_params(local_host + '/post', data);

    // Static declaration of the resource (image)
    var options = {
        'method': 'POST',
        'url': route.url,
        'headers': {},
        formData: {
            'cover_img': {
                'value': fs.createReadStream('./public/icons/sc.png'),
                'options': {
                    'filename': 'sc.png',
                    'contentType': null
                }
            }
        }
    };

    request(options,  (error, res) => {
        if (error) throw new Error(error);

        if(res.statusCode == 200)
            expect(JSON.parse(res.body).msg)
                .toBe("content created");

        else if (res.statusCode == 400){
            expect(JSON.parse(res.body).msg)
            .toMatch(/directory|duplicate|error|Error/);
        }
            
    });
  });
