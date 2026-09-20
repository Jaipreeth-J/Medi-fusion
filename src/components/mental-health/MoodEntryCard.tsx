import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Trash2, Clock, Zap, Moon, Flame, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { MOOD_OPTIONS } from '@/lib/constants';
import { MoodEntry } from '@/hooks/useMood';
import { cn } from '@/lib/utils';

interface MoodEntryCardProps {
  entry: MoodEntry;
  onDelete: (id: string) => void;
}

export function MoodEntryCard({ entry, onDelete }: MoodEntryCardProps) {
  const moodOption = MOOD_OPTIONS.find(m => m.value === entry.mood_score) || MOOD_OPTIONS[4];
  
  const getLevelColor = (value: number | null, inverse: boolean = false) => {
    if (value === null) return 'text-muted-foreground';
    if (inverse) {
      if (value <= 3) return 'text-success';
      if (value <= 6) return 'text-warning';
      return 'text-destructive';
    }
    if (value <= 3) return 'text-destructive';
    if (value <= 6) return 'text-warning';
    return 'text-success';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{moodOption.emoji}</span>
            <div>
              <h3 className="font-semibold text-lg">{moodOption.label}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(parseISO(entry.recorded_at), 'PPp')}
              </div>
            </div>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this mood entry? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(entry.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Levels */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {entry.stress_level !== null && (
            <div className="flex items-center gap-2">
              <Flame className={cn("h-4 w-4", getLevelColor(entry.stress_level, true))} />
              <div>
                <p className="text-xs text-muted-foreground">Stress</p>
                <p className={cn("font-medium", getLevelColor(entry.stress_level, true))}>
                  {entry.stress_level}/10
                </p>
              </div>
            </div>
          )}
          
          {entry.anxiety_level !== null && (
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn("h-4 w-4", getLevelColor(entry.anxiety_level, true))} />
              <div>
                <p className="text-xs text-muted-foreground">Anxiety</p>
                <p className={cn("font-medium", getLevelColor(entry.anxiety_level, true))}>
                  {entry.anxiety_level}/10
                </p>
              </div>
            </div>
          )}
          
          {entry.energy_level !== null && (
            <div className="flex items-center gap-2">
              <Zap className={cn("h-4 w-4", getLevelColor(entry.energy_level))} />
              <div>
                <p className="text-xs text-muted-foreground">Energy</p>
                <p className={cn("font-medium", getLevelColor(entry.energy_level))}>
                  {entry.energy_level}/10
                </p>
              </div>
            </div>
          )}
          
          {entry.sleep_quality !== null && (
            <div className="flex items-center gap-2">
              <Moon className={cn("h-4 w-4", getLevelColor(entry.sleep_quality))} />
              <div>
                <p className="text-xs text-muted-foreground">Sleep</p>
                <p className={cn("font-medium", getLevelColor(entry.sleep_quality))}>
                  {entry.sleep_quality}/10
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Activities */}
        {entry.activities && entry.activities.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Activities</p>
            <div className="flex flex-wrap gap-1">
              {entry.activities.map((activity, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {activity}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Triggers */}
        {entry.triggers && entry.triggers.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Triggers</p>
            <div className="flex flex-wrap gap-1">
              {entry.triggers.map((trigger, i) => (
                <Badge key={i} variant="outline" className="text-xs border-warning text-warning">
                  {trigger}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Journal */}
        {entry.journal_entry && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Journal</p>
            <p className="text-sm whitespace-pre-wrap">{entry.journal_entry}</p>
          </div>
        )}
        
        {/* Gratitude */}
        {entry.gratitude_notes && entry.gratitude_notes.length > 0 && (
          <div className="bg-accent/10 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Gratitude</p>
            <ul className="space-y-1">
              {entry.gratitude_notes.map((note, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span>❤️</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
