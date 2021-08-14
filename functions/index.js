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
    storageBucket: 'nsw-covid-api.appspot.com'
});

exports.ScrapeWebsites = functions.pubsub.schedule('*/10 * * * *').timeZone('Australia/Sydney').onRun(async () => {
    
    await scrapeStatsLocal();
    await scrapeCaseAlerts();
});

scrapeStatsNSW();