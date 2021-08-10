# NSW COVID-19 Case & Test Statistics
This repository gathers COVID-19 case, testing and vaccination rollout data for New South Wales (with other states on the way).

- Scrapes the data published on the Federal Department of Health website and converts it to a format easily readable by code. This data is saved to a database so historical records can be kept and recalled. This data is publicly accessible via an API.
- Collates data provided by NSW Health via numerous APIs so it can be accessed publicly via an API in a standardised format.

**Important Note: ** The data is provided as-is. Although all data is scraped from legitimate sources published by NSW Health and other government departments, I cannot guarantee the accuracy or timeliness of the data. Use at your own risk.
## Direct Access to Data
The data should hopefully be as up to date as possible. The data is updated at roughly 11am (NSW case and data update) and 8pm (Department of Health website update).

This data is being provided to the public for free. Please do not abuse access to the following API.

The data is available via the following API endpoints.



## Run Locally
You can run this project locally if you wish. You will require the following:

- NPM to install JS dependencies
- Node (>= v12.0.0 should work fine)

```bash
git clone https://github.com/glowbase/nsw-covid19-api.git
cd nsw-covid19-api

npm install
node index.js
```

## How it's run
This project is running using Google Cloud infrastructure, more specifically Cloud Run. This repository has been setup with a Github Action to automatically build and deploy to Cloud Run which is hosting the API endpoints in a dockerised environment. I was going to be simple and use Google Firebase with Firebase Functions to host the API but the cold-start time is a bit long and I wanted to mess with Cloud Run. All historical data will be saved to Google Cloud Firestore.


## Rationale
This project was build because Government departments seem to not like providing data in a nice format for developers. There are almost no APIs for this data, or if there is, its formatted in an ugly way with terrible endpoints naming schemes. Not to mention that it's difficult to find them in the first place.

## It's not working!
Unfortunately it might stop working unexpectedly. Every time the format of the data on the website changes or the names of endpoints change, the script will break and you won't get your data.

If this happens, create a Github Issue and I'll take a look or try fixing it and creating a pull request.