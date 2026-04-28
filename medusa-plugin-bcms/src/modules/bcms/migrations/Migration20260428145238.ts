import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260428145238 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "bcms_link" ("id" text not null, "entry_id" text not null, "template_name" text not null, "slot" text not null default 'default', "language" text null, "position" integer not null default 0, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bcms_link_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bcms_link_deleted_at" ON "bcms_link" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "bcms_setting" ("id" text not null, "enabled_templates" text[] not null, "default_slots" text[] not null, "auto_create_on_product" boolean not null default false, "last_test_at" timestamptz null, "last_test_status" text null, "last_test_message" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bcms_setting_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bcms_setting_deleted_at" ON "bcms_setting" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "bcms_link" cascade;`);

    this.addSql(`drop table if exists "bcms_setting" cascade;`);
  }

}
