import * as fs from "fs";
import * as path from "path";
import { JsonHelper } from "../helpers/json-helper";
import { StocklineConfig } from "./types";

const CONF_DIR = "conf";
const CONF_NAME = `stockline.json`;

export class ConfigManager {

    public static readGlobalConfig(): StocklineConfig {
        // Read config file from ./conf folder
        try {
            let content = fs.readFileSync(path.resolve(process.cwd(), CONF_DIR, CONF_NAME), "utf8");

            console.info(`Config loaded from ${CONF_DIR}/${CONF_NAME}`);

            // Return as JSON
            return {
                ...<StocklineConfig>JsonHelper.parse(content)
            };
        }
        catch (e) {
            console.error(`Could not read ${CONF_DIR}/${CONF_NAME} file (${e.message})`);
            throw e;
        }

    }

}
