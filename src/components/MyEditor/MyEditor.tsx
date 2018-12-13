import * as React from 'react';
import { Button } from 'antd';
import EditorWithPlugin from 'draft-js-plugins-editor';
import { convertToRaw, ContentBlock, Editor, EditorState, RichUtils } from 'draft-js';
import isEventHandled from 'draft-js/lib/isEventHandled';
import classNames from 'classnames';
import './MyEditor.scss';
import * as draftHelpers from '../../utils/draftHelpers';
import * as draftModifiers from '../../utils/draftModifiers';
import { contentStateToHtml, htmlToContentState } from '../../utils/draftConverter';
import { EditorStateContext } from '../../utils/context';
import EventEmitter from '../../utils/EventEmitter';
// components
import EditorControlToolBar from '../EditorControl/EditorControlToolBar';
import LinkModal from '../Modal/LinkModal';
import LinkPopover from '../LinkPopover/LinkPopover';
// plugins
import createPlugins from '../../utils/draftPlugins';

const styleMap = {
  CODE: {
    backgroundColor: '#e6e6e6',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    padding: 2,
    wordWrap: 'break-word',
  },
};

const blockStyleFn = (block: ContentBlock): any => {
  switch (block.getType()) {
    case 'unstyled':
      return 'editor-unstyled';
    case 'blockquote':
      return 'editor-blockquote';
    default:
      return null;
  }
};

interface MyEditorState {
  editorState: EditorState;
  currentLinkEntityKey: string | null;
  linkModalVisible: boolean;
  readOnly: boolean;
}

class MyEditor extends React.PureComponent<{}, MyEditorState> {
  emitter: EventEmitter;

  editor: React.RefObject<Editor>;

  plugins: any[];

  constructor(props: {}) {
    super(props);
    const html = '<h2>测试标题</h2><ul><li>111</li><li>222</li></ul><p>test</p>';
    const contentState = htmlToContentState(html);
    this.state = {
      editorState: EditorState.createWithContent(contentState),
      currentLinkEntityKey: null,
      linkModalVisible: false,
      readOnly: false,
    };
    this.emitter = new EventEmitter();
    this.editor = React.createRef();
    this.plugins = createPlugins();
  }

  componentDidMount() {
    // init event bus
    this.emitter.on('handleEditorWithCommand', this.handleKeyCommand);
  }

  componentWillUnmount() {
    this.emitter.off('handleEditorWithCommand', this.handleKeyCommand);
  }

  focus = () => {
    (this.editor.current as Editor).focus();
  };

  setReadOnly = (readOnly: boolean) => {
    this.setState({
      readOnly,
    });
  };

  // draft-plugin-editor的onChange函数的第二个参数是一些辅助函数，并不是回调，故在只Editor组件上使用
  onEditorChange = (editorState: EditorState) => {
    const isEdit = draftHelpers.isCursorBetweenLink(editorState);
    this.setState({
      editorState,
      currentLinkEntityKey: isEdit ? isEdit.entityKey : null,
    });
  };

  // set editorState
  handleChange = (editorState: EditorState, cb?: () => any) => {
    const isEdit = draftHelpers.isCursorBetweenLink(editorState);
    this.setState(
      {
        editorState,
        currentLinkEntityKey: isEdit ? isEdit.entityKey : null,
      },
      cb,
    );
  };

  onTab = (e: React.KeyboardEvent) => {
    const { editorState } = this.state;
    const newEditorState = RichUtils.onTab(e, editorState, 4);
    if (newEditorState !== this.state.editorState) {
      this.handleChange(newEditorState);
    }
    return null;
  };

  handleReturn = (e: React.KeyboardEvent) => {
    const { editorState } = this.state;
    // some code
    return 'not-handled';
  };

  handleCommand = (command: string) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const plugin of this.plugins) {
      if (plugin.handleCommand && isEventHandled(plugin.handleCommand(command))) {
        return true;
      }
    }
    return false;
  };

  handleKeyCommand = (command: string) => {
    const { editorState } = this.state;
    const { linkDisabled } = draftHelpers.getControlButtonDisable(editorState);

    if (this.handleCommand(command)) {
      return 'handled';
    }
    if (command === 'insert-link') {
      // disable时不进行任何操作
      if (linkDisabled) {
        return 'not-handled';
      }
      this.openLinkModal();
      return 'handled';
    }
    if (command === 'insert-image') {
      this.addImage();
      return 'handled';
    }
    if (command === 'save') {
      return 'handled';
    }
    return 'not-handled';
  };

  openLinkModal = () => {
    this.setState({
      linkModalVisible: true,
    });
  };

  closeLinkModal = (e: React.MouseEvent, focusAfterClose = false) => {
    this.setState(
      {
        linkModalVisible: false,
      },
      () => {
        if (focusAfterClose) {
          this.focus();
        }
      },
    );
  };

  addImage = () => {
    const { editorState } = this.state;
    const newEditorState = draftModifiers.addImage(editorState, {
      src: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=2810627290,1080409091&fm=58',
      caption: 'bilibili',
    });
    this.handleChange(newEditorState);
  };

  addOrEditLink = (e: React.MouseEvent, { title, url }: LinkEntityData) => {
    e.preventDefault();
    let newEditorState;
    const { editorState, currentLinkEntityKey: entityKey } = this.state;
    // 如果entityKey为null，则添加link，否则是修改link
    if (entityKey === null) {
      newEditorState = draftModifiers.addLink(editorState, { title, url });
    } else {
      const content = editorState.getCurrentContent();
      const selection = editorState.getSelection();
      const blockKey = content.getBlockForKey(selection.getFocusKey()).getKey();
      newEditorState = draftModifiers.editLink(editorState, {
        title,
        url,
        blockKey,
        entityKey,
      });
    }
    // setState，并在添加链接后，关闭modal，再获取焦点
    this.handleChange(newEditorState, () => {
      this.closeLinkModal(e, true);
    });
  };

  removeLink = (blockKey: string, entityKey: string) => {
    const { editorState } = this.state;
    const newEditorState = draftModifiers.removeLink(editorState, blockKey, entityKey);
    this.handleChange(newEditorState);
  };

  showBlockTypeAndInlineStyle = () => {
    const { editorState } = this.state;
    const selection = editorState.getSelection();
    const contentBlock = editorState.getCurrentContent().getBlockForKey(selection.getStartKey());
    console.log('contentBlock:', contentBlock);
    console.log('selection:', selection);
    console.log('inlineStyle:', editorState.getCurrentInlineStyle().toJS());
  };

  logState = () => {
    const contentState = this.state.editorState.getCurrentContent();
    console.log('contentState:', contentState);
    console.log('rawContentState:', convertToRaw(contentState));
    console.log('html:', contentStateToHtml(contentState));
  };

  render() {
    const { editorState, readOnly, linkModalVisible, currentLinkEntityKey: entityKey } = this.state;
    const linkEntityInfo = draftHelpers.isCursorBetweenLink(editorState);
    const linkModalValue = draftHelpers.getLinkModalDefaultValue(editorState, entityKey as string);
    const contentState = editorState.getCurrentContent();
    const containerClass = classNames({
      'editor-container': true,
      // 当有block内容填充时，隐藏placeholder
      'editor-container-hide-placeholder':
        !contentState.hasText() && contentState.getFirstBlock().getType() !== 'unstyled',
    });

    return (
      <EditorStateContext.Provider
        value={{
          editorState,
          readOnly,
          setReadOnly: this.setReadOnly,
        }}
      >
        <React.Fragment>
          <div className={'editor-root'}>
            <EditorControlToolBar editorState={editorState} onCommand={this.handleKeyCommand}/>
            <div role={'textbox'} tabIndex={0} className={containerClass} onClick={this.focus}>
              <EditorWithPlugin
                editorState={editorState}
                readOnly={readOnly}
                blockStyleFn={blockStyleFn}
                customStyleMap={styleMap}
                placeholder={'请输入正文'}
                ref={this.editor}
                spellCheck={false}
                handleReturn={this.handleReturn}
                handleKeyCommand={this.handleKeyCommand}
                onChange={this.onEditorChange}
                onTab={this.onTab}
                plugins={this.plugins}
              />
            </div>
          </div>
          {linkEntityInfo && (
            <LinkPopover
              editorState={editorState}
              url={linkEntityInfo.url}
              blockKey={linkEntityInfo.blockKey}
              entityKey={linkEntityInfo.entityKey}
              onEditLink={this.openLinkModal}
              onRemoveLink={this.removeLink}
            />
          )}
          <LinkModal
            {...linkModalValue}
            visible={linkModalVisible}
            onOk={this.addOrEditLink}
            onCancel={this.closeLinkModal}
          />
          <p style={{ margin: 12, marginLeft: 0 }}>
            <Button type={'primary'} onClick={this.showBlockTypeAndInlineStyle}>
              check status
            </Button>
            <Button style={{ marginLeft: 8 }} type={'danger'} onClick={this.logState}>
              log state
            </Button>
          </p>
        </React.Fragment>
      </EditorStateContext.Provider>
    );
  }
}

export default MyEditor;
