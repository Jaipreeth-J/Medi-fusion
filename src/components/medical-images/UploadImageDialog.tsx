import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, FileImage, Loader2, X, AlertTriangle } from 'lucide-react';
import { UploadData } from '@/hooks/useMedicalImages';
import { IMAGE_TYPES, BODY_PARTS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface UploadImageDialogProps {
  uploadImage: (data: UploadData) => Promise<any>;
  uploading: boolean;
}

export function UploadImageDialog({ uploadImage, uploading }: UploadImageDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageType, setImageType] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setImageType('');
    setBodyPart('');
    setDescription('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        alert('Please select a valid image file (JPEG, PNG, WebP) or PDF');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile);
        setPreview(url);
      } else {
        setPreview(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    }
  };

  const handleSubmit = async () => {
    if (!file || !imageType || !bodyPart) return;

    const uploadData: UploadData = {
      file,
      image_type: imageType,
      body_part: bodyPart,
      description: description.trim() || undefined,
    };

    const result = await uploadImage(uploadData);
    if (result) {
      setOpen(false);
      resetForm();
    }
  };

  const isValid = file && imageType && bodyPart;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5 text-primary" />
            Upload Medical Image
          </DialogTitle>
          <DialogDescription>
            Upload X-rays, lab reports, prescriptions, or other medical documents for secure storage and AI-powered educational summaries.
          </DialogDescription>
        </DialogHeader>
        
        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg text-sm">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
          <p className="text-muted-foreground">
            <strong className="text-foreground">Educational Only:</strong> AI summaries are for educational purposes only and do not constitute medical advice or diagnosis.
          </p>
        </div>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Label>Medical Image / Document</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={cn(
                "mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                file ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
              )}
            >
              {preview ? (
                <div className="relative">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-h-40 mx-auto rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-0 right-0 h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (preview) URL.revokeObjectURL(preview);
                      setFile(null);
                      setPreview(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileImage className="h-8 w-8 text-primary" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click or drag file to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WebP, or PDF (max 10MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Image Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="image-type">Document Type *</Label>
              <Select value={imageType} onValueChange={setImageType}>
                <SelectTrigger id="image-type" className="mt-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Body Part */}
            <div>
              <Label htmlFor="body-part">Body Part *</Label>
              <Select value={bodyPart} onValueChange={setBodyPart}>
                <SelectTrigger id="body-part" className="mt-2">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {BODY_PARTS.map((part) => (
                    <SelectItem key={part} value={part.toLowerCase()}>
                      {part}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any notes about this image..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 resize-none"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
