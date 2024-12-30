interface PillProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "secondary";
}

export default function Pill({ children, className = "", onClick, variant = "default" }: PillProps) {
  const variantClasses = {
    default: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
    secondary: "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground",
  };

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${variantClasses[variant]} ${className}`} onClick={onClick}>
      {children}
    </span>
  );
}
