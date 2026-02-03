(function () {
  'use strict';

  const API_URL = 'https://api.alternative.me/fng/?limit=1';
  const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
  const PIXELS_TOTAL = 100;
  const FETCH_TIMEOUT_MS = 12000;

  function getCard() { return document.querySelector('.fear-greed-card'); }
  function getValueEl() { return document.getElementById('fear-greed-value'); }
  function getLabelEl() { return document.getElementById('fear-greed-label'); }
  function getPixelsEl() { return document.getElementById('fear-greed-pixels'); }

  const LABELS_ZH = {
    'Extreme Fear': '极度恐惧',
    'Fear': '恐惧',
    'Neutral': '中性',
    'Greed': '贪婪',
    'Extreme Greed': '极度贪婪',
  };

  const LEVEL_MAP = {
    'Extreme Fear': 'extreme-fear',
    'Fear': 'fear',
    'Neutral': 'neutral',
    'Greed': 'greed',
    'Extreme Greed': 'extreme-greed',
  };

  function getCurrentLang() {
    try {
      return localStorage.getItem('pizza-club-lang') || 'en';
    } catch (e) {
      return 'en';
    }
  }

  function ensurePixels() {
    var PIXELS_EL = getPixelsEl();
    if (!PIXELS_EL || PIXELS_EL.children.length === PIXELS_TOTAL) return;
    PIXELS_EL.innerHTML = '';
    for (var i = 0; i < PIXELS_TOTAL; i++) {
      var cell = document.createElement('div');
      cell.className = 'fear-greed-pixel';
      cell.setAttribute('data-i', i);
      PIXELS_EL.appendChild(cell);
    }
  }

  function render(data) {
    var VALUE_EL = getValueEl();
    var LABEL_EL = getLabelEl();
    var PIXELS_EL = getPixelsEl();
    var CARD = getCard();
    var value = Math.min(100, Math.max(0, parseInt(data.value, 10) || 0));
    var classification = data.value_classification || 'Neutral';
    var level = LEVEL_MAP[classification] || 'neutral';
    var lang = getCurrentLang();
    var labelText = lang === 'zh' ? (LABELS_ZH[classification] || classification) : classification;

    if (VALUE_EL) VALUE_EL.textContent = value;
    if (LABEL_EL) LABEL_EL.textContent = labelText;
    ensurePixels();
    var filledCount = 100 - value;
    var cells = PIXELS_EL ? PIXELS_EL.querySelectorAll('.fear-greed-pixel') : [];
    cells.forEach(function (cell, i) {
      cell.classList.toggle('filled', i < filledCount);
    });
    if (CARD) CARD.setAttribute('data-level', level);
  }

  function showError() {
    var VALUE_EL = getValueEl();
    var LABEL_EL = getLabelEl();
    var msg = getCurrentLang() === 'zh' ? '加载失败，请稍后重试' : 'Failed to load. Please try again.';
    if (VALUE_EL) VALUE_EL.textContent = '--';
    if (LABEL_EL) LABEL_EL.textContent = msg;
  }

  function fetchWithTimeout(url, timeoutMs) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, timeoutMs);
    return fetch(url, { signal: controller.signal }).then(function (res) {
      clearTimeout(timeoutId);
      return res;
    }, function (err) {
      clearTimeout(timeoutId);
      throw err;
    });
  }

  function tryFetch(url) {
    return fetchWithTimeout(url, FETCH_TIMEOUT_MS)
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (json && json.data && json.data[0]) {
          return json.data[0];
        }
        return null;
      });
  }

  function fetchAndRender() {
    tryFetch(API_URL).then(function (data) {
      if (data) {
        render(data);
        return;
      }
      tryFetch(CORS_PROXY + encodeURIComponent(API_URL)).then(function (proxyData) {
        if (proxyData) {
          render(proxyData);
        } else {
          var LABEL_EL = getLabelEl();
          if (LABEL_EL) LABEL_EL.textContent = getCurrentLang() === 'zh' ? '暂无数据' : 'No data';
        }
      }).catch(showError);
    }).catch(function () {
      tryFetch(CORS_PROXY + encodeURIComponent(API_URL)).then(function (proxyData) {
        if (proxyData) {
          render(proxyData);
        } else {
          showError();
        }
      }).catch(showError);
    });
  }

  function run() {
    fetchAndRender();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
