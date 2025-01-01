import htmlInspector from '../../../library/html/htmlInspector.js';

export default class jtbcBlockViewer extends HTMLElement {
  static get observedAttributes() {
    return ['anchor-target', 'value'];
  };

  #value = null;
  #anchorTarget = '_blank';
  #noBreakSpace = '&nbsp;';

  get anchorTarget() {
    return this.#anchorTarget;
  };

  get value() {
    return this.#value ?? '';
  };

  set anchorTarget(anchorTarget) {
    this.#anchorTarget = anchorTarget;
    this.#setAnchorTarget();
  };

  set value(value) {
    this.#value = value;
    this.render();
  };

  #setAnchorTarget() {
    this.container.querySelectorAll('a').forEach(anchor => anchor.setAttribute('target', this.anchorTarget));
  };

  #renderHeader(block) {
    let result = null;
    let data = block.data;
    let tunes = block.tunes;
    if ([1, 2, 3, 4, 5, 6].includes(data.level))
    {
      result = document.createElement('h' + data.level);
      result.innerText = data.text;
      if (result.childNodes.length === 0)
      {
        result.innerHTML = this.#noBreakSpace;
      };
      if (tunes.hasOwnProperty('alignment'))
      {
        result.dataset.alignment = tunes.alignment.alignment;
      };
    };
    return result;
  };

  #renderParagraph(block) {
    let data = block.data;
    let tunes = block.tunes;
    let result = document.createElement('p');
    let inspector = new htmlInspector(data.text, 'block-editor');
    if (data.hasOwnProperty('indent') && data.indent === true)
    {
      result.classList.add('indent');
    };
    result.innerHTML = inspector.getFilteredHTML();
    if (result.childNodes.length === 0)
    {
      result.innerHTML = this.#noBreakSpace;
    };
    if (tunes.hasOwnProperty('alignment'))
    {
      result.dataset.alignment = tunes.alignment.alignment;
    };
    return result;
  };

  #renderList(block) {
    let data = block.data;
    let result = document.createElement('ol');
    const renderItems = (items, target) => {
      if (Array.isArray(items))
      {
        items.forEach(item => {
          let li = document.createElement('li');
          let body = document.createElement('div');
          let content = document.createElement('div');
          let inspector = new htmlInspector(item.content, 'block-editor');
          li.classList.add('cdx-nested-list__item');
          body.classList.add('cdx-nested-list__item-body');
          content.classList.add('cdx-nested-list__item-content');
          content.innerHTML = inspector.getFilteredHTML();
          body.append(content);
          if (Array.isArray(item.items) && item.items.length != 0)
          {
            let ol = document.createElement('ol');
            ol.classList.add('cdx-nested-list');
            ol.classList.add('cdx-nested-list__item-children');
            ol.classList.add('cdx-nested-list--' + data.style);
            renderItems(item.items, ol);
            body.append(ol);
          };
          li.append(body);
          target.append(li);
        });
      };
    };
    result.classList.add('cdx-nested-list');
    result.classList.add('cdx-nested-list--' + data.style);
    renderItems(data.items, result);
    return result;
  };

  #renderTable(block) {
    let rowIndex = 0;
    let data = block.data;
    let result = document.createElement('div');
    let table = document.createElement('table');
    result.classList.add('block_table');
    if (Array.isArray(data.content))
    {
      data.content.forEach(row => {
        if (Array.isArray(row))
        {
          let tr = document.createElement('tr');
          row.forEach(item => {
            let inspector = new htmlInspector(item, 'block-editor');
            let cell = (rowIndex == 0 && data.withHeadings == true)? document.createElement('th'): document.createElement('td');
            cell.innerHTML = inspector.getFilteredHTML();
            tr.append(cell);
          });
          rowIndex += 1;
          table.append(tr);
        };
      });
    };
    result.append(table);
    return result;
  };

  #renderImage(block) {
    let result = null;
    let data = block.data;
    if (data.hasOwnProperty('image') && data.image.fileurl != null)
    {
      let paddingTop = Number.parseInt(data.paddingTop);
      let paddingBottom = Number.parseInt(data.paddingBottom);
      result = document.createElement('div');
      result.classList.add('block_image');
      if (paddingTop != 0)
      {
        result.style.paddingTop = paddingTop + 'px';
      };
      if (paddingBottom != 0)
      {
        result.style.paddingBottom = paddingBottom + 'px';
      };
      if (data.hasOwnProperty('width'))
      {
        result.dataset.width = data.width;
      };
      if (data.hasOwnProperty('align'))
      {
        result.dataset.align = data.align;
      };
      let img = document.createElement('img');
      img.setAttribute('src', data.image.fileurl);
      result.append(img);
    };
    return result;
  };

  #renderTwoImages(block) {
    let result = null;
    let data = block.data;
    if (data.hasOwnProperty('image1') && data.hasOwnProperty('image2'))
    {
      if (data.image1.fileurl != null || data.image2.fileurl != null)
      {
        let gap = Number.parseInt(data.gap);
        let paddingTop = Number.parseInt(data.paddingTop);
        let paddingBottom = Number.parseInt(data.paddingBottom);
        result = document.createElement('div');
        result.classList.add('block_two_images');
        result.style.setProperty('--image-gap', gap + 'px');
        if (paddingTop != 0)
        {
          result.style.paddingTop = paddingTop + 'px';
        };
        if (paddingBottom != 0)
        {
          result.style.paddingBottom = paddingBottom + 'px';
        };
        if (data.hasOwnProperty('ratio'))
        {
          result.dataset.ratio = data.ratio;
        };
        if (data.hasOwnProperty('alignItems'))
        {
          result.dataset.alignItems = data.alignItems;
        };
        let image1 = document.createElement('div');
        let image2 = document.createElement('div');
        image1.classList.add('image');
        image1.classList.add('image1');
        if (data.image1.fileurl != null)
        {
          let img = document.createElement('img');
          img.setAttribute('src', data.image1.fileurl);
          image1.append(img);
        };
        image2.classList.add('image');
        image2.classList.add('image2');
        if (data.image2.fileurl != null)
        {
          let img = document.createElement('img');
          img.setAttribute('src', data.image2.fileurl);
          image2.append(img);
        };
        result.append(image1, image2);
      };
    };
    return result;
  };

  #renderAudio(block) {
    let result = null;
    let data = block.data;
    if (data.hasOwnProperty('audio') && data.audio.fileurl != null)
    {
      let paddingTop = Number.parseInt(data.paddingTop);
      let paddingBottom = Number.parseInt(data.paddingBottom);
      result = document.createElement('div');
      result.classList.add('block_audio');
      if (paddingTop != 0)
      {
        result.style.paddingTop = paddingTop + 'px';
      };
      if (paddingBottom != 0)
      {
        result.style.paddingBottom = paddingBottom + 'px';
      };
      if (data.hasOwnProperty('width'))
      {
        result.dataset.width = data.width;
      };
      if (data.hasOwnProperty('align'))
      {
        result.dataset.align = data.align;
      };
      let audio = document.createElement('audio');
      audio.setAttribute('controls', 'controls');
      audio.setAttribute('src', data.audio.fileurl);
      result.append(audio);
    };
    return result;
  };

  #renderVideo(block) {
    let result = null;
    let data = block.data;
    if (data.hasOwnProperty('video') && data.video.fileurl != null)
    {
      let paddingTop = Number.parseInt(data.paddingTop);
      let paddingBottom = Number.parseInt(data.paddingBottom);
      result = document.createElement('div');
      result.classList.add('block_video');
      if (paddingTop != 0)
      {
        result.style.paddingTop = paddingTop + 'px';
      };
      if (paddingBottom != 0)
      {
        result.style.paddingBottom = paddingBottom + 'px';
      };
      if (data.hasOwnProperty('width'))
      {
        result.dataset.width = data.width;
      };
      if (data.hasOwnProperty('align'))
      {
        result.dataset.align = data.align;
      };
      let video = document.createElement('video');
      video.setAttribute('controls', 'controls');
      video.setAttribute('src', data.video.fileurl);
      if (data.hasOwnProperty('poster') && data.poster.fileurl != null)
      {
        video.setAttribute('poster', data.poster.fileurl);
      };
      result.append(video);
    };
    return result;
  };

  #renderMixedText(block) {
    let result = null;
    let data = block.data;
    let showable = false;
    if (data.hasOwnProperty('image'))
    {
      if (data.image.fileurl != null || data.content.length != 0 || (data.title.length != 0 && data.titleless != true))
      {
        showable = true;
      };
    };
    if (showable == true)
    {
      let gap = Number.parseInt(data.gap);
      let paddingTop = Number.parseInt(data.paddingTop);
      let paddingBottom = Number.parseInt(data.paddingBottom);
      result = document.createElement('div');
      result.classList.add('block_mixed_text');
      result.style.setProperty('--text-gap', gap + 'px');
      if (paddingTop != 0)
      {
        result.style.paddingTop = paddingTop + 'px';
      };
      if (paddingBottom != 0)
      {
        result.style.paddingBottom = paddingBottom + 'px';
      };
      result.dataset.layout = data.layout;
      result.dataset.titleless = data.titleless == true? 1: 0;
      result.dataset.stretchable = data.stretchable == true? 1: 0;
      result.dataset.alignItems = data.alignItems;
      result.dataset.textAlign = data.textAlign;
      result.dataset.imageWidth = data.imageWidth;
      let image = document.createElement('div');
      let text = document.createElement('div');
      let textTitle = document.createElement('div');
      let textContent = document.createElement('div');
      image.classList.add('image');
      text.classList.add('text');
      textTitle.classList.add('title');
      textContent.classList.add('content');
      if (data.image.fileurl)
      {
        let img = document.createElement('img');
        img.setAttribute('src', data.image.fileurl);
        image.append(img);
      };
      let titleInspector = new htmlInspector(data.title, 'block-editor');
      let contentInspector = new htmlInspector(data.content, 'block-editor');
      textTitle.innerHTML = titleInspector.getFilteredHTML();
      textContent.innerHTML = contentInspector.getFilteredHTML();
      text.append(textTitle, textContent);
      result.append(image, text);
    };
    return result;
  };

  #renderDiagram(block) {
    let result = null;
    let data = block.data;
    if (data.hasOwnProperty('items') && Array.isArray(data.items) && data.items.length != 0)
    {
      let gap = Number.parseInt(data.gap);
      let paddingTop = Number.parseInt(data.paddingTop);
      let paddingBottom = Number.parseInt(data.paddingBottom);
      result = document.createElement('div');
      result.classList.add('block_diagram');
      result.style.setProperty('--image-gap', gap + 'px');
      if (paddingTop != 0)
      {
        result.style.paddingTop = paddingTop + 'px';
      };
      if (paddingBottom != 0)
      {
        result.style.paddingBottom = paddingBottom + 'px';
      };
      result.dataset.justifyContent = data.justifyContent;
      result.dataset.textAlign = data.textAlign;
      result.dataset.imageSize = data.imageSize;
      result.dataset.borderless = data.borderless == true? 1: 0;
      result.dataset.titleless = data.titleless == true? 1: 0;
      result.dataset.subtitleless = data.subtitleless == true? 1: 0;
      result.dataset.textless = (data.titleless == true && data.subtitleless == true)? 1: 0;
      let items = document.createElement('div');
      items.classList.add('items');
      data.items.forEach(item => {
        let showable = false;
        if (item.image.fileurl != null || (item.title.length != 0 && data.titleless != true) || (item.subtitle.length != 0 && data.subtitleless != true))
        {
          showable = true;
        };
        if (showable == true)
        {
          let el = document.createElement('div');
          let image = document.createElement('div');
          let text = document.createElement('div');
          let textTitle = document.createElement('div');
          let textSubtitle = document.createElement('div');
          el.classList.add('item');
          image.classList.add('image');
          text.classList.add('text');
          textTitle.classList.add('title');
          textSubtitle.classList.add('subtitle');
          if (item.image.fileurl)
          {
            let img = document.createElement('img');
            img.setAttribute('src', item.image.fileurl);
            image.append(img);
          };
          let titleInspector = new htmlInspector(item.title, 'block-editor');
          let subtitleInspector = new htmlInspector(item.subtitle, 'block-editor');
          textTitle.innerHTML = titleInspector.getFilteredHTML();
          textSubtitle.innerHTML = subtitleInspector.getFilteredHTML();
          text.append(textTitle, textSubtitle);
          el.append(image, text);
          items.append(el);
        };
      });
      result.append(items);
    };
    return result;
  };

  #renderMemo(block) {
    let result = null;
    let data = block.data;
    if (data.hasOwnProperty('items') && Array.isArray(data.items) && data.items.length != 0)
    {
      let gap = Number.parseInt(data.gap);
      let innerGap = Number.parseInt(data.innerGap);
      let paddingTop = Number.parseInt(data.paddingTop);
      let paddingBottom = Number.parseInt(data.paddingBottom);
      let borderRadius = Number.parseInt(data.borderRadius);
      result = document.createElement('div');
      result.classList.add('block_memo');
      result.style.setProperty('--item-gap', gap + 'px');
      result.style.setProperty('--inner-gap', innerGap + 'px');
      result.style.setProperty('--border-radius', borderRadius + 'px');
      if (paddingTop != 0)
      {
        result.style.paddingTop = paddingTop + 'px';
      };
      if (paddingBottom != 0)
      {
        result.style.paddingBottom = paddingBottom + 'px';
      };
      result.dataset.justifyContent = data.justifyContent;
      result.dataset.textAlign = data.textAlign;
      result.dataset.iconSize = data.iconSize;
      result.dataset.iconPosition = data.iconPosition;
      result.dataset.itemSize = data.itemSize;
      if (data.colorable === true)
      {
        if (data.borderColor != null)
        {
          result.style.setProperty('--border-color', data.borderColor);
        };
        if (data.backgroundColor != null)
        {
          result.style.setProperty('--background-color', data.backgroundColor);
        };
        if (data.iconColor != null)
        {
          result.style.setProperty('--icon-color', data.iconColor);
        };
        if (data.titleColor != null)
        {
          result.style.setProperty('--title-color', data.titleColor);
        };
        if (data.contentColor != null)
        {
          result.style.setProperty('--content-color', data.contentColor);
        };
      }
      else
      {
        result.style.removeProperty('--border-color');
        result.style.removeProperty('--background-color');
        result.style.removeProperty('--icon-color');
        result.style.removeProperty('--title-color');
        result.style.removeProperty('--content-color');
      };
      result.dataset.titleless = data.titleless == true? 1: 0;
      let items = document.createElement('div');
      items.classList.add('items');
      data.items.forEach(item => {
        let el = document.createElement('div');
        let image = document.createElement('div');
        let text = document.createElement('div');
        let textTitle = document.createElement('div');
        let textContent = document.createElement('div');
        el.classList.add('item');
        image.classList.add('image');
        text.classList.add('text');
        textTitle.classList.add('title');
        textContent.classList.add('content');
        let svg = document.createElement('jtbc-svg');
        svg.setAttribute('name', item.icon);
        image.append(svg);
        let titleInspector = new htmlInspector(item.title, 'block-editor');
        let contentInspector = new htmlInspector(item.content, 'block-editor');
        textTitle.innerHTML = titleInspector.getFilteredHTML();
        textContent.innerHTML = contentInspector.getFilteredHTML();
        text.append(textTitle, textContent);
        el.append(image, text);
        items.append(el);
      });
      result.append(items);
    };
    return result;
  };

  #renderChart(block) {
    let result = null;
    let data = block.data;
    if (data.hasOwnProperty('data') && Array.isArray(data.data) && data.data.length != 0)
    {
      const getItemsFromData = (mode, data) => {
        let result = data;
        if (mode == 'name')
        {
          result = [];
          data.forEach(item => {
            result.push(item['name']);
          });
        }
        else if (mode == 'value')
        {
          result = [];
          data.forEach(item => {
            result.push(item['value']);
          });
        };
        return result;
      };
      let paddingTop = Number.parseInt(data.paddingTop);
      let paddingBottom = Number.parseInt(data.paddingBottom);
      result = document.createElement('div');
      result.classList.add('block_chart');
      if (paddingTop != 0)
      {
        result.style.paddingTop = paddingTop + 'px';
      };
      if (paddingBottom != 0)
      {
        result.style.paddingBottom = paddingBottom + 'px';
      };
      result.dataset.align = data.align;
      result.dataset.width = data.width;
      let box = document.createElement('div');
      let chart = document.createElement('jtbc-charts');
      box.classList.add('box');
      if (data.type == 'bar')
      {
        chart.setAttribute('option', JSON.stringify({
          'xAxis': {
            'type': 'category',
            'data': getItemsFromData('name', data.data),
          },
          'yAxis': {
            'type': 'value',
          },
          'series': [
            {
              'data': getItemsFromData('value', data.data),
              'type': 'bar',
            },
          ],
        }));
      }
      else if (data.type == 'line')
      {
        chart.setAttribute('option', JSON.stringify({
          'xAxis': {
            'type': 'category',
            'data': getItemsFromData('name', data.data),
          },
          'yAxis': {
            'type': 'value',
          },
          'series': [
            {
              'data': getItemsFromData('value', data.data),
              'type': 'line',
            },
          ],
        }));
      }
      else if (data.type == 'pie')
      {
        chart.setAttribute('option', JSON.stringify({
          'tooltip': {
            'trigger': 'item',
          },
          'legend': {
            'top': '5%',
            'left': 'center',
          },
          'series': [
            {
              'type': 'pie',
              'radius': ['40%', '70%'],
              'avoidLabelOverlap': false,
              'label': {
                'show': false,
                'position': 'center',
              },
              'emphasis': {
                'label': {
                  'show': true,
                  'fontSize': 40,
                  'fontWeight': 'bold',
                },
              },
              'labelLine': {
                'show': false,
              },
              'data': getItemsFromData(null, data.data),
            },
          ],
        }));
      };
      box.append(chart);
      result.append(box);
    };
    return result;
  };

  #renderQuote(block) {
    let result = null;
    let data = block.data;
    if (data.hasOwnProperty('text') && data.text.length != 0)
    {
      let paddingTop = Number.parseInt(data.paddingTop);
      let paddingBottom = Number.parseInt(data.paddingBottom);
      result = document.createElement('div');
      result.classList.add('block_quote');
      if (paddingTop != 0)
      {
        result.style.paddingTop = paddingTop + 'px';
      };
      if (paddingBottom != 0)
      {
        result.style.paddingBottom = paddingBottom + 'px';
      };
      let text = document.createElement('div');
      let inspector = new htmlInspector(data.text, 'block-editor');
      text.classList.add('text');
      text.innerHTML = inspector.getFilteredHTML();
      result.append(text);
    };
    return result;
  };

  #renderAttachment(block) {
    let result = null;
    let data = block.data;
    if (data.hasOwnProperty('files') && Array.isArray(data.files) && data.files.length != 0)
    {
      let paddingTop = Number.parseInt(data.paddingTop);
      let paddingBottom = Number.parseInt(data.paddingBottom);
      result = document.createElement('div');
      result.classList.add('block_attachment');
      if (paddingTop != 0)
      {
        result.style.paddingTop = paddingTop + 'px';
      };
      if (paddingBottom != 0)
      {
        result.style.paddingBottom = paddingBottom + 'px';
      };
      let items = document.createElement('div');
      items.classList.add('attachment');
      data.files.forEach(file => {
        let extension = 'others';
        let fileurl = file.fileurl;
        let filename = file.filename;
        if (fileurl.includes('/'))
        {
          let name = fileurl.substring(fileurl.lastIndexOf('/') + 1);
          if (name.includes('.'))
          {
            extension = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
          };
        };
        let el = document.createElement('div');
        let elExtension = document.createElement('div');
        let elFilename = document.createElement('div');
        el.classList.add('file');
        let icon = document.createElement('jtbc-file-icons');
        icon.setAttribute('icon', extension);
        elExtension.classList.add('extension');
        elExtension.append(icon);
        let anchor = document.createElement('a');
        anchor.innerText = filename;
        anchor.setAttribute('href', fileurl);
        anchor.setAttribute('download', filename);
        elFilename.classList.add('filename');
        elFilename.append(anchor);
        el.append(elExtension, elFilename);
        items.append(el);
      });
      result.append(items);
    };
    return result;
  };

  #renderCode(block) {
    let result = null;
    let data = block.data;
    if (data.hasOwnProperty('code') && data.code.length != 0)
    {
      let paddingTop = Number.parseInt(data.paddingTop);
      let paddingBottom = Number.parseInt(data.paddingBottom);
      result = document.createElement('div');
      result.classList.add('block_code');
      if (paddingTop != 0)
      {
        result.style.paddingTop = paddingTop + 'px';
      };
      if (paddingBottom != 0)
      {
        result.style.paddingBottom = paddingBottom + 'px';
      };
      let syntaxHighlighter = document.createElement('jtbc-syntax-highlighter');
      syntaxHighlighter.setAttribute('language', data.language);
      syntaxHighlighter.setAttribute('value', data.code);
      result.append(syntaxHighlighter);
    };
    return result;
  };

  #renderDelimiter(block) {
    let result = document.createElement('div');
    result.classList.add('block_delimiter');
    return result;
  };

  render() {
    let value = this.value;
    let container = this.container.empty();
    if (value.length != 0)
    {
      let content = null;
      try
      {
        content = JSON.parse(value);
      }
      catch(e)
      {
        content = null;
        throw new Error('Unexpected value');
      };
      if (content != null)
      {
        if (content.hasOwnProperty('blocks') && Array.isArray(content.blocks))
        {
          let blocks = [];
          content.blocks.forEach(block => {
            switch(block.type) {
              case 'header':
              {
                blocks.push(this.#renderHeader(block));
                break;
              };
              case 'paragraph':
              {
                blocks.push(this.#renderParagraph(block));
                break;
              };
              case 'list':
              {
                blocks.push(this.#renderList(block));
                break;
              };
              case 'table':
              {
                blocks.push(this.#renderTable(block));
                break;
              };
              case 'image':
              {
                blocks.push(this.#renderImage(block));
                break;
              };
              case 'twoImages':
              {
                blocks.push(this.#renderTwoImages(block));
                break;
              };
              case 'audio':
              {
                blocks.push(this.#renderAudio(block));
                break;
              };
              case 'video':
              {
                blocks.push(this.#renderVideo(block));
                break;
              };
              case 'mixedText':
              {
                blocks.push(this.#renderMixedText(block));
                break;
              };
              case 'diagram':
              {
                blocks.push(this.#renderDiagram(block));
                break;
              };
              case 'memo':
              {
                blocks.push(this.#renderMemo(block));
                break;
              };
              case 'chart':
              {
                blocks.push(this.#renderChart(block));
                break;
              };
              case 'quote':
              {
                blocks.push(this.#renderQuote(block));
                break;
              };
              case 'attachment':
              {
                blocks.push(this.#renderAttachment(block));
                break;
              };
              case 'code':
              {
                blocks.push(this.#renderCode(block));
                break;
              };
              case 'delimiter':
              {
                blocks.push(this.#renderDelimiter(block));
                break;
              };
            };
          });
          if (blocks.length !== 0)
          {
            blocks.forEach(block => {
              if (block != null)
              {
                container.append(block);
              };
            });
          };
        };
      };
    };
    this.#setAnchorTarget();
    container.loadComponents().then(() => {
      this.dispatchEvent(new CustomEvent('renderend', {detail: {'el': container}}));
    });
  };

  attributeChangedCallback(attr, oldVal, newVal) {
    switch(attr) {
      case 'anchor-target':
      {
        this.anchorTarget = newVal;
        break;
      };
      case 'value':
      {
        this.value = newVal;
        break;
      };
    };
  };

  connectedCallback() {
    this.ready = true;
  };

  constructor() {
    super();
    this.ready = false;
    let pluginCss = this.getAttribute('plugin_css');
    let shadowRoot = this.attachShadow({mode: 'open'});
    let importCssUrl = import.meta.url.replace(/\.js($|\?)/, '.css$1');
    let shadowRootHTML = `<style>@import url('${importCssUrl}');</style><div class="container" style="display:none"></div>`;
    shadowRoot.innerHTML = shadowRootHTML;
    this.container = shadowRoot.querySelector('div.container');
    if (pluginCss != null)
    {
      let pluginStyle = document.createElement('link');
      pluginStyle.setAttribute('type', 'text/css');
      pluginStyle.setAttribute('rel', 'stylesheet');
      pluginStyle.setAttribute('href', pluginCss);
      shadowRoot.insertBefore(pluginStyle, this.container);
    };
  };
};