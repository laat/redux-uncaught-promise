import test from 'tape';
import sinon from 'sinon';
import uncaughtPromise from './index.js';

test('that it is a storeEnhancer', (assert) => {
  const store = { dispatch: sinon.spy() };
  const createStore = sinon.spy(() => store);

  const newStore = uncaughtPromise(createStore)('reducer', 'initialState', 'enhancer');
  assert.ok(createStore.calledWith('reducer', 'initialState', 'enhancer'), 'calls createStore');

  newStore.dispatch('action');
  assert.ok(store.dispatch.calledOnce, 'calls original dispatch');

  assert.end();
});

test('it normal returns', (assert) => {
  const createStore = () => ({ dispatch: (action) => action });
  const newStore = uncaughtPromise(createStore)('reducer', 'initialState', 'enhancer');

  const noop = { type: 'NOOP' };
  const result = newStore.dispatch(noop);
  assert.equal(result, noop, 'passes normal returns unchanged');
  assert.end();
});

test('it handles resolved promises', (assert) => {
  const createStore = () => ({ dispatch: (action) => action });
  const newStore = uncaughtPromise(createStore)('reducer', 'initialState', 'enhancer');

  const result = newStore.dispatch(Promise.resolve(true));

  assert.plan(1);
  result.then(bool => assert.ok(bool, 'resolved promises works'));
});

test('it handles rejected promises', (assert) => {
  assert.plan(1);
  const createStore = () => ({ dispatch: (action) => action });
  const newStore = uncaughtPromise(createStore)('reducer', 'initialState', 'enhancer');

  const err = new Error();
  return newStore.dispatch(Promise.reject(err))
    .catch(e => assert.equal(e, err, 'still rejects with error'));
});

test('it handles rejected promises in the browser', (assert) => {
  assert.plan(1);
  const createStore = () => ({ dispatch: (action) => action });
  const newStore = uncaughtPromise(createStore)('reducer', 'initialState', 'enhancer');
  const err = new Error();

  global.window = {}; // signal that we are a browser
  process.once('uncaughtException', (e) => {
    assert.equal(e, err, 'throws outside of promise in browsers');
    global.window = void 0;
  });

  newStore.dispatch(Promise.reject(err));
});
