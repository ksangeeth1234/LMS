import { Suspense } from "react";
import { StudentMaterialsView } from "@/views/student/StudentMaterialsView";

export default function StudentMaterialsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading learning materials...</div>}>
      <StudentMaterialsView />
    </Suspense>
  );
}
