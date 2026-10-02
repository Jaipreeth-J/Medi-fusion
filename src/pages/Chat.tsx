import { useState, useCallback } from 'react';
import { isRateLimited } from '@/lib/rateLimitHandler';
import { motion } from 'framer-motion';
import { Send, Bot, Sparkles, Pill, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/AppLayout';
import { SafetyDisclaimer } from '@/components/common/SafetyDisclaimer';
import { EmergencyBanner } from '@/components/common/EmergencyBanner';
import { VoiceInputButton } from '@/components/common/VoiceInputButton';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMessageList } from '@/components/chat/ChatMessageList';
import { ChatQuickActions, SuggestedPrompts } from '@/components/chat/ChatQuickActions';
import { EMERGENCY_KEYWORDS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { useMedications } from '@/hooks/useMedications';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useChat } from '@/hooks/useChat';
import { supabase } from '@/integrations/supabase/client';

const MENTAL_HEALTH_KEYWORDS = ['suicidal', 'suicide', 'want to die', 'kill myself', 'end my life', 'self harm', 'self-harm', 'cutting myself', 'hurting myself', 'depressed', 'panic attack'];
const SAFETY_KEYWORDS = ['assault', 'attack', 'violence', 'abuse', 'threatened', 'stalking'];

function detectEmergencyType(text: string): 'medical' | 'safety' | 'mental_health' {
  const lower = text.toLowerCase();
  if (MENTAL_HEALTH_KEYWORDS.some(k => lower.includes(k))) return 'mental_health';
  if (SAFETY_KEYWORDS.some(k => lower.includes(k))) return 'safety';
  return 'medical';
}

export default function Chat() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { activeMedications } = useMedications();
  const {
    conversations,
    messages,
    activeConversationId,
    conversationsLoading,
    messagesLoading,
    startNewChat,
    selectConversation,
    sendMessage,
    saveAssistantMessage,
    updateTitle,
    touchConversation,
    deleteConversation,
  } = useChat();

  const handleVoiceTranscript = useCallback((text: string) => {
    setInput(text);
  }, []);

  const {
    isListening,
    isSupported,
    interimTranscript,
    toggleListening,
    resetTranscript,
  } = useVoiceInput({
    onTranscript: handleVoiceTranscript,
    continuous: true,
  });

  const detectEmergency = (text: string): boolean => {
    return EMERGENCY_KEYWORDS.some(keyword => text.toLowerCase().includes(keyword));
  };

  const handleSend = async (overrideContent?: string) => {
    const content = (overrideContent || input).trim();
    if (!content || isLoading || !user?.id) return;

    setInput('');
    setIsLoading(true);

    const isEmergency = detectEmergency(content);
    if (isEmergency) setShowEmergency(true);

    try {
      let convId = activeConversationId;
      if (!convId) {
        const conv = await startNewChat();
        convId = conv.id;
      }

      await sendMessage.mutateAsync({ content, conversationId: convId });

      const isFirstMessage = messages.filter(m => m.role === 'user').length === 0;

      const historyMessages = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content },
      ];

      const medicationsContext = activeMedications.map(m => ({
        medication_name: m.medication_name,
        dosage: m.dosage,
        dosage_unit: m.dosage_unit,
        frequency: m.frequency,
        purpose: m.purpose,
      }));

      const response = await supabase.functions.invoke('health-chat', {
        body: {
          messages: historyMessages,
          isEmergency,
          medications: medicationsContext,
        },
      });

      if (response.error) {
        if (isRateLimited(response)) return;
        throw response.error;
      }

      const isEmergencyResponse = Boolean(isEmergency || response.data?.isEmergency);
      if (isEmergencyResponse) {
        setShowEmergency(true);
      }

      const assistantContent = response.data?.content || "I'm here to help. How can I assist you with your health questions today?";

      await saveAssistantMessage(convId, assistantContent, isEmergencyResponse);

      if (isFirstMessage) {
        await updateTitle(convId, content);
      }

      await touchConversation(convId);
    } catch (error) {
      console.error('Chat error:', error);
      if (activeConversationId) {
        await saveAssistantMessage(
          activeConversationId,
          "I apologize, but I'm having trouble responding right now. Please try again, and remember: if this is a medical emergency, please call 911 immediately."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    await startNewChat();
  };

  const handleDeleteChat = (id: string) => {
    deleteConversation.mutate(id);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const handleQuickPrompt = (text: string) => {
    setInput(text);
  };

  return (
    <AppLayout>
      {/* Chat container: uses dynamic viewport height, prevents any overflow */}
      <div className="chat-page-container flex flex-col">
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Chat Sidebar */}
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelect={(id) => { selectConversation(id); setSidebarOpen(false); }}
            onNewChat={handleNewChat}
            onDelete={handleDeleteChat}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            isLoading={conversationsLoading}
          />

          {/* Main Chat Area */}
          <div className="flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden">
            {/* Header — compact on mobile */}
            <div className="flex-shrink-0 border-b border-border bg-card/80 px-3 py-2 backdrop-blur-md sm:px-4 sm:py-2.5 lg:px-6 lg:py-3">
              <div className="flex items-center gap-2">
                {/* Mobile sidebar toggle */}
                {!sidebarOpen && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(true)}
                    className="h-8 w-8 flex-shrink-0 lg:hidden"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                )}
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-health sm:h-9 sm:w-9 lg:h-10 lg:w-10">
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-sm font-semibold truncate sm:text-base lg:text-lg">Health Assistant</h1>
                  <p className="text-[10px] text-muted-foreground sm:text-[11px] lg:text-xs">AI-powered health companion</p>
                </div>
                {activeMedications.length > 0 && (
                  <Badge variant="outline" className="hidden gap-1 text-xs sm:flex flex-shrink-0">
                    <Pill className="h-3 w-3" />
                    {activeMedications.length} med{activeMedications.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>

            {/* Messages Area — scrollable, takes all remaining space */}
            {showEmergency && (
              <div className="flex-shrink-0 px-3 pt-3 sm:px-4 sm:pt-4">
                <EmergencyBanner onDismiss={() => setShowEmergency(false)} />
              </div>
            )}

            {!activeConversationId && messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center px-4 py-6 overflow-y-auto min-h-0">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-health shadow-glow sm:mb-5 sm:h-16 sm:w-16 lg:h-20 lg:w-20">
                  <Bot className="h-7 w-7 text-primary-foreground sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
                </div>
                <h2 className="font-display text-base font-semibold text-foreground sm:text-lg lg:text-xl">
                  Welcome to Medifusion
                </h2>
                <p className="mt-1.5 max-w-md text-xs text-muted-foreground sm:mt-2 sm:text-sm">
                  I'm your AI health assistant. Ask me about symptoms, wellness tips, or just say hi! 👋
                </p>
                <SuggestedPrompts onSelect={handleSuggestedPrompt} />
                <SafetyDisclaimer className="mt-4 max-w-lg sm:mt-5" />
              </div>
            ) : (
              <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
                <ChatMessageList messages={messages} isLoading={isLoading || messagesLoading} />
                {messages.length > 0 && !isLoading && (
                  <div className="flex-shrink-0 px-3 pb-1.5 sm:px-4 sm:pb-2">
                    <ChatQuickActions onPrompt={handleQuickPrompt} />
                  </div>
                )}
              </div>
            )}

            {/* Input — fixed at bottom, never overlapped, safe area support */}
            <div className="chat-input-safe flex-shrink-0 border-t border-border bg-card/90 px-3 py-2 backdrop-blur-md sm:px-4 sm:py-3">
              <SafetyDisclaimer variant="compact" className="mb-1.5 sm:mb-2" />

              {isListening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-1.5 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm sm:mb-2 sm:py-2"
                >
                  <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary sm:h-3 sm:w-3" />
                  </span>
                  <span className="text-muted-foreground text-xs truncate">
                    Listening... {interimTranscript && <span className="text-foreground italic">"{interimTranscript}"</span>}
                  </span>
                </motion.div>
              )}

              <div className="flex items-end gap-1.5 sm:gap-2">
                <VoiceInputButton
                  isListening={isListening}
                  isSupported={isSupported}
                  onClick={() => {
                    if (!isListening) resetTranscript();
                    toggleListening();
                  }}
                  disabled={isLoading}
                />
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={isListening ? "Speak now..." : "Ask a health question..."}
                  className="min-h-[40px] max-h-24 resize-none text-sm sm:min-h-[44px] sm:max-h-28"
                  rows={1}
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="bg-gradient-health h-10 w-10 flex-shrink-0 sm:h-[44px] sm:w-[44px]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
