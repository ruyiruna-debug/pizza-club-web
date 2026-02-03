# 部署到 Vercel（最简单方式）

不用复杂命令行，用网页完成。

---

## 第 0 步：安装 Git（如果还没装）

- 打开：https://git-scm.com/download/win
- 下载并安装，一路「下一步」即可。
- 装好后**关掉 PowerShell 再重新打开**，然后进入「网页」文件夹：
  ```
  cd C:\Users\Administrator\网页 
  ```

---

## 第一步：把项目推到 GitHub

1. 在 https://github.com 登录，新建一个仓库，名字填 `pizza-club-web`，**不要**勾选「Add README」，点创建。
2. 在「网页」文件夹里打开 PowerShell，**一次只复制下面一行**，粘贴后回车，再复制下一行（不要复制「第 X 行」这几个字）：

   第 1 行：  
   `git init`

   第 2 行：  
   `git add .`

   第 3 行：  
   `git commit -m "first"`

   第 4 行：  
   `git branch -M main`

   第 5 行（把地址换成你自己的仓库地址）：  
   `git remote add origin https://github.com/ruyiruna-debug/pizza-club-web.git`

   第 6 行：  
   `git push -u origin main`

   如果第 6 行让你输入 GitHub 用户名和密码，去 GitHub 网页：Settings → Developer settings → Personal access tokens，新建一个 token，用 token 当密码填进去。

---

## 第二步：在 Vercel 网页里部署

1. 打开：**https://vercel.com/new**
2. 选 **Import Git Repository**，找到 **pizza-club-web**，点右边的 **Import**。
3. **构建设置**（一般不用改）：构建命令为 `npm run pack`，输出目录为 `release`。
4. 点 **Deploy**，等一两分钟，会给你一个地址，就是你的网站。

---

以后改完代码，在「网页」文件夹里打开 PowerShell，**一次一行**执行：

- `git add .`
- `git commit -m "update"`
- `git push`

Vercel 会自动执行 `npm run pack` 并部署 `release/`，无需本地先打包再上传。

**用命令行部署（可选）**：在项目根目录执行 `npm run pack` 完成打包后，执行 `npx vercel --prod`。若出现「linked project does not have id」，可删除项目里的 `.vercel` 文件夹后重试，或直接使用上面的「推送到 GitHub」方式，由 Vercel 自动构建部署。

---

## 如果 Vercel 提示「repository does not contain the requested branch」或「repository is empty」

说明 GitHub 仓库里还没有代码，需要先成功推上去一次。

1. 在「网页」文件夹里打开 PowerShell（确保已安装 Git 并重启过终端）。
2. **一行一行**执行下面命令，每行回车后等执行完再执行下一行：

   ```
   git init
   ```
   ```
   git add .
   ```
   ```
   git commit -m "first"
   ```
   ```
   git branch -M main
   ```
   ```
   git remote add origin https://github.com/ruyiruna-debug/pizza-club-web.git
   ```
   （如果提示「remote origin already exists」，先执行：`git remote remove origin`，再重新执行上面这行。）

   ```
   git push -u origin main
   ```

3. **确认 push 成功**：最后一行应出现类似 `Writing objects: 100% ... done` 和 `branch 'main' -> main`。若报错「Authentication failed」或「Permission denied」，需要到 GitHub 网页：Settings → Developer settings → Personal access tokens，新建一个 token（勾选 repo），用这个 token 当密码再执行一次 `git push -u origin main`。
4. 打开 https://github.com/ruyiruna-debug/pizza-club-web，页面上应能看到 `index.html`、`style.css` 等文件，说明仓库不再为空。
5. 回到 Vercel：https://vercel.com/new，重新 Import 这个仓库，再点 Deploy。
