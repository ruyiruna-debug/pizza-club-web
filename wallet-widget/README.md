# Pizza Club 钱包连接挂件 (RainbowKit)

基于 RainbowKit + Wagmi 的「专业弹窗」钱包连接组件，供主站通过脚本挂载使用。

## 开发

```bash
cd wallet-widget
npm install
npm run dev
```

浏览器打开后只会看到连接按钮，用于调试样式和交互。

## 构建

在**项目根目录**执行：

```bash
npm run build:wallet
```

或在 `wallet-widget` 目录下执行：

```bash
npm install
npm run build
```

构建产物在 `wallet-widget/dist/`：

- `wallet-bundle.js`：主脚本
- `wallet-bundle.css`：样式（含 RainbowKit 默认样式）

主站通过以下方式引用：

- `<link rel="stylesheet" href="wallet-widget/dist/wallet-bundle.css">`
- `<script src="wallet-widget/dist/wallet-bundle.js"></script>`
- 页面中需有 `<div id="wallet-root"></div>` 作为挂载点

## WalletConnect Project ID（必填）

RainbowKit 依赖 WalletConnect 的 `projectId`（扫码、部分钱包连接会用到）。

1. 打开 [WalletConnect Cloud](https://cloud.walletconnect.com/) 注册/登录
2. 新建项目，复制 **Project ID**
3. 在 `wallet-widget` 下新建 `.env`：

```env
VITE_WALLETCONNECT_PROJECT_ID=你的_Project_ID
```

4. 重新执行 `npm run build`（或根目录 `npm run build:wallet`）

未配置时使用占位 ID，部分连接方式可能不可用。

## 技术栈

- React 18
- Vite 5
- Wagmi v2 + Viem v2
- RainbowKit v2
- 支持链：Ethereum Mainnet、Polygon
