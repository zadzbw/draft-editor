const simplePattern = '^((https?):\\/\\/)?([-_A-Za-z0-9]+(\\.))+[-_A-Za-z0-9]{2,}([-_/A-Za-z0-9]+)*';
const SIMPLE_URL_REG = new RegExp(`${simplePattern}$`); // www.google.com/xxx/bbb
const SIMPLE_URL_PREFIX_REG = new RegExp(simplePattern);
const URL_QUERY_REG = /^(\?[-_A-Za-z0-9&@#/%?=~|!:.,;\u4e00-\u9fa5]*)*$/; // ?a=1&b=2

export function isUrl(url: string): boolean {
  const isSimple = SIMPLE_URL_REG.test(url);
  // 如果是简单url，则直接返回true
  if (isSimple) {
    return true;
  }
  const query = url.replace(SIMPLE_URL_PREFIX_REG, '');
  return SIMPLE_URL_PREFIX_REG.test(url) && URL_QUERY_REG.test(query);
}

const pattern = {
  email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  url: new RegExp(
    '^(?:(?:http|https|ftp)://|//)?(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
    'i',
  ),
};

// export function isUrl(value) {
//   return typeof value === 'string' && !!value.match(pattern.url);
// }

export function isEmail(value: string): boolean {
  return typeof value === 'string' && !!value.match(pattern.email) && value.length < 255;
}
