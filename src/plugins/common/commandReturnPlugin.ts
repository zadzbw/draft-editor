import { KeyboardEvent } from 'react';
import { EditorState, KeyBindingUtil } from 'draft-js';
import { isInBlockEnd, getCurrentBlock } from '../../utils/draftHelpers';
import { insertUnstyledParagraph } from '../../utils/draftModifiers';

export default () => {
  return {
    // 只要在block的末尾，按下cmd + enter插入unstyled block
    handleReturn(e: KeyboardEvent, editorState: EditorState, { setEditorState }: PluginMethods) {
      const selection = editorState.getSelection();
      const block = getCurrentBlock(editorState);

      if (isInBlockEnd(block, selection)) {
        if (KeyBindingUtil.hasCommandModifier(e)) {
          setEditorState(insertUnstyledParagraph(editorState));
          return 'handled';
        }
      }
      return 'not-handled';
    },
  };
};
