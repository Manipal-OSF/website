import { CollectionConfig } from "payload/types";

const beforeChangeHook = async ({ data, req, operation, originalDoc }) => {
  console.log(JSON.stringify(data));
  // console.log(JSON.stringify(req));
  console.log(JSON.stringify(originalDoc));
  // ! send to firebase
  return data;
};

const afterReadHook = async ({ doc, req, query, findMany }) => {
  // ! format url
  return doc;
};

const afterDeleteHook = async ({ req, id, doc }) => {
  // ! delete from firebase
};

const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: (): boolean => true,
  },
  admin: {
    useAsTitle: "title",
  },
  hooks: {
    beforeChange: [beforeChangeHook],
    afterRead: [afterReadHook],
    afterDelete: [afterDeleteHook],
  },
  upload: {
    disableLocalStorage: true,
    staticURL: "/media",
    staticDir: "media",
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        crop: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 1024,
        crop: "centre",
      },
      {
        name: "tablet",
        width: 1024,
        height: null,
        crop: "centre",
      },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "alt",
      label: "Alt Text",
      type: "text",
      required: true,
    },
  ],
};

export default Media;
