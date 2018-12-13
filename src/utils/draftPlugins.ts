import { composeDecorators } from 'draft-js-plugins-editor';
import createFocusPlugin from 'draft-js-focus-plugin';
// common plugins
import createBeforeInputPlugin from '../plugins/common/beforeInputPlugin';
import createKeyBindingPlugin from '../plugins/common/keyBindingPlugin';
import createCommandReturnPlugin from '../plugins/common/commandReturnPlugin';
import createShiftReturnPlugin from '../plugins/common/shiftReturnPlugin';
import createNormalReturnPlugin from '../plugins/common/normalReturnPlugin';
import createHeaderPlugin from '../plugins/common/headerPlugin';
import createCodeBlockPlugin from '../plugins/common/codeBlockPlugin';
import createClearFormatPlugin from '../plugins/common/clearFormatPlugin';
// entity plugins
import createDividerPlugin from '../plugins/Divider/DividerPlugin';
import createLinkPlugin from '../plugins/Link/LinkPlugin';
import createImagePlugin from '../plugins/Image/ImagePlugin';

const createPlugins = (): Array<any> => {
  // entity plugin
  const focusPlugin = createFocusPlugin({
    theme: {
      focused: 'focus-plugin-focused',
      unfocused: 'focus-plugin-unfocused',
    },
  });
  const focusDecorator = composeDecorators(focusPlugin.decorator);
  const dividerPlugin = createDividerPlugin({
    decorator: focusDecorator,
  });
  const linkPlugin = createLinkPlugin();
  const imagePlugin = createImagePlugin({
    decorator: focusDecorator,
  });

  // common plugins
  const beforeInputPlugin = createBeforeInputPlugin();
  const keyBindingPlugin = createKeyBindingPlugin();
  const commandReturnPlugin = createCommandReturnPlugin();
  const shiftReturnPlugin = createShiftReturnPlugin();
  const normalReturnPlugin = createNormalReturnPlugin();
  const headerPlugin = createHeaderPlugin();
  const codeBlockPlugin = createCodeBlockPlugin();
  const clearFormatPlugin = createClearFormatPlugin();

  /**
   * 这里要注意plugin的顺序
   * 所有插件的函数都运行在Editor的同名函数之后，并插件顺序依次执行
   */
  return [
    ...[focusPlugin, dividerPlugin, linkPlugin, imagePlugin],
    ...[
      beforeInputPlugin,
      commandReturnPlugin,
      shiftReturnPlugin,
      normalReturnPlugin,
      headerPlugin,
      codeBlockPlugin,
      clearFormatPlugin,
    ],
    ...[keyBindingPlugin], // keyBindingPlugin 需放在最后
  ];
};

export default createPlugins;
