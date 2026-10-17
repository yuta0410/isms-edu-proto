"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/workspace";

/**
 * OEM（監査事業者）専用画面のガード。テナント管理者が URL を直接開いても
 * 中身（他社の契約・提案情報）は描画せず、権限なしの案内だけを表示する。
 */
export function OemOnly({ children }: { children: React.ReactNode }) {
  const { isOem } = useWorkspace();
  if (isOem) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Lock className="size-5" />
      </span>
      <div>
        <p className="font-heading text-base font-semibold">
          この画面を表示する権限がありません
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          監査事業者（OEM管理者）専用の画面です。
        </p>
      </div>
      <Link href="/admin/dashboard">
        <Button variant="outline">ホームへ戻る</Button>
      </Link>
    </div>
  );
}
