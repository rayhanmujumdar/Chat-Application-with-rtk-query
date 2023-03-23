// debounce fn
const debounceHandler = (fn, delay) => {
  let timeOutId;
  return (...arg) => {
    clearTimeout(timeOutId);
    timeOutId = setTimeout(() => {
      fn(...arg);
    }, delay);
  };
};

export default debounceHandler;
