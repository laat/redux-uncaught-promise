export default (createStore) => (reducer, initialState, enhancer) => {
  const store = createStore(reducer, initialState, enhancer);
  const realDispatch = store.dispatch;
  const dispatch = (...args) => {
    const result = realDispatch(...args);
    if (result && typeof result.then === 'function') {
      return Promise.resolve(result).catch((err) => {
        // Throws error outside of current stack which creates
        // clickable stack traces in the browser and triggers
        // window.onerror.
        if (typeof window !== 'undefined') {
          setTimeout(() => { throw err; });
        }
        // This is error is normally swallowed.
        throw err;
      });
    }
    return result;
  };
  return {
    ...store,
    dispatch,
  };
};
