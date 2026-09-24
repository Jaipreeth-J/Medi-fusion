import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  FileImage, 
  Trash2, 
  Clock, 
  Sparkles, 
  Loader2, 
  FileText,
  Maximize2 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { MedicalImage } from '@/hooks/useMedicalImages';
import { IMAGE_TYPES } from '@/lib/constants';
import { sanitizeAI } from '@/lib/sanitize';

interface ImageCardProps {
  image: MedicalImage;
  onDelete: (id: string) => void;
  analyzeImage: (id: string) => Promise<void>;
  analyzing: string | null;
  getImageUrl: (filePath: string) => Promise<string | null>;
}

export function ImageCard({ image, onDelete, analyzeImage, analyzing, getImageUrl }: ImageCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(true);
  const [showResult, setShowResult] = useState(false);

  const isAnalyzing = analyzing === image.id;
  const imageTypeLabel = IMAGE_TYPES.find(t => t.value === image.image_type)?.label || image.image_type;
  const isPdf = image.file_type === 'application/pdf';

  useEffect(() => {
    const loadUrl = async () => {
      setLoadingUrl(true);
      const url = await getImageUrl(image.file_path);
      setImageUrl(url);
      setLoadingUrl(false);
    };
    loadUrl();
  }, [image.file_path]);

  // Auto-show result dialog when analysis completes
  useEffect(() => {
    if (image.ai_summary && showResult) {
      // Keep dialog open — it was waiting for analysis
    }
  }, [image.ai_summary]);

  const handleAnalyze = async () => {
    setShowResult(true);
    await analyzeImage(image.id);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isPdf ? (
              <FileText className="h-5 w-5 text-primary shrink-0" />
            ) : (
              <FileImage className="h-5 w-5 text-primary shrink-0" />
            )}
            <div className="min-w-0">
              <h3 className="font-medium text-sm truncate">{image.file_name}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(parseISO(image.created_at), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Image</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this medical image? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(image.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Image Preview */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {loadingUrl ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isPdf ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="h-12 w-12 mb-2" />
              <span className="text-sm">PDF Document</span>
            </div>
          ) : imageUrl ? (
            <>
              <img 
                src={imageUrl} 
                alt={image.file_name}
                className="w-full h-full object-cover"
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute bottom-2 right-2 h-8 w-8"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>{image.file_name}</DialogTitle>
                  </DialogHeader>
                  <img 
                    src={imageUrl} 
                    alt={image.file_name}
                    className="w-full rounded-lg"
                  />
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <FileImage className="h-12 w-12" />
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{imageTypeLabel}</Badge>
          {image.body_part && (
            <Badge variant="outline" className="capitalize">{image.body_part}</Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {formatFileSize(image.file_size_bytes)}
          </Badge>
        </div>

        {image.description && (
          <p className="text-sm text-muted-foreground">{image.description}</p>
        )}

        {/* AI Summary — inline or via dialog */}
        {image.ai_summary ? (
          <Dialog open={showResult} onOpenChange={setShowResult}>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  Clinical Analysis
                </div>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    View Full
                  </Button>
                </DialogTrigger>
              </div>
              <div 
                className="text-sm prose prose-sm max-w-none dark:prose-invert line-clamp-4 [&_hr]:my-2 [&_hr]:border-primary/20 [&_b]:text-foreground [&_ul]:my-1 [&_li]:my-0"
                dangerouslySetInnerHTML={{ __html: sanitizeAI(image.ai_summary) }}
              />
              {image.analyzed_at && (
                <p className="text-xs text-muted-foreground">
                  Generated on {format(parseISO(image.analyzed_at), 'PPp')}
                </p>
              )}
            </div>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Clinical Analysis
                </DialogTitle>
              </DialogHeader>
              <div 
                className="text-sm prose prose-sm max-w-none dark:prose-invert [&_hr]:my-2 [&_hr]:border-primary/20 [&_b]:text-foreground [&_ul]:my-1 [&_li]:my-0"
                dangerouslySetInnerHTML={{ __html: sanitizeAI(image.ai_summary) }}
              />
              {image.analyzed_at && (
                <p className="text-xs text-muted-foreground border-t pt-2">
                  Generated on {format(parseISO(image.analyzed_at), 'PPp')}
                </p>
              )}
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={showResult && isAnalyzing} onOpenChange={(v) => { if (!isAnalyzing) setShowResult(v); }}>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              variant="outline"
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Image
                </>
              )}
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Analyzing Image...
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground text-center">
                  AI is analyzing your medical image. This may take a moment...
                </p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
