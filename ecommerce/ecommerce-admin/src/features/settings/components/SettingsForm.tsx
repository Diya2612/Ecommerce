import type { ReactNode } from "react";
import { useForm, type UseFormReturn, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SettingsFormProps<T extends FieldValues> {
  title: string;
  description?: string;
  initialValues: T;
  validationSchema: z.ZodType<T>;
  onSubmit: (values: T) => void | Promise<void>;
  children: (form: UseFormReturn<T>) => ReactNode;
  submitLabel?: string;
  loading?: boolean;
  className?: string;
}

export const SettingsForm = <T extends FieldValues>({
  title,
  description,
  initialValues,
  validationSchema,
  onSubmit,
  children,
  submitLabel = "Save Changes",
  loading = false,
  className = "",
}: SettingsFormProps<T>) => {
  const form = useForm<T>({
    // Complex generic type inference - using type assertion for compatibility
    resolver: zodResolver(validationSchema as any),
    defaultValues: initialValues as any,
    mode: "onBlur",
  });

  const { handleSubmit, formState: { isSubmitting, isValid } } = form;

  const handleFormSubmit = async (data: T) => {
    await onSubmit(data);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {children(form)}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={loading || !isValid || isSubmitting}
              className="min-w-[120px] bg-[#0e042f] hover:bg-[#0e042f]/90"
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};