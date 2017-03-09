// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import App from './components/app/app';
import About from './components/about/about';
import Home from './components/home/home';
import './index.css';

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App} />
    <Route path="/home" component={Home} />
    <Route path="/about" component={About} />
  </Router>
), document.getElementById('root'));
