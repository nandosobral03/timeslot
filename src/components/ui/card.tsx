import * as React from "react";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant = "primary", ...props }, ref) => {
  const variantStyles = {
    primary: "border-primary/50",
    secondary: "border-secondary/50",
  };

  return <div ref={ref} className={cn("rounded-lg border-2 bg-background-light text-card-foreground shadow-lg transition-all hover:shadow-lg", variantStyles[variant], className)} {...props} />;
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col space-y-2 p-6 border-b-2 border-primary/50", className)} {...props} />);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-xl font-bold leading-tight tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn("text-sm text-muted-foreground/80 leading-relaxed", className)} {...props} />);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-4", className)} {...props} />);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center justify-end gap-4 p-6 pt-0 mt-2 border-t-2 border-primary/50", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
