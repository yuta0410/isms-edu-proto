"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Clock,
  Presentation,
  Send,
  Sparkles,
  Building2,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DistributionModal } from "@/components/distribution-modal";
import { STOCK_COURSES, type StockCourse } from "@/constants/course-stock";

export default function CoursesPage() {
  const [distCourse, setDistCourse] = useState<StockCourse | null>(null);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="size-5" />
          </div>
          <div>
            <h1 className="font-heading text-base font-semibold">
              教材一覧・配信管理
            </h1>
            <p className="text-xs text-muted-foreground">
              管理者向け / 生成済み教材の資産管理・再配信
            </p>
          </div>
        </div>
        <Link href="/admin/generate">
          <Button size="sm" className="gap-1.5">
            <Sparkles className="size-3.5" />
            新しい教材を生成
          </Button>
        </Link>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium">
          <Layers className="size-4 text-muted-foreground" />
          ストック教材
          <Badge variant="muted" className="ml-1">
            {STOCK_COURSES.length} 件
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STOCK_COURSES.map((course) => (
            <Card key={course.id} className="flex h-full flex-col">
              <CardHeader className="gap-2">
                {/* 適用規程バッジ */}
                {course.policy.applied ? (
                  <Badge variant="warning" className="w-fit">
                    💡 {course.policy.label}
                  </Badge>
                ) : (
                  <Badge variant="info" className="w-fit">
                    {course.policy.label}
                  </Badge>
                )}
                <CardTitle className="mt-1 text-base leading-snug">
                  {course.title}
                </CardTitle>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />約 {course.estimated_minutes}{" "}
                  分 ・
                  <Presentation className="size-3.5" />
                  スライド {course.slide_count} 枚
                </p>
              </CardHeader>

              <CardContent className="flex-1">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  現在の配信先企業
                </p>
                {course.distributed_to.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {course.distributed_to.map((c) => (
                      <Badge key={c} variant="success">
                        <Building2 className="size-3" />
                        {c}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Badge variant="muted">未配信</Badge>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => setDistCourse(course)}
                  className="w-full gap-2"
                >
                  <Send className="size-4" />
                  配信設定（割り当て）
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* 配信設定モーダル（選択した教材のコンテキストを保持） */}
      <DistributionModal
        open={distCourse !== null}
        onOpenChange={(open) => {
          if (!open) setDistCourse(null);
        }}
        courseTitle={distCourse?.title ?? ""}
      />
    </div>
  );
}
