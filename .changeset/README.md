# Changesets

每个会影响使用者的改动都需要一个 changeset，用来决定下一个版本号并生成 CHANGELOG。

```sh
pnpm changeset
```

按提示选择版本类型（patch / minor / major）并填写说明，生成的 Markdown 文件随代码一起提交。合并到 main 后，发布流程见 [CONTRIBUTING.md](../CONTRIBUTING.md#发布)。
