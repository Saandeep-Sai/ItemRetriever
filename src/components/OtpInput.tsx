"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

export type OtpFormData = z.infer<typeof otpSchema>;

interface OtpInputProps {
  email?: string;
  onSubmit: (data: OtpFormData) => void;
  onResendOtp: () => void;
  isLoading: boolean;
  isDisabled: boolean;
}

export function OtpInputComponent({ email, onSubmit, onResendOtp, isLoading, isDisabled }: OtpInputProps) {
  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6 bg-card rounded-xl shadow-sm">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="otp">Enter OTP</FormLabel>
              <FormControl>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit OTP for ItemRetriever"
                  {...field}
                  disabled={isDisabled || isLoading}
                  aria-describedby="otp-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 transition-colors"
          disabled={isLoading || isDisabled}
          aria-label="Verify OTP"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify OTP'}
        </Button>
        <Button
          variant="outline"
          className="w-full hover:bg-accent transition-colors"
          onClick={onResendOtp}
          disabled={isLoading || !isDisabled}
          aria-label="Resend OTP"
        >
          Resend OTP
        </Button>
      </form>
    </Form>
  );
}