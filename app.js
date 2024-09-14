var express = require('express');
var app = express();
var mongo = require('mongodb');
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');

mongoose.connect('mongodb+srv://admin:HTN2024@images.ogr4m.mongodb.net/images?retryWrites=true&w=majority&appName=images')
    .then(() => {
        console.log('Connected to MongoDB...');
        app.listen(3000, () => console.log('Server started on port 3000'));
    })
    .catch(err => console.error('Could not connect to MongoDB...'));

// Create a schema
var Schema = mongoose.Schema;
var imageSchema = new Schema({
    name: String,
    img: {
        data: Buffer,
        contentType: String
    }
});

var Image = mongoose.model('Image', imageSchema);

app.post('/upload', (req, res) => {
    var newImage = new Image();
    newImage.name = req.body.name;
    newImage.img.data = fs.readFileSync(path.join(__dirname + '/uploads/' + req.body.filename));
    newImage.img.contentType = 'image/jpeg';
    newImage.save((err, image) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send('Image saved successfully!');
        }
    });
});
