export default function Intermission({ upcomingVideo }: { upcomingVideo?: { title: string; thumbnail?: string; startTime: string } }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-background">
      <h1 className="text-4xl font-bold mb-4">We'll be right back!</h1>

      {upcomingVideo ? (
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-8">Coming up next at {upcomingVideo.startTime}:</p>
          <div className="flex flex-col items-center gap-4">
            {upcomingVideo.thumbnail && <img src={upcomingVideo.thumbnail} alt={upcomingVideo.title} className="w-[300px] rounded-lg shadow-lg" />}
            <p className="text-2xl font-medium">{upcomingVideo.title}</p>
          </div>
        </div>
      ) : (
        <p className="text-xl text-muted-foreground">Stay tuned! Programming will resume shortly.</p>
      )}
    </div>
  );
}
