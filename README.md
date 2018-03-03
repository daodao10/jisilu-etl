jisilu extracter
====

用于从集思录网站导出数据并分析

---

- 初始化

依赖于 `typescript` 和 `babel-cli`

```
yarn global add typescript babel-cli
yarn
npm run build
```

---

- 测试

依赖于测试框架mocha

```bash
npm test
```

---

- 生成数据 (markdown)

```bash
npm start
```

---

可转换债券 (convertible bond)

```bash
babel-node cb.js > cb.sample.md
```

点击 [cb.sample.md](./cb.sample.md) 查看数据