import * as React from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  getContainer: () => HTMLElement;
}

export default class Portal extends React.PureComponent<PortalProps> {
  private container: HTMLElement | null;

  constructor(props: PortalProps) {
    super(props);
    this.container = null;
  }

  componentDidMount() {
    this.createContainer();
  }

  componentWillUnmount() {
    this.removeContainer();
  }

  createContainer(): void {
    this.container = this.props.getContainer();
    this.forceUpdate();
  }

  removeContainer(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  render() {
    if (this.container) {
      return createPortal(this.props.children, this.container);
    }
    return null;
  }
}
