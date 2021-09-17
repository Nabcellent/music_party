window.axios = require('axios');
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import React, {Component} from 'react';
import {render} from 'react-dom';
import Home from "./Home";
import {ToastContainer} from "react-toastify";

export default class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <Home/>
    }
}

render(<App/>, document.getElementById('app'))
render(<ToastContainer/>, document.getElementById('toast'))


window.loadScript = function (src) {
    const script = document.createElement("script");

    script.src = src;
    script.async = true;

    document.body.appendChild(script);
}