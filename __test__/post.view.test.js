/**
 * Test: 
 * 
 * View of new blog.
 */

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const request = require('request');

var myEnv = dotenv.config();
dotenvExpand(myEnv);

// const local_host = "http://localhost:7000";
const local_host = process.env.APP_URL;

/** 
 * This unit test will manage two differents status codes returned
 * by the endpoint.
 */
test('GET Route: post/:title', async () => {
    

    var options = {
        'method': 'GET',
        'url': local_host + '/Post-test'
    };

    request(options,  (error, res) => {
        if (error) throw new Error(error);

        
        if(res.statusCode == 200)
            expect(JSON.parse(res.body).data.post_title)
                .toBe("Post-test");

        else if (res.statusCode == 400)
            expect(JSON.parse(res.body).msg).
                toBe('Error: no post match with that title name');
    });
  });
