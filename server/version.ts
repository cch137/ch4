import fs from "fs";
import { parse } from "@cch137/utils/version-parser";

const version = parse(
  JSON.parse(fs.readFileSync("package.json", "utf8"))?.version || ""
);

export default version;
export const v = version.toString();
