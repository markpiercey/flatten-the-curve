const express = require('express');
const app = express();
const fs = require('fs')
const csv = require('csv-parser');
const superagent  = require('superagent')
const dataDir = './data'
const confirmedFile = 'confirmed.csv'
const data = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv'
const _ = require('lodash');
const moment = require('moment');
const populations = require('./populations.json')

const NON_TIMESERIES_FIELDS = [
    "Lat",
    "Long",
    "Province/State",
    "Country/Region"
];
const NON_PROVINCES = ["Diamond Princess", "Grand Princess", "Recovered"];
const PER_CAPITA_FACTOR = 100000;

//TODO: put this somewhere else and come up with a way of getting multiple data sources
function getLatestData() {
    console.log(new Date().toISOString(), "Getting latest data");
    superagent.get(data)
    .then(res => {
        fs.writeFile(`${dataDir}/confirmed.csv`, res.text, ()=> {
            console.log(new Date().toISOString(), "Latest data loaded");
        })
    }).catch(err => {
        console.log(err);
    })
}
//TODO: put this somewhere else and come up with a way of getting multiple data sources
setInterval(() => {
    getLatestData();
}, 1000 * 60 * 5)

function toPerCapita(province, values) {
    return values.map(value => {
        if(populations[province]) {
            return (value / populations[province] * PER_CAPITA_FACTOR).toPrecision(2)
        }
        return value
    })
}

function carryForwardMissingTotals(values) {
    return values.map((value, index, array) => {
        return index > 1 && Number(array[index-1]) > Number(value)
        ? array[index - 1]
        : value
    })
}

function toChartLine(mode, timeSeriesRow) {
    let dataLabel = timeSeriesRow["Province/State"] === ""
        ? timeSeriesRow["Country/Region"]
        : timeSeriesRow["Province/State"];

    let dataPoints = carryForwardMissingTotals(
        _.drop(_.values(timeSeriesRow), 4)
    );

    if (mode && mode === "percapita") {
        dataPoints = toPerCapita(dataLabel, dataPoints);
    }

    return _.concat([dataLabel], dataPoints);
}

function johnsHopkinsDataMapper(results, countryFilter, mode) {
    let countryResults = results.filter(countryFilter || (x => true));

    let data = countryResults.map(_.partial(toChartLine, mode));
    let x = _.concat(
        _.keys(countryResults[0])
            .filter(x => !_.includes(NON_TIMESERIES_FIELDS, x))
            .map(x => moment(x, "MM/DD/YY").toDate())
    );

    return {
        x: x,
        data: data
    };
}

function countryEquals(countries) {
    return function(record) {
        countries = countries.map(country => country.toLowerCase());
        return (
            !_.includes(NON_PROVINCES, record["Province/State"]) &&
            countries.indexOf(record["Country/Region"].toLowerCase()) >= 0
        );
    };
}

/**
 * Get list of countries available in data
 */
app.get("/api/data/countries", (req, res) => {
    let results = [];
    fs.createReadStream(`${dataDir}/confirmed.csv`)
        .pipe(csv())
        .on("data", data => results.push(data))
        .on("end", () => {
            let countries = results.map(entry => entry["Country/Region"]);

            // Make entries unique
            countries = countries.filter(
                (item, i, ar) => ar.indexOf(item) === i
            );

            res.send(countries);
        });
});

//TODO: move
function readCsv(path, cb) {
    let results = []
    fs.createReadStream(path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => cb(results));
}

app.get("/api/data/:countries", (req, res) => {
    const countries = req.params.countries.split(",");

    // Disable per capita when comparing countries until we can get population data ready for all countries
    const mode = countries.length > 1 ? "total" : req.query.mode;

    readCsv(`${dataDir}/confirmed.csv`, results => {
        res.send(
            johnsHopkinsDataMapper(results, countryEquals(countries), mode)
        );
    });
});

app.use(express.static('dist'));
getLatestData()
app.listen(process.env.PORT || 8080);
