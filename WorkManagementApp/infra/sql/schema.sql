-- ============================================================
-- WorkManagementApp スキーマ定義（Supabase / PostgreSQL）
-- 適用順: schema.sql → rls_attendance.sql → seed.sql
-- このスクリプトは再実行可能（idempotent）になるよう
-- `if not exists` / `drop ... if exists` ガードを付与している。
-- アプリ側の型は src/types/auth.ts（profiles）と
-- src/types/attendance.ts（attendance_records）に対応する。
-- ============================================================

-- ------------------------------------------------------------
-- 拡張機能
-- gen_random_uuid() をサーバ側 INSERT 時のデフォルト UUID 生成に使う。
-- 打刻 id は通常クライアントが生成（冪等キー）するが、
-- サーバ側で id 未指定の INSERT が来た場合のフォールバックとして default を用意する。
-- ------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- profiles テーブル
-- auth.users と 1:1 で対応するアプリ用プロフィール。
--   id          : auth.users(id) を参照する PK。認証ユーザー削除時は連動削除。
--   display_name: 表示名（任意）。
--   role        : 役割。'employee'（従業員）/ 'manager'（管理者）。既定は employee。
--   manager_id  : 上長の profiles.id（自己参照）。管理者は配下の勤怠を閲覧できる（RLS 参照）。
--   created_at  : 作成日時。
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role         text not null default 'employee' check (role in ('employee', 'manager')),
  manager_id   uuid references public.profiles (id),
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- attendance_records テーブル（勤怠打刻台帳）
--   id          : PK。通常はクライアント生成 UUID（再送による重複を PK で防ぐ＝冪等）。
--                 サーバ側 INSERT 用に gen_random_uuid() を default に設定。
--   user_id     : 打刻したユーザー（profiles.id）。NOT NULL。
--   record_type : 打刻種別。'clockIn'/'clockOut'/'breakStart'/'breakEnd' のいずれか。
--   recorded_at : 打刻時刻（UTC 正規化した timestamptz）。NOT NULL。
--   location    : 位置情報 jsonb（任意）。例: {"lat":35.6895,"lng":139.6917}。
--   note        : 備考（任意）。
--   created_at  : サーバ受領（行作成）日時。
-- 追記専用（append-only）台帳として扱う。UPDATE/DELETE は RLS で禁止する。
-- ------------------------------------------------------------
create table if not exists public.attendance_records (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id),
  record_type text not null check (record_type in ('clockIn', 'clockOut', 'breakStart', 'breakEnd')),
  recorded_at timestamptz not null,
  location    jsonb,
  note        text,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- インデックス
-- 勤怠履歴は「ユーザー単位で新しい順」に取得することが多いため、
-- (user_id, recorded_at desc) の複合インデックスを張る。
-- create index if not exists でテーブル再作成なしの再実行に対応。
-- ------------------------------------------------------------
create index if not exists attendance_records_user_recorded_at_idx
  on public.attendance_records (user_id, recorded_at desc);

-- ------------------------------------------------------------
-- 新規 auth.users 作成時に profiles 行を自動生成するトリガー関数。
-- security definer で実行し（関数所有者権限）、
-- サインアップ直後に対応プロフィールを必ず作る。
-- display_name はサインアップ時の user_metadata.display_name を採用する。
-- search_path を固定して関数の安全性を高める。
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 再実行のため既存トリガーを削除してから作成する。
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
