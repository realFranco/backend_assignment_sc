/**
 * Dev: f97gp1@gmail.com
 * Description: Endpoint Triangule
 * Filename: /routes/triangule.js
 */

const express = require('express');
const utils = require('../utils/utilities.js');
const path = require('path');

var access = express.Router();

// triangule/
access.get('/', (req, res) =>{
    res.sendFile('triangule.html', { root: path.join(__dirname, '../view/triangule/') });
});

// triangule/tri_handler
access.get('/tri_handler',  (req, res) =>{
    let tri_object = utils.meta_triangule( req.query );    
    let out = utils.get_triangule( tri_object );

    res.status(200).send({'triangule_type': out})
});


module.exports = access;
