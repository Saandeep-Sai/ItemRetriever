import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

export interface Review {
  id: string;
  author: string;
  avatarUrl?: string;
  date: string;
  rating: number;
  text: string;
}

interface ReviewCardProps {
  review: Review;
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  return (
    <Card className={`shadow-md hover:shadow-xl transition-shadow duration-300 rounded-xl ${className}`}>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar>
          <AvatarImage src={review.avatarUrl || 'https://placehold.co/40x40.png'} alt={review.author} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {review.author.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg font-semibold">{review.author}</CardTitle>
          <p className="text-xs text-muted-foreground">{review.date}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground">{review.text}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-start gap-1 pt-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`h-5 w-5 ${index < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">({review.rating.toFixed(1)})</span>
      </CardFooter>
    </Card>
  );
}