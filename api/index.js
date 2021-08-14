const express = require('express');
const axios = require('axios');
const api = express();
const base_url = 'https://firebasestorage.googleapis.com/v0/b/nsw-covid-api.appspot.com/o/';

const {
    storageEncode
} = require('./helpers.js');

api.get('/status/', (req, res) => {
    res.status(200).json('Everything seems to be working!');
});

api.get('/cases/', async (req, res) => {
    const { data } = await axios(base_url + storageEncode('nsw/cases.json'));

    res.status(200).json(data);
});

api.get('/cases/:period/', async (req, res) => {
    const { data } = await axios(base_url + storageEncode('nsw/cases.json'));
    const { period } = req.params;

    if (!data[period]) {
        res.status(400).send(`Cannot GET ${req.path}`);
    }

    res.status(200).json(data[period]);
});

api.get('/testing/', async (req, res) => {
    const { data } = await axios(base_url + storageEncode('nsw/testing.json'));

    res.status(200).json(data);
});

api.listen(process.env.PORT || 3000);