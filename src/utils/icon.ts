import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faHighlighter,
  faCode,
  faQuoteLeft,
  faListUl,
  faListOl,
  faLink,
  faImage,
  faMinus,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';

// eslint-disable-next-line import/prefer-default-export
export function initIcon(): void {
  // 按需添加icon
  library.add(
    faBold,
    faItalic,
    faUnderline,
    faStrikethrough,
    faHighlighter,
    faCode,
    faQuoteLeft,
    faListUl,
    faListOl,
    faLink,
    faImage,
    faMinus,
    faWrench,
  );
}
