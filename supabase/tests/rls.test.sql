begin;

select plan(21);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'profiles has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.posts'::regclass),
  'posts has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.post_autosaves'::regclass),
  'post_autosaves has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.post_tags'::regclass),
  'post_tags has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.comments'::regclass),
  'comments has RLS enabled'
);
select ok(
  not has_table_privilege('anon', 'public.profiles', 'SELECT'),
  'anonymous users cannot select private profiles'
);
select ok(
  not has_table_privilege('anon', 'public.post_autosaves', 'SELECT'),
  'anonymous users cannot select post autosaves'
);
select ok(
  not has_table_privilege('anon', 'public.post_autosaves', 'INSERT'),
  'anonymous users cannot insert post autosaves'
);
select ok(
  not has_table_privilege('anon', 'public.post_autosaves', 'UPDATE'),
  'anonymous users cannot update post autosaves'
);
select ok(
  not has_table_privilege('anon', 'public.post_autosaves', 'DELETE'),
  'anonymous users cannot delete post autosaves'
);
select ok(
  has_table_privilege('anon', 'public.public_profiles', 'SELECT'),
  'anonymous users can select the public profile projection'
);
select ok(
  not has_column_privilege('authenticated', 'public.profiles', 'is_admin', 'UPDATE'),
  'authenticated users cannot update is_admin'
);
select ok(
  not has_table_privilege('authenticated', 'public.post_tags', 'INSERT'),
  'authenticated users cannot bypass the post tag RPC'
);
select ok(
  has_table_privilege('authenticated', 'public.post_autosaves', 'SELECT'),
  'authenticated users can select post autosaves'
);
select ok(
  has_table_privilege('authenticated', 'public.post_autosaves', 'INSERT'),
  'authenticated users can insert post autosaves'
);
select ok(
  has_table_privilege('authenticated', 'public.post_autosaves', 'UPDATE'),
  'authenticated users can update post autosaves'
);
select ok(
  has_table_privilege('authenticated', 'public.post_autosaves', 'DELETE'),
  'authenticated users can delete post autosaves'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.set_user_admin(uuid,boolean)',
    'EXECUTE'
  ),
  'anonymous users cannot execute the role-change RPC'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.create_post_with_tags(text,text,text,text,text,text[],text[],text,boolean)',
    'EXECUTE'
  ),
  'authenticated users can invoke the guarded post creation RPC'
);
select ok(
  not has_schema_privilege('anon', 'private', 'USAGE'),
  'anonymous users cannot access the private schema'
);
select ok(
  not has_function_privilege(
    'anon',
    'private.is_valid_comment_parent(uuid,uuid)',
    'EXECUTE'
  ),
  'anonymous users cannot execute private comment validation'
);

select * from finish();
rollback;
