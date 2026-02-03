(function () {
  'use strict';

  const RSS_URLS_ZH = [
    'https://www.8btc.com/feed',
    'https://www.jinse.cn/rss',
  ];
  const RSS_URLS_EN = [
    'https://www.coindesk.com/arc/outboundfeeds/category/markets/',
    'https://cointelegraph.com/rss',
  ];
  const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
  const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 分钟
  const MAX_ITEMS = 12;

  const tickerInnerZh = document.getElementById('news-ticker-inner-zh');
  const tickerCopyZh = document.getElementById('news-ticker-copy-zh');
  const tickerInnerEn = document.getElementById('news-ticker-inner-en');
  const tickerCopyEn = document.getElementById('news-ticker-copy-en');
  const refreshHint = document.getElementById('news-refresh-hint');

  function canFetchRss() {
    try {
      if (typeof window === 'undefined') return false;
      if (window.location.protocol === 'file:') return false;
      if (!window.location.origin || window.location.origin === 'null') return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function stripHtml(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim().slice(0, 120);
  }

  function formatTime(dateStr, locale) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (locale === 'en') {
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return diffMins + ' min ago';
      if (diffHours < 24) return diffHours + 'h ago';
      if (diffDays < 7) return diffDays + 'd ago';
      return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    }
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return diffMins + ' 分钟前';
    if (diffHours < 24) return diffHours + ' 小时前';
    if (diffDays < 7) return diffDays + ' 天前';
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function buildCard(item) {
    const { title, link, summary, source, time } = item;
    return (
      '<a href="' +
      escapeHtml(link) +
      '" target="_blank" rel="noopener noreferrer" class="news-card">' +
      '<span class="news-source">' +
      escapeHtml(source) +
      '</span>' +
      '<h3 class="news-title">' +
      escapeHtml(title) +
      '</h3>' +
      '<p class="news-summary">' +
      escapeHtml(summary) +
      '</p>' +
      '<span class="news-time">' +
      escapeHtml(time) +
      '</span>' +
      '</a>'
    );
  }

  function parseRssXml(xmlText, sourceName, locale) {
    const items = [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      const channel = doc.querySelector('channel');
      const feedTitle = channel && channel.querySelector('title') ? channel.querySelector('title').textContent : '';
      const name = sourceName || feedTitle || 'RSS';
      const itemNodes = doc.querySelectorAll('item');
      itemNodes.forEach(function (node, i) {
        if (i >= MAX_ITEMS) return;
        const titleEl = node.querySelector('title');
        const linkEl = node.querySelector('link');
        const descEl = node.querySelector('description');
        const pubEl = node.querySelector('pubDate');
        const title = titleEl ? titleEl.textContent.trim() : '';
        const link = linkEl ? linkEl.textContent.trim() : (linkEl && linkEl.getAttribute('href')) || '';
        const rawDesc = descEl ? descEl.textContent : '';
        const summary = stripHtml(rawDesc) || title;
        const time = formatTime(pubEl ? pubEl.textContent : '', locale);
        if (title && link) {
          items.push({ title, link, summary, source: name, time });
        }
      });
    } catch (e) {
      console.warn('parseRssXml error', e);
    }
    return items;
  }

  function renderNews(items, innerEl, copyEl) {
    if (!items || items.length === 0 || !innerEl || !copyEl) return;
    const html = items.map(buildCard).join('');
    innerEl.innerHTML = html;
    copyEl.innerHTML = html;
  }

  function duplicateDefaultContent() {
    if (tickerCopyZh && tickerInnerZh) tickerCopyZh.innerHTML = tickerInnerZh.innerHTML;
    if (tickerCopyEn && tickerInnerEn) tickerCopyEn.innerHTML = tickerInnerEn.innerHTML;
  }

  function fetchOneUrl(url, sourceName, locale) {
    const fullUrl = CORS_PROXY + encodeURIComponent(url);
    return fetch(fullUrl)
      .then(function (res) {
        return res.text();
      })
      .then(function (text) {
        return parseRssXml(text, sourceName, locale);
      })
      .catch(function () {
        return [];
      });
  }

  function fetchAndRenderZh() {
    const promises = RSS_URLS_ZH.map(function (url) {
      const name = url.includes('8btc') ? '巴比特' : url.includes('jinse') ? '金色财经' : url.includes('chainnode') ? '链节点' : 'RSS';
      return fetchOneUrl(url, name, 'zh');
    });
    Promise.all(promises).then(function (results) {
      const combined = [];
      const seen = new Set();
      results.forEach(function (items) {
        items.forEach(function (item) {
          const key = (item.title || '').slice(0, 80);
          if (!seen.has(key)) {
            seen.add(key);
            combined.push(item);
          }
        });
      });
      const toShow = combined.slice(0, MAX_ITEMS);
      if (toShow.length > 0 && tickerInnerZh && tickerCopyZh) {
        renderNews(toShow, tickerInnerZh, tickerCopyZh);
      }
    });
  }

  function fetchAndRenderEn() {
    const promises = RSS_URLS_EN.map(function (url) {
      const name = url.includes('coindesk') ? 'CoinDesk' : url.includes('cointelegraph') ? 'Cointelegraph' : 'RSS';
      return fetchOneUrl(url, name, 'en');
    });
    Promise.all(promises).then(function (results) {
      const combined = [];
      const seen = new Set();
      results.forEach(function (items) {
        items.forEach(function (item) {
          const key = (item.title || '').slice(0, 80);
          if (!seen.has(key)) {
            seen.add(key);
            combined.push(item);
          }
        });
      });
      const toShow = combined.slice(0, MAX_ITEMS);
      if (toShow.length > 0 && tickerInnerEn && tickerCopyEn) {
        renderNews(toShow, tickerInnerEn, tickerCopyEn);
      }
    });
  }

  function updateRefreshHint() {
    if (refreshHint) {
      refreshHint.textContent = '每 5 分钟自动更新 · 上次更新：' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
  }

  function fetchAndRender() {
    fetchAndRenderZh();
    fetchAndRenderEn();
    updateRefreshHint();
  }

  duplicateDefaultContent();

  if (canFetchRss()) {
    fetchAndRender();
    setInterval(fetchAndRender, REFRESH_INTERVAL_MS);
  } else if (refreshHint) {
    refreshHint.textContent = '本地预览模式 · 新闻不自动更新（请通过 http(s) 访问页面以拉取最新新闻）';
  }
})();
