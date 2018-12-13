const quoteReg = /<blockquote>([\w\W]*?)<\/blockquote>/g;

/**
 * 将blockquote内的多个p标签，同blockquote一起，转换成多个blockquote标签
 * @param html
 * @return {string}
 */
export const transformBlockQuote = (html: string): string => {
  return html.replace(quoteReg, (match, p) => {
    return p.replace(/<p>/g, '<blockquote>').replace(/<\/p>/g, '</blockquote>');
  });
};

/**
 * 判断是否为mac平台
 * @return {boolean}
 */
export const isMac = (): boolean => {
  return window.navigator && /Mac/i.test(navigator.userAgent);
};

export const getShortcut = (shortcut: string): string => {
  if (isMac()) {
    return shortcut.replace(/\+/g, '');
  }
  return shortcut
    .replace('⌘', 'Ctrl')
    .replace('⇧', 'Shift')
    .replace('⌥', 'Alt');
};
