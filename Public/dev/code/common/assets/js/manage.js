export default class manage {
  initList() {
    if (this.inited != true)
    {
      this.inited = true;
      let that = this;
      let scarf = this.self.parentNode.querySelector('.scarf');
      const getActiveTab = () => {
        let result = null;
        if (this.workspace != null)
        {
          result = this.workspace.querySelector('div.content div.tabs span.on');
        };
        return result;
      };
      const getTabBySymbol = symbol => {
        let result = null;
        if (this.workspace != null)
        {
          this.workspace.querySelectorAll('div.content div.tabs span').forEach(span => {
            if (span.symbol == symbol)
            {
              result = span;
            };
          });
        };
        return result;
      };
      const newFolder = (el = null) => {
        let rank = 0;
        let target = null;
        let parentPath = '';
        let workspace = this.workspace;
        if (el != null)
        {
          if (el.classList.contains('on'))
          {
            rank = Number.parseInt(el.getAttribute('rank'));
            target = el.querySelector('ul[content=files]');
            parentPath = el.getAttribute('path');
          }
          else
          {
            el.dataset.cmd = 'newFolder';
            el.querySelector('i')?.click();
          };
        }
        else
        {
          target = workspace.querySelector('ul[content=files]');
        };
        if (target != null)
        {
          let newLi = document.createElement('li');
          newLi.classList.add('new');
          newLi.classList.add('folder');
          newLi.setAttribute('rank', rank + 1);
          newLi.html('<span><i icon="folder"></i><form class="form" is="jtbc-form" method="post" inconsequential="true"><input type="hidden" name="path" role="field" /><input type="text" name="filename" role="field" autocomplete="off" /></form></span>').then(li => {
            let input = li.querySelector('input[name=filename]');
            target.appendChild(li);
            input.focus();
            input.setAttribute('placeholder', workspace.getAttribute('text-new-folder'));
            input.previousElementSibling.value = parentPath;
            input.parentElement.setAttribute('action', workspace.getAttribute('action-new-folder'));
            input.addEventListener('keydown', e => e.keyCode == 13? e.target.blur(): null);
            input.addEventListener('blur', e => {
              if (e.target.value == '')
              {
                setTimeout(() => li.remove(), 300);
              }
              else
              {
                input.parentElement.submit();
              };
            });
            input.parentElement.addEventListener('submitend', e => {
              let res = e.detail.res;
              res.json().then(data => {
                li.remove();
                if (data.code == 1)
                {
                  reloadFiles(target);
                }
                else
                {
                  this.miniMessage.push(data.message);
                };
              });
            });
            li.scrollIntoView({block: 'end', behavior: 'smooth'});
          });
        };
      };
      const newFile = (el = null) => {
        let rank = 0;
        let target = null;
        let parentPath = '';
        let workspace = this.workspace;
        if (el != null)
        {
          if (el.classList.contains('on'))
          {
            rank = Number.parseInt(el.getAttribute('rank'));
            target = el.querySelector('ul[content=files]');
            parentPath = el.getAttribute('path');
          }
          else
          {
            el.dataset.cmd = 'newFile';
            el.querySelector('i')?.click();
          };
        }
        else
        {
          target = workspace.querySelector('ul[content=files]');
        };
        if (target != null)
        {
          let newLi = document.createElement('li');
          newLi.classList.add('new');
          newLi.classList.add('file');
          newLi.setAttribute('rank', rank + 1);
          newLi.html('<span><i icon="others"></i><form class="form" is="jtbc-form" method="post" inconsequential="true"><input type="hidden" name="path" role="field" /><input type="text" name="filename" role="field" autocomplete="off" /></form></span>').then(li => {
            let input = li.querySelector('input[name=filename]');
            target.appendChild(li);
            input.focus();
            input.setAttribute('placeholder', workspace.getAttribute('text-new-file'));
            input.previousElementSibling.value = parentPath;
            input.parentElement.setAttribute('action', workspace.getAttribute('action-new-file'));
            input.addEventListener('keydown', e => e.keyCode == 13? e.target.blur(): null);
            input.addEventListener('blur', e => {
              if (e.target.value == '')
              {
                setTimeout(() => li.remove(), 300);
              }
              else
              {
                input.parentElement.submit();
              };
            });
            input.parentElement.addEventListener('submitend', e => {
              let res = e.detail.res;
              res.json().then(data => {
                li.remove();
                if (data.code == 1)
                {
                  let targetParent = target.parentElement;
                  let path = e.target.querySelector('input[name=path]')?.value + e.target.querySelector('input[name=filename]')?.value;
                  let filename = path.includes('/')? path.substring(path.lastIndexOf('/') + 1): path;
                  let extension = filename.substring(filename.lastIndexOf('.') + 1);
                  if (!targetParent.classList.contains('children'))
                  {
                    targetParent.reload();
                  }
                  else
                  {
                    targetParent.parentElement.dispatchEvent(new CustomEvent('reload'));
                  };
                  openFile(path, filename, extension);
                }
                else
                {
                  this.miniMessage.push(data.message);
                };
              });
            });
            li.scrollIntoView({block: 'end', behavior: 'smooth'});
          });
        };
      };
      const renameItem = el => {
        if (!el.classList.contains('renaming'))
        {
          el.classList.add('renaming');
          let documentRange = document.createRange();
          let contextualFragment = documentRange.createContextualFragment('<form class="form" is="jtbc-form" method="post" inconsequential="true"><input type="hidden" name="hash" role="field" /><input type="hidden" name="path" role="field" /><input type="hidden" name="filename" role="field" /><input type="text" name="target_filename" role="field" autocomplete="off" /></form>');
          el.querySelector('span').appendFragment(contextualFragment).then(span => {
            let form = span.querySelector('form.form');
            let input = form.querySelector('input[name=filename]');
            let targetInput = input.nextElementSibling;
            input.value = el.getAttribute('filename');
            targetInput.value = input.value;
            form.querySelector('input[name=hash]').value = el.getAttribute('hash');
            form.querySelector('input[name=path]').value = el.getAttribute('path');
            form.setAttribute('action', this.workspace.getAttribute('action-rename'));
            form.addEventListener('submitend', e => {
              let res = e.detail.res;
              res.json().then(data => {
                if (data.code == 1)
                {
                  reloadFiles(el.parentElement);
                }
                else
                {
                  this.miniMessage.push(data.message);
                };
              });
            });
            targetInput.select();
            targetInput.addEventListener('keydown', e => e.keyCode == 13? e.target.blur(): null);
            targetInput.addEventListener('blur', () => form.submit());
          });
        };
      };
      const deleteItem = el => {
        let path = el.getAttribute('path');
        let hash = el.getAttribute('hash');
        let message = el.classList.contains('file')? scarf.getAttribute('text-tips-3-2'): scarf.getAttribute('text-tips-3-1');
        this.dialog.confirm(message.replaceAll('${$filename}', path.endsWith('/')? path.slice(0, -1): path), () => {
          let action = this.workspace.getAttribute('action-delete') + '&path=' + encodeURIComponent(path) + '&hash=' + encodeURIComponent(hash);
          if (!el.hasAttribute('locked'))
          {
            el.setAttribute('locked', 'true');
            fetch(action).then(res => res.ok? res.json(): {}).then(data => {
              el.removeAttribute('locked');
              if (data.code == 1)
              {
                reloadFiles(el.parentElement);
              }
              else
              {
                this.miniMessage.push(data.message);
              };
            });
          };
        }, scarf.getAttribute('text-ok'), scarf.getAttribute('text-cancel'));
      };
      const openFile = (path, filename, extension) => {
        let workspace = this.workspace;
        if (workspace != null)
        {
          let tabsEl = workspace.querySelector('div.content div.tabs');
          let filesEl = workspace.querySelector('div.content div.files');
          if (tabsEl != null && filesEl != null)
          {
            let totalCount = 0;
            let hasOpend = false;
            tabsEl.querySelectorAll('span').forEach(el => {
              totalCount += 1;
              if (el.getAttribute('path') == path)
              {
                hasOpend = true;
                el.querySelector('em')?.click();
              };
            });
            if (hasOpend === false)
            {
              if (totalCount >= 10)
              {
                this.dialog.alert(scarf.getAttribute('text-tips-1'));
              }
              else
              {
                let symbol = Symbol();
                let newTab = document.createElement('span');
                let newTabEm = document.createElement('em');
                newTab.symbol = symbol;
                newTab.setAttribute('path', path);
                newTab.setAttribute('title', path);
                newTab.setAttribute('icon', extension);
                newTabEm.innerText = filename;
                newTab.appendChild(newTabEm);
                newTab.appendChild(document.createElement('i'));
                let newFile = document.createElement('div');
                newFile.symbol = symbol;
                newFile.classList.add('file');
                newFile.setAttribute('path', path);
                tabsEl.appendChild(newTab);
                filesEl.appendChild(newFile);
                newTab.querySelector('em')?.click();
              };
            };
          };
        };
      };
      const closeFile = el => {
        if (el.classList.contains('close'))
        {
          let currentActiveTab = getActiveTab();
          if (currentActiveTab != null) closeFile(currentActiveTab);
        }
        else
        {
          let parentElement = el.parentElement;
          if (el.classList.contains('changed'))
          {
            this.dialog.confirm(scarf.getAttribute('text-tips-2'), () => {
              el.classList.remove('changed');
              closeFile(el);
            }, scarf.getAttribute('text-ok'), scarf.getAttribute('text-cancel'));
          }
          else
          {
            let symbol = el.symbol;
            parentElement.nextElementSibling.querySelectorAll('div.file').forEach(file => {
              if (file.symbol == symbol)
              {
                file.remove();
              };
            });
            el.remove();
            parentElement.querySelector('span')?.querySelector('em')?.click();
          };
        };
      };
      const selectFile = el => {
        let symbol = el.symbol;
        el.parentElement.querySelectorAll('span').forEach(span => {
          if (span.symbol == symbol)
          {
            span.classList.add('on');
          }
          else
          {
            span.classList.remove('on');
          };
        });
        el.parentElement.nextElementSibling.querySelectorAll('div.file').forEach(file => {
          if (file.symbol == symbol)
          {
            file.classList.add('on');
            if (!file.hasAttribute('loaded'))
            {
              file.setAttribute('loaded', 'true');
              fetch(file.parentElement.getAttribute('url') + '&path=' + encodeURIComponent(file.getAttribute('path'))).then(res => res.ok? res.json(): {}).then(data => {
                if (data.code == 1)
                {
                  file.html(data.fragment).then(el => el.delegateEventListener('div.editor', 'mousemove', e => editorMonitor(e)));
                };
              }).catch(err => {
                file.removeAttribute('loaded');
              });
            };
          }
          else
          {
            file.classList.remove('on');
          };
        });
      };
      const reloadFiles = el => {
        let parent = el.parentElement;
        if (!parent.classList.contains('children'))
        {
          parent.reload();
        }
        else
        {
          parent.parentElement.dispatchEvent(new CustomEvent('reload'));
        };
      };
      const editorMonitor = e => {
        let layerY = e.layerY;
        let currentTarget = e.currentTarget;
        let height = currentTarget.offsetHeight;
        let bar = currentTarget.querySelector('div.bar');
        if (bar != null)
        {
          if (height - layerY < bar.offsetHeight)
          {
            bar.classList.add('on');
          }
          else
          {
            bar.classList.remove('on');
          };
        };
      };
      scarf.delegateEventListener('div.side div.h3 span.newFolder', 'click', () => newFolder());
      scarf.delegateEventListener('div.side div.h3 span.newFile', 'click', () => newFile());
      scarf.delegateEventListener('div.side div.explorer u.newFolder', 'click', function(){ newFolder(this.parentElement.parentElement.parentElement); });
      scarf.delegateEventListener('div.side div.explorer u.newFile', 'click', function(){ newFile(this.parentElement.parentElement.parentElement); });
      scarf.delegateEventListener('div.side div.explorer u.rename', 'click', function(){ renameItem(this.parentElement.parentElement.parentElement); });
      scarf.delegateEventListener('div.side div.explorer u.delete', 'click', function(){ deleteItem(this.parentElement.parentElement.parentElement); });
      scarf.delegateEventListener('div.side div.icon span.collapse', 'click', function(){
        let side = that.workspace.querySelector('div.side');
        if (side != null)
        {
          side.classList.remove('on');
          side.nextElementSibling.classList.add('on');
        };
      });
      scarf.delegateEventListener('div.collapse div.icon span.collapse', 'click', function(){
        let collapse = that.workspace.querySelector('div.collapse');
        if (collapse != null)
        {
          collapse.classList.remove('on');
          collapse.previousElementSibling.classList.add('on');
        };
      });
      scarf.delegateEventListener('div.content div.tabs span em', 'click', e => selectFile(e.target.parentElement));
      scarf.delegateEventListener('div.content div.tabs span i', 'click', e => closeFile(e.target.parentElement));
      scarf.delegateEventListener('div.content div.files button.close', 'click', e => closeFile(e.target));
      scarf.delegateEventListener('div.content div.files form.form', 'submitend', e => {
        let res = e.detail.res;
        res.json().then(data => {
          if (data.code == 1)
          {
            e.target.querySelector('jtbc-field-code-editor[name=content]')?.dispatchEvent(new CustomEvent('changed', {bubbles: true}));
          };
          this.miniMessage.push(data.message);
        });
      });
      scarf.delegateEventListener('div.content div.files jtbc-field-code-editor[name=content]', 'changed', e => {
        let formEl = e.target.parentElement.parentElement;
        let tab = getTabBySymbol(formEl.parentElement.symbol);
        if (tab != null)
        {
          if (formEl.isFormDataChanged())
          {
            tab.classList.add('changed');
          }
          else
          {
            tab.classList.remove('changed');
          };
        };
      });
      scarf.delegateEventListener('div.content div.files jtbc-field-code-editor[name=content]', 'fullscreenchanged', e => {
        e.target.parentElement.nextElementSibling.classList.toggle('hide', e.target.isFullScreen());
      });
      scarf.delegateEventListener('div.content div.files jtbc-field-code-editor[name=content]', 'save', e => {
        let formEl = e.target.parentElement.parentElement;
        formEl.querySelector('button.submit')?.click();
      });
      scarf.addEventListener('renderend', e => {
        let target = e.target;
        if (target.classList.contains('scarf'))
        {
          this.workspace = target.querySelector('div.ppWorkspace');
        }
        else if (target.classList.contains('children'))
        {
          let li = target.parentElement;
          let cmd = li.dataset.cmd;
          if (cmd == 'newFolder')
          {
            newFolder(li);
          }
          else if (cmd == 'newFile')
          {
            newFile(li);
          };
          delete li.dataset.cmd;
        }
        else if (target.getAttribute('content') == 'files')
        {
          target.querySelectorAll('li.folder').forEach(el => {
            el.addEventListener('reload', function(){
              el.removeAttribute('loaded');
              el.querySelector('i')?.click();
            });
            el.querySelector('i')?.addEventListener('click', function(){
              if (!el.hasAttribute('loaded'))
              {
                el.setAttribute('loaded', 'true');
                fetch(el.getAttribute('url')).then(res => res.ok? res.json(): {}).then(data => {
                  if (data.code == 1)
                  {
                    el.classList.add('on');
                    el.querySelector('div.children').html(data.fragment);
                  };
                }).catch(err => {
                  el.removeAttribute('loaded');
                });
              }
              else
              {
                el.classList.toggle('on');
              };
            });
            el.querySelector('em')?.addEventListener('click', function(){
              this.parentElement.querySelector('i')?.click();
            });
          });
          target.querySelectorAll('li.file').forEach(el => {
            el.querySelector('em')?.addEventListener('click', function(){
              if (this.getAttribute('icon') != 'others')
              {
                let path = this.getAttribute('path');
                let filename = path.includes('/')? path.substring(path.lastIndexOf('/') + 1): path;
                let extension = filename.substring(filename.lastIndexOf('.') + 1);
                openFile(path, filename, extension);
              };
            });
          });
        };
      });
    };
  };

  readiedCallback() {
    let init = this.self.getAttribute('init');
    if (Reflect.has(this, init)) Reflect.get(this, init).call(this);
  };

  constructor(self) {
    this.self = self;
    this.inited = false;
    this.workspace = null;
    this.root = document.getElementById('root');
    this.main = document.getElementById('main');
    this.master = document.getElementById('master');
    this.dialog = document.getElementById('dialog');
    this.miniMessage = document.getElementById('miniMessage');
  };
};