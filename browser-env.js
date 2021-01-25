require('browser-env')();

window.matchMedia = function () {
  return {
    matches: false,
    addListener: function () {},
    removeListener: function () {},
  };
};

