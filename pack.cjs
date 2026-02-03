/**
 * 打包网站：只复制部署需要的文件到 release 目录，便于上传到服务器。
 * 含主站 + RainbowKit 钱包组件（wallet-widget）。
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const releaseDir = path.join(root, 'release');
const walletDistDir = path.join(root, 'wallet-widget', 'dist');
const releaseWalletDir = path.join(releaseDir, 'wallet-widget', 'dist');

const files = [
  'index.html',
  'style.css',
  'lang.js',
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

// 构建并复制 RainbowKit 钱包组件（Vercel 上需先 postinstall 装好 wallet-widget 依赖）
console.log('\n构建 wallet-widget（RainbowKit）…');
try {
  execSync('npm run build:wallet', { cwd: root, stdio: 'inherit', maxBuffer: 10 * 1024 * 1024 });
} catch (e) {
  console.warn('wallet-widget 构建失败:', e.message);
}
if (fs.existsSync(walletDistDir)) {
  ensureDir(releaseWalletDir);
  const walletFiles = fs.readdirSync(walletDistDir);
  for (const f of walletFiles) {
    const src = path.join(walletDistDir, f);
    const dest = path.join(releaseWalletDir, f);
    if (fs.statSync(src).isFile()) copyFile(src, dest);
  }
  console.log('  wallet-widget 已复制到 release/wallet-widget/dist/');
} else {
  console.warn('未找到 wallet-widget/dist/，部署后钱包按钮会 404。请确保 wallet-widget 已提交到 Git 且 npm run build:wallet 成功。');
}

console.log('\n完成。请将 release 文件夹内的全部内容上传到服务器。');
