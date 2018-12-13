import * as Immutable from 'immutable';
import {
  AtomicBlockUtils,
  DefaultDraftInlineStyle,
  EditorState,
  ContentState,
  ContentBlock,
  Modifier,
  RichUtils,
  SelectionState,
  CharacterMetadata,
} from 'draft-js';
import { ATOMIC_BLOCK_TYPE } from '../constants/blockTypes';
import { LINK_ENTITY_TYPE, DIVIDER_ENTITY_TYPE, IMAGE_ENTITY_TYPE } from '../constants/entityTypes';
import * as draftHelpers from './draftHelpers';

// /**
//  * 新增一个block
//  * @param editorState {EditorState}
//  * @param newType {string}
//  * @param text {string}
//  * @param data {object}
//  * @return {EditorState}
//  */
// export const addNewBlock = (
//   editorState: EditorState,
//   newType = 'unstyled',
//   text = '',
//   data = {},
// ): EditorState => {
//   const selection = editorState.getSelection();
//   if (!selection.isCollapsed()) {
//     return editorState;
//   }
//   const contentState = editorState.getCurrentContent();
//   const blockKey = selection.getStartKey();
//   const blockMap = contentState.getBlockMap();
//   const currentBlock = contentState.getBlockForKey(blockKey);
//   if (!currentBlock) {
//     return editorState;
//   }
//   if (currentBlock.getLength() === 0) {
//     if (currentBlock.getType() === newType) {
//       return editorState;
//     }
//     // @ts-ignore
//     const newBlock: ContentBlock = currentBlock.merge({
//       type: newType,
//       data,
//       text,
//       characterList: Immutable.Repeat(
//         // @ts-ignore
//         new CharacterMetadata({
//           style: Immutable.OrderedSet(),
//           entity: null,
//         }),
//         text.length,
//       ).toList(),
//     });
//     // @ts-ignore
//     const newContentState: ContentState = contentState.merge({
//       blockMap: blockMap.set(blockKey, newBlock),
//       selectionAfter: selection,
//     });
//     return EditorState.forceSelection(
//       EditorState.push(editorState, newContentState, 'change-block-type'),
//       // @ts-ignore
//       selection.merge({
//         anchorKey: newBlock.getKey(),
//         focusKey: newBlock.getKey(),
//         anchorOffset: text.length,
//         focusOffset: text.length,
//       }),
//     );
//   }
//   return editorState;
// };

/**
 * 添加链接
 * @param editorState {EditorState}
 * @param title {string}
 * @param url {string}
 * @return {EditorState}
 */
export const addLink = (editorState: EditorState, { title, url }: LinkEntityData): EditorState => {
  const contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  // 创建新 entity
  const entityKey = contentState
    .createEntity(LINK_ENTITY_TYPE, 'MUTABLE', { url })
    .getLastCreatedEntityKey();
  const newContentState = Modifier.replaceText(
    contentState,
    selection,
    title,
    undefined,
    entityKey,
  );
  return EditorState.push(editorState, newContentState, 'insert-characters');
};

/**
 * 编辑链接
 * @param editorState {EditorState}
 * @param title {string}
 * @param url {string}
 * @param blockKey {string}
 * @param entityKey {string}
 * @return {EditorState}
 */
export const editLink = (
  editorState: EditorState,
  {
    title,
    url,
    blockKey,
    entityKey,
  }: LinkEntityData & {
    blockKey: string;
    entityKey: string;
  },
): EditorState => {
  // 先选中entity
  const entitySelection = draftHelpers.getEntitySelection(editorState, blockKey, entityKey);
  const editorStateWithSelection = EditorState.forceSelection(editorState, entitySelection);
  // 添加新的link，并设置offset为entity的最后
  const newSelection = editorStateWithSelection.getSelection();
  const oldOffset = newSelection.getAnchorOffset(); // entity range start
  const newOffset = oldOffset + title.length; // new entity range end
  return EditorState.forceSelection(
    addLink(editorStateWithSelection, { title, url }),
    // @ts-ignore
    newSelection.merge({
      focusOffset: newOffset,
      anchorOffset: newOffset,
    }),
  );
};

/**
 * 取消链接
 * @param editorState {EditorState}
 * @param blockKey {string}
 * @param entityKey {string}
 * @return {EditorState}
 */
export const removeLink = (
  editorState: EditorState,
  blockKey: string,
  entityKey: string,
): EditorState => {
  const selection = editorState.getSelection();
  // 获取entity的selection
  const entitySelection = draftHelpers.getEntitySelection(editorState, blockKey, entityKey);
  // 取消link，并选取最初的selection
  return EditorState.forceSelection(
    RichUtils.toggleLink(editorState, entitySelection, null),
    selection,
  );
};

/**
 * 添加图片
 * @param editorState {EditorState}
 * @param src {string}
 * @param caption {string}
 * @param extraData {object}
 * @return {EditorState}
 */
export const addImage = (
  editorState: EditorState,
  { src, caption, ...extraData }: ImageEntityData,
): EditorState => {
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(IMAGE_ENTITY_TYPE, 'IMMUTABLE', {
    src,
    caption,
    ...extraData,
  });
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');

  return EditorState.forceSelection(
    newEditorState,
    newEditorState.getCurrentContent().getSelectionAfter(),
  );
};

/**
 * 编辑图片
 * @param editorState {EditorState}
 * @param entityKey {string}
 * @param data {object}
 * @return {EditorState}
 */
export const editImage = (
  editorState: EditorState,
  entityKey: string,
  data: Partial<ImageEntityData>,
): EditorState => {
  const contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const newContentState = contentState.mergeEntityData(entityKey, data);
  const newEditorState = EditorState.push(editorState, newContentState, 'apply-entity');

  return EditorState.forceSelection(newEditorState, selection);
};

/**
 * 添加分割线
 * @param editorState {EditorState}
 * @param data [object]
 * @return {EditorState}
 */
export const addDivider = (editorState: EditorState, data = {}): EditorState => {
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(DIVIDER_ENTITY_TYPE, 'IMMUTABLE', data);
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');

  return EditorState.forceSelection(
    newEditorState,
    newEditorState.getCurrentContent().getSelectionAfter(),
  );
};

/**
 * 插入一个unstyled block
 * @param editorState {EditorState}
 * @return {EditorState}
 */
export const insertUnstyledParagraph = (editorState: EditorState): EditorState => {
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const startKey = selection.getStartKey();

  const withSplitContent = Modifier.splitBlock(content, selection);
  const unstyledBlockKey = withSplitContent.getKeyAfter(startKey);
  const unstyledSelection = SelectionState.createEmpty(unstyledBlockKey);
  const unstyledContent = Modifier.setBlockType(withSplitContent, unstyledSelection, 'unstyled');

  return EditorState.forceSelection(
    EditorState.push(editorState, unstyledContent, 'split-block'),
    unstyledSelection,
  );
};

/**
 * 去除所有inline style
 * @param contentState {ContentState}
 * @param selection {SelectionState}
 * @return {ContentState}
 */
export const removeInlineStyle = (
  contentState: ContentState,
  selection: SelectionState,
): ContentState => {
  // remove style reducer
  return Object.keys(DefaultDraftInlineStyle).reduce((_contentState, inlineStyle) => {
    return Modifier.removeInlineStyle(_contentState, selection, inlineStyle);
  }, contentState);
};

/**
 * 清除block的type，并设置为unstyled
 * @param contentState {ContentState}
 * @param selection {SelectionState}
 * @return {ContentState}
 */
export const removeBlockType = (
  contentState: ContentState,
  selection: SelectionState,
): ContentState => {
  const blockMap = contentState.getBlockMap();
  const startKey = selection.getStartKey();
  const endKey = selection.getEndKey();

  // 找到被选中的blocks，并清除格式
  const selectedBlockMapSeq = blockMap
    .toKeyedSeq()
    .skipUntil((v, k) => k === startKey)
    .takeUntil((v, k) => k === endKey)
    .concat(Immutable.Map({ [endKey]: blockMap.get(endKey) }))
    .map((block: ContentBlock) => (block.getType() === ATOMIC_BLOCK_TYPE ? block : block.set('type', 'unstyled')));

  // 将已经清除格式的blockMapSeq合并回去
  // @ts-ignore
  const newBlockMap = blockMap.merge(selectedBlockMapSeq);
  // @ts-ignore
  return contentState.set('blockMap', newBlockMap);
};

/**
 * RichUtils.toggleBlockType 的增强
 * 在切换时，可以去除code-block内的inline-style
 * @param editorState {EditorState}
 * @param type {string}
 * @return {EditorState}
 */
export const toggleBlockType = (editorState: EditorState, type: string): EditorState => {
  // 用户选取的selection
  const selection = editorState.getSelection();
  // 先toggle type
  const toggledState = RichUtils.toggleBlockType(editorState, type);
  let newContentState = toggledState.getCurrentContent();

  // 清除code-block里的inline style
  if (type === 'code-block') {
    const startKey = selection.getStartKey();
    const endKey = selection.getEndKey();
    const lastBlock = newContentState.getBlockForKey(endKey);
    // 计算出整个code-block的selection
    const newSelection = new SelectionState({
      anchorKey: startKey,
      anchorOffset: 0,
      focusKey: endKey,
      focusOffset: lastBlock.getLength(),
    });
    newContentState = removeInlineStyle(newContentState, newSelection);
  }

  return EditorState.forceSelection(
    EditorState.push(editorState, newContentState, 'change-block-type'),
    selection,
  );
};

/**
 * 重置当前selection选中block的type
 * @param editorState {EditorState}
 * @param type {string}
 * @return {EditorState}
 */
export const resetBlockType = (editorState: EditorState, type: string): EditorState => {
  const contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const startKey = selection.getStartKey();
  const blockMap = contentState.getBlockMap();
  const block = draftHelpers.getCurrentBlock(editorState);

  const newBlock = block.merge({
    text: '',
    type,
  });
  const newContentState = contentState.mergeDeep({
    // @ts-ignore
    blockMap: blockMap.set(startKey, newBlock),
    selectionAfter: selection.merge({
      anchorOffset: 0,
      focusOffset: 0,
    }),
  });
  // @ts-ignore
  return EditorState.push(editorState, newContentState, 'change-block-type');
};

/**
 * 清除所有格式
 * @param editorState {EditorState}
 * @return {EditorState}
 */
export const clearFormat = (editorState: EditorState): EditorState => {
  const contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();

  // 先清除style，再清除block
  const inlineStyleRemovedContent = removeInlineStyle(contentState, selection);
  const blockTypeRemovedContent = removeBlockType(inlineStyleRemovedContent, selection);

  return EditorState.forceSelection(
    EditorState.push(editorState, blockTypeRemovedContent, 'change-block-type'),
    selection,
  );
};

/**
 * 拦截input，并模拟输入
 * @param editorState {EditorState}
 * @param inputString {string}
 * @return {EditorState}
 */
export const mockInput = (editorState: EditorState, inputString: string): EditorState => {
  const newContentState = Modifier.insertText(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    inputString,
    editorState.getCurrentInlineStyle(),
  );
  return EditorState.forceSelection(
    EditorState.push(editorState, newContentState, 'insert-characters'),
    newContentState.getSelectionAfter(),
  );
};
