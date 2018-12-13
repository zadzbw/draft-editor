import { KeyboardEvent } from 'react';
import { EditorState, DraftHandleValue, RichUtils } from 'draft-js';

export default () => {
  return {
    handleReturn(
      e: KeyboardEvent,
      editorState: EditorState,
      { setEditorState }: PluginMethods,
    ): DraftHandleValue {
      // 按下 shift + enter, 添加`\n`换行
      if (e.shiftKey) {
        setEditorState(RichUtils.insertSoftNewline(editorState));
        return 'handled';
      }
      return 'not-handled';
    },
  };
};
