import extender from './prototype/extender.js';

export default class jtbc {
  observeAndLoadComponents(observeNode) {
    if (observeNode != null)
    {
      let observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(el => { el.loadComponents(); });
        });
      });
      observer.observe(observeNode, {childList: true, subtree: true});
    };
  };

  constructor(observeNode = null) {
    this.extender = new extender();
    this.extender.extend();
    document.body.loadComponents().then(() => {
      this.observeAndLoadComponents(observeNode);
    });
  };
};