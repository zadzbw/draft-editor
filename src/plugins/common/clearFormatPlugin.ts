import { KeyboardEvent } from 'react';
import { KeyBindingUtil, DraftHandleValue } from 'draft-js';
import { clearFormat } from '../../utils/draftModifiers';
import keyCode from '../../constants/keyCode';

export default () => {
  // @ts-ignore
  const pluginMethods: PluginMethods = {};

  return {
    initialize(t: PluginMethods) {
      Object.assign(pluginMethods, t);
    },
    keyBindingFn(e: KeyboardEvent) {
      // ⌘ + ⇧ + L
      if (KeyBindingUtil.hasCommandModifier(e) && e.shiftKey && e.keyCode === keyCode.L) {
        return 'clear-format';
      }
      // 这里绝对不能return null，否则后续的plugin的bindingFn会被阻止
      return undefined;
    },
    handleCommand(command: string): DraftHandleValue {
      const { getEditorState, setEditorState } = pluginMethods;
      const editorState = getEditorState();

      if (command === 'clear-format') {
        const newEditorState = clearFormat(editorState);
        if (newEditorState) {
          setEditorState(newEditorState);
        }
        return 'handled';
      }
      return 'not-handled';
    },
  };
};
