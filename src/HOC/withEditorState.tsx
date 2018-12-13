import * as React from 'react';
import { getComponentName } from '../utils/reactUtils';
import { EditorStateContext } from '../utils/context';

export default (WrapperComponent: React.ComponentClass<Merge<any, {}>>): any => {
  return class withEditorState extends React.PureComponent {
    static displayName = `withEditorState(${getComponentName(WrapperComponent)})`;

    render() {
      return (
        <EditorStateContext.Consumer>
          {(context) => {
            return <WrapperComponent {...this.props} {...context}/>;
          }}
        </EditorStateContext.Consumer>
      );
    }
  };
};
