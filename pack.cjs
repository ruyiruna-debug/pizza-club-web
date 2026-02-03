/**
 * 打包网站：只复制部署需要的文件到 release 目录，便于上传到服务器。
 * 含主站、wallet-widget、dex（Orderly 交易）构建产物。
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const releaseDir = path.join(root, 'release');
const walletDistDir = path.join(root, 'wallet-widget', 'dist');
const releaseWalletDir = path.join(releaseDir, 'wallet-widget', 'dist');
const dexDistDir = path.join(root, 'dex', 'dist');
const releaseDexDir = path.join(releaseDir, 'dex');

const files = [
  'index.html',
  'style.css',
  'lang.js',
  'web3-wallet.js',
  'fear-greed.js',
  'smart-money.js',
  'ai-strategy.js',
  'news.js',
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log('  ' + path.relative(root, src) + ' -> ' + path.relative(root, dest));
}

function copyDirRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  ensureDir(destDir);
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const e of entries) {
    const src = path.join(srcDir, e.name);
    const dest = path.join(destDir, e.name);
    if (e.isDirectory()) {
      copyDirRecursive(src, dest);
    } else {
      fs.copyFileSync(src, dest);
      console.log('  ' + path.relative(root, src) + ' -> ' + path.relative(root, dest));
    }
  }
}

// 清空并重建 release
if (fs.existsSync(releaseDir)) {
  fs.rmSync(releaseDir, { recursive: true });
}
ensureDir(releaseDir);

console.log('打包到 release/：\n');
for (const f of files) {
  const src = path.join(root, f);
  if (!fs.existsSync(src)) {
    console.warn('  跳过（不存在）: ' + f);
    continue;
  }
  const dest = path.join(releaseDir, f);
  copyFile(src, dest);
}

if (fs.existsSync(walletDistDir)) {
  ensureDir(releaseWalletDir);
  const walletFiles = fs.readdirSync(walletDistDir);
  for (const f of walletFiles) {
    const src = path.join(walletDistDir, f);
    const dest = path.join(releaseWalletDir, f);
    if (fs.statSync(src).isFile()) copyFile(src, dest);
  }
} else {
  console.warn('\n未找到 wallet-widget/dist/，请先执行: npm run build:wallet');
}

// 构建并复制 dex（Orderly 交易）到 release/dex/
console.log('\n构建 dex（Orderly）…');
try {
  execSync('npm run build:dex', { cwd: root, stdio: 'inherit' });
} catch (e) {
  console.warn('dex 构建失败，将跳过 release/dex/：', e.message);
}
if (fs.existsSync(dexDistDir)) {
  console.log('复制 dex/dist -> release/dex/');
  copyDirRecursive(dexDistDir, releaseDexDir);
} else {
  console.warn('未找到 dex/dist/，请确保 dex 构建成功。');
}

console.log('\n完成。请将 release 文件夹内的全部内容上传到服务器。');
