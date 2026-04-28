import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

/**
 * Reset (or set) an admin user's password without using the email reset flow.
 *
 * Usage:
 *   npx medusa exec ./src/scripts/reset-admin-password.ts <email> <new-password>
 *
 * Example:
 *   npx medusa exec ./src/scripts/reset-admin-password.ts admin@example.com NewSecret123!
 *
 * The password is hashed by Medusa's `emailpass` auth provider (scrypt-kdf)
 * and stored on the matching `provider_identity` row, exactly like a normal
 * password change would do.
 */
export default async function resetAdminPassword({
  container,
  args,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const [email, password] = args ?? []

  if (!email || !password) {
    logger.error(
      "Missing arguments. Usage: npx medusa exec ./src/scripts/reset-admin-password.ts <email> <new-password>"
    )
    process.exit(1)
  }

  const userService = container.resolve(Modules.USER)
  const authService = container.resolve(Modules.AUTH)

  const [user] = await userService.listUsers({ email })

  if (!user) {
    logger.error(`No admin user found with email "${email}".`)
    logger.info(
      `Tip: create a fresh admin instead with: npx medusa user -e ${email} -p '<password>'`
    )
    process.exit(1)
  }

  const { success, error } = await authService.updateProvider("emailpass", {
    entity_id: email,
    password,
  })

  if (!success) {
    logger.error(`Failed to update password: ${error}`)
    process.exit(1)
  }

  logger.info(`Password for "${email}" has been reset successfully.`)
}
