import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260819164800 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "bcms_setting" add column if not exists "slot_templates" jsonb not null default '{}'::jsonb;`
    )
    this.addSql(`
      update "bcms_setting"
      set "slot_templates" = coalesce((
        select jsonb_object_agg(slot_name, to_jsonb(enabled_templates))
        from unnest(
          case
            when cardinality(default_slots) > 0 then default_slots
            else array['default']::text[]
          end
        ) as slot_name
      ), '{"default":[]}'::jsonb)
      where "slot_templates" = '{}'::jsonb;
    `)
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "bcms_setting" drop column if exists "slot_templates";`
    )
  }
}
