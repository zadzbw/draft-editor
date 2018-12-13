/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import * as React from 'react';
import { ContentBlock, ContentState, EditorState, SelectionState } from 'draft-js';
import classNames from 'classnames';
import ImageCaptionInput from './ImageCaptionInput';
import withBlockProps from '../../HOC/withBlockProps';
import withEditorState from '../../HOC/withEditorState';
import keyCode from '../../constants/keyCode';
import { editImage } from '../../utils/draftModifiers';

const CAPTION_MIN_HEIGHT = 21;

interface ImageProps {
  block: ContentBlock;
  contentState: ContentState;
  className: string;
  data: ImageEntityData;
  isFocused: boolean;
  blockKey: string;
  entityKey: string;
  selection: SelectionState;
  onClick: React.MouseEventHandler;
  getEditorState: () => EditorState;
  setEditorState: (editorState: EditorState) => void;
  setReadOnly: (readOnly: boolean) => void;
}

interface CaptionPosition {
  width?: number;
  height?: number;
  top?: number;
  left?: number;
}

interface ImageState {
  isCaptionEditing: boolean;
  captionInputValue: string;
  captionPosition: CaptionPosition;
}

@withBlockProps
@withEditorState
export default class Image extends React.PureComponent<ImageProps, ImageState> {
  private caption: HTMLElement | null;

  private captionInput: HTMLTextAreaElement | null;

  constructor(props: ImageProps) {
    super(props);
    this.state = {
      isCaptionEditing: false,
      captionInputValue: this.props.data.caption || '',
      captionPosition: {},
    };
    this.caption = null;
    this.captionInput = null;
  }

  getPosition = (): CaptionPosition => {
    const captionElement = this.caption as HTMLElement;
    const { width, height, top, left } = captionElement.getBoundingClientRect();
    return {
      width,
      height,
      top: top + window.pageYOffset,
      left: left + window.pageXOffset,
    };
  };

  adjustCaptionHeight = () => {
    const captionInputElement = this.captionInput as HTMLTextAreaElement;
    const captionElement = this.caption as HTMLElement;
    const e = Math.max(captionInputElement.scrollHeight, CAPTION_MIN_HEIGHT);
    captionElement.style.height = `${e}px`;
    captionInputElement.style.height = `${e}px`;
  };

  // 开始编辑caption
  startEditCaption = () => {
    this.props.setReadOnly(true);
    const {
      data: { caption = '' },
    } = this.props;
    this.setState(
      {
        isCaptionEditing: true,
        captionPosition: this.getPosition(),
        captionInputValue: caption,
      },
      () => {
        requestAnimationFrame(() => {
          const captionInputElement = this.captionInput as HTMLTextAreaElement;
          captionInputElement.focus();
          captionInputElement.select();
          requestAnimationFrame(() => {
            this.setState({
              captionPosition: this.getPosition(),
            });
          });
        });
      },
    );
  };

  // 编辑caption
  editCaption = () => {
    const captionInputElement = this.captionInput as HTMLTextAreaElement;
    const { value } = captionInputElement;
    this.adjustCaptionHeight();
    this.setState({
      captionInputValue: value,
    });
  };

  /**
   * 结束编辑caption
   * @param save {boolean} 是否保存改动
   * @param focus {boolean} 是否focus下一个block
   */
  endEditCaption = ({ save = true, focus = false } = {}) => {
    this.props.setReadOnly(false);
    (this.caption as HTMLElement).style.height = null; // 清除caption的height值
    if (save) {
      const { getEditorState, setEditorState, blockKey, entityKey } = this.props;
      const { captionInputValue } = this.state;
      const editorState = getEditorState();
      let newEditorState = editImage(editorState, entityKey, {
        caption: captionInputValue,
      });
      if (focus) {
        const contentState = newEditorState.getCurrentContent();
        const nextBlockKey = contentState.getKeyAfter(blockKey);
        if (nextBlockKey) {
          const nextBlock = contentState.getBlockForKey(nextBlockKey);
          const nextBlockLength = nextBlock.getLength();
          newEditorState = EditorState.forceSelection(
            newEditorState,
            new SelectionState({
              anchorKey: nextBlockKey,
              anchorOffset: nextBlockLength,
              focusKey: nextBlockKey,
              focusOffset: nextBlockLength,
              hasFocus: true,
            }),
          );
        }
      }
      setEditorState(newEditorState);
    }
    this.setState({
      isCaptionEditing: false,
    });
  };

  handleCaptionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    this.startEditCaption();
  };

  handleCaptionInputBlur = () => {
    this.endEditCaption();
  };

  handleCaptionInputKeyDown = (e: React.KeyboardEvent) => {
    const pressEnter = e.keyCode === keyCode.ENTER;
    const pressESC = e.keyCode === keyCode.ESC;
    if (pressEnter || pressESC) {
      e.preventDefault();
      // 按下esc则取消编辑，按下enter修改图片caption，并自动focus
      this.endEditCaption({
        save: pressEnter,
        focus: pressEnter,
      });
    }
  };

  render() {
    const {
      className,
      data: { src, caption = '' },
      isFocused,
    } = this.props;
    const { isCaptionEditing, captionInputValue, captionPosition } = this.state;

    const imageClass = classNames(className, 'editor-image-entity');
    const captionClass = classNames('editor-image-caption', {
      'editor-image-caption-editing': isCaptionEditing,
      'editor-image-caption-is-placeholder': !caption,
    });

    return (
      <div role="figure" className="editor-image-package">
        <img onClick={this.props.onClick} className={imageClass} src={src} alt={caption}/>
        {(isFocused || isCaptionEditing || caption) && (
          <figcaption
            className={captionClass}
            ref={(e) => {
              this.caption = e;
            }}
            onClick={this.handleCaptionClick}
          >
            {caption || '添加图片说明'}
          </figcaption>
        )}
        {isCaptionEditing && (
          <ImageCaptionInput
            inputRef={(e) => {
              this.captionInput = e;
            }}
            position={captionPosition}
            value={captionInputValue}
            onChange={this.editCaption}
            onBlur={this.handleCaptionInputBlur}
            onKeyDown={this.handleCaptionInputKeyDown}
          />
        )}
      </div>
    );
  }
}
