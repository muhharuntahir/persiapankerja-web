import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { isAdmin } from "@/lib/admin";
import { materials } from "@/db/schema";

export const GET = async () => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const data = await db.query.materials.findMany({
    orderBy: (m, { asc }) => [asc(m.order)],
  });

  return NextResponse.json(data);
};

export const POST = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  const data = await db
    .insert(materials)
    .values({
      title: body.title,
      content: body.content,
      unitId: body.unitId,
      order: body.order,
    })
    .returning();

  return NextResponse.json(data[0]);
};
