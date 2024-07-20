function AppData() {
    return Bun.env.APPDATA || (process.platform == 'darwin' ? Bun.env.HOME + '/Library/Preferences' : Bun.env.HOME + "/.local/share");
}
import { allPluginsVar } from "@constants";
import type { TStorage } from "@types";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
const appDir = join(AppData(), "VencordPluginManager");
const storageFile = join(appDir, "storage.json");
export const storageMap = new Map<string, string | string[]>();

function checkAppDir() {
    if (!existsSync(appDir)) {
        mkdirSync(appDir, { recursive: true });
    }
}

export function resetStorage() {
    storageMap.clear();
    saveStorage();
}

export function loadStorage() {
    checkAppDir();
    try {
        if (!existsSync(storageFile)) {
            console.log("Storage not found. Resetting...");
            resetStorage();
            return;
        }
        const file = readFileSync(storageFile, { encoding: "utf-8" });
        const obj: TStorage = JSON.parse(file);
        for (const key of Object.keys(obj)) {
            storageMap.set(key, obj[key]!);
        }

    }
    catch (ex) {
        console.log("Exception loading storage. Resetting...");
        resetStorage();
    }
}
export function saveStorage() {
    checkAppDir();
    let content = "{}";
    if (storageMap.size != 0) {
        const obj: TStorage = {};
        for (const entry of storageMap.entries()) {
            obj[entry[0]] = entry[1];
        }
        content = JSON.stringify(obj, null, 4);
    }
    writeFileSync(storageFile, content);
}


export function addPlugin(name: string, link: string) {
    if (!storageMap.has(allPluginsVar))
        storageMap.set(allPluginsVar, []);
    const plugins = storageMap.get(allPluginsVar) as string[];
    if (plugins.includes(name)) {
        console.error("Plugin with same name already exists: " + name);
        return false;
    }
    plugins.push(name)
    storageMap.set(name, link);
    saveStorage();
    return true;
}

export function removePlugin(name: string) {
    const allPlugins = (storageMap.get(allPluginsVar) as string[]);
    const newList = [];
    for (const pname of allPlugins) {
        if (pname != name)
            newList.push(pname);
    }
    storageMap.set(allPluginsVar, newList);
    storageMap.delete(name);
    saveStorage();
}