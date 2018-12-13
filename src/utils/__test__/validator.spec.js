import { isUrl, isEmail } from '../validator';

describe('validator', () => {
  it('should validate url', () => {
    expect(isUrl('test.com')).toBe(true);
    expect(isUrl('bowen.zhu@')).toBe(false);
    expect(isUrl('bowen.zhu@xxx')).toBe(false);
    expect(isUrl('bowen.zhu@xxx.com')).toBe(false);
    expect(isUrl('bowen.zhu-xxx.com')).toBe(true);
  });

  it('should validate email', () => {
    expect(isEmail('test.com')).toBe(false);
    expect(isEmail('bowen.zhu@')).toBe(false);
    expect(isEmail('bowen.zhu@xxx')).toBe(false);
    expect(isEmail('bowen.zhu@xxx.com')).toBe(true);
  });
});
