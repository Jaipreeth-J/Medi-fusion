import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, BookOpen, Heart } from 'lucide-react';
import { useState } from 'react';

interface JournalEntryProps {
  journalText: string;
  onJournalChange: (text: string) => void;
  gratitudeNotes: string[];
  onGratitudeChange: (notes: string[]) => void;
}

export function JournalEntry({ 
  journalText, 
  onJournalChange, 
  gratitudeNotes, 
  onGratitudeChange 
}: JournalEntryProps) {
  const [gratitudeInput, setGratitudeInput] = useState('');

  const addGratitude = () => {
    const trimmed = gratitudeInput.trim();
    if (trimmed && !gratitudeNotes.includes(trimmed)) {
      onGratitudeChange([...gratitudeNotes, trimmed]);
      setGratitudeInput('');
    }
  };

  const removeGratitude = (note: string) => {
    onGratitudeChange(gratitudeNotes.filter(n => n !== note));
  };

  return (
    <div className="space-y-6">
      {/* Journal */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium text-foreground">
            Journal Entry (optional)
          </label>
        </div>
        <Textarea
          placeholder="Write about your day, thoughts, or feelings... This is your private space to reflect."
          value={journalText}
          onChange={(e) => onJournalChange(e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Journaling can help process emotions and identify patterns in your mental health.
        </p>
      </div>
      
      {/* Gratitude */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-accent" />
          <label className="text-sm font-medium text-foreground">
            Gratitude Notes (optional)
          </label>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="What are you grateful for today?"
            value={gratitudeInput}
            onChange={(e) => setGratitudeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGratitude())}
            className="flex-1"
          />
          <Button 
            type="button" 
            size="icon" 
            variant="outline"
            onClick={addGratitude}
            disabled={!gratitudeInput.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {gratitudeNotes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {gratitudeNotes.map((note, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="cursor-pointer bg-accent/10 text-accent-foreground hover:bg-accent/20"
                onClick={() => removeGratitude(note)}
              >
                ❤️ {note}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          Practicing gratitude has been shown to improve mental well-being and life satisfaction.
        </p>
      </div>
    </div>
  );
}
