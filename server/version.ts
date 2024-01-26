import fs from "fs"
import { parse } from "@cch137/utils/format/version";

const { version = '' } = JSON.parse(fs.readFileSync('package.json', 'utf8'))

export default parse(version);
