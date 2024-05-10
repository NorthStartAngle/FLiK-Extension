/**
 * written by Jin YC  2022.11.05
 */

// module variables
var md_config, md_utils, md_profile, md_slot;

const flikCount = document.querySelector("#flikCount");
const version = document.querySelector("#version");
var profile, slots, myDeviceId, myDevice;
var swpSlot1 = -1;
var swpSlot2 = -1;
var swapState = 0; // 0 : no select, 1 : select first, 2 : select second
var findWindowOption = "first";
var bodyWidth = 0;

function getVersion(callback) {
    var manifest = new XMLHttpRequest();
    manifest.open("get", "/manifest.json", true);
    manifest.onreadystatechange = function(e) {
        if (manifest.readyState == 4) {
            callback("v" + JSON.parse(manifest.responseText).version);
        }
    }
    manifest.send({});
}

function gotoVideoTutorial() {
    window.open(md_config.DATA_Z.tutorialVideoUrl);
}

function gotoOverview() {
    window.open(md_config.DATA_Z.OverviewUrl);
}

// draw monitor layouts
function drawMonitorLayout() {
    // render preview
    const res = profile.drawLayout({ caller: "popup" }, { dottedFlag: 1, showCloseFlag: 1, dragFlag: 1 });
    const portalWidth = 0;

    let body_width = parseInt(res.width) + 40 + portalWidth;
    if (body_width < 520) body_width = 520;
    if (body_width > 800) body_width = 800;

    bodyWidth = body_width;

    const previewLayout = document.getElementById("popupLayoutPreview");
    previewLayout.innerHTML="";
    // previewLayout.style.flex = "1";

    const LayoutOuterWrapper = document.createElement("div");
    LayoutOuterWrapper.classList.add(`layout-outer-wrapper`);
    LayoutOuterWrapper.innerHTML = res.strHtml;
    previewLayout.appendChild(LayoutOuterWrapper);

    const urlSection = document.createElement("div");
    urlSection.setAttribute("id", "active_slot_url");
    urlSection.style.width = `${body_width - portalWidth - 50}px`;
    previewLayout.appendChild(urlSection);

    // delay for refresh layout(for notify embeded)
    setTimeout((t) => {
        document.querySelectorAll(".slot-num").forEach((slotDiv) => {
            // set hover event handler
            setHoverEventHandler(slotDiv);

            // initialize draging slot into portal selector
            $(slotDiv).off("dragstart");
            $(slotDiv).on("dragstart", (event) => {
                let slotNumber = event.target.id;
                let slotIndex = parseInt(slotNumber.substring(5, slotNumber.length)) - 1;

                if(slots.slotArray[slotIndex].isEmpty()){
                    event.preventDefault();
                } else {
                    event.originalEvent.dataTransfer.setData("text", slotIndex);
                    slotDiv.style.border = "1px solid #0000FF";
                }
            });

            $(slotDiv).off("dragend");
            $(slotDiv).on("dragend", (event) => {
                event.preventDefault();
                console.log("drag eneded:",event);
                slotDiv.style.border = "none";
            });
        });

        document.querySelectorAll(".slot-close.close").forEach((item) => {
            setHoverEventHandler(item);
        })

        updateSlots();

        // show/hide monitor close button
        function showMonitorCloseButton(show = true) {
            document.querySelectorAll(".monitor-close").forEach((m) => {
                let monitorIdx = parseInt(m.getAttribute("id").substring(1));
                if (!slots.isEmptyMonitor(monitorIdx) && show) {
                    m.classList.add("close");
                    m.style.display = null;
                } else {
                    m.classList.remove("close");
                    m.style.display = 'none';
                }
            });
        }

        // set event handler for show/hide monitor close button while hovering
        function setHoverEventHandler(elem) {
            $(elem).off("mouseenter");
            $(elem).on("mouseenter", function (event) {
                showMonitorCloseButton(false);
            });

            $(elem).off("mouseleave");
            $(elem).on("mouseleave", function (event) {
                showMonitorCloseButton(true);
            });
        }
    }, 100);
}

// show active slot url in status bar
function showActiveSlotUrl(slotIndex){
    if(slotIndex < slots.slotArray.length){
        chrome.runtime.sendMessage({
            action: "getEmbededUrl",
            slotIndex: slotIndex,
        }, (datas) => {
            document.querySelector("#active_slot_url").innerHTML = datas.url;
        });
    }
}

// refresh all slots as normal
function reloadSlots() {
    $(".swap_selected").removeClass("swap_selected");
    md_slot.Slots.load().then((slotArray) => {
        slots = new md_slot.Slots(slotArray);
        swapState = 0;
        swpSlot1 = -1;
        swpSlot2 = -1;

        updateSlots();
    })
}

// update close buttons
async function updateSlots() {
    $(".stacked-icon").remove();

    document.querySelectorAll(".slot-num").forEach(async (item) => {
        let slotIndex = parseInt(item.getAttribute("id").substring(5)) - 1;
        const closeElem = item.nextElementSibling;

        if(slotIndex < slots.slotArray.length){
            let windowsCount = slots.slotArray[slotIndex].windowsCount();

            if (windowsCount === 0) {
                closeElem.classList.remove("close");
                closeElem.style.display = 'none';
            } else {
                closeElem.classList.add("close");
                closeElem.style.display = null;

                const slotState = await slots.slotArray[slotIndex].slotState();

                const strFront0 = `<rect id="front0" x="4" y="0" width="10" height="15" rx="1" ry="1"></rect>`;
                const strFront = `<rect id="front" x="4" y="0" width="10" height="15" rx="1" ry="1"></rect>`;
                const strBack = `<rect id="back" x="0" y="3" width="18" height="9" rx="1" ry="1"></rect>`;
                const strMini = `<rect id="mini" x="0" y="11" width="18" height="4" rx="1" ry="1"></rect>`;
                const strCount = `<text id="count" x="5" y="13">${windowsCount}</text>`;

                const stackedIcon = document.createElement('span');
                stackedIcon.setAttribute('class', 'stacked-icon');
                let strHtml = `<svg viewBox="0 0 18 15" xmlns="http://www.w3.org/2000/svg">`;

                switch (slotState) {
                    case 'minimized':
                        strHtml += strMini;
                        break;
                    case 'half-filled':
                        strHtml += strFront0;
                        strHtml += strMini;
                        strHtml += strFront;
                        break;
                    case 'stacked':
                        strHtml += strFront0;
                        strHtml += strBack;
                        strHtml += strFront;
                        break;
                    case 'normal':
                        break;
                }

                strHtml += strCount;
                strHtml += `</svg>`;

                stackedIcon.innerHTML = strHtml;
                item.appendChild(stackedIcon);

                $(stackedIcon).off("click");
                $(stackedIcon).on('click', (e) => {
                    const windowId = slots.slotArray[slotIndex].bottom();
                    chrome.windows.update(windowId, { focused: true });
                    chrome.windows.get(parseInt(windowId), { populate: true }, (window) => {
                        document.querySelector("#active_slot_url").innerHTML = window.tabs[0].url;
                    });

                    // show animation
                    $(item).addClass("floated");
                    setTimeout(() => {
                        $(item).removeClass("floated");
                    }, 500)
                })
            }

            md_utils.refreshSlotState(item, windowsCount > 0);
        } else {
            closeElem.classList.remove("close");
            closeElem.style.display = 'none';
        }
    });

    document.querySelectorAll(".monitor-close.close").forEach((item) => {
        let monitorIdx = parseInt(item.getAttribute("id").substring(1));
        if (slots.isEmptyMonitor(monitorIdx)) {
            item.classList.remove("close");
            item.style.display = 'none';
        }
    })
}

function openOptionPage(activeTab = '', forceOpen = true) {
    const baseUrl = chrome.runtime.getURL("/html/options.html");
    var newUrl = baseUrl;
    if (activeTab != '') {
        newUrl += `?active=${activeTab}`;
    }

    chrome.tabs.query({}, async function (tabs) {
        for (const tab of tabs) {
            if (tab.url.startsWith(baseUrl)) {
                await chrome.tabs.reload(tab.id);
                await chrome.tabs.update(tab.id, { active: true, url: newUrl });
                await chrome.windows.update(tab.windowId, { focused: true });
                window.close();
                return;
            }
        }

        if(forceOpen) {
            chrome.tabs.create({ url: newUrl });
            window.close();
        }
    });
}

// open splash page
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

// load profile
async function loadProfile() {
    profile = new md_profile.Profile(await md_profile.Profile.load());

    const { slotArray } = await chrome.storage.local.get(["slotArray"]);
    slots = new md_slot.Slots(slotArray);
}

// show menu
async function showMenu() {
    $("#menu_frame").show();

    if(await md_utils.getAccountId()) {
        $("#loginBtn").hide();
        $("#logoutBtn").show();
    } else {
        $("#loginBtn").show();
        $("#logoutBtn").hide();
    }

    document.querySelector("#menu_frame").style.width = `120px`;
}

// hide menu
function closeMenu() {
    $("#menu_frame").hide();
}

// initialize variables and dashboard
async function initialize() {
    // set version and flik status
    getVersion(function (ver) {
        version.innerHTML = ver;
    });

    // update flik count
    const { fliks } = await chrome.storage.local.get(["fliks"]);
    flikCount.innerHTML = "FLiKs : " + fliks + "&nbsp;";

    // set device type list
    let strTypes = '';
    md_config.DATA_Z.deviceTypes.forEach((type) => {
        strTypes += `<option value="${type}">${type}</option>`
    })
    $('#device_types').find('option').remove().end().append(strTypes);

    // load mydevice from local storage
    profile = new md_profile.Profile(await md_profile.Profile.load());
    myDevice = profile.getMyDevice();

    // update menu ( if necessary, open splash )
    updateMenu();
}

/////////////// Event Handler //////////////////////////////
// update filks count automatically
chrome.storage.onChanged.addListener( function(changes, namespace) {
    if (changes["fliks"] != undefined) {
        flikCount.innerHTML = "Fliks:" + changes["fliks"].newValue;
    }

    if (changes["slotArray"] != undefined) {
        loadProfile();
    }

    if (changes["modeIndex"] != undefined) {
        md_slot.Slots.initialize(myDevice.getMonitorInfoArray()).then(() => {
            drawMonitorLayout();
            $("#cleanupBtn").click();
        })
    }

    // the case of logged In / logged Out
    if (changes["accountId"] != undefined) {
        updateMenu();
    }

    // the portal refresh
    if (changes["flikUsersFlag"] != undefined) {
        // setPortal();
    }
})

// called when windows resized.
chrome.windows.onBoundsChanged.addListener(function (window) {
    let slotIndex = slots.getSlotIndex(window.id);
    if (slotIndex != -1) {
        updateSlots();
    }
    return true;
})

$("#TutorialView").click(() => {
    gotoVideoTutorial();
})

$("#OverView").click(() => {
    gotoOverview();
})

$("#ConfigBtn").click(() => {
    openOptionPage();
})

$("#DashboardBtn").click(async () => {
    closeMenu();
    $("#dashboard_frame").show();
    initDashboard();

    document.querySelector("#dashboard_frame").style.width = `${bodyWidth}px`;
})

$("#loginBtn").click(async () => {
    await md_utils.setOfflineFlag(false);
    openSpalshPage();
})

$("#logoutBtn").click(async () => {
    chrome.runtime.sendMessage({
        action: "logOut",
    }, async function (response) {
        if (!response.error) {
            $("#login_name").val("");
            $("#login_password").val("");
            await md_utils.cleanAccountInfo();
            window.close();
        }
    })
})

$("#gatherBtn").click(() => {
    if (!confirm("Do you gather all tabs in the primray monitor?")) return;

    chrome.runtime.sendMessage({
        action: "gather",
    }, () => {
    });
})

$("#syncBtn").click(() => {
    chrome.runtime.sendMessage({
        action: "syncOrphanedTab",
    }, () => {
        reloadSlots();
    });
})

$("#cleanupBtn").click(() => {
    chrome.runtime.sendMessage({
        action: "syncOrphanedWnd",
    }, (flikedCount) => {
        reloadSlots();
    });
})

$('#window_filter').on('keyup', (e) => {
    // search urls for all tabs
    $(".searched").removeClass("searched");
    findWindowOption = "first";

    if (this.value === '') return;

    chrome.tabs.query({}, (tabs) => {
        const text = this.value.toLowerCase();
        tabs.forEach(tab => {
            if (tab.title.toLowerCase().includes(text) || tab.url.toLowerCase().includes(text)) {
                let slotIndex = slots.getSlotIndex(tab.windowId);
                if (slotIndex >= 0) {
                    $(`#slot_${slotIndex + 1}`).addClass("searched");
                }
            }
        });

    })
})

$('#mode').on('change', async (e) => {
    if(profile.switchMode(myDeviceId, parseInt($(e.target).val()))){
        profile.save(() => {
            openOptionPage();
        })
    }
})

$('#clear_window_filter').click((e) => {
    $('#window_filter').val('');
    $(".searched").removeClass("searched");
})

//////////////////// setup wizard /////////////////////////////
var deviceArray = [];   // downloaded device array

async function updateMenu() {
    // enable the disabled buttons.
    $(".disabled-button").removeClass("disabled-button");

    const offlineMode = await md_utils.getOfflineFlag();
    const accountId = await md_utils.getAccountId();

    // check logged status
    if (!offlineMode && !accountId) {
        openSpalshPage();
        return;
    }

    $("#waiting_frame").show();

    // get device list from server
    chrome.runtime.sendMessage({
        action: "getDevicesFromServer",
    }, async (data) => {
        $("#waiting_frame").hide();
        deviceArray = data;

        // check device is already registered
        myDeviceId = await md_utils.loadMyDeviceId();
        const device = deviceArray.find(device => device.deviceId === myDeviceId);

        // check there exist the exactly matched device
        if(!myDeviceId || (!offlineMode && myDeviceId && device && !myDevice.checkDeviceExactlyMatched(device))) {
            openSpalshPage();
            return;
        }

        // load profile
        await loadProfile();
        showMenu();
    });
}

//////////////// dashboard ///////////////////////
function initDashboard() {
    // draw layout
    drawMonitorLayout();

    // initialize mode dropdown
    myDeviceId = profile.myDeviceId;
    const device = profile.getDeviceById(myDeviceId);
    let elem = document.getElementById("mode");
    $(elem).empty();
    device.modes.forEach((mode, idx) => {
        elem.add(new Option(mode.name, idx));
    })
    elem.selectedIndex = device.modeIndex;
}

document.querySelector("body").addEventListener("click", function (e) {
    // when monitor close
    if (e.target.className === "monitor-close close") {
        let gID = e.target.getAttribute("id");
        let monitorIdx = parseInt(gID.substr(1, gID.length - 1));
        chrome.runtime.sendMessage({
            action: "closeMonitor",
            monitorIdx: monitorIdx
        }, () => {
            reloadSlots();
        });
    }

    // when close slot
    if (e.target.className === "close slot-close" || e.target.className === "slot-close close") {
        const slotIndex = parseInt(e.target.parentNode.firstChild.getAttribute("id").substring(5)) - 1;
        chrome.runtime.sendMessage({
            action: "closeSlot",
            slotIndex: slotIndex
        }, () => {
            reloadSlots();
        });
    }

    // when select slot
    if (e.target.classList.contains("slot-num")) {
        const slotIndex = parseInt(e.target.getAttribute("id").substring(5)) - 1;
        // select two slot for swapping
        if (e.ctrlKey) {
            // if (slots.slotArray[slotIndex].isEmpty()) return;

            if (slotIndex == swpSlot1 || slotIndex == swpSlot2) {
                switch (swapState) {
                    case 1:
                        swpSlot1 = -1;
                        break;
                    case 2:
                        if (slotIndex == swpSlot1) return;
                        swpSlot2 = -1;
                        break;
                    default:
                        return;
                }

                swapState--;
                md_utils.refreshSlotState(e.target, !slots.slotArray[slotIndex].isEmpty());
            } else {
                switch (swapState) {
                    case 0:
                        swpSlot1 = slotIndex;
                        break;
                    case 1:
                        swpSlot2 = slotIndex;
                        break;
                    case 2:
                        return;
                }

                swapState++;
                md_utils.setSelectedSlot(e.target);
            }
        }
        // activate slot. if slot is empty, create emplty slot
        else {
            // get device Id
            let parentDiv = e.target.parentNode;
            while(parentDiv && !parentDiv.classList.contains("layout-device")) {
                parentDiv = parentDiv.parentNode;
            }

            if (!parentDiv || parentDiv.getAttribute("device_id") !== myDeviceId) {
                return;
            }

            if (slots.slotArray[slotIndex].isEmpty()) {
                if (swapState != 2) {
                    slots.appendNewWindow(slotIndex, (windowId) => {
                        reloadSlots();
                    });
                    e.preventDefault();
                }
            } else {
                let title = '';
                if (e.target.classList.contains("searched")){
                    title = $("#window_filter").val().toLowerCase();
                }
                slots.activate(slotIndex, title, findWindowOption, (windowId) => {
                    if (windowId) {
                        chrome.windows.update(windowId, { focused: true }, (window) => {
                            chrome.tabs.query({ windowId: windowId, active: true }, (tabs) => {
                                document.querySelector("#active_slot_url").innerHTML = tabs[0].url;
                            })
                        });
                    }

                    findWindowOption = 'continue';
                });
            }
        }
    }
});

// execute swap
document.querySelector("body").addEventListener("dblclick", function (e) {
    if (swapState == 2) {
        chrome.runtime.sendMessage({
            action: "swapSlots",
            slotIndex1: swpSlot1,
            slotIndex2: swpSlot2
        }, () => {
            reloadSlots();
        });
    }
});

// show embeded url
document.querySelector("#popupLayoutPreview").addEventListener(
    "mouseover",
    function(e) {
        if (e.target.classList.contains("slot-num")) {
            showActiveSlotUrl(parseInt(e.target.getAttribute("id").substring(5)) - 1);
        }
    },
    false
);

/////////////// learn frame //////////////////////
$("#selectAll").click(() => {
    var totalcount = $('.rule-url').length;
    var checkedcount = $('.rule-url input:checked').length;
    if(checkedcount == totalcount){
        $('#unselectAll').click();
        setTimeout(() => {
            $(".rule-url input").prop( "checked", true );
          }, 100);

    }else{
        $(".rule-url input").prop( "checked", true );
    }
})

$("#unselectAll").click(() => {
    $(".rule-url input").prop( "checked", false );
})

$("#learnBtn").click(async function () {
    let tabs = await chrome.tabs.query({});
    let urls = [];
    tabs.forEach(tab => {
        if (!md_utils.isRestricedUrl(tab.url)) {
            let url = md_utils.removeUrlPrefix(tab.url);
            const tokens = url.split('/');
            const lastTockenNo = tokens.length - 1;
            url = '';
            for (let i = 0; i < lastTockenNo; i++){
                url += `${tokens[i]}`;
                if (i < lastTockenNo - 1) {
                    url += `/`;
                }
            }

            if (lastTockenNo > 1 && tokens[lastTockenNo].split('?')[0] != '') {
                url += `${tokens[lastTockenNo].split('?')[0]}`;
            }

            if (!urls.includes(url)) {
                urls.push(url);
            }
        }
    });

    // check url is conflict
    let urlInfos = [];
    urls.forEach(url => {
        let matchInfo = profile.checkUrlMatch(url);

        if (matchInfo.info === "nomatch" || matchInfo.info === "submatch" ) {
            urlInfos.push({
                url: url,
                baseUrl: matchInfo.info === "submatch" ? profile.flikRuleArray[matchInfo.index].url : ''
            });
        }
    })

    if (urlInfos.length === 0) {
        alert("There are no new rules to add");
    } else {
        let strElem = `<table>`;
        strElem += `<tr><th width=450px>Rule</th><th width=200px>Conflict</th></tr>`;

        urlInfos.forEach(urlInfo => {
            strElem += `<tr><td><div class='rule-url'><input type="checkbox" checked><input type="text" value="${urlInfo.url}"></div></td><td>${urlInfo.baseUrl}</td></tr>`;
        })
        strElem += `</table>`;

        $("#learn-frame-urls").html(strElem);

        closeMenu();
        $('#learn_frame').show();
    }

})

$("#cancelLearn").click(() => {
    $('#learn_frame').hide();
    showMenu();
})

$("#addtoRule").click(() => {
    $('#learn_frame').hide();

    $("#learn-frame-urls :text").each(function() {
        var value = $(this).parent().find('input[type="checkbox"]').prop('checked');
        if (value) {
            profile.addRule({ url :$(this).val() }, myDeviceId);
        }
    });

    profile.save(() => {
        openOptionPage('FLiKs');
    })
})

/////// portal selectot ///////////////
var historys = [];
var maxItems = 4;
var level = 1;
var portal_data = [];
var portal_list = [];
let counter = 0;
var timerId;  // for portal selector
var selectedItem;

$("div .portal-indexBox").on('click','.portal-space',function(event){
    clearTimeout(timerId);
    rangeClicked($(event.target));
});

$("div .portal-indexBox").on('mouseenter','.portal-space',function(event){
    selectedItem = event.target;
    timerId = setTimeout(() => {
        rangeClicked($(event.target))
    }, 500);
});

$("div .portal-indexBox").on('mouseleave','.portal-space',function(event){
    item = event.target;
    if(item == selectedItem) {
        clearTimeout(timerId);
    }
    $(item).css('cursor', '');
});

$("div .portal-indexBox").on('click','.portal-item',function(event){
    clearTimeout(timerId);
    itemClicked($(event.target))
});

$("div .portal-indexBox").on('mouseenter','.portal-item',function(event){
    selectedItem = event.target;
    timerId = setTimeout(() => {
        itemClicked($(event.target))
    }, 500);
});

$("div .portal-indexBox").on('mouseleave','.portal-item',function(event){
    item = event.target;
    if(item == selectedItem) {
        clearTimeout(timerId);
    }
    $(item).css('cursor', '');
});

function duplicatesFind(array){
    return array.filter((item, index) => array.indexOf(item) === index)
}

//////////// for portal selector //////////////////
$("div .portal-goback").on('click',function(event){
    if(historys.length > 0){
        let last = historys[0];
        childitems = [];
        childitems = getChildren(last[0],last[1],last[2],maxItems -2);
        level = last[2];
        setLayout(childitems);
    }
});

// set portalSelect with flik Users
async function setPortal(){
    if(!md_utils) return;
    const accountId = await md_utils.getAccountId();
    let  userlistInfo ={};
    if(accountId){
        userlistInfo = await md_utils.getFlikUserlist();
    }

    initPortal(userlistInfo);
}

function initPortal(userlist){
    if(userlist == undefined ||  userlist.length == 0 ){
        if($("#portalLayoutContainer").css("display") != 'none' ){
            let marginLeft = parseInt($("#popupLayoutPreview_section").css("margin-left"));
            $('#popupLayoutPreview_section').css("margin-left", `${marginLeft+60}px`);
            $('#portalLayoutContainer').hide();
        }
        return;
    }else{
        if($('#portalLayoutContainer').css('display') == 'none' )
        {
            $('#portalLayoutContainer').show();
            let marginLeft = parseInt($("#popupLayoutPreview_section").css("margin-left"));
            $('#popupLayoutPreview_section').css("margin-left", `${marginLeft-60}px`);
        }
    }

    $("div .portal-indexBox").children().remove();
    $("div .portal-contentBox").children().remove();

    portal_data.splice(0, portal_data.length);
    portal_list.splice(0, portal_list.length);
    historys.splice(0, historys.length);
    portal_list = [... userlist];

    portal_list.forEach((item=>{
        let txt = item.name.replaceAll('"','');
        item.name = txt;
        portal_data.push(txt);
    }));

    portal_data.sort( function(a, b){
        let x = a.toLowerCase();
        let y = b.toLowerCase();
        if (x < y) {
            return -1;
        }
        if (x > y) {
            return 1;
        }
        return 0;
    });

    for(i = 1; i <= maxItems; i++) {
        var txt = document.createElement("span");
        txt.className = "portal-item";
        $("div.portal-indexBox").append(txt);
        if(i < maxItems) {
            var space = $("<div class =\"portal-space\"></div>"); //document.createElement("div");space.className = "portal-space";
            $("div.portal-indexBox").append(space);
        }
    }
    ps = "0"
    pe = "z"

    childitems = getChildren(ps,pe,1,maxItems -2);
    setLayout(childitems);
    historys.push([ps,pe,level]);
}

function displayFilter(arr){
    $("div.portal-contentBox").children().remove();
    arr.forEach((item)=>{
        var txt = document.createElement("span");
        txt.className += "portal-block";
        txt.innerHTML = item;
        const list_item =portal_list.filter((it)=>{
            return it.name == item;
        });
        if(list_item.length > 0)
        {
            txt.id =list_item[0].user_id;
        }
        txt.ondrop = function(event) {
            var slot_num_id = event.dataTransfer.getData("text");
            event.preventDefault();
            let receivers = []
            receivers.push(this.id);

            let datas =[{slot:slot_num_id}]

            setPacket(receivers,datas);
        };

        txt.ondragover = function(event) {
            event.preventDefault();
        };

        $("div.portal-contentBox").append(txt);
    });
}

function setPacket(receiver,datas){
    // console.log("receivers=",receiver,", datas=",datas)
    chrome.runtime.sendMessage({
        action: "sendingPacket",
        receivers : receiver,
        data : datas,
    }, function (response) {
        console.log(response.err);
    })
}

function setLayout(items){
    $("div .portal-indexBox").children().hide();
    $child = $("div .portal-indexBox").children().first();
    items.forEach((item)=>{
        if($child.prop("tagName").toLowerCase() == "span")
        {
            $child.text(item);
            $child.show();
        }

        $prevchild = $child.prev();
        if($prevchild.length > 0 && $prevchild.prop("tagName").toLowerCase() == "div")
        {
            $prevchild.show();
        }
        $child = $child.next().next();
    });

    if($child.length>0)
    {
        $child.prev().prev().nextAll().hide();
    }
}

function getChildren(sc,ec,level,count){
    const indexing = portal_data.filter((item) =>{
        return item.toLowerCase() > sc.concat("zz") && item.toLowerCase() < ec
    });
    displayFilter(indexing);
    const indexingTolevel = indexing.map((item) =>{
        return item.substr(0,level);
    });

    const lst = duplicatesFind(indexingTolevel);

    if(lst.length > count+2){
        let tmp =[];
        tmp.push(lst[0]);
        i = Math.floor((lst.length -1) /3 );
        tmp.push(lst[i]);
        k = Math.floor((lst.length -i-1)/2);
        tmp.push(lst[i+k]);
        tmp.push(lst[lst.length-1]);
        return tmp
    } else {
        return lst;
    }
}

function itemClicked($item){
    $item.css('cursor', 'wait');
    var _sel = $item.text();
    let sc = _sel.toLowerCase() + "00";
    let ec = _sel.toLowerCase() + "zz";
    level = level +1
    $item.animate({fontSize: '15px'},200,function(){
        $item.css('cursor', '');
        childitems = [];
        $item.css('fontSize','13px');
        childitems = getChildren(sc,ec,level,maxItems -2);

        if(childitems.length >0)
        {
            setLayout(childitems);
            timerId = setTimeout(() => {
            $item.trigger("mouseenter");
            }, 1000);
        }else{
            setLayout([_sel]);
            displayFilter([_sel]);
        }
    });
}

function rangeClicked($space){
    if($space.css('cursor') == 'wait') return;
    $space.css('cursor', 'wait');
    var sc = $space.prev().text();
    var ec = $space.next().text();
    $space.animate({backgroundColor: 'rgba(0, 0, 200, 0.9)'},200,function(){
        $space.css('cursor', '');
        $space.css('backgroundColor', 'transparent');
        childitems = [];
        //childitems.push(sc);
        childitems = getChildren(sc,ec,level,maxItems -2);
        if(childitems.length ==0)
        {
            childitems.push(sc,ec);
        }else{
            //historys.push([sc,ec,level]);
            timerId = setTimeout(() => {
            $space.trigger("mouseenter");
            }, 1000);
        }
        setLayout(childitems);
    });
}

//////////////// user profile edit ///////////////////
var banner_file;
var photo_file;
var url = new URL(window.location.href);

$("#profile_save").click(async () => {
    $("#dashboard_frame").show();
    $("#profile_frame").hide();

    let uuid = $('#User-Image').attr("data-uuid");
    let name = $("#profile_name").val();
    let bio = $("#profile_note").val();
    let location = $("#profile_location").val();
    let website = $("#profile_website").val();

    // let banner = convertImgToBase64(document.getElementById('profile-banner').src);
    // let photo =  convertImgToBase64(document.getElementById('profile-userphoto').src)
    // const profile ={uuid:uuid,name:name,bio:bio,location:location,website:website,banner:banner,photo:photo};

    // chrome.runtime.sendMessage({
    //     action: "saveUserProfile",
    //     profile:profile,
    // }, function (respone) {
    //     console.log(respone);
    // })

    // let formData = new FormData();
    // formData.append("file", photo_file.filepointer);
    // console.log(photo_file.filepointer);
    // var xhr = new XMLHttpRequest();
    // xhr.open("PUT", "ftp://cdn.flik.com/flik/profile/avatar/photo1.png", true);
    // xhr.send(photo_file.filepointer);
    const banner_uploaded = banner_file.uploadToSever(uuid,"banner");//result.json()
    // const photo_uploaded = photo_file.uploadToSever(uuid,"avatar");//result.json()
})

$("#User-Image").click((e) => {
    let uuid = $('#User-Image').attr("data-uuid");

    if(uuid == '') return;
    $("#profile-banner").attr("src", "");
    $("#profile-photo-src").attr("src", "");

    chrome.runtime.sendMessage({
        action: "getUserProfile",
        uuid: uuid,
    }, async function (respone) {
        if (respone.result_status == "ok") {
            $("#profile-header-name").text('@'+ respone.name);
            $("#profile_name").val(respone.name);
            $("#profile_note").val(respone.description);
            $("#profile_location").val(respone.location);
            $("#profile_website").val(respone.website);

            await banner_file.url(respone.banner,"banner.png");
            await new LoadImage.Load(banner_file.src(),document.getElementById('profile-banner'),$("#banner-lazy"));

            await photo_file.url(respone.photo,"avatar.png");
            await new LoadImage.Load(photo_file.src(),document.getElementById('profile-userphoto'),$("#photo-lazy"));
        }
    })
    // $("input[type=text],textarea").prop("disabled", true);

    // $("#profile_frame").css('cursor', 'wait');
    $("#profile_frame").show();
    $("#dashboard_frame").hide();

    document.querySelector("#profile_frame").style.width = `${bodyWidth}px`;
})

$("#choose_photo_file").on('change', async (event) => {
    const file = event.target.files[0];

    await photo_file.url(file);
    await new LoadImage.Load(photo_file.src(),document.getElementById('profile-userphoto'),$("#photo-lazy"));
});

$("#choose_banner_file").on('change', async (event) => {
    const file = event.target.files[0];
    await banner_file.url(file);
    await new LoadImage.Load(banner_file.src(),document.getElementById('profile-banner'),$("#banner-lazy"));
});

$("#remove_banner_photo").click(async () => {
    await banner_file.url(null,"banner.png");
    await new LoadImage.Load(banner_file.src(),document.getElementById('profile-banner'),$("#banner-lazy"));
})

$("img").on("error", function () {

    // $(this).attr("src", chrome.runtime.getURL(`../img/nopreview.png`));
});

$("#profile_cancel").click(() => {
    $("#dashboard_frame").show();
    $("#profile_frame").hide();
})

$("#choose_banner_photo").click(() => {
    $("#choose_banner_file").click();
})

$("#remove_banner_photo").click(() => {
    document.getElementById('profile-banner').src = "";
})

$("#choose_photo").click(() => {
    $("#choose_photo_file").click();
})

$(":text,textarea").on("change",function(){
    $(this).attr("data-changed",true);
})

$(".textbox-after").click(function(){
    const text_id =$(this).prev().attr('id');
    const element =document.getElementById(text_id);
    $(element).prop("disabled", false);
    $(element).focus()
})

//image management Objects --used into popup.profile photo &banner
const LoadImage = (function () {
    var api = {
        Load: function(url,element,indicator) {
            return new Promise((resolve, reject)=>{
                if(url =="") reject("url is null");
                $(indicator).show();
                element.onload = function() {
                    $(indicator).hide()
                    resolve(url);
                };
                element.onerror=function(){
                    $(indicator).hide()
                    reject("error while loading");
                }
                element.src = url;
            });
        }
    };

    return api;
})();

function Imgcontainer(url = "")
{
    this._name="";
    this._extension="";
    this.data = null;
    this.type = null;
    this.filepointer = null;
    this.ischanged=false;
    this.src = function()
    {
        return this.data;
    };

    this.uploadToSever = async function(path,type) //upload to supabase storage
    {
        if(this.data == null) return {error:"source is null"};
        if(this.filepointer == null) return {error:"source must be image data"};

        // document.getElementById('banner-submit').submit();
        const formData = new FormData();
        formData.append('image', this.filepointer);//document.getElementById("choose_photo_file").files[0]

        const respone= await fetch("http://localhost:8000/image/upload", {
            headers: {
                'filename': path+"."+this._extension,
                'type':type,
            },
            method: 'POST',
            body: formData
        });
        console.log(respone);
        return respone;
    };

    this.url = async function(datas,defaultUrl) {
        if(datas == null){
            datas = chrome.runtime.getURL(`../img/${defaultUrl}`);
        }
        try{
            let sType = typeof datas;

            if(sType == "string")
            {
                let _datas = datas.trim();
                if( _datas.startsWith("http") || _datas.startsWith("chrome-extension"))
                {
                    if(this.data != null)
                {
                        this.ischanged = true;
                    }
                    let filename =  _datas.substr(_datas.lastIndexOf("/")+1);
                    this._extension = _datas.substr(filename.lastIndexOf(".")+1);
                    this._name = _datas.slice(0,filename.lastIndexOf("."));
                    this.type = "url";
                    this.data = _datas;
                    this.filepointer = null;
                }
            }else{
                if(this.data != null)
                {
                    this.ischanged = true;
                }

                let filename =  datas.name
                this._extension = filename.substr(filename.lastIndexOf(".")+1);
                this._name = filename.slice(0,filename.lastIndexOf("."));
                this.type = "file";
                this.filepointer = datas;
                let loader = new Promise((resolve, reject)=>{
                    const reader = new FileReader();
                    reader.readAsDataURL(datas);
                    reader.addEventListener('load', async (event) => {
                        resolve(event.target.result);
                    });
                });
                this.data = await loader;
                console.log("URL =",this.data);
            }
        }catch(e)
        {
            alert("while getting picture,error occured");
            console.log(e);
        }
    };
}

async function convertImgToBase64(src){
    return new Promise(function(myResolve, myReject) {
        fetch(src)
        .then((res) => res.blob())
        .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = getBase64StringFromDataURL(reader.result);
                myResolve(base64);
            };
            reader.readAsDataURL(blob);
        });
    });
}

const getBase64StringFromDataURL = (dataURL) => {
    dataURL.replace('data:', '').replace(/^.+,/, '');
}

/////////////////////// password reset //////////////////////////////
$("#btn_resetpassword_reset").click(async function(){
    let _email = $("#dialog_email").val();

    let redirect_url = chrome.runtime.getURL("../html/popup.html");

    const respone = await fetch("http://localhost:8000/resetpwd", {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        //   'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({ email: _email })
    });
    let result =await respone.json();
    if(result.status === "success") {
        // chrome.runtime.sendMessage({
        //     action: "reset_password",
        //     email:_email,
        //     redirect:redirect_url,
        // }, function (respone) {
        //     if(respone.error){
        //         alert("While reseting password, error occured:"+ respone.error);
        //     }else{
        //         alert("Sent request to your mail. Please check the your mailbox.");
        //     }
        // })
    }

    window.close();
})

///////////////////////////// initialize /////////////////////////////
window.onload = async function () {
    $("#dashboard_frame").hide();
    $("#learn_frame").hide();
    $("#profile_frame").hide();
    closeMenu();

    try {
        md_config = await import("./config.js");
        md_profile = await import("./profile.js");
        md_slot = await import("./slot.js");
        md_utils = await import("./utils.js");

        banner_file = new Imgcontainer();
        photo_file =  new Imgcontainer();

        // initialize all data
        await initialize();
    } catch (e) {
        console.log(e)
    }
}
