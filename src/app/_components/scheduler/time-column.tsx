const TimeColumn = ({ hourHeight }: { hourHeight: number }) => (
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
        {hour}:00
      </div>
    ))}
  </div>
);

export default TimeColumn;
