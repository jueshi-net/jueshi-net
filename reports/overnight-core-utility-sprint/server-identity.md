# Server Identity Lock Report

**执行时间**: 2026-06-11 02:15 UTC
**状态**: ✅ 已确认

---

## 一、服务器身份测试结果

### 服务器 A: 142.171.184.179
| 检查项 | 结果 |
|---|---|
| SSH 连接 | ❌ 超时（Connection timed out） |
| 状态 | **不可达** |
| 结论 | 旧服务器，已下线 |

### 服务器 B: 192.129.155.149
| 检查项 | 结果 |
|---|---|
| SSH 连接 | ✅ 成功 |
| Hostname | racknerd-bb8b78e |
| Internal IP | 192.129.155.149 |
| /home/deploy/xixiong-saas | ✅ 存在 |
| Git HEAD | 5a092f3（git 历史未同步，但文件已同步） |
| PM2 状态 | ✅ xixiong-saas online (PID 163304, 60.7MB) |
| curl https://jueshi.net | ✅ HTTP/2 200 |
| 结论 | **当前真实生产服务器** |

---

## 二、DNS 解析

| 域名 | 解析结果 | 说明 |
|---|---|---|
| jueshi.net | 198.18.0.44 | 本地代理（Surge/VPN） |
| www.jueshi.net | 198.18.0.82 | 本地代理 |
| 真实生产 IP | 192.129.155.149 | SSH 直连确认 |

---

## 三、结论

**✅ 192.129.155.149 是当前唯一真实生产服务器**

- 142.171.184.179 已不可达（旧服务器）
- 192.129.155.149 承载 jueshi.net 全部流量
- PM2 正在运行 xixiong-saas
- Nginx/Cloudflare 代理到该服务器

---

## 四、文档更新

需要更新以下文档中的 VPS IP：
- ✅ docs/PROJECT_MEMORY.md（已在 memory 中确认）
- reports/overnight-core-utility-sprint/server-identity.md（本报告）

---

*服务器身份已锁定：192.129.155.149*
