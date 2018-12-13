import { ReactElement } from 'react';
import {
  ContentState,
  DraftInlineStyleType,
  DraftBlockType,
  DraftEntityMutability,
  RawDraftEntity,
  RawDraftContentBlock,
  DraftInlineStyle
} from 'draft-js';

declare module 'draft-convert';

declare namespace DraftConvert {
  type ContentStateConverter = (contentState: ContentState) => string
  type HTMLConverter = (html: string) => ContentState;

  type Tag = ReactElement<any>
    | { start: string; end: string; empty?: string }
    | { element: ReactElement<any>; nest?: ReactElement<any>; empty?: ReactElement<any> };

  interface ToHTMLParam {
    styleToHTML?: (style: DraftInlineStyleType) => Tag;
    blockToHTML?: (block: RawDraftContentBlock) => Tag | undefined | null;
    entityToHTML?: (entity: RawDraftEntity, originalText: string) => Tag | string;
  }

  interface FromHTML {
    htmlToStyle?: (nodeName: string, node: HTMLElement, currentStyle: DraftInlineStyle) => DraftInlineStyle;
    htmlToBlock?: (nodeName: string, node: HTMLElement, lastList: string, inBlock: string) => { type: DraftBlockType, data?: object } | undefined | null;
    htmlToEntity?: (nodeName: string, node: HTMLElement, createEntity: (type: string, mutability: DraftEntityMutability, data?: object) => string) => string | undefined | null;
  }

  function convertToHTML(T: ToHTMLParam): ContentStateConverter;

  function convertFromHTML(T: FromHTML): HTMLConverter ;
}

import convertToHTML = DraftConvert.convertToHTML;
import convertFromHTML = DraftConvert.convertFromHTML;

export {
  convertToHTML,
  convertFromHTML,
};
