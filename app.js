/**
 * Dev: f97gp1@gmail.com
 * Description: Entry point for the set of endpints avaliable over Sport Compass.
 * Filename: app.js
 */

const express = require('express');
const triangule = require('./routes/triangule');
const path = require('path');
const blog = require('./routes/blog');

const app = express();
var port = 7000;


app.use('/triangule', triangule);
app.use('/blog', blog);
app.use( express.static('public') )

app.get('/',  (req, res) => {
    console.log(`> Welcome to the main.`);

    res.sendFile('main.html', { root: path.join(__dirname, './view/main/') });
}); 

app.listen(port, () => {
    console.log(`Backend Assignment: Sport Compass at -> http://localhost:${port}`);
});

module.exports = app;
