import * as React from 'react';
import classNames from 'classnames';
import * as _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Tooltip } from 'antd';
import { getShortcut } from '../../utils/commonUtils';

const baseClass = 'editor-control-btn';

interface EditorControlButtonProps {
  active: boolean;
  disabled: boolean;
  command: string;
  text: string;
  onCommand: (command: string) => void;
  label?: string;
  icon?: IconProp;
  shortcut?: string;
  className?: string;
}

export default class EditorControlButton extends React.PureComponent<EditorControlButtonProps> {
  handleClick = () => {
    const { disabled, command, onCommand } = this.props;
    if (disabled) {
      return;
    }
    if (_.isFunction(onCommand)) {
      onCommand(command);
    }
  };

  getButton = () => {
    const { label, icon, active, disabled, className } = this.props;
    const btnClass = classNames({
      [`${className}`]: !!className,
      [baseClass]: true,
      [`${baseClass}-active`]: active,
      [`${baseClass}-disabled`]: disabled,
    });

    return (
      <span
        role="button"
        tabIndex={0}
        aria-pressed={active}
        aria-disabled={disabled}
        className={btnClass}
        onClick={this.handleClick}
      >
        {icon ? <FontAwesomeIcon icon={icon}/> : label}
      </span>
    );
  };

  render() {
    const { shortcut, text, disabled } = this.props;
    if (shortcut && !disabled) {
      const title = `${text}(${getShortcut(shortcut)})`;
      return <Tooltip title={title}>{this.getButton()}</Tooltip>;
    }
    return this.getButton();
  }
}
