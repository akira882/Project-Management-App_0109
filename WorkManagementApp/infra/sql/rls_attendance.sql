-- ============================================================
-- Row Level Security (RLS) 定義
-- 適用順: schema.sql → rls_attendance.sql → seed.sql
-- 方針: 最小権限。profiles も attendance_records も RLS を有効化し、
-- 認証ユーザーは原則「自分の行」のみアクセス可。管理者は配下従業員の
-- 勤怠/プロフィールを閲覧できる。打刻台帳は追記専用（immutable）。
-- 再実行可能にするため各ポリシーは drop policy if exists で前置きする。
-- ============================================================

-- ------------------------------------------------------------
-- RLS 有効化（両テーブル必須）
-- profiles を有効化しないと他人のプロフィール（氏名・上長関係）が漏洩する。
-- ------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.attendance_records  enable row level security;

-- ============================================================
-- profiles ポリシー
-- ============================================================

-- 自分のプロフィールを参照できる。
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  using (auth.uid() = id);

-- 管理者は自分が上長（manager_id = 自分）である従業員（配下）の行を参照できる。
drop policy if exists profiles_select_reports on public.profiles;
create policy profiles_select_reports
  on public.profiles
  for select
  using (manager_id = auth.uid());

-- 自分のプロフィールを更新できる。
-- 【role 昇格の防止】RLS は行単位の制御で「更新可能な列」を直接制限できない
--   （列単位の制限は GRANT UPDATE (display_name) など列権限で行う）。
--   そこで with check で role が現状維持（employee 既定のまま）であることを要求し、
--   一般ユーザーが自分を 'manager' に昇格させる操作を拒否する。
--   運用上、想定する更新対象は display_name のみ（role / manager_id は管理者運用で変更）。
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'employee');

-- ============================================================
-- attendance_records ポリシー（勤怠打刻台帳）
-- ============================================================

-- INSERT: 自分（auth.uid()）の user_id でのみ打刻を作成できる。
-- 【重要・バグ修正】INSERT に USING は存在しない。必ず WITH CHECK を使う。
-- （元仕様は using を使っていたが、これは誤り。INSERT 行の検証は with check で行う）
drop policy if exists ins_own on public.attendance_records;
create policy ins_own
  on public.attendance_records
  for insert
  with check (auth.uid() = user_id);

-- SELECT: 本人、または「その打刻ユーザーの上長が自分」である管理者が参照できる。
-- 相関サブクエリでは attendance_records.user_id を明示的に参照する。
drop policy if exists sel_own_or_mgr on public.attendance_records;
create policy sel_own_or_mgr
  on public.attendance_records
  for select
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.profiles p
      where p.id = attendance_records.user_id
        and p.manager_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- UPDATE / DELETE ポリシーは意図的に定義しない。
-- 勤怠（attendance）は改ざん不可（immutable）な監査証跡（audit trail）として
-- 追記専用（append-only）で扱う。RLS でポリシー未定義の操作は既定で拒否されるため、
-- 一般ユーザーからの UPDATE / DELETE は全て不許可となる。
-- 訂正が必要な場合は打ち消しレコードを追記する運用とし、行の書き換えは行わない。
-- ------------------------------------------------------------
