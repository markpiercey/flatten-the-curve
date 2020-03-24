const express = require('express');
const app = express();
const fs = require('fs')
const csv = require('csv-parser');
const superagent  = require('superagent')
const dataDir = './data'
const confirmedFile = 'confirmed.csv'
const data = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv'

//TODO: put this somewhere else
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
//TODO: put this somewhere else
setInterval(() => {
    getLatestData();
}, 1000 * 60 * 5)

//TODO: break out some of these anonymous functions
app.get('/api/data/:country', (req, res) => {
    let results = []
    fs.createReadStream(`${dataDir}/confirmed.csv`)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            let countryResults = results.filter(record => { 
                return record['Country/Region'].toLowerCase() == req.params.country.toLowerCase() 
            })
            res.send(countryResults);
    });
})

app.use(express.static('dist'));
getLatestData()
app.listen(process.env.PORT || 8080);