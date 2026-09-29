# 贡献与验收规范

## 开发流程

1. 每个改动先建立 Issue，写明背景、范围和验收标准。
2. 一个提交只解决一个清晰问题，提交信息说明结果而非操作过程。
3. 修改题目时，必须确保同一题的四个选项处于同一情境和行动层级。
4. 修改职业资料时，必须同时检查正文、画像文件和 4 × 4 映射。
5. 提交前运行 `npm test`，并在 Issue 中记录结果。

## 完成定义

一个任务只有在以下条件全部满足后才算完成：

- 验收标准逐项满足。
- 自动质检通过。
- 手机宽度下完成关键流程检查。
- 源文件与 `dist` 发布目录同步。
- 文案、图片和交互不存在明显缺失。

## 提交信息示例

```text
feat: add complete beastmaster result analysis
fix: balance primary and secondary question counts
test: validate all sixteen career mappings
docs: document scoring model and release process
```

