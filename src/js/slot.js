/**
 * written by Jin.  2022.11.01
 * class for slots.
 * A slot is a recatngle region, that contains one or some windows.
 * A monitor is divided with some slots
 */

import * as utils from "./utils.js";

/**
 * manage a slot
 */
export class Slot{
    constructor(slotInfo) {
        this.monitorIdx = slotInfo.monitorIdx;    // The ID that chrome decided.  ( index of the array that the function "system.display.getInfo()" returns. )
        this.boundRect = slotInfo.boundRect;
        this.wndStack = slotInfo.wndStack || [];
        this.monitorLayout = slotInfo.monitorLayout;
        this.idx_inLayout = slotInfo.idx_inLayout;
    }

    // push a windowId into the slot's wndStack
    push(windowId) {
        if (!this.moveTop(windowId)) {
            this.wndStack.push(windowId);
        }
    }

    // get top windowId from the slot's wndStack
    top() {
        if (this.wndStack.length == 0) return 0;
        return this.wndStack[this.wndStack.length - 1];
    }

    // get bottom windowId from the slot's wndStack
    bottom() {
        if (this.wndStack.length == 0) return 0;
        return this.wndStack[0];
    }

    // pop top windowId from the slot
    pop() {
        this.wndStack.pop();
    }

    // move element top of the slot's stack
    moveTop(windowId) {
        let idx = this.wndStack.indexOf(windowId);
        if (idx === -1) {
            return false;
        }

        if (idx < this.wndStack.length - 1) {
            this.wndStack.splice(idx, 1);
            this.wndStack.push(windowId);
        }

        return true;
    }

    // remove element from  slot's wbdStack
    remove(windowId) {
        if (this.wndStack.length === 0) {
            return false;
        }

        let idx = this.wndStack.indexOf(windowId);
        if (idx === -1) {
            return false;
        }

        this.wndStack.splice(idx, 1);
        return true;
    }

    // check if slot is empty
    isEmpty() {
        return (this.wndStack.length === 0);
    }

    // get including windows count
    windowsCount() {
        return this.wndStack.length;
    }

    // get slot state
    async slotState() {
        let normalWnd = 0;
        for (const windowId of this.wndStack) {
            const window = await chrome.windows.get(windowId);
            if (window.state === 'normal') normalWnd++;
        }

        if (normalWnd === 0) return "minimized";
        if (normalWnd < this.wndStack.length) return "half-filled";
        if (this.wndStack.length > 1) return "stacked";

        return "normal";
    }

    // close all windows in slot
    close() {
        this.wndStack.forEach(async windowId => {
            let lastError = await chrome.windows.remove(windowId);
            if (lastError) {
                this.remove(windowId);
                console.log(lastError.message);
            }
        })

        this.wndStack = [];
    }

    // check if window is contains in slot.
    isContain(windowId) {
        let idx = this.wndStack.indexOf(windowId);
        if (idx === -1) {
            return false;
        }

        return true;
    }

    // empty slot
    empty() {
        this.wndStack = [];
    }
}

/**
 * slotArray - manage array of slots
 */
export class Slots {
    constructor(array) {
        this.slotArray = [];
        array.forEach(info => {
            this.slotArray.push(new Slot(info))
        });
    }

    // iniitalize
    static async initialize(monitorInfoArray) {
        return new Promise((resolve, reject) => {
            let slotArray = [];
            monitorInfoArray.forEach((monitorInfo) => {
                if (monitorInfo.monitorOrder !== 1000) {
                    let layout = utils._layouts[utils.Layouts[monitorInfo.layoutId].idx];
                    for (let i = 0; i < layout.slotcount; i++) {
                        let slotRect = getSlotRect(monitorInfo.boundRect, utils.Layouts[monitorInfo.layoutId].name, i);
                        slotArray.push({
                            monitorIdx: monitorInfo.monitorIdx,
                            boundRect: slotRect,
                            wndStack: [],
                            monitorLayout: utils.Layouts[monitorInfo.layoutId].name,
                            idx_inLayout: i,
                        });
                    }
                }
            });

            chrome.storage.local.set({
                slotArray
            }, function () {
                resolve();
            });
        });
    }

    // load
    static async load() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(["slotArray"], function ({ slotArray }) {
                if (slotArray) {
                    resolve(slotArray);
                } else {
                    console.log("error in slot loading...")
                    reject();
                }
            });
        });
    }

    // save slotarray to storage
    async save(callbackFunction = 0) {
        await chrome.storage.local.set({
            slotArray: this.slotArray
        })

        if (callbackFunction) callbackFunction();
    }

    // move the tab into slotArray using flik option
    async appendFromTab(tabId, flikRule, callbackFunction = 0) {
        let slotIndex = flikRule.slot - 1;
        if (slotIndex < 0) {
            slotIndex = 0;
        }
        if (slotIndex >= this.slotArray.length) {
            slotIndex = this.slotArray.length - 1;
        }

        const slot = this.slotArray[slotIndex];
        let windowId = slot.top();
        let index = 0;
        var prevTabId = 0;

        let handling = flikRule.handling;
        if (handling === "Auto") {
            handling = "Last tab";
        }

        if (handling === "Stack" || !windowId) {
            const window = await chrome.windows.create({
                tabId: tabId,
                left: slot.boundRect.left, top: slot.boundRect.top, width: slot.boundRect.width, height: slot.boundRect.height,
                state: "normal",
                focused: false,
            });
            windowId = window.id;
            slot.push(windowId);

            this.save(() => {
                if (callbackFunction) callbackFunction();
            })

            return;
        }

        switch (handling) {
            case "Replace": {
                const tabs = await chrome.tabs.query({ active: true, windowId: windowId });
                prevTabId = tabs[0].id;
                index = tabs[0].index;
                break;
            }
            case "First tab":
                index = 0;
                break;
            case "Last tab":
                index = -1;
                break;
        }

        moveTabIntoWindow(tabId, windowId, index, (windowId) => {
            if (prevTabId) {
                chrome.tabs.remove([prevTabId]);
            }

            this.save(() => {
                if (callbackFunction) callbackFunction();
            })
        });

        // move the tab into the window
        function moveTabIntoWindow(tabId, windowId, index, callbackFunction = 0) {
            try {
                chrome.tabs.move(tabId, { windowId: windowId, index: index }, () => {
                    chrome.tabs.update(tabId, { active: true }, () => {
                        if (callbackFunction) callbackFunction(windowId);
                    })
                });
            } catch (error) {
                if (error == 'Error: Tabs cannot be edited right now (user may be dragging a tab).') {
                    setTimeout(() => moveTabIntoWindow(tabId, windowId, index, callbackFunction), 50);
                } else {
                    console.error(error);
                }
            }
        }
    }

    // open the url at the position of slot using the flik option
    async appendFromUrl(url, flikRule) {
        let slotIndex = flikRule.slot - 1;
        if (slotIndex < 0) {
            slotIndex = 0;
        }
        if (slotIndex >= this.slotArray.length) {
            slotIndex = this.slotArray.length - 1;
        }

        const slot = this.slotArray[slotIndex];
        const windowId = slot.top();
        let tabId = 0;

        let handling = flikRule.handling;
        if (handling === "Auto") {
            handling = "Last tab";
        }

        if (handling === "Stack" || !windowId) {
            const window = await chrome.windows.create({
                state: "normal",
                focused: true,
                left: slot.boundRect.left, top: slot.boundRect.top, width: slot.boundRect.width, height: slot.boundRect.height,
            });

            const tabs = await chrome.tabs.query({ active: true, windowId: window.id });
            tabId = tabs[0].id;
            await utils.setBandInfo(tabId, flikRule);
            await chrome.tabs.update(tabId, { url: url, active: true });

            slot.push(window.id);
        } else {
            if (handling === "Replace") {
                const tabs = await chrome.tabs.query({ active: true, windowId: windowId });
                tabId = tabs[0].id;
                await utils.setBandInfo(tabId, flikRule);
                await chrome.tabs.update(tabId, { url: url, active: true });
            } else {
                const options = { url: url, windowId: windowId, active: true };
                if (handling === "First tab") {
                    options.index = 0;
                } else if (handling === "Last tab") { }

                const tab = await chrome.tabs.create(options);
                tabId = tab.id;
                await utils.setBandInfo(tabId, flikRule);
            }
        }

        await this.save();
    }

    // move the window into slotArray
    async appendFromWindow(windowId, flikRule, callbackFunction = 0) {
        let slotIndex = flikRule.slot - 1;
        if (slotIndex < 0) {
            slotIndex = 0;
        }
        if (slotIndex >= this.slotArray.length) {
            slotIndex = this.slotArray.length - 1;
        }

        let slot = this.slotArray[slotIndex];
        await chrome.windows.update(windowId, {
            state: "normal",
            // focused: true,
            left: slot.boundRect.left, top: slot.boundRect.top, width: slot.boundRect.width, height: slot.boundRect.height
        })
        slot.push(windowId);

        this.save(() => {
            if (callbackFunction) callbackFunction();
        })
    }

    // add new window with blank tab into the ith slot
    async appendNewWindow(slotIndex, callbackFunction = 0) {
        const slot = this.slotArray[slotIndex];
        const window = await chrome.windows.create({
            left: slot.boundRect.left, top: slot.boundRect.top, width: slot.boundRect.width, height: slot.boundRect.height,
            state: "normal",
            focused: true,
        });

        slot.push(window.id);
        await this.save();

        if (callbackFunction) callbackFunction(window.id);
    }

    // activate the ith slot.
    async activate(slotIndex, title, findOption, callbackFunction = 0) {
        const slot = this.slotArray[slotIndex];

        if (title === '') {
            await chrome.windows.update(slot.top(), { focused: true });
        } else {
            const wndCount = slot.windowsCount();

            // get active tab of the focused window.
            let tabs = await chrome.tabs.query({ windowId: slot.wndStack[wndCount - 1] });
            let iTab = 0;
            for (; iTab < tabs.length; iTab++){
                if (tabs[iTab].active) {
                    if (findOption === 'continue') iTab++;
                    break;
                }
            }

            for (let i = iTab; i < tabs.length; i++){
                if (await activateTab(tabs[i], title, callbackFunction)){
                    return;
                }
            }

            for (let iWnd = wndCount - 2; iWnd >= 0; iWnd--){
                const _tabs = await chrome.tabs.query({ windowId: slot.wndStack[iWnd] });
                for (const tab of _tabs) {
                    if (await activateTab(tab, title, callbackFunction)) {
                        return;
                    }
                }
            }

            for (let i = 0; i<iTab; i++){
                if (await activateTab(tabs[i], title, callbackFunction)) {
                    return;
                }
            }
        }

        if (callbackFunction) callbackFunction(0);

        async function activateTab(tab, title, callbackFunction) {
            if (tab.title.toLowerCase().includes(title) || tab.url.toLowerCase().includes(title)) {
                await chrome.tabs.update(tab.id, { active: true });
                if (callbackFunction) callbackFunction(tab.windowId);
                return true;
            }

            return false;
        }
    }

    // check if window is included in the slotarray and make it to top position.
    moveTop(windowId, callbackFunction = 0) {
        for (let i = 0; i < this.slotArray.length; i++){
            if (this.slotArray[i].moveTop(windowId)) {
                this.save(() => {
                    if (callbackFunction) callbackFunction(true);
                });
                return;
            }
        }

        if (callbackFunction) callbackFunction(false);
    }

    // remove the windowId from the slotarray
    remove(windowId, callbackFunction = 0) {
        for (let i = 0; i < this.slotArray.length; i++){
            if (this.slotArray[i].remove(windowId)) {
                this.save(() => {
                    if (callbackFunction) callbackFunction(true);
                });
                return;
            }
        }

        if (callbackFunction) callbackFunction(false);
    }

    // empty all slots
    empty() {
        for (let slot of this.slotArray) {
            slot.empty();
        }
    }

    // close ith slot
    close(slotIndex, callbackFunction = 0) {
        this.slotArray[slotIndex].close();
        this.save(() => {
            if (callbackFunction) callbackFunction();
        });
    }

    // close all slots in the monitor
    closeMonitor(monitorIdx, callbackFunction = 0) {
        this.slotArray.forEach((slot) => {
            if (slot.monitorIdx === monitorIdx) {
                slot.close();
            }
        })
        this.save(() => {
            if (callbackFunction) callbackFunction();
        });
    }

    // check if all slots is empty
    isEmpty() {
        return this.slotArray.some(slot => !slot.isEmpty());
    }

    // check if there is no slot in the monitor
    isEmptyMonitor(monitorIdx) {
        return this.slotArray.every(slot => slot.monitorIdx !== monitorIdx || slot.isEmpty());
    }

    // swap all windows of two slots
    swap(slotIndex1, slotIndex2, callbackFunction = 0) {
        let slot1 = this.slotArray[slotIndex1];
        let slot2 = this.slotArray[slotIndex2];

        slot1.wndStack.forEach(async (windowId) => {
            await chrome.windows.update(windowId, { state: "normal", left: slot2.boundRect.left, top: slot2.boundRect.top, width: slot2.boundRect.width, height: slot2.boundRect.height });
        })

        slot2.wndStack.forEach(async (windowId) => {
            await chrome.windows.update(windowId, { state: "normal", left: slot1.boundRect.left, top: slot1.boundRect.top, width: slot1.boundRect.width, height: slot1.boundRect.height });
        })

        let tmpStack = [...slot1.wndStack];
        slot1.wndStack = [...slot2.wndStack];
        slot2.wndStack = [...tmpStack];

        this.save(() => {
            if (callbackFunction) callbackFunction();
        });
    }

    // get most close slot
    analyzePosition(wndRect) {
        if (this.slotArray.length === 0) {
            return -1;
        }

        let slotIndex = -1;
        let distance = -1;
        this.slotArray.forEach((slot, idx) => {
            let diff_x = slot.boundRect.left + slot.boundRect.width / 2 - wndRect.left - wndRect.width / 2;
            let diff_y = slot.boundRect.top + slot.boundRect.height / 2 - wndRect.top - wndRect.height / 2;
            let diff = diff_x * diff_x + diff_y * diff_y;

            if (distance === -1 || diff < distance) {
                distance = diff;
                slotIndex = idx;
            }
        })

        return slotIndex;
    }

    // get slotIndex that contains window.
    getSlotIndex(windowId) {
        for (let i = 0; i < this.slotArray.length; i++){
            if (this.slotArray[i].isContain(windowId)) {
                return i;
            }
        }

        return -1;
    }

    // make information object of synced windows per slot.(1-inedex)
    getWindowSyncedInfo(){
        let info = {};
        this.slotArray.forEach((slot, index) => {
            if (slot.wndStack.length > 0) {
                info[index + 1] = slot.wndStack.length;
            }
        });

        return info;
    }
}

// calculate position of slot
function getSlotRect(displayRect, layoutName, idx_inLayout) {
    let display = {
        top: displayRect.top,
        left: displayRect.left,
        width: displayRect.width,
        height: displayRect.height,
        centerY: function() {
            return this.top + this.height / 2;
        },
        centerX: function() {
            return this.left + this.width / 2;
        },
        oneThreeY: function() {
            return this.top + this.height / 3;
        },
        oneThreeX: function() {
            return this.left + this.width / 3;
        },
        twoThreeY: function() {
            return this.top + this.height * 2 / 3;
        },
        twoThreeX: function() {
            return this.left + this.width * 2 / 3;
        },
        oneFourX: function() {
            return this.left + this.width / 4;
        },
        threeFourX: function() {
            return this.left + this.width * 3 / 4;
        },
        oneFiveX: function() {
            return this.left + this.width * 1 / 5;
        },
        twoFiveX: function() {
            return this.left + this.width * 2 / 5;
        },
        threeFiveX: function() {
            return this.left + this.width * 3 / 5;
        },
        fourFiveX: function() {
            return this.left + this.width * 4 / 5;
        }
    };

    var slotRect = { top: 0, left: 0, width: 0, height: 0 };
    switch (layoutName) {
        case "43tab_2slot":
            slotRect.height = display.height / 2;
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
                slotRect.width = display.width * 3 / 4;
                slotRect.height = display.height;
            } else if (idx_inLayout == 1) {
                slotRect.width = display.width / 4;
                slotRect.top = display.top;
                slotRect.left = display.threeFourX();
            } else if (idx_inLayout == 2) {
                slotRect.width = display.width / 4;
                slotRect.top = display.centerY();
                slotRect.left = display.threeFourX();
            }
            break;
        case "2slot_43tab":
            slotRect.height = display.height / 2;
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
                slotRect.width = display.width / 4;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
                slotRect.width = display.width / 4;
            } else if (idx_inLayout == 2) {
                slotRect.top = display.top;
                slotRect.left = display.oneFourX();
                slotRect.width = display.width * 3 / 4;
                slotRect.height = display.height;
            }
            break;
        case "43tab_1slot":
            slotRect.height = display.height;
            slotRect.top = display.top;
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
                slotRect.width = display.width * 3 / 4;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.threeFourX();
                slotRect.width = display.width / 4;
            }
            break;
        case "1slot_43tab":
            slotRect.height = display.height;
            slotRect.top = display.top;
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
                slotRect.width = display.width / 4;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.oneFourX();
                slotRect.width = display.width * 3 / 4;
            }
            break;
        case "53tab_2slot":
            slotRect.height = display.height / 2;
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
                slotRect.width = display.width * 3 / 5;
                slotRect.height = display.height;
            } else if (idx_inLayout == 1) {
                slotRect.width = display.width * 2 / 5;
                slotRect.top = display.top;
                slotRect.left = display.threeFiveX();
            } else if (idx_inLayout == 2) {
                slotRect.width = display.width * 2 / 5;
                slotRect.top = display.centerY();
                slotRect.left = display.threeFiveX();
            }
            break;
        case "2slot_53tab":
            slotRect.height = display.height / 2;
            if (idx_inLayout == 0) {
                slotRect.width = display.width * 2 / 5;
                slotRect.top = display.top;
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.width = display.width * 2 / 5;
                slotRect.top = display.centerY();
                slotRect.left = display.left;
            } else if (idx_inLayout == 2) {
                slotRect.top = display.top;
                slotRect.left = display.twoFiveX();
                slotRect.width = display.width * 3 / 5;
                slotRect.height = display.height;
            }
            break;
        case "53tab_1slot":
            slotRect.height = display.height;
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
                slotRect.width = display.width * 3 / 5;
            } else if (idx_inLayout == 1) {
                slotRect.width = display.width * 2 / 5;
                slotRect.top = display.top;
                slotRect.left = display.threeFiveX();
            }
            break;
        case "1slot_52tab":
            slotRect.height = display.height;
            if (idx_inLayout == 0) {
                slotRect.width = display.width * 2 / 5;
                slotRect.top = display.top;
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.top;
                slotRect.left = display.twoFiveX();
                slotRect.width = display.width * 3 / 5;
            }
            break;
        case "21tab_2tab":
            slotRect.width = display.width / 2;
            slotRect.height = display.height / 2;
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
                slotRect.width = display.width / 2;
                slotRect.height = display.height;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.top;
                slotRect.left = display.centerX();
            } else if (idx_inLayout == 2) {
                slotRect.top = display.centerY();
                slotRect.left = display.centerX();
            }
            break;
        case "twoByTwo":
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.top;
                slotRect.left = display.centerX();
            } else if (idx_inLayout == 2) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
            } else if (idx_inLayout == 3) {
                slotRect.top = display.centerY();
                slotRect.left = display.centerX();
            }
            slotRect.width = display.width / 2;
            slotRect.height = display.height / 2;
            break;
        case "twoByOne":
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.top;
                slotRect.left = display.centerX();
            }
            slotRect.width = display.width / 2;
            slotRect.height = display.height;
            break;
        case "oneByTwo":
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
            }
            slotRect.width = display.width;
            slotRect.height = display.height / 2;
            break;
        case "threeByThree": //3x3
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.top;
                slotRect.left = display.oneThreeX();
            } else if (idx_inLayout == 2) {
                slotRect.top = display.top;
                slotRect.left = display.twoThreeX();
            } else if (idx_inLayout == 3) {
                slotRect.top = display.oneThreeY();
                slotRect.left = display.left;
            } else if (idx_inLayout == 4) {
                slotRect.top = display.oneThreeY();
                slotRect.left = display.oneThreeX();
            } else if (idx_inLayout == 5) {
                slotRect.top = display.oneThreeY();
                slotRect.left = display.twoThreeX();
            } else if (idx_inLayout == 6) {
                slotRect.top = display.twoThreeY();
                slotRect.left = display.left;
            } else if (idx_inLayout == 7) {
                slotRect.top = display.twoThreeY();
                slotRect.left = display.oneThreeX();
            } else if (idx_inLayout == 8) {
                slotRect.top = display.twoThreeY();
                slotRect.left = display.twoThreeX();
            }
            slotRect.width = display.width / 3;
            slotRect.height = display.height / 3;
            break;
        case "twoByThree": //2x3
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.top;
                slotRect.left = display.centerX();
            } else if (idx_inLayout == 2) {
                slotRect.top = display.oneThreeY();
                slotRect.left = display.left;
            } else if (idx_inLayout == 3) {
                slotRect.top = display.oneThreeY();
                slotRect.left = display.centerX();
            } else if (idx_inLayout == 4) {
                slotRect.top = display.twoThreeY();
                slotRect.left = display.left;
            } else if (idx_inLayout == 5) {
                slotRect.top = display.twoThreeY();
                slotRect.left = display.centerX();
            }
            slotRect.width = display.width / 2;
            slotRect.height = display.height / 3;
            break;
        case "threeByTwo": //3x2
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.top;
                slotRect.left = display.oneThreeX();
            } else if (idx_inLayout == 2) {
                slotRect.top = display.top;
                slotRect.left = display.twoThreeX();
            } else if (idx_inLayout == 3) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
            } else if (idx_inLayout == 4) {
                slotRect.top = display.centerY();
                slotRect.left = display.oneThreeX();
            } else if (idx_inLayout == 5) {
                slotRect.top = display.centerY();
                slotRect.left = display.twoThreeX();
            }
            slotRect.width = display.width / 3;
            slotRect.height = display.height / 2;
            break;
        case "2tab-1tab":
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
                slotRect.width = display.width / 2;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.top;
                slotRect.left = display.centerX();
                slotRect.width = display.width / 2;
            } else if (idx_inLayout == 2) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
                slotRect.width = display.width;
            }
            slotRect.height = display.height / 2;
            break;
        case "1tab-2tab":
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
                slotRect.width = display.width;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
                slotRect.width = display.width / 2;
            } else if (idx_inLayout == 2) {
                slotRect.top = display.centerY();
                slotRect.left = display.centerX();
                slotRect.width = display.width / 2;
            }
            slotRect.height = display.height / 2;
            break;
        case "2tab_21tab":
            slotRect.width = display.width / 2;
            slotRect.height = display.height / 2;
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
            } else if (idx_inLayout == 2) {
                slotRect.top = display.top;
                slotRect.left = display.centerX();
                slotRect.height = display.height;
            }
            break;
        case "43tab_3slot":
            slotRect.width = display.width / 4;
            slotRect.height = display.height / 3;
            slotRect.left = display.threeFourX();
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
                slotRect.width = display.width * 3 / 4;
                slotRect.height = display.height;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.top;
            } else if (idx_inLayout == 2) {
                slotRect.top = display.oneThreeY();
            } else if (idx_inLayout == 3) {
                slotRect.top = display.twoThreeY();
            }
            break;
        case "53tab_3slot":
            slotRect.width = display.width * 2 / 5;
            slotRect.height = display.height / 3;
            slotRect.left = display.threeFiveX();
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
                slotRect.width = display.width * 3 / 5;
                slotRect.height = display.height;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.top;
            } else if (idx_inLayout == 2) {
                slotRect.top = display.oneThreeY();
            } else if (idx_inLayout == 3) {
                slotRect.top = display.twoThreeY();
            }
            break;
        case "21tab_3slot":
            slotRect.width = display.width / 2;
            slotRect.height = display.height / 3;
            slotRect.left = display.centerX();
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
                slotRect.height = display.height;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.top;
            } else if (idx_inLayout == 2) {
                slotRect.top = display.oneThreeY();
            } else if (idx_inLayout == 3) {
                slotRect.top = display.twoThreeY();
            }
            break;
        case "3slot_21tab":
            slotRect.width = display.width / 2;
            slotRect.height = display.height / 3;
            slotRect.left = display.left;
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.oneThreeY();
            } else if (idx_inLayout == 2) {
                slotRect.top = display.twoThreeY();
            } else if (idx_inLayout == 3) {
                slotRect.top = display.top;
                slotRect.left = display.centerX();
                slotRect.height = display.height;
            }
            break;
        case "3slot_53tab":
            slotRect.width = display.width * 2 / 3;
            slotRect.height = display.height / 3;
            slotRect.left = display.left;
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.oneThreeY();
            } else if (idx_inLayout == 2) {
                slotRect.top = display.twoThreeY();
            } else if (idx_inLayout == 3) {
                slotRect.top = display.top;
                slotRect.left = display.twoFiveX();
                slotRect.width = display.width * 3 / 5;
                slotRect.height = display.height;
            }
            break;
        case "3slot_43tab":
            slotRect.width = display.width / 4;
            slotRect.height = display.height / 3;
            slotRect.left = display.left;
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.oneThreeY();
            } else if (idx_inLayout == 2) {
                slotRect.top = display.twoThreeY();
            } else if (idx_inLayout == 3) {
                slotRect.top = display.top;
                slotRect.left = display.oneFourX();
                slotRect.width = display.width * 3 / 4;
                slotRect.height = display.height;
            }
            break;
        case "21tab_21slot":
            slotRect.width = display.width / 4;
            slotRect.height = display.height;
            slotRect.top = display.top;
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
                slotRect.width = display.width / 2;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.centerX();
            } else if (idx_inLayout == 2) {
                slotRect.left = display.threeFourX();
            }
            break;
        case "21slot_21tab":
            slotRect.width = display.width / 4;
            slotRect.height = display.height;
            slotRect.top = display.top;
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.oneFourX();
            } else if (idx_inLayout == 2) {
                slotRect.width = display.width / 2;
                slotRect.left = display.centerX();
            }
            break;
        case "21tab_22slot":
            slotRect.width = display.width / 4;
            slotRect.height = display.height / 2;
            if (idx_inLayout == 0) {
                slotRect.width = display.width / 2;
                slotRect.height = display.height;
                slotRect.left = display.left;
                slotRect.top = display.top;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.centerX();
                slotRect.top = display.top;
            } else if (idx_inLayout == 2) {
                slotRect.left = display.threeFourX();
                slotRect.top = display.top;
            } else if (idx_inLayout == 3) {
                slotRect.left = display.centerX();
                slotRect.top = display.centerY();
            } else if (idx_inLayout == 4) {
                slotRect.left = display.threeFourX();
                slotRect.top = display.centerY();
            }
        break;
        case "22slot_21tab":
            slotRect.width = display.width / 4;
            slotRect.height = display.height / 2;
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
                slotRect.top = display.top;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.oneFourX();
                slotRect.top = display.top;
            } else if (idx_inLayout == 2) {
                slotRect.left = display.left;
                slotRect.top = display.centerY();
            } else if (idx_inLayout == 3) {
                slotRect.left = display.oneFourX();
                slotRect.top = display.centerY();
            }else if(idx_inLayout == 4){
                slotRect.width = display.width / 2;
                slotRect.height = display.height;
                slotRect.left = display.centerX();
                slotRect.top = display.top;
            }
            break;
        case "threeByOne":
            slotRect.width = display.width / 3;
            slotRect.height = display.height;
            slotRect.top = display.top;
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.oneThreeX();
            } else if (idx_inLayout == 2) {
                slotRect.left = display.twoThreeX();
            }
            break;
        case "fourByOne":
            slotRect.width = display.width / 4;
            slotRect.height = display.height;
            slotRect.top = display.top;
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.oneFourX();
            } else if (idx_inLayout == 2) {
                slotRect.left = display.centerX();
            } else if (idx_inLayout == 3) {
                slotRect.left = display.threeFourX();
            }
            break;
        case "fourByTwo":
            slotRect.width = display.width / 4;
            slotRect.height = display.height / 2;
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.top;
                slotRect.left = display.oneFourX();
            } else if (idx_inLayout == 2) {
                slotRect.top = display.top;
                slotRect.left = display.centerX();
            } else if (idx_inLayout == 3) {
                slotRect.top = display.top;
                slotRect.left = display.threeFourX();
            } else if (idx_inLayout == 4) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
            } else if (idx_inLayout == 5) {
                slotRect.top = display.centerY();
                slotRect.left = display.oneFourX();
            } else if (idx_inLayout == 6) {
                slotRect.top = display.centerY();
                slotRect.left = display.centerX();
            } else if (idx_inLayout == 7) {
                slotRect.top = display.centerY();
                slotRect.left = display.threeFourX();
            }
            break;
        case "fiveByTwo":
            slotRect.width = display.width / 5;
            slotRect.height = display.height / 2;
            if (idx_inLayout == 0) {
                slotRect.top = display.top;
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.top = display.top;
                slotRect.left = display.oneFiveX();
            } else if (idx_inLayout == 2) {
                slotRect.top = display.top;
                slotRect.left = display.twoFiveX();
            } else if (idx_inLayout == 3) {
                slotRect.top = display.top;
                slotRect.left = display.threeFiveX();
            } else if (idx_inLayout == 4) {
                slotRect.top = display.top;
                slotRect.left = display.fourFiveX();
            } else if (idx_inLayout == 5) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
            } else if (idx_inLayout == 6) {
                slotRect.top = display.centerY();
                slotRect.left = display.oneFiveX();
            } else if (idx_inLayout == 7) {
                slotRect.top = display.centerY();
                slotRect.left = display.twoFiveX();
            } else if (idx_inLayout == 8) {
                slotRect.top = display.centerY();
                slotRect.left = display.threeFiveX();
            } else if (idx_inLayout == 9) {
                slotRect.top = display.centerY();
                slotRect.left = display.fourFiveX();
            }
            break;
        case "1tab-3slot":
            slotRect.width = display.width / 3;
            slotRect.height = display.height / 2;
            slotRect.top = display.centerY();
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
                slotRect.top = display.top;
                slotRect.width = display.width;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.left;
            } else if (idx_inLayout == 2) {
                slotRect.left = display.oneThreeX();
            } else if (idx_inLayout == 3) {
                slotRect.left = display.twoThreeX();
            }
            break;
        case "1tab-4slot":
            slotRect.width = display.width / 4;
            slotRect.height = display.height / 2;
            slotRect.top = display.centerY();
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
                slotRect.top = display.top;
                slotRect.width = display.width;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.left;
            } else if (idx_inLayout == 2) {
                slotRect.left = display.oneFourX();
            } else if (idx_inLayout == 3) {
                slotRect.left = display.centerX();
            } else if (idx_inLayout == 4) {
                slotRect.left = display.threeFourX();
            }
            break;
        case "1tab-5slot":
            slotRect.width = display.width / 5;
            slotRect.height = display.height / 2;
            slotRect.top = display.centerY();
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
                slotRect.top = display.top;
                slotRect.width = display.width;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.left;
            } else if (idx_inLayout == 2) {
                slotRect.left = display.oneFiveX();
            } else if (idx_inLayout == 3) {
                slotRect.left = display.twoFiveX();
            } else if (idx_inLayout == 4) {
                slotRect.left = display.threeFiveX();
            } else if (idx_inLayout == 5) {
                slotRect.left = display.fourFiveX();
            }
            break;
        case "3slot-1tab":
            slotRect.width = display.width / 3;
            slotRect.height = display.height / 2;
            slotRect.top = display.top;
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.oneThreeX();
            } else if (idx_inLayout == 2) {
                slotRect.left = display.twoThreeX();
            } else if (idx_inLayout == 3) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
                slotRect.width = display.width;
            }
            break;
        case "4slot-1tab":
            slotRect.width = display.width / 4;
            slotRect.height = display.height / 2;
            slotRect.top = display.top;
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.oneFourX();
            } else if (idx_inLayout == 2) {
                slotRect.left = display.centerX();
            } else if (idx_inLayout == 3) {
                slotRect.left = display.threeFourX();
            } else if (idx_inLayout == 4) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
                slotRect.width = display.width;
            }
            break;
        case "5slot-1tab":
            slotRect.width = display.width / 5;
            slotRect.height = display.height / 2;
            slotRect.top = display.top;
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.oneFiveX();
            } else if (idx_inLayout == 2) {
                slotRect.left = display.twoFiveX();
            } else if (idx_inLayout == 3) {
                slotRect.left = display.threeFiveX();
            } else if (idx_inLayout == 4) {
                slotRect.left = display.fourFiveX();
            } else if (idx_inLayout == 5) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
                slotRect.width = display.width;
            }
            break;
        case "2tab-3slot":
            slotRect.width = display.width / 3;
            slotRect.height = display.height / 2;
            slotRect.top = display.centerY();
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
                slotRect.top = display.top;
                slotRect.width = display.width / 2;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.centerX();
                slotRect.top = display.top;
                slotRect.width = display.width / 2;
            } else if (idx_inLayout == 2) {
                slotRect.left = display.left;
            } else if (idx_inLayout == 3) {
                slotRect.left = display.oneThreeX();
            } else if (idx_inLayout == 4) {
                slotRect.left = display.twoThreeX();
            }
            break;
        case "2tab-4slot":
            slotRect.width = display.width / 4;
            slotRect.height = display.height / 2;
            slotRect.top = display.centerY();
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
                slotRect.top = display.top;
                slotRect.width = display.width / 2;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.centerX();
                slotRect.top = display.top;
                slotRect.width = display.width / 2;
            } else if (idx_inLayout == 2) {
                slotRect.left = display.left;
            } else if (idx_inLayout == 3) {
                slotRect.left = display.oneFourX();
            } else if (idx_inLayout == 4) {
                slotRect.left = display.centerX();
            } else if (idx_inLayout == 5) {
                slotRect.left = display.threeFourX();
            }
            break;
        case "2tab-5slot":
            slotRect.width = display.width / 5;
            slotRect.height = display.height / 2;
            slotRect.top = display.centerY();
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
                slotRect.top = display.top;
                slotRect.width = display.width / 2;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.centerX();
                slotRect.top = display.top;
                slotRect.width = display.width / 2;
            } else if (idx_inLayout == 2) {
                slotRect.left = display.left;
            } else if (idx_inLayout == 3) {
                slotRect.left = display.oneFiveX();
            } else if (idx_inLayout == 4) {
                slotRect.left = display.twoFiveX();
            } else if (idx_inLayout == 5) {
                slotRect.left = display.threeFiveX();
            } else if (idx_inLayout == 6) {
                slotRect.left = display.fourFiveX();
            }
            break;
        case "3slot-2tab":
            slotRect.width = display.width / 3;
            slotRect.height = display.height / 2;
            slotRect.top = display.top;
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.oneThreeX();
            } else if (idx_inLayout == 2) {
                slotRect.left = display.twoThreeX();
            } else if (idx_inLayout == 3) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
                slotRect.width = display.width / 2;
            } else if (idx_inLayout == 4) {
                slotRect.top = display.centerY();
                slotRect.left = display.centerX();
                slotRect.width = display.width / 2;
            }
            break;
        case "4slot-2tab":
            slotRect.width = display.width / 4;
            slotRect.height = display.height / 2;
            slotRect.top = display.top;
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.oneFourX();
            } else if (idx_inLayout == 2) {
                slotRect.left = display.centerX();
            } else if (idx_inLayout == 3) {
                slotRect.left = display.threeFourX();
            } else if (idx_inLayout == 4) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
                slotRect.width = display.width / 2;
            } else if (idx_inLayout == 5) {
                slotRect.top = display.centerY();
                slotRect.left = display.centerX();
                slotRect.width = display.width / 2;
            }
            break;
        case "5slot-2tab":
            slotRect.width = display.width / 5;
            slotRect.height = display.height / 2;
            slotRect.top = display.top;
            if (idx_inLayout == 0) {
                slotRect.left = display.left;
            } else if (idx_inLayout == 1) {
                slotRect.left = display.oneFiveX();
            } else if (idx_inLayout == 2) {
                slotRect.left = display.twoFiveX();
            } else if (idx_inLayout == 3) {
                slotRect.left = display.threeFiveX();
            } else if (idx_inLayout == 4) {
                slotRect.left = display.fourFiveX();
            } else if (idx_inLayout == 5) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
                slotRect.width = display.width / 2;
            } else if (idx_inLayout == 5) {
                slotRect.top = display.centerY();
                slotRect.left = display.left;
                slotRect.width = display.width / 2;
            } else if (idx_inLayout == 6) {
                slotRect.top = display.centerY();
                slotRect.left = display.centerX();
                slotRect.width = display.width / 2;
            }
            break;
        default:
            slotRect.top = display.top;
            slotRect.left = display.left;
            slotRect.width = display.width;
            slotRect.height = display.height;
    }

    slotRect.top = parseInt(slotRect.top);
    slotRect.left = parseInt(slotRect.left);
    slotRect.width = parseInt(slotRect.width);
    slotRect.height = parseInt(slotRect.height);

    return slotRect;
}
