import React from 'react';
import c3 from 'c3'
import superagent from 'superagent'
import _ from 'lodash'
import moment from 'moment'

const excludedFields = ['Lat', 'Long', 'Province/State', 'Country/Region'];

export default class Chart extends React.Component {  
    validateValues(values) {
        return values.map((value, index, array) => {
            return index > 1 && array[index-1] > value
            ? array[index - 1]
            : value
        })
    }

    renderChart(x, data) {
        c3.generate({
            bindto: '.chart',
            data: {
                x: 'x',
                columns: _.concat([x], data)
            },
            axis: {
                x: {
                    label: 'Date',
                    type: 'timeseries',
                },
                y: {
                    label: 'Number of Confirmed Cases'
                }
            },
            legend: {
                position: 'right'
            }
        })
    }

    componentDidMount() {
        superagent.get('/api/data/canada').then((res) => {
            let data = res.body.map(province => _.concat([province['Province/State']], this.validateValues(_.drop(_.values(province), 4))))
            let x = _.concat(['x'], _.keys(res.body[0]).filter(x => !_.includes(excludedFields, x)).map(x=> moment(x, 'MM/DD/YY').toDate()))
            this.renderChart(x, data)
        })
    }

    render() {
        return <div className="chart"></div>
    }
}