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
const cron = require('node-cron');
const apiKeys = {
    publicKey: 'BEtmMjDI1V-07XqGUrl9vQeSuX8XJ0l37h-cDfTxKNqA2cqkWeK_5XD3gPUok1CAbbxvfhdfmwRPj43YAvM_SK0',
    privateKey: '-YhQQ8aC3VvHFZZcVrD4vJd03orz28qETMaa96DzACQ'
};



app.use(express.static(path.join(__dirname, 'public')));
webpush.setVapidDetails(
    'mailto:moinuddinshaikh173@gmail.com',
    apiKeys.publicKey,
    apiKeys.privateKey
)

app.use(cors());
app.use(express.json());

const subDatabse = [];


app.post("/save-subscription", (req, res) => {
    subDatabse.push(req.body);
    cron.schedule('*/2 * * * * *', () => {
        subDatabse.forEach(subscription => {
            webpush.sendNotification(subscription, "", {})
                .then(response => console.log('Notification sent successfully.'))
                .catch(err => console.error('Error sending notification:', err));
        });
    });
    res.json({ status: "Success", message: "Subscription saved!" })
})

app.get("/send-notification", (req, res) => {
    webpush.sendNotification(subDatabse[0], "Hello world");
    res.json({ "statue": "Success", "message": "Message sent to push service" });
})

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

// Route to serve the image
app.get('/image/:id/:i', async (req, res) => {
    const image = await Image.findById(req.params.id);
    if (image) {
        res_json = res.json();
        if(req.params.i == 0){
            res.contentType(image.imgf.contentType);
            res.send(image.imgf.data);
        } else {
            res.contentType(image.imgb.contentType);
            res.send(image.imgb.data);
        }
    } else {
        res.status(404).send('Image not found.');
    }
});
// fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
app.post('/upload', upload.array('name'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }
    const newImage = new Image({
        namef: `${req.files[0].originalname.split('.')[0]}_${Date.now()}.${req.files[0].originalname.split('.').pop()}`,
        imgf: {
            data: req.files[0].buffer,  // Save the file as a buffer
            contentType: req.files[0].mimetype  // Store the content type (e.g., 'image/jpeg')
        },
        nameb: `${req.files[1].originalname.split('.')[0]}_${Date.now()}.${req.files[1].originalname.split('.').pop()}`,
        imgb: {
            data: req.files[1].buffer,  // Save the file as a buffer
            contentType: req.files[1].mimetype  // Store the content type (e.g., 'image/jpeg')
        }
    });
    newImage.save()
        .then(() => res.send('File uploaded successfully and stored in MongoDB Atlas.'))
        .catch(err => res.status(500).send('Error uploading file: ' + err));
});