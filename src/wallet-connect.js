import { OKXUniversalProvider } from '@okxconnect/universal-provider';

// 你的网站名字与图标 URL（OKX 要求图标为 PNG 等格式，建议 180x180px）
const DAPP_NAME = 'Pizza Club';
const DAPP_ICON = 'https://www.okx.com/cdn/assets/imgs/logo/logo.png';

let okxProvider = null;
let currentSession = null;

function getBtn() {
  return document.getElementById('wallet-btn');
}

function getAddressEl() {
  return document.getElementById('wallet-address');
}

function shortAddress(addr) {
  if (!addr || addr.length < 10) return addr;
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function setButtonText(text, isLoading) {
  const btn = getBtn();
  if (!btn) return;
  btn.textContent = text;
  btn.disabled = !!isLoading;
  btn.classList.toggle('loading', !!isLoading);
  btn.classList.remove('connected', 'not-installed');
}

function setButtonConnected() {
  const btn = getBtn();
  if (btn) btn.classList.add('connected');
}

function setButtonNotInstalled() {
  const btn = getBtn();
  if (btn) btn.classList.add('not-installed');
}

function showAddress(address) {
  const el = getAddressEl();
  if (!el) return;
  el.textContent = address;
  el.classList.remove('wallet-error');
  el.style.display = 'block';
}

function hideAddress() {
  const el = getAddressEl();
  if (el) el.style.display = 'none';
}

function showError(msg) {
  const el = getAddressEl();
  if (!el) return;
  el.textContent = msg;
  el.classList.add('wallet-error');
  el.style.display = 'block';
}

function clearError() {
  const el = getAddressEl();
  if (el) el.classList.remove('wallet-error');
}

// 检测是否安装了 OKX 浏览器插件（注入的 window.okxwallet）
// 官方文档：typeof window.okxwallet !== 'undefined'；同时要求有 request 以便调用 eth_requestAccounts
function hasExtension() {
  try {
    if (typeof window === 'undefined' || window.okxwallet == null) return false;
    const okx = window.okxwallet;
    // 支持直接 request（EVM）或 okxwallet.ethereum.request（部分版本）
    const requestFn = typeof okx.request === 'function' ? okx.request : (okx.ethereum && typeof okx.ethereum.request === 'function' ? okx.ethereum.request : null);
    return !!requestFn;
  } catch (e) {
    return false;
  }
}

function getExtensionRequest() {
  if (!hasExtension()) return null;
  const okx = window.okxwallet;
  return typeof okx.request === 'function' ? okx.request.bind(okx) : (okx.ethereum && typeof okx.ethereum.request === 'function' ? okx.ethereum.request.bind(okx.ethereum) : null);
}

// ---------- 浏览器插件连接（优先） ----------
function connectWithExtension() {
  const request = getExtensionRequest();
  if (!request) return Promise.reject(new Error('OKX extension not available'));
  return request({ method: 'eth_requestAccounts' });
}

function getAccountsFromExtension() {
  const request = getExtensionRequest();
  if (!request) return Promise.resolve([]);
  return request({ method: 'eth_accounts' }).catch(() => []);
}

// ---------- Universal Provider（App / Mini 钱包） ----------
function getAddressFromSession(session) {
  if (!session || !session.namespaces || !session.namespaces.eip155) return null;
  const accounts = session.namespaces.eip155.accounts;
  if (!accounts || accounts.length === 0) return null;
  const first = accounts[0];
  const parts = first.split(':');
  return parts.length >= 3 ? parts[2] : first;
}

async function initUniversalProvider() {
  if (okxProvider) return okxProvider;
  try {
    okxProvider = await OKXUniversalProvider.init({
      DAppMetaData: {
        name: DAPP_NAME,
        icon: DAPP_ICON,
      },
    });
    okxProvider.on('session_delete', () => {
      currentSession = null;
      setButtonText('连接 OKX 钱包');
      hideAddress();
    });
    return okxProvider;
  } catch (e) {
    console.warn('OKX Universal Provider init error', e);
    return null;
  }
}

async function connectWithUniversalProvider() {
  const provider = await initUniversalProvider();
  if (!provider) return null;
  const session = await provider.connect({
    namespaces: {
      eip155: {
        chains: ['eip155:1', 'eip155:56'],
        defaultChain: '1',
      },
    },
  });
  return getAddressFromSession(session);
}

// ---------- 统一 connect（先插件，再 App/Mini） ----------
async function connect() {
  const btn = getBtn();
  if (!btn) return;

  if (hasExtension()) {
    setButtonText('连接中…', true);
    hideAddress();
    clearError();
    try {
      const accounts = await connectWithExtension();
      if (accounts && accounts.length > 0) {
        const addr = accounts[0];
        setButtonText(shortAddress(addr));
        setButtonConnected();
        showAddress(addr);
      } else {
        setButtonText('连接 OKX 钱包');
      }
    } catch (err) {
      if (err && err.code === 4001) {
        setButtonText('连接 OKX 钱包');
      } else {
        setButtonText('连接 OKX 钱包');
        showError('连接被拒绝或失败，请重试。');
      }
    }
    return;
  }

  const provider = await initUniversalProvider();
  if (!provider) {
    setButtonText('请安装 OKX 钱包');
    setButtonNotInstalled();
    const isFilePage = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
    showError(isFilePage
      ? '当前为本地文件页面，浏览器插件无法注入。请用本地服务器（如 npx serve）或 http(s) 打开本页面后再试。'
      : '未检测到 OKX 钱包，请安装浏览器插件或使用 OKX App 打开本页面。');
    return;
  }

  if (provider.connected && typeof provider.connected === 'function' && provider.connected() && currentSession) {
    const addr = getAddressFromSession(currentSession);
    if (addr) {
      setButtonText(shortAddress(addr));
      setButtonConnected();
      showAddress(addr);
      clearError();
    }
    return;
  }

  setButtonText('连接中…', true);
  hideAddress();
  clearError();

  try {
    const session = await provider.connect({
      namespaces: {
        eip155: {
          chains: ['eip155:1', 'eip155:56'],
          defaultChain: '1',
        },
      },
    });
    currentSession = session;
    const addr = getAddressFromSession(session);
    if (addr) {
      setButtonText(shortAddress(addr));
      setButtonConnected();
      showAddress(addr);
    } else {
      setButtonText('连接 OKX 钱包');
      showError('未获取到钱包地址');
    }
  } catch (err) {
    const code = err && err.code;
    if (code === 300) {
      setButtonText('连接 OKX 钱包');
      hideAddress();
    } else {
      setButtonText('连接 OKX 钱包');
      setButtonNotInstalled();
      showError('连接失败，请确保已安装 OKX 钱包插件或使用 OKX App 打开本页面。');
    }
  }
}

async function init() {
  if (hasExtension()) {
    setButtonText('连接 OKX 钱包');
    try {
      const accounts = await getAccountsFromExtension();
      if (accounts && accounts.length > 0) {
        const addr = accounts[0];
        setButtonText(shortAddress(addr));
        setButtonConnected();
        showAddress(addr);
      }
    } catch (e) {}
    return;
  }

  const provider = await initUniversalProvider();
  if (!provider) {
    const isFilePage = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
    setButtonText('请安装 OKX 钱包');
    setButtonNotInstalled();
    if (isFilePage && getAddressEl()) {
      getAddressEl().style.display = 'block';
      getAddressEl().textContent = '本地文件页无法检测插件，请用 http(s) 或本地服务器打开页面。';
      getAddressEl().classList.add('wallet-error');
    }
    return;
  }
  if (provider.connected && typeof provider.connected === 'function' && provider.connected()) {
    try {
      const session = provider.session || currentSession;
      if (session) {
        currentSession = session;
        const addr = getAddressFromSession(session);
        if (addr) {
          setButtonText(shortAddress(addr));
          setButtonConnected();
          showAddress(addr);
          return;
        }
      }
      const accounts = await provider.request({ method: 'eth_accounts' }, 'eip155:1');
      if (accounts && accounts.length > 0) {
        const addr = accounts[0];
        setButtonText(shortAddress(addr));
        setButtonConnected();
        showAddress(addr);
        return;
      }
    } catch (e) {}
  }
  setButtonText('连接 OKX 钱包');
}

// 插件可能晚于页面脚本注入，延迟多次检测
const RETRY_DELAYS_MS = [200, 500, 1000, 2000, 3000];
function scheduleExtensionRetry() {
  if (typeof window === 'undefined' || window.location.protocol === 'file:') return;
  let idx = 0;
  function check() {
    if (hasExtension()) {
      setButtonText('连接 OKX 钱包');
      setButtonNotInstalled();
      hideAddress();
      clearError();
      init();
      return;
    }
    if (idx < RETRY_DELAYS_MS.length) {
      setTimeout(check, RETRY_DELAYS_MS[idx]);
      idx += 1;
    }
  }
  setTimeout(check, RETRY_DELAYS_MS[0]);
}

function bindButton() {
  const btn = getBtn();
  if (btn) btn.addEventListener('click', connect);
}

if (typeof window !== 'undefined') {
  bindButton();
  init().then(function () {
    if (!hasExtension() && window.location && window.location.protocol !== 'file:') {
      scheduleExtensionRetry();
    }
  });

  if (hasExtension() && window.okxwallet.on) {
    window.okxwallet.on('accountsChanged', (accounts) => {
      if (accounts && accounts.length > 0) {
        setButtonText(shortAddress(accounts[0]));
        setButtonConnected();
        showAddress(accounts[0]);
      } else {
        setButtonText('连接 OKX 钱包');
        hideAddress();
      }
    });
    window.okxwallet.on('chainChanged', () => window.location.reload());
  }
}
