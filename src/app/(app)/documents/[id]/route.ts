import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireUser();
  const { id } = await params;

  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(document.data), {
    headers: {
      "Content-Type": document.fileType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${document.fileName.replace(/"/g, "")}"`,
      "Content-Length": String(document.data.length),
      "Cache-Control": "private, max-age=0, no-cache",
    },
  });
}
