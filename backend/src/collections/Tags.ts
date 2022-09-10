import { CollectionConfig } from "payload/types";

const Tags: CollectionConfig = {
  slug: "tags",
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
    },
  ],
  timestamps: false,
};

export default Tags;
