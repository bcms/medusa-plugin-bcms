import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260819170000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "bcms_setting" drop column if exists "auto_create_on_product";`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "bcms_setting" add column if not exists "auto_create_on_product" boolean not null default false;`
    )
  }
}
