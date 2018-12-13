// start
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// 如果用了ant-design，就可以先不引入normalize.css
// import 'normalize.css';
import 'draft-js/dist/Draft.css';
import './style/index.scss';

// components
import App from './App';

// utils
import { info, success } from './utils/badge';

// render
ReactDOM.render(<App/>, document.getElementById('root'));
// window.__REACT__ = React; // eslint-disable-line no-underscore-dangle

// add log badge
success({ title: 'Environment', content: process.env.NODE_ENV as string });
info({ title: 'Version', content: process.env.VERSION as string });
