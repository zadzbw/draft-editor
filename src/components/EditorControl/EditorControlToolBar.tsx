import * as React from 'react';
import { EditorState, RichUtils } from 'draft-js';
import EditorControlButton from './EditorControlButton';
import EditorControlSeparator from './EditorControlSeparator';
import { INLINE_STYLES, BLOCK_TYPES } from '../../constants/editorControlItems';
import { getControlButtonDisable } from '../../utils/draftHelpers';
import './EditorControl.scss';

interface ToolBarProps {
  editorState: EditorState;
  onCommand: (command: string) => void;
}

export default class EditorControlToolBar extends React.PureComponent<ToolBarProps> {
  preventDefault = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  render() {
    const { editorState, onCommand } = this.props;
    const {
      inlineDisabled,
      blockDisabled,
      linkDisabled,
      entityDisabled,
      clearFormatDisabled,
    } = getControlButtonDisable(editorState);
    const currentStyle = editorState.getCurrentInlineStyle();
    const blockType = RichUtils.getCurrentBlockType(editorState);

    return (
      <div
        role="toolbar"
        tabIndex={0}
        className={'editor-control-toolbar'}
        onMouseDown={this.preventDefault}
      >
        {/* inline-style-control */}
        {INLINE_STYLES.map(style => (
          <EditorControlButton
            key={style.styleType}
            active={currentStyle.has(style.styleType)}
            label={style.label}
            icon={style.icon}
            disabled={inlineDisabled}
            shortcut={style.shortcut}
            text={style.text}
            command={`toggle-inline-style-${style.styleType}`}
            onCommand={onCommand}
          />
        ))}
        <EditorControlSeparator/>
        {/* block-type-control */}
        {BLOCK_TYPES.map(type => (
          <EditorControlButton
            key={type.styleType}
            label={type.label}
            active={blockType === type.styleType}
            icon={type.icon}
            disabled={blockDisabled}
            shortcut={type.shortcut}
            text={type.text}
            command={`toggle-block-type-${type.styleType}`}
            onCommand={onCommand}
          />
        ))}
        <EditorControlSeparator/>
        <EditorControlButton
          icon={'link'}
          active={false}
          disabled={linkDisabled}
          shortcut={'⌘+K'}
          text={'插入链接'}
          command={'insert-link'}
          onCommand={onCommand}
        />
        <EditorControlButton
          icon={'image'}
          active={false}
          disabled={entityDisabled}
          shortcut={'⌘+⇧+I'}
          text={'上传图片'}
          command={'insert-image'}
          onCommand={onCommand}
        />
        <EditorControlButton
          icon={'minus'}
          active={false}
          disabled={entityDisabled}
          shortcut={'⌘+⇧+D'}
          text={'插入分割线'}
          command={'insert-divider'}
          onCommand={onCommand}
        />
        <EditorControlSeparator/>
        <EditorControlButton
          icon={'wrench'}
          active={false}
          disabled={clearFormatDisabled}
          shortcut={'⌘+⇧+L'}
          text={'清除所有格式'}
          command={'clear-format'}
          onCommand={onCommand}
        />
      </div>
    );
  }
}
