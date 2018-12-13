import * as React from 'react';
import { EditorState, ContentState } from 'draft-js';
import './Link.scss';

interface LinkProps {
  entityKey: string;
  editorState: EditorState;
  contentState: ContentState;
  decoratedText: string;
}

export default class Link extends React.PureComponent<LinkProps> {
  getEntity = () => {
    const { contentState, entityKey } = this.props;
    return contentState.getEntity(entityKey);
  };

  getData = () => {
    const entity = this.getEntity();
    return entity.getData();
  };

  render() {
    const { children } = this.props;
    const entityData = this.getData();
    return (
      <a className={'editor-link'} href={entityData.url} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    );
  }
}
