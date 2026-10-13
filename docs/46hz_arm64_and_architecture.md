# 46Hz 架构演进与 Arm64 多架构适配实践手册

> 沉淀日期: 2026-10-11  
> 适用版本: 46Hz Letterbox MVP (v0.1.0)  
> 适用架构: Linux (arm64/aarch64, x86_64), macOS (darwin-arm64, darwin-x64), Windows

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
   - **架构解耦与文件单独分离**：
     - `lib/i18n/types.ts`: 独立存放 `Locale`、`TranslationKey`、`Translations` 类型，消除语言字典对英文单文件的倒置依赖。
     - `lib/i18n/config.ts`: 集中管理 `defaultLocale = "ko_KR"` 与语言选项。
     - `lib/i18n/locales/{ko_KR, en_US, zh_CN}.ts`: 独立语言字典包，分别维护中英韩文案。
     - `lib/i18n/index.ts`: 核心国际化调度与回退引擎，并通过 `lib/i18n.ts` 保持 100% 导入兼容。
   - 迁移占位提示统一升级为 `46HZ-XXXX-XXXX`。
3. **Session 与 Cookie 隔离设计**：
   - 匿名用户识别：`46hz_user_id`（向下兼容读取 `eko_user_id`）。
   - 语言偏好：`46hz_locale`（向下兼容读取 `eko_locale`）。
   - 主题偏好：`46hz_theme`（向下兼容读取 `eko_theme`）。
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

## 6. 验证记录与质量保证 (Verification Record)

### 6.1 自动化测试覆盖指标
- **测试框架**：Vitest 4.1.10
- **测试套件总览**：11 个测试文件，62 个单元测试用例，100% 全部通过。
- **覆盖核心领域**：
  1. `tests/arm64/schema-arm64.test.ts`: 静态校验 Prisma Arm64 二进制目标配置与跨平台打包脚本。
  2. `tests/ai/pluggable-ai.test.ts`: 验证多提供商识别（openai, deepseek, mock）、标准请求构造、JSON Markdown 容错提取及异常自动降级。
  3. `tests/reply/claiming.test.ts`: 验证 15 分钟租约时间窗口、并发防抢机制、租约刷新及超时自动解冻。
  4. `tests/admin/rbac.test.ts`: 验证管理员与审核员双角色鉴权、权限矩阵拦截及安全口令校验。
  5. `tests/auth/migration.test.ts`: 验证 46HZ 规范迁移码生成、无易混淆字符及高熵唯一性。
  6. `tests/safety/routing.test.ts`: 验证敏感/高危信件的安全隔离与分流策略。
  7. `tests/moderation/transitions.test.ts`: 验证信件与回信的状态机合法流转。
  8. `tests/preferences/i18n.test.ts` & `theme.test.ts`: 验证多语言与主题配置体系。

### 6.2 常用开发维护指令
```bash
# 运行全部测试
npm run test:run

# 运行 TypeScript 类型静态检查
npm run lint

# 生成本地及目标架构 Prisma 客户端
npm run prisma:generate

# 构建 Next.js 生产产物
npm run build
```
