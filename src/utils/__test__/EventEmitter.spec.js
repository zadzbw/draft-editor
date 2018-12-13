import EventEmitter from '../EventEmitter';

describe('EventEmitter', () => {
  let emitter = new EventEmitter();

  // eslint-disable-next-line no-undef
  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('on()', () => {
    it('should register function when type is new', () => {
      const test = x => x;
      emitter.on('test', test);

      expect(emitter.all).toHaveProperty('test');
      expect(emitter.all['test']).toEqual([test]);
    });

    it('should register another function when type is exist already', () => {
      const test = x => x;
      const test2 = x => x;
      emitter.on('test', test);
      emitter.on('test', test2);

      expect(emitter.all).toHaveProperty('test');
      expect(emitter.all['test']).toEqual([test, test2]);
    });

    it('should only register one function when function is same', () => {
      const test = x => x;
      emitter.on('test', test);
      emitter.on('test', test);
      emitter.on('test', test);

      expect(emitter.all).toHaveProperty('test');
      expect(emitter.all['test']).toEqual([test]);
    });
  });

  describe('off()', () => {
    it('should unregister function correctly', () => {
      const test = x => x;
      const test2 = x => x;
      emitter.on('test', test);
      emitter.on('test', test2);

      // 1
      emitter.off('test', test);
      expect(emitter.all).toHaveProperty('test');
      expect(emitter.all['test']).toEqual([test2]);

      // 2
      emitter.off('test', test2);
      expect(emitter.all['test']).toEqual([]);
    });

    it('should do nothing when function is not register', () => {
      const test = x => x;
      emitter.on('test', test);
      emitter.off('test', () => null);

      expect(emitter.all).toHaveProperty('test');
      expect(emitter.all['test']).toEqual([test]);
    });

    it('should do nothing when type is not register before', () => {
      const test = x => x;
      emitter.on('test', test);
      emitter.off('test-xxx', test);

      expect(emitter.all).toHaveProperty('test');
      expect(emitter.all['test']).toEqual([test]);
    });
  });

  describe('emit()', () => {
    it('should emit function', () => {
      const test = jest.fn();
      emitter.on('test', test);

      emitter.emit('test');
      expect(test).toBeCalled();
      expect(test).toBeCalledTimes(1);

      emitter.emit('test');
      emitter.emit('test');
      expect(test).toBeCalledTimes(3);
    });

    it('should do nothing with unknown type', () => {
      const test = jest.fn();
      emitter.on('test', test);

      emitter.emit('test-xxx');
      expect(test).not.toBeCalled();

      emitter.emit('test-xxx');
      emitter.emit('test-xxx');
      expect(test).not.toBeCalled();

      emitter.emit('test');
      expect(test).toBeCalled();
      expect(test).toBeCalledTimes(1);
    });

    it('should emit chained function', () => {
      const test = jest.fn();
      const test2 = jest.fn();
      emitter.on('test', test);
      emitter.on('test', test2);

      emitter.emit('test');
      expect(test).toBeCalled();
      expect(test2).toBeCalled();
      expect(test).toBeCalledTimes(1);
      expect(test2).toBeCalledTimes(1);

      emitter.off('test', test2);
      emitter.emit('test');
      emitter.emit('test');
      expect(test).toBeCalledTimes(3);
      expect(test2).toBeCalledTimes(1);
    });

    it('should stop emit after called stopEmit and start emit after called startEmit', () => {
      const test = jest.fn();
      emitter.on('test', test);

      emitter.stopEmit();
      emitter.emit('test');
      expect(test).not.toBeCalled();

      emitter.startEmit();
      emitter.emit('test');
      expect(test).toBeCalled();
    });
  });

  describe('destroy()', () => {
    it('should remove all function with type', () => {
      const test = jest.fn();
      const test2 = jest.fn();
      emitter.on('test', test);
      emitter.on('test', test2);
      emitter.destroy('test');

      expect(emitter.all).toHaveProperty('test');
      expect(emitter.all['test']).toEqual([]);
    });
  });

  describe('destroyAll()', () => {
    it('should remove all function', () => {
      const test = jest.fn();
      const test2 = jest.fn();
      emitter.on('test', test);
      emitter.on('test2', test2);

      expect(emitter.all).toHaveProperty('test');
      expect(emitter.all).toHaveProperty('test2');

      emitter.destroyAll();
      expect(emitter.all).not.toHaveProperty('test');
      expect(emitter.all).not.toHaveProperty('test2');
    });
  });
});
