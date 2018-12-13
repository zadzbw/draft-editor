import { transformBlockQuote, getShortcut } from '../commonUtils';

const ua = navigator.userAgent;

describe('commonUtils', () => {
  describe('transformBlockQuote', () => {
    it('should do nothing when has no blockquote ', () => {
      const html = '<p>test</p>';
      const result = transformBlockQuote(html);
      expect(result).toBe(html);
      expect(result).toMatchSnapshot();
    });

    it('should transform single blockquote correctly', () => {
      const html = '<blockquote><p>111</p><p>222<br>333</p></blockquote>';
      const result = transformBlockQuote(html);
      expect(result).toMatchSnapshot();
    });

    it('should transform multiple blockquote correctly', () => {
      const html = '<blockquote><p>111</p><p>222<br>333</p></blockquote><p>test</p><blockquote><p>444</p><p>555<br>666</p></blockquote>';
      const result = transformBlockQuote(html);
      expect(result).toMatchSnapshot();
    });

    it('should transform adjacent blockquote correctly', () => {
      const html = '<blockquote><p>111</p><p>222<br>333</p></blockquote><blockquote><p>444</p><p>555<br>666</p></blockquote>';
      const result = transformBlockQuote(html);
      expect(result).toMatchSnapshot();
    });
  });

  // 每个测试完成后重置ua
  // eslint-disable-next-line no-undef
  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: ua,
    });
  });

  describe('getShortcut', () => {
    it('should get shortcut in mac', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
      });
      const shortcut = '⌘+⌥+⇧+B';
      const result = getShortcut(shortcut);
      expect(result).toBe('⌘⌥⇧B');
      expect(result).toMatchSnapshot();
    });

    it('should get shortcut in windows', () => {
      const shortcut = '⌘+⌥+⇧+B';
      const result = getShortcut(shortcut);
      expect(result).toBe('Ctrl+Alt+Shift+B');
      expect(result).toMatchSnapshot();
    });
  });
});
