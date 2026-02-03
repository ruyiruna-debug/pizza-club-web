/**
 * 打包网站：只复制部署需要的文件到 release 目录，便于上传到服务器。
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const releaseDir = path.join(root, 'release');

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
console.log('\n完成。请将 release 文件夹内的全部内容上传到服务器。');
