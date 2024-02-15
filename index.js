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

app.get("/get-admins", (req, res) => {
    const { api } = req.headers;
    if (api === process.env.API_KEY) {
        res.status(200).json({
            success: true,
            admins: process.env.ADMINS.split(",")
        });
    } else {
        res.status(401).send("Unauthorized");
    }
});

app.post('/sendNotification', (req, res) => {
    const { company_name, company_logo, job_role, job_description, apply_link } = req.body;

    const message = {
        android: {
            notification: {
                title: company_name,
                body: job_role + "\n" + job_description,
                imageUrl: company_logo,
                clickAction: 'FLUTTER_NOTIFICATION_CLICK'
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



    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
            res.status(200).json({
                success: true,
                message: "Notification sent successfully"
            });
        })
        .catch((error) => {
            console.log('Error sending message:', error);
            res.status(500).json({
                success: false,
                message: "Error sending notification"
            });
        });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

