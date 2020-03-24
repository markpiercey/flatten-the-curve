import React from 'react';
import ChartToggles from './ChartToggles'
import c3 from 'c3'
import superagent from 'superagent'
import _ from 'lodash'
import moment from 'moment'

const excludedFields = ["Lat", "Long", "Province/State", "Country/Region"];

export default class Chart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {},
            x: {},
            compareToCountry: "",
            countries: []
        };

        this.getData = this.getData.bind(this);
        this.getCountryList = this.getCountryList.bind(this);
        this.onCompareChange = this.onCompareChange.bind(this);
    }

    //TODO: parameterize some of this stuff to make <Chart> reusable-ish
    renderChart(timeseries) {
        let dates = timeseries.x.map(date => new Date(date));
        let data = _.concat([_.concat('x', dates)], timeseries.data)

        c3.generate({
            bindto: ".chart",
            data: {
                x: 'x',
                columns: data
            },
            axis: {
                x: {
                    label: 'Date',
                    type: 'timeseries',
                    tick: {
                        format: function(x) {
                            return moment(x).format('MMM DD YYYY')
                        },
                        culling: {
                            max: 6
                        },
                        rotate: 45

                    }
                },
                y: {
                    label: "Number of Confirmed Cases"
                }
            },
            legend: {
                position: 'right'
            }
        });
    }

    validateValues(values) {
        return values.map((value, index, array) => {
            return index > 1 && array[index - 1] > value
                ? array[index - 1]
                : value;
        });
    }

    componentDidMount() {
        superagent.get('/api/data/canada').then((res) => {
            this.renderChart(res.body)
        });
    }

    onChartModeChange(e) {
        superagent.get(`/api/data/canada?mode=${e.target.value}`).then((res) => {
            this.renderChart(res.body)
        })
        this.getData();
        this.getCountryList();
    }

    getData() {
        let queryString = "/api/data/canada";

        const { compareToCountry } = this.state;

        queryString =
            compareToCountry && compareToCountry.length > 0
                ? `${queryString},${compareToCountry.trim().toLowerCase()}`
                : queryString;

        superagent.get(queryString).then(res => {
            const data = this.cleanUpData(res.body);

            const x = this.getXLabels(res.body[0]);

            this.setState({
                data,
                x
            });

            this.renderChart();
        });
    }

    getCountryList() {
        superagent.get("api/data/countries").then(res => {
            const countries = res.body.sort();
            this.setState({ countries: ["", ...countries] });
        });
    }

    cleanUpData(data) {
        return data.map(province => {
            const dropped = _.drop(_.values(province), 4);

            return _.concat(
                [
                    province["Province/State"].length > 0
                        ? province["Province/State"]
                        : province["Country/Region"]
                ],
                this.validateValues(dropped)
            );
        });
    }

    getXLabels(data) {
        const keys = _.keys(data);
        const filteredKeys = keys.filter(x => !_.includes(excludedFields, x));

        return _.concat(
            ["x"],
            filteredKeys.map(x => moment(x, "MM/DD/YY").toDate())
        );
    }

    onCompareChange(event) {
        this.setState({ compareToCountry: event.target.value }, this.getData);
    }

    render() {
        return (
            <div className="wrapper">
                <div className="d-flex justify-content-around">
                    <ChartToggles onChartModeChange={this.onChartModeChange.bind(this)}></ChartToggles>
                </div>
                <div className="chart"></div>
                <p>Compare to another country:</p>
                <select
                    name="compareToCountry"
                    id="compareToCountry"
                    onChange={this.onCompareChange}
                >
                    {this.state.countries.map(country => (
                        <option key={country}>{country}</option>
                    ))}
                </select>
            </div>
        );
    }
}
