import * as React from 'react';
import { ContentBlock, Editor, EditorState } from 'draft-js';
import classNames from 'classnames';
import './MyEditor.scss';

const styleMap = {
  CODE: {
    backgroundColor: '#e6e6e6',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    padding: 2,
    wordWrap: 'break-word',
  },
};

function blockStyleFn(block: ContentBlock): any {
  switch (block.getType()) {
    case 'unstyled':
      return 'editor-unstyled';
    case 'blockquote':
      return 'editor-blockquote';
    default:
      return null;
  }
}

export default class MyEditor extends React.Component<any, { editorState: EditorState }> {
  editor: React.RefObject<Editor>;

  constructor(props: any) {
    super(props);
    this.state = { editorState: EditorState.createEmpty() };
    this.editor = React.createRef();
  }

  focus = () => {
    (this.editor.current as Editor).focus();
  };

  onChange = (editorState: EditorState) => {
    this.setState({ editorState });
  };

  render() {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    const containerClass = classNames({
      'editor-container': true,
      // 当有block内容填充时，隐藏placeholder
      'editor-container-hide-placeholder':
        !contentState.hasText() && contentState.getFirstBlock().getType() !== 'unstyled',
    });

    return (
      <div className={'editor-root'}>
        <div role={'textbox'} tabIndex={0} className={containerClass} onClick={this.focus}>
          <Editor
            editorState={editorState}
            blockStyleFn={blockStyleFn}
            customStyleMap={styleMap}
            placeholder={'请输入正文'}
            onChange={this.onChange}
            ref={this.editor}
          />
        </div>
      </div>
    );
  }
}
