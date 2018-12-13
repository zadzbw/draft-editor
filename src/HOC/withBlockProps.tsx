import * as React from 'react';
import { getComponentName } from '../utils/reactUtils';

// 在blockRendererFn中，将blockProps全部传入组件
export default (WrapperComponent: React.ComponentClass<Merge<any, {}>>): any => {
  return class withBlockProps extends React.PureComponent<Merge<any, {}>> {
    static displayName = `withBlockProps(${getComponentName(WrapperComponent)})`;

    render() {
      const { blockProps } = this.props;
      return <WrapperComponent {...this.props} {...blockProps}/>;
    }
  };
};
