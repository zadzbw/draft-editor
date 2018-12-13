declare interface PluginMethods {
  getEditorState: () => Draft.EditorState;
  setEditorState: (editorState: Draft.EditorState) => void;
}

declare interface LinkEntityData {
  url: string;
  title: string;
}

declare interface ImageEntityData {
  src: string;
  caption: string;

  [key: string]: any;
}

declare type EventHandler = (...args: any[]) => void;

declare interface EventMap {
  [type: string]: EventHandler[];
}
