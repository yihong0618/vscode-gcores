# Gcores

> [在 VS Code 中看机核](https://www.gcores.com/articles/119963)

## 说明
**vscode-gcores**是一款在用vscode编写代码之余看机核文章的小项目, 数据来源于机核api, 以及本人随项目更新整理的top-100, 不会对机核网站造成压力, 请大家放心使用, 丝般顺滑. 本插件具备登入功能, 数据保持在vscode本地（已登入用户可以看收藏文章及添加收藏文章或点赞文章）--安装插件后点击类似机核的**G**图标即可使用
![](/docs/vscode_tag.png)

## 运行条件
- [VS Code 1.23.0+](https://code.visualstudio.com/)

## 快速开始

![demo](/docs/demo.gif)

## 功能

### 登入登出

可以左上角第一个点击图标登入 (也可以使用快捷指令)，登入用户可查看自己收藏的文章，可以收藏或点赞文章

![](/docs/登入登出.png)

### 目录结构
![目录结构](/docs/tree.png)
1. 近期的文章
2. 近期的新闻
3. 机核的分类文章
4. 插件作者默认及用户添加的作者相关文章
5. 点赞，收藏，评论TOP100相关文章
6. 用户收藏夹中的文章

### 文章收藏与点赞
1. 可在文章侧边直接点击收藏按钮收藏文章（登入用户）
![](/docs/bookmark1.png)
2. 也可以在文章 webview 中收藏文章
![](/docs/bookmark2.png)

### 随机文章
1. 点击类似机核样式的骰子即可随机看一篇文章, 如果感觉不错，添加作者，加书签，点赞，一气呵成。
![](/docs/random1.png)
![](/docs/random2.png)
2. 同样可以利用快捷指令**Gcores Pick One**随机一篇文章
### 切换 Boss键（隐藏图片）
- 通过点击类似**西蒙眼镜**的图标开启(关闭)boss key如果boss key开启，所有图片将被隐藏，只有点击图片才能查看。
![](/docs/bosskey2.png)
![](/docs/bosskey1.png)


### 通过关键字搜索文章
![](/docs/search_demo.gif)

## 快捷指令
可以按 ctrl（mac command） + shift + p 或 f1 输入下图指令
![快捷指令](/docs/foryou.png)
- 登入登出
- 最近的文章
- 最近的新闻
- 添加作者
- 随机文章
- 删除作者
- 搜索文章

---

## 鸣谢

- 本插件灵感来源于[@jdneo](https://github.com/jdneo)的[vscode-leetcode](https://github.com/jdneo/vscode-leetcode/)开源项目制作。
