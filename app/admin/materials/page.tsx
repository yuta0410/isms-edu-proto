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

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleUpload() {
    if (!selectedFile) {
      alert("アップロードするファイルを選択してください。");
      return;
    }
    setUploading(true);
    // Prototype: simulate ingestion + embedding latency, then append a row.
    // In production: upload to storage → chunk → embed → insert into Supabase.
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

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FolderOpen className="size-5" />
          </div>
          <div>
            <h1 className="font-heading text-base font-semibold">
              参考資料管理（AI学習用）
            </h1>
            <p className="text-xs text-muted-foreground">
              管理者向け / コンサル受領資料の登録・管理
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/admin/generate">
            <Button variant="ghost" size="sm">
              スライド生成へ
            </Button>
          </Link>
          <Link href="/admin/distribution">
            <Button variant="ghost" size="sm">
              配信・進捗管理
            </Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              進捗ダッシュボード
            </Button>
          </Link>
          <Link href="/pages/course">
            <Button variant="ghost" size="sm">
              受講画面へ
            </Button>
          </Link>
        </nav>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Upload panel */}
        <Card className="mb-8">
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
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
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
                選択中：<span className="font-medium text-foreground">{selectedFile.name}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Registered materials table */}
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
      </div>
    </div>
  );
}
