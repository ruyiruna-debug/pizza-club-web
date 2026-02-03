(function () {
  'use strict';

  const API_URL = 'https://api.alternative.me/fng/?limit=1';
  const CARD = document.querySelector('.fear-greed-card');
  const VALUE_EL = document.getElementById('fear-greed-value');
  const LABEL_EL = document.getElementById('fear-greed-label');
  const BAR_EL = document.getElementById('fear-greed-bar');

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

  function render(data) {
    const value = parseInt(data.value, 10) || 0;
    const classification = data.value_classification || 'Neutral';
    const level = LEVEL_MAP[classification] || 'neutral';
    const labelZh = LABELS_ZH[classification] || classification;

    if (VALUE_EL) VALUE_EL.textContent = value;
    if (LABEL_EL) LABEL_EL.textContent = labelZh;
    if (BAR_EL) {
      BAR_EL.style.width = value + '%';
    }
    if (CARD) {
      CARD.setAttribute('data-level', level);
    }
  }

  function fetchAndRender() {
    fetch(API_URL)
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        if (json && json.data && json.data[0]) {
          render(json.data[0]);
        } else if (LABEL_EL) {
          LABEL_EL.textContent = '暂无数据';
        }
      })
      .catch(function () {
        if (LABEL_EL) LABEL_EL.textContent = '加载失败，请稍后重试';
      });
  }

  fetchAndRender();
})();
