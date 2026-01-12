import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface Document {
  id: string;
  user_id: string;
  type: 'email' | 'pdf' | 'image';
  source: string | null;
  file_name: string | null;
  file_url: string | null;
  file_size: number | null;
  processing_status: string | null;
  parsed_data: Json | null;
  created_at: string;
}

export interface BankAnalysis {
  account_type?: 'conto_corrente' | 'mutuo' | 'prestito' | 'fido' | 'carta_credito';
  bank_name?: string;
  period?: { from: string; to: string };
  interest_analysis?: {
    nominal_rate?: number;
    effective_rate?: number;
    usury_threshold?: number;
    is_usurious?: boolean;
    excess_amount?: number;
  };
  fees_analysis?: {
    total_fees?: number;
    suspicious_fees?: Array<{
      name: string;
      amount: number;
      issue: string;
    }>;
  };
  late_fees_analysis?: {
    total_late_fees?: number;
    legal_limit?: number;
    excess_amount?: number;
    is_excessive?: boolean;
  };
  risk_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  estimated_refund?: number;
  anomalies_found?: string[];
}

// Condominium document analysis
export interface CondominiumAnalysis {
  document_subtype?: 'verbale_assemblea' | 'rendiconto' | 'preventivo' | 'tabella_millesimale' | 'convocazione';
  assembly_info?: {
    date?: string;
    type?: 'ordinaria' | 'straordinaria';
    quorum_reached?: boolean;
    attendees_count?: number;
    millesimi_present?: number;
    millesimi_total?: number;
  };
  deliberations?: Array<{
    topic: string;
    votes_favor: number;
    votes_against: number;
    required_majority: string;
    is_valid: boolean;
  }>;
  financial_info?: {
    total_expenses?: number;
    reserve_fund?: number;
    per_millesimo_cost?: number;
    suspicious_entries?: Array<{
      description: string;
      amount: number;
      issue: string;
    }>;
  };
  irregularities?: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    legal_reference?: string;
  }>;
  risk_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  actionable_advice?: string[];
}

// Work document analysis (buste paga, contratti, CUD)
export interface WorkAnalysis {
  document_subtype?: 'busta_paga' | 'contratto_lavoro' | 'cud' | 'tfr' | 'lettera_licenziamento';
  employer?: string;
  period?: { month?: number; year?: number; from?: string; to?: string };
  salary_info?: {
    gross_salary?: number;
    net_salary?: number;
    inps_contributions?: number;
    irpef?: number;
    regional_tax?: number;
    municipal_tax?: number;
    tfr_accrued?: number;
    remaining_holidays?: number;
    remaining_permits?: number;
  };
  contract_info?: {
    type?: string;
    level?: string;
    ccnl?: string;
    start_date?: string;
    end_date?: string;
  };
  irregularities?: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    legal_reference?: string;
  }>;
  risk_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  actionable_advice?: string[];
}

// Health document analysis
export interface HealthAnalysis {
  document_subtype?: 'fattura_medica' | 'referto' | 'prescrizione' | 'ticket';
  provider?: string;
  date?: string;
  amount?: number;
  deductible_amount?: number;
  deduction_type?: '19%' | '730_detrazione' | 'non_detraibile';
  services?: Array<{
    description: string;
    amount: number;
    deductible: boolean;
  }>;
  tax_info?: {
    total_deductible?: number;
    estimated_refund?: number;
  };
  risk_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
}

// Auto document analysis
export interface AutoAnalysis {
  document_subtype?: 'bollo' | 'assicurazione' | 'revisione' | 'multa' | 'finanziamento';
  vehicle_info?: {
    plate?: string;
    brand?: string;
    model?: string;
  };
  deadline?: string;
  amount?: number;
  fine_info?: {
    violation?: string;
    date?: string;
    original_amount?: number;
    reduced_amount?: number;
    payment_deadline?: string;
    contestable?: boolean;
    contest_deadline?: string;
  };
  insurance_info?: {
    company?: string;
    policy_number?: string;
    coverage_type?: string;
    start_date?: string;
    end_date?: string;
    premium?: number;
  };
  irregularities?: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }>;
  risk_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  actionable_advice?: string[];
}

export interface ParsedDocumentData {
  document_type?: string;
  confidence?: number;
  extracted_data?: Record<string, unknown>;
  potential_issues?: string[];
  suggested_categories?: string[];
  bank_analysis?: BankAnalysis;
  condominium_analysis?: CondominiumAnalysis;
  work_analysis?: WorkAnalysis;
  health_analysis?: HealthAnalysis;
  auto_analysis?: AutoAnalysis;
  summary?: string;
  risk_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
}

// Helper function to check if document has anomalies
export function hasAnomalies(parsedData: ParsedDocumentData | null): boolean {
  if (!parsedData) return false;
  
  const { bank_analysis, condominium_analysis, work_analysis, auto_analysis, risk_level } = parsedData;
  
  if (risk_level === 'high' || risk_level === 'critical') return true;
  
  if (bank_analysis) {
    if (bank_analysis.interest_analysis?.is_usurious) return true;
    if (bank_analysis.late_fees_analysis?.is_excessive) return true;
    if (bank_analysis.fees_analysis?.suspicious_fees?.length) return true;
    if ((bank_analysis.risk_score ?? 0) >= 50) return true;
  }
  
  if (condominium_analysis) {
    if (condominium_analysis.irregularities?.length) return true;
    if ((condominium_analysis.risk_score ?? 0) >= 50) return true;
  }
  
  if (work_analysis) {
    if (work_analysis.irregularities?.length) return true;
    if ((work_analysis.risk_score ?? 0) >= 50) return true;
  }
  
  if (auto_analysis) {
    if (auto_analysis.irregularities?.length) return true;
    if ((auto_analysis.risk_score ?? 0) >= 50) return true;
  }
  
  return false;
}

// Helper function to get document category from parsed data
export function getDocumentCategory(parsedData: ParsedDocumentData | null): string {
  if (!parsedData) return 'other';
  
  if (parsedData.bank_analysis) return 'bank';
  if (parsedData.condominium_analysis) return 'condominium';
  if (parsedData.work_analysis) return 'work';
  if (parsedData.health_analysis) return 'health';
  if (parsedData.auto_analysis) return 'auto';
  
  const categories = parsedData.suggested_categories || [];
  if (categories.includes('flight')) return 'flight';
  if (categories.includes('ecommerce')) return 'ecommerce';
  if (categories.includes('telecom')) return 'telecom';
  if (categories.includes('energy')) return 'energy';
  if (categories.includes('insurance')) return 'insurance';
  
  return 'other';
}

// Helper function to get risk score from parsed data
export function getRiskScore(parsedData: ParsedDocumentData | null): number {
  if (!parsedData) return 0;
  
  // Check top-level risk_score first
  if (parsedData.risk_score !== undefined) return parsedData.risk_score;
  
  // Check specialized analyses
  if (parsedData.bank_analysis?.risk_score !== undefined) return parsedData.bank_analysis.risk_score;
  if (parsedData.condominium_analysis?.risk_score !== undefined) return parsedData.condominium_analysis.risk_score;
  if (parsedData.work_analysis?.risk_score !== undefined) return parsedData.work_analysis.risk_score;
  if (parsedData.health_analysis?.risk_score !== undefined) return parsedData.health_analysis.risk_score;
  if (parsedData.auto_analysis?.risk_score !== undefined) return parsedData.auto_analysis.risk_score;
  
  // Calculate from potential_issues if present
  if (parsedData.potential_issues?.length) {
    return Math.min(100, parsedData.potential_issues.length * 15);
  }
  
  return 0;
}

// Helper function to get risk level from parsed data
export function getRiskLevel(parsedData: ParsedDocumentData | null): 'low' | 'medium' | 'high' | 'critical' | null {
  if (!parsedData) return null;
  
  // Check top-level risk_level first
  if (parsedData.risk_level) return parsedData.risk_level;
  
  // Check specialized analyses
  if (parsedData.bank_analysis?.risk_level) return parsedData.bank_analysis.risk_level;
  if (parsedData.condominium_analysis?.risk_level) return parsedData.condominium_analysis.risk_level;
  if (parsedData.work_analysis?.risk_level) return parsedData.work_analysis.risk_level;
  if (parsedData.health_analysis?.risk_level) return parsedData.health_analysis.risk_level;
  if (parsedData.auto_analysis?.risk_level) return parsedData.auto_analysis.risk_level;
  
  // Calculate from risk score
  const score = getRiskScore(parsedData);
  if (score >= 76) return 'critical';
  if (score >= 51) return 'high';
  if (score >= 26) return 'medium';
  if (score > 0) return 'low';
  
  return null;
}

// Get all anomalies from any type of document
export function getDocumentAnomalies(parsedData: ParsedDocumentData | null): string[] {
  if (!parsedData) return [];
  
  const anomalies: string[] = [];
  
  // General potential issues
  if (parsedData.potential_issues?.length) {
    anomalies.push(...parsedData.potential_issues);
  }
  
  // Bank anomalies
  if (parsedData.bank_analysis?.anomalies_found?.length) {
    anomalies.push(...parsedData.bank_analysis.anomalies_found);
  }
  
  // Condominium irregularities
  if (parsedData.condominium_analysis?.irregularities?.length) {
    parsedData.condominium_analysis.irregularities.forEach(i => {
      anomalies.push(i.description);
    });
  }
  
  // Work irregularities
  if (parsedData.work_analysis?.irregularities?.length) {
    parsedData.work_analysis.irregularities.forEach(i => {
      anomalies.push(i.description);
    });
  }
  
  // Auto irregularities
  if (parsedData.auto_analysis?.irregularities?.length) {
    parsedData.auto_analysis.irregularities.forEach(i => {
      anomalies.push(i.description);
    });
  }
  
  return [...new Set(anomalies)]; // Remove duplicates
}

export function useDocuments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data as Document[]) || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i documenti',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    fetchDocuments();

    const channel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Document change:', payload);
          
          if (payload.eventType === 'INSERT') {
            setDocuments((prev) => [payload.new as Document, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setDocuments((prev) =>
              prev.map((doc) =>
                doc.id === payload.new.id ? (payload.new as Document) : doc
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setDocuments((prev) =>
              prev.filter((doc) => doc.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchDocuments]);

  // Upload document
  const uploadDocument = useCallback(
    async (file: File): Promise<boolean> => {
      if (!user) return false;

      setUploading(true);
      setUploadProgress(0);

      try {
        // Determine file type
        let fileType: 'pdf' | 'image' | 'email' = 'pdf';
        if (file.type.startsWith('image/')) {
          fileType = 'image';
        } else if (file.type === 'application/pdf') {
          fileType = 'pdf';
        }

        // Upload to storage
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        
        setUploadProgress(20);
        console.log('Uploading file to storage:', filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error(`Errore upload: ${uploadError.message}`);
        }
        
        console.log('File uploaded successfully:', uploadData);

        setUploadProgress(60);

        // Create document record
        const { data: docData, error: insertError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            type: fileType,
            source: 'upload',
            file_name: file.name,
            file_url: filePath,
            file_size: file.size,
            processing_status: 'pending',
          })
          .select()
          .single();

        if (insertError) {
          // Clean up uploaded file if document creation fails
          await supabase.storage.from('documents').remove([filePath]);
          throw insertError;
        }

        setUploadProgress(80);

        // Trigger processing
        try {
          const { error: fnError } = await supabase.functions.invoke('process-document', {
            body: { document_id: docData.id },
          });

          if (fnError) {
            console.error('Process function error:', fnError);
            // Don't throw - document is uploaded, just processing failed
          }
        } catch (fnErr) {
          console.error('Failed to trigger processing:', fnErr);
        }

        setUploadProgress(100);

        toast({
          title: 'Documento caricato',
          description: 'Il documento verrà analizzato automaticamente',
        });

        return true;
      } catch (error) {
        console.error('Error uploading document:', error);
        toast({
          title: 'Errore',
          description: error instanceof Error ? error.message : 'Impossibile caricare il documento',
          variant: 'destructive',
        });
        return false;
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [user, toast]
  );

  // Delete document
  const deleteDocument = useCallback(
    async (id: string, fileUrl: string | null): Promise<boolean> => {
      try {
        // Delete from storage if file exists
        if (fileUrl) {
          await supabase.storage.from('documents').remove([fileUrl]);
        }

        // Delete record
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Eliminato',
          description: 'Il documento è stato eliminato',
        });

        return true;
      } catch (error) {
        console.error('Error deleting document:', error);
        toast({
          title: 'Errore',
          description: 'Impossibile eliminare il documento',
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast]
  );

  // Reprocess document
  const reprocessDocument = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        // Update status to pending
        await supabase
          .from('documents')
          .update({ processing_status: 'pending' })
          .eq('id', id);

        // Trigger processing
        const { error } = await supabase.functions.invoke('process-document', {
          body: { document_id: id },
        });

        if (error) throw error;

        toast({
          title: 'Rielaborazione avviata',
          description: 'Il documento verrà analizzato nuovamente',
        });

        return true;
      } catch (error) {
        console.error('Error reprocessing document:', error);
        toast({
          title: 'Errore',
          description: 'Impossibile rielaborare il documento',
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast]
  );

  // Get signed URL for document preview
  const getPreviewUrl = useCallback(
    async (fileUrl: string): Promise<string | null> => {
      try {
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(fileUrl, 3600); // 1 hour

        if (error) throw error;
        return data.signedUrl;
      } catch (error) {
        console.error('Error getting preview URL:', error);
        return null;
      }
    },
    []
  );

  return {
    documents,
    loading,
    uploading,
    uploadProgress,
    uploadDocument,
    deleteDocument,
    reprocessDocument,
    getPreviewUrl,
    refetch: fetchDocuments,
  };
}
