import React from "react";

export default class ChartToggles extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div
                className="btn-group btn-group-toggle"
                data-toggle="buttons"
                title={
                    this.props.disabled
                        ? "We are working on getting per capita working for all countries. Please check back later"
                        : ""
                }
            >
                <label className={`btn btn-secondary active ${ this.props.disabled ? "disabled" : "" }`} >
                    <input
                        type="radio"
                        name="total"
                        id="total"
                        value="total"
                        onClick={this.props.onChartModeChange}
                        disabled={this.props.disabled}
                    ></input>{" "}
                    Totals
                </label>
                <label className={`btn btn-secondary ${ this.props.disabled ? "disabled" : "" }`} >
                    <input
                        type="radio"
                        name="percapita"
                        id="percapita"
                        value="percapita"
                        onClick={this.props.onChartModeChange}
                        disabled={this.props.disabled}
                    ></input>{" "}
                    Per 100,000
                </label>
            </div>
        );
    }
}
