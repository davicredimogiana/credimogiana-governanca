import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icone: LucideIcon;
  tendencia?: {
    valor: number;
    positiva: boolean;
  };
  variante?: "default" | "primary" | "secondary" | "warning";
  className?: string;
}

export function StatCard({
  titulo,
  valor,
  subtitulo,
  icone: Icone,
  tendencia,
  variante = "default",
  className,
}: StatCardProps) {
  const variantStyles = {
    default: "bg-card",
    primary: "bg-primary/5 border-primary/20",
    secondary: "bg-secondary/5 border-secondary/20",
    warning: "bg-warning/5 border-warning/20",
  };

  const iconStyles = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <div
      className={cn(
        "p-6 rounded-xl border shadow-soft hover-lift",
        variantStyles[variante],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{titulo}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{valor}</span>
            {tendencia && (
              <span
                className={cn(
                  "text-sm font-medium",
                  tendencia.positiva ? "text-success" : "text-destructive"
                )}
              >
                {tendencia.positiva ? "+" : "-"}{Math.abs(tendencia.valor)}%
              </span>
            )}
          </div>
          {subtitulo && (
            <p className="text-xs text-muted-foreground">{subtitulo}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", iconStyles[variante])}>
          <Icone className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
