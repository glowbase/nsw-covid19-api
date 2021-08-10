const express = require('express');
const axios = require('axios')
const fs = require('fs');

const {
    nsw:nsw_endpoints
} = require('./src/endpoints.json');

const {
    formatFatalities
} = require('./src/helpers.js');

//! EXPRESS MIDDLEWARE
const requestLog = (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const date = new Date().toISOString();
    const method = req.method;
    const status = res.statusCode.toString();
    const path = req.path;

    fs.appendFileSync(
        './src/logs.txt',
        `${ip} ${date} ${method} ${status} ${path}\n`
    );

    next();
}

//! EXPRESS CONFIG
const api = express();

api.use(requestLog);


//! LOCAL ENDPOINTS
api.get('/status', (req, res) => {
    res.status(200).json('Everything seems to be working...');
});

//? --------------------------------------------------
//? Recovered
//? --------------------------------------------------
api.get('/nsw/recovered/total', async (req, res) => {
    const { data: { data } } = await axios(nsw_endpoints.stats);

    res.status(200).json({
        total: data[0].Recovered
    });
});

//? --------------------------------------------------
//? Fatalities
//? --------------------------------------------------
api.get('/nsw/fatalities/', async (req, res) => {
    const { data: { data:stats } } = await axios(nsw_endpoints.stats);
    const { data: { data:fatalities } } = await axios(nsw_endpoints.fatalities);

    res.status(200).json({
        age_groups: formatFatalities(fatalities),
        total: stats[0].Deaths
    });
});

api.get('/nsw/fatalities/total', async (req, res) => {
    const { data: { data } } = await axios(nsw_endpoints.stats);

    res.status(200).json({
        total: data[0].Deaths
    });
});

api.get('/nsw/fatalities/age_group/:age_group', async (req, res) => {
    const { age_group } = req.params;
    const { data: { data:fatalities } } = await axios(nsw_endpoints.fatalities);

    res.status(200).json(
        formatFatalities(fatalities)[age_group] ||
        'Please provide a valid age group.'
    );
});

api.get('/nsw/acquired', async (req, res) => {

});

api.get('/nsw/acquired/:transmission_method', async (req, res) => {

});

api.get('/nsw/cases', async (req, res) => {

});

api.get('/nsw/cases/total', async (req, res) => {

});


//! EXPRESS SERVER
const port = process.env.PORT || 3000;

api.listen(port, () => {
    console.log(`\nAPI LISTENING ON PORT ${port}`);
});