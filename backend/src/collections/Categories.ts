import { CollectionConfig } from "payload/types";

// * Blog or Announcement

const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "name",
    disableDuplicate: true,
  },
  access: {
    read: () => true,
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
