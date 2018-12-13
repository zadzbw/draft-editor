import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

// 两种不同的setState用法

describe('setState', () => {
  it('should add 3 items but add 1 item in fact', () => {
    let key = 1;

    class Test extends React.Component {
      state = {
        arr: [],
      };

      add = () => {
        const { arr } = this.state;
        // 这里直接setState，由于是异步的，会导致可能有元素不会被添加进arr
        this.setState({
          arr: arr.concat(key++),
        });
      };

      getItems = () => {
        const { arr } = this.state;
        return arr.map(item => <span className="span" key={item}>{item}</span>);
      };

      render() {
        return (
          <p>{this.getItems()}</p>
        );
      }
    }

    class Wrapper extends React.Component {
      handleClick = () => {
        // 连续添加3个item
        this.test.add();
        this.test.add();
        this.test.add();
      };

      render() {
        return (
          <React.Fragment>
            <Test
              ref={(el) => {
                this.test = el;
              }}
            />
            <button onClick={this.handleClick}>click</button>
          </React.Fragment>
        );
      }
    }

    const wrapper = mount(<Wrapper/>);

    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('.span')).toHaveLength(0);

    wrapper.find('button').simulate('click'); // 这里应该添加3个item，但实际上只添加了1个

    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('.span')).toHaveLength(1);

    wrapper.find('button').simulate('click'); // 这里应该添加3个item，但实际上只添加了1个

    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('.span')).toHaveLength(2);
  });

  it('should add 3 items and add 3 items in fact', () => {
    let key = 1;

    class Test extends React.Component {
      state = {
        arr: [],
      };

      add = () => {
        // 这里同步setState，不会有遗漏
        this.setState((prevState) => {
          const { arr } = prevState;
          return {
            arr: arr.concat(key++),
          };
        });
      };

      getItems = () => {
        const { arr } = this.state;
        return arr.map(item => <span className="span" key={item}>{item}</span>);
      };

      render() {
        return (
          <p>{this.getItems()}</p>
        );
      }
    }

    class Wrapper extends React.Component {
      handleClick = () => {
        // 连续添加3个item
        this.test.add();
        this.test.add();
        this.test.add();
      };

      render() {
        return (
          <React.Fragment>
            <Test
              ref={(el) => {
                this.test = el;
              }}
            />
            <button onClick={this.handleClick}>click</button>
          </React.Fragment>
        );
      }
    }

    const wrapper = mount(<Wrapper/>);

    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('.span')).toHaveLength(0);

    wrapper.find('button').simulate('click'); // 这里应该添加3个item，实际上也添加了3个

    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('.span')).toHaveLength(3);

    wrapper.find('button').simulate('click'); // 这里应该添加3个item，实际上也添加了3个

    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('.span')).toHaveLength(6);
  });

  it('should batch update state', () => {
    jest.useFakeTimers();
    const f = jest.fn();

    class Wrapper extends React.Component {
      state = {
        a: 0,
        b: 0,
      };

      handleClick1 = () => {
        setTimeout(() => {
          this.setState({
            a: 11,
          });
          this.setState({
            a: 22,
          });
          this.setState({
            a: 33,
          });
        }, 200);
      };

      handleClick2 = () => {
        setTimeout(() => {
          // 该api可以保证在合成事件及生命周期之外，也能够批量更新state
          ReactDOM.unstable_batchedUpdates(() => {
            this.setState({
              b: 111,
            });
            this.setState({
              b: 222,
            });
            this.setState({
              b: 333,
            });
          });
        }, 200);
      };

      render() {
        f();
        return (
          <div>
            <p>a: {this.state.a}</p>
            <p>b: {this.state.b}</p>
            <button onClick={this.handleClick1}>change a</button>
            <button onClick={this.handleClick2}>change b</button>
          </div>
        );
      }
    }

    const wrapper = mount(<Wrapper/>);

    expect(f).toHaveBeenCalledTimes(1); // first render

    // click first button, 无法批量更新
    wrapper.find('button').at(0).simulate('click');
    expect(wrapper.state('a')).toBe(0);
    jest.runAllTimers();
    wrapper.find('p').at(0).simulate('click'); // 模拟点击后，快照正确，不知道为什么
    expect(f).toHaveBeenCalledTimes(4); // rerender 3 times
    expect(wrapper.state('a')).toBe(33);
    expect(wrapper).toMatchSnapshot();

    // click second button，可以批量更新
    wrapper.find('button').at(1).simulate('click');
    expect(wrapper.state('b')).toBe(0);
    jest.runAllTimers();
    wrapper.find('p').at(0).simulate('click'); // 模拟点击后，快照正确，不知道为什么
    expect(f).toHaveBeenCalledTimes(5); // rerender 1 time
    expect(wrapper.state('b')).toBe(333);
    expect(wrapper).toMatchSnapshot();
  });
});
