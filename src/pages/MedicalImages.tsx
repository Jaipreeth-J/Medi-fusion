import { AppLayout } from '@/components/layout/AppLayout';
import { SafetyDisclaimer } from '@/components/common/SafetyDisclaimer';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { UploadImageDialog } from '@/components/medical-images/UploadImageDialog';
import { ImageCard } from '@/components/medical-images/ImageCard';
import { useMedicalImages } from '@/hooks/useMedicalImages';
import { FileImage, Shield, AlertTriangle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MedicalImages() {
  const hook = useMedicalImages();
  const { images, loading, deleteImage } = hook;

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-4 py-5 space-y-6 sm:px-6 sm:py-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileImage className="h-8 w-8 text-primary" />
              Medical Images
            </h1>
            <p className="text-muted-foreground mt-1">
              Securely store and analyze your medical images and documents
            </p>
          </div>
          <UploadImageDialog
            uploadImage={hook.uploadImage}
            uploading={hook.uploading}
          />
        </div>

        {/* Safety & Privacy Notice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Educational Summaries Only</h3>
                <p className="text-sm text-muted-foreground">
                  AI-generated summaries are for educational purposes only. They are NOT medical diagnoses or professional opinions. Always consult healthcare professionals.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Secure Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Your medical images are encrypted and stored securely. Only you have access to your files and data.
                </p>
              </div>
            </div>
          </div>
        </div>

        <SafetyDisclaimer variant="compact" />

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {images.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-xl">
                <FileImage className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">No images uploaded</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Upload X-rays, lab reports, prescriptions, or other medical documents for secure storage and educational AI summaries.
                </p>
                <UploadImageDialog
                  uploadImage={hook.uploadImage}
                  uploading={hook.uploading}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    onDelete={deleteImage}
                    analyzeImage={hook.analyzeImage}
                    analyzing={hook.analyzing}
                    getImageUrl={hook.getImageUrl}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Features Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">HIPAA-Conscious</h4>
              <p className="text-xs text-muted-foreground">Designed with privacy in mind</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
            <FileImage className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Multiple Formats</h4>
              <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, PDF supported</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
            <Lock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Private Access</h4>
              <p className="text-xs text-muted-foreground">Only you can view your files</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
