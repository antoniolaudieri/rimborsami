import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plane, 
  ShoppingCart, 
  Phone, 
  Zap, 
  Building, 
  Shield, 
  Car, 
  Building2, 
  Briefcase, 
  Receipt, 
  Heart,
  FileText,
  AlertTriangle,
  FolderOpen,
  LayoutGrid,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DocumentSummaryCard from './DocumentSummaryCard';

interface Document {
  id: string;
  file_name: string;
  parsed_data: any;
  created_at: string;
  processing_status: string;
  file_url?: string;
}

interface DocumentCatalogProps {
  documents: Document[];
  onDocumentClick?: (document: Document) => void;
}

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  voli: { icon: Plane, color: 'text-sky-700', bgColor: 'bg-sky-500/10', label: 'Voli' },
  ecommerce: { icon: ShoppingCart, color: 'text-purple-700', bgColor: 'bg-purple-500/10', label: 'E-commerce' },
  telecom: { icon: Phone, color: 'text-blue-700', bgColor: 'bg-blue-500/10', label: 'Telecom' },
  energia: { icon: Zap, color: 'text-yellow-700', bgColor: 'bg-yellow-500/10', label: 'Energia' },
  banche: { icon: Building, color: 'text-green-700', bgColor: 'bg-green-500/10', label: 'Banche' },
  assicurazioni: { icon: Shield, color: 'text-indigo-700', bgColor: 'bg-indigo-500/10', label: 'Assicurazioni' },
  auto: { icon: Car, color: 'text-orange-700', bgColor: 'bg-orange-500/10', label: 'Auto' },
  condominio: { icon: Building2, color: 'text-teal-700', bgColor: 'bg-teal-500/10', label: 'Condominio' },
  lavoro: { icon: Briefcase, color: 'text-pink-700', bgColor: 'bg-pink-500/10', label: 'Lavoro' },
  fisco: { icon: Receipt, color: 'text-red-700', bgColor: 'bg-red-500/10', label: 'Fisco' },
  sanita: { icon: Heart, color: 'text-rose-700', bgColor: 'bg-rose-500/10', label: 'Sanità' },
  altro: { icon: FileText, color: 'text-gray-700', bgColor: 'bg-gray-500/10', label: 'Altro' }
};

export const DocumentCatalog: React.FC<DocumentCatalogProps> = ({ 
  documents, 
  onDocumentClick 
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Group documents by category
  const documentsByCategory = useMemo(() => {
    const grouped: Record<string, Document[]> = {};
    
    documents.forEach(doc => {
      const category = doc.parsed_data?.document_category || 'altro';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(doc);
    });

    // Sort each category by date
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return grouped;
  }, [documents]);

  // Get categories with counts and issues
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; issues: number }> = {};
    
    Object.entries(documentsByCategory).forEach(([category, docs]) => {
      const issueCount = docs.reduce((acc, doc) => {
        const data = doc.parsed_data || {};
        return acc + 
          (data.potential_issues?.length || 0) +
          (data.bank_analysis?.anomalies?.length || 0) +
          (data.condominium_analysis?.irregularities?.length || 0) +
          (data.work_analysis?.irregularities?.length || 0) +
          (data.auto_analysis?.irregularities?.length || 0);
      }, 0);
      
      stats[category] = { count: docs.length, issues: issueCount };
    });

    return stats;
  }, [documentsByCategory]);

  // Get active documents
  const activeDocuments = useMemo(() => {
    if (activeCategory === 'all') {
      return documents.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return documentsByCategory[activeCategory] || [];
  }, [activeCategory, documents, documentsByCategory]);

  // Calculate total issues
  const totalIssues = useMemo(() => {
    return Object.values(categoryStats).reduce((acc, stat) => acc + stat.issues, 0);
  }, [categoryStats]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Catalogo Documenti
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Category Tabs */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
              className="shrink-0"
            >
              Tutti
              <Badge variant="secondary" className="ml-2">
                {documents.length}
              </Badge>
            </Button>
            
            {Object.entries(categoryStats)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([category, stats]) => {
                const config = categoryConfig[category] || categoryConfig.altro;
                const IconComponent = config.icon;
                
                return (
                  <Button
                    key={category}
                    variant={activeCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "shrink-0",
                      activeCategory !== category && config.color
                    )}
                  >
                    <IconComponent className="h-4 w-4 mr-1" />
                    {config.label}
                    <Badge variant="secondary" className="ml-2">
                      {stats.count}
                    </Badge>
                    {stats.issues > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="ml-1 bg-yellow-500 text-yellow-900"
                      >
                        {stats.issues}
                      </Badge>
                    )}
                  </Button>
                );
              })}
          </div>
        </ScrollArea>

        {/* Summary Stats */}
        {activeCategory !== 'all' && categoryStats[activeCategory] && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              {React.createElement(
                categoryConfig[activeCategory]?.icon || FileText, 
                { className: cn("h-5 w-5", categoryConfig[activeCategory]?.color) }
              )}
              <span className="font-medium">{categoryConfig[activeCategory]?.label}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {categoryStats[activeCategory].count} documenti
            </div>
            {categoryStats[activeCategory].issues > 0 && (
              <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {categoryStats[activeCategory].issues} problemi rilevati
              </Badge>
            )}
          </div>
        )}

        {/* Documents Grid/List */}
        {activeDocuments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nessun documento in questa categoria</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDocuments.map(doc => (
              <DocumentSummaryCard
                key={doc.id}
                document={doc}
                onClick={() => onDocumentClick?.(doc)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {activeDocuments.map(doc => (
              <DocumentSummaryCard
                key={doc.id}
                document={doc}
                onClick={() => onDocumentClick?.(doc)}
                compact
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentCatalog;
