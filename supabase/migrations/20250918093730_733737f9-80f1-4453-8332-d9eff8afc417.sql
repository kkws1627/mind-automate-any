-- Add only missing triggers and enable realtime (skip user creation trigger as it already exists)

-- Check and create missing timestamp update triggers
DO $$
BEGIN
    -- Update profiles updated_at trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_profiles_updated_at' AND event_object_table = 'profiles') THEN
        CREATE TRIGGER update_profiles_updated_at
          BEFORE UPDATE ON public.profiles
          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Update tasks updated_at trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_tasks_updated_at' AND event_object_table = 'tasks') THEN
        CREATE TRIGGER update_tasks_updated_at
          BEFORE UPDATE ON public.tasks
          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Update api_keys updated_at trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_api_keys_updated_at' AND event_object_table = 'api_keys') THEN
        CREATE TRIGGER update_api_keys_updated_at
          BEFORE UPDATE ON public.api_keys
          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Update notifications updated_at trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_notifications_updated_at' AND event_object_table = 'notifications') THEN
        CREATE TRIGGER update_notifications_updated_at
          BEFORE UPDATE ON public.notifications
          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Update transactions updated_at trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_transactions_updated_at' AND event_object_table = 'transactions') THEN
        CREATE TRIGGER update_transactions_updated_at
          BEFORE UPDATE ON public.transactions
          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Update feedback updated_at trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_feedback_updated_at' AND event_object_table = 'feedback') THEN
        CREATE TRIGGER update_feedback_updated_at
          BEFORE UPDATE ON public.feedback
          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Enable realtime for tasks table so users can see live updates
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;