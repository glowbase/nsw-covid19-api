const express = require('express');
const api = express();

api.get('/status', (req, res) => {
    res.status(200).json('Everything seems to be working!');
});

api.listen(process.env.PORT || 3000);