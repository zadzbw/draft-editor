import { info, success, warning, error } from '../badge';

describe('badge', () => {
  it('should log info badge correctly', () => {
    expect(info({ title: 'title1', content: 'content1' })).toMatchSnapshot();
  });

  it('should log success badge correctly', () => {
    expect(success({ title: 'title2', content: 'content2' })).toMatchSnapshot();
  });

  it('should log warning badge correctly', () => {
    expect(warning({ title: 'title3', content: 'content3' })).toMatchSnapshot();
  });

  it('should log error badge correctly', () => {
    expect(error({ title: 'title4', content: 'content4' })).toMatchSnapshot();
  });
});
