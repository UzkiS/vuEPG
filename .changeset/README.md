# Changesets

changeset 用于决定 npm 包的下一个版本号并生成 CHANGELOG。是否需要添加，以 [AGENTS.md 的发布范围规则](../AGENTS.md#提交与发布)为准。

```sh
pnpm changeset
```

按提示选择版本类型（patch / minor / major）并填写说明，生成的 Markdown 文件随代码一起提交。合并到 main 后，发布流程见 [CONTRIBUTING.md](../CONTRIBUTING.md#发布)。
