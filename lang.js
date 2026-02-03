(function () {
  var STORAGE_KEY = 'pizza-club-lang';

  var i18n = {
    en: {
      title: 'Pizza Club',
      nav_home: 'Home',
      nav_chart: 'Chart',
      nav_fear_greed: 'Fear & Greed',
      nav_ai_strategy: 'AI Strategy',
      nav_news: 'News',
      nav_about: 'About',
      nav_contact: 'Contact',
      chart_label: 'Live Chart',
      chart_title: 'Chart',
      fear_greed_label: 'Market Sentiment',
      fear_greed_title: 'Fear & Greed Index',
      fear_greed_loading: 'Loading…',
      fear_greed_hint: 'Data: ',
      news_label: 'News',
      news_title: 'Crypto News',
      news_zh_sources: 'Chinese Sources',
      news_en_sources: 'English Sources',
      news_refresh_hint: 'Auto-refresh every 5 min · RSS',
      about_label: 'About Us',
      about_title: 'About',
      about_text: 'Pizza Club is a non-profit Web3 community dedicated to helping more people learn about blockchain and related knowledge.',
      contact_label: 'Contact',
      contact_title: 'Contact',
      contact_text: 'Telegram: ',
      footer_text: '© 2025 Pizza Club. All rights reserved.',
      fear_greed_extreme_fear: 'Extreme Fear',
      fear_greed_fear: 'Fear',
      fear_greed_neutral: 'Neutral',
      fear_greed_greed: 'Greed',
      fear_greed_extreme_greed: 'Extreme Greed',
      smart_money_title: 'Smart Money',
      smart_money_loading: 'Loading…',
      smart_money_hint: 'Whale & exchange flow signals',
      ai_label: 'AI',
      ai_title: 'BTC 4H Strategy',
      ai_desc: 'Get a suggested contract strategy for the current 4-hour cycle (direction, entry, stop-loss, take-profit).',
      ai_btn_seek: 'Seek Strategy',
      ai_period: '4H cycle',
      ai_direction: 'Direction',
      ai_entry: 'Entry',
      ai_stop_loss: 'Stop-loss',
      ai_take_profit: 'Take-profit',
      ai_reason_label: 'AI reason',
      ai_loading: 'Loading…',
      ai_error: 'Failed to load. Try again.',
      ai_disclaimer: 'This is a beta feature and is not investment advice. The module is experimental and may be inaccurate. Use at your own risk.',
      wallet_connect: 'Connect Wallet',
      wallet_disconnect: 'Disconnect',
      wallet_connecting: 'Connecting…',
      wallet_no_provider: 'No wallet detected'
    },
    zh: {
      title: 'Pizza Club',
      nav_home: '首页',
      nav_chart: '行情',
      nav_fear_greed: '恐惧贪婪',
      nav_ai_strategy: 'AI 策略',
      nav_news: '新闻',
      nav_about: '关于',
      nav_contact: '联系',
      chart_label: '实时行情',
      chart_title: '行情图表',
      fear_greed_label: '市场情绪',
      fear_greed_title: '恐惧与贪婪指数',
      fear_greed_loading: '加载中…',
      fear_greed_hint: '数据来源：',
      news_label: '快讯',
      news_title: '加密货币新闻',
      news_zh_sources: '中文信息源',
      news_en_sources: '英文信息源',
      news_refresh_hint: '每 5 分钟自动更新 · 数据来源 RSS',
      about_label: '关于我们',
      about_title: '关于',
      about_text: 'Pizza Club 是一个非营利性的 Web3 社区，目的是为了让更多人了解区块链以及相关知识。',
      contact_label: '联系方式',
      contact_title: '联系',
      contact_text: 'Telegram：',
      footer_text: '© 2025 我的网页 · 保留所有权利',
      fear_greed_extreme_fear: '极度恐惧',
      fear_greed_fear: '恐惧',
      fear_greed_neutral: '中性',
      fear_greed_greed: '贪婪',
      fear_greed_extreme_greed: '极度贪婪',
      smart_money_title: '聪明钱包',
      smart_money_loading: '加载中…',
      smart_money_hint: '巨鲸与交易所资金流向信号',
      ai_label: 'AI',
      ai_title: 'BTC 4H 策略',
      ai_desc: '获取当前 4 小时周期的合约开单建议（方向、入场、止损、止盈）。',
      ai_btn_seek: '寻求策略建议',
      ai_period: '4H 周期',
      ai_direction: '方向',
      ai_entry: '入场',
      ai_stop_loss: '止损',
      ai_take_profit: '止盈',
      ai_reason_label: 'AI 理由',
      ai_loading: '加载中…',
      ai_error: '加载失败，请稍后重试。',
      ai_disclaimer: '本功能为测试版，不可作为投资建议；模块尚不成熟，仅供参考，请自行承担风险。',
      wallet_connect: '连接钱包',
      wallet_disconnect: '断开',
      wallet_connecting: '连接中…',
      wallet_no_provider: '未检测到钱包'
    }
  };


  function getLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch (e) {
      return 'en';
    }
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function applyLang(lang) {
    var t = i18n[lang] || i18n.en;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t.title;

    var nodes = document.querySelectorAll('[data-i18n]');
    nodes.forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = t[key];
      if (val == null) return;
      el.textContent = val;
    });

    var nodesHtml = document.querySelectorAll('[data-i18n-html]');
    nodesHtml.forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      var val = t[key];
      if (val == null) return;
      el.innerHTML = val;
    });

    var fearGreedHint = document.querySelector('.fear-greed-hint');
    if (fearGreedHint && t.fear_greed_hint !== undefined) {
      fearGreedHint.innerHTML = t.fear_greed_hint + '<a href="https://alternative.me/crypto/fear-and-greed-index/" target="_blank" rel="noopener noreferrer" class="fear-greed-link">Alternative.me</a>';
    }
    var contactCard = document.querySelector('.contact-card [data-i18n-link]');
    if (contactCard && t.contact_text !== undefined) {
      contactCard.innerHTML = t.contact_text + '<a href="https://t.me/PPPIZA" target="_blank" rel="noopener noreferrer" class="contact-link">@PPPIZA</a>';
    }

    var card = document.querySelector('.fear-greed-card');
    var level = card && card.getAttribute('data-level');
    if (level) {
      var levelKey = 'fear_greed_' + level.replace(/-/g, '_');
      var labelEl = document.getElementById('fear-greed-label');
      if (labelEl && t[levelKey]) labelEl.textContent = t[levelKey];
    } else {
      var labelEl = document.getElementById('fear-greed-label');
      if (labelEl && (labelEl.textContent === 'Loading…' || labelEl.textContent === '加载中…')) {
        labelEl.textContent = t.fear_greed_loading || 'Loading…';
      }
    }

    var btns = document.querySelectorAll('.lang-btn');
    btns.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    try {
      window.dispatchEvent(new CustomEvent('pizza-club-lang-change', { detail: { lang: lang } }));
    } catch (e) {}
  }

  function init() {
    var lang = getLang();
    applyLang(lang);

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var l = this.getAttribute('data-lang');
        setStoredLang(l);
        applyLang(l);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
