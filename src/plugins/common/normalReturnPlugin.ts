import { KeyboardEvent } from 'react';
import { EditorState, DraftHandleValue } from 'draft-js';
import { getCurrentBlock } from '../../utils/draftHelpers';
import { insertUnstyledParagraph, resetBlockType } from '../../utils/draftModifiers';
import { ATOMIC_BLOCK_TYPE } from '../../constants/blockTypes';

export default () => {
  return {
    handleReturn(
      e: KeyboardEvent,
      editorState: EditorState,
      { setEditorState }: PluginMethods,
    ): DraftHandleValue {
      let handleValue: DraftHandleValue = 'not-handled';
      const block = getCurrentBlock(editorState);
      const blockType = block.getType();

      // 用于处理单独敲下回车的情况
      if (!e.altKey && !e.metaKey && !e.ctrlKey) {
        // 如果是atomic，则插入新的一行
        if (blockType === ATOMIC_BLOCK_TYPE) {
          setEditorState(insertUnstyledParagraph(editorState));
          handleValue = 'handled';
        }

        // 如果在<blockquote>、<ul>、<ol>中未输入任何文字时敲下回车，则reset成unstyled block
        if (block.getLength() === 0) {
          if (['blockquote', 'unordered-list-item', 'ordered-list-item'].includes(blockType)) {
            setEditorState(resetBlockType(editorState, 'unstyled'));
            handleValue = 'handled';
          }
        }
      }
      return handleValue;
    },
  };
};
