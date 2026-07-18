import { createAccountAction, signInAction } from "@/app/actions/account";
import { SubmitButton } from "@/components/ui/submit-button";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * @deprecated AccountPage is deprecated in favor of device migration codes.
 */
export default async function AccountPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const [user, locale, params] = await Promise.all([
    getCurrentUser(),
    getLocalePreference(),
    searchParams
  ]);
  const t = createTranslator(locale);
  const isCreateMode = params.mode !== "signin";

  const getDeprecatedHeading = (titleText: string) => {
    switch (locale) {
      case "ko_KR":
        return `${titleText} (지원 중단)`;
      case "zh_CN":
        return `${titleText} (已弃用)`;
      case "en_US":
      default:
        return `${titleText} (Deprecated)`;
    }
  };

  return (
    <section className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      {/* Deprecation Warning Banner */}
      <div className="md:col-span-2 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
        <span className="text-base mt-0.5">⚠️</span>
        <div>
          <h3 className="font-semibold text-sm">
            {locale === "ko_KR" 
              ? "[지원 중단] 이메일/비밀번호 가입 및 로그인" 
              : locale === "zh_CN" 
              ? "[已弃用] 邮箱/密码注册和登录" 
              : "[DEPRECATED] Email/Password Sign-up & Login"}
          </h3>
          <p className="mt-1 text-xs text-warning/85 leading-normal">
            {locale === "ko_KR" 
              ? "이메일 및 비밀번호 계정 기능은 지원이 중단되었습니다. 보안과 프라이버시를 위해, 기기 이전 및 백업은 '설정' 페이지에서 제공되는 '마이그레이션 코드'를 사용해 주십시오." 
              : locale === "zh_CN" 
              ? "邮箱和密码注册系统已被弃用。为了您的隐私与便利，请改用“设置”页面中的“迁移代码”来备份和转移匿名会话。" 
              : "Email and password accounts are deprecated. For your privacy and convenience, please use the \"Migration Code\" in the settings page to backup and transfer your anonymous session."}
          </p>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-semibold">
          {getDeprecatedHeading(t("account.title"))}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {isCreateMode ? t("account.createHelp") : t("account.signInHelp")}
        </p>
        {params.error ? (
          <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {params.error === "exists" ? t("account.errorExists") : t("account.errorInvalid")}
          </p>
        ) : null}
      </div>

      <div className="space-y-5 opacity-70 hover:opacity-100 transition-opacity">
        <form action={createAccountAction} className="rounded-lg border border-border bg-surface p-5 shadow-soft">
          <h2 className="text-lg font-semibold">{getDeprecatedHeading(t("account.create"))}</h2>
          <label className="mt-5 block text-sm font-semibold" htmlFor="create-email">
            {t("account.email")}
          </label>
          <input
            id="create-email"
            name="email"
            type="email"
            required
            disabled
            placeholder="Disabled / 已停用"
            className="mt-2 w-full rounded-lg border border-border bg-muted/20 px-3 py-3 outline-none cursor-not-allowed text-muted-foreground"
          />
          <label className="mt-4 block text-sm font-semibold" htmlFor="create-display-name">
            {t("account.handle")}
          </label>
          <input
            id="create-display-name"
            name="displayName"
            type="text"
            disabled
            defaultValue={user?.anonymousHandle ?? ""}
            className="mt-2 w-full rounded-lg border border-border bg-muted/20 px-3 py-3 outline-none cursor-not-allowed text-muted-foreground"
          />
          <label className="mt-4 block text-sm font-semibold" htmlFor="create-password">
            {t("account.password")}
          </label>
          <input
            id="create-password"
            name="password"
            type="password"
            disabled
            className="mt-2 w-full rounded-lg border border-border bg-muted/20 px-3 py-3 outline-none cursor-not-allowed text-muted-foreground"
          />
          <div className="mt-5">
            <button type="button" disabled className="w-full rounded-lg bg-muted text-muted-foreground px-4 py-2.5 text-sm font-semibold cursor-not-allowed border border-border">
              {getDeprecatedHeading(t("account.create"))}
            </button>
          </div>
        </form>

        <form action={signInAction} className="rounded-lg border border-border bg-surface p-5 shadow-soft">
          <h2 className="text-lg font-semibold">{getDeprecatedHeading(t("account.signIn"))}</h2>
          <label className="mt-5 block text-sm font-semibold" htmlFor="signin-email">
            {t("account.email")}
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            required
            disabled
            placeholder="Disabled / 已停用"
            className="mt-2 w-full rounded-lg border border-border bg-muted/20 px-3 py-3 outline-none cursor-not-allowed text-muted-foreground"
          />
          <label className="mt-4 block text-sm font-semibold" htmlFor="signin-password">
            {t("account.password")}
          </label>
          <input
            id="signin-password"
            name="password"
            type="password"
            disabled
            className="mt-2 w-full rounded-lg border border-border bg-muted/20 px-3 py-3 outline-none cursor-not-allowed text-muted-foreground"
          />
          <div className="mt-5">
            <button type="button" disabled className="w-full rounded-lg bg-muted text-muted-foreground px-4 py-2.5 text-sm font-semibold cursor-not-allowed border border-border">
              {getDeprecatedHeading(t("account.signIn"))}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
