import { githubContentLink, githubRefAddition, githubRepoRegex, pluginsDirVar } from "@constants";
import { storageMap } from "@storage";
import { existsSync, mkdirSync } from "fs";
import { get } from "https";
import { join } from "path";

export async function getDirectory(info: string, destination: string, USER: string, REPO: string, PATH: string = "", REF: string = "") {
    try {
        const contents = JSON.parse(info);
        if (!!contents.status && contents.status != "200") {
            console.error("Error getting info for directory! Code is not 200\n", contents);
            return false;
        }
        for (const entry of contents) {
            if (!entry.download_url) {
                getDirectory(await getRepositoryInfo(USER, REPO, PATH + "/" + entry.name, REF), join(destination, entry.name), USER, REPO, PATH + "/" + entry.name, REF);
            }
            else
                downloadContent(entry.download_url, destination, entry.name);
        }
        return true;
    }
    catch (ex) {
        console.error("Error parsing directory info!", ex);
        return false;
    }
}
export async function getRepositoryInfo(USER: string, REPO: string, PATH: string = "", REF: string = "") {
    let initial = githubContentLink.replace("{USER}", USER).replace("{REPO}", REPO).replace("{PATH}", PATH);
    if (REF) {
        initial += githubRefAddition.replace("{REF}", REF);
    }
    return new Promise<string>(resolve =>
        get(initial, (response) => {
            let data = "";
            response.on("data", (chunk) => data += chunk);
            response.once("end", () => {
                resolve(data);
            });
        })
    );
}
export async function getFromLink(link: string, dirName: string) {
    const args = githubRepoRegex.exec(link);
    if (!args) {
        console.error("Invalid link: " + link);
        return false;
    }
    const path = args[7].startsWith("github.com") ? args[7].replace("github.com/", "") : args[7];
    const members = path.split("/");
    const USER = members[0];
    const REPO = members[1].replace(".git", "");
    let info = null;
    let REF = "";
    let PATH = "";
    if (link.endsWith(".git")) {
        info = await getRepositoryInfo(USER, REPO);
    }
    else {
        // PonyGirlDShadow/Vencord/tree/main/browser"    
        if (members.length > 2) {
            REF = members[3];
            PATH = members.slice(4).join("/");
        }
        info = await getRepositoryInfo(USER, REPO, PATH, REF);
    }
    if (!info) {
        console.error(`Error getting info of repo ${REPO} owner by ${USER}`)
        return false;
    }
    //console.log(info);
    return await getDirectory(info, join(storageMap.get(pluginsDirVar) as string, dirName), USER, REPO, PATH, REF);
}

export async function downloadContent(link: string, directory: string, filename: string) {
    if (!existsSync(directory)) {
        mkdirSync(directory, { recursive: true });
    }
    return new Promise<boolean>(resolve => {
        try {
            get(link, (response) => {
                let data = "";
                response.on("data", (chunk) => data += chunk);
                response.once("end", () => {
                    Bun.write(join(directory, filename), data);
                    resolve(true);
                });
            })
        }
        catch (ex) {
            console.error("Error downloaing file " + link, ex);
            resolve(false);
        }
    });
}