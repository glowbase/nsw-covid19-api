const base_url = 'https://nswdac-covid-19-postcode-heatmap.azurewebsites.net/datafiles/';

module.exports = {
    stats: base_url + 'statsLocations.json',
    daily_stats: base_url + 'stats.json',
    vaccination: base_url + 'state_vaccination_metrics.json',
    daily_vaccination: base_url + 'state_vaccination_metrics_daily.json',
    reginal_tests: base_url + 'data_tests.json',
    daily_tests: base_url + 'test_24.json',
    population: base_url + 'population.json',
    fatalities: base_url + 'fatalitiesdata.json',
};