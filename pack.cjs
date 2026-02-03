/**
 * 打包网站：只复制部署需要的文件到 release 目录，便于上传到服务器。
 * 含主站 + RainbowKit 钱包组件（wallet-widget）。
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const releaseDir = path.join(root, 'release');
const walletBuildDir = path.join(root, 'wallet-widget', 'build');
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

// 复制 RainbowKit 钱包组件（使用已构建的 wallet-widget/build，提交到 Git 后 Vercel 无需再构建）
if (!fs.existsSync(walletBuildDir)) {
  console.log('\n构建 wallet-widget（RainbowKit）…');
  try {
    execSync('npm run build:wallet', { cwd: root, stdio: 'inherit', maxBuffer: 10 * 1024 * 1024 });
  } catch (e) {
    console.warn('wallet-widget 构建失败:', e.message);
  }
}
if (fs.existsSync(walletBuildDir)) {
  ensureDir(releaseWalletDir);
  const walletFiles = fs.readdirSync(walletBuildDir);
  for (const f of walletFiles) {
    const src = path.join(walletBuildDir, f);
    const dest = path.join(releaseWalletDir, f);
    if (fs.statSync(src).isFile()) copyFile(src, dest);
  }
  console.log('  wallet-widget 已复制到 release/wallet-widget/dist/');
} else {
  console.warn('未找到 wallet-widget/build/，部署后钱包会 404。请本地执行 npm run build:wallet，然后 git add wallet-widget/build 并提交推送。');
}

console.log('\n完成。请将 release 文件夹内的全部内容上传到服务器。');
