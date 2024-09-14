const express = require('express');
const app = express();
const mongo = require('mongodb');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const storage = multer.memoryStorage();
const Image = require('./models/images');
const upload = multer({storage: storage});
const cors = require('cors');
const webpush = require('web-push');
const apiKeys = {
    publicKey: 'BEtmMjDI1V-07XqGUrl9vQeSuX8XJ0l37h-cDfTxKNqA2cqkWeK_5XD3gPUok1CAbbxvfhdfmwRPj43YAvM_SK0',
    privateKey: '-YhQQ8aC3VvHFZZcVrD4vJd03orz28qETMaa96DzACQ'
};

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());


webpush.setVapidDetails(
    'mailto:moinuddinshaikh173@gmail.com',
    apiKeys.publicKey,
    apiKeys.privateKey
);

mongoose.connect('mongodb+srv://admin:HTN2024@images.ogr4m.mongodb.net/images?retryWrites=true&w=majority&appName=images')
    .then(() => {
        console.log('Connected to MongoDB...');
        app.listen(3000, () => console.log('Server started on port 3000'));
    })
    .catch(err => console.error('Could not connect to MongoDB...'));

app.get('/upload', (req, res) => {
    res.sendFile(__dirname + '/views/imageform.html');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

let database = [];
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    database.push(subscription);
    const output = {status: 'Success', message: 'Subscription saved successfully.'};
    console.log(saveSubscription(subscription));
    res.json(output);
});

const saveSubscription = async (subscription) => {
    const response = await fetch('http://localhost:3000/subscribe', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
    });
    return response.json();
};

app.get('/send-notification', (req, res) => {
    webpush.sendNotification(database[0], JSON.stringify({title: 'Hello!', body: 'This is a push notification.'}))
        .catch(err => res.send(err));
    res.json({status: 'Success', message: 'Notification sent successfully.'});
});

// Route to serve the image
app.get('/image/:id', async (req, res) => {
    const image = await Image.findById(req.params.id);
    if (image) {
        res.contentType('image/jpeg');
        res.send(image.img.data);
    } else {
        res.status(404).send('Image not found.');
    }
});

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const newImage = new Image({
        name: `${req.file.originalname.split('.')[0]}_${Date.now()}.${req.file.originalname.split('.').pop()}`,
        img: {
            data: req.file.buffer,  // Save the file as a buffer
            contentType: req.file.mimetype  // Store the content type (e.g., 'image/jpeg')
        }
    });
    newImage.save()
        .then(() => res.send('File uploaded successfully and stored in MongoDB Atlas.'))
        .catch(err => res.status(500).send('Error uploading file: ' + err));
});