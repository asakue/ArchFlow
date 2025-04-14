
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "white";
  className?: string;
}

export function Loader({ 
  size = "md", 
  variant = "primary",
  className 
}: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4"
  };

  const variantClasses = {
    primary: "border-primary border-t-transparent",
    secondary: "border-secondary border-t-transparent",
    white: "border-white border-t-transparent"
  };

  return (
    <div 
      className={cn(
        "animate-spin rounded-full", 
        sizeClasses[size], 
        variantClasses[variant],
        className
      )}
    />
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <Loader size="lg" />
        <p className="mt-4 text-neutral-600 font-medium">Загрузка...</p>
      </div>
    </div>
  );
}

export function ContentLoader() {
  return (
    <div className="w-full h-full min-h-[200px] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader />
        <p className="mt-2 text-sm text-neutral-500">Загрузка данных...</p>
      </div>
    </div>
  );
}

export function ButtonLoader({ className }: { className?: string }) {
  return <Loader size="sm" className={cn("mr-2", className)} />;
}
