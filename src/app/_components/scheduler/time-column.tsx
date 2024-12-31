const TimeColumn = ({ hourHeight }: { hourHeight: number }) => {
  const getLocalTime = (utcHour: number) => {
    const date = new Date();
    date.setUTCHours(utcHour, 0, 0, 0);
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="absolute -left-10 top-10" style={{ height: `${24 * hourHeight}px`, width: "calc(100% + 40px)" }}>
      {Array.from({ length: 24 }, (_, hour) => (
        <div
          key={hour}
          className="absolute w-full border-t border-secondary/30 text-xs text-muted-foreground px-1"
          style={{
            top: `${hour * hourHeight}px`,
            height: `${hourHeight}px`,
          }}
        >
          <div>{hour}:00</div>
          <div className="text-[10px] opacity-75">{getLocalTime(hour)}</div>
        </div>
      ))}
    </div>
  );
};

export default TimeColumn;
