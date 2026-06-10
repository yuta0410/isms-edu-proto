"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  FolderOpen,
  UploadCloud,
  FileText,
  Presentation,
  Trash2,
  CheckCircle2,
  Loader2,
  Sparkles,
  ShieldCheck,
  Building2,
  Eye,
  Lightbulb,
  ScanSearch,
} from "lucide-react";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { EVIDENCE_COMPANIES } from "@/constants/evidence";
import {
  REGISTERED_POLICIES,
  DEFAULT_EXTRACTED_RULES,
  type RegisteredPolicy,
} from "@/constants/local-rules";
import type { Material, MaterialFormat } from "@/lib/types";

// Seed data — client-provided documents already ingested into the AI knowledge
// base. In production: supabase.from("materials").select(...).
const INITIAL_MATERIALS: Material[] = [
  {
    id: "m1",
    name: "E&N監修_Pマーク審査対策基準.pptx",
    format: "PPTX",
    uploaded_at: "2026-05-20 10:12",
    status: "learned",
  },
  {
    id: "m2",
    name: "JIPDECガイドライン要約.pdf",
    format: "PDF",
    uploaded_at: "2026-05-22 15:48",
    status: "learned",
  },
  {
    id: "m3",
    name: "IPA_情報セキュリティ10大脅威_2026.pdf",
    format: "PDF",
    uploaded_at: "2026-06-01 09:03",
    status: "learned",
  },
];

// Pick a format badge from a filename extension.
function formatFromName(name: string): MaterialFormat {
  return /\.pptx?$/i.test(name) ? "PPTX" : "PDF";
}

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

function nowDateSlash(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}

export default function MaterialsPage() {
  // --- General reference materials (existing) ---
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Company local-rule policies (new) ---
  const [policies, setPolicies] =
    useState<RegisteredPolicy[]>(REGISTERED_POLICIES);
  const [policyCorp, setPolicyCorp] = useState<string>(
    EVIDENCE_COMPANIES[0].corp
  );
  const [policyFile, setPolicyFile] = useState<File | null>(null);
  const [policyUploading, setPolicyUploading] = useState(false);
  const [policyProgress, setPolicyProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [detail, setDetail] = useState<RegisteredPolicy | null>(null);
  const policyInputRef = useRef<HTMLInputElement>(null);

  function handleUpload() {
    if (!selectedFile) {
      alert("アップロードするファイルを選択してください。");
      return;
    }
    setUploading(true);
    // Prototype: simulate ingestion + embedding latency, then append a row.
    setTimeout(() => {
      const newMaterial: Material = {
        id: `m${Date.now()}`,
        name: selectedFile.name,
        format: formatFromName(selectedFile.name),
        uploaded_at: nowStamp(),
        status: "learned",
      };
      setMaterials((prev) => [newMaterial, ...prev]);
      setUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert(
        `✅ 「${newMaterial.name}」をアップロードしました。\n` +
          `AIへの学習（ベクトル化）が完了し、スライド生成時に参照されます。`
      );
    }, 1400);
  }

  function handleDelete(id: string) {
    const target = materials.find((m) => m.id === id);
    if (!target) return;
    if (!confirm(`「${target.name}」を学習データから削除しますか？`)) return;
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }

  // --- policy upload (with analyze/vectorize progress bar) ---
  function handlePolicyUpload() {
    const company = EVIDENCE_COMPANIES.find((c) => c.corp === policyCorp);
    if (!company) return;
    setPolicyUploading(true);
    setPolicyProgress(8);
    const timer = setInterval(() => {
      setPolicyProgress((p) => (p >= 92 ? p : p + 11));
    }, 220);
    // After the simulated analysis, append the new policy row.
    setTimeout(() => {
      clearInterval(timer);
      setPolicyProgress(100);
      const fileName =
        policyFile?.name ?? `社内規定_${company.name}_v1.0.pdf`;
      const newPolicy: RegisteredPolicy = {
        id: `rp-${Date.now()}`,
        corp: company.corp,
        company: company.name,
        file_name: fileName,
        uploaded_at: nowDateSlash(),
        rules: DEFAULT_EXTRACTED_RULES,
      };
      setPolicies((prev) => [newPolicy, ...prev]);
      setPolicyUploading(false);
      setPolicyFile(null);
      setPolicyProgress(0);
      if (policyInputRef.current) policyInputRef.current.value = "";
    }, 2600);
  }

  function handleDeletePolicy(id: string) {
    const target = policies.find((p) => p.id === id);
    if (!target) return;
    if (!confirm(`「${target.file_name}」を学習データから削除しますか？`)) return;
    setPolicies((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="flex h-16 items-center gap-3 border-b bg-card px-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FolderOpen className="size-5" />
        </div>
        <div>
          <h1 className="font-heading text-base font-semibold">
            参考資料管理（AI学習用）
          </h1>
          <p className="text-xs text-muted-foreground">
            管理者向け / コンサル受領資料・社内規定の登録・管理
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Consultant guide */}
        <Card className="mb-6 border-amber-300/60 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/20">
          <CardContent className="flex items-start gap-3 py-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
              <Lightbulb className="size-4" />
            </span>
            <p className="text-sm leading-relaxed text-foreground/90">
              <span className="font-semibold">💡 コンサルタント向けガイド：</span>
              ここで登録・解析された社内規定は、左メニューの「スライド生成」画面の
              「社内規定PDFの学習」エリアからワンクリックで呼び出し、一般論（IPA基準）と
              融合させたオーダーメイド教材の自動生成に利用できます。
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general" className="gap-1.5">
              <FolderOpen className="size-3.5" />
              一般参考資料
              <Badge variant="muted" className="ml-1">
                {materials.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="policy" className="gap-1.5">
              <ShieldCheck className="size-3.5" />
              社内規定（ローカルルール）
              <Badge variant="muted" className="ml-1">
                {policies.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* ---------------- 一般参考資料 ---------------- */}
          <TabsContent value="general" className="mt-6 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadCloud className="size-5 text-primary" />
                  参考資料のアップロード
                </CardTitle>
                <CardDescription>
                  PPTX / PDF
                  などの資料を登録すると、AIが内容を学習し、スライド生成時の参照元（RAG）として利用します。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pptx,.ppt,.pdf"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] ?? null)
                    }
                    disabled={uploading}
                    className="block w-full text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-input file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/70 disabled:opacity-50"
                  />
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile}
                    className="shrink-0 gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        AI学習中...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="size-4" />
                        アップロード
                      </>
                    )}
                  </Button>
                </div>
                {selectedFile && !uploading && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    選択中：
                    <span className="font-medium text-foreground">
                      {selectedFile.name}
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-4 text-muted-foreground" />
                  登録済み参考資料
                  <Badge variant="muted" className="ml-1">
                    {materials.length} 件
                  </Badge>
                </CardTitle>
                <CardDescription>
                  現在AIが学習している資料の一覧です。スライド生成時に自動で参照されます。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>資料名</TableHead>
                      <TableHead>ファイル形式</TableHead>
                      <TableHead>アップロード日時</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((m) => {
                      const Icon = m.format === "PPTX" ? Presentation : FileText;
                      return (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">
                            <span className="flex items-center gap-2">
                              <Icon className="size-4 shrink-0 text-muted-foreground" />
                              {m.name}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{m.format}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {m.uploaded_at}
                          </TableCell>
                          <TableCell>
                            <Badge variant="success">
                              <CheckCircle2 className="size-3" />
                              AI学習完了
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(m.id)}
                              className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                              削除
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {materials.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-8 text-center text-muted-foreground"
                        >
                          登録済みの参考資料がありません。上のフォームからアップロードしてください。
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------- 社内規定（ローカルルール） ---------------- */}
          <TabsContent value="policy" className="mt-6 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  社内規定PDFの登録
                </CardTitle>
                <CardDescription>
                  顧客企業から受領した社内規定PDFを企業に紐付けて登録すると、AIが条文を
                  解析・ベクトル化し、スライド生成時の「ローカルルール」として優先適用できます。
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Company select */}
                <div>
                  <label
                    htmlFor="policy-corp"
                    className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                  >
                    <Building2 className="size-3.5" />
                    対象企業（紐付け先）
                  </label>
                  <select
                    id="policy-corp"
                    value={policyCorp}
                    onChange={(e) => setPolicyCorp(e.target.value)}
                    disabled={policyUploading}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 sm:max-w-sm dark:bg-input/30"
                  >
                    {EVIDENCE_COMPANIES.map((c) => (
                      <option key={c.corp} value={c.corp}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Drag & drop area */}
                <label
                  htmlFor="policy-file"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) setPolicyFile(f);
                  }}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-input bg-muted/30 hover:bg-muted/50"
                  } ${policyUploading ? "pointer-events-none opacity-60" : ""}`}
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UploadCloud className="size-5" />
                  </span>
                  <p className="text-sm font-medium">
                    社内規定PDFをドラッグ＆ドロップ
                  </p>
                  <p className="text-xs text-muted-foreground">
                    またはクリックしてファイルを選択（PDF）
                  </p>
                  {policyFile && (
                    <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs ring-1 ring-border">
                      <FileText className="size-3.5 text-rose-500" />
                      {policyFile.name}
                    </span>
                  )}
                  <input
                    id="policy-file"
                    ref={policyInputRef}
                    type="file"
                    accept=".pdf"
                    disabled={policyUploading}
                    onChange={(e) =>
                      setPolicyFile(e.target.files?.[0] ?? null)
                    }
                    className="hidden"
                  />
                </label>

                {/* Analyze / vectorize progress */}
                {policyUploading && (
                  <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 duration-300 animate-in fade-in">
                    <div className="flex items-center gap-2 text-sm">
                      <ScanSearch className="size-4 animate-pulse text-primary" />
                      <span className="font-medium">
                        AIがPDFの条文を解析・ベクトル化しています...
                      </span>
                      <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                        {policyProgress}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-200"
                        style={{ width: `${policyProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handlePolicyUpload}
                    disabled={policyUploading}
                    className="gap-2"
                  >
                    {policyUploading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        解析中...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="size-4" />
                        アップロードして学習
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Registered policies table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-muted-foreground" />
                  登録済み社内規定
                  <Badge variant="muted" className="ml-1">
                    {policies.length} 件
                  </Badge>
                </CardTitle>
                <CardDescription>
                  企業ごとに登録された社内規定です。「詳細確認」でAIが抽出したルールを確認できます。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>対象企業</TableHead>
                      <TableHead>ファイル名</TableHead>
                      <TableHead>アップロード日時</TableHead>
                      <TableHead>AI学習ステータス</TableHead>
                      <TableHead className="text-right">アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          <span className="flex items-center gap-2">
                            <Building2 className="size-4 shrink-0 text-muted-foreground" />
                            {p.company}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="size-4 shrink-0 text-rose-500" />
                            {p.file_name}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.uploaded_at}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">
                            <CheckCircle2 className="size-3" />
                            学習完了
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDetail(p)}
                              className="gap-1.5"
                            >
                              <Eye className="size-3.5" />
                              詳細確認
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePolicy(p.id)}
                              className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                              削除
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {policies.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-8 text-center text-muted-foreground"
                        >
                          登録済みの社内規定がありません。上のエリアからPDFをアップロードしてください。
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 抽出ルール詳細ダイアログ */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanSearch className="size-4 text-primary" />
              AIが抽出した社内規定ルール
            </DialogTitle>
            <DialogDescription>
              {detail?.company}｜{detail?.file_name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            {detail?.rules.map((r) => (
              <div
                key={r.label}
                className="flex items-start gap-2 rounded-lg border border-amber-200/70 bg-amber-50/60 px-3 py-2 text-sm dark:border-amber-900/40 dark:bg-amber-950/20"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  <span className="font-medium">{r.label}：</span>
                  <span className="text-muted-foreground">{r.value}</span>
                </span>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Link href="/admin/generate" className="w-full sm:w-auto">
              <Button className="w-full gap-2">
                <Sparkles className="size-4" />
                この規定でスライド生成
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
