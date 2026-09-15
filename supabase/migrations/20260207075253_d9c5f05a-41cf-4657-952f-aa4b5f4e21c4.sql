-- Security fixes: Add missing RLS policies

-- 1. Add DELETE policy for chat_messages so users can delete their own messages
CREATE POLICY "Users can delete own chat messages" 
ON public.chat_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Add UPDATE and DELETE policies for health_insights
CREATE POLICY "Users can update own health insights" 
ON public.health_insights 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health insights" 
ON public.health_insights 
FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Add UPDATE policy for drug_interactions
CREATE POLICY "Users can update own drug interactions" 
ON public.drug_interactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Add UPDATE and DELETE policies for wearable_sync_logs
CREATE POLICY "Users can update own sync logs" 
ON public.wearable_sync_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sync logs" 
ON public.wearable_sync_logs 
FOR DELETE 
USING (auth.uid() = user_id);