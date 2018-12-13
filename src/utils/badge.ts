// 用于在浏览器控制台输出badge图标

interface BadgeParams {
  title: string;
  content: string;
}

interface LoggerParams extends BadgeParams {
  backgroundColor: string;
}

const TITLE_BGC = '#606060';
const INFO_BGC = '#1475b2';
const SUCCESS_BGC = '#42c02e';
const WARNING_BGC = '#fa0';
const ERROR_BGC = '#f50';

const logger = (...args: string[]): void => {
  // 跑测试时不进行console.log
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  if (window.console && typeof window.console.log === 'function') {
    console.log(...args);
  }
};

const base = ({ title, content, backgroundColor }: LoggerParams): string[] => {
  const args = [
    `%c ${title} %c ${content} `,
    `padding: 1px; border-radius: 3px 0 0 3px; color: #fff; background: ${TITLE_BGC};`,
    `padding: 1px; border-radius: 0 3px 3px 0; color: #fff; background: ${backgroundColor};`,
  ];
  logger(...args);
  return args;
};

// 在控制台中log不同种类的badge
export function info({ title, content }: BadgeParams): string[] {
  return base({
    title,
    content,
    backgroundColor: INFO_BGC,
  });
}

export function success({ title, content }: BadgeParams): string[] {
  return base({
    title,
    content,
    backgroundColor: SUCCESS_BGC,
  });
}

export function warning({ title, content }: BadgeParams): string[] {
  return base({
    title,
    content,
    backgroundColor: WARNING_BGC,
  });
}

export function error({ title, content }: BadgeParams): string[] {
  return base({
    title,
    content,
    backgroundColor: ERROR_BGC,
  });
}
