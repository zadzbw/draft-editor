// 编辑器toolbar中inline以及block的控制按钮
import { IconProp } from '@fortawesome/fontawesome-svg-core';

type ControlItem = {
  text: string;
  styleType: string;
  label?: string;
  icon?: IconProp;
  shortcut?: string;
};

export const INLINE_STYLES: ControlItem[] = [
  { text: '粗体', styleType: 'BOLD', icon: 'bold', shortcut: '⌘+B' },
  { text: '斜体', styleType: 'ITALIC', icon: 'italic', shortcut: '⌘+I' },
  { text: '下划线', styleType: 'UNDERLINE', icon: 'underline', shortcut: '⌘+U' },
  { text: '删除线', styleType: 'STRIKETHROUGH', icon: 'strikethrough', shortcut: '⌘+D' },
  { text: 'Code', styleType: 'CODE', icon: 'highlighter', shortcut: '⌘+J' },
];

export const BLOCK_TYPES: ControlItem[] = [
  { text: '一级标题', label: 'H1', styleType: 'header-one', shortcut: '⌘+⌥+1' },
  { text: '二级标题', label: 'H2', styleType: 'header-two', shortcut: '⌘+⌥+2' },
  { text: '三级标题', label: 'H3', styleType: 'header-three', shortcut: '⌘+⌥+3' },
  { text: '四级标题', label: 'H4', styleType: 'header-four', shortcut: '⌘+⌥+4' },
  { text: '代码块', styleType: 'code-block', icon: 'code', shortcut: '⌘+⇧+J' },
  { text: '引用块', styleType: 'blockquote', icon: 'quote-left', shortcut: '⌘+⇧+B' },
  { text: '无序列表', styleType: 'unordered-list-item', icon: 'list-ul', shortcut: '⌘+⇧+U' },
  { text: '有序列表', styleType: 'ordered-list-item', icon: 'list-ol', shortcut: '⌘+⇧+O' },
];
