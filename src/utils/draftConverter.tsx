// 用于html与editorState的互相转换
import * as React from 'react';
import { ContentState, genKey } from 'draft-js';
import { convertToHTML, convertFromHTML } from 'draft-convert';
import {
  LINK_ENTITY_TYPE,
  DIVIDER_ENTITY_TYPE,
  IMAGE_ENTITY_TYPE,
  IMAGE_CAPTION_ENTITY_TYPE,
} from '../constants/entityTypes';
import { ATOMIC_BLOCK_TYPE } from '../constants/blockTypes';
import { transformBlockQuote } from './commonUtils';

const REGEX_LF = /\n/g;

const isImagePackage = (node: HTMLElement): boolean => node.classList.contains('image-package');
const isImageCaption = (node: HTMLElement): boolean => node.classList.contains('image-caption');

export function contentStateToHtml(contentState: ContentState): string {
  if (!contentState.hasText()) {
    return '';
  }

  // 生成IMAGE_CAPTION_ENTITY对应的html
  const IMAGE_CAPTION_ENTITY_HTML = `${IMAGE_CAPTION_ENTITY_TYPE}-${genKey()}-${+new Date()}`;

  const html = convertToHTML({
    styleToHTML: (style) => {
      // inlineStyle与HTML的映射关系
      switch (style) {
        case 'BOLD':
          return <b/>;
        case 'ITALIC':
          return <i/>;
        case 'UNDERLINE':
          return <u/>;
        case 'CODE':
          // code表示行内代码
          return <code/>;
        case 'STRIKETHROUGH':
          return <del/>;
        default:
          return {
            start: '',
            end: '',
          };
      }
    },
    blockToHTML: (block) => {
      // blockType与HTML的映射关系
      switch (block.type) {
        // 文章中header level最小为4
        case 'header-five': {
          return {
            start: '<h4>',
            end: '</h4>',
          };
        }
        // 文章中header level最小为4
        case 'header-six': {
          return {
            start: '<h4>',
            end: '</h4>',
          };
        }
        case 'unstyled': {
          return {
            start: '<p>',
            end: '</p>',
            empty: '<p><br></p>',
          };
        }
        case 'code-block': {
          // pre表示代码块
          return {
            element: <code/>,
            nest: <pre/>,
          };
        }
        // 用blockquote标签包裹p标签
        case 'blockquote': {
          return {
            element: <p/>,
            nest: <blockquote/>,
          };
        }
        // 生成出来的divider、image不需要用figure包裹
        case ATOMIC_BLOCK_TYPE: {
          return {
            start: '',
            end: '',
          };
        }
        default: {
          return undefined;
        }
      }
    },
    // entity与HTML的映射关系
    entityToHTML: (entity, originalText) => {
      const { type, data } = entity;
      switch (type) {
        case LINK_ENTITY_TYPE: {
          return <a href={data.url}>{originalText}</a>;
        }
        case DIVIDER_ENTITY_TYPE: {
          return <hr/>;
        }
        case IMAGE_ENTITY_TYPE: {
          const { src, caption } = data;
          return (
            <div className="image-package">
              <img src={src} alt={caption || ''}/>
              <br/>
              <div className="image-caption">{caption}</div>
            </div>
          );
        }
        case IMAGE_CAPTION_ENTITY_TYPE: {
          return IMAGE_CAPTION_ENTITY_HTML;
        }
        default: {
          return originalText;
        }
      }
    },
  })(contentState);

  return html
    .replace(new RegExp(`<br/>${IMAGE_CAPTION_ENTITY_HTML}`, 'g'), '') // 把IMAGE_CAPTION_ENTITY对应的html替换成空字符串
    .replace(/<\/code><code( lang="[^"]*")?>/g, '<br>') // 把多行的code-block转换成一行的
    .replace(/\n/g, '<br>'); // 把换行符替换成`<br>`
}

export function htmlToContentState(rawHtml: string): ContentState {
  const htmlWithoutBr = rawHtml.replace(REGEX_LF, ''); // 去除换行符
  const html = transformBlockQuote(htmlWithoutBr); // 转换blockquote
  return convertFromHTML({
    // html与inlineStyle的映射
    htmlToStyle: (nodeName, node, currentStyle) => {
      // 对于pre的子节点code，去除style
      if (nodeName === 'code' && node.parentElement && node.parentElement.tagName === 'PRE') {
        return currentStyle.remove('CODE');
      }
      return currentStyle;
    },
    htmlToBlock: (nodeName, node, lastList, inBlock) => {
      // html与blockType的映射
      switch (nodeName) {
        // 文章中header level最小为4
        case 'h5': {
          return {
            type: 'header-four',
          };
        }
        // 文章中header level最小为4
        case 'h6': {
          return {
            type: 'header-four',
          };
        }
        case 'p': {
          return {
            type: 'unstyled',
          };
        }
        case 'blockquote': {
          return {
            type: 'blockquote',
            data: {},
          };
        }
        case 'div': {
          if (isImagePackage(node)) {
            return {
              type: ATOMIC_BLOCK_TYPE,
              data: {},
            };
          }
          // 这里必须return一个值，否则convert会出错
          return null;
        }
        case 'hr': {
          if (inBlock !== ATOMIC_BLOCK_TYPE) {
            return {
              type: ATOMIC_BLOCK_TYPE,
              data: {},
            };
          }
        }
        // eslint-disable-next-line no-fallthrough
        case 'pre': {
          if (inBlock === 'code-block') {
            return {
              type: 'code-block',
              data: {},
            };
          }
        }
        // eslint-disable-next-line no-fallthrough
        default: {
          return undefined;
        }
      }
    },
    htmlToEntity: (nodeName, node, createEntity) => {
      // html与entity的映射
      switch (nodeName) {
        case 'a': {
          return createEntity(LINK_ENTITY_TYPE, 'MUTABLE', {
            url: (node as HTMLAnchorElement).href,
          });
        }
        case 'hr': {
          return createEntity(DIVIDER_ENTITY_TYPE, 'IMMUTABLE', {});
        }
        case 'div': {
          if (isImagePackage(node)) {
            const { src } = node.querySelector('img') as HTMLImageElement;
            const captionEl = node.querySelector('.image-caption') as HTMLElement;
            const caption = captionEl ? captionEl.textContent || captionEl.innerText : '';
            return createEntity(IMAGE_ENTITY_TYPE, 'IMMUTABLE', {
              src,
              caption,
            });
          }
          if (isImageCaption(node)) {
            return createEntity(IMAGE_CAPTION_ENTITY_TYPE, 'IMMUTABLE', { fuck: 1 });
          }
        }
        // eslint-disable-next-line no-fallthrough
        default: {
          return undefined;
        }
      }
    },
  })(html);
}
