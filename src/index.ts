import { askForLink, askForName, getGithubToken, getVencordDir } from "@ask";
import { allPluginsVar, pluginsDirVar } from "@constants";
import { getFromLink } from "@github";
import { addPlugin, loadStorage, removePlugin, resetStorage, saveStorage, storageMap } from "@storage";
import { validateLink } from "@utils";
import { Command } from "commander"; // add this line
import figlet from "figlet";
import { rmSync } from "fs";
import { join } from "path";


//add the following line
const program = new Command("AutoPluginManager")
    .version("1.0.0")
    .usage("command")
    .description("Plugin Manager CLI for Vencord");
const buildCommand = program.command("update")
    .alias("u")
    .summary("Updates all plugins")
    .description("Downloads newest contents from sources")
    .action(async () => {
        await getVencordDir();
        await getGithubToken();
        if (!checkPluginList()) return;
        for (const pname of storageMap.get(allPluginsVar) as string[]) {
            rmSync(join(storageMap.get(pluginsDirVar) as string, pname), { recursive: true, force: true });
            const result = await getFromLink(storageMap.get(pname) as string, pname);
            if (result)
                console.log(`Successefully downloaded plugin ${pname}!`);
            else
                console.log(`Error downloading plugin ${pname}!`);
        }
    });
const loadCommand = program.command("install")
    .alias("i")
    .summary("Install new plugin from source")
    .description("Installs new plugin from source")
    .argument("<name>", "Name of the plugin")
    .argument("<link>", "Link to plugin source")
    .action(async (name: string, link: string) => {
        await getVencordDir();
        await getGithubToken();
        const pluginName = name ? name : await askForName();
        if (pluginName.length >= 64) {
            console.log(pluginName + "\nRead more... (Plugin name too long)");
            return;
        }
        if (hasPlugin(pluginName)) {
            console.log("Plugin with same name already exists!");
            return;
        }
        link = link ? link : await askForLink(false);
        if (!validateLink(link)) {
            console.log("Please provide a git repository or directory (NOT FILE) link to plugin!");
            return;
        }

        const result = await getFromLink(link, pluginName);
        if (result) {
            addPlugin(pluginName, link)
            console.log("Successefully downloaded plugin " + pluginName);
        }
        else {
            console.log("Failed downloading plugin " + pluginName);
        }
    });
const removeCommand = program.command("remove")
    .summary("Remove plugin with specified name")
    .description("Removes plugin with specified name")
    .usage("<name>")
    .argument("<name>", "Name of plugin to delete")
    .action((name: string) => {
        if (!hasPlugin(name)) return;
        removePlugin(name);
        rmSync(join(storageMap.get(pluginsDirVar) as string, name), { recursive: true, force: true });
        console.log(`Removed plugin ${name}!`);
    });
const resetCommand = program.command("reset")
    .summary("Resets plugins & settings")
    .description("Resets CLI savefile")
    .action(() => {
        resetStorage();
        console.log("Storage reset completed!");
    });
const listCommand = program.command("list")
    .alias("l")
    .summary("See list of installed plugins")
    .description("Shows a list of all installed plugins")
    .action(() => {
        if (!checkPluginList()) return;
        console.log("List of all plugins:");
        for (const pname of storageMap.get(allPluginsVar) as string[]) {
            console.log(`Plugin '${pname}' - ${storageMap.get(pname) as string}`);
        }
    });
const setCommand = program.command("set")
    .summary("See list of installed plugins")
    .description("Shows a list of all installed plugins")
    .argument("<name>", "Name of the plugin")
    .argument("<link>", "new link to plugin")
    .action(async (name: string, link: string) => {
        if (!hasPlugin(name)) return;
        link = link ? link : await askForLink(true);
        if (!validateLink(link)) {
            console.error("Invalid link: " + link);
            return;
        }
        storageMap.set(name, link);
        saveStorage();
    });
function checkPluginList() {
    if (!storageMap.has(allPluginsVar)) {
        console.error("No plugins installed!");
        return false;
    }
    return true;
}
function hasPlugin(name: string) {
    if (!checkPluginList()) return false;
    if (!(storageMap.get(allPluginsVar) as string[]).includes(name)) {
        console.error("No plugin with name " + name);
        return false;
    }
    return true;
}

loadStorage();
console.log(figlet.textSync("PluginManager"));
program.parse(Bun.argv);