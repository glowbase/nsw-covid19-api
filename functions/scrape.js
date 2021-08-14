const firebase = require('firebase-admin');
const axios = require('axios');
const { parse } = require('node-html-parser');
const papaparse = require('papaparse');
const fs = require('fs').promises;
const os = require('os');

const {
    removeFormat,
    getFormattedDate,
    extractDate
} = require('./helpers.js');

const fileMetadata = {
    cacheControl: 'public,max-age=600'  
};

/**
 * At 11:01am every day, get the NSW Health website and save its contents to firebase storage
 * Parse the website contents and extract the required information, save this to a separate file 
 * 
 * 1. Save the entire website to storage
 * 2. Scrape website for information
 * 3. Save parsed info in json/csv format
 */
 async function scrapeStatsNSW() {
    const { data } = await axios('https://www.health.nsw.gov.au/Infectious/covid-19/Pages/stats-nsw.aspx');
    const root = parse(data);

    const casesData = {
        last_24_hours: {
            acquired: {
                local: {
                    known: removeFormat(root.querySelector('#known').querySelectorAll('.number')[0].innerText),
                    unknown: removeFormat(root.querySelector('#unknown').querySelectorAll('.number')[0].innerText)
                },
                interstate: removeFormat(root.querySelector('#interstate').querySelectorAll('.number')[0].innerText),
                overseas: removeFormat(root.querySelector('#overseas').querySelectorAll('.number')[0].innerText),                   
            },
            total: removeFormat(root.querySelector('#case').querySelectorAll('.number')[0].innerText)
        },
        this_week: {
            acquired: {
                local: {
                    known: removeFormat(root.querySelector('#known').querySelectorAll('.number')[1].innerText),
                    unknown: removeFormat(root.querySelector('#unknown').querySelectorAll('.number')[1].innerText)
                },
                interstate: removeFormat(root.querySelector('#interstate').querySelectorAll('.number')[1].innerText),
                overseas: removeFormat(root.querySelector('#overseas').querySelectorAll('.number')[1].innerText),                   
            },
            total: removeFormat(root.querySelector('#case').querySelectorAll('.number')[1].innerText)
        },
        last_week: {
            acquired: {
                local: {
                    known: removeFormat(root.querySelector('#known').querySelectorAll('.number')[2].innerText),
                    unknown: removeFormat(root.querySelector('#unknown').querySelectorAll('.number')[2].innerText)
                },
                interstate: removeFormat(root.querySelector('#interstate').querySelectorAll('.number')[2].innerText),
                overseas: removeFormat(root.querySelector('#overseas').querySelectorAll('.number')[2].innerText),                   
            },
            total: removeFormat(root.querySelector('#case').querySelectorAll('.number')[2].innerText)
        },
        last_year: {
            acquired: {
                local: {
                    known: removeFormat(root.querySelector('#known').querySelectorAll('.number')[3].innerText),
                    unknown: removeFormat(root.querySelector('#unknown').querySelectorAll('.number')[3].innerText)
                },
                interstate: removeFormat(root.querySelector('#interstate').querySelectorAll('.number')[3].innerText),
                overseas: removeFormat(root.querySelector('#overseas').querySelectorAll('.number')[3].innerText),                   
            },
            total: removeFormat(root.querySelector('#case').querySelectorAll('.number')[3].innerText)
        }
    };

    const testingData = {
        last_24_hours: removeFormat(root.querySelector('#testing').querySelectorAll('.number')[0].innerText),
        this_week: removeFormat(root.querySelector('#testing').querySelectorAll('.number')[1].innerText),
        last_week: removeFormat(root.querySelector('#testing').querySelectorAll('.number')[2].innerText),
        last_year: removeFormat(root.querySelector('#testing').querySelectorAll('.number')[3].innerText)
    };

    const vaccinationsData = {
        last_24_hours: {
            first_dose: removeFormat(root.querySelector('tbody').querySelectorAll('td')[1].innerText),
            second_dose: removeFormat(root.querySelector('tbody').querySelectorAll('td')[4].innerText),
            total: removeFormat(root.querySelector('tbody').querySelectorAll('td')[7].innerText)
        },
        total: {
            first_dose: removeFormat(root.querySelector('tbody').querySelectorAll('td')[2].innerText),
            second_dose: removeFormat(root.querySelector('tbody').querySelectorAll('td')[5].innerText),
            total: removeFormat(root.querySelector('tbody').querySelectorAll('td')[8].innerText)
        }
    };

    await fs.writeFile(`/tmp/website.html`, data);
    await fs.writeFile('/tmp/cases.json', JSON.stringify(casesData));
    await fs.writeFile('/tmp/testing.json', JSON.stringify(testingData));
    await fs.writeFile('/tmp/vaccinations.json', JSON.stringify(vaccinationsData));

    await firebase.storage().bucket('nsw-covid-api.appspot.com').upload('/tmp/website.html', {
        destination: `nsw/history/${getFormattedDate()}/website.html`,
        metadata: fileMetadata
    });

    await firebase.storage().bucket('nsw-covid-api.appspot.com').upload('/tmp/cases.json', {
        destination: `nsw/history/${getFormattedDate()}/cases.json`,
        metadata: fileMetadata
    });

    await firebase.storage().bucket('nsw-covid-api.appspot.com').upload('/tmp/testing.json', {
        destination: `nsw/history/${getFormattedDate()}/testing.json`,
        metadata: fileMetadata
    });

    await firebase.storage().bucket('nsw-covid-api.appspot.com').upload('/tmp/vaccinations.json', {
        destination: `nsw/history/${getFormattedDate()}/vaccinations.json`,
        metadata: fileMetadata
    });

    await firebase.storage().bucket('nsw-covid-api.appspot.com').upload('/tmp/cases.json', {
        destination: 'nsw/cases.json',
        metadata: fileMetadata
    });

    await firebase.storage().bucket('nsw-covid-api.appspot.com').upload('/tmp/testing.json', {
        destination: 'nsw/testing.json',
        metadata: fileMetadata
    });

    await firebase.storage().bucket('nsw-covid-api.appspot.com').upload('/tmp/vaccinations.json', {
        destination: 'nsw/vaccinations.json',
        metadata: fileMetadata
    });

    console.log('Success.');
}

/**
 * 
 * @returns 
 */
async function scrapeStatsLocal() {
    const date = new Date();

    const year = date.getFullYear();
    const month = ('0' + date.getMonth()).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    const { data: lhd_csv } = await axios(`https://www.health.nsw.gov.au/Infectious/covid-19/Documents/data/lhd-data-${year}${month}${day - 1}.csv`);
    const { data: lga_csv } = await axios(`https://www.health.nsw.gov.au/Infectious/covid-19/Documents/data/lga-data-${year}${month}${day - 1}.csv`);
    
    const { data: lhd_data } = papaparse.parse(lhd_csv);
    const { data: lga_data } = papaparse.parse(lga_csv);

    lhd_data.splice(0, 1);
    lga_data.splice(0, 1);

    const data = {
        local_health_district: [],
        local_government_area: []
    };

    lhd_data.forEach(row => {
        if (!row[0]) return;

        data.local_health_district.push({
            district: removeFormat(row[0]),
            cases: removeFormat(row[1]),
            unknown_source: removeFormat(row[2]),
            total_tests: removeFormat(row[3]),
            test_rate: removeFormat(row[4])
        });
    });

    lga_data.forEach(row => {
        if (!row[0]) return;

        data.local_government_area.push({
            district: removeFormat(row[0]),
            cases: removeFormat(row[1]),
            unknown_source: removeFormat(row[2]),
            total_tests: removeFormat(row[3]),
            test_rate: removeFormat(row[4])
        });
    });

    await fs.writeFile('/tmp/lhd_cases.csv', lhd_csv);
    await fs.writeFile('/tmp/lga_cases.csv', lga_csv);
    await fs.writeFile('/tmp/stats_local.json', JSON.stringify(data));

    await firebase.storage().bucket('nsw-covid-api.appspot.com').upload('/tmp/lhd_cases.csv', {
        destination: `nsw/history/${getFormattedDate()}/lhd_cases.csv`,
        metadata: fileMetadata
    });

    await firebase.storage().bucket('nsw-covid-api.appspot.com').upload('/tmp/lga_cases.csv', {
        destination: `nsw/history/${getFormattedDate()}/lga_cases.csv`,
        metadata: fileMetadata
    });
    
    await firebase.storage().bucket('nsw-covid-api.appspot.com').upload('/tmp/stats_local.json', {
        destination: `nsw/history/${getFormattedDate()}/cases_by_location.json`,
        metadata: fileMetadata
    });

    await firebase.storage().bucket('nsw-covid-api.appspot.com').upload('/tmp/stats_local.json', {
        destination: 'nsw/cases_by_location.json',
        metadata: fileMetadata
    });

    console.log('Success.');
}

/**
 * 
 */
async function scrapeCaseAlerts() {
    const { data: { data: { monitor: locations } } } = await axios('https://data.nsw.gov.au/data/dataset/0a52e6c1-bc0b-48af-8b45-d791a6d8e289/resource/f3a28eed-8c2a-437b-8ac1-2dab3cf760f9/download/venue-data.json');
    
    const locations_data = {
        concern: [],
        locations: []
    };

    const contactTypes = {
        'Get tested immediately and self-isolate for 14 days.': 'close_contact',
        'Get tested immediately and self-isolate until you receive further advice.': 'close_contact',
        'Get tested immediately. People with no symptoms do not need to isolate while waiting for their test result.': 'casual_contact',
        'Get tested immediately. Self-isolate until you get a negative result.': 'casual_contact',
        'Monitor for symptoms': 'monitor'
    };

    const _tempConcern = locations.filter(location => {
        return location.transmissionvenues == 1;
    });

    _tempConcern.forEach(location => {
        locations_data.concern.push({
            venue: location.Venue,
            address: location.Address,
            suburb: location.Suburb,
            date: extractDate(location.Date),
            exposure_time: location.Time,
            alert: location.Alert,
            longitude: location.Lon,
            latitude: location.Lat,
            advise_html: location.HealthAdviceHTML,
            contact_type: contactTypes[location.Alert] || 'N/A',
            last_updated: location['Last updated date'],
        });
    });

    const _tempLocations = locations.filter(location => {
        return location.transmissionvenues == 0;
    });
    
    _tempLocations.forEach(location => {
        locations_data.locations.push({
            venue: location.Venue,
            address: location.Address,
            suburb: location.Suburb,
            date: extractDate(location.Date),
            exposure_time: location.Time,
            alert: location.Alert,
            longitude: location.Lon,
            latitude: location.Lat,
            advise_html: location.HealthAdviceHTML,
            contact_type: contactTypes[location.Alert] || 'N/A',
            last_updated: location['Last updated date'],
        });
    });

    await fs.writeFile('/tmp/venue_data.json', JSON.stringify(locations));
    await fs.writeFile('/tmp/case_locations.json', JSON.stringify(locations_data));

    await firebase.storage().bucket('nsw-covid-api.appspot.com').upload('/tmp/venue_data.json', {
        destination: `nsw/history/${getFormattedDate()}/venue_data.json`,
        metadata: fileMetadata
    });

    await firebase.storage().bucket('nsw-covid-api.appspot.com').upload('/tmp/case_locations.json', {
        destination: `nsw/history/${getFormattedDate()}/locations.json`,
        metadata: fileMetadata
    });

    await firebase.storage().bucket('nsw-covid-api.appspot.com').upload('/tmp/case_locations.json', {
        destination: `nsw/locations.json`,
        metadata: fileMetadata
    });

    console.log('Success.');
}

module.exports = {
    scrapeStatsNSW,
    scrapeStatsLocal,
    scrapeCaseAlerts
}