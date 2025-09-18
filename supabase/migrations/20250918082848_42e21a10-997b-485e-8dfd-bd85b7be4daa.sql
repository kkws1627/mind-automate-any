-- Enable realtime for tables to support real-time subscriptions
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.tasks;

ALTER TABLE public.feedback REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.feedback;