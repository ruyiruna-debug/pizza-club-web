(function () {
  'use strict';

  var OKX_DOWNLOAD_URL = 'https://www.okx.com/web3';
  var btn = document.getElementById('wallet-btn');
  if (!btn) return;

  var walletDetected = false;

  function hasOkxWallet() {
    try {
      return (
        typeof window !== 'undefined' &&
        window.okxwallet != null &&
        typeof window.okxwallet.request === 'function'
      );
    } catch (e) {
      return false;
    }
  }

  function shortAddress(addr) {
    if (!addr || addr.length < 10) return addr;
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }

  function setButton(text, isConnected, isLoading, isNotInstalled) {
    btn.textContent = text;
    btn.disabled = !!isLoading;
    btn.classList.toggle('connected', !!isConnected);
    btn.classList.toggle('wallet-not-installed', !!isNotInstalled);
    btn.title = isConnected ? '已连接：' + text : (isNotInstalled ? '请先安装 OKX 钱包' : '连接钱包');
  }

  function onPluginInstalled() {
    if (walletDetected) return;
    walletDetected = true;

    var okx = window.okxwallet;
    okx
      .request({ method: 'eth_accounts' })
      .then(function (accounts) {
        if (accounts && accounts.length > 0) {
          setButton(shortAddress(accounts[0]), true, false, false);
        } else {
          setButton('连接钱包', false, false, false);
        }
      })
      .catch(function () {
        setButton('连接钱包', false, false, false);
      });

    okx.on('accountsChanged', function (accounts) {
      if (accounts && accounts.length > 0) {
        setButton(shortAddress(accounts[0]), true, false, false);
      } else {
        setButton('连接钱包', false, false, false);
      }
    });

    okx.on('chainChanged', function () {
      window.location.reload();
    });
  }

  function onPluginNotInstalled() {
    if (walletDetected) return;
    setButton('安装 OKX 钱包', false, false, true);
  }

  function tryDetect() {
    if (hasOkxWallet()) {
      onPluginInstalled();
      return true;
    }
    onPluginNotInstalled();
    return false;
  }

  function handleClick() {
    if (!hasOkxWallet()) {
      window.open(OKX_DOWNLOAD_URL, '_blank', 'noopener,noreferrer');
      return;
    }
    setButton('连接中…', false, true, false);
    window.okxwallet
      .request({ method: 'eth_requestAccounts' })
      .then(function (accounts) {
        if (accounts && accounts.length > 0) {
          setButton(shortAddress(accounts[0]), true, false, false);
        } else {
          setButton('连接钱包', false, false, false);
        }
      })
      .catch(function (err) {
        if (err && err.code === 4001) {
          setButton('连接钱包', false, false, false);
        } else {
          setButton('连接钱包', false, false, false);
        }
      });
  }

  btn.addEventListener('click', handleClick);

  function init() {
    tryDetect();
  }

  init();

  window.addEventListener('load', function () {
    if (walletDetected) return;
    tryDetect();
  });

  var delays = [100, 300, 600, 1000, 2000];
  delays.forEach(function (delay) {
    setTimeout(function () {
      if (walletDetected) return;
      if (hasOkxWallet()) {
        onPluginInstalled();
      }
    }, delay);
  });
})();
