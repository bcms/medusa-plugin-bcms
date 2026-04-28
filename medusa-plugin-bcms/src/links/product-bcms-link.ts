import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"
import BcmsModule from "../modules/bcms"

/**
 * A Medusa product can be linked to many BCMS entry references (one row per
 * entry/slot/language). When the product is deleted, its BCMS link rows are
 * cascade-deleted too.
 */
export default defineLink(ProductModule.linkable.product, {
  linkable: BcmsModule.linkable.bcmsLink,
  isList: true,
  deleteCascade: true,
})
