const TimeColumn = ({ hourHeight }: { hourHeight: number }) => (
  <div className="absolute -left-20 top-10 border-l border-border" style={{ height: `${24 * hourHeight}px`, width: "100%" }}>
    {Array.from({ length: 24 }, (_, hour) => (
      <div
        key={hour}
        className="absolute w-full border-t border-border text-xs text-muted-foreground px-1"
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
