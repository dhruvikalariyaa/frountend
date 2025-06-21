import { useState, useCallback } from 'react';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast';

interface UseFormValidationProps<T> {
  schema: z.ZodSchema<T>;
  initialData: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
}

export function useFormValidation<T>({ schema, initialData, onSubmit }: UseFormValidationProps<T>) {
  const [data, setData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validate = useCallback((field?: keyof T) => {
    try {
      if (field) {
        // Validate single field by creating a new schema for just that field
        const fieldSchema = z.object({ [field as string]: z.any() });
        const result = fieldSchema.safeParse({ [field as string]: data[field] });
        if (!result.success) {
          const fieldError = result.error.errors.find((err: z.ZodIssue) => err.path[0] === field);
          if (fieldError) {
            setErrors(prev => ({ ...prev, [field]: fieldError.message }));
            return false;
          }
        }
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      } else {
        // Validate entire form
        schema.parse(data);
        setErrors({});
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [schema, data]);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    validate(field);
  }, [validate]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validate()) {
      toast({
        title: 'Validation Error',
        description: 'Please check the form for errors',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data as T);
      toast({
        title: 'Success',
        description: 'Form submitted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [data, validate, onSubmit, toast]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
  }, [initialData]);

  return {
    data,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    validate,
    reset,
  };
} 