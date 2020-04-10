/**
 * Dev: f97gp1@gmail.com
 * Description: Endpoint Triangule
 * Filename: /routes/triangule.js
 */

const express = require('express');
const utils = require('../utils/utilities.js');
const path = require('path');

var access = express.Router();

access.get('/', (req, res) =>{
    // Render the html
    // res.send('> Triangule endpoint');
    console.log(`> Welcome to Triangules!`);
    res.sendFile('triangule.html', { root: path.join(__dirname, '../view/triangule/') });
});


access.get('/tri_handler',  (req, res) =>{
    let tri_object = utils.meta_triangule( req.query );    
    let out = utils.get_triangule( tri_object );

    console.log(`> Type of triangule: ${out}!`);

    res.status(200).send({'triangule_type': out})
});


module.exports = access;
