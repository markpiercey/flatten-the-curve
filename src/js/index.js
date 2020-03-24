import App from './components/App'
import ReactDOM from "react-dom";
import React from "react";
import './../styles/app.css';







const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : false;
