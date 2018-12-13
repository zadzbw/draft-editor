import * as React from 'react';
import { EditorState, DraftHandleValue } from 'draft-js';
import { Map } from 'immutable';
import { isInBlockEnd } from '../../utils/draftHelpers';
import { insertUnstyledParagraph } from '../../utils/draftModifiers';

export default () => {
  return {
    blockRenderMap: Map({
      // 文章中header level最小为4
      'header-four': {
        element: 'h4',
        aliasedElements: ['h5', 'h6'], // 复制的h5、h6标签，会被映射成header-four draft block
      },
      'header-five': {},
      'header-six': {},
    }),
    handleReturn(
      e: React.KeyboardEvent,
      editorState: EditorState,
      { setEditorState }: PluginMethods,
    ): DraftHandleValue {
      const selection = editorState.getSelection();
      const block = editorState.getCurrentContent().getBlockForKey(selection.getStartKey());

      if (isInBlockEnd(block, selection)) {
        const blockType = block.getType();
        if (blockType.startsWith('header-')) {
          const newEditorState = insertUnstyledParagraph(editorState);
          if (newEditorState) {
            setEditorState(newEditorState);
            return 'handled';
          }
        }
      }
      return 'not-handled';
    },
  };
};
