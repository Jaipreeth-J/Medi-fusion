/**
 * QUICK ACTIONS
 * Fast access to common health tracking actions
 */

import { memo } from 'react';
import { Plus, Heart, Stethoscope, Brain, Image, MessageCircle, Download, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ExportDialog } from '@/components/export/ExportDialog';

export const QuickActions = memo(function QuickActions() {
  const actions = [
    {
      label: 'Log Vitals',
      icon: Heart,
      href: '/vitals',
      color: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20',
    },
    {
      label: 'Log Symptom',
      icon: Stethoscope,
      href: '/symptoms',
      color: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20',
    },
    {
      label: 'Log Mood',
      icon: Brain,
      href: '/mental-health',
      color: 'bg-violet-500/10 text-violet-500 hover:bg-violet-500/20',
    },
    {
      label: 'Medications',
      icon: Pill,
      href: '/medications',
      color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
    },
    {
      label: 'Upload Image',
      icon: Image,
      href: '/images',
      color: 'bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20',
    },
    {
      label: 'Chat',
      icon: MessageCircle,
      href: '/chat',
      color: 'bg-primary/10 text-primary hover:bg-primary/20',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {actions.map((action) => (
            <Link key={action.label} to={action.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`${action.color} transition-colors`}
              >
                <action.icon className="h-4 w-4 mr-1.5" />
                {action.label}
              </Button>
            </Link>
          ))}
          <ExportDialog
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
              >
                <Download className="h-4 w-4 mr-1.5" />
                Export Data
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
});
