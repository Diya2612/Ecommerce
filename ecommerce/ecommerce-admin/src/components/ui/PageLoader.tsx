import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface PageLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  description?: string;
}

export function PageLoader({
  text = "Loading...",
  description,
  className,
  ...props
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex-1 flex items-center justify-center min-h-[400px]",
        className,
      )}
      {...props}
    >
      <div className="text-center space-y-4">
        <Spinner className="size-10 mx-auto text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">{text}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
