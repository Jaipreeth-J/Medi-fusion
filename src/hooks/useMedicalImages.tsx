import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { isRateLimited } from '@/lib/rateLimitHandler';

export interface MedicalImage {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size_bytes: number | null;
  image_type: string | null;
  body_part: string | null;
  description: string | null;
  ai_summary: string | null;
  analyzed_at: string | null;
  created_at: string;
}

export interface UploadData {
  file: File;
  image_type: string;
  body_part: string;
  description?: string;
}

export function useMedicalImages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const { data: images = [], isLoading: loading } = useQuery({
    queryKey: ['medical-images', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('medical_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as MedicalImage[];
    },
    enabled: !!user?.id,
  });

  const uploadMutation = useMutation({
    mutationFn: async (uploadData: UploadData) => {
      if (!user?.id) throw new Error('Not authenticated');

      const fileExt = uploadData.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-images')
        .upload(filePath, uploadData.file);

      if (uploadError) throw uploadError;

      const { data, error: dbError } = await supabase
        .from('medical_images')
        .insert({
          user_id: user.id,
          file_name: uploadData.file.name,
          file_path: filePath,
          file_type: uploadData.file.type,
          file_size_bytes: uploadData.file.size,
          image_type: uploadData.image_type,
          body_part: uploadData.body_part,
          description: uploadData.description || null,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return data as MedicalImage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-images'] });
      toast.success('Your medical image has been uploaded securely');
    },
    onError: (error) => {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload the image. Please try again.');
    },
  });

  const uploadImage = async (uploadData: UploadData) => {
    try {
      return await uploadMutation.mutateAsync(uploadData);
    } catch {
      return null;
    }
  };

  const analyzeImage = async (imageId: string) => {
    if (!user) return;

    const image = images.find(img => img.id === imageId);
    if (!image) return;

    try {
      setAnalyzing(imageId);

      const { data: urlData, error: urlError } = await supabase.storage
        .from('medical-images')
        .createSignedUrl(image.file_path, 3600);

      if (urlError) throw urlError;

      const { data, error } = await supabase.functions.invoke('analyze-medical-image', {
        body: {
          imageUrl: urlData.signedUrl,
          imageType: image.image_type,
          bodyPart: image.body_part,
          fileName: image.file_name,
        },
      });

      if (error) {
        if (isRateLimited({ error })) return;
        throw error;
      }

      const { error: updateError } = await supabase
        .from('medical_images')
        .update({
          ai_summary: data.summary,
          analyzed_at: new Date().toISOString(),
        })
        .eq('id', imageId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['medical-images'] });
      toast.success('Educational summary has been generated');
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze the image. Please try again.');
    } finally {
      setAnalyzing(null);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const image = images.find(img => img.id === imageId);
      if (!image) throw new Error('Image not found');

      const { error: storageError } = await supabase.storage
        .from('medical-images')
        .remove([image.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('medical_images')
        .delete()
        .eq('id', imageId)
        .eq('user_id', user.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-images'] });
      toast.success('The medical image has been removed');
    },
    onError: (error) => {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete the image');
    },
  });

  const deleteImage = async (imageId: string) => {
    try {
      await deleteMutation.mutateAsync(imageId);
    } catch {
      // handled by onError
    }
  };

  const getImageUrl = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from('medical-images')
      .createSignedUrl(filePath, 3600);

    if (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
    return data.signedUrl;
  };

  return {
    images,
    loading,
    uploading: uploadMutation.isPending,
    analyzing,
    uploadImage,
    analyzeImage,
    deleteImage,
    getImageUrl,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['medical-images'] }),
  };
}
