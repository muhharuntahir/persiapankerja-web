import {
  getMaterialsByUnit,
  getMaterialById,
  getUnitBySlug,
  getNextLessonLinkByUnit,
} from "@/db/queries";

import { MaterialHeader } from "../../header";
import MaterialSidebar from "../../material-sidebar";
import MaterialContent from "../../material-content";
import MaterialFooter from "../../footer";

import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

type PageProps = {
  params: {
    unitSlug: string;
    materialId: string;
  };
};

export default async function MaterialPage({ params }: PageProps) {
  const { unitSlug, materialId } = params;

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const unit = await getUnitBySlug(unitSlug);
  if (!unit) notFound();

  const materials = await getMaterialsByUnit(unit.id, user.id);
  const material = await getMaterialById(Number(materialId), unit.id, user.id);
  if (!material) notFound();

  const total = materials.length;
  const completedCount = materials.filter((m) => m.completed).length;
  const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const nextLessonLink = await getNextLessonLinkByUnit(unit.id, user.id);

  return (
    <>
      <MaterialHeader unitTitle={unit.title} />

      {/* CONTENT AREA */}
      <div className="flex flex-1 pt-16">
        {/* MAIN */}
        <main className="flex-1 px-8 py-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <MaterialContent material={material} />

            <MaterialFooter
              materials={materials}
              currentId={material.id}
              unitSlug={unit.slug}
              completed={!!material.completed}
              userId={user.id}
              nextLessonLink={nextLessonLink}
            />
          </div>
        </main>

        {/* SIDEBAR */}
        <aside className="hidden lg:block w-[320px] border-l fixed right-0 top-16 bottom-0 bg-white overflow-y-auto">
          <MaterialSidebar
            materials={materials}
            currentId={material.id}
            unitSlug={unit.slug}
            progress={progress}
          />
        </aside>
      </div>
    </>
  );
}
