import { fileLinkRegex } from "@constants";
import { basename } from "path";

export function checkPath(path: string) {
    return path !== basename(path);
}
export function validateLink(link: string) {
    const url = new URL(link);
    if (url.hostname != "github.com") {
        console.error("App currently works only with github!");
        return false;
    }
    if (link.endsWith(".git")) return true;
    else if (fileLinkRegex.test(link)) return false;
    return true;
}