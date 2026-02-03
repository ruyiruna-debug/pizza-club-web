(function () {
  'use strict';

  var STORAGE_KEY = 'pizza-club-wallet-connected';

  function getLang() {
    try {
      return localStorage.getItem('pizza-club-lang') || 'en';
    } catch (e) {
      return 'en';
    }
  }

  /** 获取注入的 Web3 钱包（兼容 MetaMask、Rabby、Coinbase Wallet、Trust Wallet 等绝大多数浏览器插件钱包） */
  function getProvider() {
    var ethereum = typeof window !== 'undefined' && window.ethereum;
    if (!ethereum) return null;
    if (Array.isArray(ethereum.providers)) {
      return ethereum.providers.find(function (p) { return p.isMetaMask || p.isRabby || p.isCoinbaseWallet; }) || ethereum.providers[0];
    }
    return ethereum;
  }

  function getBtn() {
    return document.getElementById('wallet-btn');
  }

  function getAddressEl() {
    return document.getElementById('wallet-address');
  }

  function getDisconnectBtn() {
    return document.getElementById('wallet-disconnect');
  }

  function shortAddress(addr) {
    if (!addr || addr.length < 10) return addr;
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }

  function setButtonText(key) {
    var btn = getBtn();
    if (!btn) return;
    var t = { wallet_connect: 'Connect Wallet', wallet_connecting: 'Connecting…', wallet_no_provider: 'No wallet detected' };
    var lang = getLang();
    if (lang === 'zh') t = { wallet_connect: '连接钱包', wallet_connecting: '连接中…', wallet_no_provider: '未检测到钱包' };
    btn.textContent = t[key] || key;
  }

  function setDisconnectText() {
    var btn = getDisconnectBtn();
    if (!btn) return;
    btn.textContent = getLang() === 'zh' ? '断开' : 'Disconnect';
  }

  function showConnected(address) {
    var btn = getBtn();
    var addrEl = getAddressEl();
    var discBtn = getDisconnectBtn();
    if (btn) {
      btn.hidden = true;
      btn.disabled = false;
    }
    if (addrEl) {
      addrEl.textContent = shortAddress(address);
      addrEl.hidden = false;
      addrEl.classList.remove('wallet-error');
    }
    if (discBtn) {
      discBtn.hidden = false;
      setDisconnectText();
    }
  }

  function showDisconnected(noProvider) {
    var btn = getBtn();
    var addrEl = getAddressEl();
    var discBtn = getDisconnectBtn();
    if (btn) {
      btn.hidden = false;
      btn.disabled = !!noProvider;
      setButtonText(noProvider ? 'wallet_no_provider' : 'wallet_connect');
    }
    if (addrEl) addrEl.hidden = true;
    if (discBtn) discBtn.hidden = true;
  }

  function showConnecting() {
    var btn = getBtn();
    if (btn) {
      btn.disabled = true;
      setButtonText('wallet_connecting');
    }
  }

  function persistAddress(addr) {
    try {
      if (addr) localStorage.setItem(STORAGE_KEY, addr);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function connect() {
    var provider = getProvider();
    if (!provider) {
      showDisconnected(true);
      return;
    }
    showConnecting();
    provider.request({ method: 'eth_requestAccounts' })
      .then(function (accounts) {
        if (accounts && accounts[0]) {
          persistAddress(accounts[0]);
          showConnected(accounts[0]);
          subscribeProvider(provider);
        } else {
          showDisconnected(false);
        }
      })
      .catch(function () {
        showDisconnected(false);
        setButtonText('wallet_connect');
      });
  }

  function disconnect() {
    persistAddress(null);
    showDisconnected(getProvider() ? false : true);
  }

  function subscribeProvider(provider) {
    if (!provider || !provider.on) return;
    provider.on('accountsChanged', function (accounts) {
      if (accounts && accounts[0]) {
        persistAddress(accounts[0]);
        showConnected(accounts[0]);
      } else {
        disconnect();
      }
    });
    provider.on('chainChanged', function () {
      window.location.reload();
    });
  }

  function tryReconnect() {
    var provider = getProvider();
    if (!provider) {
      showDisconnected(true);
      return;
    }
    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}
    if (!saved) {
      showDisconnected(false);
      return;
    }
    provider.request({ method: 'eth_accounts' })
      .then(function (accounts) {
        if (accounts && accounts[0]) {
          persistAddress(accounts[0]);
          showConnected(accounts[0]);
          subscribeProvider(provider);
        } else {
          persistAddress(null);
          showDisconnected(false);
        }
      })
      .catch(function () {
        showDisconnected(false);
      });
  }

  function init() {
    tryReconnect();
    var btn = getBtn();
    var discBtn = getDisconnectBtn();
    if (btn) btn.addEventListener('click', connect);
    if (discBtn) discBtn.addEventListener('click', disconnect);
    window.addEventListener('pizza-club-lang-change', function (e) {
      var lang = e.detail && e.detail.lang ? e.detail.lang : getLang();
      var addrEl = getAddressEl();
      if (addrEl && !addrEl.hidden) return;
      setButtonText(getProvider() ? 'wallet_connect' : 'wallet_no_provider');
      setDisconnectText();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
