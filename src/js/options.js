/**
 * written by Jin YC.  2022.11.07
 */

// module variables
var md_config, md_utils, md_profile, md_slot;

var accountId;                  // logged status
var profile;                    // global object for profile
var slots;                      // global object for slots
var myDevice = null;            // use only for the change of mydevice
var myDeviceId = '';            // my device id ( stored in localstorage )
var editingDeviceId = null;     // current editing device id
var mainDeviceId = null;        // id of the main device for the monitor layout ( selected device in the device list )

////////////////////////// common ///////////////////////////////////
function createCombox(items) {
    let strHtml = '<select style="width:100%;">';
    items.forEach(function(item, index) {
        strHtml += '<option>' + item + '</option>';
    });
    strHtml += '</select>';
    return strHtml;
}

// when my device monitor layout is changed
async function myMonitorChangedHandler() {
    // reload and init slotArray
    myDevice = profile.getMyDevice();
    await md_slot.Slots.initialize(myDevice.getMonitorInfoArray());
}

////////////////////////// header items /////////////////////////////
// goto login
$("#goto_flik_login").click(async (e) => {
    await md_utils.setOfflineFlag(false);

    openSpalshPage();
})

function openSpalshPage() {
    const baseUrl = chrome.runtime.getURL("/html/splash.html");
    chrome.tabs.query({}, async function (tabs) {
        for (const tab of tabs) {
            if (tab.url.startsWith(baseUrl)) {
                await chrome.tabs.update(tab.id, { active: true, url: baseUrl });
                await chrome.windows.update(tab.windowId, { focused: true });
                window.close();
                return;
            }
        }

        chrome.tabs.create({ url: baseUrl });
        window.close();
    });
}

// enable
const enableSwitch = document.querySelector("#enableSwitch");
enableSwitch.addEventListener("change", event => {
    chrome.storage.local.set({
        isEnable: event.target.checked
    });
});

// login status
var syncTimerHandler = null;
async function updateLoginState() {
    const accountInfo = await md_utils.getAccountInfo();
    $(".disabled-button").removeClass("disabled-button");
    accountId = accountInfo.accountId
    if (!accountId) {
        $("#syncProfile").addClass("disabled-button");
        $("#clearServer").addClass("disabled-button");

        clearInterval(syncTimerHandler);
        syncTimerHandler = null;

        $("#filk_receive_option").prop("disabled", true);
        $("#devices_in_layout").prop("disabled", true);
        $("#device_list_input_wrapper").addClass("disabled");

        $("#notify_sync_time").hide();
        $("#loginWarningBar").show();
        $("#warningBar").show();
        $("#lockWarningBar").hide();
    } else {
        $("#currentAccount_name").text(`@${accountInfo.accountName}`);
        $("#mainDevice_name").text(`${myDevice.title}`);
        $("#filk_receive_option").prop("disabled", false);
        $("#devices_in_layout").prop("disabled", false);
        $("#device_list_input_wrapper").removeClass("disabled");

        // update synced at
        if(syncTimerHandler != null) {
            clearInterval(syncTimerHandler);
        }
        syncTimerHandler = setInterval(updateSyncedTime, 1000);

        // update pending time
        pendingTime = await md_utils.getPendingTime();
        if(pendingTime > 0) {
            startPendingTimeScheduler();
        }

        $("#notify_sync_time").show();
        $("#loginWarningBar").hide();
        $("#warningBar").hide();
        $("#lockWarningBar").hide();

        // set lock screen
        chrome.runtime.sendMessage({
            action: "updateLockState",
        }, function (response) {
            if(response) {
                lockScreen();
            }
        });
    }

    // update Tabs
    updateTabs();
}

// update last synced time
function updateSyncedTime() {
    const device = profile.getDeviceById(editingDeviceId);
    if(device && device.synced_at != null) {
        const dt = md_utils.getDiffSeconds(md_utils.getTime(new Date()), md_utils.getTime(device.synced_at));
        $('#synced_elapsed_time').text( md_utils.convertElapsedTime(dt));
    } else {
        $('#synced_elapsed_time').text(" - : - : - ");
    }
}

///////// lock screen //////////
var lockTimerHandler = null;
var lockStartTime = null;
async function lockScreen(lockFlag = true) {
    if(!md_utils) return;

    const locker = await md_utils.getEditLocker();
    const lockDevice = profile.getDeviceById(locker.editLocker);
    if (lockFlag && lockDevice) {
        $("#lockScreen").show();
        $("#warningBar").show();
        $("#lockWarningBar").show();
        $("#loginWarningBar").hide();

        $("#locker_device").text(`${lockDevice.title} : ${locker.editLockerNote}`);
    } else {
        $("#lockScreen").hide();
        $("#warningBar").hide();
        $("#lockWarningBar").hide();
        $("#loginWarningBar").show();
    }
}

function showLockElapsedTime() {
    const dt = md_utils.getDiffSeconds(md_utils.getTime(new Date()), md_utils.getTime(lockStartTime));
    $('#locked_Elapsed_time').text( md_utils.convertElapsedTime(dt));
}

/// pending time
var pendingTimerHandler = null;
var pendingTime = 0;
function showPendingTime() {
    if(pendingTime > 0) {
        $("#changePendingBar").show();
        $('#pending_time').text(`${pendingTime}s`);
        pendingTime--;
        md_utils.setPendingTime(pendingTime);
    } else {
        $("#changePendingBar").hide();
    }
}

function startPendingTimeScheduler() {
    if(pendingTimerHandler) {
        clearInterval(pendingTimerHandler);
        pendingTimerHandler = null;
    }

    pendingTimerHandler = setInterval(showPendingTime, 1000);
}

$("#manual_sync").click(async () => {
    $("#changePendingBar").hide();

    uploadDeviceChange("manual sync");
})

// update device list
function updateDeviceList() {
    const lstDeviceContent = document.getElementById("device_list_content");
    lstDeviceContent.innerHTML = "";
    let strContent ="";
    $('#device_list_input').val("");
    profile.deviceArray.forEach((device) => {
        strContent += `<div data-device-id="${device.deviceId}" class="custom-list-item"><label>${device.title}</label><span class="removeItem" title="delete device">&#10006;</span></div>`;
        if(device.deviceId === mainDeviceId) {
            $('#device_list_input').val(device.title);
        }
    })
    lstDeviceContent.innerHTML = strContent;

    lstDeviceContent.style.width = lstDeviceContent.parentNode.getBoundingClientRect().width + "px";
    lstDeviceContent.style.display = 'none';
}

// event handler device array is changed
function deviceArrayChangedHandler(deviceListChanged = true, mainDeviceChanged = false, activeDeviceChanged = false) {
    // updated device layout diagram
    drawDeviceLayout();

    // update device list
    if(deviceListChanged) {
        updateDeviceList();
    }

    // update mode list
    if(mainDeviceChanged) {
        updateModeList();
    }

    // update tabs
    if(activeDeviceChanged) {
        updateTabs();
    }
}

// event handlers for device view
$('#device_list_input').click((e) => {
    if ($('#device_list_content').is(":visible")) {
        $('#device_list_content').hide();
    } else {
        $('#device_list_content').css("display", "block").show();
        $('#device_list_input').focus();
    }
});

$('#device_list_content').on('mousedown','.custom-list-item', function(e) {
    if(e.target.className !== "removeItem") {
        var classList = e.currentTarget.className.split(/\s+/);
        if(classList.indexOf("selected") < 0) {
            $('#device_list_content').find('.selected').removeClass("selected");
            $(this).addClass('selected');
            $('#device_list_input').val($(this).children("label").text());
            $('#device_list_content').hide();

            // set main device as active
            mainDeviceId = $(this).attr('data-device-id');

            if( editingDeviceId !== mainDeviceId ||
                profile.getDeviceById(mainDeviceId).activeMode().devicesInLayout.find((d) => d.deviceId === editingDeviceId) == null) {
                editingDeviceId = mainDeviceId;

                closeMonitorConfigPopups();

                // update tabs
                updateTabs();
            }

            // updated device layout diagram
            drawDeviceLayout();

            // update active mode caption
            updateModeList();

            // if there are some editings, sync immediately
            uploadDeviceChange("switch device");
        }
    } else {
        const currentDeviceId = $(this).attr('data-device-id');
        if(profile.myDeviceId === currentDeviceId){
            alert("The selected device is your device! You can not remove it.");
            return;
        }

        if(confirm("You are trying to remove this device from your account permanently.\n Will you continue?")){
            const changedDeviceIds = profile.removeDevice(currentDeviceId);
            const mainDeviceChanged = (mainDeviceId === currentDeviceId);
            if(mainDeviceChanged) {
                mainDeviceId = profile.myDeviceId;
            }

            // the case when editing device is removed
            const activeDeviceChanged = (currentDeviceId === editingDeviceId);
            if(activeDeviceChanged) {
                editingDeviceId = profile.myDeviceId;
            }

            profile.saveDeviceArray(() => {
                chrome.runtime.sendMessage({
                    action: "removeDevice",
                    deviceId: currentDeviceId,
                    changedDeviceIds
                })
            });

            deviceArrayChangedHandler(true, mainDeviceChanged, activeDeviceChanged);
        }
    }
});

$('#device_list_input').blur(function(e){
    $('#device_list_content').hide();
});

// receiving devices
var receiverOptionDlg;          // form for flik receive rule
function initReceiverOptionDlg() {
    receiverOptionDlg = $("#receiver_option_form").dialog({
        title: "FLiK receive options",
        autoOpen: false,
        modal: true,
        closeOnEscape: true,
        open: function(event, ui) {
            $(".ui-widget-overlay").click(function(event) {
              $("#receiver_option_form").dialog("close");
            });
        },
        height: 500,
        width: 500,
        modal: true,
        buttons: {
            Cancel: function () {
                receiverOptionDlg.dialog("close");
            },
            OK: function () {
                if($("#option_rule_all_devices").is(':checked')) {
                    //Receive on all devices
                    chrome.storage.local.set({
                        receiveDevices: { mode: 1 }
                    });
                } else {
                    //Receive on specific devices
                    let opt=[];
                    $("#receiver_rule_devices_wrapper").find("input[type='checkbox']").each( function() {
                        if($(this).is(':checked')){
                            opt = [...opt, ...[$(this).parent().attr("deviceId")]];
                        }
                    });

                    chrome.storage.local.set({
                        receiveDevices: { mode: 0, devices: opt }
                    });
                }

                receiverOptionDlg.dialog("close");
            }
        }
    });
}

$("#filk_receive_option").on("click", async function (e) {
    // render receive option list of target popup
    let innerHTML = "";
    const { receiveDevices } = await chrome.storage.local.get(['receiveDevices']);
    const deviceArray = profile.deviceArray;
    const chkOptions = receiveDevices?.devices || [];

    if(!receiveDevices || receiveDevices.mode == 1) {
        $("#option_rule_all_devices").prop("checked", true);
        $("#option_rule_special_devices").prop("checked", false);
    } else if(receiveDevices.mode == 0) {
        $("#option_rule_all_devices").prop("checked", false);
        $("#option_rule_special_devices").prop("checked", true);
    }

    deviceArray.forEach((device, idx) => {
        const checkOpt = chkOptions.includes(device.deviceId) ? " checked" : "";
        innerHTML += `<label deviceId="${device.deviceId}" class="receive-option-device-listitem"><input type="checkbox" id="${idx}_deviceopt"${checkOpt}/>`
        innerHTML += `<div style="width:180px">${device.title}</div><div>${device.type}</div></label>`;
    })

    document.getElementById("receiver_rule_devices_wrapper").innerHTML = innerHTML;
    receiverOptionDlg.dialog("open");
});

// event handler of target options
$('input[type=radio][name=openDevice]').change(function() {
    let opt =this.value;

    $("#receiver_rule_devices_wrapper").find("input[type='checkbox']").each(function(){
        if (opt === "all") {
            $(this).prop('checked', true);
            $(this).prop('disabled', true);
        } else if (opt == "spec") {
            $(this).prop('checked', false);
            $(this).prop('disabled', false);
        }
    });
});

// mode
var modeOptionDlg;
function initModeOptionDlg() {
    modeOptionDlg = $("#mode_option_form").dialog({
        title: "Mode management",
        autoOpen: false,
        modal: true,
        height: 350,
        width: 500,
        modal: true,
        closeOnEscape: true,
        open: function(event, ui) {
            $(".ui-widget-overlay").click(function(event) {
              $("#mode_option_form").dialog("close");
            });
        },
        buttons: {
            New: function () {
                const device = profile.getDeviceById(mainDeviceId);
                const preferName = md_utils.getOrderName(device.modes.length);
                const newMode = prompt("Please enter mode name", preferName);
                if (newMode === '' || newMode === 'null' || !newMode) return;

                if(!profile.addMode(mainDeviceId, newMode)) {
                    alert("The name of mode already exists.");
                } else {
                    profile.save(() => {
                        // update mode list
                        updateModeList(newMode);

                        // draw mode preview
                        drawModePreview();

                        // update device layout
                        drawDeviceLayout();

                        // upload device change immediately
                        uploadDeviceChange("new mode", mainDeviceId);
                    })
                }
            },
            Rename: function () {
                const newMode = prompt("Please enter new name", "");
                if (newMode === '') return;

                const activeModeIndex = parseInt($("#mode_input").val());
                if(!profile.renameMode(mainDeviceId, activeModeIndex, newMode)) {
                    alert("The name of mode already exists.");
                } else {
                    profile.save(() => {
                        // update active mode name
                        updateActiveModeName();

                        // update mode list
                        updateModeList(newMode);

                        // upload device change immediately
                        uploadDeviceChange("rename mode", mainDeviceId);
                    })
                }
            },
            Delete: function () {
                if(!confirm("Are you sure to delete this mode?")) {
                    return;
                }

                const activeModeIndex = parseInt($("#mode_input").val());
                const devcie = profile.getDeviceById(mainDeviceId);
                if(devcie.modeIndex === activeModeIndex) {
                    alert("The mode is active. Please set another mode as active first.");
                    return;
                }

                if(profile.removeMode(mainDeviceId, activeModeIndex)) {
                    profile.save(() => {
                        // update mode list
                        updateModeList(devcie.activeMode().name);

                        // upload device change immediately
                        uploadDeviceChange("delete mode", mainDeviceId);
                    })
                }
            },
        }
    });
}

function updateActiveModeName() {
    $("#mode_list_input").val(profile.getDeviceById(mainDeviceId).activeMode().name);
}

// re-construct mode dropdown
function updateModeList(modeName = null, onlyCombo = false) {
    const device = profile.getDeviceById(mainDeviceId);
    if(!device) return;
    if(!modeName) {
        modeName = device.activeMode().name;
    }

    // update mode combo of poup
    let strElems = "";
    device.modes.forEach((mode, idx) => {
        strElems += `<option value=${idx}${mode.name === modeName? " selected": ""}>${mode.name}</option>`;
    });

    $('#mode_input').find('option').remove().end().append(strElems);

    if(onlyCombo) return;

    // update mode dropdown of header bar
    const listModeContent = document.getElementById("mode_list_content");
    listModeContent.innerHTML = "";
    let strContent = "";
    const activeMonitorCount = device.activeMode().monitorIds.length;
    device.modes.forEach((mode, idx) => {
        const strDisabled = mode.monitorIds.length !== activeMonitorCount ? ' disabled' : ''
        strContent += `<div mode-index="${idx}" class="custom-list-item${strDisabled}"><label>${mode.name}</label></div>`;
        if(mode.name === modeName) {
            $('#mode_list_input').val(mode.name);
        }
    })

    listModeContent.innerHTML = strContent;
    listModeContent.style.width = listModeContent.parentNode.getBoundingClientRect().width + "px";
    listModeContent.style.display = 'none';
}

// event handlers for mode dropdown
$('#mode_list_input').click((e) => {
    if ($('#mode_list_content').is(":visible")) {
        $('#mode_list_content').hide();
    } else {
        $('#mode_list_content').css("display", "block").show();
        $('#mode_list_input').focus();
    }
});

$('#mode_list_content').on('mousedown','.custom-list-item', function(e) {
    var classList = e.currentTarget.className.split(/\s+/);
    if(classList.indexOf("selected") < 0) {
        $('#mode_list_content').find('.selected').removeClass("selected");
        $(this).addClass('selected');
        $('#mode_list_input').val($(this).children("label").text());
        $('#mode_list_content').hide();

        // switch mode
        const index = parseInt($(this).attr('mode-index'));
        const device = profile.getDeviceById(mainDeviceId);

        // check mode is avaiable
        if(device.modes[index].monitorIds.length !== device.activeMode().monitorIds.length) {
            alert("The mode is not available for the current device configuration.");
            return;
        }

        if (profile.switchMode(mainDeviceId, index)) {
            profile.saveDeviceArray(() => {
                // upload device change immediately
                uploadDeviceChange("switch mode");

                // update active mode
                modeChangedHandler();
            })
        }
    }
});

$('#mode_list_input').blur(function(e){
    $('#mode_list_content').hide();
});

// var activeModeIndex = 0;
$("#edit_mode").click((e) => {
    // set active mode of mode list
    updateModeList($("#mode_list_input").val(), true);

    // draw mode preview
    drawModePreview();

    modeOptionDlg.dialog("open");
})

$('#mode_input').on('change', function(e) {
    // draw mode preview
    drawModePreview();
});

function drawModePreview() {
    // get active device and mode
    const device = profile.getDeviceById(mainDeviceId);

    const res = device.drawDevice(
        { caller: "option", modeIndex: parseInt($("#mode_input").val()) },
        { dottedFlag: 0, showCloseFlag: 0 },
    );

    // set device html to preview pane
    const layoutDeviceDiv = document.createElement("div");
    layoutDeviceDiv.classList.add(`layout-mode`);
    layoutDeviceDiv.innerHTML = res.strHtml;
    $(layoutDeviceDiv).width(res.width + 5);

    $("#mode_preview_pane").empty().append(layoutDeviceDiv);

    // set dialog's width and height
    modeOptionDlg.dialog("option", "width", Math.max(500, res.width + 30));
    modeOptionDlg.dialog("option", "height",  Math.max(300, res.height + 220));
}

// hander on change mode
function modeChangedHandler() {
    closeMonitorConfigPopups();

    // updated device layout diagram
    drawDeviceLayout();

    // update tabs
    updateTabs();

    // my monitor is changed
    myMonitorChangedHandler();
}

// devices in layout
var layoutDeviceSelectDlg;      // form for layout view setting
function initLayoutDeviceSelectDlg() {
    layoutDeviceSelectDlg = $("#devices_in_layout_form").dialog({
        title: "Devices in layout",
        autoOpen: false,
        modal: true,
        height: 420,
        width: 340,
        modal: true,
        closeOnEscape: true,
        open: function(event, ui) {
            $(".ui-widget-overlay").click(function(event) {
              $("#devices_in_layout_form").dialog("close");
              drawDeviceLayout();
            });
        },
        buttons: {
            Cancel: function () {
                layoutDeviceSelectDlg.dialog("close");
                drawDeviceLayout();
            },

            Ok: function () {
                const mainDevice = profile.getDeviceById(mainDeviceId);
                const mode = mainDevice.activeMode();

                layoutDeviceSelectDlg.dialog("close");

                // if any changed save
                if(JSON.stringify(devicesInLayout) != JSON.stringify(mode.devicesInLayout)) {
                    mode.devicesInLayout = [...devicesInLayout];
                    profile.saveDeviceArray(() => {
                        drawDeviceLayout();

                        uploadLayoutChange();
                    });
                }
            }
        }
    });
}

var devicesInLayout = [];
$("#devices_in_layout").on("click", async function () {
    const makeItemElement = (device, checked, order = 0) => {
        return `<div class="device-item-in-layout"><label>${device.title}</label><label>${order>0 ? order : ''}</label>` +
            `<input type="checkbox" device-id=${device.deviceId}${checked ? ' checked' : ''}` +
            `${order==1 ? ' disabled' : ''}></div>`
    }

    // render receiving device list of receiving device popup
    const mainDevice = profile.getDeviceById(mainDeviceId);
    devicesInLayout = [...mainDevice.activeMode().devicesInLayout];
    let strHtml = "";
    strHtml += makeItemElement(mainDevice, true, 1);

    devicesInLayout.forEach((deviceLayoutInfo, idx) => {
        const device = profile.getDeviceById(deviceLayoutInfo.deviceId);
        if(device) {
            strHtml += makeItemElement(device, true, idx+2);
        } else {
            devicesInLayout.splice(idx, 1);
        }
    })

    profile.deviceArray.forEach((device) => {
        if(device.deviceId !== mainDeviceId && !devicesInLayout.some(deviceInfo => deviceInfo.deviceId === device.deviceId)) {
            strHtml += makeItemElement(device, false);
        }
    });

    $("#devices_in_layout_form #device_list_for_layout").html(strHtml);

    $(".device-item-in-layout input").click(function(e) {
        // get item is checked
        const deviceId = e.target.getAttribute("device-id");
        const isChecked = e.target.checked;

        // add / remove device each time user click check
        if(!isChecked) {
            const element = document.querySelector(`[device_id="${deviceId}"]`);
            if(element) {
                devicePreveewGrid.removeWidget(element.parentNode.parentNode);
            }

            devicesInLayout = devicesInLayout.filter(deviceInfo => deviceInfo.deviceId !== deviceId);
        } else {
            const res = profile.getDeviceById(deviceId).drawDevice(
                { caller: "option", isMyDevice: myDeviceId === deviceId },
                { dottedFlag: 0, showCloseFlag: 0, showSlotNum: 0 },
                // profile.getDeviceFirstSlotNumber(mainDeviceId, deviceId)
            );

            // add device html div to grid
            const layoutDeviceDiv = document.createElement("div");
            layoutDeviceDiv.classList.add(`layout-device`);
            layoutDeviceDiv.setAttribute("device_id", `${deviceId}`);
            layoutDeviceDiv.innerHTML = res.strHtml;
            $(layoutDeviceDiv).width(res.width + 5);

            const gridWrapper = document.createElement('div');
            gridWrapper.appendChild(layoutDeviceDiv);

            // decide the place of new item
            const width = Math.ceil(res.width / defGridCellWidth);
            const height = Math.ceil(res.height / defGridCellHeight);

            let left = mainDevice.left + 1, top = mainDevice.top;
            while (!devicePreveewGrid.isAreaEmpty(left, top, width, height)) {
                left++;
                if (left >= devicePreveewGrid.getColumn()) {
                    left = 0;
                    top++;
                }
            }
            const newGridItem = { x: left, y: top, w: width, h: height, content: gridWrapper.innerHTML }
            devicePreveewGrid.addWidget(newGridItem);

            devicesInLayout.push({ deviceId, left, top });
        }

        // update label
        profile.deviceArray.forEach(device => {
            if(device.deviceId !== mainDeviceId) {
                const idx = devicesInLayout.findIndex(deviceInfo => deviceInfo.deviceId === device.deviceId);
                const title = `${idx>-1 ? idx+2 : ''}`;
                $(".device-item-in-layout").find(`input[device-id=${device.deviceId}]`).prev().text(title);
            }
        })

        $("#device_in_layout_description").hide();
    })

    $("#device_in_layout_description").show();
    layoutDeviceSelectDlg.dialog("open");
})

// upload layout change to server
function uploadLayoutChange() {
    chrome.runtime.sendMessage({
        action: "profileChanged",
        note: "layout Changed",
    })
}

// upload device change to server
async function uploadDeviceChange(note = "", deviceId = null) {
    await chrome.runtime.sendMessage({
        action: "syncNow",
        note,
    });
}

// monitor ordering
function createMonitorOrderingOption(ordering) {
    let strHtml = '<select style="width:100%;">';
    md_config.DATA_Z.activeOrderOptions.forEach((item) => {
        strHtml += `<option${item==ordering ? ' selected': ''}>${item}</option>`;
    });
    strHtml += '</select>';

    $("#monitor_ordering").html(strHtml);
    $("#default_monitor_ordering").html(strHtml);
}

$('#monitor_ordering').on('change', function(e) {
    const ordering = $("#monitor_ordering").val();
    const device = profile.getDeviceById(editingDeviceId);
    device.autoOrderMonitors(ordering);
    profile.saveDeviceArray(() => {
        monitorChangedHandler();

        // show animation of order
        animateDrawing(editingDeviceId);
    });
});

// show order animation
function animateDrawing(deviceId) {
    const divDevice = document.querySelector(`#optionLayoutPreview div[device_id="${deviceId}"]`);
    if(divDevice) {
        const divMonitors = divDevice.querySelectorAll(".layout-monitor");
        divMonitors.forEach((divMonitor) => {
            $(divMonitor).hide();
        })

        // show divMonitors with 100ms interval
        let i = 0;
        const interval = setInterval(() => {
            $(divMonitors[i]).show();
            i++;
            if(i === divMonitors.length) {
                clearInterval(interval);
            }
        }, 100);
    }
}

////////////////////////// device layout ////////////////////////////
// draw Monitor Layout
function drawDeviceLayout() {
    const res = profile.drawLayout({ caller: "option" }, { dottedFlag: 0, showCloseFlag: 0 }, mainDeviceId, "array");
    let previewLayout = document.getElementById("optionLayoutPreview");
    previewLayout.innerHTML = "";

    devicePreveewGrid.removeAll();
    res.htmlInfoArray.forEach((info, idx) => {
        const device = profile.getDeviceById(info.deviceId);
        const layoutDeviceDiv = document.createElement("div");
        layoutDeviceDiv.classList.add(`layout-device`);

        // set my device
        if (info.deviceId === myDeviceId) {
            layoutDeviceDiv.classList.add(`my-device`);

            if (!editingDeviceId) {
                editingDeviceId = info.deviceId;
            }
        }

        // set main device
        if (info.deviceId === mainDeviceId) {
            layoutDeviceDiv.classList.add(`main-device`);
        }

        // set editing device
        if (info.deviceId === editingDeviceId) {
            layoutDeviceDiv.classList.add(`active-device`);
            $("#currentDevice_caption").text(`Layout : ${device.title}`);
        }

        layoutDeviceDiv.setAttribute("device_id", `${info.deviceId}`);
        layoutDeviceDiv.innerHTML = info.deviceHtml;

        const innerWrapper = layoutDeviceDiv.getElementsByClassName("device-inner-wrapper")[0];
        info.htmlArray.forEach(monitorHtml => {
            innerWrapper.insertAdjacentHTML('beforeend', monitorHtml);
        });

        $(layoutDeviceDiv).width(info.width + 5);

        // add device html div to grid
        const gridWrapper = document.createElement('div');
        gridWrapper.appendChild(layoutDeviceDiv);
        const newGridItem = {
            x: info.left,
            y: info.top,
            w: Math.ceil(info.width / defGridCellWidth),
            h: Math.ceil(info.height / defGridCellHeight),
            content: gridWrapper.innerHTML
        }

        devicePreveewGrid.addWidget(newGridItem);
    })

    // set event handlers
    setLayoutPreviewEventHandler();

    // draw the rule count per slot
    md_utils.drawWndCountsInSlot("optionLayoutPreview", profile.getRuleSyncedInfo(mainDeviceId));

    function setLayoutPreviewEventHandler() {
        // event handler to select device
        $(previewLayout).find(".grid-stack-item-content .layout-device").on("click", function(){
            changeActiveDevice($(this)[0]);
        });

        // event handler to set device property
        $(previewLayout).find(".grid-stack-item-content .layout-device").on("dblclick", function () {
            changeActiveDevice($(this)[0]);

            openDeviceOptionDlg(editingDeviceId);
        });

        // set handler for the hover event of slots.
        $("#optionLayoutPreview .slot-num").on('mouseenter', function (e) {
            const curTabId = document.querySelector(".tab-button.active").getAttribute("id");
            if (curTabId === 'FLiKs_tab') {
                const slotNum = e.target.getAttribute('id')?.substring(5) || 0;
                const trs = $("#fliksDataTable tr");
                for (let i = 0; i < trs.length; i++){
                    if (slotNum == $(trs[i]).children(':nth-child(3)').text()) {
                        $(trs[i]).addClass('hovered-row');
                    }
                }
            }
        });

        $("#optionLayoutPreview .slot-num").on('mouseout', function (e) {
            $("#fliksDataTable .hovered-row").removeClass('hovered-row');
        });

        // set context menu
        $("#optionLayoutPreview .slot-num").on("contextmenu", (e) => {
            e.preventDefault();
            $(".shareBtn").remove();
            const slotNum = e.target.getAttribute('id')?.substring(5) || 0;

            let shareBtnDiv = document.createElement("div");
            $(shareBtnDiv).addClass("shareBtn");
            $(shareBtnDiv).attr("slotNum", slotNum);
            $(shareBtnDiv).html("share");
            $(shareBtnDiv).css({ left: e.clientX, top: e.clientY});
            $("body").append(shareBtnDiv);

            $(shareBtnDiv).on("click", (e) => {
                let slotNum = e.target.getAttribute("slotnum")
                $("#Targets_tab").click();
                $(".shareBtn").remove();

                addTarget(slotNum);
            })
        })

        var isInButton = false, isInSlot = true;
        $(document).on('mouseenter', '.shareBtn', () => { isInButton = true; })
        $(document).on('mouseout', '.shareBtn', () => {
            isInButton = false;
            setTimeout(() => {
                if (!isInSlot) {
                    $(".shareBtn").remove();
                }
            }, 10)
        })

        $(".slot-num").on('mouseenter', () => { isInSlot = true; })
        $(".slot-num").on("mouseout", () => {
            isInSlot = false;
            setTimeout(() => {
                if (!isInButton) {
                    $(".shareBtn").remove();
                }
            }, 10)
        })

        // switch active device
        function changeActiveDevice(newActiveDiv) {
            $("#optionLayoutPreview .active-device").removeClass("active-device");
            newActiveDiv.classList.add("active-device");
            editingDeviceId = newActiveDiv.getAttribute("device_id");

            // update tabs
            updateTabs();
        }
    }
}

const defGridCellWidth = 125, defGridCellHeight = 110;
const devicePreveewGrid = GridStack.init({
    float: true,
    margin: 5,
    sizeToContent: true,
    acceptWidgets: true,
    disableResize: true,
    minRow: 1,                  // don't collapse when empty
    disableOneColumnMode: true, // prevent auto column
    cellHeight: 110,            // fixed as default 'auto'
});

// event when the monitor layout is changed
devicePreveewGrid.on('change', async function(e, items) {
    if (!items) return;

    let device = profile.getDeviceById(mainDeviceId);
    items.forEach(widget => {
        const match = widget.content.match(/device_id="([^"]+)"/);
        if (match) {
            const mathcedId = match[1];
            if (mathcedId === mainDeviceId) {
                device.left = widget.x;
                device.top = widget.y;
            } else {
                const item = device.activeMode().devicesInLayout.find(info => info.deviceId == mathcedId);
                if (item) {
                    item.left = widget.x;
                    item.top = widget.y;
                }
            }
        }
    });

    // save local stroage
    profile.saveDeviceArray(() => {
        uploadLayoutChange();
    });
})

// open device option dialog
var deviceOptionDlg;            // form for device view option
function initDeviceOptionDlg() {
    let strTypes = '';
    md_config.DATA_Z.deviceTypes.forEach((type) => {
        strTypes += `<option value="${type}">${type}</option>`
    })
    $('#optDeviceType').find('option').remove().end().append(strTypes);
    deviceOptionDlg = $("#device_option_form").dialog({
        title: "FLiK Device options",
        autoOpen: false,
        modal: true,
        height: 340,
        width: 340,
        modal: true,
        closeOnEscape: true,
        open: function(event, ui) {
            $(".ui-widget-overlay").click(function(event) {
                $("#device_option_form").dialog("close");
            });
        },
        beforeClose: function(event, ui) {
            const device = profile.getDeviceById(editingDeviceId);
            if(device.title === "" && $('#optDeviceTitle').val() === "") {
                $('#optDeviceTitle').focus();
                return false;
            };

            return true;
        },
        buttons: {
            Cancel: function () {
                deviceOptionDlg.dialog("close");
            },

            Ok: function () {
                if($('#optDeviceTitle').val() === ""){
                    $('#optDeviceTitle').focus();
                    return;
                }

                const device = profile.getDeviceById(editingDeviceId);
                device.title = $('#optDeviceTitle').val();
                device.border = $('#optDeviceBorder').val();
                device.color = $('#optDeviceColorPicker').val();
                device.type = $('#optDeviceType').val();
                profile.saveDeviceArray(() => {
                    deviceArrayChangedHandler();
                    uploadLayoutChange()
                });

                deviceOptionDlg.dialog("close");
            }
        }
    });
}

function openDeviceOptionDlg(deviceId) {
    const device = profile.getDeviceById(deviceId);
    $("#optDeviceTitle").val(device.title);
    $("#optDeviceBorder").val(device.border);
    $("#optDeviceColorPicker").spectrum("set", device.color);
    $('#optDeviceType').val(device.type);
    deviceOptionDlg.dialog("open");
}

////////////////////////// monitor tab  /////////////////////////////
// draw Monitor Table
function updateLayoutTab() {
    // set status of setup monitor button
    $("#setupMonitorBtn").prop('disabled', editingDeviceId !== myDeviceId);

    const device = profile.getDeviceById(editingDeviceId);
    drawMonitorConfigTable(device);

    setTimeout( () => {
        $(document).on('click', `.selectOption`, async function(e) {
            const device = profile.getDeviceById(editingDeviceId);
            const selectedOption = $(`#${$(this).closest(`.selectOptions`).attr(`select-options-for`)}`);
            if ($(this).data(`value`) !== selectedOption.find(`.currentSelectedOption`).data(`value`)) {
                const monitorIdx = parseInt(selectedOption.attr('id').split('_')[1]);
                const layoutId = parseInt($(this).attr(`layoutId`));
                device.setLayoutId(layoutId, monitorIdx);

                profile.saveDeviceArray(() => {
                    const layoutIds = device.monitorInfoArray[monitorIdx].layoutId;
                    layoutIds[device.modeIndex] = layoutId;

                    monitorChangedHandler();
                    removeFloatLayoutDiv();
                });
            }

            selectedOption.html($(this).prop(`outerHTML`)).find(`.selectOption`).removeClass(`selectOption`).addClass(`currentSelectedOption`);
            $(this).closest(`.selectOptions`).hide();
        });
    }, 500);
}

// called when monitor layout is changed
async function monitorChangedHandler() {
    // updated device layout diagram
    drawDeviceLayout();

    // update tabs
    updateTabs();

    // upload layout change
    uploadLayoutChange();

    // check myDevice's monitor is changed
    if(editingDeviceId === mainDeviceId) {
        myMonitorChangedHandler();
    }
}

// draw the monitor configuration
function drawMonitorConfigTable(device) {
    document.getElementById('monitorsTBody').innerHTML = "";
    let usedMonitors = 0;
    const monitorInfoArray = device.getMonitorInfoArray();

    // get first slot nunber
    let startSlot = profile.getDeviceFirstSlotNumber(mainDeviceId, device.deviceId);

    monitorInfoArray.forEach((monitorInfo, index) => {
        if (monitorInfo.useThis && monitorInfo.monitorOrder !== 1000) {
            let trElem = document.createElement("tr");
            trElem.setAttribute("monitorIdx", monitorInfo.monitorIdx);
            let html = '';

            // monitor order and ID
            let monitorString = monitorInfo.monitorOrder;
            switch (monitorInfo.monitorOrder) {
                case (1):
                    monitorString += "st";
                    break;
                case (2):
                    monitorString += "nd";
                    break;
                case (3):
                    monitorString += "rd";
                    break;
                default:
                    monitorString += "th";
                    break;
            }

            html += `<td class="monitorOrders">`;
            html += `<div class="monitorOrder-div">${monitorString}</div>`;
            html += `<div class="primary-div"${monitorInfo.isPrimary ? '' : ' style="display:none"'}>primary</div>`;
            html += `<div class="displayID-div">${device.monitorIdxArray[monitorInfo.monitorIdx]}</div>`;
            html += `</div></td>`;

            //layouts select
            html += `<td class='layoutsCol'>`;
            html += drawLayoutListOption(device, monitorInfo, monitorInfoArray, monitorInfo.monitorIdx);

            // draw layouts
            html += `<div class="monitor-layout-preview-wrapper" style="left:518px">`;
            html += device.draw_ith_Monitor(monitorInfo, {}, startSlot);
            html += `</td>`;
            trElem.innerHTML = html;
            let configTableBody = document.getElementById("monitorsTBody");
            configTableBody.append(trElem);

            trElem.addEventListener("mouseover", function(e) {
                this.style.backgroundColor = "skyblue";
                let previewMonitor_Id = "previewMonitor" + this.getAttribute("monitorIdx");
                $(".active-device #" + previewMonitor_Id).addClass('selected');
            });

            trElem.addEventListener("mouseout", function(e) {
                this.style.backgroundColor = "#0000";
                $(".layout-monitor.selected").removeClass('selected');
            });

            usedMonitors++;

            // increase slot number
            startSlot += Number(md_utils.getSlotCount(monitorInfo.layoutId));
        }
    })

    // make a div for drawing floating layout
    let floatDiv = document.querySelector('.layout-float');
    if (floatDiv == undefined) {
        floatDiv = document.createElement('div');
        floatDiv.classList.add("layout-float");
        floatDiv.style.position='absolute';
        document.querySelector("body").append(floatDiv);
    }
    floatDiv.style.top = usedMonitors * -70 - 120 + 'px';
    floatDiv.style.display = 'none';

    // draw layout select option's list
    function drawLayoutListOption(device, monitorInfo, monitorInfoArray, selectedMonitorIdx) {
        let html = `<div class='layoutsSelect'>`;

        // draw the selected layout
        html += `<div id="layoutSel_${selectedMonitorIdx}" class="selectedOption select-css" style="width: 505px; display: block;">`;
        html += drawLayoutSelector(monitorInfo.layoutId , ``)
        html += `</div>`;

        // draw the all layouts ( when user click a monitor the all layouts are spreaded )
        html += `<div select-options-for="layoutSel_${selectedMonitorIdx}" class="selectOptions select-css" style="position: absolute; z-index: 1000; background-image: none; display: none; top:55px; width:505px; height:520px; overflow:auto;    padding-top: 5px;">`;
        for (idxLayout in md_utils.Layouts) {
            html += drawLayoutSelector(idxLayout)
        }
        html += `</div></div>`;

        return html;

        function drawLayoutSelector(_layoutId, selectClass = `class="selectOption"`){
            let linkedMonitors = '';
            monitorInfoArray.forEach((monitorInfo) => {
                if (monitorInfo.useThis && md_utils.Layouts[monitorInfo.layoutId].name == md_utils.Layouts[_layoutId].name) {
                    linkedMonitors += device.monitorIdxArray[monitorInfo.monitorIdx] + ",";
                }
            })
            if (linkedMonitors.length > 0) {
                linkedMonitors = linkedMonitors.substr(0, linkedMonitors.length - 1);
            }

            strHtml = `<div ${selectClass} data-value='${md_utils.Layouts[_layoutId].name}' slotcount='${md_utils._layouts[md_utils.Layouts[_layoutId].idx].slotcount}' layoutId='${_layoutId}' style="float:left; width:446px;">
                        <span style="float:left;padding-top: 7px; width:220px;">${md_utils.Layouts[_layoutId].text}</span>
                        <span style="float:left; width:80px; height:38px;"><div class="layout-grid layout-icon">`;

            md_utils._layouts[md_utils.Layouts[_layoutId].idx].class.forEach(layoutCls => {
                const res = md_utils.insertDivSection(layoutCls, '');
                strHtml += res.html;
            });

            strHtml += `</div></span><span style="float:left; width:120px; text-align:center;padding-top: 6px;">${linkedMonitors}</span></div>`;
            return strHtml;
        }
    }
}

// remove float layout
function removeFloatLayoutDiv() {
    let floatDiv = document.querySelector('.layout-float');
    if (floatDiv) {
        floatDiv.style.display = 'none';
        document.querySelector('#footerWrapper').style.top = '20px';
    }
}

// open monitor settings popup
$('#setupMonitorBtn').on('click', async function (e) {
    // check if config popups is already opened.
    if (await md_utils.getMonitorConfigurationFlag()){
        md_utils.getShownMonitorSetting().then(wIds =>{
            wIds.forEach((wId)=>{
                chrome.windows.get(wId,{windowTypes:['popup']}).then(async (wnd) =>
                    await chrome.windows.update(wnd.id, { focused: true, state:"normal"}));
            });
        });
    } else {
        // open configuration popups
        let wIds = [];
        const monitoInfoArray = myDevice.monitorInfoArray;
        for (let i = 0; i < monitoInfoArray.length; i++){
            const monitorInfo = monitoInfoArray[i];
            var tab = await chrome.tabs.create({
                url: chrome.runtime.getURL(`../html/monitorConfig.html?monitorIdx=${monitorInfo.monitorIdx}`),
                active: false
            });

            let left = parseInt(monitorInfo.boundRect.left + monitorInfo.boundRect.width / 2 - 225);
            let top = parseInt(monitorInfo.boundRect.top + monitorInfo.boundRect.height / 2 - 250);
            let width = 450;
            let height = 418;
            var window = await chrome.windows.create({ tabId: tab.id, type: 'popup', left: left, top: top, width: width, height: height, focused: true });
            await chrome.windows.update(window.id, { focused: true, left: left, top: top, width: width, height: height });

            wIds.push(window.id);
        }

        await md_utils.setShownMonitorSetting(wIds);
        await md_utils.setMonitorConfigurationFlag();
    }
});

// release monitor configurating flag
async function closeMonitorConfigPopups() {
    md_utils.setMonitorConfigurationFlag(false);
}

////////////////////////// flik rules tab ///////////////////////////
var flikRuleArray;              // variable for flik informations
var flikTableObj = null;        // variable for flik table

const FLiK_table_setting = {
    dom: 'Blfrtip',
    ordering: false,
    searching: true,
    paging: false,
    info: false,
    data: flikRuleArray,
    wordwrap: true,
    buttons: [{
        extend: 'copy',
        text: '<u>C</u>opy',
        key: {
            key: 'c',
            altKey: true
        },
        exportOptions: {
            modifier: {
                selected: null
            }
        },
        header: false,
        title: '',
    }],
    stripeClasses: [],
    columns: [
        { data: null, defaultContent: '' },
        { data: "url" },
        { data: "slot" },
        { data: "handling" },
        { data: "banding" },
        { data: "label" },
        { data: "color" }
    ],
    columnDefs: [{
            targets: [0],
            className: 'reorder drag-handle',
        }, {
            targets: [1],
            className: 'dt-body-left longtext',
            createdCell: function(cell, cellData, rowData, rowIndex, colIndex) {
                $(cell).find(":input").autofocus = false;
                $(cell).click(function() {
                    if(!accountId) return;

                    $(this).html('<input type="text" size="16" style="width: 100%" placeholder="">');
                    var aInput = $(this).find(":input");
                    aInput.focus().val(flikTableObj.cell(cell).data());
                });
                $(cell).on("click", ":input", function(e) {
                    e.stopPropagation();
                });
                $(cell).on("blur", ":input", function() {
                    const text = md_utils.removeUrlPrefix($(this).val());
                    const row_data = flikTableObj.row(cell.parentNode).data();
                    const row_index = flikTableObj.row(cell.parentNode).index();

                    if(text === row_data.url) {
                        flikTableObj.row(cell.parentNode).data(row_data);
                        return;
                    }

                    // url verification
                    let matchInfo = profile.checkUrlMatch(text, row_index);
                    let notifyText = null;
                    switch (matchInfo.info) {
                        case "empty":
                            notifyText = "FLiK target cannot be empty!";
                            break;
                        case "invalid":
                            notifyText = "FLiK target in invalid url!";
                            break;
                        case "exact":
                            notifyText = "FLiK target cannot be duplicated!";
                            break;
                    }

                    if (notifyText) {
                        setTimeout(() => {
                            if ($("#FLiKs_tab").hasClass('active')) {
                                showNotify({ type: "Error", text: notifyText });

                                flikTableObj.rows().deselect();
                                flikTableObj.row(row_index).select();
                                $(cell).html('<input type="text" size="16" style="width: 100%" placeholder="">');
                                var aInput = $(cell).find(":input");
                                aInput.focus().val(text ? text : row_data.url);
                            }
                        }, 100);
                        return;
                    }

                    row_data.url = text;
                    enableRuleEditButtons();

                    if (row_data.handling === "") {
                        row_data.handling = "Last tab";
                    }

                    if (row_data.banding === "") {
                        row_data.banding = "Show & fade";
                    }

                    // auto ordering
                    if (matchInfo.info === "submatch" && matchInfo.index < row_index) {
                        let datas = [];
                        datas.push(flikTableObj.row(row_index).data());
                        for (let i = matchInfo.index; i <= row_index - 1; i++) {
                            datas.push(flikTableObj.row(i).data());
                        }

                        datas.forEach((data, index) => {
                            flikTableObj.row(index + matchInfo.index).data(data);
                        })

                        flikTableObj.row(row_index).deselect();
                        flikTableObj.row(matchInfo.index).select();
                        updateScrollPos(matchInfo.index);
                    } else {
                        flikTableObj.row(cell.parentNode).data(row_data);
                    }

                    updateFlikRuleArray();
                })
            },
            'render': function(data, type, full, meta) {
                return data;
            }
        },
        {
            targets: [2],
            className: 'dt-body-center',
            createdCell: function(cell, cellData, rowData, rowIndex, colIndex) {
                $(cell).click(function() {
                    if(!accountId) return;

                    renderLayoutPreviewForSlotSelect();

                    $(this).html('<input id="id_slot_select" type="text" size="20" style="width: 100%" placeholder="" readonly>');
                    var aInput = $(this).find(":input");

                    //$(cell).css('margin','0px');
                    $(aInput).width($(cell).width());
                    let cell_data = flikTableObj.cell(cell).data();
                    aInput.focus().val(cell_data);

                    const pos = $(cell).offset();
                    const optionLayoutPreviewSlot = $("#optionLayoutPreviewSlot");
                    const wrapLeft = $('#mainWrapper').offset().left;
                    const wrapWidth = $('#mainWrapper').width();

                    let height = optionLayoutPreviewSlot.height();
                    let top = pos.top + 35;
                    if (height + pos.top + 35 > window.innerHeight - $("#bodyWrapper").scrollTop()) {
                        top = pos.top - height;
                    }

                    optionLayoutPreviewSlot.css('top', `${top}px`);

                    let width = optionLayoutPreviewSlot.width();

                    let left = wrapLeft + wrapWidth - width - 20 - $("#bodyWrapper").scrollLeft();
                    if(left > pos.left) left = pos.left

                    optionLayoutPreviewSlot.css('left', `${left}px`);

                    optionLayoutPreviewSlot.find(`#slot_${cell_data}`).addClass("selected-slot");
                    optionLayoutPreviewSlot.show();

                    // draw the rule count per slot
                    md_utils.drawWndCountsInSlot("optionLayoutPreviewSlot_section", profile.getRuleSyncedInfo(editingDeviceId));
                });

                $(cell).on("blur", ":input", function() {
                    const optionLayoutPreviewSlot = $("#optionLayoutPreviewSlot");
                    const slotNumber = optionLayoutPreviewSlot.data('data-value');
                    const oldSlotNumber = flikTableObj.cell(cell).data();

                    if (slotNumber && slotNumber != oldSlotNumber) {
                        flikTableObj.cell(cell).data(parseInt(slotNumber));
                        $(cell).removeClass("error-cell");
                        updateFlikRuleArray();
                        $('#optionLayoutPreviewSlot').data('data-value', null);
                    } else {
                        flikTableObj.cell(cell).data(flikTableObj.cell(cell).data());
                    }

                    optionLayoutPreviewSlot.hide();
                    optionLayoutPreviewSlot.find('.selected-slot').removeClass("selected-slot");
                    $(".dataTables_scroll").off("click");

                    // draw the rule count per slot
                    md_utils.drawWndCountsInSlot("optionLayoutPreview", profile.getRuleSyncedInfo(mainDeviceId));
                })
            }
        },
        {
            targets: [3, 4],
            className: 'dt-body-center',
            createdCell: function(cell, cellData, rowData, rowIndex, colIndex) {
                $(cell).click(function() {
                    if(!accountId) return;

                    $(this).html(createCombox(colIndex == 3 ? md_config.DATA_Z.flik_type : md_config.DATA_Z.band_type));
                    var aInput = $(this).find(":input");
                    aInput.focus().val(flikTableObj.cell(cell).data());
                });
                $(cell).on("click", ":input", function(e) {
                    e.stopPropagation();
                });
                $(cell).on("change", ":input", function() {
                    $(this).blur();
                });
                $(cell).on("blur", ":input", function() {
                    const text = $(this).find("option:selected").text();
                    const oldText = flikTableObj.cell(cell).data();
                    flikTableObj.cell(cell).data(text);

                    if (text!= oldText) {
                        updateFlikRuleArray();
                    }
                });
            }
        },
        {
            targets: [5],
            className: 'dt-body-center longtext',
            createdCell: function(cell, cellData, rowData, rowIndex, colIndex) {
                $(cell).click(function() {
                    if(!accountId) return;

                    $(this).html('<input type="text" size="16" style="width: 100%" placeholder="">');
                    var aInput = $(this).find(":input");
                    aInput.focus().val(flikTableObj.cell(cell).data());
                });
                $(cell).on("click", ":input", function(e) {
                    e.stopPropagation();
                });
                $(cell).on("blur", ":input", function() {
                    const text = $(this).val();
                    const oldText = flikTableObj.cell(cell).data();
                    flikTableObj.cell(cell).data(text)

                    if(text!= oldText) {
                        updateFlikRuleArray();
                    }
                })
            }
        },
        {
            targets: [6],
            className: 'dt-body-center',
            createdCell: function(cell, cellData, rowData, rowIndex, colIndex) {
                $(cell).click(function() {
                    if(!accountId) return;

                    $(this).html('<div style="z-index:1000;" ><input type="color" id="' + rowIndex + '_color" value="' + cellData + '"/></div>');
                    $("#" + rowIndex + "_color").spectrum({
                        color: flikTableObj.cell(cell).data(),
                        flat: false,
                        showInput: false,
                        className: "full-spectrum",
                        showInitial: true,
                        showPalette: true,
                        showSelectionPalette: true,
                        maxPaletteSize: 10,
                        preferredFormat: "hex",
                        hideAfterPaletteSelect: true,
                        clickoutFiresChange: true,
                        showButtons: false,
                        move: function(color) {},
                        show: function() {},
                        beforeShow: function() {},
                        hide: function(e) {
                            flikTableObj.cell(cell).data(e.toHexString()).draw(false);
                            $(".sp-container.sp-hidden").remove();
                        },
                        change: function(e) {
                            flikTableObj.cell(cell).data(e.toHexString()).draw(false);
                            updateFlikRuleArray();
                        },
                        palette: [
                            ["#000000", "#434343", "#666666", "#cccccc", "#d9d9d9", "#ffffff"],
                            ["#e80058", "#333333", "#59e800", "#00b2e8", "#e84900", "#e800cd", "#d6e600", "#ff80b0", "#4b5860", "#8f3c24", "#704347",
                                "#0a1a2a", "#caa39f", "#e5ebda", "#339fbe", "#a83c31", "#863b4e", "#9d83a0", "#15121e", "#00b2e8", "#e06798", "#59e800",
                            ]
                        ]
                    }).focus();
                });
            }
        }
    ],
    select: {
        selector: 'tr',
        toggleable: false
    },
    rowReorder: {
        selector: 'td:first-child',
        update: true
    },
    fnRowCallback: function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
        $(nRow).find('td:eq(6)').css('background-color', aData.color);
        $(nRow).find('td:eq(6)').css('color', aData.color);

        let slotCount = profile.getSlotCount(mainDeviceId);
        $(nRow).find('td:eq(2)').removeClass("error-cell");
        if (aData.slot <= 0 || aData.slot > slotCount) {
            $(nRow).find('td:eq(2)').addClass("error-cell");
        }
    },
    initComplete: function(settings, json) {}
};

// render the slot selector
function renderLayoutPreviewForSlotSelect() {
    const res = profile.drawLayout({ caller: "slot-selector" }, { dottedFlag: 0, showCloseFlag: 0 }, mainDeviceId);

    let previewSection = document.createElement("div");
    previewSection.setAttribute("id", "optionLayoutPreviewSlot_section");
    let previewLayoutSlot = document.getElementById("optionLayoutPreviewSlot");
    previewLayoutSlot.innerHTML = "";

    previewLayoutSlot.style.height = `${res.height + 50}px`;
    previewLayoutSlot.style.width = `${res.width + 30}px`;
    previewSection.innerHTML = res.strHtml;
    previewLayoutSlot.appendChild(previewSection);

    $("#optionLayoutPreviewSlot .slot-num").mousedown(function(){
        const slotNum = $(this).attr('id').substring(5);
        $('#optionLayoutPreviewSlot').data('data-value', slotNum);
    });
}

// set rule edit buttons enabled
function enableRuleEditButtons(enable = true){
    $('.tableButton').prop("disabled", !enable);
}

// build table
function updateRuleTab() {
    flikRuleArray = profile.activeRules(mainDeviceId);

    if(flikTableObj === null) {
        flikTableObj = $("#fliksDataTable").DataTable(FLiK_table_setting);
        flikTableObj.select({style: 'single'});

        flikTableObj.on('pre-row-reorder', function ( e, node, index ) {
            const selectedRows = flikTableObj.rows( { selected: true } );
            const rowCount = selectedRows.length;
            for(i = 0; i < rowCount; i++){
                flikTableObj.row(selectedRows[i]).deselect();
            }

            preReorderRow = node.index;
            flikTableObj.row(preReorderRow).select();
        });

        // set event handler for dragging rows
        flikTableObj.on('row-reorder', function (e, diffs, edit) {
            if ($('.tableButton').prop('disabled')) {
                return;
            }

            if (diffs.length === 0) {
                return;
            }

            const url1 = flikTableObj.row(diffs[0].newPosition).data().url;
            const url2 = flikTableObj.row(diffs[diffs.length - 1].newPosition).data().url;
            if (md_utils.isMatched(url1, url2)) {
                setTimeout(() => {
                    if ($("#FLiKs_tab").hasClass('active')) {
                        showNotify({ type: "Error", text: "The rule is submatched others!" });
                    }
                }, 100);
                return;
            }

            let datas = [];
            // let selectedRows = flikTableObj.rows( { selected: true } );
            let newSelectedIndex =-1;
            diffs.forEach((diff) => {
                datas.push(flikTableObj.row(diff.oldPosition).data());
                if(diff.oldPosition == preReorderRow){
                    newSelectedIndex = diff.newPosition;
                    //flikTableObj.row(selectedRows[0]).deselect();
                }
            })

            flikTableObj.row(preReorderRow).deselect();

            diffs.forEach((diff, index) => {
                flikTableObj.row(diff.newPosition).data(datas[index]);
            })

            if (newSelectedIndex > -1){
                setTimeout(() => {
                    flikTableObj.row(newSelectedIndex).select();
                }, 100)
            }

            flikTableObj.draw(false);
            updateFlikRuleArray();
        });

        // set event handler for hovered slot
        flikTableObj.on('mouseover', 'tr', function (e) {
            let rowData = flikTableObj.row(e.target.parentNode).data();
            if (rowData == undefined) return;
            let slot = rowData.slot;
            $("#slot_" + slot).addClass('hovered-slot');
        });

        flikTableObj.on('mouseout', 'tr', function (e) {
            $(".hovered-slot").removeClass('hovered-slot');
        });

        // set event handler for hovered slot
        flikTableObj.on('mouseover', '.reorder.drag-handle', function (e) {
            showNotify({ type: "Hint", text: "Drag the rows to reorder." }, 2000);
        });
    }

    // draw table
    $('#rule-filter').val('');
    flikTableObj.clear().rows.add(flikRuleArray).draw(true);
    flikTableObj.column(1).search('').draw();

    // update default slot
    updateDefaultSlot();

    // enable / disable editing
    enableRuleEditButtons(accountId != null);
}

// Move up or down (depending...)
function moveRow(row, direction) {
    let index = flikTableObj.row(row).index();
    if (index == undefined) return;

    var data1 = flikTableObj.row(index).data();
    var notifyText = '';
    if (direction === 'up') {
        if(index == 0) return;

        var data2 = flikTableObj.row(index - 1).data();
        if (md_utils.isMatched(data2.url, data1.url)) {
            notifyText = "Current rule is a base rule of the above!";
        }
    } else {
        let count = flikTableObj.data().count();
        if (index == count - 1) return;

        var data2 = flikTableObj.row(index + 1).data();
        if (md_utils.isMatched(data1.url, data2.url)) {
            notifyText = "Current rule is submatched of the below!";
        }
    }

    if (notifyText) {
        setTimeout(() => {
            if ($("#FLiKs_tab").hasClass('active')) {
                showNotify({ type: "Error", text: notifyText });
            }
        }, 100);
        return;
    }

    flikTableObj.row(index).deselect();

    let order = (direction === 'down') ? 1 : -1;
    flikTableObj.row(index).data(data2);
    flikTableObj.row(index + order).data(data1);
    flikTableObj.draw(false);

    flikTableObj.row(index + order).select();
    updateScrollPos(index + order);

    updateFlikRuleArray();
}

function updateScrollPos(index) {
    let pos = (index < 10) ? 0 : 31 * (index - 9);
    $('div.dataTables_scrollBody').scrollTop(pos);
}

// show Notiify
var ruleNotifyTImer = null;
function showNotify(options, duration = 10000) {
    if (ruleNotifyTImer != null) {
        clearTimeout(ruleNotifyTImer);
    }

    $("#flikNotifyPane").addClass(options.type);
    $("#flikNotifyText").text(`${options.type} : ${options.text}`);

    ruleNotifyTImer = setTimeout(() => {
        $("#flikNotifyPane").removeAttr('class');
        $("#flikNotifyText").text("");
        ruleNotifyTImer = null;
    }, duration)
}

function updateFlikRuleArray() {
    profile.updateRules(mainDeviceId, flikTableObj.rows().data());
    flikRuleArray = profile.activeRules(mainDeviceId);

    profile.saveFlikRule(() => {
        chrome.runtime.sendMessage({
            action: "profileChanged",
            note: "rule changed"
        });
    })
}

// event handlers for rule table edit
var preReorderRow = -1;
$('#FLiKs .pasteBtn').on('click', async function(e) {
    let text = await navigator.clipboard.readText();
    let rows = text.split("\n");
    for (let i in rows) {
        let cells = rows[i].split("\t");
        if (parseInt(cells[1]) < 0) continue;

        let url = md_utils.removeUrlPrefix(cells[0]);
        let matchInfo = profile.checkUrlMatch(url);
        let addFlag = true;
        switch (matchInfo.info) {
            case "empty":
            case "invalid":
            case "exact":
                addFlag = false;
                break;
        }
        if (!addFlag) continue;

        let index = -1;
        if (matchInfo.info === "submatch") {
            index = matchInfo.index;
        }
        profile.addRule({
            url : url,
            slot : cells[1] || 0,
            handling : cells[2] || 'Last tab',
            banding : cells[3] || 'Show & fade',
            label : (cells[4] === 'NULL') ? '' : cells[4],
            color : cells[5] || md_config.DATA_Z.band_color,
        }, mainDeviceId, index)
    }

    profile.save(() => {
        flikRuleArray = profile.activeRules(mainDeviceId);
        flikTableObj.clear().rows.add(flikRuleArray).draw();

        $('.pasteBtn').hide();
        $('.copyBtn').hide();
    })
});

$('#FLiKs .distBtn').on('click', function(e) {
    if(confirm("Are you sure to distribute all rules?")) {
        const flikRowCount = flikTableObj.data().count();
        const maxSlot = profile.getSlotCount(mainDeviceId);
        let slot = 1;
        for (let i = 0; i < flikRowCount; i++) {
            const rowData = flikTableObj.row(i).data();
            flikTableObj.row(i).data({
                ...rowData,
                "slot": slot,
            });

            slot++;
            if (slot > maxSlot) {
                slot = 1;
            }
        }
        flikTableObj.draw(true);
    }

    updateFlikRuleArray();
});

$('#FLiKs .copyBtn').on('click', function(e) {
    flikTableObj.button( '.buttons-copy').trigger();
    $('.pasteBtn').hide();
    $('.copyBtn').hide();
});

$('#FLiKs .dropdown').on('click', function(e) {
    if ($('.pasteBtn').is(':hidden')) {
        $('.pasteBtn').fadeIn(400);
        $('.copyBtn').fadeIn(400);
    } else {
        $('.pasteBtn').hide();
        $('.copyBtn').hide();
    }
});

$('#FLiKs .addBtn').on('click', function(e) {
    let blankRow = false;
    flikTableObj.rows().every(function( rowIdx, tableLoop, rowLoop ) {
        if(this.data().url === '') blankRow = true;
    });
    if(blankRow) return;

    let flikRowCount = flikTableObj.data().count();
    flikTableObj.row.add({
        "row_id": flikRowCount,
        "url": "",
        "slot": 1,
        "handling": "Last tab",
        "banding": "Show & fade",
        "label": md_config.DATA_Z.band_label,
        "color": md_config.DATA_Z.band_color,
    }).draw(true);

    updateScrollPos(flikRowCount - 1);
    enableRuleEditButtons(false);
    $('#fliksDataTable tbody tr:last-child td:first-child').next().click();
});

$('#FLiKs .duplicateBtn').on('click', function() {
    var selected_row = flikTableObj.row('.selected');
    let index = flikTableObj.row(selected_row).index();
    if (index == undefined) return;

    let flikRowCount = flikTableObj.data().count();
    let data = flikTableObj.row(index).data();
    flikTableObj.row.add({
        "row_id": flikRowCount,
        "url": data.url,
        "slot": data.slot,
        "handling": data.handling,
        "banding": data.banding,
        "label": data.label,
        "color": data.color,
    }).draw(false);

    updateScrollPos(flikRowCount - 1);
    enableRuleEditButtons(false);
    $('#fliksDataTable tbody tr:last-child td:first-child').next().click();
});

$('#FLiKs .deleteBtn').on('click', function() {
    var selected_row = flikTableObj.row('.selected');
    let index = flikTableObj.row(selected_row).index();
    if (index == undefined) return;

    selected_row.remove().draw(false);
    updateFlikRuleArray();
});

$('#FLiKs .cleanBtn').on('click', function () {
    if (!flikTableObj.data().count()) return;
    if (!confirm("Will you remove all data?")) return;

    flikTableObj.clear().draw(false);
    updateFlikRuleArray();
});

$('#FLiKs .downBtn').on('click', function() {
    moveRow(flikTableObj.row('.selected'), 'down');
});

$('#FLiKs .upBtn').on('click', function() {
    moveRow(flikTableObj.row('.selected'), 'up');
});

$('#rule-filter').on('keyup', function (e) {
    flikTableObj.column(1).search(this.value).draw();
})

$('#clear-rule-filter').on('click', function (e) {
    flikTableObj.column(1).search('').draw();
    $('#rule-filter').val('');
})

// Refresh Default slot
function updateDefaultSlot() {
    const defSlotSelector = document.getElementById('default-slot-selector');
    while (defSlotSelector.length > 0) {
        defSlotSelector.remove(defSlotSelector.length - 1);
    }

    $(defSlotSelector).find('option').remove().end().append('<option value="0">off</option>')
    const device = profile.getDeviceById(mainDeviceId);
    const slotCount = device.getSlotCount();
    for (var i = 1; i <= slotCount; i++) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i;
        defSlotSelector.appendChild(opt);
    }

    let defaultSlotIndex = 0;
    if(device.defSlotNum) {
        defaultSlotIndex = parseInt(device.defSlotNum);
    }

    defSlotSelector.selectedIndex = defaultSlotIndex;
}

$('#default-slot-selector').change(async function() {
    const device = profile.getDeviceById(mainDeviceId);
    device.defSlotNum = parseInt(this.value);

    await profile.saveDeviceArray();
})

////////////////////////// target tab ///////////////////////////////
var targetInfoArray;            // variable for target informations
var targetTableObj = null;      // variable for target table

var showServiceListFlag = false;
const Target_table_setting = {
        dom: 'Blfrtip',
        ordering: false,
        searching: false,
        paging: false,
        info: false,
        data: targetInfoArray,
        wordwrap: true,
        buttons: ['copyHtml5'],
        stripeClasses: [],
        columns: [
            { data: null, defaultContent: '' },
            { data: "service" },
            { data: "target" },
            { data: "slot" },
            { data: "handling" },
            { data: "group" },
            { data: "favorite" }
        ],
        columnDefs: [{
                    targets: [0],
                    className: 'reorder drag-handle',
                }, {
                    targets: [1],
                    className: 'dt-body-left',
                    createdCell: function(cell, cellData, rowData, rowIndex, colIndex) {
                        $(cell).click(function() {
                            $(this).html('<input id="id_service_select" type="text" size="16" style="width: 100%" placeholder="" readonly>');
                            var aInput = $(this).find(":input");
                            aInput.focus().val(targetTableObj.cell(cell).data());

                            showServiceListFlag = true;
                            let position = $(cell).offset();
                            $("#services_wrapper").css({ top: (position.top - 245) + 'px', left: position.left + 'px' });
                            $("#services_wrapper").show();
                            $("#services_wrapper .service-item").off("click");
                            $("#services_wrapper .service-item").on('click', (e) => {
                                $("#services_wrapper").hide();
                                targetTableObj.cell(cell).data(e.target.textContent)
                                upadateTargetInfoArray();
                            })

                        });
                        $(cell).on("blur", ":input", function() {
                            showServiceListFlag = false;
                            var text = $(this).val();
                            targetTableObj.cell(cell).data(text);
                            setTimeout(() => {
                                if (!showServiceListFlag) {
                                    $("#services_wrapper").hide();
                                }
                            }, 200)
                        })
                    }
                },
                {
                    targets: [2],
                    className: 'dt-body-left longtext',
                    createdCell: function(cell, cellData, rowData, rowIndex, colIndex) {
                        $(cell).click(function() {
                            $(this).html('<input type="text" size="16" style="width: 100%" placeholder="">');
                            var aInput = $(this).find(":input");
                            aInput.focus().val(targetTableObj.cell(cell).data());
                        });
                        $(cell).on("click", ":input", function(e) {
                            e.stopPropagation();
                        });
                        $(cell).on("blur", ":input", function() {
                            var text = $(this).val();
                            targetTableObj.cell(cell).data(text)
                            upadateTargetInfoArray();
                        })
                    }
                },
                {
                    targets: [3],
                    className: 'dt-body-center',
                    createdCell: function(cell, cellData, rowData, rowIndex, colIndex) {
                        $(cell).click(function() {
                            let slotCount = profile.getSlotCount(editingDeviceId);
                            let targets = [];
                            for (let i = 0; i < slotCount; i++) {
                                targets.push(i + 1);
                            }

                            $(this).html('<input id="id_slot_select" type="text" size="16" style="width: 100%" placeholder="" readonly>');
                            var aInput = $(this).find(":input");
                            let cell_data = targetTableObj.cell(cell).data();
                            aInput.focus().val(cell_data);

                            createSlotSelector($(cell).offset(), targets, cell_data, $("#targetDataTable_wrapper").first()); //
                        });
                        $(cell).on("blur", ":input", function() {
                            let va = $(".customComboBox").find(".selected").toArray();
                            let selected_va = $(va[0]).find("p");
                            if (va.length > 0) {
                                targetTableObj.cell(cell).data(parseInt($(selected_va).text()));
                                $(cell).removeClass("error-cell");
                                upadateTargetInfoArray();
                            } else {
                                targetTableObj.cell(cell).data(targetTableObj.cell(cell).data());
                            }

                            $(".customComboBox").remove();
                            $(".dataTables_scroll").off("click");
                        })
                    }
                }, {
                    targets: [4],
                    className: 'dt-body-center',
                    createdCell: function(cell, cellData, rowData, rowIndex, colIndex) {
                        $(cell).click(function() {
                            $(this).html(createCombox(md_config.DATA_Z.flik_type));
                            var aInput = $(this).find(":input");
                            aInput.focus().val(targetTableObj.cell(cell).data());
                        });
                        $(cell).on("click", ":input", function(e) {
                            e.stopPropagation();
                        });
                        $(cell).on("change", ":input", function() {
                            $(this).blur();
                        });
                        $(cell).on("blur", ":input", function() {
                            var text = $(this).find("option:selected").text();
                            targetTableObj.cell(cell).data(text)
                            upadateTargetInfoArray();
                        });
                    }
                },
                {
                    targets: [5],
                    className: "dt-body-center",
                    render: function(data, type, row) {
                            if (type === 'display') {
                                return `<input type="checkbox" class="editor-active group" ${row.group ? ` checked` : ``}>`;
                }
                return data;
            }
        },
        {
            targets: [6],
            className: "dt-body-center",
            render: function (data, type, row) {
                if (type === 'display') {
                    return `<input type="checkbox" class="editor-active favorite" ${row.favorite ? ` checked` : ``}>`;
                }
                return data;
            },
        }
    ],
    select: {
        selector: 'tr',
        toggleable: false
    },
    rowReorder: {
        selector: 'td:first-child',
        update: true
    },
    fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
        let slotCount = profile.getSlotCount(mainDeviceId);
        $(nRow).find('td:eq(3)').removeClass("error-cell");
        if (aData.slot <= 0 || aData.slot > slotCount) {
            $(nRow).find('td:eq(3)').addClass("error-cell");
        }
    },
    "initComplete": function(settings, json) {}
};

// create custom element for slot selecting
function createSlotSelector(pos, data, seldata, parent) {
    let cmb = document.createElement("div");
    cmb.classList.add("customComboBox");
    cmb.style.position = "absolute";
    let remarks = "";
    data.forEach(function(ele, index) {
        let pts = slots.slotArray.length > index ? slots.slotArray[index].windowsCount() : 0;

        let combo_item = document.createElement("div");
        remarks = "";
        for (i = 0; i < pts; i++) {
            if (i < 5) {
                remarks += "•";
            } else {
                break;
            }
        }

        combo_item.classList.add("customComboItem");
        combo_item.innerHTML = `<p class="combo_content" style="font-size:12px;">${ele}</p><span class="combo_remark">${remarks}</span>`;
        if (ele == seldata) {
            combo_item.classList.add("selected");
        }

        $(combo_item).hover(
            function() {
                $(this).parent().find(".selected").removeClass("selected");
                $(this).addClass("selected");
            },
            function() {
                $(this).removeClass("selected");
            }
        );

        cmb.appendChild(combo_item);
    });

    ps = pos.top + 35;
    cmb.style.left = pos.left + 'px';
    cmb.style.top = ps + 'px';
    cmb.style.width = 55 + 'px';

    $("body").append(cmb);
}

// build table
function updateTargetTab() {
    targetInfoArray = profile.targetInfoArray;

    if(targetTableObj == null) {
        targetTableObj = $("#targetDataTable").DataTable(Target_table_setting);

        // set event for check box
        targetTableObj.on('change', 'input[type="checkbox"].favorite', function (e) {
            targetTableObj.row(e.target.parentNode.parentNode).data().favorite = this.checked;
            upadateTargetInfoArray();
        })

        targetTableObj.on('change', 'input[type="checkbox"].group', function (e) {
            targetTableObj.row(e.target.parentNode.parentNode).data().group = this.checked;
            upadateTargetInfoArray();
        })

        // set event handler for hovered slot
        targetTableObj.on('mouseover', 'tr', function (e) {
            let rowData = targetTableObj.row(e.target.parentNode).data();
            if (rowData == undefined) return;
            let slot = rowData.slot;
            $("#slot_" + slot).addClass('shared-slot');
        });

        targetTableObj.on('mouseout', 'tr', function (e) {
            $(".shared-slot").removeClass('shared-slot');
        });

        // draw service selector
        let _html = ``;
        for (const category in md_config.DATA_Z.services) {
            _html += `<div class="service-category">${category}</div>`
            md_config.DATA_Z.services[category].forEach(item => {
                _html += `<div class="service-item">${item}<img src="../img/social-icons/${item}.png"></div>`
            })
        }
        $("#services_wrapper").html(_html);
        $("#services_wrapper").hide();
    }

    // draw table
    targetTableObj.clear().rows.add(targetInfoArray).draw();
}

function addTarget(slot) {
    let targetRowCount = targetTableObj.data().count();
    targetTableObj.row.add({
        "row_id": targetRowCount,
        "service": "Facebook",
        "target": "@person",
        "slot": slot,
        "handling": "Last tab",
        "group": true,
        "favorite": false,
    }).draw(false);

    updateScrollPos(targetRowCount - 1);
    upadateTargetInfoArray();
    $('#targetDataTable tbody tr:last-child td:first-child').next().click();
}

function upadateTargetInfoArray() {
    profile.targetInfoArray = [];
    targetTableObj.rows().every(function (rowIdx, tableLoop, rowLoop) {
        profile.pushTargetInfo(this.data());
    });

    profile.saveTargetInfo(() => {
        targetInfoArray = profile.targetInfoArray;
    })
}

// event handlers for target table edit
$('#Targets .deleteBtn').on('click', function() {
    var selected_row = targetTableObj.row('.selected');
    let index = targetTableObj.row(selected_row).index();
    if (index == undefined) return;

    selected_row.remove().draw(false);
    upadateTargetInfoArray();
});

$('#Targets .receiveOptionBtn').on('click', function () {
    receiverOptionDlg.dialog("open");
});

////////////////////////// settings tab ////////////////////////////
const trainingSwitch = document.querySelector("#trainingSwitch");
trainingSwitch.addEventListener("change", event => {
    chrome.storage.local.set({
        isTraining: event.target.checked,
        showRuleInBand:event.target.checked,
        showModeInBand:event.target.checked
    });
});

const autoHideNotifyCheck = document.querySelector("#autoHideNotifyCheck");
autoHideNotifyCheck.addEventListener("change", event => {
    chrome.storage.local.set({
        autoHideNotify: event.target.checked
    });
});

$("#default_monitor_ordering").on('change', async () => {
    await md_utils.setDefaultMonitorOrdering($("#default_monitor_ordering").val());
})

const show_labelCheck = document.querySelector("#show_label");
show_labelCheck.addEventListener("change", event => {
    chrome.storage.local.set({
        showLabelInBand: event.target.checked
    });
});

const show_ruleCheck = document.querySelector("#show_rule");
show_ruleCheck.addEventListener("change", event => {
    chrome.storage.local.set({
        showRuleInBand: event.target.checked
    });
});

const show_modeCheck = document.querySelector("#show_mode");
show_modeCheck.addEventListener("change", event => {
    chrome.storage.local.set({
        showModeInBand: event.target.checked
    });
});

const show_domainCheck = document.querySelector("#show_domain");
show_domainCheck.addEventListener("change", event => {
    chrome.storage.local.set({
        showDomainInBand: event.target.checked
    });
});

$("#notifyDuration").on('change', () => {
    chrome.storage.local.set({ notifyDuration: $("#notifyDuration").val() });
});

function createFontFamilyOptions() {
    const select = document.getElementById("band-font");
    md_config.DATA_Z.fontFamilies.forEach((fontFamily) => {
        var option = document.createElement("option");
        option.value = fontFamily;
        option.text = fontFamily;
        option.style.fontFamily = fontFamily;
        select.appendChild(option);
    });

    select.addEventListener('change', function(){
        chrome.storage.local.set({
            bandFontFamily: this.value
        });

        this.style.fontFamily = this.value;
    });
}

////////////////////////// develop tab /////////////////////////////
$("#initProfile").on('click', () => {
    if (!confirm("Are you sure to initialize the profile?")) return;

    $("body").css('cursor', 'wait');
    chrome.runtime.sendMessage({
        action: "initProfile",
    }, async function (response) {
        $("body").css('cursor', '');
        var msg = "";
        if (response) {
            msg = 'The profile is initialized successfully.';
        } else {
            msg ="failed to initialize profile.";
        }

        alert(msg);
    })
})

$("#syncProfile").on('click', () => {
    if (!confirm("Are you sure to sync the profile?")) return;

    $("body").css('cursor', 'wait');
    chrome.runtime.sendMessage({
        action: "syncProfile",
        modeName: myDevice.activeMode().name,
    }, async function (response) {
        $("body").css('cursor', '');
        var msg = "";
        if (response) {
            msg = 'The sync profile is completed successfully.';
        } else {
            msg ="failed to sync profile.";
        }

        alert(msg);
    })
})

$("#unregisterDevice").on('click', () => {
    if(!confirm("Are you sure to unregister the device and clean profile?")) return;

    $("body").css('cursor', 'wait');
    chrome.runtime.sendMessage({
        action: "unregisterDevice",
    }, async function (response) {
        $("body").css('cursor', '');
        if (response) {
            alert('The device is unregistered successfully.');

            // open splash page.
            openSpalshPage();
        } else {
            alert("failed to unregister device.");
        }
    })
})

$("#clearServer").on('click', () => {
    if(!confirm("Are you sure to clean all devices for this user on the server?")) return;

    $("body").css('cursor', 'wait');
    chrome.runtime.sendMessage({
        action: "clearServer",
    }, async function (response) {
        $("body").css('cursor', '');
        if (response) {
            alert('The devices on server is successfully cleaned.');
            openSpalshPage();
        } else {
            alert("failed to clear server.");
        }
    })
})

$("#downloadLogs").on('click', async () => {
    const eventLogs = await md_utils.getLogs();
    const logContent = eventLogs.join("\n");

    const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(logContent);
    chrome.downloads.download({
        url: dataUri,
        filename: `${myDevice.title}_event_log.txt`,
        saveAs: true
    });
})

////////////// event handler when storage is changed /////////////////
chrome.storage.onChanged.addListener(async function (changes, namespace) {
    // when my device is delelted
    if (changes["deviceRemovedByServer"] != undefined) {
        if(changes["deviceRemovedByServer"].newValue === true) {
            await md_utils.setDeviceDeletedByServer(false);

            // open splash page.
            openSpalshPage();
        }
    }

    if (changes["deviceArray"] != undefined) {
        // check device array (id & name) is changed or not
        const newDeviceArray = changes["deviceArray"].newValue;
        const changedByMonitorSetting = await md_utils.getMonitorConfigurationFlag();
        const changedByServer = await md_utils.getDeviceChangedByServer();
        const isDeviceListChanged = profile.isDeviceArrayChanged(newDeviceArray);

        // update device array
        profile.setDeviceArray(newDeviceArray);

        if (profile && (changedByMonitorSetting || changedByServer)) {
            // check monitor configuration is changed or not
            if(changedByMonitorSetting) {
                monitorChangedHandler();
            } else if (changedByServer) {
                // check main device is removed by server
                const mainDeviceRemoved = (newDeviceArray.findIndex(device => device.deviceId === mainDeviceId) == -1);
                if(mainDeviceRemoved) {
                    mainDeviceId = myDeviceId;
                }

                // check editing device is removed
                const activeDeviceRemoved = (newDeviceArray.findIndex(device => device.deviceId === editingDeviceId) == -1);
                if(activeDeviceRemoved) {
                    editingDeviceId = myDeviceId;
                }

                deviceArrayChangedHandler(isDeviceListChanged, true, activeDeviceRemoved);

                // check myDevice's monitor is changed
                const newMyInfo = newDeviceArray.find(device => {device.deviceId === myDeviceId});
                if(newMyInfo && !myDevice.compareMonitorInfo(newMyInfo)) {
                    myMonitorChangedHandler();
                }
            }

            await md_utils.setDeviceChangedByServer(false);
        }
    }

    // when rule changed
    if (changes["flikRuleArray"] != undefined) {
        if (await md_utils.getRuleChangedByServer()) {
            await md_utils.setRuleChangedByServer(false);
            profile.flikRuleArray = changes["flikRuleArray"].newValue;
            flikRuleArray = profile.flikRuleArray;
            updateTabs();
        }
    }

    if (changes["autoHideNotify"] != undefined) {
        autoHideNotifyCheck.checked = changes["autoHideNotify"].newValue;
    }

    // the case of logout
    if (changes["accountId"] != undefined) {
        updateLoginState();
    }

    // when isEnable is changed by portal of content.js
    if (changes["isEnable"] != undefined) {
        enableSwitch.checked = changes["isEnable"].newValue;
    }

    // when band setting is changed
    if (changes["showLabelInBand"] != undefined) {
        show_labelCheck.checked = changes["showLabelInBand"].newValue;
    }

    if (changes["showRuleInBand"] != undefined) {
        show_ruleCheck.checked = changes["showRuleInBand"].newValue;
    }

    if (changes["showModeInBand"] != undefined) {
        show_modeCheck.checked = changes["showModeInBand"].newValue;
    }

    if (changes["showDomainInBand"] != undefined) {
        show_domainCheck.checked = changes["showDomainInBand"].newValue;
    }

    // slotArray is changed
    if (changes["slotArray"] != undefined) {
        slots = new md_slot.Slots(changes["slotArray"].newValue);
    }

    // lock flag changed
    if (changes["lockFlag"] != undefined) {
        lockScreen(changes["lockFlag"].newValue);

        if(lockTimerHandler){
            clearInterval(lockTimerHandler);
        }

        if (changes["lockFlag"].newValue) {
            lockStartTime = new Date();
            lockTimerHandler = setInterval(showLockElapsedTime, 1000);
        }
    }

    // pendig time is changed
    if (changes["pendingTime"] != undefined) {
        pendingTime = changes["pendingTime"].newValue;
        if(pendingTime === 30) {
            startPendingTimeScheduler();
        }
    }
});

// event handler to process mouse on document
$(document).on('click', function(e) {
    removeFloatLayoutDiv();
    $('.selectOptions').hide();

    // hide copy/paste menu
    if (!e.target.classList.contains("dropdown")) {
        $('.pasteBtn').hide();
        $('.copyBtn').hide();
    }
});

$(document).on('mouseout', '.selectOptions', function(e) {
    if (e.target.classList.contains("selectOptions")) {
        removeFloatLayoutDiv();
    }
});

$(document).on('mouseenter', '.selectOption', function(e) {
    const selectOptions = $(this).closest('.selectOptions');
    selectOptions.find('.selectOption').removeAttr('selected');
    $(this).attr('selected', 'selected');

    let floatDiv = document.querySelector('.layout-float');
    let idxL = parseInt($(this).attr('layoutId'));
    strLayout = `<div class="layout-grid">`;
    md_utils._layouts[md_utils.Layouts[idxL].idx].class.forEach(layoutCls => {
        const res = md_utils.insertDivSection(layoutCls, '');
        strLayout += res.html;
    });
    strLayout += `</div>`;
    floatDiv.innerHTML = strLayout;
    floatDiv.style.display = 'block';

    const rect = this.getBoundingClientRect();

    floatDiv.style.top = (rect.top + window.scrollY - 20)+ 'px';
    floatDiv.style.left = (rect.left + window.scrollX + 320)+ 'px';

    document.querySelector('#footerWrapper').style.top = '-62px';
});

$(document).on('click', '.selectedOption', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $('.selectOptions ').not(`[select-options-for= "${$(this).attr('id')}"]`).hide();
    $(`[select-options-for="${$(this).attr('id')}"]`).toggle().trigger('focus');
});

// release configurationing flag
$(window).unload(function () {
    closeMonitorConfigPopups();
    return "Are you sure you want to close?";
});

// update tabs
function updateTabs(activeTabId = null) {
    // get active tab of tabButtonsWrapper
    if(!activeTabId) {
        const activeTab = document.querySelector('#tabButtonsWrapper .active');
        activeTabId = activeTab.getAttribute('id');
    }

    switch (activeTabId) {
        case "FLiKs_tab":
            updateRuleTab();
            break;
        case "DeviceLayout_tab":
            updateLayoutTab();
            break;
        case "Targets_tab":
            updateTargetTab();
            break;
        case "Settings_tab":
            break;
        case "Develop_tab":
            break;
    }
}

// initialize all popups
function initDialogs() {
    initReceiverOptionDlg();
    initLayoutDeviceSelectDlg();
    initDeviceOptionDlg();
    initModeOptionDlg();

    // color picker
    $("#optDeviceColorPicker").spectrum({
        preferredFormat: "hex",
        hideAfterPaletteSelect: true,
        showPalette: true,
        palette: [
            ['white', 'blanchedalmond', 'rgb(255, 128, 0)',  "rgba(0, 255, 0, .5)", "rgb(0, 128, 255)"],
            ['red', 'blue', 'yellow', 'green', 'violet']
        ]
    });
}

////////////////// init //////////////////////////////
window.onload = async function() {
    try {
        md_config = await import("./config.js");
        md_profile = await import("./profile.js");
        md_slot = await import("./slot.js");
        md_utils = await import("./utils.js");

        // init controls
        createFontFamilyOptions();

        // init dialogs
        initDialogs();

        // load and initialize variables
        md_utils.setMonitorConfigurationFlag(false);

        // set tab selection handler.
        $(".tab-button").click(function () {
            let old_tab = document.querySelector(".tab-button.active");
            old_tab.classList.remove("active");
            $("#" + old_tab.getAttribute("id").split("_")[0]).hide();

            this.classList.add("active");
            const activeTabtabId = this.getAttribute("id");
            $("#" + activeTabtabId.split("_")[0]).show();
            updateTabs(activeTabtabId);
        });

        chrome.storage.local.get(["accountId", "isEnable", "isTraining", "autoHideNotify", "notifyDuration", "slotArray", "defaultMonitorOrdering", "showLabelInBand", "showRuleInBand", "showModeInBand", "showDomainInBand", "bandFontFamily", "myDeviceId"],
        async function ({ accountId, isEnable, isTraining, autoHideNotify, notifyDuration, slotArray, defaultMonitorOrdering, showLabelInBand, showRuleInBand, showModeInBand, showDomainInBand, bandFontFamily, myDeviceId}) {
            profile = new md_profile.Profile(await md_profile.Profile.load());
            slots = new md_slot.Slots(slotArray);
            this.accountId = accountId;
            this.myDeviceId = myDeviceId;
            this.myDevice = profile.getMyDevice();
            this.editingDeviceId = myDeviceId;

            // update swithes
            enableSwitch.checked = isEnable;
            mainDeviceId = myDeviceId;

            // set device select list
            updateDeviceList();

            // update mode list
            updateModeList();

            // set monitor ordering option
            createMonitorOrderingOption(defaultMonitorOrdering);

            // updated device layout diagram
            drawDeviceLayout();

            // if device is not registered, open device option dialog
            if(this.editingDeviceId == "") {
                openDeviceOptionDlg(this.editingDeviceId);
            }

            // make FLiK tab as active
            updateRuleTab();
            setTimeout(() => {
                $("#fliksDataTable").css("width", "auto");
            }, 50)

            // load account info
            updateLoginState();

            // set default tab
            const url = new URL(window.location.href);
            const tabName = url.searchParams.get("active");
            if (tabName) {
                $(`#${tabName}_tab`).trigger("click");
            }

            //////////// initialize setting tab's values ////////////
            trainingSwitch.checked = isTraining;

            // set notify popup information
            autoHideNotifyCheck.checked = autoHideNotify;
            if(notifyDuration == undefined) notifyDuration = "5";
            $("#notifyDuration").val(notifyDuration);

            // set band configuration
            show_labelCheck.checked = showLabelInBand;
            show_ruleCheck.checked = showRuleInBand;
            show_modeCheck.checked = showModeInBand;
            show_domainCheck.checked = showDomainInBand;
            document.getElementById("band-font").value = bandFontFamily;
            document.getElementById("band-font").style.fontFamily = bandFontFamily;
        })
    } catch (e) {
        console.log(e)
    }
}