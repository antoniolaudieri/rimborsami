import { Star } from "lucide-react";

interface AppRatingProps {
  rating?: number;
  reviews?: string;
  compact?: boolean;
}

const AppRating = ({ rating = 4.8, reviews = "2.500+", compact = false }: AppRatingProps) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < fullStars
                  ? "fill-accent text-accent"
                  : i === fullStars && hasHalfStar
                  ? "fill-accent/50 text-accent"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">{rating}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 bg-card rounded-full border border-border/50 shadow-sm">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < fullStars
                ? "fill-accent text-accent"
                : i === fullStars && hasHalfStar
                ? "fill-accent/50 text-accent"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-baseline gap-1">
        <span className="font-semibold">{rating}</span>
        <span className="text-sm text-muted-foreground">({reviews} recensioni)</span>
      </div>
    </div>
  );
};

export default AppRating;
