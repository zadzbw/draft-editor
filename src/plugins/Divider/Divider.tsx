import * as React from 'react';
import classNames from 'classnames';
import './Divider.scss';

interface DividerProps {
  className?: string;
}

export default class Divider extends React.PureComponent<DividerProps> {
  render() {
    const { className } = this.props;
    const wrapperClass = classNames(className, 'editor-divider');

    return (
      <div className={wrapperClass}>
        <hr/>
      </div>
    );
  }
}
