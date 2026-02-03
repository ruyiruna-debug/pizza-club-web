# Pizza Club 永续 DEX（Orderly 底层）

基于 [Orderly Network](https://orderly.network/) SDK 的永续合约交易页面，黑粉主题。

## 技术方案

- [Orderly 完整版技术方案（SDK/API）](https://docs.google.com/document/d/1Dy1L0WmYsjUVk3ht9B5zee54cWB6wQzkaHpmqJtTO8w/edit?usp=sharing)
- [Orderly 官方文档](https://orderly.network/docs/home)

## 本地运行

```bash
cd dex
npm install
npm run dev
```

浏览器打开 `http://localhost:5173` 即可看到交易页面。

## 构建部署

```bash
npm run build
```

产物在 `dist/` 目录，可将该目录部署到任意静态托管（如与主站同域下的 `/dex/`）。

## 自定义

- **Broker**：若已申请 Orderly Builder，在 `src/App.tsx` 中修改 `OrderlyAppProvider` 的 `brokerId`。
- **主题**：黑粉配色在 `src/theme-orderly.css` 中通过 Orderly 的 CSS 变量覆盖。
