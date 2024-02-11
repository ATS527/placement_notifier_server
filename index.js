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
    const { company_name, company_logo, job_role, job_description, apply_link } = req.body;

    console.log(company_name, company_logo, job_role, job_description, apply_link);

    const message = {
        android: {
            notification: {
                title: company_name,
                body: job_role,
                imageUrl: company_logo,
                click_action: apply_link
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
    };

    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error, error.stack);
        });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

