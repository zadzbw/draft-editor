import * as _ from 'lodash';
import { KeyboardEvent } from 'react';
import { KeyBindingUtil, DraftHandleValue, ContentBlock } from 'draft-js';
import Divider from './Divider';
import { DIVIDER_ENTITY_TYPE } from '../../constants/entityTypes';
import { getControlButtonDisable } from '../../utils/draftHelpers';
import { addDivider } from '../../utils/draftModifiers';
import keyCode from '../../constants/keyCode';
import { ATOMIC_BLOCK_TYPE } from '../../constants/blockTypes';

const createDividerPlugin = ({ decorator }: any): any => {
  // @ts-ignore
  const pluginMethods: PluginMethods = {};
  const dividerComponent = _.isFunction(decorator) ? decorator(Divider) : Divider;

  return {
    initialize(t: PluginMethods) {
      Object.assign(pluginMethods, t);
    },
    keyBindingFn(e: KeyboardEvent) {
      // ⌘ + ⇧ + D
      if (KeyBindingUtil.hasCommandModifier(e) && e.shiftKey && e.keyCode === keyCode.D) {
        return 'insert-divider';
      }
      return undefined;
    },
    handleCommand(command: string): DraftHandleValue {
      const { getEditorState, setEditorState } = pluginMethods;
      const editorState = getEditorState();
      const { entityDisabled } = getControlButtonDisable(editorState);

      // disable时不进行任何操作
      if (entityDisabled) {
        return 'not-handled';
      }

      if (command === 'insert-divider') {
        const newEditorState = addDivider(editorState);
        if (newEditorState) {
          setEditorState(newEditorState);
        }
        return 'handled';
      }
      return 'not-handled';
    },
    blockRendererFn: (block: ContentBlock, { getEditorState }: PluginMethods) => {
      if (block.getType() === ATOMIC_BLOCK_TYPE) {
        const contentState = getEditorState().getCurrentContent();
        const entityKey = block.getEntityAt(0);
        if (!entityKey) {
          return null;
        }
        const entityType = contentState.getEntity(entityKey).getType();
        if (entityType === DIVIDER_ENTITY_TYPE) {
          return {
            component: dividerComponent,
            editable: false,
          };
        }
        return null;
      }
      return null;
    },
  };
};

export default createDividerPlugin;
