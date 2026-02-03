(function () {
  var PRICE_API = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT';
  var STATS_API = 'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT';
  var SL_PERCENT = 1.2;
  var TP_PERCENT = 2.0;
  var lastStrategy = null;

  function getLang() {
    try {
      return localStorage.getItem('pizza-club-lang') || 'en';
    } catch (e) {
      return 'en';
    }
  }

  function roundPrice(p) {
    return Math.round(p * 100) / 100;
  }

  function formatNum(n) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function showLoading(show) {
    var el = document.getElementById('ai-strategy-loading');
    var err = document.getElementById('ai-strategy-error');
    var result = document.getElementById('ai-strategy-result');
    var btn = document.getElementById('ai-strategy-btn');
    if (el) el.hidden = !show;
    if (err) err.hidden = true;
    if (result) result.hidden = show;
    if (btn) btn.disabled = show;
  }

  function showError() {
    var el = document.getElementById('ai-strategy-loading');
    var err = document.getElementById('ai-strategy-error');
    var result = document.getElementById('ai-strategy-result');
    var btn = document.getElementById('ai-strategy-btn');
    if (el) el.hidden = true;
    if (err) err.hidden = false;
    if (result) result.hidden = true;
    if (btn) btn.disabled = false;
  }

  function syncStrategyToOrderlyIframe(data) {
    var iframe = document.getElementById('orderly-trading-iframe');
    if (!iframe || !data) return;
    var base = (iframe.getAttribute('data-dex-base') || '/dex/').replace(/\?.*$/, '').replace(/\/?$/, '') + '/';
    var params = new URLSearchParams({
      side: data.directionKey || '',
      entry: String(data.entry),
      sl: String(data.stopLoss),
      tp: String(data.takeProfit)
    });
    iframe.src = base + '?' + params.toString();
  }

  function showResult(data) {
    var loading = document.getElementById('ai-strategy-loading');
    var err = document.getElementById('ai-strategy-error');
    var result = document.getElementById('ai-strategy-result');
    var btn = document.getElementById('ai-strategy-btn');
    if (loading) loading.hidden = true;
    if (err) err.hidden = true;
    if (result) {
      result.hidden = false;
      var period = document.getElementById('ai-strategy-period');
      var timeEl = document.getElementById('ai-strategy-time');
      var dir = document.getElementById('ai-strategy-direction');
      var entry = document.getElementById('ai-strategy-entry');
      var sl = document.getElementById('ai-strategy-sl');
      var tp = document.getElementById('ai-strategy-tp');
      if (period) period.textContent = getLang() === 'zh' ? '4H 周期' : '4H cycle';
      if (timeEl) timeEl.textContent = data.timeText || '';
      if (dir) {
        dir.textContent = data.direction;
        dir.className = data.directionKey === 'long' ? 'ai-strategy-value ai-strategy-value--long' : 'ai-strategy-value ai-strategy-value--short';
      }
      if (entry) entry.textContent = '$' + formatNum(data.entry);
      if (sl) sl.textContent = '$' + formatNum(data.stopLoss);
      if (tp) tp.textContent = '$' + formatNum(data.takeProfit);
      var reasonEl = document.getElementById('ai-strategy-reason');
      if (reasonEl) reasonEl.textContent = data.reason || '';
    }
    if (btn) btn.disabled = false;
    syncStrategyToOrderlyIframe(data);
  }

  function getReason(isLong, change24h, lang) {
    var zh = lang === 'zh';
    var absCh = Math.abs(change24h);
    if (isLong) {
      if (absCh >= 2) {
        return zh ? '4H 周期内 24h 动量较强偏多，结构延续做多思路；建议顺势入场，严格止损。' : 'Strong 24h momentum in 4H window supports continuation long; entry with trend and tight stop suggested.';
      }
      if (absCh >= 0.5) {
        return zh ? '4H 级别 24h 略偏多，短期结构支持做多，风险可控。' : '4H timeframe shows mild 24h bullish bias; structure supports long with manageable risk.';
      }
      return zh ? '4H 多空均衡略偏多，轻仓试多，以止损保护为主。' : '4H balance slightly long; light long with stop-loss focus.';
    } else {
      if (absCh >= 2) {
        return zh ? '4H 周期内 24h 动量偏空，结构延续做空思路；顺势做空，严守止损。' : '24h momentum bearish in 4H window; short with trend and strict stop suggested.';
      }
      if (absCh >= 0.5) {
        return zh ? '4H 级别 24h 略偏空，短期结构支持做空，注意风控。' : '4H shows mild 24h bearish bias; structure supports short with risk control.';
      }
      return zh ? '4H 多空均衡略偏空，轻仓试空，止损优先。' : '4H balance slightly short; light short with stop-loss priority.';
    }
  }

  function buildStrategy(price, change24h) {
    var entry = roundPrice(price);
    var isLong = change24h >= 0;
    var slPercent = SL_PERCENT / 100;
    var tpPercent = TP_PERCENT / 100;
    var stopLoss, takeProfit;
    if (isLong) {
      stopLoss = roundPrice(entry * (1 - slPercent));
      takeProfit = roundPrice(entry * (1 + tpPercent));
    } else {
      stopLoss = roundPrice(entry * (1 + slPercent));
      takeProfit = roundPrice(entry * (1 - tpPercent));
    }
    var now = new Date();
    var timeText = now.toLocaleString(getLang() === 'zh' ? 'zh-CN' : 'en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
    var lang = getLang();
    var data = {
      direction: isLong ? (lang === 'zh' ? '做多 Long' : 'Long') : (lang === 'zh' ? '做空 Short' : 'Short'),
      directionKey: isLong ? 'long' : 'short',
      entry: entry,
      stopLoss: stopLoss,
      takeProfit: takeProfit,
      timeText: timeText,
      reason: getReason(isLong, change24h, lang),
      isLong: isLong,
      change24h: change24h
    };
    lastStrategy = data;
    return data;
  }

  function fetchStrategy() {
    showLoading(true);
    Promise.all([
      fetch(PRICE_API).then(function (r) { return r.json(); }),
      fetch(STATS_API).then(function (r) { return r.json(); })
    ]).then(function (arr) {
      var priceData = arr[0];
      var stats = arr[1];
      var price = parseFloat(priceData.price, 10);
      var change24h = stats && stats.priceChangePercent ? parseFloat(stats.priceChangePercent, 10) : 0;
      var strategy = buildStrategy(price, change24h);
      showResult(strategy);
    }).catch(function () {
      showError();
    });
  }

  function initOrderlyIframe() {
    var iframe = document.getElementById('orderly-trading-iframe');
    if (!iframe || iframe.src) return;
    var base = (iframe.getAttribute('data-dex-base') || '/dex/').replace(/\?.*$/, '').replace(/\/?$/, '') + '/';
    iframe.src = base;
  }

  function init() {
    initOrderlyIframe();
    var btn = document.getElementById('ai-strategy-btn');
    if (btn) {
      btn.addEventListener('click', fetchStrategy);
    }
    window.addEventListener('pizza-club-lang-change', function (e) {
      var result = document.getElementById('ai-strategy-result');
      if (result && !result.hidden && lastStrategy) {
        var lang = e.detail && e.detail.lang ? e.detail.lang : getLang();
        var dir = document.getElementById('ai-strategy-direction');
        var period = document.getElementById('ai-strategy-period');
        var reasonEl = document.getElementById('ai-strategy-reason');
        if (period) period.textContent = lang === 'zh' ? '4H 周期' : '4H cycle';
        if (dir) {
          var isLong = lastStrategy.directionKey === 'long';
          dir.textContent = isLong ? (lang === 'zh' ? '做多 Long' : 'Long') : (lang === 'zh' ? '做空 Short' : 'Short');
        }
        if (reasonEl) reasonEl.textContent = getReason(lastStrategy.isLong, lastStrategy.change24h, lang);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
