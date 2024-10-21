import { listAdder } from "./scripts/htmlElements.js";
import { taskLists } from "./scripts/globalVars.js";

export function addList() {
    const listName = sanitizeInput(listAdder.value);
    if (!listExists(listName) && listName !== "") {
        taskLists.push({ name: listName, tasks: [], done: false });
        listAdder.value = "";
        updateContainers();
    }
}