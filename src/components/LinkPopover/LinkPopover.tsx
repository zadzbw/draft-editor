import * as React from 'react';
import withPortal from '../../HOC/withPortal';
import './LinkPopover.scss';

const getRelativeParent = (element: HTMLElement): HTMLElement | null => {
  if (!element) {
    return null;
  }
  const position = window.getComputedStyle(element).getPropertyValue('position');
  if (position !== 'static') {
    return element;
  }
  return getRelativeParent(element.parentElement as HTMLElement);
};

interface LinkPopoverProps {
  editorState: object;
  url: string;
  blockKey: string;
  entityKey: string;
  onRemoveLink: (blockKey: string, entityKey: string) => any;
  onEditLink: () => any;
}

@withPortal(() => {
  const container = document.createElement('div');
  container.className = 'link-popover-root';
  document.body.appendChild(container);
  return container;
})
export default class LinkPopover extends React.Component<LinkPopoverProps> {
  private renderedOnce: boolean;

  private toolbar: HTMLElement | null;

  constructor(props: LinkPopoverProps) {
    super(props);
    this.state = {
      position: {},
    };
    this.renderedOnce = false;
    this.toolbar = null;
  }

  shouldComponentUpdate(nextProps: LinkPopoverProps) {
    const { blockKey, entityKey } = this.props;
    if (this.renderedOnce) {
      const ret = blockKey !== nextProps.blockKey || entityKey !== nextProps.entityKey;
      if (ret) {
        this.renderedOnce = false;
      }
      return ret;
    }
    this.renderedOnce = true;
    return true;
  }

  preventDefault = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  handleRemoveLink = () => {
    const { entityKey, blockKey } = this.props;
    this.props.onRemoveLink(blockKey, entityKey);
  };

  handleEditLink = () => {
    this.props.onEditLink();
  };

  render() {
    let { url } = this.props;
    if (url.length > 30) {
      url = `${url.slice(0, 30)}...`;
    }
    return (
      <div
        role="toolbar"
        tabIndex={0}
        className="link-popover-container"
        ref={(element: HTMLDivElement) => {
          this.toolbar = element;
        }}
        onMouseDown={this.preventDefault}
      >
        <div className="link-popover-content">
          <a href={this.props.url} title={this.props.url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
          <button onClick={this.handleEditLink}>修改链接</button>
          <button onClick={this.handleRemoveLink}>取消链接</button>
        </div>
      </div>
    );
  }
}
