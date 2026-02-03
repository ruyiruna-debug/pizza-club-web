(function () {
  'use strict';

  var FEED_EL = document.getElementById('smart-money-feed');
  var LOADING_EL = document.getElementById('smart-money-loading');
  var COINGECKO_GLOBAL = 'https://api.coingecko.com/api/v3/global';

  function getLang() {
    try {
      return localStorage.getItem('pizza-club-lang') || 'en';
    } catch (e) {
      return 'en';
    }
  }

  function render(items) {
    if (!FEED_EL) return;
    if (LOADING_EL) LOADING_EL.remove();
    FEED_EL.innerHTML = items.map(function (item) {
      var valueClass = item.positive !== undefined ? (item.positive ? 'positive' : 'negative') : '';
      return '<div class="smart-money-item">' +
        '<span class="smart-money-item__label">' + item.label + '</span>' +
        '<span class="smart-money-item__value' + (valueClass ? ' ' + valueClass : '') + '">' + item.value + '</span>' +
        '</div>';
    }).join('');
  }

  function formatPct(num) {
    if (num == null || isNaN(num)) return '--';
    var n = Number(num);
    var sign = n >= 0 ? '+' : '';
    return sign + n.toFixed(2) + '%';
  }

  function formatNum(num) {
    if (num == null || isNaN(num)) return '--';
    var n = Number(num);
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    return n.toFixed(2);
  }

  var lastData = null;

  function buildItems(data, lang) {
    if (!data) return [];
    var isZh = lang === 'zh';
    var btcDom = data.market_cap_percentage && data.market_cap_percentage.btc;
    var ethDom = data.market_cap_percentage && data.market_cap_percentage.eth;
    var mcapChange = data.market_cap_change_percentage_24h_usd;
    var volBtc = data.total_volume && data.total_volume.btc;
    var mcap = data.total_market_cap && data.total_market_cap.usd;
    return [
      { label: isZh ? 'BTC 市值占比' : 'BTC Dominance', value: btcDom != null ? btcDom.toFixed(1) + '%' : '--' },
      { label: isZh ? 'ETH 市值占比' : 'ETH Dominance', value: ethDom != null ? ethDom.toFixed(1) + '%' : '--' },
      { label: isZh ? '24h 总市值变化' : '24h Market Cap Chg', value: formatPct(mcapChange), positive: mcapChange != null && mcapChange >= 0 },
      { label: isZh ? '24h 成交量 (BTC)' : '24h Vol (BTC)', value: formatNum(volBtc) + (volBtc != null ? ' BTC' : '') },
      { label: isZh ? '总市值' : 'Total Market Cap', value: mcap != null ? '$' + formatNum(mcap) : '--' }
    ];
  }

  function fetchAndRender() {
    fetch(COINGECKO_GLOBAL)
      .then(function (res) { return res.json(); })
      .then(function (json) {
        var data = json.data || {};
        lastData = data;
        var items = buildItems(data, getLang());
        render(items);
      })
      .catch(function () {
        if (!FEED_EL) return;
        if (LOADING_EL) LOADING_EL.remove();
        var msg = getLang() === 'zh' ? '加载失败，请稍后重试' : 'Failed to load. Retry later.';
        FEED_EL.innerHTML = '<p class="smart-money-loading">' + msg + '</p>';
      });
  }

  window.addEventListener('pizza-club-lang-change', function (e) {
    var lang = e.detail && e.detail.lang ? e.detail.lang : getLang();
    if (lastData) {
      render(buildItems(lastData, lang));
    }
  });

  fetchAndRender();
  setInterval(fetchAndRender, 60000);
})();
