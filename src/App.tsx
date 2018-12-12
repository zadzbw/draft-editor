import * as React from 'react';
import { Button } from 'antd';
import { hot } from 'react-hot-loader';
import MyEditor from './components/MyEditor/MyEditor';
import './App.scss';

// hmr
@hot(module)
export default class App extends React.PureComponent {
  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <div className={'app'}>
        <p>rich text editor with draft.js</p>
        <MyEditor/>
        <Button>click me</Button>
      </div>
    );
  }
}
