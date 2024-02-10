const express = require('express');
const app = express();
require("dotenv").config();
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

app.use(bodyParser.json());
app.use(cors());

var serviceAccount = require("./configs/placement-notifier-dcaaf-firebase-adminsdk-awzkp-e889d44bf6.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.post('/sendNotification', (req, res) => {
    const { company_name, company_logo, job_title, job_description, apply_link } = req.body;

    const message = {
        data: {
            company_name,
            company_logo,
            job_title,
            job_description,
            apply_link
        },
        android: {
            notification: {
                imageUrl: company_logo,
                clickAction: 'news_intent'
            }
        },
        apns: {
            payload: {
                aps: {
                    'mutable-content': 1,
                    'category': 'INVITE_CATEGORY'
                }
            },
            fcm_options: {
                image: company_logo
            }
        },
        webpush: {
            headers: {
                image: company_logo,
            },
            fcmOptions: {
                link: apply_link
            }
        },
        topic: "placement"
    }



    getMessaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

