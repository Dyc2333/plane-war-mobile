# 飞机大战手机端 - 部署到 Gitee Pages 指南 🚀

## 准备工作

✅ 已完成：
- 项目已初始化 Git 仓库
- 所有文件已提交
- 已创建 `.gitignore` 文件

## 步骤 1: 在 Gitee 创建仓库

1. **登录 Gitee**
   - 访问 https://gitee.com
   - 使用你的账号登录（如果没有账号先注册）

2. **创建新仓库**
   - 点击右上角的 "+" 图标 → "新建仓库"
   - 仓库名称：`plane-war-mobile` (或你喜欢的名字)
   - 描述：飞机大战游戏 - 移动端适配版本
   - 可见性：公开 (Public)
   - 勾选 "初始化 README" 可以取消
   - 点击 "创建"

3. **复制仓库地址**
   - 创建成功后，复制仓库的 HTTPS 地址
   - 格式类似：`https://gitee.com/你的用户名/plane-war-mobile.git`

## 步骤 2: 推送代码到 Gitee

打开命令行，执行以下命令（按顺序）：

```bash
# 进入项目目录
cd "C:\Users\Administrator\IdeaProjects\claude-workspace\飞机大战手机端"

# 添加远程仓库（将 <你的仓库地址> 替换为实际地址）
git remote add origin https://gitee.com/你的用户名/plane-war-mobile.git

# 推送代码
git push -u origin master
```

**注意**: 首次推送会要求输入 Gitee 账号密码

## 步骤 3: 开启 Gitee Pages

1. **进入仓库设置**
   - 在你的仓库页面，点击 "设置" 标签

2. **找到 Pages 设置**
   - 在左侧菜单找到 "Pages"
   - 或者直接在设置页面搜索 "Pages"

3. **配置 Pages**
   - 源分支：选择 `master`
   - 目录：选择 `/root` (根目录)
   - 点击 "保存"

4. **等待部署**
   - 首次部署需要 1-2 分钟
   - 部署完成后会显示访问地址

## 步骤 4: 访问你的游戏

部署成功后，访问地址格式：
```
https://你的用户名.gitee.io/plane-war-mobile/
```

例如：
```
https://dyc289686387.gitee.io/plane-war-mobile/
```

## 替代方案：GitHub Pages

如果你也想部署到 GitHub（国际访问）：

### 1. 创建 GitHub 仓库
- 访问 https://github.com
- 登录并创建新仓库 `plane-war-mobile`

### 2. 推送代码
```bash
cd "C:\Users\Administrator\IdeaProjects\claude-workspace\飞机大战手机端"
git remote add github https://github.com/你的用户名/plane-war-mobile.git
git push -u github master
```

### 3. 开启 GitHub Pages
- 进入仓库 Settings → Pages
- Source: Deploy from a branch
- Branch: master, /root
- Save

### 4. 访问地址
```
https://你的用户名.github.io/plane-war-mobile/
```

## 更新游戏

当你修改游戏代码后，更新到线上：

```bash
# 进入项目目录
cd "C:\Users\Administrator\IdeaProjects\claude-workspace\飞机大战手机端"

# 添加修改
git add .

# 提交更改
git commit -m "更新描述"

# 推送到 Gitee
git push origin master

# 推送到 GitHub（如果有）
git push origin master
```

大约 1-2 分钟后，线上版本会自动更新！

## 常见问题

### Q1: 推送时提示权限错误？
**A**: 确保输入的 Gitee/GitHub 密码正确。如果使用 SSH，需要先配置 SSH 密钥。

### Q2: Pages 部署失败？
**A**: 检查：
- `index.html` 文件必须在根目录
- 文件名必须是小写 `index.html`
- 查看 Pages 设置中的部署日志

### Q3: 手机上无法访问？
**A**: 确保：
- 电脑和设备在同一网络（本地测试）
- 防火墙允许 8000 端口
- 使用正确的 IP 地址

### Q4: 如何加速国内访问？
**A**: 使用 Gitee Pages，国内访问速度更快

## 分享你的游戏

部署成功后，你可以：
- 📱 分享给朋友在手机浏览器玩
- 🔗 生成二维码分享
- 📢 在社交媒体分享链接
- 🎮 加入收藏夹随时玩

## 项目统计

- 📦 文件大小：约 50KB
- 🎨 技术栈：HTML5 + Canvas + JavaScript
- 📱 支持设备：iOS/Android 手机
- 🌐 托管平台：Gitee Pages / GitHub Pages

---

**祝你部署成功！** 🎉

如有问题，随时问我~
