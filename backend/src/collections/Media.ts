import { CollectionConfig } from "payload/types";
import { isAdmin } from "../access/isAdmin";

const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: (): boolean => true,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: "title",
  },
  upload: {
    disableLocalStorage: false,
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
