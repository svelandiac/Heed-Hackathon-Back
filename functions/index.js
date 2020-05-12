"use strict";
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const csv = require("csvtojson");

admin.initializeApp({
  databaseURL: "https://heed-siigo-hackathon.firebaseio.com",
  storageBucket: "gs://heed-siigo-hackathon.appspot.com"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.getMyCompany = functions.https.onRequest(async (request, response) => {
  const email = request.body.email;

  try {
    const tenantGroup = (
      await db
        .collection("users")
        .doc(email)
        .get()
    ).data().tenantGroup;
    const company = (
      await db
        .collection("users")
        .doc(email)
        .get()
    ).data().company;

    const companyName = (
      await db
        .collection(tenantGroup)
        .doc(company)
        .get()
    ).data().name;
    response.send(companyName);
    return;
  } catch (error) {
    response.status(500).send(error);
    return;
  }
});

exports.processCSVfile = functions.https.onRequest(
  async (request, response) => {
    const csvURL = request.body.csvURL;

    const csvStream = (await axios.get(csvURL)).data;

    const jsonData = await csv().fromString(csvStream);

    jsonData.forEach(async element => {
      try {
        await db
          .collection("Productos 7")
          .doc(element.id)
          .set({
            tenantId: element.tenantId,
            name: element.name,
            description: element.description,
            expiredDate: element.expiredDate,
            price: element.price
          });
      } catch (error) {
        console.log(error);
        return;
      }
    });

    await bucket.deleteFiles();

    response.send(jsonData);
  }
);
