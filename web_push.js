import webpush from "web-push";

import { updateItem, getItems, getItem } from "./db.js";

/* *** Web push related code  *** */
// cSpell:disable
const vapidKeys = {
  publicKey:
    "BExD80_HkFrtVmffpbNP-KzVCoL6Y1m7sTvP6Ai7vCGZsn-XDsjwCEbG5Hz0sE0K3_crP6-1Jqdw2a-tjHKEqHk",
  privateKey: "SNas0P12bbdAoIzM0MVkGgSouX79t2TRmYihVSpSD4Q", // this should be 32 bytes long
};
// cSpell:enable

//setting our previously generated VAPID keys
webpush.setVapidDetails(
  "https://fcm.googleapis.com/fcm/send/cco2KhtpOvY:APA91bFz2zs2V-rF458VOEA9kwCE2S8t8vHG-u-CIO2QlaURl4aI1EAVIQBnRloED10GN4bQCXcDeynMhhhAEfgObuqqPkV_qDS99aQ91gwn4Y0hoRq_NmpYOeLUhITZiwf1vIVJxtuB",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function sendWebPushes(sentData) {
  var subscriptions = await getSubscription();
  var returnedData = await getItem(sentData.item_type, {
    item_id: sentData.item_id,
  });
  returnedData.update_type = sentData.update_type;
  returnedData.item_id = sentData.item_id;

  subscriptions.forEach((subscription) => {
    const push_subscription = {
      // capability_url in the database
      endpoint: subscription.capability_url,
      keys: {
        p256dh: subscription.public_key,
        auth: subscription.private_key,
      },
    };

    sendWebPush(push_subscription, JSON.stringify(returnedData));
  });
}

/* *** Helper functions for web push *** */
//function to send the notification to the subscribed device
const sendWebPush = async (subscription, dataToSend) => {
  try {
    var x = await webpush.sendNotification(subscription, dataToSend);
  } catch (err) {
    if (err.statusCode == 410) {
      // If a response is received from the push notification service
      // indicating that the push notification has expired, status code 410,
      // and the body = 'push subscription has unsubscribed or expired.\n'
      // then the subscription should be canceled in the database
      // by setting the expired_dtm to the current datetime.
      // TODO: test this code
      updateItem(
        "web_push_subscription",
        {
          item_type: "cancel_delete",
          capability_url: subscription.endpoint,
        },
        false
      );
    }
    console.log(err);
  }
};

async function getSubscription() {
  return await getItems("subscriptions", `''`);
}
