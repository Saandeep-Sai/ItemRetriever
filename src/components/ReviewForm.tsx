"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { reviewSchema, type ReviewFormData } from '@/lib/schemas';
import { Send, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ReviewFormProps {
  onSubmitReview: (data: ReviewFormData) => Promise<void>;
}

export function ReviewForm({ onSubmitReview }: ReviewFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      reviewText: '',
    },
  });

  const handleSubmit = async (data: ReviewFormData) => {
    setIsLoading(true);
    await onSubmitReview(data);
    setIsLoading(false);
    form.reset(); 
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="reviewText"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="reviewText">Your Review</FormLabel>
              <FormControl>
                <Textarea
                  id="reviewText"
                  placeholder="Tell us about your experience with FaceLocker..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Submit Review
        </Button>
      </form>
    </Form>
  );
}
