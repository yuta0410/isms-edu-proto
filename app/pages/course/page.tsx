import Link from "next/link";
import { GraduationCap, Clock, ArrowRight, ShieldCheck } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COURSES } from "@/constants/courses";

export default function CourseSelectionPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between gap-4 border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <h1 className="font-heading text-base font-semibold">
              教材を選択
            </h1>
            <p className="text-xs text-muted-foreground">
              一般社員向け / 受講する教材を選んでください
            </p>
          </div>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm">
            ホーム
          </Button>
        </Link>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4" />
          <span>受講可能な教材：{COURSES.length} 件</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => (
            <Card key={course.id} className="flex h-full flex-col">
              <CardHeader>
                <Badge variant="muted" className="w-fit">
                  ISMS 教育
                </Badge>
                <CardTitle className="mt-1">{course.title}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs">
                  <Clock className="size-3.5" />
                  想定受講時間：約 {course.estimated_minutes} 分 ・ スライド{" "}
                  {course.slides.length} 枚
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 text-sm text-muted-foreground">
                {course.description}
              </CardContent>
              <CardFooter>
                <Link href={`/pages/course/${course.id}`} className="w-full">
                  <Button className="w-full gap-2">
                    受講を開始する
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
