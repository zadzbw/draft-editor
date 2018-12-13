/* eslint-disable class-methods-use-this */
import React from 'react';
import { getComponentName } from '../reactUtils';

describe('reactUtils', () => {
  describe('getComponentName', () => {
    it('should get componentName of normal class', () => {
      class Test extends React.Component {
        render() {
          return <div>test</div>;
        }
      }

      expect(getComponentName(Test)).toBe('Test');
    });

    it('should get componentName of named class', () => {
      class Test extends React.Component {
        static displayName = 'TestComponent';

        render() {
          return <div>test</div>;
        }
      }

      expect(getComponentName(Test)).toBe('TestComponent');
    });

    it('should get componentName of SFC', () => {
      function f() {
        return <div>test</div>;
      }

      expect(getComponentName(f)).toBe('f');
      expect(getComponentName(() => <div>test2</div>)).toBe('Component');
    });
  });
});
