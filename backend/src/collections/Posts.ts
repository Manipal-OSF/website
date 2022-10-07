import { CollectionConfig } from "payload/types";

const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    defaultColumns: ["title", "author", "category", "tags", "status"],
    useAsTitle: "title",
    disableDuplicate: true,
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "authors",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      name: "publishedDate",
      type: "date",
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
    },
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
    },
    {
      name: "content",
      type: "richText",
      required: true,
    },
    {
      name: "estimatedTime",
      type: "number",
      required: true,
    },
    {
      name: "coverImage",
      type: "upload",
      required: true,
      relationTo: "media",
    },
    {
      name: "status",
      type: "select",
      options: [
        {
          value: "draft",
          label: "Draft",
        },
        {
          value: "published",
          label: "Published",
        },
      ],
      defaultValue: "draft",
      admin: {
        position: "sidebar",
      },
    },
  ],
};

export default Posts;
