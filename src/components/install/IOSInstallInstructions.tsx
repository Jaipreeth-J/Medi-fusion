import { motion } from 'framer-motion';
import { Share, PlusSquare, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    icon: Share,
    title: 'Tap the Share button',
    description: 'Find the share icon at the bottom of Safari',
  },
  {
    icon: ArrowDown,
    title: 'Scroll down in the menu',
    description: 'Look for more options in the share sheet',
  },
  {
    icon: PlusSquare,
    title: 'Tap "Add to Home Screen"',
    description: 'This will create an app icon on your home screen',
  },
];

export function IOSInstallInstructions() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        iOS requires a few extra steps to install. Follow these instructions:
      </p>
      
      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-primary" />
                        <h4 className="font-medium text-sm">{step.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center pt-2"
      >
        <p className="text-xs text-muted-foreground">
          Make sure you're using <span className="font-medium text-foreground">Safari</span> browser
        </p>
      </motion.div>
    </div>
  );
}
