/**
 * written by Jin YC.  2022.11.01
 */

import { DATA_Z } from "./js/config.js";
import { Profile, Device, FlikRule } from "./js/profile.js";
import { Slots } from "./js/slot.js";
import * as utils from "./js/utils.js";
import "./supabase_controller.js";

/////////////////// Events //////////////////////////////////
async function getProfile(){
    return await supabase_controller.getProfile();
}

async function reloadProfile(){
    return await supabase_controller.reloadProfile();
}

var _userId = null;                // global variable of user_id
async function getAccountId() {
    if(_userId) {
        return _userId;
    }

    _userId = await utils.getAccountId();
    return _userId;
}

function setAccountId(userId) {
    _userId = userId;
}

chrome.runtime.onInstalled.addListener(async function(details) {
    const thisVersion = chrome.runtime.getManifest().version;
    setActionState(false);

    // init logs
    await utils.initLogs();

    if (details.reason == "install") {
        console.log("FLiK is installed " + thisVersion);
        // set default options
        await utils.initSystemConfigs();
        await utils.initFlikCounter();
        await utils.initBandInfo();
        await utils.initNotifyInfo();
        await utils.setMyDeviceId("");
        await utils.setDefaultMonitorOrdering("Clockwise");

        // create profile
        await createProfile();
        await utils.initAccountInfo();
        await utils.initFlikUserlist();
        await utils.setOfflineFlag(false);
        await utils.setLockFlag(false);

        // open splash page
        openSplash();
    } else if (details.reason == "update") {
        console.log("FLiK is Updated from " + details.previousVersion + " to " + thisVersion);
        await initProfile();
        await utils.cleanAccountId();
        await utils.initFlikUserlist();
        await utils.setLockFlag(false);
        await tryLogin();
    }
})

chrome.runtime.onStartup.addListener(async function() {
    console.log("FLiK extension is started");
});

chrome.runtime.onSuspend.addListener(function() {
    console.log("FLiK extension will be unloaded");
});

chrome.management.onEnabled.addListener(async function(info) {
    if (info.id === chrome.runtime.id && info.enabled) {
        console.log(info.name, "extension is enabled");

        // init logs
        await utils.initLogs();

        setActionState(false);
        await initProfile();
        await utils.cleanAccountId();
        await utils.initFlikUserlist();
        await utils.setLockFlag(false);
        await tryLogin();

        // auto sync
        // syncSlotsbyWindow();
    }
})

chrome.idle.onStateChanged.addListener(async function(state){
    if (state === "active") {
        console.log("FLiK extension is active");

        // reload profile
        await reloadProfile();

        // if user is logged out, try login again.
        // const accountId = await utils.getAccountId();
    }
});

chrome.storage.onChanged.addListener(async function(changes, namespace) {
    // when login / logout
    if (changes["accountChangedFlag"] != undefined) {
        chrome.storage.local.get(["accountId", "accountName"], async function({ accountId, accountName }) {
            if (accountId) {
                console.log("user logged in.");
                setAccountId(accountId);
                setActionState(true, accountName);

                // check device is registered.
                getDevicesFromServer(async function(deviceArray) {
                    const profile = await getProfile();
                    const myDevice = profile.getMyDevice();
                    const myDeviceId = await utils.loadMyDeviceId();
                    const offlineMode = await utils.getOfflineFlag();
                    const device = deviceArray.find(device => device.deviceId === myDeviceId);

                    // check there exist the exactly matched device
                    if(!myDeviceId || !device || (myDeviceId && !offlineMode && device && !myDevice.checkDeviceExactlyMatched(device))) {
                        openSplash();
                        return;
                    }

                    // download profile
                    await syncProfile(myDevice.activeMode().name);

                    // get lock state
                    await updateLockState();
                })
			} else {
                setActionState(false);
                setAccountId(null);
                clearProfile();
            }

            // if config page is opened, reload it.
            reloadConfigPage();
        });
    }

    // when rule changed
    if (changes["flikRuleArray"] != undefined) {
        reloadProfile();
    }

    // receceived flik
    if (changes["flikReceivedFlag"] != undefined) {
        chrome.storage.local.get(["received_url", "received_slotIndex", "flik_sender_deviceId"], async({ received_url, received_slotIndex, flik_sender_deviceId }) => {
            const slotArray = await Slots.load();
            if(received_slotIndex < 0 || received_slotIndex >= slotArray.length) {
                return;
            }

            const slots = new Slots(slotArray);
            const slotNumber = parseInt(received_slotIndex + 1);
            const flikRule = Profile.analyzeTarget(slotNumber);

            const profile = await getProfile();
            const senderName = profile.getDeviceById(flik_sender_deviceId)?.title || "";
            flikRule.mode = `ReceivedFromDevice`;
            flikRule.label = `from '${senderName}'`;

            await slots.appendFromUrl(received_url, flikRule);
            increaseFlikCounter();
        });
    }

    // lock flag is changed
    if (changes["lockFlag"] != undefined) {
        const locked = changes["lockFlag"].newValue;
        if(!locked) {
            if (lockDeadlockCheckTimer != null) {
                clearTimeout(lockDeadlockCheckTimer);
                lockDeadlockCheckTimer = null
            }
        }
    }

    // lockedAt is changed
    if (changes["lockedAt"] != undefined) {
        const locked = await utils.getLockFlag();
        if(locked) {
            // start DeadlockCheck schedule
            startLockDeadlockCheck();
        }
    }
});

// analyze url
function getMatchedRule(url, profile) {
    const defaultSlot = profile.getMyDevice().defSlotNum;
    let flikRule = profile.analyzeUrl(url);
    if (!flikRule) {
        // check if default slot is defined.
        if (defaultSlot === 'off' || defaultSlot === 0) {
            return null;
        }

        flikRule = {
            slot: defaultSlot,
            banding: "Show & fade",
            label: 'default for none FLiK',
            color: DATA_Z.band_color,
            mode: "",
            rule: ""
        }
    }

    return flikRule;
}

// send Flik to server
async function sendFlikToServer(url, slotIndex, profile) {
    // convert slotIndex to internal index of target device
    const deviceId = profile.getContainerDevice(slotIndex);
    slotIndex = profile.convertInternalSlotIndex(deviceId, slotIndex);

    // sharing to server
    const res = await supabase_controller.insertQuery("shared_slots", {
        sender: profile.myDeviceId,
        receiver: deviceId,
        content: { url, slotIndex }
    })

    return (res.error == null);
}

////////////////// lock deadlock check //////////////////
var lockDeadlockCheckTimer = null;
function startLockDeadlockCheck() {
    if (lockDeadlockCheckTimer != null) {
        clearTimeout(lockDeadlockCheckTimer);
        lockDeadlockCheckTimer = null
    }

    lockDeadlockCheckTimer = setTimeout(async () => {
        await utils.setLockFlag(false);
        await utils.addLog(`  ${utils.getLocalTime()}, released lock myself automatically`);
    }, 1000 * 40);
}

chrome.system.display.onDisplayChanged.addListener(async function() {
    console.log("display configuration is changed.");

    // check monitor height is change a bit.(maybe taskbar height has changed a bit)
    const profile = await getProfile();
    const myDevice = profile.getMyDevice();

    let strResolusion = "";
    (await chrome.system.display.getInfo()).forEach((displayInfo) => {
        strResolusion += `(${displayInfo.workArea.width}x${displayInfo.workArea.height}), `;
    })
    await utils.addLog(`${utils.getLocalTime()}, monitor size ${strResolusion}`);

    const tinyChanged = await myDevice.checkTinyChanged();
    if(!tinyChanged) {
        setDisplayChanged();
    }
})

let displayChangeTimer = null;
async function setDisplayChanged() {
    if (displayChangeTimer != null) {
        clearTimeout(displayChangeTimer);
        displayChangeTimer = null;
    }

    displayChangeTimer = setTimeout(async () => {
        displayChangeTimer = null;

        const profile = await getProfile();
        const myDeviceId = profile.myDeviceId;
        const myDevice = profile.getMyDevice();

        const res = await myDevice.initializeMonitors();

        // update my device profile
        await profile.saveDeviceArray(async () => {
            // in the case of monitor add/removed, open splash
            if(res.isChanged) {
                closeConfigPage();
                openSplash();
                return;
            }

            // intialize slot array
            await Slots.initialize(myDevice.getMonitorInfoArray());

            // start lock
            await startLock("Monitor changed");

            // update monitor infos already exists
            const _now = utils.getUtcTime();
            for (const info of res.updated_infos) {
                info.updated_at = _now;
                info.modifier = myDeviceId;
                await supabase_controller.updateQuery("monitor_info", info, { deviceId: myDeviceId, monitorId: info.monitorId });
            }

            // end lock
            await endLock("Monitor change ended.");

            // update synced time
            myDevice.synced_at = utils.getLocalTime();
            await profile.saveDeviceArray(() => {
                // if config page is opened, reload it.
                reloadConfigPage();
            });
        });
    }, 1000);
}

// called when tab load ended, update slot`s url
chrome.tabs.onUpdated.addListener( function(tabId, changeInfo, tab) {
    if (changeInfo.status == "loading") {
        if (utils.isRestricedUrl(tab.url)) return true;
        // console.log("onUpdated: " + tab.url + " tabId:" + tabId);

        chrome.storage.local.get(["isEnable", "bandInfoArray", "showLabelInBand", "showRuleInBand", "showModeInBand", "showDomainInBand", "bandFontFamily"],
        async function({ isEnable, bandInfoArray, showLabelInBand, showRuleInBand, showModeInBand, showDomainInBand, bandFontFamily }) {
            if (!isEnable) return true;

            // get band info
            let bandInfo = {};
            const info = bandInfoArray?.find((info) => info.tabId === tabId) || null;
            if(info) {
                // this tab is already applied FLiK rule
                if (!info.flagToShow) return true;

                await utils.releaseBandInfo(tabId);
                bandInfo = info.bandInfo;
            } else {
                const profile = await getProfile();
                const flikRule = await getMatchedRule(tab.url, profile);
                if (!flikRule) return true;

                // if rule is not local, ignore it.
                const slots = new Slots(await Slots.load());
                const slotIndex = parseInt(flikRule.slot - 1);
                if (slotIndex >= slots.slotArray.length) {
                    await sendFlikToServer(tab.url, slotIndex, profile);

                    // remove tab from my device
                    await chrome.tabs.remove(tabId);
                    return true;
                }

                // this code prevent tab is multiple fliked.
                bandInfo = await utils.setBandInfo(tabId, flikRule, false);

                // apply FLik
                slots.appendFromTab(tabId, flikRule, () => {
                    increaseFlikCounter();
                });

                // show notify popup
                var param = {};
                param[flikRule.slot] = 1;
                await showNotifyPopup(profile, param);
            }

            // insert band
            const configs = { showLabelInBand, showRuleInBand, showModeInBand, showDomainInBand, bandFontFamily };
            setTimeout(() => {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: utils.insertBand,
                    args: [bandInfo, configs]
                })
            }, 500);
        });
    }

    return true;
});

// called when tab is closed
chrome.tabs.onRemoved.addListener(async function(tabId, removeInfo) {
    await utils.removeBandInfo(tabId)
});

// called when windows focus changed.
chrome.windows.onFocusChanged.addListener(function(windowId) {
    Slots.load().then((array) => {
        let slots = new Slots(array);
        slots.moveTop(windowId, (ret) => {
            // console.log("onFocusChanged : " + windowId + ", moveTop is " + ret);
        })
    });

    return true;
}, { windowTypes: ['normal'] })

// called when window closed
chrome.windows.onRemoved.addListener(function(windowId) {
    Slots.load().then((array) => {
        let slots = new Slots(array);
        slots.remove(windowId, (ret) => {
            // console.log("onRemoved : " + windowId + ", remove is " + ret);
        })
    });

    return true;
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.action) {
        // sync flik rules with server
        case "updateLockState" : {
            updateLockState(function(res) {
                sendResponse(res);
            })

            return true;
        }

        // get Url included slot
        case "getEmbededUrl": {
            Slots.load().then((array) => {
                let slots = new Slots(array);
                let slot = slots.slotArray[parseInt(request.slotIndex)];
                if (!slot.isEmpty()) {
                    chrome.tabs.query({ active: true, windowId: slot.top() }, tabs => {
                        sendResponse({ url: tabs[0].url });

                    })
                    return true;
                } else {
                    sendResponse({ url: "" });
                }
            });

            return true;
        }

        // analyze url and open slot
        case "openWithRule": {
            getProfile().then(async (profile) => {
                const slots = new Slots(await Slots.load());
                const slotIndex = parseInt(request.rule.slot - 1);
                let res = false;

                if (slotIndex < slots.slotArray.length) {
                    await slots.appendFromUrl(request.url, request.rule);
                    increaseFlikCounter();
                    res = true;
                } else {
                    res = await sendFlikToServer(request.url, slotIndex, profile);
                }

                sendResponse(res);
            });

            return true;
        }

        // open Url in the slot
        case "openInSlot": {
            getProfile().then(async (profile) => {
                const slots = new Slots(await Slots.load());
                const slotIndex = parseInt(request.slot - 1);
                let res = false;

                if (slotIndex < slots.slotArray.length) {
                    const flikRule = Profile.analyzeTarget(request.slot);
                    res = await slots.appendFromUrl(request.url, flikRule);
                } else {
                    res = await sendFlikToServer(request.url, slotIndex, profile);
                }

                increaseFlikCounter();
                sendResponse(true);
            });

            return true;
        }

        // open Url To Portal
        case "openToPortal": {
            openToPortal(request.url, request.receipient, function(respone) {
                sendResponse(respone);
            });

            return true;
        }

        // close all the windows in the slot
        case "closeSlot": {
            Slots.load().then((array) => {
                let slots = new Slots(array);
                slots.close(parseInt(request.slotIndex), () => {
                    sendResponse();
                });
            });

            return true;
        }

        // close all slots in the monitor
        case "closeMonitor": {
            Slots.load().then((array) => {
                let slots = new Slots(array);
                slots.closeMonitor(parseInt(request.monitorIdx), () => {
                    sendResponse();
                });
            });

            return true;
        }

        // swap two tabs`s content
        case "swapSlots": {
            Slots.load().then((array) => {
                const slots = new Slots(array);
                const slotIndex1 = parseInt(request.slotIndex1);
                const slotIndex2 = parseInt(request.slotIndex2);

                if(slotIndex1 < slots.slotArray.length && slotIndex2 < slots.slotArray.length) {
                    slots.swap(slotIndex1, slotIndex2, () => {
                        increaseFlikCounter();
                        sendResponse();
                    });
                } else {
                    sendResponse();
                }
            });

            return true;
        }

        // sync orphaned window to slots
        case "syncOrphanedWnd": {
            syncSlotsbyWindow(() => {
                sendResponse();
            });

            return true;
        }

        // sync orphaned tab to slots (sync all)
        case "syncOrphanedTab": {
            syncSlotsbyTab(() => {
                sendResponse();
            });

            return true;
        }

        // update tab`s contents and postion according slot
        case "increaseFlikCounter": {
            increaseFlikCounter();
            return true;
        }

        // for develping
        case "initProfile": {
            initProfile((res) => {
                sendResponse(res);
            });

            return true;
        }

        // sync profile(keep mydevice data)
        case "syncProfile": {
            syncProfile(request.modeName, (res) => {
                sendResponse(res);
            });

            return true;
        }

        // clear profile
        case "unregisterDevice": {
            unregisterDevice(function(res) {
                sendResponse(res);
            });

            return true;
        }

        // remove device on Option page
        case "removeDevice": {
            removeDeviceFromServer(request.deviceId, request.changedDeviceIds, function(res) {
                sendResponse(res);
            });

            return true;
        }

        // clean devices of server
        case "clearServer": {
            clearServer(function(res) {
                sendResponse(res);
            });

            return true;
        }

        // gather windows
        case "gather": {
            gather((res) => {
                sendResponse(res);
            });

            return true;
        }

        // login from token
        case "logInFromToken": {
            loginFromToken(request.access_token, request.refresh_token, request.password, request.enduser_id, function(response) {
                sendResponse(response);
            });

            return true;
        }

        // login into FliK server.
        case "logIn": {
            login(request.name, request.password, function(response) {
                sendResponse(response);
            });

            return true;
        }

        case "logOut": {
            logout(function(result) {
                sendResponse(result);
            });

            return true;
        }

        case "signUp": {
            signUp(request.info, function(user, err) {
                sendResponse({ user, err });
            })
            return true;
        }

        // get FliK users
        case "sendingPacket": {
            sendingPacketToUsers(request.receivers, request.data, function(err) {
                sendResponse({ err });
            });

            return true;
        }

        case "getUserProfile": {
            getUserProfile(request.uuid, function(res) {
                sendResponse(res);
            });

            return true;
        }

        case "saveUserProfile": {
            saveUserProfile(request.profile, function(res) {
                sendResponse(res);
            });
            return true;
        }

        case "reset_password": {
            resetPassword(request.email, request.redirect, function(res) {
                sendResponse(res);
            });

            return true;
        }

        // download device list from server
        case "getDevicesFromServer" : {
            getDevicesFromServer(function(res) {
                sendResponse(res);
            })

            return true;
        }

        // when profile changed(device or rule) in option page
        case "profileChanged": {
            getAccountId().then(async (accountId) => {
                if(accountId) {
                    // start lock
                    await startLock(request.note);

                    // update profile object
                    await reloadProfile();

                    // set device layout changed flag
                    setProfileChangeTimer();
                }

                sendResponse();
            })

            return true;
        }

        // when clicked "sync now" in option page
        case "syncNow": {
            getAccountId().then(async (accountId) => {
                if(accountId) {
                    if (profileChangeTimer != null) {
                        clearTimeout(profileChangeTimer);
                        profileChangeTimer = null;
                    }

                    // stop pending time schdule
                    await utils.setPendingTime(0);

                    await syncNow(accountId, request.note);
                }

                sendResponse();
            })

            return true;
        }

    }

    return true;
});

/// update lock state
async function updateLockState(callback = null) {
    const {locked, lockerId, note} = await getLockState();
    await utils.setEditLocker(lockerId, note);
    await utils.setLockFlag(locked);

    if(locked) {
        const profile = await getProfile();
        await utils.addLog(`  ${utils.getLocalTime()}, locked by ${profile.getDeviceById(lockerId).title} : ${note}`);
    } else {
        await utils.addLog(`  ${utils.getLocalTime()}, released lock : ${note}`);
    }

    if(callback) {
        callback(locked);
    }
}

// sync device & rule with server
async function syncNow(accountId, strDescription = "timecounter automatically") {
    await utils.addLog(`${utils.getLocalTime()}, synced due to ${strDescription}`);

    // update profile object
    const profile = await reloadProfile();

    if (profileChangeTimer != null) {
        clearTimeout(profileChangeTimer);
        profileChangeTimer = null;
    }

    // upload changed device to server
    await uploadDevices(accountId, null, profile);
    await profile.saveDeviceArray();

    // update rule to server
    await uploadRule(accountId);
    // await profile.saveFlikRule();

    // end lock
    await endLock("sync profile ended");
}

////////////////// upload device to server 30 sec after last action //////
var profileChangeTimer = null;
async function setProfileChangeTimer() {
    if (profileChangeTimer != null) {
        clearTimeout(profileChangeTimer);
    }

    profileChangeTimer = setTimeout(async () => {
        const accountId = await getAccountId();
        if(accountId) {
            syncNow(accountId);
        } else {
            profileChangeTimer = null;
        }
    }, 30000);
}

// replace server rules with local rules ( upload local data and remove deleted rules from server )
async function uploadRule(accountId) {
    // get rules from server
    let response = await supabase_controller.selectQuery("flik_rule", { user_id: accountId }, "*", "order_num");
    if(!response.error) {
        const serverRules = response.data;

        // merge server rules to local rules
        const profile = await reloadProfile();
        profile.mergeRules(serverRules);

        // remove deleted rules from server
        for(const serverRule of serverRules) {
            if(profile.flikRuleArray.findIndex((e) => e.url == serverRule.url) < 0) {
                await supabase_controller.deleteQuery("flik_rule", { id: serverRule.id });
            }
        }

        // compare server rules and new rules, so we can decide the rules need to be inserted, updated
        updateServerRules(serverRules, profile, accountId);
    }
}

// add local rules to server and update local rules with server data
async function syncRule(accountId) {
    // get rules from server
    let response = await supabase_controller.selectQuery("flik_rule", { user_id: accountId }, "*", "order_num");
    if(!response.error) {
        // merge local rules to server rules
        const serverRules = response.data;

        const profile = await getProfile();
        const oldRules = profile.flikRuleArray;
        profile.mergeRules(serverRules, ">>");

        // add old local rules to new rules
        for(const localRule of oldRules) {
            profile.addRule(localRule, profile.myDevice);
        }

        // compare server rules and new rules, so we can decide the rules need to be inserted, updated
        updateServerRules(serverRules, profile, accountId);
    }
}

// compare server rules and new rules, so we can decide the rules need to be inserted, updated
async function updateServerRules(serverRules, profile, accountId) {
    await profile.saveFlikRule();

    // upload new rule to server
    profile.flikRuleArray.forEach(async (newRule, index) => {
        const serverRule = serverRules.find((e) => e.url == newRule.url);
        if(serverRule) {
            if(index+ 1 !== serverRule.order_num || !FlikRule.compareRule(newRule, serverRule)) {
                // update
                await supabase_controller.updateQuery("flik_rule",
                    { ...newRule, order_num: index+ 1, modifier: profile.myDeviceId },
                    { id: serverRule.id }
                );
            }
        } else {
            // insert
            await supabase_controller.insertQuery("flik_rule",
                { ...newRule, order_num: index+ 1, modifier: profile.myDeviceId, user_id: accountId },
            );
        }
    })
}

// send flik via portal
async function openToPortal(url, receipient, callback=0) {
    let receip_UUID = await supabase_controller.getUserIDByName(receipient);
    const accountId = await getAccountId();
    if(receip_UUID != "none") {
        let res = await supabase_controller.insertQuery("flik", {
            sender: accountId,
            receiver: receip_UUID,
            datatype:1,
            data: { anchorUrl: url}
        });
        if (callback) callback(res.error);
    } else {
        if (callback) callback("UUID isn't vaild!");
    }
}

////////////////////// Functions //////////////////////////////
async function resetPassword(email, redirect_url, callback) {
    const respone = await supabase_controller.resetPassword(email, "http://localhost:8000/showReset");
    if (callback) callback(respone);
}

async function saveUserProfile(profile, callback) {
    const respone = await supabase_controller.saveUserProfile(profile);
    if (callback) callback(respone);
}

async function getUserProfile(uuid, callback) {
    const respone = await supabase_controller.getUserProfile(uuid);
    if (callback) callback(respone);
}

async function login(email, password, callback) {
    await utils.savePwd(password);
    const { data, error } = await supabase_controller.signIn(email, password);
    // const { session, user } = data;

    if (callback) {
        callback({ data, error });
    }
}

async function loginFromToken(accessToken, refreshToken, password, enduser_id, callback) {
    await utils.savePwd(password);
    const response = await supabase_controller.signInFromToken(accessToken, refreshToken);

    if (!response.error) {
        const response1 = await supabase_controller.updateQuery("enduser", { status: true }, { id: enduser_id });
        if (response1.error){
            console.log(enduser_id, "error while updating enduser_id:", response1.error);
        }

        if (callback) {
            callback(response1.error);
        }
    } else {
        if (callback) {
            callback(response.data);
        }
    }
}

async function logout(callback) {
    let result = await supabase_controller.signOut();
    if (callback) {
        callback(result);
    }
}

async function signUp(userInfo, callback) {
    const { data, error } = await supabase_controller.signUp(userInfo.username, userInfo.email, userInfo.password);
    const { session, user } = data;

    if (callback) callback({
        user: user,
        error: error
    });
}

// try to loging using the saved credential. if failed, init profile using local data
async function tryLogin() {
    chrome.action.disable();

    // get google account
    // const googleUserInfo = await chrome.identity.getProfileUserInfo();
    // console.log('google user info: ' + googleUserInfo);

    // load account info from local storage
    const accountInfo = await utils.getAccountInfo();
    const email = accountInfo.accountEmail;
    const pwd = accountInfo.accountPassword;
    if (email && pwd) {
        login(email, pwd, async function(response) {
            if (response.error) {
                openSplash();
            }
        });
    } else {
        const myDeviceId = await utils.loadMyDeviceId();
        const offlineMode = await utils.getOfflineFlag();
        if(!myDeviceId || (myDeviceId && !offlineMode)) {
            openSplash();
        }
    }

    chrome.action.enable();
}

async function sendingPacketToUsers(receiver, data, callback) {
    const error = await supabase_controller.sendPacketToUsers(receiver, data);
    if (callback) callback(error);
}

// if config page is opened, reload it.
function reloadConfigPage(forceOpen = false) {
    const baseUrl = chrome.runtime.getURL(`/html/options.html`);
    chrome.tabs.query({}, async function(tabs) {
        for (const tab of tabs) {
            if (tab.url.startsWith(baseUrl)) {
                await chrome.tabs.reload(tab.id);
                return;
            }
        }
    });

    if(forceOpen) {
        chrome.runtime.openOptionsPage();
    }
}

// if config page is opened, close it.
function closeConfigPage() {
    const baseUrl = chrome.runtime.getURL(`/html/options.html`);
    chrome.tabs.query({}, async function(tabs) {
        for (const tab of tabs) {
            if (tab.url.startsWith(baseUrl)) {
                chrome.tabs.remove(tab.id);
                return;
            }
        }
    });
}

//////////////////////////////////////////////////////////////////
// create information variables with default values.
async function createProfile(callback = null) {
    // create profile
    await Profile.create();
    const profile = await reloadProfile();
    const myDevice = profile.getMyDevice();

    // intialize slot array
    await Slots.initialize(myDevice.getMonitorInfoArray());

    // initialize Band Information.
    await utils.clearBandInfo();

    // clear Information.
    await utils.clearNotifyWindowInfo();

    if(callback) callback(true);
}

// init profile( check with physical monitors )
async function initProfile(callback = null) {
    // init profile( comapre the profile with real device and update it )
    const profile = await reloadProfile();
    const myDevice = profile.getMyDevice();
    await profile.initialize();

    // intialize slot array
    await Slots.initialize(myDevice.getMonitorInfoArray());

    // initialize Band Information.
    await utils.clearBandInfo();

    // clear Information.
    await utils.clearNotifyWindowInfo();

    if(callback) callback(true);
}

// sync local profile with server
async function syncProfile(modeName, callback = null) {
    const accountId = await getAccountId();
    if(!accountId) {
        if(callback) callback(false);
        return;
    }

    const profile = await reloadProfile();
    const myDeviceId = profile.myDeviceId;
    const myDevice = profile.getMyDevice();
    myDevice.synced_at = utils.getLocalTime();

    // set server hook
    supabase_controller.startPacketHook(accountId, myDeviceId);

    // download all devices and update my device with local
    const deviceIsChanged = await downloadDevices(accountId, profile, modeName);

    // upload myDevice and monitor data to server
    if(deviceIsChanged) {
        await uploadDevices(accountId, myDeviceId, profile);

        // reload and init slotArray
        await Slots.initialize(myDevice.getMonitorInfoArray());
    }

    // save data
    await profile.saveDeviceArray();

    // upload my flik rule to server
    await syncRule(accountId);

    if(callback) callback(true);
}

// clean local profile and server ( for dev )
async function unregisterDevice(callback = null) {
    const profile = await getProfile();
    const myDeviceId = profile.myDeviceId;

    // keep only my device
    const changedIds = await Profile.unregister();

    // start lock
    await startLock("Unregister Device");

    // remove me from server.
    const response = await supabase_controller.deleteQuery("device_info", { deviceId: myDeviceId });
    if(!response.error){
        await supabase_controller.deleteQuery("monitor_info", { deviceId: myDeviceId });
    }

    // update changed devices
    if(changedIds.length > 0) {
        changedIds.forEach(async (deviceId) => {
            const device = profile.getDeviceById(deviceId);
            await supabase_controller.updateQuery("device_info",
                { modes: device.modes, modifier: myDeviceId, updated_at: utils.getUtcTime() },
                { deviceId }
            );
        })
    }

    // end lock
    await endLock("Unregister Device ended");

    await reloadProfile();

    if(callback) callback(true);
}

// remain only my device in devices
async function clearProfile() {
    // keep only my device
    await Profile.clean();

    // reload profile
    await reloadProfile();
}

// remove all devices of my account on the server
async function clearServer(callback = null) {
    const accountId = await utils.getAccountId();
    if(!accountId) {
        if(callback) callback(false);
        return;
    }

    // remove all monitor informations
    let response = await supabase_controller.selectQuery("device_info", { user_id: accountId }, "*");
    if(!response.error) {
        for (const row of response.data) {
            await supabase_controller.deleteQuery("monitor_info", { deviceId: row.deviceId });
        }
    }

    // remove device info
    response = await supabase_controller.deleteQuery("device_info", { user_id: accountId });

    if(callback) callback(response);
}

// upload device and monitor data to server
async function uploadDevices(accountId, deviceId, profile) {
    const filter = { user_id: accountId };
    if (deviceId !== null) {
        filter.deviceId = deviceId;
    }

    // get server data
    const response = await supabase_controller.selectQuery("device_info", filter, "*");
    if (!response.error) {
        const serverDatas = response.data;
        for (const device of profile.deviceArray) {
            if(deviceId !== null) {
                if (device.deviceId != deviceId) {
                    continue;
                }
            }

            // upload device to server
            const deviceInfo = device.exportDeviceInfo();
            deviceInfo.modifier = profile.myDeviceId;
            deviceInfo.updated_at = utils.getUtcTime();

            const serverData = serverDatas.find(row => row.deviceId == device.deviceId);
            if(serverData) {
                if(!Device.compareDeviceInfo(deviceInfo, serverData)) {
                    // update
                    await supabase_controller.updateQuery("device_info", deviceInfo, { id: serverData.id });
                }
            } else {
                // insert
                deviceInfo.user_id = accountId;
                await supabase_controller.insertQuery("device_info", deviceInfo);
            }
            device.updated_at = utils.getUtcTime();
            device.synced_at = utils.getLocalTime();

            // upload monitor data to server
            const response1 = await supabase_controller.selectQuery("monitor_info", { deviceId: device.deviceId }, "*", "monitorIdx");
            if (!response1.error) {
                let serverMonitors = []
                if (response1.data.length > 0) {
                    serverMonitors = response1.data;
                }

                const compareInfo = device.analyzeMonitorChange(serverMonitors);

                // insert monitor infos newly
                for (const info of compareInfo.insert_infos) {
                    info.deviceId = device.deviceId;
                    info.modifier = profile.myDeviceId;
                    info.updated_at = utils.getUtcTime();
                    await supabase_controller.insertQuery("monitor_info", info);

                    device.setUpdateTimeOfMonitor(info.monitorId, utils.getLocalTime());
                }

                // update monitor infos already exists
                for (const info of compareInfo.updated_infos) {
                    info.modifier = profile.myDeviceId;
                    info.updated_at = utils.getUtcTime();
                    await supabase_controller.updateQuery("monitor_info", info, { deviceId: device.deviceId, monitorIdx: info.monitorIdx });

                    device.setUpdateTimeOfMonitor(info.monitorId, utils.getLocalTime());
                }

                // remove monitors no-exist in my device
                for (const monitorId of compareInfo.delete_ids) {
                    await supabase_controller.deleteQuery("monitor_info", { deviceId: device.deviceId, monitorId });
                }
            }
        }
    }
}

// only download device array from server, not update local profile
async function getDevicesFromServer(callback = null) {
    const accountId = await utils.getAccountId();
    if(!accountId) {
        if(callback) callback([]);
        return;
    }

    const response = await supabase_controller.selectQuery("device_info", { user_id: accountId }, "*");
    if(!response.error) {
        let data = [];
        for (const row of response.data) {
            const response1 = await supabase_controller.selectQuery("monitor_info", { deviceId: row.deviceId }, "*", "monitorIdx");
            row.monitorInfoArray = [];
            if (!response1.error) {
                for (const row1 of response1.data) {
                    row.monitorInfoArray.push(row1)
                }
            }
            data.push(row);
        }

        if(callback) callback(data);
    } else {
        if(callback) callback([]);
    }
}

// download devices and update mode with my device
async function downloadDevices(accountId, profile, modeName) {
    // get device and monitor infors from server
    let changed = false;
    const response = await supabase_controller.selectQuery("device_info", { user_id: accountId }, "*");
    if(!response.error) {
        if(!response.data.find(row => row.deviceId == profile.myDeviceId)) {
            // if new device
            // const myDevice = profile.getMyDevice();
            // myDevice.renameActiveMode(modeName);
            changed = true;
        }

        for (const row of response.data) {
            row.synced_at = utils.getLocalTime();
            const response1 = await supabase_controller.selectQuery("monitor_info", { deviceId: row.deviceId }, "*", "monitorIdx");
            if (!response1.error) {
                if(profile.addDeviceAndMonitors(row, response1.data, modeName)){
                    changed = true;
                }
            }
        }
    }

    return changed;
}

// remove device and monitors from server
async function removeDeviceFromServer(removedId, changedIds, callback = null) {
    // start lock
    await startLock("RemoveDevice by Server");

    // remove device from server
    const response = await supabase_controller.deleteQuery("device_info", { deviceId: removedId });
    if(!response.error){
        await supabase_controller.deleteQuery("monitor_info", { deviceId: removedId });
    }

    // update changed devices
    if(changedIds.length > 0) {
        const profile = await reloadProfile();
        changedIds.forEach(async (deviceId) => {
            const device = profile.getDeviceById(deviceId);
            await supabase_controller.updateQuery("device_info",
                { modes: device.modes, modifier: profile.myDeviceId, updated_at: utils.getUtcTime() },
                { deviceId }
            );
        })
    }

    // end lock
    await endLock("Remove by Server ended");

    if(callback) callback(response);
}

// set action Icon state
function setActionState(state, name = null) {
    if (!state) {
        chrome.action.setBadgeBackgroundColor({ color: [0, 200, 0, 255] }, );
        chrome.action.setBadgeTextColor({ color: [0, 0, 255, 255] }, )
        chrome.action.setBadgeText({ text: "?" });
    } else {
        chrome.action.setBadgeBackgroundColor({ color: [255, 255, 255, 255] }, );
        chrome.action.setBadgeTextColor({ color: [255, 0, 0, 255] }, )
        chrome.action.setBadgeText({ text: name.substr(0, 1).toUpperCase() || "-" });
    }
}

// increase FLiK usage counter
async function increaseFlikCounter() {
    let res = await chrome.storage.local.get(["fliks"]);
    return await chrome.storage.local.set({ fliks: res.fliks + 1 });
}

// Installing content script in all tabs.
function installScript() {
    let params = {};
    chrome.tabs.query(params, function(tabs) {
        let contentjsFiles = chrome.runtime.getManifest().content_scripts[0].js;
        tabs.forEach(tab => {
            if (!utils.isRestricedUrl(tab.url)) {
                contentjsFiles.forEach(contentjsFile => {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: [contentjsFile]
                    }, () => {
                        const lastErr = chrome.runtime.lastError;
                        if (lastErr) {
                            console.log('tab: ' + tab.id + ' lastError: ' + JSON.stringify(lastErr));
                        }
                    })
                })
            }
        });
    });
}

// sync all slots per window
function syncSlotsbyWindow(callbackFunction = 0) {
    chrome.storage.local.get(["slotArray", "isTraining", "myDeviceId"], async function({ slotArray, isTraining, myDeviceId }) {
        let slots = new Slots(slotArray);
        if (slots.slotArray.length == 0) return true;

        const profile = await getProfile();

        // close all popups.
        await utils.closeAllPopups();

        let windows = await chrome.windows.getAll({ populate: true });
        let syncedSlots = {};
        for (let iWnd = 0; iWnd < windows.length; iWnd++) {
            let window = windows[iWnd];
            let windowId = window.id;
            let bandInfo = {};
            let flikRule = null;

            let tabs = window.tabs;
            if (tabs.length > 1) {
                tabs = await chrome.tabs.query({ active: true, windowId: windowId });
            }
            let activeTab = tabs[0];
            if (!activeTab) continue;

            // check if window is already tied to a slot
            let slotIndex = slots.getSlotIndex(windowId);

            let flikMode = '';
            if (slotIndex !== -1) {
                await slots.appendFromWindow(windowId, { slot: slotIndex + 1 })
                flikMode = 'Tied';
            } else {
                if (window.tabs.length == 1) { // check solo tab, if solo then process flik
                    flikRule = profile.analyzeUrl(activeTab.url, { checkFliked: false });

                    if (!flikRule) {
                        if (utils.isRestricedUrl(activeTab.url)) continue;
                        slotIndex = slots.analyzePosition(myDeviceId, { left: window.left, top: window.top, width: window.width, height: window.height });
                        flikMode = 'Position';
                    }
                    await slots.appendFromTab(activeTab.id, flikRule ? flikRule : { slot: slotIndex + 1, handling: "Auto" });
                } else {
                    if (utils.isRestricedUrl(activeTab.url)) continue;
                    let slotIndex = slots.analyzePosition(myDeviceId, { left: window.left, top: window.top, width: window.width, height: window.height });
                    await slots.appendFromWindow(windowId, { slot: slotIndex + 1 })
                    flikMode = 'Position';
                }
            }

            // fill the synced slots
            const syncedSlot = flikRule ? flikRule.slot : slotIndex + 1;
            syncedSlots[syncedSlot] = (syncedSlots[syncedSlot] || 0) + 1;

            // show bandInfo
            if (slotIndex != -1 && isTraining) {
                if (flikRule) {
                    bandInfo = { slot: flikRule.slot, banding: flikRule.banding, label: flikRule.label, color: flikRule.color, mode: flikRule.mode, rule: flikRule.rule }
                } else {
                    bandInfo = { slot: slotIndex + 1, banding: "Show & fade", label: "Synced", color: DATA_Z.band_color, mode: flikMode, rule: "slot" + (slotIndex + 1) }
                }

                chrome.tabs.sendMessage(activeTab.id, {
                    action: "showBand",
                    bandInfo: bandInfo
                }, () => {
                    let lastError = chrome.runtime.lastError;
                    if (lastError) {
                        console.log(lastError.message);
                    }
                })
            }
        }

        // check if any Sync is occured
        if (Object.keys(syncedSlots).length > 0) {
            await increaseFlikCounter();
            await showNotifyPopup(profile, syncedSlots);
        }

        if (callbackFunction) {
            callbackFunction();
        }
    });
}

// sync all slots per tab
function syncSlotsbyTab(callbackFunction = 0) {
    chrome.storage.local.get(["slotArray", "isTraining", "myDeviceId"], async function({ slotArray, isTraining, myDeviceId }) {
        let slots = new Slots(slotArray);
        if (slots.slotArray.length == 0) return true;

        const profile = await getProfile()

        // close all popups.
        await utils.closeAllPopups();

        slots.empty(); // empty all slots
        let windows = await chrome.windows.getAll({ populate: true, windowTypes: ['normal'] });
        let syncedSlots = {};
        for (const window of windows) {
            let bandInfo = {};
            let flikRule = null;
            let slotIndex = -1;
            let flikMode = '';

            for (const tab of window.tabs) {
                flikRule = profile.analyzeUrl(tab.url, { checkFliked: false });
                if (!flikRule) {
                    if (utils.isRestricedUrl(tab.url)) continue;
                    slotIndex = slots.analyzePosition(myDeviceId, { left: window.left, top: window.top, width: window.width, height: window.height });
                    if (slotIndex === -1) continue;
                    flikMode = 'Position';
                }

                await slots.appendFromTab(tab.id, flikRule ? flikRule : { slot: slotIndex + 1, handling: "Auto" });

                // fill the synced slots
                const syncedSlot = flikRule ? flikRule.slot : slotIndex + 1;
                syncedSlots[syncedSlot] = (syncedSlots[syncedSlot] || 0) + 1;

                // show bandInfo
                if (isTraining) {
                    if (flikRule) {
                        bandInfo = { slot: flikRule.slot, banding: flikRule.banding, label: flikRule.label, color: flikRule.color, mode: flikRule.mode, rule: flikRule.rule }
                    } else {
                        bandInfo = { slot: slotIndex + 1, banding: "Show & fade", label: "Synced", color: DATA_Z.band_color, mode: flikMode, rule: "slot" + (slotIndex + 1) }
                    }

                    chrome.tabs.sendMessage(tab.id, {
                        action: "showBand",
                        bandInfo: bandInfo
                    }, () => {
                        let lastError = chrome.runtime.lastError;
                        if (lastError) {
                            console.log(lastError.message);
                        }
                    })
                }
            }
        }

        // check if any Sync is occured
        if (Object.keys(syncedSlots).length > 0) {
            await increaseFlikCounter();
            await showNotifyPopup(profile, syncedSlots);
        }

        if (callbackFunction) {
            callbackFunction();
        }
    });
}

// show notification popup. @param slot = { slot: assignedCount }
async function showNotifyPopup(profile, syncedSlots = {}) {
    // reset the width and height of notify popup.
    let { notifyWndLeftPos, notifyWndTopPos } = await chrome.storage.local.get(['notifyWndLeftPos', 'notifyWndTopPos']);

    // close the notify popup if it is already opened.
    const baseUrl = chrome.runtime.getURL(`/html/notify.html`);
    const tabs = await chrome.tabs.query({ windowType: 'popup' });
    for (const tab of tabs) {
        if (tab.url.startsWith(baseUrl)) {
            await chrome.windows.remove(tab.windowId);
            break;
        }
    }

    let left = notifyWndLeftPos;
    let top = notifyWndTopPos;

    // set the position of notify popup
    if (left === null || left === undefined) {
        left = 100;
        top = 100;
        await chrome.storage.local.set({ notifyWndLeftPos: left, notifyWndTopPos: top });
    }

    // create popup.
    const tab = await chrome.tabs.create({
        url: `${baseUrl}?slot=${JSON.stringify(syncedSlots)}`,
        active: false
    });

    await chrome.windows.create({ tabId: tab.id, type: 'popup', left, top, width: 620, height: 340, focused: true });
    //await chrome.windows.update(window.id, { state: "normal", focused: true, left: 0, top: 0, width: 0, height: 0 });
}

// gather all tabs into the primary monitor
async function gather(callbackFunction = 0) {
    // get current window and move it into the primary window.
    const mainWindow = await chrome.windows.getCurrent();
    var displayInfoArray = await chrome.system.display.getInfo();
    let width, height;
    for (const displayInfo of displayInfoArray) {
        if (displayInfo.isPrimary) {
            width = displayInfo.workArea.width
            height = displayInfo.workArea.height
            break;
        }
    }
    await chrome.windows.update(mainWindow.id, { left: 0, top: 0, width: width, height: height });

    // close all popups.
    await utils.closeAllPopups();

    // empty slots
    let slotArray = await Slots.load();
    let slots = new Slots(slotArray);
    slots.empty();
    await slots.save();

    // move tabs
    let ret = true;
    let windows = await chrome.windows.getAll({ populate: true, windowTypes: ['normal'] });
    try {
        for (const window of windows) {
            if (window.id !== mainWindow.id) {
                for (const tab of window.tabs) {
                    await chrome.tabs.move(tab.id, { windowId: mainWindow.id, index: -1 });
                }
            }
        }
    } catch (error) {
        console.log(error);
        ret = false;
    }

    if (callbackFunction) callbackFunction(ret);
}

// open splash
async function openSplash() {
    const baseUrl = chrome.runtime.getURL(`/html/splash.html`);
    chrome.tabs.query({}, async function (tabs) {
        for (const tab of tabs) {
            if (tab.url.startsWith(baseUrl)) {
                await chrome.tabs.reload(tab.id);
                await chrome.tabs.update(tab.id, { active: true });
                return;
            }
        }

        // if current tab is new tab, open splash in current tab. else open in new tab
        chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
            const currentTab = tabs[0];
            if (currentTab && (currentTab.url === 'chrome://newtab/' || currentTab.url === 'about:blank')) {
                await chrome.tabs.update(currentTab.id, { url: `${baseUrl}` });
            } else {
                await chrome.tabs.create({ url: `${baseUrl}`, active: true });
            }
        });
    });
}

// start lock
async function startLock(strDescription) {
    // save log
    await utils.addLog(`${utils.getLocalTime()}, lock due to ${strDescription}`);

    await setLockState(true, strDescription);

    // start count down schedule
    await utils.setPendingTime();
}

// end lock
async function endLock(strDescription) {
    // save log
    await utils.addLog(`${utils.getLocalTime()}, release lock due to ${strDescription}`);

    await setLockState(false, strDescription);

    // stop count down schedule
    await utils.setPendingTime(0);
}

// set user state to server
async function setLockState(lockFlag, note = '') {
    const accountId = await getAccountId();
    if(!accountId) {
        return false;
    }

    const profile = await getProfile();
    const myDeviceId = profile.myDeviceId;
    const info = {
        user_id: accountId,
        status: lockFlag? 1 : 0,
        modifier: myDeviceId,
        note: note,
        updated_at: utils.getUtcTime(),
    }

    let response = await supabase_controller.selectQuery("user_status", { user_id: accountId }, "*");
    if (response.data.length > 0) {
        const data = response.data[0];
        await supabase_controller.updateQuery("user_status", info, { id: data.id });
    } else {
        await supabase_controller.insertQuery("user_status", info);
    }

    return true;
}

// get user state from server
async function getLockState() {
    const accountId = await getAccountId();
    const lockState = { locked: false, lockerId : "", note: "" }
    if(!accountId) {
        lockState;
    }
    const profile = await getProfile();
    const myDeviceId = profile.myDeviceId;

    try{
        let response = await supabase_controller.selectQuery("user_status", { user_id: accountId }, "*");
        if (response.data.length > 0) {
            const data = response.data[0];
            return {
                locked: (data.modifier != myDeviceId && data.status === 1),
                lockerId : data.modifier,
                note : data.note,
            };
        } else {
            return lockState;
        }
    } catch(error) {
        return lockState;
    }
}
