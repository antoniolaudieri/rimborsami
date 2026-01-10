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

export interface ParsedDocumentData {
  document_type?: string;
  confidence?: number;
  extracted_data?: Record<string, unknown>;
  potential_issues?: string[];
  suggested_categories?: string[];
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

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error('Errore durante l\'upload del file');
        }

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
