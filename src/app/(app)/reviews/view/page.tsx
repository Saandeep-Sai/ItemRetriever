"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewCard, Review } from '@/components/ReviewCard';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';
import { LoaderCircle } from 'lucide-react';

export default function ReviewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const reviewsQuery = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(reviewsQuery);
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        author: doc.data().author,
        avatarUrl: doc.data().avatarUrl,
        date: new Date(doc.data().createdAt).toLocaleDateString(),
        rating: doc.data().rating || 5, // Default rating if not provided
        text: doc.data().reviewText,
      } as Review));
      setReviews(fetchedReviews);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load reviews.',
        variant: 'destructive',
      });
      console.error('Error fetching reviews:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (data: { reviewText: string }) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit a review.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await addDoc(collection(db, 'reviews'), {
        userId: user.uid,
        author: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        avatarUrl: user.photoURL,
        reviewText: data.reviewText,
        rating: 5, // Fixed rating for simplicity; could add a rating field
        createdAt: new Date().toISOString(),
      });
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
      });
      fetchReviews(); // Refresh reviews
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to submit review.',
        variant: 'destructive',
      });
      console.error('Error submitting review:', error.message);
    }
  };

  return (
    <>
      <PublicHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">User Reviews</h1>
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="text-xl font-semibold mb-4">Share Your Experience</h2>
          <ReviewForm onSubmitReview={handleSubmitReview} />
        </div>
        {isLoading ? (
          <div className="flex justify-center">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
      <PublicFooter />
    </>
  );
}