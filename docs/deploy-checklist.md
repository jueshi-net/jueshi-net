# Deploy Checklist — 海外百宝箱

## 预发布检查

- [ ] `npx tsc --noEmit` 通过，0 errors
- [ ] `npx next build` 通过，0 errors / 0 warnings（SSL 警告除外）
- [ ] `npx prisma generate` 通过
- [ ] 所有环境变量已在生产环境配置

## 数据库

- [ ] 确认 `DATABASE_URL` 指向生产库（非开发库）
- [ ] 使用 `npx prisma migrate deploy` 部署迁移（非 `db push`）
- [ ] EventLog 表已创建（Phase 2B 新增）
- [ ] 生产数据库有定期备份

## 匿名统计埋点 /api/events

- [ ] 设置 `ADMIN_SECRET` 环境变量（用于 /api/events/stats 访问控制）
- [ ] 生产环境 /api/events/stats 不公开访问
- [ ] 接入 Redis / Vercel KV 做分布式防刷限流（当前为内存级限流，仅单实例有效）
- [ ] EventLog 数据定期清理（建议 180 天）
- [ ] 确认不保存任何用户输入内容（单号、地址、查询词等）

## 安全

- [ ] `EXCHANGE_RATE_API_KEY` 仅服务端使用（无 `NEXT_PUBLIC_` 前缀）
- [ ] NextAuth 密钥已配置
- [ ] CORS 配置正确
- [ ] 所有外部链接使用 `rel="noopener noreferrer"`

## 性能

- [ ] Turbopack 开发冷启动 < 10s
- [ ] 静态页面生成数量合理（< 200 页面）
- [ ] 图片已优化（使用 next/image 或 CDN）
- [ ] Sitemap 已清理废弃路由

## 内容

- [ ] 所有工具页有免责声明
- [ ] 汇率文案为"参考汇率"，非"实时汇率"
- [ ] HS 编码口径为"候选/参考"，非"最终归类"
- [ ] 无"保通关"、"包税"、"官方承运"等违规表述

## Phase 2B 新增检查

- [ ] FAQ 组件在所有工具页正常渲染（手风琴交互）
- [ ] 首页热门工具快捷入口 6 个
- [ ] 埋点 sendBeacon 在浏览器中正常发送（不阻塞用户操作）
- [ ] EventLog 数据可查询（/api/events/stats，需 ADMIN_SECRET）
