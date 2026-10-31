# 个人主页维护 / Homepage maintenance

这个主页使用黑色正文、蓝色链接与白色背景，采用纯文字学术排版。导航为 Home、Research、Publications、News。使用原生 HTML、CSS 和 JavaScript，支持中英文、论文搜索、期刊/预印本筛选与手机导航。无需 npm 安装或外部字体、统计服务。

## 修改内容

- `homepage/profile.json`：姓名、邮箱、单位、中英文简介、研究方向与学术链接。
- `homepage/publications.json`：论文数据。`type` 使用 `journal` 或 `preprint`；作者使用数组；年份按正式期刊卷期年填写。
- `homepage/news.json`：学术动态，使用 `publicationDoi` 关联已核实的论文。填写双语日期标签与说明，按日期倒序排列；不添加未经确认的录用、获奖或任职消息。
- `homepage/template.html`：页面结构；中英文本格式为 `{{T:标识|English|中文}}`。
- `assets/homepage/style.css`：配色与布局。
- `assets/homepage/main.js`：语言切换、论文搜索与移动导航。

修改内容后，在仓库根目录运行：

```text
node scripts/build-homepage.mjs
node scripts/build-homepage.mjs --check
node scripts/preview-homepage.mjs
```

预览地址：<http://127.0.0.1:4173>。按 Ctrl+C 结束预览。构建生成的 `index.html` 需要与数据文件一起提交。生成后的页面可直接打开；HTTP 预览更接近实际部署环境。

`?lang=zh` 与 `?lang=en` 可指定初始语言；访客切换语言后会在浏览器本地记住偏好。未启用 JavaScript 时仍可阅读英文简介、全部论文并打开联系方式。

## GitHub Pages

仓库地址：<https://github.com/jiangxu-huang/jiangxu-huang.github.io>。

现有分支为 `acadaemic`（沿用原仓库拼写）。在 GitHub 仓库 **Settings → Pages → Build and deployment** 选择 **Deploy from a branch**、分支 **acadaemic**、目录 **/ (root)**，保存。若已经使用这一设置，无需修改。

提交并推送到该分支后，GitHub Pages 会发布根目录的 `index.html`。正式地址为 <https://jiangxu-huang.github.io/>。本地预览通过不等于远程部署成功，仍需查看 GitHub Pages 构建结果及线上页面。

发布设置依据：[GitHub 官方 Pages 文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

原 Academic Pages 模板源码仍保留在仓库；新的 `_config.yml` 不再输出示例论文、博客、教学、报告和虚构简历。MIT 模板许可证保留。`/about/` 与 `/publications/` 跳转至新主页相应段落。

## 内容来源与待完善

简介、博士身份、HUST、NUS 联培、CSC 支持、公开邮箱与 Google Scholar 来自原仓库的 `_config.yml` 与 `_pages/about.md`。研究成果核对用户提供的 [ResearchGate](https://www.researchgate.net/profile/Jiangxu-Huang)，并优先使用期刊、DOI 与 arXiv 页面。具体来源在每条论文的 `source` 字段中。

页面仅使用文字，不含头像、插图、装饰图或 AI 生成图片。News 列出已核实的论文发表与预印本公开记录，不包含未经确认的消息。

后续可在简介中补充经本人确认的中文姓名、最新职位、教育时间及照片。学院名称使用 2026 年正式论文列出的 School of Mathematics and Statistics；个人职位及联培信息沿用原仓库，后续如有变化请更新。
