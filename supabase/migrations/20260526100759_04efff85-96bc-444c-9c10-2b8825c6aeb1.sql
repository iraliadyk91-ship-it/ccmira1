
-- Fix search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Tighten public booking insert policy with field validation
DROP POLICY "Anyone can create bookings" ON public.bookings;
CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(full_name) BETWEEN 1 AND 200
    AND length(phone) BETWEEN 5 AND 40
    AND length(email) BETWEEN 5 AND 254
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND booking_date >= CURRENT_DATE
    AND length(booking_time) BETWEEN 1 AND 20
  );

-- Restrict execute on has_role (still usable inside SECURITY DEFINER policies)
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon, authenticated;

-- Seed key phrase
INSERT INTO public.app_settings (key, value)
VALUES ('key_phrase', 'Хочу летать')
ON CONFLICT (key) DO NOTHING;
