export default class formElementFinder {
  static find(el) {
    let result = null;
    if (el instanceof Element)
    {
      while (result == null && el.parentElement instanceof Element)
      {
        el = el.parentElement;
        if (el instanceof HTMLFormElement)
        {
          result = {'form': el, 'submitter': el.querySelector('[role=submit]')};
        };
      };
    };
    return result;
  };

  static requestSubmit(el, mode = 'click') {
    let result = false;
    let target = formElementFinder.find(el);
    if (target != null)
    {
      result = true;
      if (target.submitter == null)
      {
        target.form.requestSubmit();
      }
      else
      {
        if (mode == 'click')
        {
          target.submitter.click();
        }
        else
        {
          target.form.requestSubmit(target.submitter);
        };
      };
    };
    return result;
  };
};