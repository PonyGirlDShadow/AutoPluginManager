import { githubTokenVar, pluginsDirVar } from '@constants';
import { storageMap } from '@storage';
import { checkPath } from '@utils';
import { existsSync } from "fs";
import { createInterface } from 'readline';

export async function askForName() {
    return new Promise<string>(resolve => {
        ask("Specify plugin name: ", (answer: string) => {
            resolve(answer);
        });
    });
}

export async function askForLink(newLink: boolean) {
    return new Promise<string>(resolve => {
        ask(`Specify ${(newLink ? "new " : "")}repository/directory link: `, (answer: string) => {
            resolve(answer);
        });
    });
}

export async function getVencordDir() {
    if (storageMap.has(pluginsDirVar)) return;
    return new Promise<void>(resolve =>
        ask('Specify plugin install directory: ', (answer: string) => {
            if (!checkPath(answer) || !existsSync(answer)) {
                console.log('Please provide correct path');
                process.exit();
            }
            else {
                if (!answer.endsWith("plugins")) {
                    console.warn("Path you provided does not end in 'plugins' or 'userplugins' directory! Please check the path and reset if neccessary.");
                }
                console.log("Path saved: " + answer);
                storageMap.set(pluginsDirVar, answer);
                resolve();
            }
        })
    );
}
export async function getGithubToken() {
    if (storageMap.has(githubTokenVar)) return;
    return new Promise<void>(resolve =>
        ask('Please provide Github API token (get one here: https://github.com/settings/tokens/new?description=Download%20Vencord%20plugins&scopes=repo): ', (answer: string) => {
            if (!answer.startsWith("ghp_") || answer.length != 40) {
                console.log('Please provide correct token!');
                process.exit();
            }
            else {
                console.log("Token saved: " + answer);
                storageMap.set(githubTokenVar, answer);
                resolve();
            }
        })
    );
}



export function ask(question: string, callback: Function) {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(question, (answer) => {
        callback(answer);
        rl.close();
    });
}
