/**
 * written by Jin YC.  2022.11.07
 */

// module variables
var md_config, md_utils, md_profile, md_slot;

/////////// global variables ///////////////////////
const url = new URL(window.location.href);
const monitorIdx = parseInt(url.searchParams.get("monitorIdx"));
var profile, device, monitorInfo, myDeviceId = 0;
var width = $(window).width()+16, height = $(window).height()+39;

///////////// message handler ///////////////////
window.addEventListener("resize", function() {
    window.resizeTo(width, height);
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (changes["monitorConfigFlag"] != undefined && !changes["monitorConfigFlag"].newValue) {
        window.close();
    }

    if (changes["deviceArray"] != undefined) {
        reload();
    }
});

$(".Monitor-Config-CloseBtn").on("click", function (e) {
    window.close();
    md_utils.setMonitorConfigurationFlag(false);
});

// called when activateAll switch is changed
$("#activateAllSwitch").on("click", function (e){
    device.activateAllMonitors();

    profile.saveDeviceArray();
});

// called when use switch is changed
$("#useThisSwitch").change(event => {
    if (monitorInfo.isPrimary && !event.target.checked) {
        alert("You can not disable for primary monitor.");
        event.target.checked = true;
        return;
    }

    const _useThis = event.target.checked;
    device.setUseThis(monitorInfo.monitorIdx, _useThis);

    profile.saveDeviceArray();
});

// called when order changed
let orderNumSelector = document.querySelector("#monitorOrder");
orderNumSelector.addEventListener("change", event => {
    const _monitorOrder = event.target.selectedIndex + 1;
    device.setOrderNum(monitorInfo.monitorIdx, _monitorOrder);

    profile.saveDeviceArray();
});

$("#pencil").on("click", event => {
    if (monitorIDSelector.style.visibility == "hidden") {
        monitorIDSelector.style.visibility = "visible";
    } else {
        monitorIDSelector.style.visibility = "hidden";
    }
});

// called when ID changed
let monitorIDSelector = document.getElementById("monitorIDSelector");
monitorIDSelector.addEventListener("change", event => {
    const monitorId = event.target.selectedIndex + 1;
    device.setMonitorID(monitorInfo.monitorIdx, monitorId);

    profile.saveDeviceArray();
});

// release configurationing flag
$(window).unload( async function(){
    md_utils.setMonitorConfigurationFlag(false);
    return "Are you sure you want to close?";
});

/////////////// functions //////////////////////

// reload page
function reload() {
    md_profile.Profile.load().then((info) => {
        profile = new md_profile.Profile(info);
        device = profile.getDeviceById(myDeviceId);
        for (let i = 0; i < device.monitorInfoArray.length; i++){
            if (device.monitorInfoArray[i].monitorIdx === monitorIdx) {
                monitorInfo = device.monitorInfoArray[i];
                break;
            }
        }

        let monitorID = device.monitorIdxArray[monitorInfo.monitorIdx];
        $("#monitorID").html(monitorID);
        $("#useThisSwitch").prop('checked', monitorInfo.useThis[device.modeIndex]);
        $("#activateAllSwitch").prop('checked', false);

        if (!monitorInfo.isPrimary) {
            $(".PrimaryCaption").hide();
            $("#activateAllDiv").hide();
        }

        refershOrderSelector(monitorInfo.monitorOrder[device.modeIndex]);
        initMonitorIDSelector(monitorID);
    });
}

// initialize Order selector
function refershOrderSelector(order) {
    monitorOrder = order;
    while (orderNumSelector.length > 0) {
        orderNumSelector.remove(orderNumSelector.length - 1);
    }

    if (!monitorInfo.useThis) return;

    let orderStr = "";
    for (let i = 0; i < device.monitorInfoArray.length; i++) {
        orderStr = i + 1;
        switch (orderStr) {
            case (1):
                orderStr += "st";
                break;
            case (2):
                orderStr += "nd";
                break;
            case (3):
                orderStr += "rd";
                break;
            default:
                orderStr += "th";
                break;
        }
        let op = document.createElement("option");
        op.text = orderStr;
        orderNumSelector.add(op, i);
    }
    orderNumSelector.selectedIndex = monitorOrder - 1;
}

// initialize ID selector
function initMonitorIDSelector(mornitorID) {
    while (monitorIDSelector.length > 0) {
        monitorIDSelector.remove(monitorIDSelector.length - 1);
    }

    for (let i = 0; i < device.monitorInfoArray.length; i++) {
        let op = document.createElement("option");
        let used = false;
        device.monitorInfoArray.forEach((monitorInfo) => {
            if (device.monitorIdxArray[monitorInfo.monitorIdx] == i && monitorInfo.useThis) {
                used = true;
            }
        });

        op.text = i + 1;
        if (!used) op.style.backgroundColor = "#c7c5c2";
        monitorIDSelector.add(op, i);
    }

    monitorIDSelector.selectedIndex = mornitorID-1;
}

///////////////////// initialize ///////////////
window.onload = async function() {
    try {
        md_profile = await import("./profile.js");
        md_utils = await import("./utils.js");

        myDeviceId = await md_utils.loadMyDeviceId();

        reload();
    } catch (e) {
        console.log(e)
    }
}
