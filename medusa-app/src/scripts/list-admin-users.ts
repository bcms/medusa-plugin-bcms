import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

/**
 * List every admin user in the database.
 *
 * Usage:
 *   npx medusa exec ./src/scripts/list-admin-users.ts
 */
export default async function listAdminUsers({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const userService = container.resolve(Modules.USER)

  const [users, count] = await userService.listAndCountUsers(
    {},
    { take: null }
  )

  if (!count) {
    logger.info("No admin users found.")
    return
  }

  logger.info(`Found ${count} admin user(s):`)
  for (const user of users) {
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ")
    logger.info(
      `- ${user.email}${name ? `  (${name})` : ""}  [id: ${user.id}, created: ${user.created_at}]`
    )
  }
}
