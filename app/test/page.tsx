import { getUnits } from "@/db/queries";

export default async function TestPage() {
  const units = await getUnits();

  return (
    <div className="p-6 space-y-6">
      {units.map((unit) => (
        <div key={unit.id} className="border p-4 rounded">
          <h2 className="text-xl font-bold">{unit.title}</h2>
          <p className="text-muted-foreground">{unit.description}</p>

          <ul className="mt-3 space-y-2">
            {unit.lessons.map((lesson) => (
              <li key={lesson.id} className="pl-4 border-l text-sm">
                {lesson.order}. {lesson.title}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
