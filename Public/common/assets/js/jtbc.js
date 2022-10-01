import extender from './prototype/extender.js';

export default class jtbc {
  observe(target) {
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => node.loadComponents());
      });
    });
    this.observer.observe(target, {'childList': true, 'subtree': true});
  };

  unobserve() {
    this.observer?.disconnect();
  };

  constructor(target = null) {
    let url = new URL(import.meta.url);
    this.ver = url.searchParams.get('ver');
    this.extender = new extender(this.ver);
    this.extender.extend();
    document.body.loadComponents().then(result => {
      if (target instanceof Element)
      {
        this.observe(target);
      };
    });
  };
};