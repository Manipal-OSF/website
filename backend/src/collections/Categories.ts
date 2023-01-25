import { CollectionConfig } from "payload/types";
import { isAdmin } from "../access/isAdmin";

// * Blog or Announcement

const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "name",
    disableDuplicate: true,
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
  ],
  timestamps: false,
};

export default Categories;
