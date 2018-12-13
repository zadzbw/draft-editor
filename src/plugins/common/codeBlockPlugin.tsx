import * as React from 'react';
import { EditorState, Modifier, RichUtils, ContentBlock, DraftHandleValue } from 'draft-js';
import { Map } from 'immutable';

export default () => {
  return {
    blockRenderMap: Map({
      'code-block': {
        element: 'code',
        wrapper: <pre className={'public-DraftStyleDefault-pre'}/>,
      },
    }),
    blockStyleFn(block: ContentBlock) {
      const type = block.getType();
      if (type === 'code-block') {
        return 'editor-code-block';
      }
      return null;
    },
    handlePastedText(
      text: string,
      html: string,
      editorState: EditorState,
      { setEditorState }: PluginMethods,
    ): DraftHandleValue {
      const contentState = editorState.getCurrentContent();
      const selection = editorState.getSelection();
      const blockType = RichUtils.getCurrentBlockType(editorState);
      // 代码块内直接粘贴文本，移除inline style
      if (blockType === 'code-block') {
        const newContentState = Modifier.replaceText(contentState, selection, text);
        setEditorState(EditorState.push(editorState, newContentState, 'insert-characters'));
        return 'handled';
      }
      return 'not-handled';
    },
    // 在code-block内，按下回车只有换行操作
    handleReturn(
      e: React.KeyboardEvent,
      editorState: EditorState,
      { setEditorState }: PluginMethods,
    ): DraftHandleValue {
      const blockType = RichUtils.getCurrentBlockType(editorState);
      if (blockType === 'code-block') {
        setEditorState(RichUtils.insertSoftNewline(editorState));
        return 'handled';
      }
      return 'not-handled';
    },
  };
};
