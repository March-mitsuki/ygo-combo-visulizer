# ⚠️WIP

写来用来帮助我自己科研游戏王展开的时候用的可视化工具。
现在只有基础中的基础功能,很糙。

可以通过构筑和终场形态来管理Combo，每个Combo的每个步骤都能分支出新吃坑对策

其中混了我自己写的一个小框架qupidjs，只完成了20%不到的框架（，qupidjs的源码全部搬过来了，原仓库看我账号里的qupidjs-example，虽然叫example但里面暂时装的源码。

找个有缘人一起写，直接发PR或者有什么讨论的可以发issue。

# How to dev
首选需要在project-root创建一个`config.env.yaml`文件,里面大概写成这样就行

```yaml
server:
  port: 8080
  db:
    provider: sqlite
    url: file:./dev.db

admin:
  baseUrl: http://localhost:8080

web:
  baseUrl: http://localhost:8080
```

然后`pnpm i`安装依赖

然后`pnpm server:migrate --push`来配置开发数据库（sqlite）

然后`pnpm dev:server`启动服务器

然后`pnpm dev:web`启动web服务器

最后还有一个管理数据库的admin studio可以用`pnpm dev:admin`来启动

遇到拉不起来的情况还是发issue就行，我看到就会回复
