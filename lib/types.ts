// Shared data structures for the ISMS education materials tool.
// Keys are snake_case to stay n8n / Structured-Output friendly.

export interface Slide {
  title: string;
  bullets: string[];
  narration: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  /** Zero-based index into `options` for the correct answer. */
  answer_index: number;
  explanation?: string;
}

export interface SlideDeck {
  keyword: string;
  slides: Slide[];
  quiz: QuizQuestion[];
}

/** A published course: presentation metadata + slide deck + quiz. */
export interface Course {
  id: string;
  title: string;
  description: string;
  estimated_minutes: number;
  keyword: string;
  slides: Slide[];
  quiz: QuizQuestion[];
}

/** File formats accepted as AI-learning reference material. */
export type MaterialFormat = "PPTX" | "PDF";

/** Ingestion status of a reference material in the RAG knowledge base. */
export type MaterialStatus = "learning" | "learned";

/**
 * A reference document uploaded by a consultant for the AI to learn from
 * (e.g. client-provided P-mark / ISMS audit materials, JIPDEC guidelines).
 * In production these would be rows in a Supabase `materials` table, chunked
 * and embedded into the IPA knowledge base.
 */
export interface Material {
  id: string;
  name: string;
  format: MaterialFormat;
  uploaded_at: string;
  status: MaterialStatus;
}

/** A delivery target audience inside a tenant company. */
export type DeliveryGroup = "全社員" | "新入社員" | "管理職";

/** Notification channels a distribution can fan out to. */
export type NotifyChannel = "line" | "slack";

/**
 * A tenant (customer company). The learner portal is themed and filtered per
 * tenant via the `corp` URL parameter, so each company sees only the courses
 * distributed to it. In production this maps to a Supabase `tenants` table.
 */
export interface Tenant {
  corp: string; // short code used in URLs, e.g. "A"
  name: string; // 表示名, e.g. "A株式会社"
  portal_label: string; // ヘッダー見出し
  logo_label: string; // ロゴエリアの文言
  accent: "sky" | "violet" | "emerald"; // テナント別アクセントカラー
  course_ids: string[]; // 配信中の教材ID
}

/**
 * One row of the distribution dashboard: a course delivered to a company's
 * group, with current completion progress.
 */
export interface DistributionRecord {
  id: string;
  course_id: string;
  course_title: string;
  corp: string;
  corp_name: string;
  group: DeliveryGroup;
  distributed_at: string;
  total_count: number;
  completed_count: number;
  channels: NotifyChannel[];
}

export type CourseStatus = "not_started" | "in_progress" | "completed";

export interface ProgressRecord {
  id: string;
  employee_name: string;
  company_name: string;
  course_title: string;
  status: CourseStatus;
  completed_at: string | null;
  score_rate: number | null; // 0-100
}
