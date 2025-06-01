"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { Send, Loader2, Star } from 'lucide-react';
import { useState } from 'react';

export const reviewSchema = z.object({
  reviewText: z.string().min(10, 'Review must be at least 10 characters').max(500, 'Review cannot exceed 500 characters'),
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating cannot exceed 5'),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  onSubmitReview: (data: ReviewFormData) => Promise<void>;
}

export function ReviewForm({ onSubmitReview }: ReviewFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      reviewText: '',
      rating: 5,
    },
  });

  const handleSubmit = async (data: ReviewFormData) => {
    setIsLoading(true);
    try {
      await onSubmitReview(data);
      form.reset();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-6 bg-card rounded-xl shadow-sm">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Rating</FormLabel>
              <FormControl>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => field.onChange(star)}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`h-6 w-6 ${star <= field.value ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                      />
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reviewText"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="reviewText">Your Review</FormLabel>
              <FormControl>
                <Textarea
                  id="reviewText"
                  placeholder="Tell us about your experience with ItemRetriever..."
                  className="min-h-[120px] resize-y"
                  {...field}
                  aria-describedby="reviewText-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 transition-colors"
          disabled={isLoading}
          aria-label="Submit review"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Submit Review
        </Button>
      </form>
    </Form>
  );
}