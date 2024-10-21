import { taskLists } from "./globalVars.js";

export function sanitizeInput(input) {
    // Allow only alphanumeric characters, basic punctuation, and whitespace
    return input.replace(/[^a-zA-Z0-9 .,!?-]/g, "");
}
export function listExists(listName) {
    for (const list of taskLists) {
        if (list.name === listName) {
            return true;
        }
    }
    return false;
}
export function checkListCompletion(list) {
    if (list.tasks.length > 0) {
        if (list.tasks.every(task => task.done === true)) {
            list.done = true;
        } else {
            list.done = false;
        }
    }
}