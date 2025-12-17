import { redirect } from "next/navigation";
import { getFirstMaterialByUnitSlug } from "@/db/queries";

export default async function UnitMaterialsPage({
  params,
}: {
  params: { unitSlug: string };
}) {
  const material = await getFirstMaterialByUnitSlug(params.unitSlug);

  if (!material) {
    return <div>Materi belum tersedia</div>;
  }

  redirect(`/materials/${params.unitSlug}/${material.id}`);
}
