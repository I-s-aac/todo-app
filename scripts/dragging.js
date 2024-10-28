"use strict";


function convertTouchToXY(event) {
    const touch = event.touches[0];
    return [touch?.clientX ?? 0, touch?.clientY ?? 0]
}

export function handleDragStart(event, isTouch = false, currentDragItem, currentDragElement, dragType) {

    let x = event.clientX;
    let y = event.clientY;

    if (isTouch) [x, y] = convertTouchToXY(event);

    draggingData.currentDragItem = currentDragItem;
    draggingData.currentDragElement = currentDragElement;
    draggingData.currentDragType = dragType;

    draggingData.currentDragElement.style.position = "relative";
    draggingData.currentDragElement.style.zIndex = 999;

    draggingData.currentVisualIndex = Number(draggingData.currentDragElement.getAttribute("index"));

    const rect = draggingData.currentDragElement.getBoundingClientRect();

    draggingData.offsetX = rect.left;
    draggingData.offsetY = rect.top + rect.height / 2;

    if (isTouch) return;
    // Create a transparent 1x1 pixel PNG
    const transparentImage = new Image();
    transparentImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA' +
        'AAABCAIAAADkYNOEAAAAFElEQVR42mJ8//8/AwAB/4B4rA2QAAAAAElFTkSuQmCC';

    // Set the transparent image as the drag image
    event.dataTransfer.setDragImage(transparentImage, 0, 0);
}

export async function handleDrag(event, isTouch = false, dataType, list) {
    if (draggingData.currentDragItem !== null && draggingData.currentDragElement !== null) {

        let x = event.clientX;
        let y = event.clientY;

        if (isTouch) { [x, y] = convertTouchToXY(event); event.preventDefault(); }


        draggingData.currentDragElement.style.transition = "transform 0.0s";
        draggingData.currentDragElement.style.transform =
            `translate(${x - draggingData.offsetX + 5}px, ${y - draggingData.offsetY}px)`;

        let hoveredElement = document.elementFromPoint(x, y);
        // make sure it's not a string
        const hoveredIndex = hoveredElement.getAttribute("index") !== null ? Number(hoveredElement.getAttribute("index")) : null;


        if (hoveredIndex !== null) {

            function up(element) {

                // element.setAttribute(key, "false");
                element.classList.add("shift-up");
                element.classList.remove("shift-down");

            }
            function down(element) {

                // element.setAttribute(key, "false");
                element.classList.add("shift-down");
                element.classList.remove("shift-up");

            }
            function clear(element) {

                // element.setAttribute(key, "false");
                element.classList.remove("shift-up", "shift-down");

            }

            hoveredElement = document.getElementById(`${dataType}-${hoveredIndex}`);


            let height = hoveredElement.offsetHeight + mt_3Height; // current class for margin
            document.documentElement.style.setProperty("--dynamic-height", `${height}px`);


            const hoverContainsUp = hoveredElement.classList.contains("shift-up");
            const hoverContainsDown = hoveredElement.classList.contains("shift-down");
            const doingAnimation = hoveredElement.getAttribute("doingAnimation") === "true";

            if (draggingData.currentVisualIndex === hoveredIndex - 1 && !doingAnimation) {

                up(hoveredElement);
                draggingData.currentVisualIndex += 1;

            } else if (draggingData.currentVisualIndex === hoveredIndex + 1 && !doingAnimation) {

                down(hoveredElement);
                draggingData.currentVisualIndex -= 1;

            } else if (
                draggingData.currentVisualIndex === hoveredIndex &&
                !doingAnimation &&
                (hoverContainsDown || hoverContainsUp)
            ) {
                if (hoverContainsUp) {

                    clear(hoveredElement);
                    draggingData.currentVisualIndex -= 1;

                } else if (hoverContainsDown) {

                    clear(hoveredElement);
                    draggingData.currentVisualIndex += 1;

                }
            }
        }
    }
}

export function handleDragEnd(event, isTouch = false, dataType, dataMoveFunction, list) {

    let x = event.clientX;
    let y = event.clientY;

    if (isTouch) {
        [x, y] = convertTouchToXY(event);
    }

    const hoveredElement = document.elementFromPoint(x, y);
    const hoveredIndex = hoveredElement.getAttribute("index");

    // fix styling of the elements
    for (let i = 0; i < list.length; i++) {
        const element = document.getElementById(`${dataType}-${i}`);
        // remove the slider classes and reset transform
        element.classList.remove("shift-up");
        element.classList.remove("shift-down");
        element.style.transform = "";
    }

    const visIndex = draggingData.currentVisualIndex;
    const index = Number(draggingData.currentDragElement.getAttribute("index"));

    if (visIndex !== index) {
        dataMoveFunction(index, visIndex);

        draggingData.currentDragItem = null;
        draggingData.currentDragElement = null;

        updateContainers();
    }
}