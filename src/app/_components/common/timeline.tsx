import dayjs from "dayjs";

interface Video {
  id: string;
  image: string;
  start: string;
  end: string;
  title: string;
}

interface TimelineProps {
  videos: Video[];
}

const Timeline: React.FC<TimelineProps> = ({ videos }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const renderVideosForDay = (dayId: string) => {
    const currentDayNumber = parseInt(dayId);

    return videos
      .map((video) => {
        const videoStartDay = dayjs(video.start).day();
        const videoEndDay = dayjs(video.end).day();

        // Skip if video doesn't overlap with this day
        if (currentDayNumber !== videoStartDay && currentDayNumber !== videoEndDay) {
          return null;
        }

        let startPosition;
        let duration;

        if (currentDayNumber === videoStartDay) {
          // Video starts on this day
          startPosition = dayjs(video.start).hour() * 60 + dayjs(video.start).minute();
          if (videoEndDay !== videoStartDay) {
            // Video ends next day
            duration = 24 * 60 - startPosition;
          } else {
            // Video ends same day
            duration = dayjs(video.end).diff(dayjs(video.start), "minute");
          }
        } else {
          // Video started previous day and ends on this day
          startPosition = 0;
          duration = dayjs(video.end).hour() * 60 + dayjs(video.end).minute();
        }

        const tooltipContent = `${dayjs(video.start).format("HH:mm")} - ${dayjs(video.end).format("HH:mm")}\n${video.title}`;

        return (
          <div
            key={video.id}
            className="absolute top-8 flex items-center justify-center text-white bg-primary shadow-md rounded-md group"
            style={{
              left: `${(startPosition / (24 * 60)) * 100}%`,
              width: `${(duration / (24 * 60)) * 100}%`,
            }}
            title={tooltipContent}
          >
            <span className="px-2 whitespace-nowrap overflow-hidden text-ellipsis text-sm">{video.title}</span>
            <div className="absolute invisible group-hover:visible bg-black text-white text-xs rounded px-2 py-1 bottom-full left-1/2 transform -translate-x-1/2 whitespace-pre-line w-48 mb-2">
              <img src={video.image} alt={video.title} className="w-full h-20 object-cover rounded mb-1" />
              <p className="font-medium mb-1">{video.title}</p>
              <p className="text-gray-300">
                {dayjs(video.start).format("HH:mm")} - {dayjs(video.end).format("HH:mm")}
              </p>
            </div>
          </div>
        );
      })
      .filter(Boolean);
  };

  return (
    <div className="overflow-x-auto p-2 bg-background">
      <div className="min-w-[4608px]">
        <div className="border-b-2 border-border mb-4 relative">
          {hours.map((hour) => (
            <div key={hour} className="inline-block w-48 text-muted-foreground font-medium relative">
              <div className="absolute h-[calc(100%+8px)] w-px bg-border left-0 bottom-0"></div>
              <span className="absolute left-0 -translate-x-1/2 -top-6">{hour}:00</span>
            </div>
          ))}
        </div>
        {Array.from({ length: 7 }, (_, i) => i.toString()).map((dayId) => (
          <div key={dayId} className="relative h-16 mb-2 border-b border-border">
            {hours.map((hour) => (
              <div key={hour} className="absolute h-full w-px bg-border" style={{ left: `${(hour / 24) * 100}%` }}></div>
            ))}
            {renderVideosForDay(dayId)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
