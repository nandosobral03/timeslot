interface PillProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Pill({ children, className = "", onClick }: PillProps) {
  return (
    <span className={`rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground ${className}`} onClick={onClick}>
      {children}
    </span>
  );
}
