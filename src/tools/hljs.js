'use strict';

// var hljs = require('highlight.js');
import hljs from 'highlight.js';

let vueHighlightJS = {};
vueHighlightJS.install = function install(Vue) {
  Vue.directive('highlightjs', {
    deep: true,
    bind: function bind(el, binding) {
      // on first bind, highlight all targets
      let targets = el.querySelectorAll('code');
      let target;
      let i;

      for (i = 0; i < targets.length; i += 1) {
        target = targets[i];

        if (typeof binding.value === 'string') {
          // if a value is directly assigned to the directive, use this
          // instead of the element content.
          target.textContent = binding.value;
        }
        hljs.highlightBlock(target);
      }
    },
    componentUpdated: function componentUpdated(el, binding) {
      // after an update, re-fill the content and then highlight
      let targets = el.querySelectorAll('code');
      let target;
      let i;

      for (i = 0; i < targets.length; i += 1) {
        target = targets[i];
        if (typeof binding.value === 'string') {
          target.textContent = binding.value;
        }
        hljs.highlightBlock(target);
      }
    }
  });
};

module.exports = vueHighlightJS;