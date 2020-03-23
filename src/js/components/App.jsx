import React from 'react';
import Chart from './Chart'
export default class App extends React.Component {
    render() {
        return (
            <div>
                <h1>The curve so far</h1>
                <p>This is a little thing I put together to track the progression of covid-19 within canada. It's updated automatically using Johns Hopkins <a href="https://github.com/CSSEGISandData/COVID-19">data</a>. I may add more features to this over the coming days. If you have any ideas, email me at mark (dot) piercey (at) gmail.com </p>
                <Chart></Chart>
            </div>    
        );
    }
}