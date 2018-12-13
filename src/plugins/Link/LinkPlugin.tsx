import * as React from 'react';
import { CharacterMetadata, ContentState, ContentBlock, KeyBindingUtil } from 'draft-js';
import Link from './Link';
import { LINK_ENTITY_TYPE } from '../../constants/entityTypes';
import keyCode from '../../constants/keyCode';

export const linkStrategy = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState,
): void => {
  contentBlock.findEntityRanges((character: CharacterMetadata) => {
    const entityKey = character.getEntity();
    return entityKey !== null && contentState.getEntity(entityKey).getType() === LINK_ENTITY_TYPE;
  }, callback);
};

const linkPlugin = (config = {}): any => {
  return {
    decorators: [
      {
        strategy: linkStrategy,
        component(props: any) {
          return <Link {...props}/>;
        },
      },
    ],
    keyBindingFn(e: React.KeyboardEvent) {
      // ⌘ + K
      if (KeyBindingUtil.hasCommandModifier(e) && !e.shiftKey && e.keyCode === keyCode.K) {
        return 'insert-link';
      }
      return undefined;
    },
  };
};

export default linkPlugin;
