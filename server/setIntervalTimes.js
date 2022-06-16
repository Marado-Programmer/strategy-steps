module.exports = function setIntervalTimes(callable, ms, times = Infinity, finalCallable = () => {}) {
  setTimeout(() => {
    if (!times) {
      finalCallable();
      return;
    }

    callable();
    setIntervalTimes(callable, ms, times - 1, finalCallable);
  }, ms)
};
