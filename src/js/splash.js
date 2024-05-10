/**
 * written by Jin YC  2023.11.12
 */

// module variables
var md_config, md_utils, md_profile;

var profile, myDeviceId, myDevice, newAccount = false, newDevice = false;

/////////////// Event Handler //////////////////////////////
chrome.storage.onChanged.addListener( function(changes, namespace) {
    // the case of logged In / logged Out
    if (changes["accountId"] != undefined) {
        updateSetupWidzardState();
    }
})

//////////////////// setup wizard /////////////////////////////
var itemList = [];   // device and mode list of server
const strAddDevice = "Add new device";

$("#go_signup").click(() => {
    $("#setup_widzard_frame_caption").text("New account");

    $("#login_pane").hide();
    $("#signup_pane").show();
    $("#account_name").focus();
})

$("#login").click(() => {
    let name = $("#user_mail").val();
    let password = $("#user_password").val();
    if (name === "") {
        $("#login_name").addClass("error-input");
        return;
    }

    $('body').css('cursor', 'wait');
    $("#login").css('cursor', 'wait');

    chrome.runtime.sendMessage({
        action: "logIn",
        name: name,
        password: password,
    }, function (respone) {
        $("body").css('cursor', '');
        $("#login").css('cursor', 'pointer');
        if (respone.error) {
            alert(respone.error.message);
        }
    })
})

$("#use_offline").click(async () => {
    await md_utils.setOfflineFlag();
    updateSetupWidzardState();
})

$("#signup").click(() => {
    const user_Info = {
        username : $("#account_name").val(),
        email : $("#account_mail").val(),
        password : $("#account_password").val()
    };
    const confirmPwd = $("#account_password_confirm").val();

    if(user_Info.password != confirmPwd) {
        alert("Password confirmation is failed.");
        return;
    } else {
        $("body").css('cursor', 'wait');
        $("#signup_signup").css('cursor', 'wait');
        chrome.runtime.sendMessage({
            action: "signUp",
            info : user_Info,
        }, function (response) {
            const { user, error } = response.user;
            $("body").css('cursor', '');
            $("#signup_signup").css('cursor', 'pointer');

            if (!error) {
                $("#user_name").val("");
                $("#user_mail").val("");
                $("#user_password").val("");
                $("#user_password_confirm").val("");

                newAccount = true;
                alert("registered successfuly!");
            } else {
                alert(error.message);
                console.log(error);
            }
        })
    }
})

$("#back_login").click((e) => {
    $("#setup_widzard_frame_caption").text("Login");

    $("#signup_pane").hide();
    $("#login_pane").show();
    $("#user_mail").focus();
})

$('#device_list_input').click((e) => {
    if ($('#device_list_content').is(":visible")) {
        $('#device_list_content').hide();
    } else {
        $('#device_list_content').css("display", "block").show();
        $('#device_list_input').focus();
    }
});

$('#device_list_content').on('mousedown','.custom-list-item', function(e) {
    $('#device_list_input').val($(this).text());

    const item_idx = $(this).attr('item_idx');
    if(item_idx == -1) {
        $("#device_name").val("");
    }
    updateRegisterDevicePane(item_idx);

    $('#device_list_content').hide();
});

$('#device_list_input').blur(function(e){
    $('#device_list_content').hide();
});

$('#device_name').keyup(function() {
    updateRegisterDevicePane();
})

$(('#mode_name')).focus(function() {
    $('#device_list_content').show();
});

$(('#mode_name')).blur(function() {
    $('#device_list_content').hide();
});

$("#register_device").click(() => {
    const deviceName = $("#device_name").val();
    modeName = $("#mode_name").val();

    // check the exactly matched case
    const item = itemList.find(item => item.deviceName === deviceName && item.modeName === modeName);
    if(item && item.matched === 0) {
        registerDevice();
    } else {
        registerDevice();
    }
})

$("#add_device").click(() => {
    const deviceName = $("#device_name").val();
    if(deviceName === "") {
        alert("The device name is is not vaild");
        $("#device_name").focus();
        return;
    }

    // decide the prefer mode name
    let itemCount = itemList.filter(item => item.deviceName === deviceName).length;
    const preferName = md_utils.getOrderName(itemCount);

    modeName = prompt(`Please input the new mode name to add '${deviceName}' device?`, preferName);

    // check mode name is valid
    if(!modeName || modeName == "") {
        alert("The mode name you entered is not valid.");
        return;
    }

    if(itemList.findIndex(item => item.deviceName == deviceName && item.modeName == modeName) > -1) {
        alert("The mode name you entered is already registered.");
        return;
    }

    registerDevice();
})

$("#welcome_goto_option").click((event) => {
    openOptionPage();
})

$("#welcome_close").click((event) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.remove(tabs[0].id);
    });
})

// initialize variables and dashboard
async function initialize() {
    // set device type list
    let strTypes = '';
    md_config.DATA_Z.deviceTypes.forEach((type) => {
        strTypes += `<option value="${type}">${type}</option>`
    })
    $('#device_types').find('option').remove().end().append(strTypes);

    // load mydevice from local storage
    profile = new md_profile.Profile(await md_profile.Profile.load());
    myDevice = profile.getMyDevice();

    if(!myDevice) {
        await md_profile.Profile.create();
        profile = await reloadProfile();
        myDevice = profile.getMyDevice();
    }

    // load user information
    updateSetupWidzardState();
}

async function updateSetupWidzardState() {
    // hide login and signup pane
    $("#login_pane").hide();
    $("#signup_pane").hide();
    $("#register_device_pane").hide();
    $("#welcome_pane").hide();

    const offlineMode = await md_utils.getOfflineFlag();
    const accountId = await md_utils.getAccountId();

    // check logged status
    if (!offlineMode && !accountId) {
        $("#setup_widzard_frame_caption").text("Login");

        $("#setup_widzard_frame").show();
        $("#login_pane").show();
        $("#user_mail").focus();
        return;
    }

    $("#use_offline").hide();
    $("#waiting_frame").show();

    // get device list from server
    chrome.runtime.sendMessage({
        action: "getDevicesFromServer",
    }, async (data) => {
        $("#waiting_frame").hide();
        // check device is already registered
        myDeviceId = await md_utils.loadMyDeviceId();
        if(offlineMode && myDeviceId) {
            showWelcomePane();
            return;
        }

        const matchedDevice = data.find(device => device.deviceId === myDeviceId);

        // check there exist the exactly matched device
        if(!myDeviceId || !matchedDevice || (!offlineMode && myDeviceId && matchedDevice)) {
            //// fullfill the item list
            data.forEach((deviceInfo) => {
                const device = new md_profile.Device(deviceInfo);
                const item = {
                    deviceId: device.deviceId,
                    deviceName: device.title,
                    type: device.type,
                    itemType: "device",
                }

                if(device.modes.length === 1) {
                    item.monitorInfoArray = device.getMonitorInfoArray(-1, 'monitorIdx');
                    item.matched = myDevice.checkMonitorMatched(item.monitorInfoArray);
                    item.modeName = device.activeMode().name;
                    item.modeIndex = device.modeIndex;
                    itemList.push(item);
                } else {
                    item.monitorInfoArray = [...device.monitorInfoArray];
                    // item.matched = myDevice.checkMonitorMatched(item.monitorInfoArray);
                    item.matched = 2;
                    item.modeName = "";
                    item.modeIndex = -1;
                    itemList.push(item);

                    for(let i = 0; i < device.modes.length; i++) {
                        const modeItem = {
                            deviceId: device.deviceId,
                            deviceName: device.title,
                            type: device.type,
                            itemType: "mode",
                            modeName: device.modes[i].name,
                            modeIndex: i,
                        }

                        modeItem.monitorInfoArray = device.getMonitorInfoArray(i, 'monitorIdx');
                        modeItem.matched = myDevice.checkMonitorMatched(modeItem.monitorInfoArray);

                        itemList.push(modeItem);
                    }
                }
            })

            //// make device list
            const lstDeviceContent = document.getElementById("device_list_content");
            lstDeviceContent.innerHTML = "";
            let strContent ="";
            itemList.forEach((item, index) => {
                const matchResult = item.matched === 0 ? " exact-match" : item.matched === 1 ? " partial-match" : "";
                const strMatched = item.matched === 0 ? " (Exact match)" : item.matched === 1 ? " (Partial match)" : "";
                const isMatched = (item.deviceId === myDeviceId && item.modeIndex == undefined) ? " id-matched" : "";
                const title = item.itemType === "device"? item.deviceName : item.modeName;
                strContent += `<div item_idx="${index}" mode_idx="${item.modeIndex}" class="custom-list-item${matchResult}${isMatched} ${item.itemType}">${title}${strMatched}</div>`;
            })

            // add "add new device" item
            strContent += `<div item_idx="-1" mode_idx="-1" class="custom-list-item">${strAddDevice}</div>`;

            lstDeviceContent.innerHTML = strContent;
            lstDeviceContent.style.display = 'none';

            //// set my device description
            const displayInfoArray = await chrome.system.display.getInfo();
            let strDescription = `${myDevice.type}<br>`;
            strDescription += `monitors : ${displayInfoArray.length}<br>`;
            displayInfoArray.forEach((displayInfo, idx) => {
                const boundRect = { ...displayInfo.workArea, height: Math.round(displayInfo.workArea.height / 4) * 4 }

                strDescription += `${idx+1}: ${boundRect.width} x ${boundRect.height}${displayInfo.isPrimary ? '(p)' : ''}<br>`
            });
            $("#my_device_description").html(strDescription);

            //// select first exactly matched device
            let matchedItemIdx = -1;
            if(itemList.length > 0) {
                $('#register_tip').hide();

                matchedItemIdx = itemList.findIndex(item => item.matched == 0 && item.deviceId === myDeviceId && item.modeIndex != -1);
                if(matchedItemIdx == -1) {
                    matchedItemIdx = itemList.findIndex(item => item.matched == 0 && item.deviceId === myDeviceId);
                }
                if(matchedItemIdx == -1) {
                    matchedItemIdx = itemList.findIndex(item => item.matched == 0 && item.modeIndex != -1);
                }
                if(matchedItemIdx == -1) {
                    matchedItemIdx = itemList.findIndex(item => item.matched == 0);
                }
            } else {
                // this means first install
                newDevice = true;

                $('#register_device').hide();

                $("#device_name").val(myDevice.title);
                $("#device_types").val(myDevice.type);
            }

            // set dropdown default
            if(matchedItemIdx > -1) {
                const matchedDevice = $(`#device_list_content [item_idx=${matchedItemIdx}]`);
                $('#device_list_input').val(matchedDevice.text());
            } else {
                $('#device_list_input').val(strAddDevice);
            }

            //// show matched device detected message
            if($('#device_list_content .exact-match').length > 0 || $("#device_list_content .partial-match").length > 0) {
                $("#register_device_notify").show();
            } else {
                $("#register_device_notify").hide();
            }

            $("#setup_widzard_frame").show();
            $("#register_device_pane").show();

            updateRegisterDevicePane(matchedItemIdx);

            return;
        }

        // sync profile
        $("#waiting_frame").show();
        chrome.runtime.sendMessage({
            action: "syncProfile",
            modeName: myDevice.activeMode().name,
        }, function (response) {
            // show welcome pane
            showWelcomePane();
        })
    });
}

function updateRegisterDevicePane(itemIdx = -1) {
    $(".error-field").removeClass("error-field");

    if(itemList.length == 0) {
        $("#mode_name_caption").hide();
        $("#mode_name").hide();
        $("#add_device").text("Add as new device");
    }

    let item;
    if(itemIdx > -1) {
        item = itemList[itemIdx];
    } else {
        // check validate of field
        const deviceName = $("#device_name").val();
        const modeName = $("#mode_name").val();

        if(modeName === "") {
            $("#register_device").prop("disabled", true);
        }
        if(deviceName === "") {
            $("#device_name_caption").addClass("error-field");

            setTimeout(() => {
                $("#device_name").focus();
            }, 50);
        }

        item = itemList.find(elem => elem.deviceName === deviceName && elem.modeName == modeName);
    }

    // make register_device button enabled
    $("#register_device").prop("disabled", false);
    $("#add_device").prop("disabled", false);

    // set button text and header caption
    let strDescription = "";
    if(item) {
        if(item.matched === 0) {
            $("#setup_widzard_frame_caption").text("Connect device");
            $("#register_device").text("Connect");
            $("#waiting_caption").text("Connecting...");
        } else {
            $("#setup_widzard_frame_caption").text("Update device");
            $("#register_device").text("Update");
            $("#waiting_caption").text("Updating...");
        }
        $("#add_device").text("Add as new mode");

        // update device description
        if(item.monitorInfoArray) {
            strDescription += `${item.type}<br>`;
            strDescription += `monitors : ${item.monitorInfoArray.length}<br>`;
            item.monitorInfoArray.forEach((monitorInfo, idx) => {
                strDescription += `${idx+1}: ${monitorInfo.boundRect.width} x ${monitorInfo.boundRect.height}${monitorInfo.isPrimary ? '(p)' : ''}<br>`
            });
        }

        // set device name and type
        $('#device_name').val(item.deviceName);
        $('#device_types').val(item.type);
        $('#mode_name').val(item.modeName);
        if(!item.modeName) {
            $("#register_device").prop("disabled", true);
        }
    } else {
        // check device is valid
        const deviceName = $("#device_name").val();
        item = itemList.find(elem => elem.deviceName === deviceName);
        if(item) {
            $("#setup_widzard_frame_caption").text("Add as new mode");
            $("#add_device").text("Add as new mode");
        } else {
            $("#setup_widzard_frame_caption").text("Add new device");
            $("#add_device").text("Add new device");
        }

        $("#register_device").prop("disabled", true);
        $("#waiting_caption").text("Adding...");
    }

    $("#device_description").html(strDescription);
}

var modeName = "";
async function registerDevice() {
    const deviceName = $("#device_name").val();

    if(deviceName === "" || modeName === "") {
        return;
    }
    const type = $("#device_types").val();

    // check the match cases
    let item = itemList.find((item => item.deviceName === deviceName && item.modeName === modeName));
    let deviceId = "";
    if(item) {
        deviceId = item.deviceId;
        await md_utils.setMyDeviceId(myDevice.deviceId);

        if(item.matched === 0) {
            // connect device and mode
            $("#waiting_caption").text("Connecting...");
        } else {
            // update devcie
            $("#waiting_caption").text("Updating...");
        }
    } else {
        // check device name
        item = itemList.find((item => item.deviceName === deviceName));
        if(item) {
            // resigister new device as mode
            deviceId = item.deviceId;
        } else {
            // resigister new device
            deviceId = await md_utils.generateDeviceId();
            myDevice.renameActiveMode(modeName);
        }
        $("#waiting_caption").text("Registering...");
    }

    // update my device data
    myDevice.deviceId = deviceId;
    myDevice.title = deviceName;
    myDevice.type = type;
    profile.myDeviceId = deviceId;

    await profile.saveDeviceArray(() => {
        $("#register_device_pane").hide();
        $("#waiting_frame").show();

        chrome.runtime.sendMessage({
            action: "syncProfile",
            modeName,
        }, function (response) {
            // show welcome pane
            showWelcomePane();
        })
    });
}

// show welcome pane
function showWelcomePane() {
    // show only for new device or new Account
    if(newAccount || newDevice) {
        $("#waiting_frame").hide();
        $("#setup_widzard_frame_caption").text("Welcome");
        $("#welcome_wrapper").text("Thank you for joining the Flik community.");
        $("#register_device_pane").hide();
        $("#welcome_pane").show();
    } else {
        openOptionPage();
    }
}

// open option page
function openOptionPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(curTabs) {
        const baseUrl = chrome.runtime.getURL(`/html/options.html`);
        chrome.tabs.query({}, async function (tabs) {
            for (const tab of tabs) {
                if (tab.url.startsWith(baseUrl)) {
                    await chrome.tabs.reload(tab.id);
                    await chrome.tabs.update(tab.id, { active: true });
                    chrome.tabs.remove(curTabs[0].id);
                    return;
                }
            }

            chrome.runtime.openOptionsPage();
            chrome.tabs.remove(curTabs[0].id);
        });
    });
}

///////////////////////////// initialize /////////////////////////////
window.onload = async function () {
    try {
        md_config = await import("./config.js");
        md_profile = await import("./profile.js");
        md_utils = await import("./utils.js");

        // initialize all data
        await initialize();
    } catch (e) {
        console.log(e)
    }
}
