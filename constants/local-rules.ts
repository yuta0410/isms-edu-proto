/**
 * 社内規定（ローカルルール）プロファイル。
 *
 * コンサルタントが顧客企業の「社内規定PDF」を読み込ませると、AIが一般論（IPA基準）
 * に各社固有のルールをハイブリッドで上書き適用する——その挙動をプロトタイプ用に
 * 静的データで再現する。実運用では PDF をチャンク化・埋め込みして RAG で抽出する。
 */

export interface LocalRule {
  /** ルールのカテゴリ名（例：パスワード） */
  label: string;
  /** 抽出された規定値（例：12文字以上を必須） */
  value: string;
  /** このルールを発火させるスライド本文中のキーワード */
  match: string[];
  /** スライド内に表示する強調ハイライト文 */
  highlight: string;
}

export interface PolicyProfile {
  id: string;
  file_name: string;
  company: string;
  rules: LocalRule[];
}

export const POLICY_PROFILES: Record<string, PolicyProfile> = {
  d: {
    id: "d",
    file_name: "D社：厳格セキュリティ規定.pdf",
    company: "D社",
    rules: [
      {
        label: "パスワード",
        value: "12文字以上を必須",
        match: ["パスワード", "認証情報"],
        highlight:
          "🚨 当社のルール：パスワードは【12文字以上】が必須です（社内規定第4条より）",
      },
      {
        label: "USBメモリ",
        value: "原則社内持ち込み禁止",
        match: ["USB", "外部媒体", "記録媒体", "持ち出し", "持ち込み"],
        highlight:
          "🚨 当社のルール：USBメモリは【原則社内持ち込み禁止】です（社内規定より）",
      },
      {
        label: "リモートワーク",
        value: "事前申請制",
        match: ["リモート", "在宅", "テレワーク"],
        highlight: "🚨 当社のルール：リモートワークは【事前申請制】です",
      },
    ],
  },
  e: {
    id: "e",
    file_name: "E社：リモートワーク重視規定.pdf",
    company: "E社",
    rules: [
      {
        label: "パスワード",
        value: "8文字以上＋多要素認証",
        match: ["パスワード", "認証情報"],
        highlight:
          "🚨 当社のルール：パスワードは【8文字以上】＋【多要素認証(MFA)】が必須です",
      },
      {
        label: "USBメモリ",
        value: "会社支給品のみ許可（暗号化必須）",
        match: ["USB", "外部媒体", "記録媒体", "持ち出し", "持ち込み"],
        highlight:
          "🚨 当社のルール：USBメモリは【会社支給品のみ許可】（暗号化必須）です",
      },
      {
        label: "リモートワーク",
        value: "原則自由（カフェ利用可）",
        match: ["リモート", "在宅", "テレワーク"],
        highlight:
          "🚨 当社のルール：リモートワークは【原則自由】（カフェ等の社外利用も可）です",
      },
    ],
  },
};

/** select 用のサンプルファイル一覧 */
export const SAMPLE_POLICIES = [
  { id: "d", file_name: POLICY_PROFILES.d.file_name },
  { id: "e", file_name: POLICY_PROFILES.e.file_name },
];

// ---------------------------------------------------------------------------
// 顧客企業ごとに「登録・学習済み」の社内規定。参考資料管理画面の
// 「社内規定（ローカルルール）」タブで一覧・管理する。
// ---------------------------------------------------------------------------

/** 規定から抽出された条文ルール（詳細確認で表示）。 */
export interface ExtractedRule {
  label: string;
  value: string;
}

export interface RegisteredPolicy {
  id: string;
  corp: string; // EVIDENCE_COMPANIES の corp に対応
  company: string;
  file_name: string;
  uploaded_at: string; // "2026/06/10"
  rules: ExtractedRule[];
}

export const REGISTERED_POLICIES: RegisteredPolicy[] = [
  {
    id: "rp1",
    corp: "smart-flow",
    company: "株式会社スマートフロー",
    file_name: "ISMS情報セキュリティ基本規程_v2.0.pdf",
    uploaded_at: "2026/05/28",
    rules: [
      { label: "パスワード", value: "8文字以上＋多要素認証（MFA）を推奨" },
      { label: "標的型メール", value: "不審メールは即時に情報システム部へ報告" },
      { label: "USBメモリ", value: "会社支給品のみ許可（暗号化必須）" },
    ],
  },
  {
    id: "rp2",
    corp: "chiyoda",
    company: "千代田コンサルティング株式会社",
    file_name: "情報管理規程_2026年度版.pdf",
    uploaded_at: "2026/06/02",
    rules: [
      { label: "パスワード", value: "12文字以上・90日ごとの変更を必須" },
      { label: "情報の持ち出し", value: "事前承認制（部門長の承認が必要）" },
      { label: "クリアデスク", value: "離席時の書類・端末の施錠を徹底" },
    ],
  },
];

/** 新規アップロード時に擬似的に付与する抽出ルール。 */
export const DEFAULT_EXTRACTED_RULES: ExtractedRule[] = [
  { label: "パスワード", value: "8文字以上を必須（条文より抽出）" },
  { label: "情報の取り扱い", value: "機密区分に応じたアクセス制御を実施" },
  { label: "インシデント報告", value: "発見後ただちに責任者へ報告" },
];

/** 社内規定PDF解析時に表示するローディングステップ文言 */
export const POLICY_ANALYSIS_STEPS = [
  "社内規定PDFを解析中...",
  "ローカルルールを抽出中...",
];

export interface SlideHighlight {
  text: string;
  /** true: 自社規定を適用（アンバー強調）／false: 一般基準(IPA) */
  applied: boolean;
}

/**
 * スライド本文と選択中の規定から、表示すべきハイライトを決定する。
 * - 規定あり：本文に一致するルールがあればそのハイライト（applied: true）。
 * - 規定なし：パスワード関連スライドにのみ IPA 一般基準を表示（applied: false）。
 */
export function getSlideHighlight(
  slideText: string,
  policy: PolicyProfile | null
): SlideHighlight | null {
  if (policy) {
    const rule = policy.rules.find((r) =>
      r.match.some((m) => slideText.includes(m))
    );
    if (rule) return { text: rule.highlight, applied: true };
    return null;
  }
  if (slideText.includes("パスワード")) {
    return {
      text: "ℹ️ 一般基準（IPA）：パスワードは8文字以上が推奨されます。",
      applied: false,
    };
  }
  return null;
}
