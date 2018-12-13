import * as React from 'react';
import { Input, Icon, Modal } from 'antd';
import { isUrl } from '../../utils/validator';

interface LinkModalProps {
  visible: boolean;
  defaultTitle: string;
  defaultUrl: string;
  onOk: (e: React.MouseEvent | React.KeyboardEvent, data: LinkEntityData) => void;
  onCancel: (e: React.MouseEvent, autoFocus: boolean) => void;
}

interface LinkModalState {
  title: string;
  url: string;
}

export default class LinkModal extends React.PureComponent<LinkModalProps, LinkModalState> {
  static defaultProps = {
    defaultTitle: '',
    defaultUrl: '',
  };

  constructor(props: LinkModalProps) {
    super(props);
    this.state = {
      title: '',
      url: '',
    };
  }

  handleLinkInputMount = (inputComponent: Input) => {
    if (inputComponent) {
      const { defaultTitle, defaultUrl } = this.props;
      this.setState(
        {
          title: defaultTitle,
          url: defaultUrl,
        },
        () => {
          inputComponent.input.select();
        },
      );
    }
  };

  handleOk = (e: React.MouseEvent | React.KeyboardEvent) => {
    const { title, url } = this.state;
    if (isUrl(url)) {
      this.props.onOk(e, {
        // 如果未输入title，则用url代替
        title: title || url,
        // 如果未填写protocol，则默认添加http
        url: /^https?:\/\//.test(url) ? url : `http://${url}`,
      });
    }
  };

  handleCancel = (e: React.MouseEvent) => {
    this.props.onCancel(e, true);
  };

  clear = () => {
    this.setState({
      title: '',
      url: '',
    });
  };

  handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      title: e.target.value,
    });
  };

  handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      url: e.target.value,
    });
  };

  render() {
    const { visible } = this.props;
    const { title, url } = this.state;
    const urlIsValid = isUrl(url);

    return (
      <Modal
        title="插入链接"
        width={400}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        afterClose={this.clear}
        okButtonProps={{ disabled: !urlIsValid }}
        centered
        destroyOnClose
      >
        <Input
          placeholder={'请输入链接文本'}
          value={title}
          onChange={this.handleTitleChange}
          style={{ marginBottom: 12 }}
          prefix={<Icon type="edit"/>}
          onPressEnter={this.handleOk}
        />
        <Input
          placeholder={'请输入链接地址'}
          value={url}
          onChange={this.handleUrlChange}
          prefix={<Icon type="link"/>}
          onPressEnter={this.handleOk}
          ref={this.handleLinkInputMount}
        />
      </Modal>
    );
  }
}
