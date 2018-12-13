// 这里提供一些draft相关的通用方法
import { ContentBlock, EditorState, RichUtils, SelectionState } from 'draft-js';
import { LINK_ENTITY_TYPE } from '../constants/entityTypes';
import { ATOMIC_BLOCK_TYPE } from '../constants/blockTypes';

/**
 * 判断光标是否在block的末尾
 * @param block {ContentBlock}
 * @param selection {SelectionState}
 * @return {boolean}
 */
export const isInBlockEnd = (block: ContentBlock, selection: SelectionState): boolean => {
  const length = block.getLength();
  const blockKey = block.getKey();
  const startKey = selection.getStartKey();
  const endKey = selection.getEndKey();
  const endOffset = selection.getEndOffset();

  // 如果选中的不是该block，则直接返回false
  if (selection.getStartKey() !== blockKey) {
    return false;
  }

  // 选中了多个block，则返回true
  const selectionInMultiBlock = startKey !== endKey;
  // 光标在block的末尾，且selection重合
  const inEnd = length === endOffset && selection.isCollapsed();

  return selectionInMultiBlock || inEnd;
};

/**
 * 获取当前光标所在的block
 * @param editorState {EditorState}
 * @return {ContentBlock}
 */
export const getCurrentBlock = (editorState: EditorState): ContentBlock => {
  const selection = editorState.getSelection();
  return editorState.getCurrentContent().getBlockForKey(selection.getStartKey());
};

/**
 * 获取当前状态下，编辑器控制按钮的disable status
 * @param editorState {EditorState}
 * @return {{
 * inlineDisabled: boolean,
 * blockDisabled: boolean,
 * linkDisabled: boolean,
 * entityDisabled: boolean,
 * clearFormatDisabled: boolean
 * }}
 */
export const getControlButtonDisable = (
  editorState: EditorState,
): {
  inlineDisabled: boolean;
  blockDisabled: boolean;
  linkDisabled: boolean;
  entityDisabled: boolean;
  clearFormatDisabled: boolean;
} => {
  const result = {
    inlineDisabled: false,
    blockDisabled: false,
    linkDisabled: false,
    entityDisabled: false,
    clearFormatDisabled: false,
  };
  const selection = editorState.getSelection();
  const blockType = RichUtils.getCurrentBlockType(editorState);
  if (blockType === ATOMIC_BLOCK_TYPE) {
    result.inlineDisabled = true;
    result.blockDisabled = true;
    result.linkDisabled = true;
    result.entityDisabled = true;
    result.clearFormatDisabled = true;
  }
  if (blockType === 'code-block') {
    result.inlineDisabled = true;
    result.linkDisabled = true;
    result.entityDisabled = true;
  }
  // 选择不同的block，禁止插入Link
  if (selection.getAnchorKey() !== selection.getFocusKey()) {
    result.linkDisabled = true;
  }
  return result;
};

/**
 * 判断光标是否在Link内
 * @param editorState {EditorState}
 * @return
 */
export const isCursorBetweenLink = (
  editorState: EditorState,
): {
  blockKey: string;
  entityKey: string;
  url: string;
} | null => {
  let result = null;
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const block = getCurrentBlock(editorState);

  if (!block) {
    return result;
  }

  if (block.getType() !== ATOMIC_BLOCK_TYPE && selection.isCollapsed()) {
    const offset = selection.getFocusOffset();
    const entityKey = block.getEntityAt(offset) || block.getEntityAt(offset - 1);
    if (entityKey) {
      const entity = content.getEntity(entityKey);
      const blockKey = block.getKey();
      if (entity.getType() === LINK_ENTITY_TYPE) {
        result = {
          blockKey,
          entityKey,
          url: entity.getData().url,
        };
      }
    }
  }

  return result;
};

/**
 * 获取entityKey对应entity的SelectionState
 * @param editorState {EditorState}
 * @param blockKey {string}
 * @param entityKey {string}
 * @return {SelectionState}
 */
export const getEntitySelection = (
  editorState: EditorState,
  blockKey: string,
  entityKey: string,
): SelectionState => {
  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(blockKey);
  let newSelection: SelectionState = new SelectionState({
    anchorKey: blockKey,
    focusKey: blockKey,
  });
  block.findEntityRanges(
    character => character.getEntity() === entityKey,
    (start, end) => {
      // 选中entity
      // @ts-ignore
      newSelection = newSelection.merge({
        anchorOffset: start,
        focusOffset: end,
      });
    },
  );
  return newSelection;
};

/**
 * 获取entity的range及text
 * @param editorState {EditorState}
 * @param blockKey {string}
 * @param entityKey {string}
 * @return {{start,end,text}}
 */
export const getEntityRange = (
  editorState: EditorState,
  blockKey: string,
  entityKey: string,
): {
  start: number;
  end: number;
  text: string;
} => {
  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(blockKey);
  let start = 0;
  let end = 0;
  let text = '';
  block.findEntityRanges(
    character => character.getEntity() === entityKey,
    (_start, _end) => {
      start = _start;
      end = _end;
      text = block.getText().slice(start, end);
    },
  );
  return {
    start,
    end,
    text,
  };
};

/**
 * 获取linkModal的默认props
 * @param editorState {EditorState}
 * @param entityKey {string}
 * @return {{defaultTitle,defaultUrl?} | null}
 */
export const getLinkModalDefaultValue = (
  editorState: EditorState,
  entityKey?: string,
): {
  defaultTitle: string;
  defaultUrl?: string;
} | null => {
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const block = getCurrentBlock(editorState);
  const blockKey = block.getKey();

  if (entityKey) {
    const { url } = content.getEntity(entityKey).getData();
    const { text } = getEntityRange(editorState, blockKey, entityKey);
    return {
      defaultTitle: text,
      defaultUrl: url,
    };
  }
  // 如果选的不是一个block，则返回null
  if (selection.getAnchorKey() !== selection.getFocusKey()) {
    return null;
  }
  return {
    defaultTitle: block.getText().slice(selection.getStartOffset(), selection.getEndOffset()),
  };
};
