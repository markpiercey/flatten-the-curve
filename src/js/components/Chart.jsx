import React from "react";
import ChartToggles from "./ChartToggles";
import c3 from "c3";
import superagent from "superagent";
import _ from "lodash";
import moment from "moment";

const excludedFields = ["Lat", "Long", "Province/State", "Country/Region"];

export default class Chart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      timeseries: {},
      compareToCountry: "",
      countries: [],
      chartMode: "total"
    };

    this.getData = this.getData.bind(this);
    this.getCountryList = this.getCountryList.bind(this);
    this.onCompareChange = this.onCompareChange.bind(this);
    this.onChartModeChange = this.onChartModeChange.bind(this);
  }

  //TODO: parameterize some of this stuff to make <Chart> reusable-ish
  renderChart() {
    const dates = this.state.timeseries.x.map(date => new Date(date));
    const data = _.concat([_.concat("x", dates)], this.state.timeseries.data);

    c3.generate({
      bindto: ".chart",
      data: {
        x: "x",
        columns: data
      },
      axis: {
        x: {
          label: "Date",
          type: "timeseries",
          tick: {
            format: function(x) {
              return moment(x).format("MMM DD YYYY");
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
        position: "right"
      }
    });
  }

  validateValues(values) {
    return values.map((value, index, array) => {
      return index > 1 && array[index - 1] > value ? array[index - 1] : value;
    });
  }

  componentDidMount() {
    this.getData();
    this.getCountryList();
  }

  onChartModeChange(e) {
    this.setState({ chartMode: e.target.value }, this.getData);
  }

  getData() {
    const { compareToCountry, chartMode } = this.state;

    let queryString = "/api/data/canada";

    // Check for compare-to country
    queryString =
      compareToCountry && compareToCountry.length > 0
        ? `${queryString},${compareToCountry.trim().toLowerCase()}`
        : queryString;

    // Set the data mode (i.e., total vs. percapita)
    queryString = `${queryString}?mode=${chartMode}`;

    superagent.get(queryString).then(res => {
      this.setState({
        timeseries: res.body
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

  onCompareChange(event) {
    this.setState({ compareToCountry: event.target.value }, this.getData);
  }

  render() {
    return (
      <div className="wrapper">
        <div className="d-flex justify-content-around">
          <ChartToggles
            onChartModeChange={this.onChartModeChange}
            disabled={this.state.compareToCountry !== ""}
          ></ChartToggles>
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
