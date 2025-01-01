import { db } from "@/server/db";
import { cacheVideoInfo } from "@/server/services/video";
import { type NextRequest, NextResponse } from "next/server";

const authenticateAndGetStation = async (req: NextRequest, stationId: string) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { error: new NextResponse("Unauthorized", { status: 401 }) };
  }

  const apiKey = authHeader.replace("Bearer ", "");
  const user = await db.user.findUnique({
    where: { extensionAPIKey: apiKey },
  });

  if (!user || user.extensionAPIKey !== apiKey) {
    return { error: new NextResponse("Unauthorized", { status: 401 }) };
  }

  const station = await db.station.findUnique({
    where: { id: stationId, userId: user.id },
  });

  if (!station) {
    return { error: new NextResponse("Not Found", { status: 404 }) };
  }

  return { user, station };
};

const addVideoToStation = async (req: NextRequest, { params }: { params: { id: string; videoId: string } }) => {
  const { id, videoId } = await params;

  const auth = await authenticateAndGetStation(req, id);
  if ("error" in auth) return auth.error;

  const { user, station } = auth;

  const video = await cacheVideoInfo(videoId);
  await db.videoStation.create({
    data: {
      videoId: video.id,
      stationId: station.id,
      userId: user.id,
    },
  });

  return NextResponse.json({ message: "Video Added" }, { status: 201 });
};

const deleteVideoFromStation = async (req: NextRequest, { params }: { params: { id: string; videoId: string } }) => {
  const { id, videoId } = await params;

  const auth = await authenticateAndGetStation(req, id);
  if ("error" in auth) return auth.error;

  const { user, station } = auth;

  await db.videoStation.delete({
    where: {
      videoId_stationId_userId: {
        videoId: videoId,
        stationId: station.id,
        userId: user.id,
      },
    },
  });

  return NextResponse.json({ message: "Video Deleted" }, { status: 200 });
};

export { deleteVideoFromStation as DELETE, addVideoToStation as POST };
