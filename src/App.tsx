import * as React from 'react';
import { Button } from 'antd';
import { hot } from 'react-hot-loader';

// hmr
@hot(module)
export default class App extends React.PureComponent {
  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <div className={'app'}>
        <p>rich text editor with draft.js</p>
        <Button>click me</Button>
      </div>
    );
  }
}
