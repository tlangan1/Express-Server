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

export async function sendWebPushes(operationType, item_id, itemType) {
  var subscriptions = await getSubscription();
  var data = await getItem(itemType, { item_id: item_id });
  var message = `${itemType} with name(id) [${
    data.item_name
  }(${item_id})] was ${conjugateVerb(
    operationType == "pause"
      ? data.paused_dtm == null
        ? "restart"
        : "pause"
      : operationType
  )}`;

  subscriptions.forEach((subscription) => {
    const push_subscription = {
      // capability_url in the database
      endpoint: subscription.capability_url,
      keys: {
        p256dh: subscription.public_key,
        auth: subscription.private_key,
      },
    };

    //   if (push_subscription.keys.auth == "91u78HuSRvE009UoiBSkdA")
    sendWebPush(push_subscription, JSON.stringify(message));
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

function conjugateVerb(verb) {
  switch (verb) {
    case "pause":
      return "paused";
    case "restart":
      return "restarted";
    case "start":
      return "started";
    case "complete":
      return "completed";
    case "cancel_delete":
      return "canceled/deleted";
    default:
      return verb;
  }
}
