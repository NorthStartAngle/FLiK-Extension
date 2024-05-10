/**
 * written by Jin.  2022.12.14
 */
// module variables
var md_utils, md_profile, md_slot;

const url = new URL(window.location.href);
var flikedSlot;
var windowId = null; // current window Id
var slots;
var notifyDelay = 5;
var timerId = null;
var width, height;

/////////////////// Events //////////////////////////////////
const autoHideNotifyCheck = document.querySelector("#autoHideNotifyCheck");
autoHideNotifyCheck.addEventListener("change", event => {
    chrome.storage.local.set({
        autoHideNotify: event.target.checked
    });
});

//draw autoHide checkbox
function toggleAutoHideNotifyCheckBox(autoHideNotify){
    if(autoHideNotify){
        document.querySelector(".autoFadeCheckBox").style.display = "none";
    }else{
        document.querySelector(".autoFadeCheckBox").style.display = "block";
    }
}

// draw monitor layouts
function loadAndDrawSlots() {
    chrome.storage.local.get(["slotArray", "autoHideNotify", "notifyDuration"], async function ({ slotArray, autoHideNotify, notifyDuration }) {
        notifyDelay = notifyDuration || 5;
        var profile = new md_profile.Profile(await md_profile.Profile.load());
        slots = new md_slot.Slots(slotArray);

        // render preview
        let res = profile.drawLayout({}, { dottedFlag: 1 });
        const previewLayout = document.getElementById("popupLayoutPreview");
        previewLayout.innerHTML = res.strHtml;

        width = res.width + 40;
        height = res.height + 110;
        window.resizeTo(width, height);

        toggleAutoHideNotifyCheckBox(autoHideNotify);

        // delay for refresh layout(for notify embeded)
        setTimeout((t) => {
            updateSlots();
            autoHideNotifyCheck.checked = autoHideNotify;
        }, 500);

        // if autoHideNotifyFlag is set..
        if (autoHideNotify) {
            timerId = setTimeout(() => {
                window.close();
            }, notifyDelay * 1000)
        }
    });
}

// update slot state
function updateSlots() {
    const keys = Object.keys(flikedSlot);
    document.querySelectorAll(".slot-num").forEach((item) => {
        let slotIndex = parseInt(item.getAttribute("id").substring(5)) - 1;
        let isEmptySlot = slots.slotArray[slotIndex]?.isEmpty() || false;

        md_utils.refreshSlotState(item, !isEmptySlot);

        item.classList.remove("fliked");
        if (!isEmptySlot) {
            if (keys.includes((slotIndex + 1).toString())) {
                item.classList.add("fliked");
            }
        }
    });
}

// refresh all slots as normal
function reloadSlots() {
    md_slot.Slots.load().then((slotArray) => {
        slots = new md_slot.Slots(slotArray);
        updateSlots();
    })
}

///////////////// event handlers ///////////////////////////
window.addEventListener("resize", function() {
    window.resizeTo(width, height);
});

// update UI when storage is changed
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes["slotArray"] != undefined) {
        reloadSlots();
    }

    if (changes["autoHideNotify"] != undefined) {
        autoHideNotifyCheck.checked = changes["autoHideNotify"].newValue;
    }
});

// called when windows resized.
chrome.windows.onBoundsChanged.addListener(function (window) {
    if (window.state === "normal") {
        if (window.id == windowId) {
            chrome.storage.local.set({ notifyWndLeftPos: window.left, notifyWndTopPos: window.top });
        }
    }
    return true;
})

window.onload = async function() {
    try {
        md_profile = await import("./profile.js");
        md_slot = await import("./slot.js");
        md_utils = await import("./utils.js");
        flikedSlot = JSON.parse(url.searchParams.get("slot"));

        // set fliked info
        let totals = 0;
        for (let x in flikedSlot) {
            totals += flikedSlot[x];
        }
        $('#slot_infos').text(`${totals} FLiK${totals > 1 ? 's' : ''} synced.`);

        // set window id
        const baseUrl = chrome.runtime.getURL(`/html/notify.html`);
        const windows = await chrome.windows.getAll({ populate: true, windowTypes: ['popup'] });
        for (const window of windows) {
            if (window.tabs[0].url.startsWith(baseUrl)) {
                windowId = window.tabs[0].windowId
                break;
            }
        }

        // draw layout
        loadAndDrawSlots();
    } catch (error) {
        console.log(error);
    }
}