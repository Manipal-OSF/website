import { CollectionConfig } from "payload/types";
import { isAdmin } from "../access/isAdmin";

// * Post tags like Misc, Informative, Dev, etc

const Tags: CollectionConfig = {
  slug: "tags",
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
    },
  ],
  timestamps: false,
};

export default Tags;
