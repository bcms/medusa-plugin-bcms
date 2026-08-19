import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"
import BcmsModule from "../modules/bcms"

export default defineLink(ProductModule.linkable.product, {
  linkable: BcmsModule.linkable.bcmsLink,
  isList: true,
  deleteCascade: true,
})
