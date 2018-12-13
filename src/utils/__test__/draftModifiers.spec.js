import { EditorState, SelectionState } from 'draft-js';
import { htmlToContentState, contentStateToHtml } from '../draftConverter';
import { getEntityRange, isCursorBetweenLink } from '../draftHelpers';
import {
  addLink,
  editLink,
  removeLink,
  addImage,
  editImage,
  addDivider,
  insertUnstyledParagraph,
  removeInlineStyle,
  removeBlockType,
  toggleBlockType,
  resetBlockType,
  clearFormat,
  mockInput,
} from '../draftModifiers';
import {
  DIVIDER_ENTITY_TYPE,
  LINK_ENTITY_TYPE,
  IMAGE_ENTITY_TYPE,
} from '../../constants/entityTypes';

describe('draftModifiers', () => {
  describe('addLink', () => {
    const contentState = htmlToContentState('<p>123</p>');
    const editorState = EditorState.moveFocusToEnd(EditorState.createWithContent(contentState));

    it('should add link entity correctly', () => {
      const newEditorState = addLink(editorState, {
        title: 'xxx',
        url: 'www.xxx.com',
      });
      const newContentState = newEditorState.getCurrentContent();
      const firstBlock = newContentState.getFirstBlock();
      const entityKey = firstBlock.getEntityAt(4);
      const entityRange = getEntityRange(newEditorState, firstBlock.getKey(), entityKey);
      const entity = newContentState.getEntity(entityKey);

      expect(firstBlock.getText()).toBe('123xxx');
      expect(entity.getType()).toBe(LINK_ENTITY_TYPE);
      expect(entity.getData().url).toBe('www.xxx.com');
      expect(entityRange.start).toBe(3);
      expect(entityRange.end).toBe(6);
      expect(entityRange.text).toBe('xxx');
      expect(contentStateToHtml(newContentState)).toBe('<p>123<a href="www.xxx.com">xxx</a></p>');
    });
  });

  describe('editLink', () => {
    const contentState = htmlToContentState('<p>123<a href="www.xxx.com">xxx</a></p>');
    const editorState = EditorState.createWithContent(contentState);

    it('should edit link entity correctly', () => {
      // const newContentState = newEditorState.getCurrentContent();
      const firstBlock = contentState.getFirstBlock();
      const blockKey = firstBlock.getKey();
      const entityKey = firstBlock.getEntityAt(4);

      expect(firstBlock.getText()).toBe('123xxx');

      const newEditorState = editLink(editorState, {
        title: 'xxx-test',
        url: 'www.xxx.com/test',
        blockKey,
        entityKey,
      });
      const newContentState = newEditorState.getCurrentContent();
      const { entityKey: newEntityKey } = isCursorBetweenLink(newEditorState);
      const newEntity = newContentState.getEntity(newEntityKey);

      expect(newEntity.getData().url).toBe('www.xxx.com/test');
      expect(newContentState.getFirstBlock().getText()).toBe('123xxx-test');
    });
  });

  describe('removeLink', () => {
    const contentState = htmlToContentState('<p>123<a href="www.xxx.com">xxx</a></p>');
    const editorState = EditorState.moveFocusToEnd(EditorState.createWithContent(contentState));

    it('should remove link entity correctly', () => {
      const { blockKey, entityKey } = isCursorBetweenLink(editorState);
      const newEditorState = removeLink(editorState, blockKey, entityKey);

      const firstBlock = contentState.getFirstBlock();
      const newFirstBlock = newEditorState.getCurrentContent().getFirstBlock();

      // 最开始是有entity的
      expect(firstBlock.getCharacterList().some(item => item.getEntity() === entityKey)).toBe(
        true,
      );
      // 已经没有entity了
      expect(newFirstBlock.getCharacterList().every(item => item.getEntity() === null)).toBe(
        true,
      );
    });
  });

  describe('Image Entity', () => {
    const initialEntityData = {
      src: 'www.xxx.com/logo.png',
      caption: 'logo',
    };
    const contentState = htmlToContentState('<p>123</p>');
    const editorState = EditorState.moveFocusToEnd(EditorState.createWithContent(contentState));
    const newEditorState = addImage(editorState, initialEntityData);
    const newContentState = newEditorState.getCurrentContent();
    const imageBlock = newContentState.getBlocksAsArray()[1];
    const entityKey = imageBlock.getEntityAt(imageBlock.getLength() - 1);

    it('should add image entity correctly', () => {
      const imageEntity = newContentState.getEntity(entityKey);

      expect(imageEntity.getType()).toBe(IMAGE_ENTITY_TYPE);
      expect(imageEntity.getData()).toEqual(initialEntityData);
      expect(contentStateToHtml(newContentState)).toBe(
        '<p>123</p><div class="image-package"><img src="www.xxx.com/logo.png" alt="logo"/><br/><div class="image-caption">logo</div></div><p><br></p>',
      );
    });

    it('should edit image entity correctly', () => {
      const newEntityData = {
        src: 'www.baidu.com/logo.png',
        caption: 'baidu',
      };
      // edit image entity
      const modifiedEditorState = editImage(newEditorState, entityKey, newEntityData);
      const modifiedContentState = modifiedEditorState.getCurrentContent();
      const imageEntity = modifiedContentState.getEntity(entityKey);

      expect(imageEntity.getType()).toBe(IMAGE_ENTITY_TYPE);
      expect(imageEntity.getData()).toEqual(newEntityData);
      expect(contentStateToHtml(modifiedContentState)).toBe(
        '<p>123</p><div class="image-package"><img src="www.baidu.com/logo.png" alt="baidu"/><br/><div class="image-caption">baidu</div></div><p><br></p>',
      );
    });
  });

  describe('addDivider', () => {
    it('should add divider entity correctly', () => {
      const contentState = htmlToContentState('<p>123</p>');
      const editorState = EditorState.moveFocusToEnd(EditorState.createWithContent(contentState));
      const newEditorState = addDivider(editorState);
      const newContentState = newEditorState.getCurrentContent();
      const imageBlock = newContentState.getBlocksAsArray()[1];
      const entityKey = imageBlock.getEntityAt(imageBlock.getLength() - 1);
      const dividerEntity = newContentState.getEntity(entityKey);

      expect(dividerEntity.getType()).toBe(DIVIDER_ENTITY_TYPE);
      expect(dividerEntity.getMutability()).toBe('IMMUTABLE');
      expect(contentStateToHtml(newContentState)).toBe('<p>123</p><hr/><p><br></p>');
    });
  });

  describe('insertUnstyledParagraph', () => {
    const contentState = htmlToContentState('<h1>123</h1>');
    it('should insert unstyle p correctly when selection in block end', () => {
      const editorState = EditorState.moveFocusToEnd(EditorState.createWithContent(contentState));
      const newEditorState = insertUnstyledParagraph(editorState);
      const newContentState = newEditorState.getCurrentContent();

      expect(contentStateToHtml(newContentState)).toBe('<h1>123</h1><p><br></p>');
    });

    it('should insert unstyle p correctly when selection between block end', () => {
      let editorState = EditorState.createWithContent(contentState);
      const selection = editorState.getSelection().merge({
        focusOffset: 2,
        anchorOffset: 2,
      });
      editorState = EditorState.forceSelection(editorState, selection);
      const newEditorState = insertUnstyledParagraph(editorState);
      const newContentState = newEditorState.getCurrentContent();

      expect(contentStateToHtml(newContentState)).toBe('<h1>12</h1><p>3</p>');
    });
  });

  describe('removeInlineStyle', () => {
    it('should remove all inline style correctly', () => {
      const contentState = htmlToContentState(
        '<p><b>1<i>2<u>3<del>4<code>56</code>7</del>8</u>9</i>0</b><del>test</del></p>',
      );
      const editorState = EditorState.createWithContent(contentState);
      const block = contentState.getFirstBlock();
      // 将整个block选中
      const selection = editorState.getSelection().merge({
        anchorOffset: 0,
        focusOffset: block.getLength(),
      });
      const newContentState = removeInlineStyle(contentState, selection);

      expect(contentStateToHtml(newContentState)).toBe('<p>1234567890test</p>');
    });
  });

  describe('removeBlockType', () => {
    it('should remove block type correctly', () => {
      const contentState = htmlToContentState(
        '<h2>header2</h2><blockquote><p>111</p><p>222</p></blockquote><ul><li>111</li><li>222</li></ul>',
      );
      const contentBlocks = contentState.getBlockMap().toList();
      const firstBlock = contentBlocks.first();
      const lastBlock = contentBlocks.last();

      expect(contentBlocks.get(0).getType()).toBe('header-two');
      expect(contentBlocks.get(1).getType()).toBe('blockquote');
      expect(contentBlocks.get(2).getType()).toBe('blockquote');
      expect(contentBlocks.get(3).getType()).toBe('unordered-list-item');
      expect(contentBlocks.get(4).getType()).toBe('unordered-list-item');

      const selection = new SelectionState({
        anchorKey: firstBlock.getKey(),
        anchorOffset: 0,
        focusKey: lastBlock.getKey(),
        focusOffset: lastBlock.getLength(),
      });

      const newContentState = removeBlockType(contentState, selection);
      const newContentBlocks = newContentState.getBlockMap();

      expect(contentStateToHtml(newContentState)).toBe(
        '<p>header2</p><p>111</p><p>222</p><p>111</p><p>222</p>',
      );
      expect(newContentBlocks.every(block => block.getType() === 'unstyled')).toBe(true);
    });

    it('should keep block type when block is atomic', () => {
      const contentState = htmlToContentState('<p>1<b>234</b>5</p><hr/><p>5<del>432</del>1</p>');
      const contentBlocks = contentState.getBlockMap().toList();

      expect(contentBlocks.get(0).getType()).toBe('unstyled');
      expect(contentBlocks.get(1).getType()).toBe('atomic');
      expect(contentBlocks.get(2).getType()).toBe('unstyled');

      const firstBlock = contentBlocks.first();
      const lastBlock = contentBlocks.last();
      const selection = new SelectionState({
        anchorKey: firstBlock.getKey(),
        anchorOffset: 0,
        focusKey: lastBlock.getKey(),
        focusOffset: lastBlock.getLength(),
      });

      const newContentState = removeBlockType(contentState, selection);
      const newContentBlocks = newContentState.getBlockMap();

      expect(contentStateToHtml(newContentState)).toBe(
        '<p>1<b>234</b>5</p><hr/><p>5<del>432</del>1</p>',
      );
      expect(newContentBlocks.every(block => block.getType() === 'unstyled')).toBe(false);
    });
  });

  describe('toggleBlockType', () => {
    it('should add type correctly when block is unstyled', () => {
      const contentState = htmlToContentState('<p>hello world</p>');
      const editorState = EditorState.moveFocusToEnd(EditorState.createWithContent(contentState));

      const newEditorState = toggleBlockType(editorState, 'header-two');
      const newContentState = newEditorState.getCurrentContent();

      expect(contentStateToHtml(newContentState)).toBe('<h2>hello world</h2>');
    });

    it('should toggle type correctly when block is not unstyled', () => {
      const contentState = htmlToContentState('<h2>hello world</h2>');
      const editorState = EditorState.moveFocusToEnd(EditorState.createWithContent(contentState));

      const newEditorState = toggleBlockType(editorState, 'header-two');
      const newContentState = newEditorState.getCurrentContent();

      expect(contentStateToHtml(newContentState)).toBe('<p>hello world</p>');
    });

    it('should remove inline style after toggle code-block type', () => {
      const contentState = htmlToContentState('<p>1<b>111</b>1</p><p>2<i>222</i>2</p>');
      let editorState = EditorState.createWithContent(contentState);
      const contentBlocks = contentState.getBlockMap().toList();
      const firstBlock = contentBlocks.first();
      const lastBlock = contentBlocks.last();
      const selection = new SelectionState({
        anchorKey: firstBlock.getKey(),
        anchorOffset: 0,
        focusKey: lastBlock.getKey(),
        focusOffset: lastBlock.getLength(),
      });
      editorState = EditorState.forceSelection(editorState, selection);
      const newEditorState = toggleBlockType(editorState, 'code-block');
      const newContentState = newEditorState.getCurrentContent();

      expect(contentStateToHtml(newContentState)).toBe('<pre><code>11111<br>22222</code></pre>');
    });
  });

  describe('resetBlockType', () => {
    it('should set type and clear text correctly when block is unstyled', () => {
      const contentState = htmlToContentState('<p>123</p><p>hello world</p>');
      const editorState = EditorState.moveFocusToEnd(EditorState.createWithContent(contentState));

      const newEditorState = resetBlockType(editorState, 'header-two');
      const newContentState = newEditorState.getCurrentContent();

      expect(contentStateToHtml(newContentState)).toBe('<p>123</p><h2></h2>');
    });

    it('should set type and clear text correctly when block is not unstyled', () => {
      const contentState = htmlToContentState('<p>123</p><h2>header2</h2>');
      const editorState = EditorState.moveFocusToEnd(EditorState.createWithContent(contentState));

      const newEditorState = resetBlockType(editorState, 'unstyled');
      const newContentState = newEditorState.getCurrentContent();

      expect(contentStateToHtml(newContentState)).toBe('<p>123</p><p><br></p>');
    });

    it('should set type and clear text correctly when block is not unstyled and last block is empty', () => {
      const contentState = htmlToContentState('<ul><li>111</li><li>222</li><li>333</li></ul>');
      const editorState = EditorState.moveFocusToEnd(EditorState.createWithContent(contentState));

      const newEditorState = resetBlockType(editorState, 'unstyled');
      const newContentState = newEditorState.getCurrentContent();

      expect(contentStateToHtml(newContentState)).toBe(
        '<ul><li>111</li><li>222</li></ul><p><br></p>',
      );
    });
  });

  describe('clearFormat', () => {
    it('should clear all inline style and set all blocks to unstyled', () => {
      const contentState = htmlToContentState(
        '<h2>header2</h2><p>1<b><i>2345</i></b><u><del>6789</del></u>0</p><ul><li>12345</li><li>54321</li></ul><ol><li>111</li><li>222</li></ol><blockquote><p>hello world</p><p>vue react</p></blockquote>',
      );
      const contentBlocks = contentState.getBlockMap().toList();
      const firstBlock = contentBlocks.first();
      const lastBlock = contentBlocks.last();
      // 全选
      const selection = new SelectionState({
        anchorKey: firstBlock.getKey(),
        anchorOffset: 0,
        focusKey: lastBlock.getKey(),
        focusOffset: lastBlock.getLength(),
      });
      const editorState = EditorState.forceSelection(
        EditorState.createWithContent(contentState),
        selection,
      );

      const newEditorState = clearFormat(editorState);
      const newContentState = newEditorState.getCurrentContent();

      expect(contentStateToHtml(newContentState)).toBe(
        '<p>header2</p><p>1234567890</p><p>12345</p><p>54321</p><p>111</p><p>222</p><p>hello world</p><p>vue react</p>',
      );
    });

    it('should keep atomic block type', () => {
      const contentState = htmlToContentState('<p>1<b>234</b>5</p><hr/><p>5<del>432</del>1</p>');
      const contentBlocks = contentState.getBlockMap().toList();

      expect(contentBlocks.get(0).getType()).toBe('unstyled');
      expect(contentBlocks.get(1).getType()).toBe('atomic');
      expect(contentBlocks.get(2).getType()).toBe('unstyled');

      const firstBlock = contentBlocks.first();
      const lastBlock = contentBlocks.last();
      const selection = new SelectionState({
        anchorKey: firstBlock.getKey(),
        anchorOffset: 0,
        focusKey: lastBlock.getKey(),
        focusOffset: lastBlock.getLength(),
      });
      const editorState = EditorState.forceSelection(
        EditorState.createWithContent(contentState),
        selection,
      );

      const newEditorState = clearFormat(editorState);
      const newContentState = newEditorState.getCurrentContent();
      expect(contentStateToHtml(newContentState)).toBe('<p>12345</p><hr/><p>54321</p>');
    });
  });

  describe('mockInput', () => {
    it('should mock input event correctly', () => {
      const contentState = htmlToContentState('<p>hello</p>');
      const editorState = EditorState.moveFocusToEnd(EditorState.createWithContent(contentState));

      const newEditorState = mockInput(editorState, ' world');
      const newContentState = newEditorState.getCurrentContent();

      expect(contentStateToHtml(newContentState)).toBe('<p>hello world</p>');
    });
  });
});
