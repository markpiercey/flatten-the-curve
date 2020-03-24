import React from 'react';

export default class ChartToggles extends React.Component {   
    render() {
        return (
            <div className="btn-group btn-group-toggle" data-toggle="buttons">
                <label className="btn btn-secondary active">
                    <input 
                        type="radio" 
                        name="total" 
                        id="total" 
                        value="total"
                        onClick={this.props.onChartModeChange}>
                    </input> Totals
                </label>
                <label className="btn btn-secondary">
                    <input 
                        type="radio" 
                        name="percapita" 
                        id="percapita" 
                        value="percapita"
                        onClick={this.props.onChartModeChange}>
                    </input> Per 100,000
                </label>
            </div>            
        )
    }
}