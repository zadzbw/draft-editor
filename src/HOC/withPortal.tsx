/* eslint-disable arrow-parens,max-len */
import * as React from 'react';
import { getComponentName } from '../utils/reactUtils';
import Portal from '../components/Portal/Portal';

export default (getContainer: () => HTMLElement): any => {
  return (WrapperComponent: React.ComponentClass<Merge<any, {}>>): any => {
    return class extends React.PureComponent<any> {
      static displayName = `withPortal(${getComponentName(
        WrapperComponent as React.ComponentClass,
      )})`;

      render() {
        return (
          <Portal getContainer={getContainer}>
            <WrapperComponent {...this.props}/>
          </Portal>
        );
      }
    };
  };
};
