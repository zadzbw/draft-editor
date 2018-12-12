// start
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// 如果用了ant-design，就可以先不引入normalize.css
// import 'normalize.css';
import './style/index.scss';

import App from './App';

// render
ReactDOM.render(<App/>, document.getElementById('root'));
// window.__REACT__ = React; // eslint-disable-line no-underscore-dangle
