const functions = require("firebase-functions");
const firebase = require('firebase-admin');

// const serviceAccount = require('./service_account.json');

const {
    scrapeStatsNSW,
    scrapeStatsLocal,
    scrapeCaseAlerts
} = require('./scrape.js');

firebase.initializeApp({
    // credential: firebase.credential.cert(serviceAccount),
    // storageBucket: 'nsw-covid-api.appspot.com'
});

exports.ScrapeWebsites = functions.region('australia-southeast1').pubsub.schedule('*/10 * * * *').timeZone('Australia/Sydney').onRun(async () => {
    await scrapeStatsNSW();
    await scrapeStatsLocal();
    await scrapeCaseAlerts();
});