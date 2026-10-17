# 46Hz 架构演进与 Arm64 多架构适配实践手册

> 沉淀日期: 2026-10-11 (Updated 2026-10-17)  
> 适用版本: 46Hz Letterbox (v0.2.1)  
> 关联手册: [46Hz UI/UX Design System Manual](./46hz_ui_design_system.md)

---

## 1. 品牌重塑：从 EKO 到 46Hz (Brand Rebranding)

### 1.1 品牌内涵与情绪哲学
- **命名意象**：46Hz 是介于听觉与震颤感知边缘的低频赫兹。在情绪声学中，极低频率的温和共振具有抚平焦虑、锚定心绪的作用；它象征着信件所传递的温暖——无需高声喧哗，而是如 46Hz 的低频脉动一般，在喧嚣的互联网深处为每一个受伤或孤独的心灵提供深沉而坚定的回响。
- **产品核心循环**：
  $$\text{匿名写信} \longrightarrow \text{AI 澄清脱敏} \longrightarrow \text{审核网关} \longrightarrow \text{同伴认领回信} \longrightarrow \text{AI 润色} \longrightarrow \text{二次审核} \longrightarrow \text{投递反馈}$$

### 1.2 全链路标识与持久化迁移清单
1. **前端与应用壳层**：
   - 全局 Header Logo 从 `E / EKO` 升级为 `46 / 46Hz`。
   - 根布局元数据标题更新为 `46Hz Letterbox`。
   - 服务健康探测端点 `/api/health` 标识为 `46hz-letterbox`。
2. **多语言国际化 (i18n) 模块分离与韩语默认化**：
   - **默认语言**：系统默认语言全局设定为韩语 (`ko_KR`)。
   - **彻底解耦合设计（内容与引擎物理隔离）**：
     - `locales/{ko_KR, en_US, zh_CN}.ts`: 纯粹的语言数据字典包，完全独立于业务代码库。
     - `locales/index.ts`: 语言包聚合与类型安全绑定。
     - `lib/i18n/types.ts`: 独立存放 `Locale`、`TranslationKey`、`Translations` 契约类型。
     - `lib/i18n/config.ts`: 集中管理 `defaultLocale = "ko_KR"` 与语言选项。
     - `lib/i18n/index.ts`: 纯粹的国际化调度与回退引擎，内部无任何语言文件。
     - `lib/i18n.ts`: 统一对外平滑转发。
   - 迁移占位提示统一升级为 `46HZ-XXXX-XXXX`。
3. **Session 与 Cookie 隔离设计**：
   - 匿名用户识别：`46hz_user_id`。
   - 语言偏好：`46hz_locale`。
   - 主题偏好：`46hz_theme`。
   - 管理员身份：`46hz_admin_role`（存储 `ADMIN` 或 `MODERATOR`）。
   - 设备间匿名迁移码：采用 Crockford Base32 变体（排除 `0, 1, I, O` 易混淆字符），前缀升级为 `46HZ-`（形如 `46HZ-XXXX-XXXX`）。

---

## 2. 并发回信冲突控制：物理信箱守护机制 (Human-Centered Letter Holding Protocol)

### 2.1 业务痛点与防 Shadowban 心理学设计
在早期设计中，若直接使用“预占 (Claim)”、“锁定 (Locked)”、“15 分钟租约 (15-min Lease)”以及警告色（Amber/Warning）提示，用户极易误解为**账号被系统风控、隐式降权或 Shadowban**。

为了消除这种冰冷的算法规制感，46Hz 将底层并发控制完全转译为温情的**物理慢信箱隐喻**：
- **对于其他来访同伴**：不再显示“已被锁定/预占”，而是温馨提示：“*另一位同伴正在用心写信中——为了让写信人获得专注、不被重复打扰的倾听，这封信已由 TA 暂时取下。TA 正在静心撰写，若 15 分钟内离开，信件会重新回到信箱。*”
- **对于正在书写的同伴**：不再显示“拥有 15 分钟独占租约”，而是提示：“*静心书写中 · 为您守护 15 分钟专注时间*”，并提供醒目的“*放回信箱（留给其他同伴）*”主动让出通道。
- **视觉去警告化**：抛弃刺眼的琥珀色警示框，全面采用温润的中性卡片背景 (`bg-surface`) 与静谧的羽毛笔/信件图标 (`PenLine`)。

### 2.2 底层守护协议 (Holding Protocol)
我们在 `lib/reply/claiming.ts` 中基于已有的 `Match` 模型实现了一套轻量级、无外部 Redis 依赖的时间窗口守护机制：

```text
[同伴进入 /reply 信件池]
        │
        ▼
[过滤正由他人守护中或已有回复的信件] ──> matches.none(status == OFFERED && createdAt >= now - 15m)
        │
        ▼
[同伴点击打开 /reply/[letterId]]
        │
        ▼
[执行 claimLetterForReply(letterId, userId)]
        │
        ├── 正在由他人守护 (15分钟内) ──> 温暖提示 "另一位同伴正在用心写信中"，引导浏览其他信件
        │
        └── 未被守护 / 对方超时离开
                │
                ▼
        [创建/刷新 Match: status=OFFERED, createdAt=now] ──> 享有 15 分钟安静书写保护
                │
                ▼
        [同伴提交回复 submitReplyAction]
                │
                ├── 校验守护有效性与防重复提交
                │
                ▼
        [事务: 创建 Reply(PENDING), 更新 Match(RESPONDED), 记录 ModerationEvent]
```

### 2.3 状态机与边界条件
- **守护窗口时长**：`CLAIM_LEASE_MINUTES = 15`（900 秒）。
- **状态转移**：
  - `OFFERED`（且 $T_{\text{now}} - T_{\text{create}} < 15\text{min}$）：守护撰写中。
  - `OFFERED`（且 $T_{\text{now}} - T_{\text{create}} \ge 15\text{min}$）：已超时，信件自动回归公共信箱，对后续同伴开放，旧记录标记为 `EXPIRED`。
  - `RESPONDED`：回复已提交，终态。
  - `SKIPPED`：主动放回信箱（点击 UI 的“放回信箱”按钮触发 `releaseReplyClaimAction`），立即释放守护，无需等待 15 分钟自然过期。
- **防止重复回信**：在 `coachReplyAction` 与 `submitReplyAction` 双重拦截同位用户对同一信件的重复提交，同时在 `/reply/[letterId]` 渲染专门的“已送出回信”感谢卡片。
- **纯函数可测性**：抽离 `isClaimExpired`、`isMatchActiveClaim`、`calculateRemainingLeaseSeconds` 纯函数，确保毫秒级边界判断在 Vitest 单元测试中 100% 覆盖。

---

## 3. 生产级多提供商 LLM 可拔插架构 (Pluggable AI Architecture)

### 3.1 抽象层接口设计 (`lib/ai/middleware.ts`)
46Hz 业务逻辑（Server Actions、API 路由）不直接绑定任何特定的 LLM SDK，而是依赖 `AiMiddleware` 纯接口：
- `processLetter(input)`: 澄清并脱敏信件内容，输出结构化情感标签、情境标签与期望回复类型。
- `coachReply(input)`: 检查同伴回复的语气倾向（避免评判、过度建议、反客为主），指导生成温和回复。
- `classifyRisk(input)`: 4 级风险内容分类与危机分流判定。
- `anonymize(input)`: PII 隐私信息（手机、邮箱、全名、地点）检测与脱敏。

### 3.2 多模型适配器 (`lib/ai/llm.ts`)
通过统一的 OpenAI Chat Completions API 协议，封装 `LlmAiMiddleware`，实现多厂商一键拔插：

| 提供商 | `AI_PROVIDER` | 默认 Base URL | 默认 Model | 认证 Header |
| :--- | :--- | :--- | :--- | :--- |
| **OpenAI** | `openai` | `https://api.openai.com/v1` | `gpt-4o-mini` | `Bearer ${OPENAI_API_KEY}` |
| **DeepSeek** | `deepseek` | `https://api.deepseek.com/v1` | `deepseek-chat` | `Bearer ${DEEPSEEK_API_KEY}` |
| **自定义兼容端点** | `custom` | `process.env.AI_BASE_URL` | `process.env.AI_MODEL` | `Bearer ${AI_API_KEY}` |
| **Mock** | `mock` | N/A (本地规则与词典) | Deterministic | 无需鉴权 |

### 3.3 零停机优雅降级与防御性容错 (Graceful Degradation & Resilience)
外部大模型常面临网络抖动、提供商宕机、429 Rate Limit、输出非法格式等不可控因素：
1. **推理思维链清洗**：针对 DeepSeek R1 / 推理模型输出的 `<think>...</think>` 思维链标签进行自动剥离，防止污染 JSON 解析。
2. **枚举安全归一化**：自动将模型返回的大小写不一致（如 `"normal"`、`"comfort"`）清洗归一化为 Prisma 强类型枚举，杜绝数据库类型崩溃。
3. **最外层 JSON 容错提取**：支持 Markdown 代码块包裹与前后自由文本混杂场景的健壮匹配。
- **双保险策略**：`LlmAiMiddleware` 内部持有 `MockAiMiddleware` 实例。
- **降级触发条件**：
  1. 对应提供商未配置 API Key（`isConfigured === false`）。
  2. 网络请求超时（默认 10 秒超时控制）。
  3. HTTP 错误响应（5xx、429 等）或 JSON 解析彻底失败。
- **结果保证**：在任何故障场景下，系统均在后端控制台记录告警日志并自动降级为规则处理，确保前端用户写信、审信、回信主流程绝不白屏或崩溃。

---

## 4. 细粒度 RBAC 权限与分级审核机制 (Granular Admin & Moderator RBAC)

### 4.1 角色定义与权限矩阵
为适应社区规模化后的分工需求，46Hz 将后台管理权限细化为两级角色：

| 权限范围 | 系统管理员 (ADMIN) | 专职内容审核员 (MODERATOR) |
| :--- | :---: | :---: |
| **指标看板** (`/admin`) | ✅ 访问与统计 | ✅ 访问与统计 |
| **信件审核与初审** (`/admin/letters`) | ✅ 审核通过/驳回 | ✅ 审核通过/驳回 |
| **信件风险覆写** (`/admin/letters/[id]`) | ✅ 覆写风险级别 | ✅ 覆写风险级别 |
| **回信审核与复审** (`/admin/replies`) | ✅ 审核通过/驳回 | ✅ 审核通过/驳回 |
| **举报与反馈查看** (`/admin/reports`) | ✅ 查看全量举报 | ✅ 查看全量举报 |
| **全量审计日志** (`/admin/moderation-log`) | ✅ 查看操作流水 | ✅ 查看操作流水 |
| **用户封禁与惩戒** (`/admin/users`) | ✅ 可执行封禁 | ❌ 仅限管理员（UI展示权限提示） |
| **危机支持资源配置** (`/admin/resources`) | ✅ 增删查改 | ❌ 仅限管理员（UI展示权限提示） |

### 4.2 认证与操作审计追踪
- **独立口令分发**：
  - `ADMIN_PASSCODE`（默认 `local-admin`）登录赋予 `ADMIN` 权限。
  - `MODERATOR_PASSCODE`（默认 `local-moderator`）登录赋予 `MODERATOR` 权限。
- **审计流水增强**：在所有审核操作写入 `ModerationEvent` 时，动作标识自动区分为 `ADMIN_MODERATED` 与 `MODERATOR_MODERATED`，确保操作责任链清晰可溯。

---

## 5. Arm64 / AArch64 架构跨平台适配与踩坑实践 (Multi-Arch Arm64 Adaptation Guide)

在 Apple Silicon (M-series)、AWS Graviton (t4g/c7g)、Oracle Ampere 以及搭载 ARM64 Linux 的边缘节点或服务器上运行现代 Node.js/Prisma 应用时，最常遇到的兼容性壁垒在于底层 C/C++ 预编译二进制模块。

### 5.1 Prisma Engine 二进制适配核心
在 `prisma/schema.prisma` 中：
```prisma
generator client {
  provider      = "prisma-client-js"
  engineType    = "binary"
  binaryTargets = ["native", "linux-arm64-openssl-3.0.x", "linux-arm64-openssl-1.1.x", "linux-musl-arm64-openssl-3.0.x", "darwin-arm64"]
}
```

#### 常见踩坑与对策：
1. **错误**：`PrismaClientInitializationError: Query engine binary for current platform "linux-arm64-openssl-3.0.x" could not be found.`
   - **成因**：默认配置下，Prisma 仅拉取当前执行构建宿主机（如 macOS 或 x86 容器）的二进制。当将构建产物打包并在基于 Ubuntu 22.04+ 或 Debian Bookworm 的 ARM64 生产镜像中启动时，因缺少 `linux-arm64-openssl-3.0.x` 引发崩溃。
   - **对策**：显式指定 `linux-arm64-openssl-3.0.x`。
2. **Alpine Linux (musl libc) 陷阱**：
   - Alpine 使用 `musl` 而非 `glibc`。若基础镜像为 `node:alpine` 且部署于 ARM64，Prisma 依赖的目标二进制为 `linux-musl-arm64-openssl-3.0.x`。缺失时会导致 `ENOENT`。
   - **对策**：在 `binaryTargets` 中追加 `linux-musl-arm64-openssl-3.0.x`，或选用标准 glibc 镜像 `node:20-bookworm-slim`。
3. **OpenSSL 依赖版本**：
   - Node 20+ 的 Linux 镜像默认预装 OpenSSL 3.0，而旧版或某些嵌入式环境可能仅有 OpenSSL 1.1。同时声明 `openssl-3.0.x` 与 `openssl-1.1.x` 可保证在不同 Linux 发行版基座间无缝迁移。

### 5.2 生产级多架构 Dockerfile 标准实践
我们为 46Hz 创建了针对跨架构编译优化的 `Dockerfile`：
- 基于 `node:20-bookworm-slim`，使用多阶段构建（dependencies $\rightarrow$ builder $\rightarrow$ runner）。
- 在构建阶段强制执行 `npx prisma generate`，为所有目标架构生成适配绑定。
- 剥离 devDependencies，以非 root 用户 `nextjs (1001:1001)` 运行容器。

#### 多架构编译命令示例：
```bash
# 启用 Buildx 支持
docker buildx create --use

# 一键跨架构并发编译并推送镜像
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t your-registry/46hz-letterbox:latest \
  --push .
```

---

## 6. 舒曼共鸣 7 次谐波与深度扩容机制 (46Hz Schumann Resonance Harmonic Reply Cap)

### 6.1 科学物理渊源与品牌调性
- **物理学本源**：
  地球电离层与地表构成的空腔谐振波——**舒曼共鸣（Schumann Resonance）**，其基频约为 $7.83\text{ Hz}$。
  当计算其各阶自然高次谐波时：
  - 1阶谐波: $\approx 7.83\text{ Hz}$
  - 2阶谐波: $\approx 14.3\text{ Hz}$
  - 3阶谐波: $\approx 20.8\text{ Hz}$
  - 4阶谐波: $\approx 27.3\text{ Hz}$
  - 5阶谐波: $\approx 33.8\text{ Hz}$
  - 6阶谐波: $\approx 39.0\text{ Hz}$
  - **7阶谐波: $\approx 45.3 - 46.0\text{ Hz}$** $\longrightarrow$ **这正是 46Hz 品牌命名的科学物理本源！**

### 6.2 产品情绪哲学与容量控制
- **默认 7 次谐波保护 (The 7 Harmonic Resonances)**：
  在快节奏与噪音充斥的互联网环境中，信件极易被海量琐碎评论淹没。为了保护写信人的内心平静，避免信息与情绪过载（Anti-Overwhelm），系统每封信件**默认限定最多接收 7 封回信**。
  7 次回信对应地球自然脉动的 7 次谐振，让写信人能够静心、郑重地阅读每一封真诚的回音。
- **作者明确知情与自主扩容 (Conscious Opt-in Expansion up to 15)**：
  当写信人准备好接纳更多关怀、希望听到更多同伴的共鸣时，写信人可以在自己的信件详情页明确点击：
  `"더 깊은 공명 열기 (최대 15개로 확장)"` / `"开启更深共鸣（扩展至15次回响）"`。
  系统通过服务端原子事务 `expandLetterResonanceAction` 将该信件的 `maxReplies` 提升至 15。
- **系统性能与并发检索优化 (System Optimization)**：
  1. **复合索引加速**：在 `prisma/schema.prisma` 中为 `Letter` 配置 `@@index([status, riskLevel, maxReplies, createdAt])`，让公共回信池的高频分页检索走覆益索引。
  2. **回信池容量实时剪裁**：在 `findAvailableReplyLetters` 中通过 Prisma `_count: { select: { replies: { where: { status: { not: "REJECTED" } } } } }` 统计有效回信数，将达到或超出共鸣上限的信件即时过滤出公共池。
  3. **机会性超时锁自动回收 (Stale Lock Auto-Purge)**：在查询公共池时自动异步批量清理超过 15 分钟的废弃 `OFFERED` 预占锁（更新为 `EXPIRED`），无需常驻 Cron 轮询。
  4. **完结状态温情转译**：当信件达到容量上限后，若同伴直接访问 `/reply/[letterId]`，系统优雅呈现“共鸣已圆满”的温润界面（`RESONANCE_LIMIT_REACHED`），引导同伴浏览其他需要陪伴的心事。

---

## 7. 极简主义技术栈精简与深度安全无障碍加固 (Minimalism, Security & Barrier-Free)

### 7.1 极简主义技术栈瘦身 (Zero-Dependency Engineering)
- **剔除 `clsx` 微依赖**：在 `lib/utils.ts` 中以纯原生 TypeScript（约 30 行递归）实现 `cn` 类名合并工具，天然兼容字符串、数字、条件布尔、嵌套数组及属性对象，零运行时外部依赖。
- **剔除 `autoprefixer`**：Tailwind CSS v4 内部已深度集成高性能 Rust/Lightning CSS 引擎，自动处理浏览器厂商前缀，无需额外的 PostCSS 插件开销。
- **依赖纯粹度提升**：核心运行时仅保留 Next.js 16、React 19、Prisma 7、pg 原生驱动池、Zod 及 Lucide 图标集，构建极其轻量高效。

### 7.2 多层级安全加固 (Multi-Tier Security Hardening)
1. **全面生产级 HTTP 安全响应头**：
   在 `next.config.mjs` 中全局注册现代安全防线：
   - `Content-Security-Policy (CSP)`：严格限制来源域与脚本加载，阻断跨站脚本注入。
   - `X-Frame-Options: DENY`：阻止页面被嵌入 iframe，防御点击劫持 (Clickjacking)。
   - `X-Content-Type-Options: nosniff`：禁止浏览器对响应体执行 MIME 类型嗅探。
   - `Referrer-Policy: strict-origin-when-cross-origin`：保护跨域访问时的隐私来源。
   - `Permissions-Policy`：全面禁用相机、麦克风、地理定位等无用硬件权限。
   - `Strict-Transport-Security (HSTS)`：强制长期全量 HTTPS 传输。
2. **防计时攻击的管理员凭证认证 (Timing-Safe Passcode Verification)**：
   - 使用 Node.js 原生 `crypto.timingSafeEqual`。
   - 比较前通过 SHA-256 计算固定 32 字节哈希摘要，既标准化了任意长度的输入，又完全消除了基于比对耗时推断密码字符的侧信道时序攻击风险。
3. **内存滑动窗口防爆破限流器 (`lib/safety/rate-limit.ts`)**：
   - 纯原生内存滑动窗口算法，自动剔除过期时间戳。
   - 对后台登录尝试实施 IP 级限流（5 分钟内最多 5 次），防止暴力撞库；同时保护信件发布与 AI 润色高成本接口免受恶意洪泛。

### 7.3 无障碍与障壁清扫设计 (Barrier-Free for TalkBack / VoiceOver / Narrator)
为了确保 Android TalkBack、iOS/macOS 旁白 (VoiceOver) 以及 Windows 讲述人 (Narrator) 能无障碍流畅使用 46Hz：
- **跳过至主要内容链接 (Skip to Content)**：页面首个可聚焦元素为屏幕阅读器专用的快速跳过链接，支持 Tab 键呼出并瞬时定位至 `<main id="main-content">`。
- **无障碍地标角色 (Landmark Roles)**：
  - `<header role="banner">`
  - `<nav aria-label="Main Navigation">`
  - `<main id="main-content" role="main">`
- **触控区域达标 (KWCAG 2.2 / WCAG 2.2 Level AA)**：所有导航图标与操作按钮的有效交互区域均确保在 `min-h-[44px] min-w-[44px]` 以上，大幅改善移动端及视障手势交互体验。
- **动态状态实时朗读 (ARIA Live Regions)**：
  - 舒曼共振计数器配置 `role="progressbar"`，提供精确的 `aria-valuenow`、`aria-valuemax` 与 `aria-valuetext`，并在状态变化时通过 `aria-live="polite"` 友好通知。
  - 表单提交按钮在挂起时挂载 `aria-busy="true"` 并提供隐藏提示 `<span className="sr-only">Processing...</span>`。
  - 表单校验错误通过 `role="alert"` 与 `aria-live="assertive"` 触发即时告警。

### 7.4 后端管理合规与执法数据最小化收集 (Law Enforcement Data Minimization Principle)
在遵循 GDPR 最小化原则（Art 5(1)(c) Data Minimisation）与隐私保护的同时，平台确立了面向司法调证与紧急生命安全干预的法定底线：
1. **绝对零 PII 承诺 (Zero-PII Architecture)**：
   - 系统数据库中自始至终**不记录**任何真实姓名、手机号、电子邮箱、登录密码、精准 GPS 坐标或设备硬件序列号。用户在平台内仅以去标识化的随机代号 (`anonymousHandle`) 存在。
2. **14 天动态保留周期与自动剪裁 (14-Day Rolling Horizon)**：
   - 连接 IP 记录严格限制为最多 5 条最新动态队列，并在每次更新时自动执行 `pruneExpiredIps`，超过 14 天的历史记录无条件从数据库中物理裁剪。
3. **日常运维内部遮罩脱敏 (`maskIp`)**：
   - 管理员与审核员在日常监控面板中仅能看到脱敏后的网段（如 `192.168.***.***` 或 `2001:0db8:****:****`），防止内部工作人员窥探用户网络环境。
4. **防篡改加密合规凭证包 (`generateIncidentPacket` & `/admin/compliance`)**：
   - 当收到法定调证函或处理高危自伤/违法涉案内容时，系统通过 `/admin/compliance` 一键生成标准化证据数据包（`ComplianceIncidentPacket`）。
   - 数据包内对违规文本生成 SHA-256 密码学指纹，完整封存事件发生时刻的 UTC 时间戳、内容风险分类、审核处置历史责任链以及最小必要网络源点，形成不可抵赖的法庭证据链。

### 7.5 客户端 User Agent 信息收集与统一根配置设计
1. **浏览器 User Agent 信息收集与纯原生解析**：
   - 在 [`lib/ip.ts`](../lib/ip.ts) 中增加 `getClientUserAgent` 与轻量无外部依赖的 `parseUserAgent` 解析器，智能识别浏览器名称（Chrome, Safari, Firefox, Edge 等）、操作系统（Windows, macOS, iOS, Android, Linux）以及设备类型（Mobile, Tablet, Desktop, Bot）。
   - 随 IP 连接记录一并写入 `User.recentIps` 队列（通过 PostgreSQL 原生 JSONB 兼容扩展，无破坏性变更），并在 [`ComplianceIncidentPacket`](../lib/compliance/incident-packet.ts) 和后台合规审查面板中清晰关联呈递。
2. **全局统一设置中心 (`settings.ts`)**：
   - 在根目录下建立专有的单一真实配置源文件 [`settings.ts`](../settings.ts)，收敛全局所有参数：
     - **品牌元数据** (`brand`)：产品名、全称标题、标语。
     - **国际化引擎** (`i18n`)：默认语言 (`ko_KR`)、支持语言清单、语言标签。
     - **主题配置** (`theme`)：默认主题 (`system`)、支持模式及标签。
     - **会话持久化** (`session`)：Cookie 名称、180 天过期时效、迁移码前缀 (`46HZ-`) 与 Base32 字符集。
     - **权限管理** (`admin`)：角色 Cookie 名称、默认管理员/审核员密码。
     - **舒曼共振** (`resonance`)：默认 7 次上限、作者同意扩容 15 次。
     - **并发守护** (`claiming`)：15 分钟静心撰写独占保留窗口。
     - **安全限流** (`security`)：后台登录防爆破阈值与写信频率限制。
     - **合规审计** (`compliance`)：14 天滚动保留、最多 5 条记录、合规协议代号。
     - **模型适配** (`ai`)：默认服务商与超时机制。
   - 所有业务模块（`lib/session.ts`, `lib/preferences.ts`, `lib/admin.ts`, `lib/ip.ts`, `lib/reply/claiming.ts`, `lib/compliance/incident-packet.ts`, `app/layout.tsx` 等）统一从 `@/settings` 引用，彻底杜绝硬编码参数散落。
3. **根目录冗余无用文件彻底清理 (Root Directory Purge)**：
   - 物理移除 `tailwind.config.ts`：由于 Tailwind CSS v4 已全面转向 CSS 内 `@theme` 配置，根目录遗留的 Tailwind 3 配置文件已毫无作用。
   - 物理移除 `start.bat`：统一收敛为原生功能更完备的 PowerShell 启动编排脚本 `start.ps1`。
   - 配置 `tsconfig.json` 的 `tsBuildInfoFile: ".next/cache/tsconfig.tsbuildinfo"` 并清理根目录 `tsconfig.tsbuildinfo` 缓存文件，消除构建临时文件对项目根目录的污染。

---

## 8. 验证记录与质量保证 (Verification Record)

### 8.1 自动化测试覆盖指标
- **测试框架**：Vitest 5.0.4
- **测试套件总览**：17 个测试文件，109 个单元与集成测试用例，100% 全部通过。
- **全链路测试涵盖**：
  - `tests/client/user-agent.test.ts`: 浏览器 User Agent 深度提取、多平台与设备类型解析实测。
  - `tests/settings/settings.test.ts`: 根目录统一配置文件 `settings.ts` 各维度配置契约断言。
  - `tests/ip.test.ts`: IP 队列与 User Agent 协同持久化与 14 天裁剪验证。
  - `tests/utils/cn.test.ts`: 原生极简 `cn` 工具的条件合并与嵌套数组覆盖。
  - `tests/security/security.test.ts`: 常数时间比对算法与滑动窗口限流器全场景实测。
  - `tests/compliance/compliance.test.ts`: SHA-256 证据包哈希、IP 隐私遮罩与 14 天自动物理剪裁。
  - `tests/reply/resonance.test.ts`: 舒曼共振 7 次与 15 次流转逻辑。
  - `tests/reply/claiming.test.ts`: 15 分钟回信独占守护协议。
  - `scripts/verify_backend.ts`: PostgreSQL 7 阶段全链路数据库实测全部通过。

### 8.2 常用开发维护指令
```bash
# 运行全部单元与集成测试 (128 tests)
npm run test:run

# 运行全链路后端与数据库完整性实测 (7단계 파이프라인)
npm run verify:backend

# 运行 Prisma 8 RC 数据契约构建 (Contract Emit)
npm run prisma8:contract

# 运行 TypeScript 类型静态检查
npm run lint

# 构建 Next.js 生产产物 (Prisma 7 Client + Standalone Output)
npm run build
```

---

## 9. 차세대 기술 스택 진화 및 보안 심층 강화 (Next-Gen Stack & Security Hardening)

### 9.1 Node.js 26 런타임 및 멀티 아키텍처 지원
- **도커 베이스 이미지**: `Dockerfile`의 베이스 이미지를 최신 **`node:26-bookworm-slim`**으로 승격.
- **아키텍처 대응**: `linux/amd64` 및 `linux/arm64` (Apple Silicon, AWS Graviton, Raspberry Pi) 환경에서 원활한 빌드 및 가벼운 독립 실행(Standalone) 보장.
- **엔진 선언**: `package.json`의 `engines`에 Node.js 26 지원을 명시(`^24.0.0 || >=26.0.0`).

### 9.2 Prisma 8 RC & Prisma 7 병렬 운용 아키텍처 (Side-by-Side Operation)
- **배경**: Prisma 8 RC는 기존 모놀리식 스키마 방식에서 탈피하여, 에이전트 친화적인 **PSL 데이터 계약(Data Contract)** 및 확장 모듈 분리(`@prisma/orm-postgres`)로 전면 개편되었습니다.
- **병렬 아키텍처 설계**:
  1. **Prisma 8 RC 계약 관리**:
     - `prisma/contract.prisma`: `// use prisma-8` 헤더 및 최신 PSL 명세 준수.
     - `prisma8.config.ts`: `@prisma/cli-engine`의 `definePrismaConfig` 및 `@prisma/orm-postgres/config`의 `defineConfig`와 `prisma7Schema` 브릿지를 연결.
     - `npm run prisma8:contract`: `prisma contract emit` 명령을 통해 `contract.json` 및 `contract.d.ts` 아티팩트 자동 생성.
  2. **Prisma 7 런타임 호환 엔진 (`@prisma/prisma7`)**:
     - 기존 비즈니스 로직(Server Actions, Seed, Database Client)의 안정적 구동을 위해 `@prisma/prisma7`을 네임스페이스 격리 설치.
     - `prisma7.config.ts`를 통해 기존 Prisma 클라이언트를 오차 없이 생성(`prisma7 generate`).

### 9.3 PostgreSQL 19 Beta 컨테이너 오케스트레이션
- **도커 이미지 승격**: `docker-compose.yml` 및 `start.ps1`의 데이터베이스 이미지를 **`postgres:19beta4-alpine3.24`**로 업그레이드.
- **헬스체크 및 의존성 제어**: `pg_isready`를 통한 컨테이너 헬스체크 및 애플리케이션 서비스의 `condition: service_healthy` 보장.

### 9.4 심층 보안 강화 (Defense-in-Depth Security Hardening)
1. **CSP (Content-Security-Policy) 추가 제약**:
   - `base-uri 'self'`: `<base>` 태그 변조를 통한 스크립트/리소스 기준 주소 하이재킹 차단.
   - `form-action 'self'`: 악성 외부 엔드포인트로의 폼 데이터 전송 차단.
   - `object-src 'none'`: 플래시 및 플러그인 기반 임베드 벡터 차단.
   - `X-Permitted-Cross-Domain-Policies: none`: 플래시/실버라이트 정책 파일 로드 차단.
2. **관리자 쿠키 엄격 모드 적용 (`sameSite: "strict"`)**:
   - 관리자 및 중재자 세션 쿠키(`46hz_admin_role`, `46hz_admin`)의 `sameSite` 설정을 `"lax"`에서 **`"strict"`**로 격상하여 외부 유입 링크를 통한 CSRF 공격을 원천 무력화.
3. **컨테이너 최소 권한 원칙 (Principle of Least Privilege)**:
   - `Dockerfile` 내 non-root 사용자(`nextjs:nodejs`, UID/GID 1001) 권한으로만 서버 프로세스를 구동하여 컨테이너 탈출 및 호스트 권한 탈취 방지.

