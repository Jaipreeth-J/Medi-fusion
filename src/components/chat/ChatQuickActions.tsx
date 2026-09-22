/**
 * CHAT QUICK ACTIONS
 * Interactive suggestion buttons shown under assistant messages and in empty state
 */

import { useNavigate } from 'react-router-dom';
import { Stethoscope, Pill, Activity, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  action: 'navigate' | 'prompt';
  target: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Check Symptoms', icon: <Stethoscope className="h-3.5 w-3.5" />, action: 'navigate', target: '/symptoms' },
  { label: 'Add Medication', icon: <Pill className="h-3.5 w-3.5" />, action: 'navigate', target: '/medications' },
  { label: 'View Health Stats', icon: <Activity className="h-3.5 w-3.5" />, action: 'navigate', target: '/vitals' },
  { label: 'Contact Doctor', icon: <Phone className="h-3.5 w-3.5" />, action: 'prompt', target: 'How can I find a doctor near me?' },
];

interface ChatQuickActionsProps {
  onPrompt?: (text: string) => void;
  className?: string;
}

export function ChatQuickActions({ onPrompt, className }: ChatQuickActionsProps) {
  const navigate = useNavigate();

  const handleClick = (action: QuickAction) => {
    if (action.action === 'navigate') {
      navigate(action.target);
    } else if (action.action === 'prompt' && onPrompt) {
      onPrompt(action.target);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className || ''}`}>
      {QUICK_ACTIONS.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs h-8 rounded-full border-primary/20 text-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => handleClick(action)}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
}

/**
 * Suggested prompts for empty chat state
 */
const SUGGESTED_PROMPTS = [
  "I have a headache and feel dizzy",
  "What are the side effects of ibuprofen?",
  "Tips for better sleep quality",
  "I'm feeling anxious and stressed",
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 max-w-lg">
      {SUGGESTED_PROMPTS.map((prompt) => (
        <Button
          key={prompt}
          variant="outline"
          className="h-auto py-3 px-4 text-left text-sm font-normal text-muted-foreground hover:text-foreground hover:border-primary/30 whitespace-normal"
          onClick={() => onSelect(prompt)}
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
}
