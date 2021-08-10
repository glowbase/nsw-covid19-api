const express = require('express');
const axios = require('axios')
const fs = require('fs');

//! HELPERS
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
api.get('/', (req, res) => {
    res.redirect('https://github.com/glowbase/nsw-covid19-api#endpoints');
});

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

api.get('/nsw/fatalities/age_group/:age_group/total', async (req, res) => {
    const { age_group } = req.params;
    const { data: { data } } = await axios(nsw_endpoints.fatalities);

    if (!formatFatalities(data)[age_group]) {
        res.status(400).json('Please provide a valid age group.');
    }

    res.status(200).json({
        total: formatFatalities(data)[age_group]
    });
});

//? --------------------------------------------------
//? Acquired
//? --------------------------------------------------
api.get('/nsw/acquired/new', async (req, res) => {
    const { data: { data } } = await axios(nsw_endpoints.stats);

    res.status(200).json({
        local: data[0].AcquiredLocally,
        interstate: data[0].AcquiredInterstate,
        overseas: data[0].AcquiredOverseas,
        total: data[0].NewCases
    });
});

api.get('/nsw/acquired/:transmission_method/new', async (req, res) => {
    const { data: { data } } = await axios(nsw_endpoints.stats);
    const transmission_method = req.params.transmission_method.toLowerCase();
    
    const transmission_methods = {
        'local': 'AcquiredLocally',
        'interstate': 'AcquiredInterstate',
        'overseas': 'AcquiredOverseas'
    };

    if (!transmission_methods[transmission_method]) {
        res.status(400).json('Please provide a valid transmission method.');
    }
    
    res.status(200).json({
        total: data[0][transmission_methods[transmission_method]]
    });
});

//? --------------------------------------------------
//? Cases
//? --------------------------------------------------
api.get('/nsw/cases', async (req, res) => {
    // total, 24 hours, interstate
});

api.get('/nsw/cases/new', async (req, res) => {
    // 24 hours
});

api.get('/nsw/cases/total', async (req, res) => {
    // total
});


//! EXPRESS SERVER
api.listen(process.env.PORT || 3000);