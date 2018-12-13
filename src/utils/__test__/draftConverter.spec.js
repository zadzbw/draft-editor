import { convertToRaw } from 'draft-js';
import { contentStateToHtml, htmlToContentState } from '../draftConverter';
import {
  DIVIDER_ENTITY_TYPE,
  LINK_ENTITY_TYPE,
  IMAGE_ENTITY_TYPE,
  IMAGE_CAPTION_ENTITY_TYPE,
} from '../../constants/entityTypes';

// 验证输入是否等于输出
const testTool = (input, output = input) => {
  const contentState = htmlToContentState(input);
  contentState.getBlocksAsArray();
  const html = contentStateToHtml(contentState);
  expect(html).toBe(output);
};

describe('draftConverter', () => {
  it('should convert empty', () => {
    const html = '';
    testTool(html);
  });

  it('should convert normal html', () => {
    const html = '<p>test</p><p>test2</p>';
    testTool(html);
  });

  it('should convert html with inline style', () => {
    const html = '<p>1<b>2</b><del><b><i>34</i>5</del></b><u><del>6t</del>es</u>t<code>1234</code></p>';
    testTool(html);
    testTool('<p><strong style="font-size: 24px;">123</strong></p>', '<p><b>123</b></p>');
  });

  it('should convert br', () => {
    const html = '<p>111<br/>222</p>';
    testTool(html);
  });

  it('should convert header', () => {
    const html1 = '<p>123</p><h1>header1</h1>';
    const html2 = '<p>123</p><h2>header2</h2>';
    const html3 = '<p>123</p><h3>header3</h3>';
    const html4 = '<p>123</p><h4>header4</h4>';
    const html5 = '<p>123</p><h5>header4</h5>';
    const html6 = '<p>123</p><h6>header4</h6>';
    testTool(html1);
    testTool(html2);
    testTool(html3);
    testTool(html4);
    // h5、h6都会被convert成h4
    testTool(html5, html4);
    testTool(html6, html4);
  });

  it('should convert code', () => {
    const html = '<pre><code>test<br/>1234</code></pre><p>hello</p>';
    const html2 = '<pre><pre>test<br/>1234</pre></pre><p>hello</p>';
    testTool(html);
    testTool(html2, html); // pre > pre => pre > code
  });

  it('should convert blockquote', () => {
    const html = '<blockquote><p>hello world</p><p>123<br/>456</p></blockquote><p>test</p>';
    testTool(html);
  });

  it('should convert list', () => {
    const html1 = '<ul><li>11</li><li>22</li><li>33</li></ul><p>test</p>'; // ul
    const html2 = '<ol><li>11</li><li>22</li><li>33</li></ol><p>test</p>'; // ol
    const html3 = '<ul><li>1</li><li>2</li><ul><li>2.1</li><li>2.2</li></ul><li>3</li><ul><li>3.1</li><ul><li>3.1.1</li><li>3.1.2</li></ul><li>3.2</li></ul><li>4</li></ul>'; // nested
    testTool(html1);
    testTool(html2);
    testTool(html3);
  });

  it('should convert link', () => {
    const href = 'http://baidu.com';
    const href2 = `${href}/`;
    const html1 = `<p>123<a href="${href}">百度一下</a>321</p><p>test</p>`;
    const html2 = `<p>123<a href="${href2}">百度一下</a>321</p><p>test</p>`;
    testTool(html1, html2); // 这里href会多出一个`/`
    testTool(html2);
    const contentState = htmlToContentState(html2);
    const entityKey = contentState.getLastCreatedEntityKey();
    const entity = contentState.getEntity(entityKey);
    expect(entity.getData().url).toBe(href2);
    expect(entity.getType()).toBe(LINK_ENTITY_TYPE);
  });

  it('should convert image', () => {
    const html = '<p>111</p><div class="image-package"><img src="https://xxx.com/test.png" alt="xxxlogo"/><br/><div class="image-caption">xxxlogo</div></div><p>222</p>';
    testTool(html);
    const contentState = htmlToContentState(html);
    const rawState = convertToRaw(contentState);
    const imageEntity = rawState.entityMap['0'];
    const imageCaptionEntity = rawState.entityMap['1'];
    expect(imageEntity.type).toBe(IMAGE_ENTITY_TYPE);
    expect(imageEntity.data.src).toBe('https://xxx.com/test.png');
    expect(imageEntity.data.caption).toBe('xxxlogo');
    expect(imageCaptionEntity.type).toBe(IMAGE_CAPTION_ENTITY_TYPE);
  });

  it('should convert divider', () => {
    const html = '<p>111</p><hr><p>222</p>';
    const html2 = '<p>111</p><hr/><p>222</p>';
    testTool(html, html2); // <hr>会被convert成<hr/>
    testTool(html2);
    const contentState = htmlToContentState(html2);
    const entityKey = contentState.getLastCreatedEntityKey();
    const entity = contentState.getEntity(entityKey);
    expect(entity.getType()).toBe(DIVIDER_ENTITY_TYPE);
  });
});
