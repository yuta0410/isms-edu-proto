/**
 * ストック教材（過去にAIで生成され資産として保管されている教材）の一覧。
 *
 * 教材一覧・配信管理画面（/admin/courses）で表示し、ワンクリックで再配信できる。
 * 実運用では Supabase の `courses` テーブル＋配信状況の集計から取得する。
 */

export interface StockCourse {
  id: string;
  title: string;
  estimated_minutes: number;
  slide_count: number;
  /**
   * 適用された社内規定のテナントID。null は IPA 標準基準（全テナント共通）。
   * 規定適用版はそのテナント専用の教材であり、他テナントには表示しない。
   */
  policy_tenant_id: string | null;
  /** 現在配信中のテナントID（空配列なら未配信）。 */
  distributed_to: string[];
}

export const STOCK_COURSES: StockCourse[] = [
  {
    id: "personal-info",
    title: "個人情報の適切な取り扱い",
    estimated_minutes: 15,
    slide_count: 8,
    policy_tenant_id: null,
    distributed_to: ["chiyoda", "a-corp"],
  },
  {
    id: "password-mfa",
    title: "パスワード管理と多要素認証",
    estimated_minutes: 12,
    slide_count: 6,
    policy_tenant_id: "smart-flow",
    distributed_to: ["smart-flow"],
  },
  {
    id: "phishing",
    title: "標的型メール攻撃への対策",
    estimated_minutes: 10,
    slide_count: 6,
    policy_tenant_id: null,
    distributed_to: ["smart-flow", "a-corp"],
  },
  {
    id: "remote-work",
    title: "テレワーク時の情報セキュリティ注意点",
    estimated_minutes: 10,
    slide_count: 5,
    policy_tenant_id: "chiyoda",
    distributed_to: [],
  },
];
