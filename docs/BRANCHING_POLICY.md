# Branching Policy — v1.20.42.18.6.6.5

## 代码仓库不分裂

一套 Git 仓库，分支管理版本流向。服务器和 DB 是环境隔离。

## 分支定义

### main — 生产稳定分支
- 对应 jueshi.net (production)
- 只接受已验收 staging 合并
- 不直接开发
- 只由 OPS MODE 发布

### staging — 预发布分支
- 对应 i.jueshi.net (staging)
- 用于用户验收
- 可以从 feature 合并
- DEV MODE 部署目标

### feature/* — 功能开发分支
- 不部署 production
- 可部署 staging 预览
- DEV MODE 操作

### hotfix/* — 生产紧急修复
- 仍需 staging 快速验证
- 仍需备份和 smoke test
- 仍需用户确认

## 合并流向

```
feature/* → staging → main (production)
hotfix/* → staging (快速验证) → main
```

## 规则
- 不得 fork 出长期独立代码库
- main 只接受 PR，不直接 push
- staging 合并到 main 必须有用户确认
- 每次合并到 main 必须更新 deploy-version.json
