import * as React from 'react';
import withPortal from '../../HOC/withPortal';

interface ImageCaptionInputProps {
  inputRef: React.LegacyRef<HTMLTextAreaElement>;
  position: object;
  value: string;
  onChange: React.ChangeEventHandler;
  onBlur: React.FocusEventHandler;
  onKeyDown: React.KeyboardEventHandler;
}

@withPortal(() => {
  const container = document.createElement('div');
  container.className = 'image-caption-root';
  document.body.appendChild(container);
  return container;
})
export default class ImageCaptionInput extends React.PureComponent<ImageCaptionInputProps> {
  render() {
    const { value, position, inputRef, onBlur, onChange, onKeyDown } = this.props;

    return (
      <div className={'editor-image-caption-input'} style={position}>
        <textarea
          ref={inputRef}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        />
      </div>
    );
  }
}
