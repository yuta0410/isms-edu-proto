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
  /** 適用された規程（applied=true で自社規定の💡バッジ、false でIPA標準基準）。 */
  policy: { label: string; applied: boolean };
  /** 現在配信中の企業名（空配列なら未配信）。 */
  distributed_to: string[];
}

export const STOCK_COURSES: StockCourse[] = [
  {
    id: "personal-info",
    title: "個人情報の適切な取り扱い",
    estimated_minutes: 15,
    slide_count: 8,
    policy: { label: "IPA標準基準", applied: false },
    distributed_to: ["株式会社スマートフロー", "千代田コンサルティング株式会社"],
  },
  {
    id: "password-mfa",
    title: "パスワード管理と多要素認証",
    estimated_minutes: 12,
    slide_count: 6,
    policy: { label: "D社規定適用済み", applied: true },
    distributed_to: ["株式会社スマートフロー"],
  },
  {
    id: "remote-work",
    title: "テレワーク時の情報セキュリティ注意点",
    estimated_minutes: 10,
    slide_count: 5,
    policy: { label: "E社規定適用済み", applied: true },
    distributed_to: [],
  },
];
