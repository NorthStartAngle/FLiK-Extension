/**
 * written by Jin YC.  2022.11.02
 */

// module variables

var md_config, md_utils, md_profile, md_slot;

var profile, slots, isAutoFlik = false;         // global variables
let excludedHrefs = [undefined, "#", "", "javascript:void(0)", `${chrome.runtime.getURL('../html/options.html')}`];
let slotDiv = null;                     // html div for slot popup menu
let linkInFocus = false;
let anchorInFocus = null;
let anchorUrl = "";

/////////////////// Events //////////////////////////////////
chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
    switch (request.action) {
        case "showBand":
            chrome.storage.local.get(["showLabelInBand", "showRuleInBand", "showModeInBand", "showDomainInBand", "bandFontFamily"], (configs) => {
                md_utils.insertBand(request.bandInfo, configs);
            });
            return true;
    }

    return true;
});

///////////// Portal Function /////////////////////////////////
let userlistInfo=[]
var portal_data =[];
var portal_list=[];
var maxItems = 4;
var level =1;
var selectedItem;
var historys =[];
let counter = 0;
var delay;
var childitems;

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
            delay = setTimeout(() => {
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
            delay = setTimeout(() => {
            $space.trigger("mouseenter");
            }, 1000);
        }
        setLayout(childitems);
    });
}

function displayFilter(arr){
    $("div .portal-contentBox").children().remove();
    arr.forEach((item)=>{
        var txt = document.createElement("span");
        txt.className += "portal-block";
        txt.innerHTML = item;
        const list_item =portal_list.filter((it)=>{
            return it.name == item;
        });
        $(txt).on('click',function(event){
            chrome.runtime.sendMessage({
                action: "openToPortal",
                url: anchorUrl,
                receipient:$(this).text()
            }, (res) => {
                if(res != null)
                {
                    console.log("Error while sending To user");
                }
            });
        });
        $("div .portal-contentBox").append(txt);
    });
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

function duplicatesFind(array){
    return array.filter((item, index) => array.indexOf(item) === index)
}

function initPortal(userlist){
    portal_data.splice(0, portal_data.length);
    portal_list.splice(0, portal_list.length);
    portal_list = [... userlist];

    portal_list.forEach((item=>{
        portal_data.push(item.name);
    }));

    portal_data.sort(function(a, b){
        let x = a.toLowerCase();
        let y = b.toLowerCase();
        if (x < y) {return -1;}
        if (x > y) {return 1;}
        return 0;
      });

    for(i=1;i<=maxItems;i++)
    {
        var txt = document.createElement("span");
        txt.className = "portal-item";
        $("div .portal-indexBox").append(txt);
        if(i < maxItems)
        {
            var space = $("<div class =\"portal-space\"></div>");
            $("div .portal-indexBox").append(space);
        }
    }
    ps = "0"
    pe = "z"
    childitems = getChildren(ps,pe,1,maxItems -2);
    setLayout(childitems);
    historys.push([ps,pe,level]);
    portalEvent();
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

    if(lst.length > count+2)
    {
        let tmp =[];
        tmp.push(lst[0]);
        i = Math.floor((lst.length -1) /3 );
        tmp.push(lst[i]);
        k = Math.floor((lst.length -i-1)/2);
        tmp.push(lst[i+k]);
        tmp.push(lst[lst.length-1]);
        return tmp
    }else {
        return lst;
    }
}

function portalEvent(){
    $("div .portal-indexBox").on('click','.portal-space',function(event){
        clearTimeout(delay);
        rangeClicked($(event.target));
    });

    $("div .portal-indexBox").on('mouseenter','.portal-space',function(event){
        selectedItem = event.target;
        delay = setTimeout(() => {
            rangeClicked($(event.target))
            }, 500);
    });

    $("div .portal-indexBox").on('mouseleave','.portal-space',function(event){
        item = event.target;
        if(item == selectedItem)
        {
            clearTimeout(delay);
        }
        $(item).css('cursor', '');
    });

    $("div .portal-indexBox").on('click','.portal-item',function(event){
        clearTimeout(delay);
        itemClicked($(event.target))
    });

    $("div .portal-indexBox").on('mouseenter','.portal-item',function(event){
        selectedItem = event.target;
        delay = setTimeout(() => {
            itemClicked($(event.target))
            }, 500);
    });

    $("div .portal-indexBox").on('mouseleave','.portal-item',function(event){
        item = event.target;
        if(item == selectedItem)
        {
            clearTimeout(delay);
        }
        $(item).css('cursor', '');
    });

    $("div .portal-goback").on('click',function(event){
        if(historys.length > 0){
            let last = historys[0];
            childitems = [];
            childitems = getChildren(last[0],last[1],last[2],maxItems -2);
            level = last[2];
            setLayout(childitems);
        }
    });
}

////////////////////// Functions //////////////////////////////
// create the Slot popup menu interface to inject
function createSlotInterface() {
    if (slotDiv && slotDiv.parentNode != null) {
        slotDiv.parentNode.removeChild(slotDiv);
    }

    slotDiv = document.createElement("div");
    slotDiv.setAttribute("id", "flik_slot_interface");
    slotDiv.style.borderStyle = "solid";
    slotDiv.style.borderWidth = "2px";
    slotDiv.style.borderColor = "#D66545";

    let previewLayout = document.createElement("div");
    previewLayout.setAttribute("id", "contentLayoutWrapper");

    const res = profile.drawLayout({ caller: "layout" }, { dottedFlag: 0, showCloseFlag: 0 });

    previewLayout.innerHTML = res.strHtml;

    const urlWrapper = document.createElement("div");
    urlWrapper.setAttribute("id", "active_slot_url");
    urlWrapper.style.width = `${parseInt(res.width) + 10}px`;
    // urlWrapper.style.height = `${12}px`;
    previewLayout.appendChild(urlWrapper);

    const checkWrapper = document.createElement("div");
    checkWrapper.setAttribute("id", "flikEnable_layout");
    checkWrapper.innerHTML = `<label style="margin-left: 10px">` +
            `<input type="checkbox" id="chkAutoFlik" style="margin-right: 10px"${isAutoFlik ? ' checked' : ''}/>` +
            `<span>Auto FLiK ${isAutoFlik ? 'Enabled' : 'Disabled'}</span></label>`
    if(!isAutoFlik) {
        setTimeout(() => {
            document.querySelectorAll("#contentLayoutWrapper .layout-wrapper").forEach(function(element) {
                element.classList.add("disabled_flik");
            });
        }, 100);
    }
    previewLayout.appendChild(checkWrapper);

    if(false && userlistInfo && userlistInfo.length > 0) {
        const portal_layout = document.createElement("div");
        portal_layout.classList.add("portal-layout");
        portal_layout.style.width = `120px`;
        portal_layout.innerHTML = '<div class = "portal-indexContainer"><div class = "portal-goback"></div><div class = "portal-indexBox"></div></div><div class = "portal-contentBox"></div>';

        const divContainder = document.createElement("div");
        divContainder.setAttribute("id", "flik_container_div");

        divContainder.appendChild(previewLayout);
        divContainder.appendChild(portal_layout);
        slotDiv.appendChild(divContainder);
    } else {
        slotDiv.appendChild(previewLayout);
    }

    document.querySelector("body").append(slotDiv);

    if(userlistInfo && userlistInfo.length > 0){
        // initPortal(userlistInfo);
    }

    document.querySelector('#chkAutoFlik')?.addEventListener("change", async function() {
        isAutoFlik = this.checked;
        await chrome.storage.local.set({ isEnable: isAutoFlik });
        if(isAutoFlik) {
            document.querySelector('#chkAutoFlik + span').textContent = "Auto FLiK Enabled";
            document.querySelectorAll("#contentLayoutWrapper .disabled_flik").forEach(function(element) {
                element.classList.remove("disabled_flik");
            });
        } else {
            document.querySelector('#chkAutoFlik + span').textContent = "Auto FLiK Disabled";
            document.querySelectorAll("#contentLayoutWrapper .layout-wrapper").forEach(function(element) {
                element.classList.add("disabled_flik");
            });
        }
    });

    setTimeout((t) => {
        let elements = document.querySelectorAll(".slot-num");
        if (elements != undefined) {
            elements.forEach((e) => {
                let slotIndex = parseInt(e.getAttribute("id").substring(5)) - 1;
                if (slotIndex < slots.slotArray.length && !slots.slotArray[slotIndex].isEmpty()) {
                    md_utils.addEmbededClass(e);
                }
            });
        }
    }, 50);

    document.querySelector("#flik_slot_interface").addEventListener(
        "click",
        function(e) {
            if (e.target.className === "slot-num") {
                // prevent double click
                e.target.classList.add("slot-num-clicked");

                const slot_num = e.target.getAttribute("id").substring(5);
                chrome.runtime.sendMessage({
                    action: "openInSlot",
                    slot: parseInt(slot_num),
                    url: anchorUrl,
                }, (res) => {
                    if(res) {
                        md_utils.addEmbededClass(e.target);
                        setTimeout(() => {
                            const divSlotUrl = document.querySelector("#active_slot_url");
                            if(divSlotUrl) divSlotUrl.innerHTML = anchorUrl;
                        }, 10)
                    }

                    // hide the slot popup menu
                    setTimeout(() => {
                        e.target.classList.remove("slot-num-clicked");
                        slotDiv.style.display = "none";
                    }, 10)
                });
            }
        },
        false
    );

    // show embeded url
    document.querySelector("#flik_slot_interface").addEventListener(
        "mouseover",
        function(e) {
            const divSlotUrl = document.querySelector("#active_slot_url");
            if (e.target.className === "slot-num") {
                const slotIndex = parseInt(e.target.getAttribute("id").substring(5)) - 1;
                if (slotIndex < slots.slotArray.length && !slots.slotArray[slotIndex].isEmpty()) {
                    chrome.runtime.sendMessage({
                        action: "getEmbededUrl",
                        slotIndex: slotIndex,
                    }, (data) => {
                        if(divSlotUrl) divSlotUrl.innerHTML = data.url;
                    });
                }
            } else {
                if(divSlotUrl) divSlotUrl.innerHTML = "";
            }
        },
        false
    );

    return { width: res.width, height: res.height };
}

// create layout
function createContextLayout() {
    document.querySelector("body")?.addEventListener(
        "mouseover",
        async (e) => {
            var anchor = e.target.closest("a");
            if (anchor !== null && !excludedHrefs.includes(anchor.href)) {
                if (e.shiftKey) {
                    isAutoFlik = (await chrome.storage.local.get(["isEnable"])).isEnable;
                    userlistInfo = await md_utils.getFlikUserlist();

                    if (anchor.href != anchorUrl || !linkInFocus) {
                        anchorUrl = anchor.href;

                        try{
                            profile = new md_profile.Profile(await md_profile.Profile.load());
                        } catch(e) {
                            location.reload();
                            return;
                        }

                        const {slotArray} = await chrome.storage.local.get(["slotArray"]);
                        slots = new md_slot.Slots(slotArray)

                        let interfaceRcectInfo = createSlotInterface();

                        let xPos = e.pageX;
                        let elemWidth = interfaceRcectInfo.width + 40;
                        if (e.pageX + elemWidth > window.scrollX + window.innerWidth) {
                            xPos = window.scrollX + window.innerWidth - elemWidth;
                        }
                        let yPos = e.pageY;
                        let elemHeight = interfaceRcectInfo.height + 40;
                        if (e.pageY + elemHeight > window.scrollY + window.innerHeight) {
                            yPos = window.scrollY + window.innerHeight - elemHeight;
                        }
                        slotDiv.style.display = "flex";
                        slotDiv.style.left = `${xPos}px`;
                        slotDiv.style.top = `${yPos}px`;
                        linkInFocus = true;
                    }
                    anchorInFocus = anchor;
                }
            } else {
                if (
                    anchorInFocus &&
                    e.target != slotDiv &&
                    !contains(slotDiv, e.target) &&
                    calculateDistance(slotDiv, e.pageX, e.pageY) > 80
                ) {
                    linkInFocus = false;
                    slotDiv.style.display = "none";
                }

                function contains(parent, child) {
                    return parent !== child && parent.contains(child);
                }

                function calculateDistance(elem, mouseX, mouseY) {
                    let rect = elem.getBoundingClientRect();
                    let off_X = 0;
                    if (mouseX < rect.left + window.scrollX) off_X = rect.left + window.scrollX - mouseX;
                    if (mouseX > rect.left + rect.width + window.scrollX) off_X = mouseX - (rect.left + rect.width + window.scrollX);

                    let off_Y = 0;
                    if (mouseY < rect.top + window.scrollY) off_Y = rect.top + window.scrollY - mouseY;
                    if (mouseY > rect.top + rect.height + window.scrollY) off_Y = mouseY - (mouseY > rect.top + rect.height + window.scrollY);

                    let distance = Math.sqrt(off_X * off_X + off_Y * off_Y);
                    return distance;
                }
            }
        },
        false
    );

    document.querySelector("body")?.addEventListener(
        "click",
        async (e) => {
            var anchor = e.target.closest("a");
            if (isAutoFlik && anchor !== null && !excludedHrefs.includes(anchor.href)){
                const defaultSlot = profile.getMyDevice().defSlotNum;
                let flikRule = profile.analyzeUrl(anchor.href);
                if (!flikRule) {
                    // check if default slot is defined.
                    if (defaultSlot === 'off' || defaultSlot === 0) {
                        return;
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

                e.preventDefault();

                chrome.runtime.sendMessage({
                    action: "openWithRule",
                    rule: flikRule,
                    url: anchor.href,
                }, (res) => {
                    if(res) {
                        md_utils.addEmbededClass(e.target);
                        setTimeout(() => {
                            const divSlotUrl = document.querySelector("#active_slot_url");
                            if(divSlotUrl) divSlotUrl.innerHTML = anchor.href;
                        }, 100)
                    }
                });
            }
        }
    );
}

function loadScript(url) {
    // adding the script element to the head as suggested before
   var head = document.getElementsByTagName('head')[0];
   var script = document.createElement('script');
   script.type = 'text/javascript';
   script.src = url;

   head.appendChild(script);
}

window.onload = async function () {
    try {
        md_config = await import(chrome.runtime.getURL("./js/config.js"));
        md_profile = await import(chrome.runtime.getURL('./js/profile.js'));
        md_slot = await import(chrome.runtime.getURL("./js/slot.js"));
        md_utils = await import(chrome.runtime.getURL("./js/utils.js"));

        profile = new md_profile.Profile(await md_profile.Profile.load());
        isAutoFlik = (await chrome.storage.local.get(["isEnable"])).isEnable;

        createContextLayout();
    } catch (e) {
        console.log(e)
    }
}