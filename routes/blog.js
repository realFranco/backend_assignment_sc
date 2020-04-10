/**
 * Dev: f97gp1@gmail.com
 * Description: Endpoint Blog
 * Filename: /routes/blog.js
 * 
 * References: https://expressjs.com/en/4x/api.html#res
 */

var express = require('express');
var access = express.Router();

access.get('/',  (req, res) =>{

    console.log(`> Welcome to blogs!`);
    res.send('Hello Blog!');

});

module.exports = access;
