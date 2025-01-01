import { db } from "@/server/db";
import { type NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest) => {
  if (req.method !== "GET") {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const apiKey = authHeader.replace("Bearer ", "");
  const user = await db.user.findUnique({
    where: {
      extensionAPIKey: apiKey,
    },
  });

  if (!user || user.extensionAPIKey !== apiKey) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const stations = await db.station.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      thumbnail: true,
      isPublic: true,
      videos: {
        select: {
          videoId: true,
        },
      },
    },
  });

  return NextResponse.json(stations);
};

export { handler as GET };
