import type { ReactNode } from 'react';
import type { UseFormReturn, FieldValues } from 'react-hook-form';

interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: ReactNode;
  className?: string;
}

export function Form<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className = '',
}: FormProps<T>) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className={className}>
      {children}
    </form>
  );
}
