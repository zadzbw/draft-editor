import { EditorState, DraftHandleValue } from 'draft-js';
import * as draftHelpers from '../../utils/draftHelpers';
import * as draftModifiers from '../../utils/draftModifiers';

export default () => {
  // @ts-ignore
  const pluginMethods: PluginMethods = {};
  let isReset = false; // 用于表明是否重新设置了blockType

  return {
    initialize(t: PluginMethods) {
      Object.assign(pluginMethods, t);
    },
    // 在输入前，进行列表的markdown语法补全
    handleBeforeInput(inputString: string, editorState: EditorState): DraftHandleValue {
      const { setEditorState } = pluginMethods;
      const selection = editorState.getSelection();
      if (selection.isCollapsed() && inputString === ' ') {
        // eslint-disable-next-line no-param-reassign
        editorState = draftModifiers.mockInput(editorState, inputString); // 先mock一次input
        let newEditorState = editorState;
        const block = draftHelpers.getCurrentBlock(editorState);
        const blockText = block.getText();
        const blockType = block.getType();

        // 只转换unstyled block
        if (blockType !== 'unstyled') {
          return 'not-handled';
        }
        // ul
        if (/^([-+*]) $/.test(blockText)) {
          newEditorState = draftModifiers.resetBlockType(editorState, 'unordered-list-item');
        }
        // ol
        if (/^1\. $/.test(blockText)) {
          newEditorState = draftModifiers.resetBlockType(editorState, 'ordered-list-item');
        }

        if (newEditorState !== editorState) {
          setEditorState(newEditorState);
          isReset = true;
          return 'handled';
        }
        return 'not-handled';
      }
      return 'not-handled';
    },
    // 删除时进行undo
    handleCommand(command: string): DraftHandleValue {
      const { getEditorState, setEditorState } = pluginMethods;
      const editorState = getEditorState();
      if (command === 'backspace' && isReset) {
        setEditorState(EditorState.undo(editorState));
        return 'handled';
      }
      return 'not-handled';
    },
    onChange(editorState: EditorState): EditorState {
      isReset = false;
      return editorState;
    },
  };
};
