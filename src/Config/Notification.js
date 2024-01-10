const admin = require('firebase-admin');
const notifyDb = require('../Models/Pumps')
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: 'AKIA5BRN3AJEU32LTO6B',
  secretAccessKey: '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',
  region: 'ap-south-1',
});

let sns = new AWS.SNS();


module.exports = {
  notfctionCreate: (notificationData) => new Promise((resolve, reject) => {
    const addNotifications = new notifyDb(notificationData);
    addNotifications.save().then((result) => resolve(result)).catch((error) => reject(error));
  }),

  readNotification: (notificationId) => new Promise((resolve, reject) => {
    const query = notifyDb.updateMany({ _id: notificationId }, { notifyStatus: 'read' });
    query.exec().then((result) => resolve(result)).catch((error) => reject(error));
  }),



  notification: (token, message) => {
    let payload = {
      default: message,
      APNS: {
        aps: {
          alert: message,
          sound: 'default',
          badge: 1
        }
      }
    };

    payload.APNS = JSON.stringify(payload.APNS);
    payload = JSON.stringify(payload);

    console.log('sending push');
    sns.publish({
      Message: payload,      // Required
      MessageStructure: 'json',
      TargetArn: token // Required
  }, function(err, data) {
      if (err) {
        console.log(err.stack);
        return;
      }
      console.log('push sent');
      console.log(data);
    });
  },
};
