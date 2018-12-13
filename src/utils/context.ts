import * as React from 'react';
import { EditorState } from 'draft-js';

// 该context保存了MyEditor中的state，包括editorState、readOnly等state，以及一些相关方法
// eslint-disable-next-line import/prefer-default-export
export const EditorStateContext = React.createContext({
  editorState: EditorState.createEmpty(),
  readOnly: false,
});
