/**
 * CHAT SIDEBAR
 * ChatGPT-style conversation list with new chat, delete, and selection
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2, X, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import type { Conversation } from '@/hooks/useChat';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

function groupConversations(conversations: Conversation[]) {
  const groups: { label: string; items: Conversation[] }[] = [];
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const thisWeek: Conversation[] = [];
  const older: Conversation[] = [];

  conversations.forEach((c) => {
    const date = new Date(c.updated_at);
    if (isToday(date)) today.push(c);
    else if (isYesterday(date)) yesterday.push(c);
    else if (isThisWeek(date)) thisWeek.push(c);
    else older.push(c);
  });

  if (today.length) groups.push({ label: 'Today', items: today });
  if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday });
  if (thisWeek.length) groups.push({ label: 'This Week', items: thisWeek });
  if (older.length) groups.push({ label: 'Older', items: older });

  return groups;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelect,
  onNewChat,
  onDelete,
  isOpen,
  onToggle,
  isLoading,
}: ChatSidebarProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const groups = groupConversations(conversations);

  return (
    <>
      {/* Toggle button when closed — desktop only, positioned in sidebar area */}
      {!isOpen && (
        <div className="hidden lg:flex w-10 flex-shrink-0 items-start pt-3 justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-14 bottom-[var(--bottom-nav-height)] left-0 z-40 flex w-[280px] flex-col border-r border-border bg-card lg:relative lg:top-0 lg:bottom-0 lg:z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-3">
              <Button
                onClick={onNewChat}
                size="sm"
                className="flex-1 gap-2 bg-gradient-health text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
              <Button variant="ghost" size="icon" onClick={onToggle} className="ml-2 shrink-0">
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">Start a new chat to begin</p>
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group.label} className="mb-3">
                    <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {group.label}
                    </p>
                    {group.items.map((conv) => (
                      <div
                        key={conv.id}
                        className={cn(
                          'group relative flex items-center rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer',
                          activeConversationId === conv.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground hover:bg-muted/60'
                        )}
                        onClick={() => onSelect(conv.id)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <span className="truncate flex-1">
                          {conv.title || 'New Conversation'}
                        </span>

                        {/* Delete button */}
                        {deletingId === conv.id ? (
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(conv.id);
                                setDeletingId(null);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingId(null);
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(conv.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
