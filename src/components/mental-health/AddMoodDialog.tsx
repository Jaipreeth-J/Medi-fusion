import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Smile, Brain, BookOpen, Loader2 } from 'lucide-react';
import { MoodSelector } from './MoodSelector';
import { LevelSlider } from './LevelSlider';
import { ActivityPicker } from './ActivityPicker';
import { JournalEntry } from './JournalEntry';
import { useMood, MoodFormData } from '@/hooks/useMood';
import { Zap, Moon, AlertTriangle, Flame } from 'lucide-react';

export function AddMoodDialog() {
  const { addEntry, adding } = useMood();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('mood');
  
  // Form state
  const [moodScore, setMoodScore] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [activities, setActivities] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [journalText, setJournalText] = useState('');
  const [gratitudeNotes, setGratitudeNotes] = useState<string[]>([]);

  const resetForm = () => {
    setMoodScore(5);
    setStressLevel(5);
    setAnxietyLevel(5);
    setEnergyLevel(5);
    setSleepQuality(5);
    setActivities([]);
    setTriggers([]);
    setJournalText('');
    setGratitudeNotes([]);
    setActiveTab('mood');
  };

  const handleSubmit = async () => {
    const formData: MoodFormData = {
      mood_score: moodScore,
      stress_level: stressLevel,
      anxiety_level: anxietyLevel,
      energy_level: energyLevel,
      sleep_quality: sleepQuality,
      activities: activities.length > 0 ? activities : undefined,
      triggers: triggers.length > 0 ? triggers : undefined,
      journal_entry: journalText.trim() || undefined,
      gratitude_notes: gratitudeNotes.length > 0 ? gratitudeNotes : undefined,
    };

    const result = await addEntry(formData);
    if (result) {
      setOpen(false);
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Log Mood
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smile className="h-5 w-5 text-primary" />
            Log Your Mood
          </DialogTitle>
          <DialogDescription>
            Track how you're feeling today. All entries are private.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mood" className="gap-1">
              <Smile className="h-4 w-4" />
              <span className="hidden sm:inline">Mood</span>
            </TabsTrigger>
            <TabsTrigger value="levels" className="gap-1">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Levels</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="gap-1">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Journal</span>
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] mt-4 pr-4">
            <TabsContent value="mood" className="space-y-6 mt-0">
              <MoodSelector value={moodScore} onChange={setMoodScore} />
              <ActivityPicker 
                selected={activities} 
                onChange={setActivities}
                label="What did you do today?"
              />
            </TabsContent>
            
            <TabsContent value="levels" className="space-y-6 mt-0">
              <LevelSlider
                label="Stress Level"
                value={stressLevel}
                onChange={setStressLevel}
                lowLabel="Calm"
                highLabel="Very Stressed"
                colorScheme="stress"
                icon={<Flame className="h-4 w-4 text-warning" />}
              />
              
              <LevelSlider
                label="Anxiety Level"
                value={anxietyLevel}
                onChange={setAnxietyLevel}
                lowLabel="Calm"
                highLabel="Very Anxious"
                colorScheme="anxiety"
                icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
              />
              
              <LevelSlider
                label="Energy Level"
                value={energyLevel}
                onChange={setEnergyLevel}
                lowLabel="Exhausted"
                highLabel="Energized"
                colorScheme="energy"
                icon={<Zap className="h-4 w-4 text-primary" />}
              />
              
              <LevelSlider
                label="Sleep Quality"
                value={sleepQuality}
                onChange={setSleepQuality}
                lowLabel="Poor"
                highLabel="Excellent"
                colorScheme="sleep"
                icon={<Moon className="h-4 w-4 text-info" />}
              />
              
              <ActivityPicker 
                selected={triggers} 
                onChange={setTriggers}
                label="Any triggers or stressors?"
              />
            </TabsContent>
            
            <TabsContent value="journal" className="mt-0">
              <JournalEntry
                journalText={journalText}
                onJournalChange={setJournalText}
                gratitudeNotes={gratitudeNotes}
                onGratitudeChange={setGratitudeNotes}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={adding}>
            {adding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Entry'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
