CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'A quiet learner',
  avatar_seed text NOT NULL DEFAULT 'leaf',
  current_subject text NOT NULL DEFAULT '',
  presence text NOT NULL DEFAULT 'away' CHECK (presence IN ('studying', 'break', 'away')),
  scenery text NOT NULL DEFAULT 'rainy-window' CHECK (scenery IN ('rainy-window', 'countryside-dusk', 'spring-garden', 'cloudy-seaside', 'quiet-library', 'starry-night')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  invited_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  invite_code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'disconnected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (invited_id IS NULL OR inviter_id <> invited_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partnerships TO authenticated;
GRANT ALL ON public.partnerships TO service_role;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.can_access_study_space(p_owner_id uuid, p_partnership_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p_owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.partnerships p
    WHERE p.id = p_partnership_id AND p.status = 'active'
      AND ((p.inviter_id = p_owner_id AND p.invited_id = auth.uid())
        OR (p.invited_id = p_owner_id AND p.inviter_id = auth.uid()))
  );
$$;
REVOKE ALL ON FUNCTION public.can_access_study_space(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_study_space(uuid, uuid) TO authenticated;

CREATE FUNCTION public.profile_is_my_partner(p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partnerships p
    WHERE p.status = 'active'
      AND ((p.inviter_id = auth.uid() AND p.invited_id = p_user_id)
        OR (p.invited_id = auth.uid() AND p.inviter_id = p_user_id))
  );
$$;
REVOKE ALL ON FUNCTION public.profile_is_my_partner(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.profile_is_my_partner(uuid) TO authenticated;

CREATE POLICY "Users read their own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Partners read shared profiles" ON public.profiles FOR SELECT TO authenticated USING (public.profile_is_my_partner(user_id));
CREATE POLICY "Users insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Partners read their partnership" ON public.partnerships FOR SELECT TO authenticated USING (inviter_id = auth.uid() OR invited_id = auth.uid());
CREATE POLICY "Users create their own invitations" ON public.partnerships FOR INSERT TO authenticated WITH CHECK (inviter_id = auth.uid() AND invited_id IS NULL AND status = 'pending');
CREATE POLICY "Partners disconnect their partnership" ON public.partnerships FOR UPDATE TO authenticated USING ((inviter_id = auth.uid() OR invited_id = auth.uid()) AND status = 'active') WITH CHECK ((inviter_id = auth.uid() OR invited_id = auth.uid()) AND status = 'disconnected');

CREATE FUNCTION public.accept_partnership_invite(p_invite_code text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_partnership public.partnerships%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to join a study space'; END IF;
  SELECT * INTO v_partnership FROM public.partnerships
  WHERE invite_code = upper(trim(p_invite_code)) AND status = 'pending' AND invited_id IS NULL
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'That invitation is no longer available'; END IF;
  IF v_partnership.inviter_id = auth.uid() THEN RAISE EXCEPTION 'You cannot accept your own invitation'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.partnerships p
    WHERE p.status = 'active' AND (
      p.inviter_id IN (auth.uid(), v_partnership.inviter_id)
      OR p.invited_id IN (auth.uid(), v_partnership.inviter_id)
    )
  ) THEN RAISE EXCEPTION 'One of you is already connected to a study companion'; END IF;
  UPDATE public.partnerships SET invited_id = auth.uid(), status = 'active', updated_at = now()
  WHERE id = v_partnership.id;
  RETURN v_partnership.id;
END;
$$;
REVOKE ALL ON FUNCTION public.accept_partnership_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_partnership_invite(text) TO authenticated;

CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  partnership_id uuid REFERENCES public.partnerships(id) ON DELETE SET NULL,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 100),
  color text NOT NULL DEFAULT 'sage' CHECK (color IN ('sage', 'blue', 'peach', 'forest')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Study space members read subjects" ON public.subjects FOR SELECT TO authenticated USING (public.can_access_study_space(owner_id, partnership_id));
CREATE POLICY "Users create their own subjects" ON public.subjects FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND (partnership_id IS NULL OR public.can_access_study_space(owner_id, partnership_id)));
CREATE POLICY "Users update their own subjects" ON public.subjects FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users delete their own subjects" ON public.subjects FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE TABLE public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  partnership_id uuid REFERENCES public.partnerships(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  parent_id uuid REFERENCES public.topics(id) ON DELETE CASCADE,
  chapter text NOT NULL DEFAULT '',
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 200),
  description text NOT NULL DEFAULT '',
  estimated_minutes integer CHECK (estimated_minutes IS NULL OR estimated_minutes BETWEEN 1 AND 600),
  sort_order integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.topics TO authenticated;
GRANT ALL ON public.topics TO service_role;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Study space members read topics" ON public.topics FOR SELECT TO authenticated USING (public.can_access_study_space(owner_id, partnership_id));
CREATE POLICY "Users create their own topics" ON public.topics FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND (partnership_id IS NULL OR public.can_access_study_space(owner_id, partnership_id)));
CREATE POLICY "Users update their own topics" ON public.topics FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users delete their own topics" ON public.topics FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  partnership_id uuid REFERENCES public.partnerships(id) ON DELETE SET NULL,
  body text NOT NULL CHECK (char_length(trim(body)) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Study space members read notes" ON public.notes FOR SELECT TO authenticated USING (public.can_access_study_space(owner_id, partnership_id));
CREATE POLICY "Users create their own notes" ON public.notes FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.topics t WHERE t.id = topic_id AND public.can_access_study_space(t.owner_id, t.partnership_id)));
CREATE POLICY "Users update their own notes" ON public.notes FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users delete their own notes" ON public.notes FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE TABLE public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  partnership_id uuid REFERENCES public.partnerships(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes BETWEEN 1 AND 600),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_sessions TO authenticated;
GRANT ALL ON public.study_sessions TO service_role;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Study space members read sessions" ON public.study_sessions FOR SELECT TO authenticated USING (public.can_access_study_space(owner_id, partnership_id));
CREATE POLICY "Users create their own sessions" ON public.study_sessions FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users update their own sessions" ON public.study_sessions FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users delete their own sessions" ON public.study_sessions FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE TABLE public.pokes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id uuid NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  message text NOT NULL CHECK (char_length(trim(message)) BETWEEN 1 AND 180),
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  CHECK (sender_id <> recipient_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pokes TO authenticated;
GRANT ALL ON public.pokes TO service_role;
ALTER TABLE public.pokes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Poke participants can read" ON public.pokes FOR SELECT TO authenticated USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Partners can send a poke" ON public.pokes FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid() AND public.can_access_study_space(sender_id, partnership_id));
CREATE POLICY "Recipients can mark pokes read" ON public.pokes FOR UPDATE TO authenticated USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());

CREATE TABLE public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  partnership_id uuid REFERENCES public.partnerships(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('topic_completed', 'session_completed', 'note_added')),
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  subject_name text NOT NULL DEFAULT '',
  topic_name text NOT NULL DEFAULT '',
  detail text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.activity_events TO authenticated;
GRANT ALL ON public.activity_events TO service_role;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Study space members read activity" ON public.activity_events FOR SELECT TO authenticated USING (public.can_access_study_space(owner_id, partnership_id));
CREATE POLICY "Users add activity for themselves" ON public.activity_events FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users remove their own activity" ON public.activity_events FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE FUNCTION public.create_profile_for_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data ->> 'display_name'), ''), NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''), split_part(COALESCE(NEW.email, 'learner'), '@', 1), 'A quiet learner')
  ) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();

CREATE FUNCTION public.log_topic_completion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_subject_name text;
BEGIN
  IF NEW.completed AND (TG_OP = 'INSERT' OR NOT OLD.completed) THEN
    SELECT name INTO v_subject_name FROM public.subjects WHERE id = NEW.subject_id;
    INSERT INTO public.activity_events (owner_id, partnership_id, kind, topic_id, subject_name, topic_name)
    VALUES (NEW.owner_id, NEW.partnership_id, 'topic_completed', NEW.id, COALESCE(v_subject_name, ''), NEW.name);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_topic_completed
AFTER INSERT OR UPDATE OF completed ON public.topics FOR EACH ROW EXECUTE FUNCTION public.log_topic_completion();

CREATE INDEX subjects_owner_id_idx ON public.subjects(owner_id, sort_order);
CREATE INDEX topics_owner_id_idx ON public.topics(owner_id, sort_order);
CREATE INDEX topics_subject_id_idx ON public.topics(subject_id);
CREATE INDEX topics_partnership_id_idx ON public.topics(partnership_id);
CREATE INDEX notes_topic_id_idx ON public.notes(topic_id);
CREATE INDEX study_sessions_owner_started_idx ON public.study_sessions(owner_id, started_at DESC);
CREATE INDEX activity_events_partnership_created_idx ON public.activity_events(partnership_id, created_at DESC);
CREATE INDEX pokes_recipient_created_idx ON public.pokes(recipient_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles, public.partnerships, public.topics, public.notes, public.pokes, public.activity_events, public.study_sessions;