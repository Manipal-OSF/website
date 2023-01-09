import { buildConfig } from "payload/config";
import path from "path";
import Categories from "./collections/Categories";
import Posts from "./collections/Posts";
import Tags from "./collections/Tags";
import Users from "./collections/Users";
import Media from "./collections/Media";

export default buildConfig({
  serverURL: "http://localhost:8000",
  admin: {
    user: Users.slug,
  },
  routes: {
    admin: process.env.ADMIN_URL,
  },
  collections: [Posts, Categories, Tags, Users, Media],
  cors: "*",
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
  },
});
