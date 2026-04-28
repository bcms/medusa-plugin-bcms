import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import path from "path"
import type BcmsModuleService from "../../src/modules/bcms/service"

const RESOLVE_PATH = path.resolve(
  __dirname,
  "../../.medusa/server/src/modules/bcms"
)

// These tests exercise the BCMS module against a real Postgres instance.
// They require the plugin to have been built (`npm run build`) so the
// compiled module exists at `.medusa/server/src/modules/bcms`.
//
// `@medusajs/test-utils` connects via DB_HOST / DB_PORT / DB_USERNAME /
// DB_PASSWORD env vars and creates a fresh database per Jest worker, so
// the user must have CREATEDB privileges. Locally, the simplest setup is:
//
//   DB_HOST=localhost \
//   DB_USERNAME=postgres \
//   DB_PASSWORD=postgres \
//   npm run test:integration:modules

moduleIntegrationTestRunner<BcmsModuleService>({
  moduleName: "bcms",
  resolve: RESOLVE_PATH,
  testSuite: ({ service }) => {
    describe("BcmsModuleService — settings singleton", () => {
      it("creates a default settings row on first call", async () => {
        const setting = await service.getOrCreateBcmsSetting()

        expect(setting.id).toEqual(expect.any(String))
        expect(setting.enabled_templates).toEqual([])
        expect(setting.default_slots).toEqual(["default"])
        expect(setting.auto_create_on_product).toBe(false)
        expect(setting.last_test_at).toBeNull()
        expect(setting.last_test_status).toBeNull()
      })

      it("returns the same singleton on subsequent calls", async () => {
        const first = await service.getOrCreateBcmsSetting()
        const second = await service.getOrCreateBcmsSetting()

        expect(second.id).toBe(first.id)

        const all = await (service as any).listBcmsSettings()
        expect(all).toHaveLength(1)
      })

      it("persists updates to enabled_templates and default_slots", async () => {
        const initial = await service.getOrCreateBcmsSetting()
        await (service as any).updateBcmsSettings([
          {
            id: initial.id,
            enabled_templates: ["blog", "page"],
            default_slots: ["default", "rich_description"],
          },
        ])

        const reloaded = await service.getOrCreateBcmsSetting()
        expect(reloaded.id).toBe(initial.id)
        expect(reloaded.enabled_templates).toEqual(["blog", "page"])
        expect(reloaded.default_slots).toEqual([
          "default",
          "rich_description",
        ])
      })
    })

    describe("BcmsLink — auto-generated CRUD", () => {
      it("creates a link with sensible defaults and lists it back", async () => {
        const [created] = await (service as any).createBcmsLinks([
          {
            entry_id: "entry_abc",
            template_name: "blog",
          },
        ])

        expect(created.id).toEqual(expect.any(String))
        expect(created.entry_id).toBe("entry_abc")
        expect(created.template_name).toBe("blog")
        expect(created.slot).toBe("default")
        expect(created.position).toBe(0)

        const listed = await (service as any).listBcmsLinks({
          entry_id: "entry_abc",
        })
        expect(listed).toHaveLength(1)
        expect(listed[0].id).toBe(created.id)
      })

      it("supports updating slot and position via auto-CRUD", async () => {
        const [created] = await (service as any).createBcmsLinks([
          {
            entry_id: "entry_xyz",
            template_name: "page",
            slot: "default",
            position: 0,
          },
        ])

        await (service as any).updateBcmsLinks([
          { id: created.id, slot: "rich_description", position: 2 },
        ])

        const [updated] = await (service as any).listBcmsLinks({
          id: created.id,
        })
        expect(updated.slot).toBe("rich_description")
        expect(updated.position).toBe(2)
      })

      it("soft-deletes a link via deleteBcmsLinks", async () => {
        const [created] = await (service as any).createBcmsLinks([
          { entry_id: "entry_to_delete", template_name: "blog" },
        ])

        await (service as any).deleteBcmsLinks(created.id)

        const remaining = await (service as any).listBcmsLinks({
          id: created.id,
        })
        expect(remaining).toHaveLength(0)
      })
    })
  },
})

jest.setTimeout(120_000)
