"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';
import { LoaderCircle, Upload } from 'lucide-react';
import { useState } from 'react';

const foundItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['electronics', 'books', 'clothing', 'other'], { required_error: 'Category is required' }),
  location: z.string().min(1, 'Found location is required'),
  image: z.instanceof(File).optional().refine(file => !file || file.size <= 300 * 1024, {
    message: 'Image must be less than 300KB',
  }).refine(file => !file || ['image/jpeg', 'image/png', 'image/gif'].includes(file.type), {
    message: 'Image must be JPEG, PNG, or GIF',
  }),
});

type FoundItemFormData = z.infer<typeof foundItemSchema>;

export default function FoundItemReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FoundItemFormData>({
    resolver: zodResolver(foundItemSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'other',
      location: '',
      image: undefined,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (file: File | undefined) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      onChange(undefined);
      setImagePreview(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    toast({
      title: 'Authentication Required',
      description: 'Please log in to report a found item.',
      variant: 'destructive',
    });
    router.push('/login');
    return null;
  }

  const onSubmit = async (data: FoundItemFormData) => {
    setIsLoading(true);
    try {
      const itemRef = doc(collection(db, 'found-items'));
      const itemId = itemRef.id;
      const docData: any = {
        name: data.name,
        description: data.description,
        category: data.category,
        location: data.location,
        userId: user.uid,
        email: user.email,
        reportedAt: new Date().toISOString(),
        status: 'open',
        visibility: 'public',
      };

      if (data.image) {
        const imageBase64 = await fileToBase64(data.image);
        if (imageBase64.length > 400 * 1024) {
          throw new Error('Encoded image exceeds 400KB limit.');
        }
        docData.imageBase64 = imageBase64;
      }

      await setDoc(doc(db, 'found-items', itemId), docData);
      toast({
        title: 'Found Item Posted',
        description: 'Your found item has been posted, and notifications have been sent to potential matches.',
      });
      router.push('/search-match');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to post found item.',
        variant: 'destructive',
      });
      console.error('Error posting found item:', error.message);
    } finally {
      setIsLoading(false);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-foreground">Post Found Item</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Blue Backpack" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Blue backpack with black straps" {...field} />
                </FormControl>
                <FormDescription>Provide a detailed description of the item.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Found</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Library 2nd Floor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Image (Optional)</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={(e) => handleImageChange(e, field.onChange)}
                      disabled={isLoading}
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-xs rounded-md shadow-sm"
                      />
                    )}
                  </div>
                </FormControl>
                <FormDescription>Upload a clear image of the item (max 300KB, JPEG/PNG/GIF).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Post Found Item
          </Button>
        </form>
      </Form>
    </div>
  );
}