const express = require('express');
const axios = require('axios')
const fs = require('fs');

const endpoints = require('./nsw_health_endpoints.js');

const {
    formatFatalities
} = require('./helpers.js');

//! EXPRESS MIDDLEWARE
const requestLog = (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const date = new Date().toISOString();
    const method = req.method;
    const status = res.statusCode.toString();
    const path = req.path;

    fs.appendFileSync(
        'logs.txt',
        `${ip} ${date} ${method} ${status} ${path}\n`
    );

    next();
}

//! EXPRESS CONFIG
const api = express();

api.use(requestLog);


//! LOCAL ENDPOINTS
api.get('/ping', (req, res) => {
    res.status(200).json('Pong!');
});

//? --------------------------------------------------
//? Recovered
//? --------------------------------------------------
api.get('/recovered/total', async (req, res) => {
    const { data: { data } } = await axios(endpoints.stats);

    res.status(200).json({
        total: data[0].Recovered
    });
});

//? --------------------------------------------------
//? Fatalities
//? --------------------------------------------------
api.get('/fatalities/', async (req, res) => {
    const { data: { data:stats } } = await axios(endpoints.stats);
    const { data: { data:fatalities } } = await axios(endpoints.fatalities);

    res.status(200).json({
        age_groups: formatFatalities(fatalities),
        total: stats[0].Deaths
    });
});

api.get('/fatalities/total', async (req, res) => {
    const { data: { data } } = await axios(endpoints.stats);

    res.status(200).json({
        total: data[0].Deaths
    });
});

api.get('/fatalities/age_group/:age_group', async (req, res) => {
    const { age_group } = req.params;
    const { data: { data:fatalities } } = await axios(endpoints.fatalities);

    res.status(200).json(
        formatFatalities(fatalities)[age_group] ||
        'Please provide a valid age group.'
    );
});

api.get('/acquired', async (req, res) => {

});

api.get('/acquired/:transmission_method', async (req, res) => {

});

api.get('/cases', async (req, res) => {

});

api.get('/cases/total', async (req, res) => {

});


//! EXPRESS SERVER
const port = process.env.PORT || 3000;

api.listen(port, () => {
    console.log(`\nAPI LISTENING ON PORT ${port}`);
});