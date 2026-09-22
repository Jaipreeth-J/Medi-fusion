/**
 * CHAT HOOK
 * Manages conversations and messages for ChatGPT-style chat interface
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  summary: string | null;
  is_emergency: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: string;
  content: string;
  is_emergency_response: boolean | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function generateTitle(firstMessage: string): string {
  const cleaned = firstMessage.trim().slice(0, 100);
  // Take first meaningful chunk
  const words = cleaned.split(/\s+/).slice(0, 6).join(' ');
  return words.length > 50 ? words.slice(0, 50) + '…' : words;
}

export function useChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch all conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!user?.id,
  });

  // Fetch messages for active conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return [];
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!activeConversationId,
  });

  // Create new conversation
  const createConversation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, title: 'New Conversation' })
        .select()
        .single();
      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: (data) => {
      setActiveConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Send message
  const sendMessage = useMutation({
    mutationFn: async ({ content, conversationId }: { content: string; conversationId: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: 'user',
          content,
        })
        .select()
        .single();
      if (error) throw error;
      return data as ChatMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', activeConversationId] });
    },
  });

  // Save assistant message
  const saveAssistantMessage = useCallback(async (conversationId: string, content: string, isEmergency = false) => {
    if (!user?.id) return;
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'assistant',
      content,
      is_emergency_response: isEmergency,
    });
    queryClient.invalidateQueries({ queryKey: ['chat-messages', conversationId] });
  }, [user?.id, queryClient]);

  // Update conversation title
  const updateTitle = useCallback(async (conversationId: string, firstMessage: string) => {
    const title = generateTitle(firstMessage);
    await supabase
      .from('conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  }, [queryClient]);

  // Touch updated_at on conversation
  const touchConversation = useCallback(async (conversationId: string) => {
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  }, [queryClient]);

  // Delete conversation
  const deleteConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      // Delete messages first, then conversation
      await supabase.from('chat_messages').delete().eq('conversation_id', conversationId);
      const { error } = await supabase.from('conversations').delete().eq('id', conversationId);
      if (error) throw error;
    },
    onSuccess: (_, conversationId) => {
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      toast.success('Conversation deleted');
    },
    onError: () => toast.error('Failed to delete conversation'),
  });

  const startNewChat = useCallback(async () => {
    const result = await createConversation.mutateAsync();
    return result;
  }, [createConversation]);

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  return {
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
    setActiveConversationId,
  };
}
