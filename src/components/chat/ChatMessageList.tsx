/**
 * CHAT MESSAGE LIST
 * Renders the full chat thread with animations, fully responsive for mobile
 */

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { SmartEmergencyCard, type EmergencyType } from '@/components/chat/SmartEmergencyCard';
import { cn } from '@/lib/utils';
import { sanitizeAI } from '@/lib/sanitize';
import type { ChatMessage } from '@/hooks/useChat';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-3 sm:px-4 sm:py-4 lg:px-6 min-w-0"
    >
      <AnimatePresence>
        {messages.map((message) => (
          <>
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'mb-0.5 flex flex-col sm:mb-1',
                message.role === 'user' ? 'items-end' : 'items-start'
              )}
            >
              <div
                className={cn(
                  'chat-bubble-row flex gap-2 sm:gap-2.5 max-w-[85%] sm:max-w-[75%]',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full sm:h-7 sm:w-7 lg:h-8 lg:w-8',
                    message.role === 'user' ? 'bg-primary' : 'bg-secondary'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="h-3 w-3 text-primary-foreground sm:h-3.5 sm:w-3.5" />
                  ) : (
                    <Bot className="h-3 w-3 text-secondary-foreground sm:h-3.5 sm:w-3.5" />
                  )}
                </div>

                {/* Message bubble */}
                <div
                  className={cn(
                    'chat-bubble rounded-2xl px-3 py-2 sm:px-3.5 sm:py-2.5 min-w-0',
                    message.role === 'user'
                      ? 'chat-message-user rounded-br-md'
                      : 'chat-message-assistant rounded-bl-md',
                    message.is_emergency_response && 'border-destructive'
                  )}
                >
                  {message.role === 'assistant' ? (
                      <div
                        className="chat-prose prose prose-sm dark:prose-invert max-w-none text-[13px] leading-relaxed sm:text-sm [&_hr]:my-3 [&_hr]:border-border [&_b]:font-semibold [&_ul]:my-1.5 [&_li]:my-0.5 [&_a]:text-primary [&_a]:underline [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_code]:break-all [&_img]:max-w-full [&_img]:h-auto [&_table]:w-full [&_table]:overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: sanitizeAI(message.content) }}
                      />
                  ) : (
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed sm:text-sm">
                      {message.content}
                    </p>
                  )}
                </div>
              </div>

              {/* Emergency card rendered OUTSIDE the bubble for full width on mobile */}
              {message.role === 'assistant' && message.is_emergency_response && (
                <div className="w-full mt-2 sm:pl-9 lg:pl-10 overflow-hidden">
                  <SmartEmergencyCard type="medical" />
                </div>
              )}
            </motion.div>

            {/* Timestamp — shown below each bubble */}
            <span
              className={cn(
                'mb-2 px-1 text-[10px] text-muted-foreground/60 select-none',
                message.role === 'user' ? 'text-right pr-2' : 'pl-9'
              )}
              title={format(new Date(message.created_at), 'PPp')}
            >
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          </>
        ))}
      </AnimatePresence>

      {isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-2.5">
          <div className="flex gap-2 sm:gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary sm:h-7 sm:w-7 lg:h-8 lg:w-8">
              <Bot className="h-3 w-3 text-secondary-foreground sm:h-3.5 sm:w-3.5" />
            </div>
            <div className="chat-message-assistant flex items-center gap-1.5 rounded-2xl rounded-bl-md px-3.5 py-2.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 sm:h-2 sm:w-2" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 sm:h-2 sm:w-2" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 sm:h-2 sm:w-2" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </motion.div>
      )}

      <div ref={endRef} className="h-1" />
    </div>
  );
}
