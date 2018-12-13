import { KeyboardEvent } from 'react';
import { KeyBindingUtil, getDefaultKeyBinding, RichUtils, DraftHandleValue } from 'draft-js';
import { getControlButtonDisable } from '../../utils/draftHelpers';
import { toggleBlockType } from '../../utils/draftModifiers';
import keyCode from '../../constants/keyCode';

const BLOCK = 'toggle-block-type';
const INLINE = 'toggle-inline-style';

// 这里是Editor统一处理keyBinding的方法，目的是拆分代码，并减少MyEditor.js文件的大小
// 但要注意，这个插件必须放在所有插件的最后
export default () => {
  // @ts-ignore
  const pluginMethods: PluginMethods = {};

  return {
    initialize(t: PluginMethods) {
      Object.assign(pluginMethods, t);
    },
    // 将按下的每一个key转换成相应的command，example: cmd + b -> bold
    keyBindingFn(e: KeyboardEvent) {
      /**
       * osx ? (⌘ + ⌥ || ctrl + alt): ctrl + alt
       */
      if ((e.metaKey && KeyBindingUtil.isOptionKeyCommand(e)) || (e.ctrlKey && e.altKey)) {
        // 不允许按下shift
        if (e.shiftKey) {
          return null;
        }
        // eslint-disable-next-line default-case
        switch (e.keyCode) {
          case keyCode['1']: {
            return `${BLOCK}-header-one`;
          }
          case keyCode['2']: {
            return `${BLOCK}-header-two`;
          }
          case keyCode['3']: {
            return `${BLOCK}-header-three`;
          }
          case keyCode['4']: {
            return `${BLOCK}-header-four`;
          }
        }
      }
      /**
       * osx ? ⌘ + ⇧ : ctrl + shift
       */
      if (KeyBindingUtil.hasCommandModifier(e) && e.shiftKey) {
        // eslint-disable-next-line default-case
        switch (e.keyCode) {
          case keyCode.J: {
            return `${BLOCK}-code-block`;
          }
          case keyCode.B: {
            return `${BLOCK}-blockquote`;
          }
          case keyCode.O: {
            return `${BLOCK}-ordered-list-item`;
          }
          case keyCode.U: {
            return `${BLOCK}-unordered-list-item`;
          }
        }
      }
      /**
       * osx ? ⌘ : ctrl
       */
      if (KeyBindingUtil.hasCommandModifier(e)) {
        // eslint-disable-next-line default-case
        switch (e.keyCode) {
          case keyCode.B: {
            return `${INLINE}-BOLD`;
          }
          case keyCode.I: {
            return `${INLINE}-ITALIC`;
          }
          case keyCode.U: {
            return `${INLINE}-UNDERLINE`;
          }
          case keyCode.D: {
            return `${INLINE}-STRIKETHROUGH`;
          }
          case keyCode.J: {
            return `${INLINE}-CODE`;
          }
          case keyCode.S: {
            return 'save';
          }
        }
      }

      return getDefaultKeyBinding(e);
    },
    // 根据command去设置编辑器的状态
    handleCommand(command: string): DraftHandleValue {
      const { getEditorState, setEditorState } = pluginMethods;
      const editorState = getEditorState();
      const { inlineDisabled } = getControlButtonDisable(editorState);

      if (command.startsWith('toggle-inline-style-')) {
        // disable时不进行任何操作
        if (inlineDisabled) {
          return 'not-handled';
        }
        const style = command.replace(/^toggle-inline-style-/, '');
        setEditorState(RichUtils.toggleInlineStyle(editorState, style));
        return 'handled';
      }

      if (command.startsWith('toggle-block-type-')) {
        const type = command.replace(/^toggle-block-type-/, '');
        setEditorState(toggleBlockType(editorState, type));
        return 'handled';
      }

      const newEditorState = RichUtils.handleKeyCommand(editorState, command);
      if (newEditorState) {
        setEditorState(newEditorState);
        return 'handled';
      }
      return 'not-handled';
    },
  };
};
