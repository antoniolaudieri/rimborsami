import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NewsFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { value: 'all', label: 'Tutti' },
  { value: 'flight', label: 'Voli' },
  { value: 'telecom', label: 'Telefonia' },
  { value: 'energy', label: 'Energia' },
  { value: 'bank', label: 'Banche' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'class_action', label: 'Class Action' },
  { value: 'insurance', label: 'Assicurazioni' },
];

export function NewsFilters({ selectedCategory, onCategoryChange }: NewsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Button
          key={cat.value}
          variant={selectedCategory === cat.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(cat.value)}
          className={cn(
            'transition-all',
            selectedCategory === cat.value && 'shadow-md'
          )}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  );
}
