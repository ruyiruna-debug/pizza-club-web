/**
 * 部署到阿里云服务器：先打包，再用 scp 上传 release 到服务器，并覆盖目标目录。
 * 使用前请复制 deploy.config.example.json 为 deploy.config.json 并填写你的服务器信息。
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const configPath = path.join(root, 'deploy.config.json');
const releaseDir = path.join(root, 'release');

function readConfig() {
  if (!fs.existsSync(configPath)) {
    console.error('未找到 deploy.config.json。');
    console.error('请复制 deploy.config.example.json 为 deploy.config.json，并填写服务器 host、user、targetPath 等。');
    process.exit(1);
  }
  const raw = fs.readFileSync(configPath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('deploy.config.json 格式错误（需为合法 JSON）:', e.message);
    process.exit(1);
  }
}

function run(cmd, opts = {}) {
  console.log('执行:', cmd);
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

// 1. 先打包
if (!fs.existsSync(releaseDir)) {
  console.log('未找到 release 目录，先执行打包…\n');
  run('node pack.cjs', { cwd: root });
} else {
  console.log('使用现有 release 目录。若需重新打包请先执行: npm run pack\n');
}

const config = readConfig();
const { host, user, port = 22, targetPath, privateKey } = config;
if (!host || !user || !targetPath) {
  console.error('deploy.config.json 中必须填写 host、user、targetPath。');
  process.exit(1);
}

const remoteTmp = '/tmp/deploy_release_' + Date.now();
const keyOpt = privateKey ? ` -i "${path.resolve(root, privateKey)}"` : '';

// 2. scp 上传 release 到服务器临时目录（Windows 下路径用正斜杠或保持原样，scp 可识别）
const releasePath = path.join(root, 'release');
const scpCmd = `scp -r -P ${port}${keyOpt} "${releasePath}" ${user}@${host}:${remoteTmp}`;
run(scpCmd);

// 3. ssh 在服务器上创建目标目录、把文件挪过去并删除临时目录
const sshCmd = `ssh -p ${port}${keyOpt} ${user}@${host} "mkdir -p ${targetPath} && cp -r ${remoteTmp}/* ${targetPath}/ && rm -rf ${remoteTmp}"`;
run(sshCmd);

console.log('\n部署完成。请用浏览器访问你的服务器地址查看网站。');
