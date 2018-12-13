import * as React from 'react';
import { hot } from 'react-hot-loader';
import MyEditor from './components/MyEditor/MyEditor';
import { initIcon } from './utils/icon';
import './App.scss';

initIcon();

// hmr
@hot(module)
export default class App extends React.PureComponent {
  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <div className={'app'}>
        <p>rich text editor with draft.js</p>
        <MyEditor/>
      </div>
    );
  }
}
