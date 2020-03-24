import React from 'react';
import ChartToggles from './ChartToggles'
import c3 from 'c3'
import superagent from 'superagent'
import _ from 'lodash'
import moment from 'moment'


export default class Chart extends React.Component {  
    //TODO: parameterize some of this stuff to make <Chart> reusable-ish
    renderChart(timeseries) {
        let dates = timeseries.x.map(date => new Date(date));
        let data = _.concat([_.concat('x', dates)], timeseries.data)

        c3.generate({
            bindto: '.chart',
            data: {
                x: 'x',
                columns: data
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
            this.renderChart(res.body)
        })
    }

    onChartModeChange(e) {
        superagent.get(`/api/data/canada?mode=${e.target.value}`).then((res) => {
            this.renderChart(res.body)
        })
    }

    render() {
        return (
            <div>  
                <div className="d-flex justify-content-around">
                    <ChartToggles onChartModeChange={this.onChartModeChange.bind(this)}></ChartToggles>
                </div>                  
                <div className="chart"></div>
            </div>
        

        )
    }
}