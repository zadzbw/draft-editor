import * as _ from 'lodash';
import { KeyboardEvent } from 'react';
import { KeyBindingUtil, ContentBlock } from 'draft-js';
import Image from './Image';
import './Image.scss';
import keyCode from '../../constants/keyCode';
import { ATOMIC_BLOCK_TYPE } from '../../constants/blockTypes';
import { IMAGE_ENTITY_TYPE } from '../../constants/entityTypes';

export default function createImagePlugin({ decorator }: any): any {
  // @ts-ignore
  const pluginMethods: PluginMethods = {};
  const ImageComponent = _.isFunction(decorator) ? decorator(Image) : Image;

  return {
    initialize(t: PluginMethods) {
      Object.assign(pluginMethods, t);
    },
    keyBindingFn(e: KeyboardEvent) {
      // ⌘ + ⇧ + I
      if (KeyBindingUtil.hasCommandModifier(e) && e.shiftKey && e.keyCode === keyCode.I) {
        return 'insert-image';
      }
      return undefined;
    },
    blockRendererFn: (block: ContentBlock, { getEditorState, setEditorState }: PluginMethods) => {
      if (block.getType() === ATOMIC_BLOCK_TYPE) {
        const contentState = getEditorState().getCurrentContent();
        const entityKey = block.getEntityAt(0);
        if (!entityKey) {
          return null;
        }
        const entity = contentState.getEntity(entityKey);
        const entityType = entity.getType();
        if (entityType === IMAGE_ENTITY_TYPE) {
          const data = entity.getData();
          return {
            component: ImageComponent,
            editable: false,
            props: {
              data,
              blockKey: block.getKey(),
              entityKey,
              getEditorState,
              setEditorState,
            },
          };
        }
        return null;
      }
      return null;
    },
  };
}
