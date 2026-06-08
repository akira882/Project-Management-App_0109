-- ============================================================
-- 開発・ローカル専用シードデータ（本番では実行しないこと）
-- 適用順: schema.sql → rls_attendance.sql → seed.sql
--
-- 【重要】profiles.id は auth.users(id) を参照する外部キー制約を持つ。
-- そのため、ここで挿入する UUID は「対応する auth.users が既に存在する」
-- 場合にのみ挿入できる。下記 2 件は【プレースホルダ】であり、実際には
-- Supabase ダッシュボード（Authentication）か Admin API で同じ id の
-- 認証ユーザーを先に作成してから実行すること。
--
-- 認証ユーザーが未作成でもスクリプトが失敗しないよう、各 profile 挿入は
-- DO ブロックで「対応 auth.users が存在する場合のみ挿入（無ければ no-op）」とする。
-- 冪等性確保のため on conflict (id) do nothing を付与する。
-- ============================================================

-- ------------------------------------------------------------
-- サンプルプロフィール（プレースホルダ UUID）
--   管理者: 11111111-1111-1111-1111-111111111111（田中 太郎 / manager）
--   従業員: 22222222-2222-2222-2222-222222222222（佐藤 花子 / employee, 上長=田中）
-- ------------------------------------------------------------

-- 管理者プロフィール（対応 auth.users が存在する場合のみ挿入）
do $$
begin
  if exists (
    select 1 from auth.users
    where id = '11111111-1111-1111-1111-111111111111'
  ) then
    insert into public.profiles (id, display_name, role, manager_id)
    values ('11111111-1111-1111-1111-111111111111', '田中 太郎', 'manager', null)
    on conflict (id) do nothing;
  end if;
end;
$$;

-- 従業員プロフィール（上長 = 田中 太郎）
do $$
begin
  if exists (
    select 1 from auth.users
    where id = '22222222-2222-2222-2222-222222222222'
  ) then
    insert into public.profiles (id, display_name, role, manager_id)
    values (
      '22222222-2222-2222-2222-222222222222',
      '佐藤 花子',
      'employee',
      '11111111-1111-1111-1111-111111111111'
    )
    on conflict (id) do nothing;
  end if;
end;
$$;

-- ------------------------------------------------------------
-- サンプル勤怠レコード（佐藤 花子の 1 日分）
-- id はクライアント生成 UUID 相当（冪等キー）を直接指定。
-- recorded_at は UTC（timestamptz）。location は jsonb（{"lat":..,"lng":..}）。
-- 対応プロフィールが存在する場合のみ挿入し、衝突時は do nothing で冪等に保つ。
-- ------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from public.profiles
    where id = '22222222-2222-2222-2222-222222222222'
  ) then
    insert into public.attendance_records
      (id, user_id, record_type, recorded_at, location, note)
    values
      ('aaaaaaa1-0000-4000-8000-000000000001',
       '22222222-2222-2222-2222-222222222222',
       'clockIn',
       '2026-06-08T00:00:00Z',
       '{"lat":35.6895,"lng":139.6917}',
       '出勤しました'),
      ('aaaaaaa1-0000-4000-8000-000000000002',
       '22222222-2222-2222-2222-222222222222',
       'breakStart',
       '2026-06-08T03:00:00Z',
       '{"lat":35.6895,"lng":139.6917}',
       '昼休憩開始'),
      ('aaaaaaa1-0000-4000-8000-000000000003',
       '22222222-2222-2222-2222-222222222222',
       'breakEnd',
       '2026-06-08T04:00:00Z',
       '{"lat":35.6895,"lng":139.6917}',
       '昼休憩終了'),
      ('aaaaaaa1-0000-4000-8000-000000000004',
       '22222222-2222-2222-2222-222222222222',
       'clockOut',
       '2026-06-08T09:00:00Z',
       '{"lat":35.6895,"lng":139.6917}',
       '退勤しました')
    on conflict (id) do nothing;
  end if;
end;
$$;
