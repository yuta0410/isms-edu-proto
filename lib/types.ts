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
