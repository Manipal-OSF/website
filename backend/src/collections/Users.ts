import { CollectionConfig } from "payload/types";

const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "name",
    disableDuplicate: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    // * Email added by default
    {
      name: "name",
      type: "text",
      required: true,
    },
  ],
};

export default Users;
