CREATE TABLE public.item_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  area text,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.item_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.item_requests TO authenticated;
GRANT ALL ON public.item_requests TO service_role;

ALTER TABLE public.item_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view requests" ON public.item_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can create their own requests" ON public.item_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own requests" ON public.item_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own requests" ON public.item_requests FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER item_requests_set_updated_at BEFORE UPDATE ON public.item_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.request_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.item_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  shop_id uuid REFERENCES public.shops(id) ON DELETE SET NULL,
  message text NOT NULL,
  price numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.request_replies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.request_replies TO authenticated;
GRANT ALL ON public.request_replies TO service_role;

ALTER TABLE public.request_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view replies" ON public.request_replies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users can create their own replies" ON public.request_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own replies" ON public.request_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX item_requests_created_idx ON public.item_requests (created_at DESC);
CREATE INDEX request_replies_request_idx ON public.request_replies (request_id, created_at);