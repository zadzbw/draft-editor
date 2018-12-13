/* eslint-disable no-shadow */
import { EditorState, SelectionState } from 'draft-js';
import { htmlToContentState } from '../draftConverter';
import {
  isInBlockEnd,
  getCurrentBlock,
  getControlButtonDisable,
  isCursorBetweenLink,
  getEntitySelection,
  getEntityRange,
  getLinkModalDefaultValue,
} from '../draftHelpers';

describe('draftHelpers', () => {
  const contentState = htmlToContentState('<p>111</p><p>222</p>');
  const [firstBlock, secondBlock] = contentState.getBlocksAsArray();

  const firstKey = firstBlock.getKey();
  const secondKey = secondBlock.getKey();

  const firstLen = firstBlock.getLength();
  const secondLen = secondBlock.getLength();

  describe('isInBlockEnd', () => {
    it('should return true when select multiple blocks', () => {
      // 正着选
      const selectionState = new SelectionState({
        anchorKey: firstKey,
        anchorOffset: 2,
        focusKey: secondKey,
        focusOffset: 2,
      });

      // 反着选
      const BackwardSelectionState = new SelectionState({
        anchorKey: secondKey,
        anchorOffset: 2,
        focusKey: firstKey,
        focusOffset: 2,
        isBackward: true,
      });

      expect(isInBlockEnd(firstBlock, selectionState)).toBe(true);
      expect(isInBlockEnd(firstBlock, BackwardSelectionState)).toBe(true);
    });

    it('should return true when selection in block end', () => {
      // first
      const selectionState1 = new SelectionState({
        anchorKey: firstKey,
        anchorOffset: firstLen,
        focusKey: firstKey,
        focusOffset: firstLen,
      });

      // second
      const selectionState2 = new SelectionState({
        anchorKey: secondKey,
        anchorOffset: secondLen,
        focusKey: secondKey,
        focusOffset: secondLen,
      });

      expect(isInBlockEnd(firstBlock, selectionState1)).toBe(true);
      expect(isInBlockEnd(secondBlock, selectionState2)).toBe(true);

      expect(isInBlockEnd(firstBlock, selectionState2)).toBe(false);
      expect(isInBlockEnd(secondBlock, selectionState1)).toBe(false);
    });

    it('should return false when other situations', () => {
      // 未选中的selection
      const selectionState = new SelectionState({
        anchorKey: 'test-key',
        anchorOffset: firstLen,
        focusKey: 'test-key',
        focusOffset: firstLen,
      });

      // selection是未折叠的
      const selectionState2 = new SelectionState({
        anchorKey: firstKey,
        anchorOffset: 2,
        focusKey: firstKey,
        focusOffset: firstLen,
      });

      // 未选中末尾
      const selectionState3 = new SelectionState({
        anchorKey: firstKey,
        anchorOffset: 2,
        focusKey: firstKey,
        focusOffset: 2,
      });

      expect(isInBlockEnd(firstBlock, selectionState)).toBe(false);
      expect(isInBlockEnd(firstBlock, selectionState2)).toBe(false);
      expect(isInBlockEnd(firstBlock, selectionState3)).toBe(false);
    });
  });

  describe('getCurrentBlock', () => {
    it('should get current block correctly', () => {
      const editorState = EditorState.createWithContent(contentState);
      const updatedSelection = editorState.getSelection().merge({
        anchorKey: secondKey,
        anchorOffset: 0,
        focusKey: secondKey,
        focusOffset: 0,
      });
      const editorState2 = EditorState.acceptSelection(editorState, updatedSelection);

      expect(getCurrentBlock(editorState)).toBe(firstBlock);
      expect(getCurrentBlock(editorState2)).toBe(secondBlock);
    });
  });

  describe('getControlButtonDisable', () => {
    it('should enable all when selection in normal block', () => {
      const editorState = EditorState.createWithContent(contentState);
      const disableStatus = getControlButtonDisable(editorState);

      expect(disableStatus).toEqual({
        inlineDisabled: false,
        blockDisabled: false,
        linkDisabled: false,
        entityDisabled: false,
        clearFormatDisabled: false,
      });
    });

    it('should disable all when selection in atomic divider block', () => {
      const contentState = htmlToContentState('<hr/>');
      const editorState = EditorState.createWithContent(contentState);
      const disableStatus = getControlButtonDisable(editorState);

      expect(disableStatus).toEqual({
        inlineDisabled: true,
        blockDisabled: true,
        linkDisabled: true,
        entityDisabled: true,
        clearFormatDisabled: true,
      });
    });

    it('should disable all when selection in atomic image block', () => {
      const contentState = htmlToContentState(
        '<div class="image-package"><img src="https://xxx.com/test.png" alt="xxxlogo"/><br/><div class="image-caption">xxxlogo</div></div>',
      );
      const editorState = EditorState.createWithContent(contentState);
      const disableStatus = getControlButtonDisable(editorState);

      expect(disableStatus).toEqual({
        inlineDisabled: true,
        blockDisabled: true,
        linkDisabled: true,
        entityDisabled: true,
        clearFormatDisabled: true,
      });
    });

    it('should disable inline-style、link and entity when selection in code-block', () => {
      const contentState = htmlToContentState('<pre><code>test<br/>1234</code></pre><p>hello</p>');
      const editorState = EditorState.createWithContent(contentState);
      const disableStatus = getControlButtonDisable(editorState);

      expect(disableStatus).toEqual({
        inlineDisabled: true,
        blockDisabled: false,
        linkDisabled: true,
        entityDisabled: true,
        clearFormatDisabled: false,
      });
    });

    it('should disable link when selection in different blocks', () => {
      const editorState = EditorState.createWithContent(contentState);
      // 选取两个block
      const selection = new SelectionState({
        anchorKey: firstKey,
        anchorOffset: 2,
        focusKey: secondKey,
        focusOffset: 2,
      });
      const disableStatus = getControlButtonDisable(
        EditorState.acceptSelection(editorState, selection),
      );

      expect(disableStatus).toEqual({
        inlineDisabled: false,
        blockDisabled: false,
        linkDisabled: true,
        entityDisabled: false,
        clearFormatDisabled: false,
      });
    });
  });

  describe('isCursorBetweenLink', () => {
    const contentState = htmlToContentState(
      '<p>123<a href="http://www.baidu.com/">百度一下</a>321</p>',
    );
    const editorState = EditorState.createWithContent(contentState);

    it('should return null when selection not in link', () => {
      expect(getCurrentBlock(editorState).getText()).toBe('123百度一下321');
      expect(isCursorBetweenLink(editorState)).toBe(null);
    });

    it('should return null when not found block', () => {
      const selection = editorState.getSelection().merge({
        anchorKey: 'test-key',
        anchorOffset: 5,
        focusKey: 'test-key',
        focusOffset: 5,
      });
      expect(isCursorBetweenLink(EditorState.acceptSelection(editorState, selection))).toBe(null);
    });

    it('should return null when selection is not collapsed', () => {
      const selection = editorState.getSelection().merge({
        anchorOffset: 4,
        focusOffset: 6,
      });
      expect(isCursorBetweenLink(EditorState.acceptSelection(editorState, selection))).toBe(null);
    });

    it('should return info when selection is between entity', () => {
      const selection = editorState.getSelection().merge({
        anchorOffset: 5,
        focusOffset: 5,
      });
      expect(isCursorBetweenLink(EditorState.acceptSelection(editorState, selection)).url).toBe(
        'http://www.baidu.com/',
      );
    });

    it('should return info when selection is in entity start', () => {
      const selection = editorState.getSelection().merge({
        anchorOffset: 3,
        focusOffset: 3,
      });
      expect(isCursorBetweenLink(EditorState.acceptSelection(editorState, selection)).url).toBe(
        'http://www.baidu.com/',
      );
    });

    it('should return info when selection is in entity end', () => {
      const selection = editorState.getSelection().merge({
        anchorOffset: 7,
        focusOffset: 7,
      });
      expect(isCursorBetweenLink(EditorState.acceptSelection(editorState, selection)).url).toBe(
        'http://www.baidu.com/',
      );
    });
  });

  describe('getEntitySelection and getEntityRange', () => {
    const contentState = htmlToContentState(
      '<p>123<a href="http://www.baidu.com/">百度一下</a>321</p>',
    );
    const editorState = EditorState.createWithContent(contentState);

    it('should return correct value when entity is found', () => {
      const selection = editorState.getSelection().merge({
        anchorOffset: 5,
        focusOffset: 5,
      });
      const selectedEditorState = EditorState.acceptSelection(editorState, selection);
      const { blockKey, entityKey } = isCursorBetweenLink(selectedEditorState);
      const entitySelection = getEntitySelection(selectedEditorState, blockKey, entityKey);
      const entityRange = getEntityRange(selectedEditorState, blockKey, entityKey);

      // 选中该entity
      expect(entitySelection.getAnchorKey()).toBe(blockKey);
      expect(entitySelection.getStartOffset()).toBe(3);
      expect(entitySelection.getEndOffset()).toBe(7);

      expect(entityRange.start).toBe(3);
      expect(entityRange.end).toBe(7);
      expect(entityRange.text).toBe('百度一下');
    });

    it('should return correct value when entity is not found', () => {
      const selection = editorState.getSelection().merge({
        anchorOffset: 5,
        focusOffset: 5,
      });
      const selectedEditorState = EditorState.acceptSelection(editorState, selection);
      const { blockKey } = isCursorBetweenLink(selectedEditorState);
      const entityKey = 'test-key';
      const entitySelection = getEntitySelection(selectedEditorState, blockKey, entityKey);
      const entityRange = getEntityRange(selectedEditorState, blockKey, entityKey);

      // 选中该block的起点
      expect(entitySelection.getAnchorKey()).toBe(blockKey);
      expect(entitySelection.getStartOffset()).toBe(0);
      expect(entitySelection.getEndOffset()).toBe(0);

      expect(entityRange.start).toBe(0);
      expect(entityRange.end).toBe(0);
      expect(entityRange.text).toBe('');
    });
  });

  describe('getLinkModalDefaultValue', () => {
    it('should return selected text when entityKey is not specified', () => {
      const contentState = htmlToContentState(
        '<p>123<a href="http://www.baidu.com/">百度一下</a>321</p>',
      );
      const editorState = EditorState.createWithContent(contentState);
      const blockText = getCurrentBlock(editorState).getText();
      const selection1 = editorState.getSelection().merge({
        anchorOffset: 1,
        focusOffset: 3,
      });
      const selection2 = editorState.getSelection().merge({
        anchorOffset: 2,
        focusOffset: 5,
      });

      const selection3 = editorState.getSelection().merge({
        anchorOffset: 4,
        focusOffset: 8,
      });
      const selectedEditorState1 = EditorState.acceptSelection(editorState, selection1);
      const selectedEditorState2 = EditorState.acceptSelection(editorState, selection2);
      const selectedEditorState3 = EditorState.acceptSelection(editorState, selection3);

      expect(getLinkModalDefaultValue(selectedEditorState1).defaultUrl).toBeUndefined();
      expect(getLinkModalDefaultValue(selectedEditorState1).defaultTitle).toBe(
        blockText.slice(1, 3),
      );
      expect(getLinkModalDefaultValue(selectedEditorState2).defaultTitle).toBe(
        blockText.slice(2, 5),
      );
      expect(getLinkModalDefaultValue(selectedEditorState3).defaultTitle).toBe(
        blockText.slice(4, 8),
      );
    });

    it('should return null when selection in different blocks', () => {
      const contentState = htmlToContentState(
        '<p>123<a href="http://www.baidu.com/">百度一下</a>321</p><p>test</p>',
      );
      const editorState = EditorState.createWithContent(contentState);
      const [firstBlock, secondBlock] = contentState.getBlocksAsArray();
      const selection = editorState.getSelection().merge({
        anchorKey: firstBlock.getKey(),
        anchorOffset: 5,
        focusKey: secondBlock.getKey(),
        focusOffset: 2,
      });
      const selectedEditorState = EditorState.acceptSelection(editorState, selection);

      expect(getLinkModalDefaultValue(selectedEditorState)).toBe(null);
    });

    it('should return correct value when entityKey is specified', () => {
      const contentState = htmlToContentState(
        '<p>123<a href="http://www.baidu.com/">百度一下</a>321</p>',
      );
      const editorState = EditorState.createWithContent(contentState);
      const selection = editorState.getSelection().merge({
        anchorOffset: 5,
        focusOffset: 5,
      });
      const selectedEditorState = EditorState.acceptSelection(editorState, selection);
      const { entityKey } = isCursorBetweenLink(selectedEditorState);

      expect(getLinkModalDefaultValue(selectedEditorState, entityKey).defaultTitle).toBe(
        '百度一下',
      );
      expect(getLinkModalDefaultValue(selectedEditorState, entityKey).defaultUrl).toBe(
        'http://www.baidu.com/',
      );
    });
  });
});
