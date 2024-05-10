import { DATA_Z } from './config.js'
import * as utils from "./utils.js";

/**
 * written by Jin YC.  2022.11.01
 * class for profile.
 * A mode contains monitor's information and filkdata configurations.
 */


/**
 * manange a FLiK rule
 */
export class FlikRule {
    constructor(info) {
        this.url = info.url;                        // mathced url
        this.slots = info.slots;                    // target slot[{deviceId, values:[]}]
        this.handling = info.handling;
        this.banding = info.banding;
        this.label = info.label;
        this.color = info.color;
        this.order_num = info.order_num;
    }

    // compare rule
    static compareRule(first, second) {
        return first.url == second.url &&
            JSON.stringify(utils.sortByKey(first.slots, "deviceId")) == JSON.stringify(utils.sortByKey(second.slots, "deviceId")) &&
            first.handling === second.handling &&
            first.banding === second.banding &&
            first.label === second.label &&
            first.color === second.color;
    }
}

/**
 * manange a target configuration
 */
class TargetInfo {
    constructor(info) {
        this.service = info.service;
        this.target = info.target;
        this.slot = info.slot;
        this.handling = info.handling;
        this.group = info.group;
        this.favorite = info.favorite;
    }
}

/**
 * manage a monitor configuration
 */
class MonitorInfo {
    constructor(info) {
        this.monitorIdx = info.monitorIdx;          // The index that chrome decided.  ( index of the array that the function "system.display.getInfo()" returns. )
        this.monitorId = info.monitorId;            // The ID that chrome decided.
        this.isPrimary = info.isPrimary;            // flag that this monitor is primray
        this.boundRect = info.boundRect;            // bound rect of monitor workarea

        ////////  below properties are customized per mode //////////////////////////
        this.monitorOrder = [...info.monitorOrder];      // order in device
        this.useThis = [...info.useThis];                // active flag
        this.layoutId = [...info.layoutId];              // monitor's layout id
        this.updated_at = info.updated_at;
    }

    // compare two monitor Info for only physical properties
    static compareLayout(first, second){
        return (first.monitorId === second.monitorId) && (first.isPrimary === second.isPrimary) &&
            utils.compareRect(first.boundRect, second.boundRect);
    }

    // compare two monitor all infos
    static compareMonitorInfo(first, second){
        return MonitorInfo.compareLayout(first, second) &&
            (first.monitorIdx === second.monitorIdx) &&
            (JSON.stringify(first.layoutId) === JSON.stringify(second.layoutId)) &&
            (JSON.stringify(first.monitorOrder) === JSON.stringify(second.monitorOrder)) &&
            (JSON.stringify(first.useThis) === JSON.stringify(second.useThis));
    }
}

/**
 * manage a device
 */
export class Device {
    constructor(info) {
        this.deviceId = info.deviceId || "";        // The ID of device
        this.type = info.type || "desktop";         // device type ( laptop || desktop || phone )
        this.title = info.title || "";              // device caption
        this.border = info.border || "dashed";      // device border style
        this.color = info.color || "#ffffff";       // device background color
        this.left = info.left ?? 1;                 // device x position
        this.top = info.top ?? 0;                   // device y position
        this.defSlotNum = info.defSlotNum ?? 0;     // default slot number for un-ruled url
        this.synced_at = info.synced_at;            // synced time with server
        this.updated_at = info.updated_at;          // uploaded time to server

        this.monitorIdxArray = info.monitorIdxArray ? [...info.monitorIdxArray] : [];         // monitor ID corresponse table.( chrome index => OS index )
        this.monitorInfoArray = [];
        if(info.monitorInfoArray) {
            info.monitorInfoArray.forEach(monitorInfo => {
                this.monitorInfoArray.push(new MonitorInfo(monitorInfo));
            });
        }
        // this.monitorInfoArray = utils.sortByKey(this.monitorInfoArray, "monitorIdx");

        this.modeIndex = info.modeIndex ?? 0;       // current mode index
        this.modes = [];
        if(info.modes) {
            info.modes.forEach(mode => {
                this.modes.push({
                    name: mode.name,
                    monitorIds: [...mode.monitorIds],
                    devicesInLayout : [...mode.devicesInLayout],  // devices in layout view [{deviceId, left, top}]
                });
            });
        } else {
            this.modes.push({
                name: 'default',
                monitorIds: this.monitorInfoArray.map(monitorInfo => monitorInfo.monitorId),
                devicesInLayout: [],
            });
        }
    }

    // make defalut monitorInfo
    static defaultMonitorInfo(idx, monitorId, boundRect, isPrimary, modeCount = 1) {
        return {
            monitorIdx: idx,
            monitorId,
            isPrimary,
            boundRect : { ...boundRect, height: Math.round(boundRect.height / 4) * 4 },
            useThis: new Array(modeCount).fill(true),
            monitorOrder: new Array(modeCount).fill(idx + 1),
            layoutId: new Array(modeCount).fill(isPrimary ? 0 : 1),
        }
    }

    // make defalut monitorInfo array
    static async defaultMonitors(displayInfoArray = null) {
        if (!displayInfoArray) {
            displayInfoArray = await chrome.system.display.getInfo();
        }

        let monitorInfoArray = [];
        let monitorIdxArray = [];
        displayInfoArray.forEach((displayInfo, disp_idx) => {
            let monitorInfo = Device.defaultMonitorInfo(disp_idx, displayInfo.id, displayInfo.workArea, displayInfo.isPrimary);
            monitorInfoArray.push(monitorInfo);
            monitorIdxArray.push(disp_idx + 1);
        })

        return {
            "monitorInfoArray": utils.sortByKey(monitorInfoArray, 'monitorIdx'),
            "monitorIdxArray": monitorIdxArray
        }
    }

    // compare device information
    static compareDeviceInfo(first, second) {
        return (first.deviceId === second.deviceId) &&
            (first.type === second.type) && (first.title === second.title) &&
            (first.border === second.border) && (first.color === second.color) &&
            (first.left === second.left) && (first.top === second.top) && (first.defSlotNum === second.defSlotNum) &&
            (JSON.stringify(first.modes) === JSON.stringify(second.modes)) &&
            (first.modeIndex === second.modeIndex) &&
            (JSON.stringify(first.monitorIdxArray) === JSON.stringify(second.monitorIdxArray));
    }

    // compare monitor resolution
    // in some cases, monitor resolution is changed 1 pixel. ignore it.
    async checkTinyChanged(diff = 10) {
        const displayInfoArray = await chrome.system.display.getInfo();

        // check monitor count is changed.
        if (displayInfoArray.length!== this.activeMode().monitorIds.length) {
            return false;
        }

        return displayInfoArray.every((displayInfo) => {
            const monitorInfo = this.monitorInfoArray.find(monitorInfo => monitorInfo.monitorId === displayInfo.id);
            if(!monitorInfo) {
                return false;
            }

            const rect1 = monitorInfo.boundRect;
            const rect2 = displayInfo.workArea;

            return  rect1.left === rect2.left && rect1.top === rect2.top &&
                    rect1.width === rect2.width && Math.abs(rect1.height - rect2.height) <= rect1.height * 0.01;
        });
    }

    // check the change of monitor physically and update monitorInfoArray
    async initializeMonitors() {
        const displayInfoArray = await chrome.system.display.getInfo();

        let isChanged = false;
        let updatedMonitorInfoArray = [];

        // update monitorInfoArray with physical info
        this.monitorInfoArray.forEach(monitorInfo => {
            const displayInfo = displayInfoArray.find(displayInfo => displayInfo.id === monitorInfo.monitorId);

            // check change of physical info
            if(displayInfo) {
                const boundRect = { ...displayInfo.workArea, height: Math.round(displayInfo.workArea.height / 4) * 4 }
                if(monitorInfo.isPrimary !== displayInfo.isPrimary || !utils.compareRect(monitorInfo.boundRect, boundRect)) {
                    monitorInfo.isPrimary = displayInfo.isPrimary;
                    monitorInfo.boundRect = boundRect;

                    updatedMonitorInfoArray.push(monitorInfo);
                }
            } else {
                // monitor is removed physically
                const monitorIds = this.activeMode().monitorIds;
                const index = monitorIds.indexOf(monitorInfo.monitorId);
                if(index!= -1) {
                    monitorIds.splice(monitorIds.indexOf(monitorInfo.monitorId), 1);
                }
                isChanged = true;
            }
        })

        // if monitor is added physically, make default monitorInfo and add to monitorInfoArray
        const monitorInfoArray = this.getMonitorInfoArray();
        displayInfoArray.forEach(displayInfo => {
            const index = this.monitorInfoArray.findIndex(monitorInfo => monitorInfo.monitorId === displayInfo.id);
            if(index == -1) {
                const monitorIdx = this.monitorIdxArray.length + 1;
                this.monitorInfoArray.push(Device.defaultMonitorInfo(monitorIdx, displayInfo.id, displayInfo.workArea, displayInfo.isPrimary, this.modes.length));
                this.monitorIdxArray.push(monitorIdx);

                // update active mode
                this.activeMode().monitorIds.push(displayInfo.id);
                isChanged = true;
            } else {
                // compare with active mode
                if(!monitorInfoArray.find(monitorInfo => monitorInfo.monitorId === displayInfo.id)) {
                    this.activeMode().monitorIds.push(displayInfo.id);
                    isChanged = true;
                }
            }
        })

        // sort monitorInfoArray according the monitorIdx
        this.monitorInfoArray = utils.sortByKey(this.monitorInfoArray, "monitorIdx");

        return {
            isChanged: isChanged,
            updated_infos: updatedMonitorInfoArray
        }
    }

    // update properties using info
    updateDevice(info) {
        this.deviceId = info.deviceId || "";        // The ID of device
        this.type = info.type || "desktop";         // device type ( laptop || desktop || phone )
        this.title = info.title || "";              // device caption
        this.border = info.border || "dashed";      // device border style
        this.color = info.color || "#ffffff";       // device background color
        this.left = info.left ?? 1;                 // device x position
        this.top = info.top ?? 0;                   // device y position
        this.defSlotNum = info.defSlotNum;          // default slot number for un-ruled url
        this.synced_at = info.synced_at;            // synced time with server
        this.updated_at = info.updated_at;          // uploaded time to server

        this.modes = info.modes ? [...info.modes] : [{
            name: 'default',
            monitorIds: [],
            devicesInLayout :  [],
        }];
        this.modeIndex = info.modeIndex || 0;                                                                   // current mode index

        this.monitorIdxArray = info.monitorIdxArray ? [...info.monitorIdxArray] : [];         // monitor ID corresponse table.( chrome index => OS index )
    }

    // get monitorInfor array for current mode
    getMonitorInfoArray(modeIndex = -1, sortKey = 'monitorOrder') {
        let monitorInfoArray = [];
        const index = (modeIndex === -1) ? this.modeIndex : modeIndex;
        const monitorIds = this.modes[index].monitorIds;
        this.monitorInfoArray.forEach(monitorInfo => {
            // get current mode's monitors
            if(monitorIds.includes(monitorInfo.monitorId)) {
                monitorInfoArray.push({
                    monitorIdx : monitorInfo.monitorIdx,
                    monitorId : monitorInfo.monitorId,
                    isPrimary : monitorInfo.isPrimary,
                    boundRect : monitorInfo.boundRect,
                    monitorOrder : monitorInfo.monitorOrder[index],
                    useThis : monitorInfo.useThis[index],
                    layoutId: monitorInfo.layoutId[index],
                    deviceId: this.deviceId,
                })
            }
        })

        return utils.sortByKey(monitorInfoArray, sortKey);
    }

    // get monitorInfor array for current mode
    setMonitorInfoArray(monitorInfoArray) {
        const monitorInfos = [];
        monitorInfoArray.forEach(monitorInfo => {
            monitorInfos.push( new MonitorInfo(monitorInfo) );
        })

        this.monitorInfoArray = utils.sortByKey(monitorInfos, "monitorIdx");
    }

    // update monitotInfo
    updateMonitorInfo(info) {
        let monitorInfo = this.monitorInfoArray.find(monitor => monitor.monitorId === info.monitorId);

        if(monitorInfo){
            for (let key in monitorInfo) {
                if (info.hasOwnProperty(key)) {
                    monitorInfo[key] = info[key];
                }
            }
        } else {
            this.monitorInfoArray.push(new MonitorInfo(info));
            this.monitorInfoArray = utils.sortByKey(this.monitorInfoArray, 'monitorIdx');
        }
    }

    // remove monitor
    removeMonitorInfo(monitorId) {
        const monitorIdx = this.monitorInfoArray.find(monitor => monitor.monitorId === monitorId)?.monitorIdx ?? -1;

        this.monitorInfoArray = this.monitorInfoArray.filter(monitor => monitor.monitorId === monitorId);
        this.monitorInfoArray = utils.sortByKey(this.monitorInfoArray, 'monitorIdx');

        // update modes
        this.modes.forEach(mode => {
            const monitorIds = [...mode.monitorIds];
            monitorIds.forEach((monitorId, index) => {
                if(!this.monitorInfoArray.find(item => item.monitorId === monitorId)) {
                    mode.monitorIds.splice(index, 1);
                }
            })
        })

        // update monitorIdxArray
        this.monitorIdxArray = this.monitorIdxArray.filter(_monitorIdx => _monitorIdx!== monitorIdx);
    }

    // set update time of monitor
    setUpdateTimeOfMonitor(monitorId, updated_at) {
        let index = this.monitorInfoArray.findIndex(monitor => monitor.monitorId === monitorId);
        if(index > -1) {
            this.monitorInfoArray[index].updated_at = updated_at;
        }
    }

    // draw the ith monitorLayout and add slot numbers
    draw_ith_Monitor(monitorInfo, options, startSlot = 1, scaleX = 1, scaleY = 1) {
        options = { dottedFlag: 0, showCloseFlag: 0, dragFlag: 0, showSlotNum: 1, ...options, }

        const layoutId = monitorInfo.layoutId;
        let html = `<div class="layout-grid">`;

        if (utils.Layouts[layoutId] && utils._layouts[utils.Layouts[layoutId].idx].class) {
            let slotNum = startSlot;
            utils._layouts[utils.Layouts[layoutId].idx].class.forEach((layoutCls, idx) => {
                const res = utils.insertDivSection(layoutCls, options.showSlotNum ? slotNum : '', {...options, scaleX: scaleX, scaleY: scaleY });
                html += res.html;
                slotNum += res.count;
            });
        }
        html += `</div>`;

        return html;
    }

    // caller: "popup"|"option"|"content"|"", { dottedFlag : 0|1, showCloseFlag : 0|1, dragFlag : 0|1 }
    drawAllMonitors(info, options, startSlot) {
        options = { dottedFlag: 0, showCloseFlag: 0, dragFlag: 0, ...options }
        info = { caller: "", isMyDevice: false, ...info }
        let startSlotOfMonitor = startSlot;

        const modeIndex = info.modeIndex ?? -1;
        const monitorInfoArray = this.getMonitorInfoArray(modeIndex);

        // get total bound Rect
        const { rateX, rateY, boundRect } = Device.getBoundRect(monitorInfoArray, info.caller !== 'option');

        let htmlArray = new Array();

        for (let i = 0; i < monitorInfoArray.length; i++) {
            let monitorInfo = monitorInfoArray[i];
            if (info.caller !== 'option' && !monitorInfo.useThis) continue;

            let rect = monitorInfo.boundRect;
            let offsetX = parseInt(rect.left * rateX - boundRect.left);
            let offsetY = parseInt(rect.top * rateY - boundRect.top);
            let scaleX = rect.width * rateX / 120;
            let scaleY = rect.height * rateY / 72;

            let orient = 'landscape';
            if (rect.width < rect.height) {
                orient = 'portrait';
                scaleX = rect.height * rateX / 120;;
                scaleY = rect.width * rateY / 72;
            }

            let orderNum = monitorInfo.monitorOrder;
            if (orderNum == 1000) orderNum = '';

            let preview_html = `<div class="layout-monitor${orient=='portrait' ? ' portrait' : ''}" id="previewMonitor${monitorInfo.monitorIdx}" ` +
                `style="text-align:center; transform: translate(${offsetX}px,${offsetY}px) scaleX(${scaleX}) scaleY(${scaleY}); border-bottom-width:${1/scaleY}px; border-top-width:${1/scaleY}px; border-left-width:${1/scaleX}px; border-right-width:${1/scaleX}px;"`;
            preview_html += info.caller === "option" ? ` title="${rect.width} x ${rect.height}">` : `>`;

            if (info.caller === "option") {
                const slotCount = utils.getSlotCount(monitorInfo.layoutId);
                preview_html += `<div class="monitor-order-mark" style="transform: ${monitorInfo.useThis && (slotCount==1 || slotCount==9) ? 'translate(-13px,-7px)' : ''} scaleX(${(1/scaleX)}) scaleY(${(1/scaleY)})">${(orderNum<10 ? '&nbsp;' : '') + orderNum}&nbsp;</div>`;
                if (monitorInfo.isPrimary && info.isMyDevice) {
                    preview_html += `<div class="primary-div" style="background-color:` + DATA_Z.layout_preview_primary_backcolor + `">&nbsp;PRIMARY&nbsp;</div>`;
                }
            }

            if (monitorInfo.useThis) {
                preview_html += this.draw_ith_Monitor(monitorInfo, options, startSlotOfMonitor, (1 / scaleX), (1 / scaleY));
            } else {
                preview_html += `<div class="layout-grid"><div class="nouse-div">free</div></div>`;
            }

            if (info.caller === "popup") {
                preview_html += `<div class="active-order-Corner" style="background-color:` + DATA_Z.layout_preview_activeorder_backcolor +
                    `;transform: scaleX(${1 / scaleX}) scaleY(${1 / scaleY});">&nbsp;${orderNum}&nbsp;</div>`;
                preview_html += `<div class="close monitor-close" style="transform: scaleX(${1/scaleX}) scaleY(${1/scaleY});" id=w${monitorInfo.monitorIdx}>x</div>`;
            }

            preview_html += `</div>`;

            htmlArray.push(preview_html);

            // increase slot number
            startSlotOfMonitor += Number(utils.getSlotCount(monitorInfo.layoutId));
        }

        return {
            width: parseInt(boundRect.right - boundRect.left),
            height: parseInt(boundRect.bottom - boundRect.top),
            htmlArray: htmlArray
        }
    }

    // draw device
    drawDevice(info, options, startSlot = 1) {
        const res =  this.drawAllMonitors(info, options, startSlot);
        let strDeviceHtml = `<div class='device-inner-header ${this.type}'><div class='device-title'>${this.title}</div>`;
        strDeviceHtml += `</div><div class='device-inner-wrapper' style='width:${parseInt(res.width - 2)}px; ` +
            `height:${parseInt(res.height - 4)}px; background-color:${this.color}; border-style:${this.border}'>`;

        let monitorHtml = ``
        res.htmlArray.forEach(html => {
            monitorHtml += html;
        })

        let strHtml = `<div device_id=${this.deviceId} class="layout-device${info.isMyDevice ? ' my-device' : ''}">`;
        strHtml += `${strDeviceHtml}${monitorHtml}</div></div>`;

        return { width: res.width, height: res.height, strHtml }
    }

    // get bound rect of all monitors
    static getBoundRect(monitorInfoArray, onlyUseThis = false) {
        let width, height;
        for (let i = 0; i < monitorInfoArray.length; i++) {
            const monitorInfo = monitorInfoArray[i];
            if (monitorInfo.isPrimary) {
                let rect = monitorInfo.boundRect;
                width = rect.width;
                height = rect.height;
                if (width < height) {
                    width = rect.height;
                    height = rect.width;
                }
                break;
            }
        }

        let rateX = 120 / width;
        let rateY = 72 / height;

        let boundRect = { top: 0, left: 0, bottom: 0, right: 0 };
        for (let i = 0; i < monitorInfoArray.length; i++) {
            const monitorInfo = monitorInfoArray[i];
            if (onlyUseThis && !monitorInfo.useThis) continue;

            let rect = monitorInfo.boundRect;
            let offsetX = parseInt(rect.left * rateX);
            let offsetY = parseInt(rect.top * rateY);

            if (boundRect.left > offsetX) boundRect.left = parseInt(offsetX);
            if (boundRect.top > offsetY) boundRect.top = parseInt(offsetY);
            if (boundRect.bottom < offsetY + rect.height * rateY) boundRect.bottom = parseInt(offsetY + rect.height * rateY);
            if (boundRect.right < offsetX + rect.width * rateX) boundRect.right = parseInt(offsetX + rect.width * rateX);
        }

        return { rateX, rateY, boundRect };
    }

    // set the monitor ordernum
    setOrderNum(monitorIdx, newOrder) {
        let newIndex = -1;
        let oldOrder = 1000;
        let oldIndex = -1;
        this.monitorInfoArray.forEach((monitorInfo, idx) => {
            if (monitorInfo.monitorIdx == monitorIdx) {
                newIndex = idx;
                oldOrder = monitorInfo.monitorOrder[this.modeIndex];
            }

            if (monitorInfo.monitorOrder[this.modeIndex] == newOrder) {
                oldIndex = idx;
            }
        });

        if (newIndex != -1) {
            this.monitorInfoArray[newIndex].monitorOrder[this.modeIndex] = newOrder;
        }

        if (oldIndex != -1) {
            this.monitorInfoArray[oldIndex].monitorOrder[this.modeIndex] = oldOrder;
        }

        return [newIndex, oldIndex];
    }

    // set the ith monitor's useThis
    setUseThis(monitorIdx, useThis) {
        let monitorCount = this.monitorInfoArray.length;
        for (let idx = 0; idx < monitorCount; idx++) {
            let monitorInfo = this.monitorInfoArray[idx];
            if (monitorInfo.monitorIdx == monitorIdx) {
                if (useThis) {
                    monitorInfo.useThis[this.modeIndex] = true;
                    for (let i = 1; i < monitorCount + 1; i++) {
                        let isExist = false;
                        this.monitorInfoArray.forEach((m) => {
                            if (m.monitorOrder[this.modeIndex] == i) {
                                isExist = true;
                            }
                        })

                        if (!isExist) {
                            monitorInfo.monitorOrder[this.modeIndex] = i;
                            break;
                        }
                    }
                } else {
                    this.monitorInfoArray.forEach((m) => {
                        if (m.monitorOrder[this.modeIndex] != 1000 && m.monitorOrder[this.modeIndex] > monitorInfo.monitorOrder[this.modeIndex]) {
                            m.monitorOrder[this.modeIndex]--;
                        }
                    })
                    monitorInfo.useThis[this.modeIndex] = false;
                    monitorInfo.monitorOrder[this.modeIndex] = 1000;
                }

                break;
            }
        }
    }

    // set all monitor's useThis true and arragnge monitors automatically.
    activateAllMonitors() {
        this.monitorInfoArray.forEach(monitorInfo => {
            monitorInfo.useThis[this.modeIndex] = true;
        })

        this.autoOrderMonitors();
    }

    // arrange monitors using ordermode
    async autoOrderMonitors(orderMode = null) {
        if(!orderMode) {
            orderMode = await utils.getDefaultMonitorOrdering();
        }
        let monitor_infos = new Array();
        let orderIdxs = new Array();
        let block = { left: 0, top: 0, width: 1920, height: 1080, }

        this.monitorInfoArray.forEach((monitorInfo, idxMonitor) => {
            monitorInfo.monitorOrder[this.modeIndex] = 1000;
            if (monitorInfo.useThis[this.modeIndex]) {
                let monitor = {
                    monitorIdx: idxMonitor,
                    x: parseInt(monitorInfo.boundRect.left + monitorInfo.boundRect.width / 2),
                    y: parseInt(monitorInfo.boundRect.top + monitorInfo.boundRect.height / 2),
                    r: Math.min(monitorInfo.boundRect.width, monitorInfo.boundRect.height) * 0.5,
                    check: false,
                };
                // 1. Set the starting block for visits.
                if (monitorInfo.isPrimary) {
                    monitor.check = true;
                    orderIdxs.push(monitor.monitorIdx);

                    block.left = monitorInfo.boundRect.left;
                    block.top = monitorInfo.boundRect.top;
                    block.width = monitorInfo.boundRect.width;
                    block.height = monitorInfo.boundRect.height;
                }
                monitor_infos.push(monitor);
            }
        });

        let visit_path = [];
        var tmpMonitors = [...monitor_infos];
        if (orderMode == "Counter clockwise" || orderMode == "Clockwise") {
            switch (orderMode) {
                case "Counter clockwise":
                    visit_path = ['left-right', 'bottom-top', 'right-left', 'top-bottom']
                    break;
                case "Clockwise":
                    visit_path = ['right-left', 'bottom-top', 'left-right', 'top-bottom']
                    break;
            }

            let iBlock = 0,
                iPath = 0,
                diff = 0,
                counter = -1,
                counter1 = 0;
            do {
                // 2. Decide which block to visit next.
                counter++;
                if (counter > diff) {
                    counter1++;
                    if (counter1 > 1) {
                        diff++;
                        counter1 = 0;
                    }
                    iPath++;
                    counter = 0;
                }
                iBlock++;

                switch (visit_path[iPath % 4]) {
                    case "left-right":
                        block.left += block.width;
                        break;
                    case "bottom-top":
                        block.top -= block.height;
                        break;
                    case "right-left":
                        block.left -= block.width;
                        break;
                    case "top-bottom":
                        block.top += block.height;
                        break;
                }

                // 3. while visiting all blocks, check monitors in selected block.
                monitor_infos.filter(m => !m.check).forEach((m) => {
                    if (block.left < m.x && m.x < block.left + block.width && block.top < m.y && m.y < block.top + block.height) {
                        orderIdxs.push(m.monitorIdx);
                        m.check = true;
                    }
                })
            } while (monitor_infos.filter(m => !m.check).length > 0 && iBlock < 100);
        } else {
            orderIdxs = [];
            switch (orderMode) {
                case "Counter clockwise":
                    visit_path = [{ mode: 'left-right', dir: 'top-bottom' },
                        { mode: 'top-bottom', dir: 'right-left' },
                        { mode: 'right-left', dir: 'bottom-top' },
                        { mode: 'bottom-top', dir: 'left-right' }
                    ];
                    break;
                case "Clockwise":
                    visit_path = [{ mode: 'right-left', dir: 'top-bottom' },
                        { mode: 'top-bottom', dir: 'left-right' },
                        { mode: 'left-right', dir: 'bottom-top' },
                        { mode: 'bottom-top', dir: 'right-left' }
                    ];
                    break;
                case "Rows, top to bottom":
                    visit_path = [{ mode: 'left-right', dir: 'top-bottom' }];
                    break;
                case "Rows, bottom to top":
                    visit_path = [{ mode: 'left-right', dir: 'bottom-top' }];
                    break;
                case "Columns, left to right":
                    visit_path = [{ mode: 'top-bottom', dir: 'left-right' }];
                    break;
                case "Columns, right to left":
                    visit_path = [{ mode: 'top-bottom', dir: 'right-left' }];
                    break;
            }

            let cntPath = 0;
            while (tmpMonitors.length > 0) {
                let firstMonitor = extractFirstMonitor(tmpMonitors, visit_path[cntPath].mode, visit_path[cntPath].dir);

                if (firstMonitor.last) {
                    cntPath++;
                    if (cntPath >= visit_path.length) cntPath = 0;
                }

                orderIdxs.push(firstMonitor.idx);

                for (let i = 0; i < tmpMonitors.length; i++) {
                    if (tmpMonitors[i].monitorIdx == firstMonitor.idx) {
                        tmpMonitors.splice(i, 1);
                        break;
                    }
                }
            }
        }

        orderIdxs.forEach((order, idx) => {
            this.monitorInfoArray[order].monitorOrder[this.modeIndex] = idx + 1;
        });

        function extractFirstMonitor(m_infos, mode, dir) {
            // 1. Sort by "mode".
            switch (mode) {
                case 'left-right':
                    m_infos = utils.sortByKey(m_infos, 'x');
                    break;
                case 'right-left':
                    m_infos = utils.descSortByKey(m_infos, 'x');
                    break;
                case 'top-bottom':
                    m_infos = utils.sortByKey(m_infos, 'y');
                    break;
                case 'bottom-top':
                    m_infos = utils.descSortByKey(m_infos, 'y');
                    break;
            }

            // 2. Extract slots that do not overlap with the "dir" direction.
            let tmp = new Array();
            tmp.push(m_infos[0]);
            for (let i = 1; i < m_infos.length; i++) {
                let flag = true;
                for (let j = 0; j < i; j++) {
                    if (intersect(m_infos[j], m_infos[i], mode)) {
                        flag = false;
                        break;
                    }
                }
                if (flag) tmp.push(m_infos[i]);
            }

            let ret = {
                idx: tmp[0].monitorIdx,
                last: true
            };

            // 3. get first(last) element
            if (mode == 'left-right' || mode == 'right-left') {
                if (dir == 'top-bottom') ret.idx = getMinElement(tmp, 'y').monitorIdx;
                if (dir == 'bottom-top') ret.idx = getMaxElement(tmp, 'y').monitorIdx;
            } else if (mode == 'top-bottom' || mode == 'bottom-top') {
                if (dir == 'left-right') ret.idx = getMinElement(tmp, 'x').monitorIdx;
                if (dir == 'right-left') ret.idx = getMaxElement(tmp, 'x').monitorIdx;
            }

            // 4. check this element is last element in current row(col)
            let mInfo;
            for (let i = 0; i < m_infos.length; i++) {
                if (m_infos[i].monitorIdx == ret.idx) {
                    mInfo = m_infos[i];
                    break;
                }
            }

            for (let i = 0; i < m_infos.length; i++) {
                if (m_infos[i].monitorIdx == ret.idx) continue;
                if (intersect(m_infos[i], mInfo, mode)) {
                    switch (mode) {
                        case 'left-right':
                            if (m_infos[i].x >= mInfo.x) ret.last = false;
                            break;
                        case 'right-left':
                            if (m_infos[i].x <= mInfo.x) ret.last = false;
                            break;
                        case 'top-bottom':
                            if (m_infos[i].y >= mInfo.y) ret.last = false;
                            break;
                        case 'bottom-top':
                            if (m_infos[i].y <= mInfo.y) ret.last = false;
                            break;
                    }

                    if (!ret.last) break;
                }
            }

            return ret;
        }

        function intersect(m1, m2, mode) {
            switch (mode) {
                case 'left-right':
                    return (Math.abs(m1.y - m2.y) <= m2.r);
                case 'right-left':
                    return (Math.abs(m1.y - m2.y) <= m1.r);
                case 'top-bottom':
                    return (Math.abs(m1.x - m2.x) <= m2.r);
                case 'bottom-top':
                    return (Math.abs(m1.x - m2.x) <= m1.r);
            }
        }

        function getMaxElement(array, key) {
            let v = array[0][key],
                idx = 0;
            array.forEach((a, i) => {
                if (a[key] > v) {
                    v = a[key];
                    idx = i;
                }
            });
            return array[idx];
        }

        function getMinElement(array, key) {
            let v = array[0][key],
                idx = 0;
            array.forEach((a, i) => {
                if (a[key] < v) {
                    v = a[key];
                    idx = i;
                }
            });
            return array[idx];
        }
    }

    // get slot count (slot count of only this device)
    getSlotCount(modeIndex = null) {
        if (modeIndex === null) {
            modeIndex = this.modeIndex;
        }

        let slotCount = 0;
        this.modes[modeIndex].monitorIds.forEach(monitorId => {
            const monitoInfo = this.monitorInfoArray.find(m => m.monitorId == monitorId);
            if(monitoInfo && monitoInfo.useThis[modeIndex]) {
                slotCount += utils.getSlotCount(monitoInfo.layoutId[modeIndex]);
            }
        });

        return slotCount;
    }

    // set the monitor monitorID
    setMonitorID(monitorIdx, newID) {
        let oldID = -1;
        let newIndex = -1;
        let oldIndex = -1;
        this.monitorIdxArray.forEach((Id, idx) => {
            if (idx == monitorIdx) {
                newIndex = idx;
                oldID = Id;
            }

            if (Id == newID) {
                oldIndex = idx;
            }
        });

        if (newIndex != -1) this.monitorIdxArray[newIndex] = newID;
        if (oldIndex != -1) this.monitorIdxArray[oldIndex] = oldID;
    }

    // add a new mode
    addMode(newName) {
        for (let i = 0; i < this.modes.length; i++) {
            if (newName === this.modes[i].name) {
                return false;
            }
        }

        const mode = {
            name: newName,
            monitorIds: this.monitorInfoArray.map(monitorInfo => monitorInfo.monitorId),
            devicesInLayout: []
        }

        this.modes.push(mode);

        // increase the monitor infor's properties
        this.monitorInfoArray.forEach((monitorInfo, idx) => {
            monitorInfo.layoutId.push(1);
            monitorInfo.monitorOrder.push(idx + 1);
            monitorInfo.useThis.push(true);
        })

        this.modeIndex = this.modes.length - 1;

        return true;
    }

    // duplicate the current mode
    duplicateMode(newName)  {
        let isExistName = false;
        do {
            if(isExistName) {
                newName = newName + "(1)";
                isExistName = false;
            }
            for (let i = 0; i < this.modes.length; i++) {
                if (newName === this.modes[i].name) {
                    isExistName = true;
                    break;
                }
            }
        } while(isExistName);

        const mode = {
            name: newName,
            monitorIds: [...this.modes[this.modeIndex].monitorIds],
            devicesInLayout: [],
        }

        this.modes.push(mode);

        // increase the monitor infor's properties
        this.monitorInfoArray.forEach((monitorInfo, idx) => {
            monitorInfo.layoutId.push(monitorInfo.layoutId[this.modeIndex]);
            monitorInfo.monitorOrder.push(monitorInfo.monitorOrder[this.modeIndex]);
            monitorInfo.useThis.push(monitorInfo.useThis[this.modeIndex]);
        })

        this.modeIndex = this.modes.length - 1;
        return true;
    }

    // remove mode
    removeMode(index) {
        if (this.modes.length <= 1 || index < 0 || index >= this.modes.length) {
            return false;
        }

        this.modes.splice(index, 1);
        if (this.modeIndex === index) {
            this.modeIndex = 0;
        } else if (this.modeIndex > index) {
            this.modeIndex--;
        }

        this.monitorInfoArray.forEach((monitorInfo, idx) => {
            monitorInfo.layoutId.splice(index, 1);
            monitorInfo.monitorOrder.splice(index, 1);
            monitorInfo.useThis.splice(index, 1);
        })

        return true;
    }

    // rename of mode
    renameMode(index, newName) {
        if (this.modes.length < 1 || index < 0 || index >= this.modes.length) {
            return false;
        }

        for (let i = 0; i < this.modes.length; i++) {
            if (newName === this.modes[i].name) {
                return false;
            }
        }

        this.modes[index].name = newName;
        return true;
    }

    // rename active mode
    renameActiveMode(newName) {
        return this.renameMode(this.modeIndex, newName);
    }

    // switch active mode
    switchMode(index) {
        if (this.modeIndex === index) {
            return false;
        } else {
            this.modeIndex = index;
            return true;
        }
    }

    // get active mode
    activeMode() {
        return this.modes[this.modeIndex];
    }

    // get active mode
    setActiveMode(modeName) {
        const index = this.modes.findIndex(mode => mode.name === modeName);
        if(index > -1) {
            return this.switchMode(index);
        }

        return false;
    }

    // compare mode
    compareMode(deviceInfo) {
        if (this.modeIndex !== deviceInfo.modeIndex || this.modes.length !== deviceInfo.modes.length) {
            return false;
        }

        for (let i = 0; i < this.modes.length; i++) {
            if (this.modes[i].name !== deviceInfo.modes[i].name) {
                return false;
            }
            if (JSON.stringify(this.modes[i].monitorIds)!== JSON.stringify(deviceInfo.modes[i].monitorIds)) {
                return false;
            }
            if (JSON.stringify(this.modes[i].devicesInLayout)!== JSON.stringify(deviceInfo.modes[i].devicesInLayout)) {
                return false;
            }
        }

        return true;
    }

    // set layout id
    setLayoutId(layoutId, monitorIdx) {
        this.monitorInfoArray[monitorIdx].layoutId[this.modeIndex] = layoutId;
    }

    // export device info for sharing to supabase
    exportDeviceInfo(deviceInfo = null) {
        const info = deviceInfo ? deviceInfo : this;
        return {
            deviceId : info.deviceId,
            type : info.type,
            title : info.title,
            border : info.border,
            color : info.color,
            left : info.left,
            top : info.top,
            defSlotNum : info.defSlotNum,
            modes : [...info.modes],
            modeIndex : info.modeIndex,
            monitorIdxArray : [...info.monitorIdxArray],
        }
    }

    // check device is exactly same as the deviceInfo
    checkDeviceExactlyMatched(deviceInfo) {
        if(this.deviceId !== deviceInfo.deviceId)  return false;
        if(this.title !== deviceInfo.title)  return false;
        if(this.type !== deviceInfo.type)  return false;

        // check monitorId array
        if(this.monitorIdxArray.length!== deviceInfo.monitorIdxArray.length) return false;
        if(JSON.stringify(this.monitorIdxArray) !== JSON.stringify(deviceInfo.monitorIdxArray)) return false;

        // check device's monitorInfoArray.
        const myMonitorInfoArray = this.monitorInfoArray;
        const device = new Device(deviceInfo);
        const monitoInfoArray = device.monitorInfoArray;

        if(monitoInfoArray.length!== myMonitorInfoArray.length) return false;

        const matched = myMonitorInfoArray.every((element, index) => {
            const other = monitoInfoArray[index];
            return element.monitorId === other.monitorId && utils.compareRect(element.boundRect, other.boundRect);
        });
        if(!matched) return false;

        // check modes
        if(this.modeIndex !== deviceInfo.modeIndex) return false;
        if(this.modes.length !== deviceInfo.modes.length) return false;
        for(let i = 0; i < this.modes.length; i++) {
            const myMode = this.modes[i];
            const otherMode = deviceInfo.modes[i];
            if(myMode.name !== otherMode.name) return false;
            if(JSON.stringify(myMode.monitorIds) !== JSON.stringify(otherMode.monitorIds)) return false;
            if(JSON.stringify(myMode.devicesInLayout) !== JSON.stringify(otherMode.devicesInLayout)) return false;
        }

        return true;
    }

    // check if active mode is matched.
    checkMonitorMatched(monitorInfoArray) {
        const mainMonitor = this.monitorInfoArray.find(info => info.isPrimary);
        const otherMainMonitor = monitorInfoArray.find(info => info.isPrimary);
        if(!mainMonitor || !otherMainMonitor) return 2; // "no-matched"

        const primaryMatched = utils.compareRect(mainMonitor.boundRect, otherMainMonitor.boundRect);

        if(!primaryMatched) {
            return 2; // "no-matched"
        }

        const myMonitorInfoArray = this.getMonitorInfoArray(-1, 'monitorIdx');
        if(myMonitorInfoArray.length!== monitorInfoArray.length) {
            return 1; // "partial-match"
        }

        const additionalMatched = myMonitorInfoArray.every((element, index) => {
            if(element.isPrimary) return true;
            return utils.compareRect(element.boundRect, monitorInfoArray[index].boundRect);
        });

        if(!additionalMatched) {
            return 1; // "partial-match"
        } else {
            return 0; // "exactly-matched"
        }
    }

    // check difference of deviceInfo with own monitors ( not only physical info, but also options(order, useThis...) )
    analyzeMonitorChange(otherInfos){
        const insert_infos = [], updated_infos = [], delete_ids = [];
        this.monitorInfoArray.forEach(monitorInfo => {
            const otherInfo = otherInfos.find(item => item.monitorId === monitorInfo.monitorId);
            if(otherInfo) {
                if(!MonitorInfo.compareMonitorInfo(monitorInfo, otherInfo)) {
                    updated_infos.push(monitorInfo);
                }
            } else {
                insert_infos.push(monitorInfo);
            }
        })

        otherInfos.forEach(monitorInfo => {
            if(!this.monitorInfoArray.find(item => item.monitorId === monitorInfo.monitorId)) {
                delete_ids.push(monitorInfo.monitorId);
            }
        })

        return { insert_infos, updated_infos, delete_ids }
    }

    // compare monitorInfos
    compareMonitorInfo(otherInfos) {
        if(this.monitorInfoArray.length!== otherInfos.length) return false;
        return this.monitorInfoArray.every((element, index) => {
            return MonitorInfo.compareMonitorInfo(element, otherInfos[index]);
        });
    }
}

/**
 * manage a profile
 */
export class Profile {
    constructor(info) {
        this.myDeviceId = info.myDeviceId;

        // initialize devices
        this.deviceArray = [];
        info.deviceArray.forEach(deviceInfo => {
            this.deviceArray.push(new Device(deviceInfo));
        });

        // initialize flik info array
        if (info.flikRuleArray) {
            this.flikRuleArray = info.flikRuleArray;
        }

        // initialize target info array
        if (info.targetInfoArray) {
            this.targetInfoArray = info.targetInfoArray;
        }
    }

    ////////////////// static functions //////////////////////////////
    // create
    static async create() {
        // create empty profile
        const profileInfo = {
            myDeviceId: "",
            deviceArray: [],
            flikRuleArray: [],
            targetInfoArray: [],
        };

        // get display information
        const displayInfoArray = await chrome.system.display.getInfo();

        // create new device
        const result = await Device.defaultMonitors(displayInfoArray);
        const deviceInfo = {
            deviceId: profileInfo.myDeviceId,
            updated_at: null,
            monitorInfoArray: result.monitorInfoArray,
            monitorIdxArray: result.monitorIdxArray,
        };

        const device = new Device(deviceInfo);
        profileInfo.deviceArray = [device];

        // auto ordering
        device.autoOrderMonitors();

        // save profile
        await chrome.storage.local.set(profileInfo);
    }

    // leave only myDevice
    static async clean() {
        return new Promise(async (resolve) => {
            const profileInfo = await Profile.load();
            const myDevice = profileInfo.deviceArray.find(device => device.deviceId === profileInfo.myDeviceId);
            profileInfo.deviceArray = [myDevice];

            // clear Flik Rule
            profileInfo.flikRuleArray.forEach(flikRule => {
                flikRule.slots = [flikRule.slots.find(slot => slot.deviceId === profileInfo.myDeviceId)];
            })

            // save profile
            await chrome.storage.local.set(profileInfo);
        })
    }

    // unregister my device data
    static async unregister() {
        const profileInfo = await Profile.load();

        // check devices in layouts
        const changedDeviceIds = [];
        profileInfo.deviceArray.forEach(device => {
            let changed = false;
            device.modes.forEach(mode => {
                if( mode.devicesInLayout.findIndex(deviceLayout => deviceLayout.deviceId === profileInfo.myDeviceId) > -1) {
                    changed = true;
                    mode.devicesInLayout = mode.devicesInLayout.filter(deviceLayout => deviceLayout.deviceId !== profileInfo.myDeviceId);
                }
            })

            if(changed) {
                changedDeviceIds.push(device.deviceId);
            }
        });

        // get display information
        const displayInfoArray = await chrome.system.display.getInfo();

        // create new device
        const result = await Device.defaultMonitors(displayInfoArray);
        const device = new Device({
            deviceId: "",
            monitorInfoArray: result.monitorInfoArray,
            monitorIdxArray: result.monitorIdxArray,
        });
        profileInfo.deviceArray = [device];

        device.autoOrderMonitors();

        // clear my device Id
        profileInfo.myDeviceId = "";

        // clear Flik Rule
        profileInfo.flikRuleArray = [];

        // save profile
        await chrome.storage.local.set(profileInfo);

        return changedDeviceIds;
    }

    // load
    static async load() {
        return new Promise((resolve) => {
            chrome.storage.local.get(["deviceArray", "myDeviceId", "flikRuleArray", "targetInfoArray"], function (result) {
                resolve({
                    deviceArray: result.deviceArray || [],
                    myDeviceId: result.myDeviceId || "",
                    flikRuleArray: result.flikRuleArray || [],
                    targetInfoArray: result.targetInfoArray || [],
                });
            });
        });
    }

    ///////////////// member functions //////////////////
    // initialize
    async initialize() {
        // check device change
        const myDevice = this.getMyDevice();
        const res = await myDevice.initializeMonitors();

        // save profile
        if(res.isChanged || res.updated_infos.length > 0) {
            this.saveDeviceArray();
        }
    }

    // check my device name is valid ( not empty or duplicate)
    isValidDeviceName(id = null) {
        const deviceId = id ? id : this.myDeviceId;
        const device = this.getDeviceById(deviceId);
        if(device.title === "") {
            return false;
        }

        for(let i = 0; i < this.deviceArray.length; i++) {
            if(this.deviceArray[i].deviceId != deviceId && this.deviceArray[i].title === device.title ) {
                return false;
            }
        }
        return true;
    }

    // import device into the device array
    addDevice(deviceInfo) {
        const device = this.getDeviceById(deviceInfo.deviceId);

        if (device) {
            device.updateDevice(deviceInfo);
        } else {
            this.deviceArray.push(new Device(deviceInfo));
        }

        // refresh rules
        this.refreshRules();
    }

    // import device and monitorInfoArray
    addDeviceAndMonitors(deviceInfo, monitorInfoArray, modeName) {
        let changed = false;
        let device = this.getDeviceById(deviceInfo.deviceId);
        if(!device) {
            // new device
            device = new Device(deviceInfo);
            device.setMonitorInfoArray(monitorInfoArray);

            this.deviceArray.push(device);
        } else {
            if(device.deviceId !== this.myDeviceId) {
                device.updateDevice(deviceInfo);
                device.setMonitorInfoArray(monitorInfoArray);
            } else {
                // make device. physical info : local data, configuration info : server data
                // new monitorInfoArray = device.monitorInfoArray + monitorInfoArray
                device.monitorInfoArray.forEach(monitor => {
                    const monitorInfo = monitorInfoArray.find(item => item.monitorId === monitor.monitorId);
                    if(!monitorInfo) {
                        monitorInfoArray.push( Device.defaultMonitorInfo(monitor.monitorIdx, monitor.monitorId, monitor.boundRect, monitor.isPrimary, deviceInfo.modes.length ));
                        deviceInfo.monitorIdxArray.push(Math.max(...deviceInfo.monitorIdxArray) + 1);

                        changed = true;
                    } else {
                        if(!MonitorInfo.compareLayout(monitorInfo, monitor)) {
                            monitorInfo.boundRect = monitor.boundRect;
                            monitorInfo.isPrimary = monitor.isPrimary;

                            changed = true;
                        }
                    }
                })

                // backup monitorIds of active mode
                const monitorIds = [...device.activeMode().monitorIds];

                // set device and monitors
                device.updateDevice(deviceInfo);
                device.setMonitorInfoArray(monitorInfoArray);

                // update / create mode
                const modeIndex = device.modes.findIndex(item => item.name === modeName);
                if(modeIndex > -1) {
                    if(device.modeIndex !== modeIndex) {
                        device.modeIndex = modeIndex;
                        changed = true;
                    }

                    if(JSON.stringify(device.activeMode().monitorIds)!== JSON.stringify(monitorIds)) {
                        device.modes[modeIndex].monitorIds = [...monitorIds];
                        changed = true;
                    }
                } else {
                    device.addMode(modeName);
                    device.modeIndex = device.modes.length - 1;
                    device.activeMode().monitorIds = [...monitorIds];

                    changed = true;
                }
            }
        }

        // refresh rules
        this.refreshRules();

        return changed;
    }

    // remove device from device array
    removeDevice(deviceId) {
        this.deviceArray = this.deviceArray.filter(device => device.deviceId !== deviceId);

        // check devices in layouts
        const changedDeviceIds = [];
        this.deviceArray.forEach(device => {
            let changed = false;
            device.modes.forEach(mode => {
                if( mode.devicesInLayout.findIndex(deviceLayout => deviceLayout.deviceId === deviceId) > -1) {
                    changed = true;
                    mode.devicesInLayout = mode.devicesInLayout.filter(deviceLayout => deviceLayout.deviceId !== deviceId);
                }
            })

            if(changed) {
                changedDeviceIds.push(device.deviceId);
            }
        });

        // refresh rules
        this.refreshRules();

        return changedDeviceIds;
    }

    // set device array
    setDeviceArray(deviceInfoArray) {
        this.deviceArray = [];
        deviceInfoArray.forEach((deviceInfo, index) => {
            this.deviceArray.push(new Device(deviceInfo));
        })

        // refresh rules
        this.refreshRules();
    }

    // save profile
    save(callbackFunction = 0) {
        chrome.storage.local.set({
            deviceArray: this.deviceArray,
            myDeviceId: this.myDeviceId,
            flikRuleArray: this.flikRuleArray,
            targetInfoArray: this.targetInfoArray,
        }, async function() {
            if (callbackFunction) callbackFunction();
        });
    }

    // save device array
    saveDeviceArray(callbackFunction = 0) {
        chrome.storage.local.set({
            deviceArray: this.deviceArray,
            myDeviceId: this.myDeviceId,
        }, function() {
            if (callbackFunction) callbackFunction();
        });
    }

    // check device array( added / deleted / changed name ).
    isDeviceArrayChanged(oldDeviceArray) {
        if(oldDeviceArray.length !== this.deviceArray.length) {
            return true;
        }

        for(let i = 0; i < oldDeviceArray.length; i++) {
            if( oldDeviceArray[i].deviceId !== this.deviceArray[i].deviceId ||
                oldDeviceArray[i].title !== this.deviceArray[i].title) {
                return true;
            }
        }

        return false;
    }

    // save flikinfo array
    saveFlikRule(callbackFunction = 0) {
        chrome.storage.local.set({
            flikRuleArray: this.flikRuleArray,
        }, function() {
            if (callbackFunction) callbackFunction();
        });
    }

    // get device using id
    getDeviceById(deviceId) {
        return this.deviceArray.find(device => device.deviceId === deviceId);
    }

    // get device index using id
    getDeviceIndexById(deviceId) {
        return this.deviceArray.findIndex(device => device.deviceId === deviceId);
    }

    // get my device
    getMyDevice() {
        return this.getDeviceById(this.myDeviceId);
    }

    // save target info array
    saveTargetInfo(callbackFunction = 0) {
        chrome.storage.local.set({
            targetInfoArray: this.targetInfoArray
        }, function() {
            if (callbackFunction) callbackFunction();
        });
    }

    // add a new mode
    addMode(deviceId, newName) {
        const device = this.getDeviceById(deviceId);
        if (!device.addMode(newName)) {
            return false;
        }

        // refresh rules
        this.flikRuleArray.forEach(flikRule => {
            flikRule.slots.find(e => e.deviceId === deviceId).values.push(0);
        })

        return true;
    }

    // remove mode
    removeMode(deviceId, index) {
        const device = this.getDeviceById(deviceId);
        if (!device.removeMode(index)) {
            return false;
        }

        // refresh rules
        // decrease slot array
        this.flikRuleArray.forEach(flikRule => {
            flikRule.slots.find(e => e.deviceId === deviceId).values.splice(index, 1);
        })

        return true;
    }

    // rename of mode
    renameMode(deviceId, index, newName) {
        const device = this.getDeviceById(deviceId);
        return device.renameMode(index, newName);
    }

    // switch active mode
    switchMode(deviceId, index) {
        const device = this.getDeviceById(deviceId);
        if(!device) return false;

        return device.switchMode(index);
    }

    // duplicate mode
    duplicateMode(deviceId, newName) {
        const device = this.getDeviceById(deviceId);
        if (!device.duplicateMode(newName)) {
            return false;
        }

        // refresh rules
        // increase slot array
        this.flikRuleArray.forEach(flikRule => {
            flikRule.slots.find(e => e.deviceId === deviceId).values.push(0);
        })

        return true;
    }

    // draw all devices according the deviceIDArray
    // info : { caller },
    // options: { dottedFlag, showCloseFlag, dragFlag },
    // mainDeviceId: id of main drawing device
    // returnType: "array" | "string"
    drawLayout(info, options, mainDeviceId = null, returnType = 'string') {
        if (!mainDeviceId) {
            mainDeviceId = this.myDeviceId;
        }

        let htmlInfoArray = [];
        let strHtml = '';
        let startSlot = 1;

        // get device array to draw
        const mainDevice = this.getDeviceById(mainDeviceId);
        if(!mainDevice) return;
        const deviceInfos = [...mainDevice.activeMode().devicesInLayout];
        deviceInfos.unshift({
            deviceId: mainDeviceId,
            left: mainDevice.left,
            top: mainDevice.top,
        })

        // get most left & top position and width & height
        let minLeft = Infinity, minTop = Infinity;
        for (let i = 0; i < deviceInfos.length; i++) {
            const deviceInfo = deviceInfos[i];
            if (deviceInfo.left < minLeft) {
                minLeft = deviceInfo.left;
            }

            if (deviceInfo.top < minTop) {
                minTop = deviceInfo.top;
            }
        }

        // draw devices
        let maxRight = 0, maxBottom = 0;
        deviceInfos.forEach(deviceInfo => {
            const device = this.getDeviceById(deviceInfo.deviceId);
            if(device){
                info.isMyDevice = (this.myDeviceId === deviceInfo.deviceId);
                const res = device.drawAllMonitors(info, options, startSlot);
                startSlot += device.getSlotCount();

                let strDeviceHtml = `<div class='device-inner-header ${device.type}'><div class='device-title'>${device.title}</div>`;
                strDeviceHtml += `</div><div class='device-inner-wrapper' style='width:${parseInt(res.width - 2)}px; ` +
                    `height:${parseInt(res.height - 4)}px; background-color:${device.color}; border-style:${device.border}'>`;

                const left = parseInt(deviceInfo.left - minLeft) * 125;
                const top = parseInt(deviceInfo.top - minTop) * 110;

                if (returnType === 'string') {
                    let monitorHtml = ``
                    res.htmlArray.forEach(html => {
                        monitorHtml += html;
                    })

                    const strStyle = `style="transform: translate(${left}px,${top}px);"`;
                    strHtml += `<div device_id=${device.deviceId} class="layout-device${info.isMyDevice ? ' my-device' : ''}" ${strStyle}>`;
                    strHtml += `${strDeviceHtml}${monitorHtml}</div></div>`;
                } else {
                    strDeviceHtml += `</div>`;
                    htmlInfoArray.push({
                        deviceId: device.deviceId,
                        deviceHtml: strDeviceHtml,
                        htmlArray: res.htmlArray,
                        left: deviceInfo.left,
                        top: deviceInfo.top,
                        height: res.height,
                        width: res.width,
                    });
                }

                // calculate total width and height
                if (left + res.width > maxRight) {
                    maxRight = left + res.width;
                }

                if (top + res.height > maxBottom) {
                    maxBottom = top + res.height;
                }
            }
        })

        const width = maxRight - minLeft + 10;
        const height = maxBottom - minTop + 20;

        strHtml = `<div class="layout-wrapper" style="width:${width}px; height:${height}px; ">${strHtml}</div>`;

        return { width, height, htmlInfoArray, strHtml }
    }

    // check the url is matched in filk rule - return null : No FLiK | { ...flikRule, mode(taget|flik|app), rule }
    analyzeUrl(url, options) {
        options = { checkFliked: true, ...options }
        var params = {};
        url.replace(
            new RegExp("([^?=&]+)(=([^&]*))?", "g"),
            function($0, $1, $2, $3) {
                params[$1] = $3;
            }
        );

        const device = this.getMyDevice();

        let target = params["FLiK"];
        if (options.checkFliked && target) { // suffix FLiK=slotNum
            return this.analyzeTarget(target);
        } else {
            for (const flikRule of this.flikRuleArray) {
                const slot = flikRule.slots.find(e => e.deviceId === this.myDeviceId).values[device.modeIndex];
                if(slot === 0) continue;

                let urlPattern = flikRule.url //.toLowerCase();
                if (!urlPattern || urlPattern === "") continue;
                if (urlPattern.substr(0, 8) == "https://") {
                    urlPattern = urlPattern.substr(8, urlPattern.length - 8);
                } else if (urlPattern.substr(0, 7) === "http://") {
                    urlPattern = urlPattern.substr(7, urlPattern.length - 7);
                }

                if (url.includes(urlPattern)) {
                    return {
                        url: flikRule.url,
                        slot: slot,
                        handling: flikRule.handling,
                        banding: flikRule.banding,
                        label: flikRule.label,
                        color: flikRule.color,
                        mode: "Flik",
                        rule: flikRule.url
                    }
                }
            }
        }

        return null;
    }

    // make the FLiKInfo with handling "auto" -- this means the handling is decided by slot type.
    static analyzeTarget(target) {
        return {
            url: "",
            slot: parseInt(target),
            handling: "Auto",
            banding: "Show & fade",
            label: DATA_Z.band_label,
            color: DATA_Z.band_color,
            mode: "Target",
            rule: "&FLiK=" + target
        }
    }

    // get current rule
    activeRules(deviceId) {
        if (this.flikRuleArray.length === 0) {
            return [];
        }
        const device = this.getDeviceById(deviceId);

        return this.flikRuleArray.map(info => {
            const rule = {...info }
            rule.slot = rule.slots.find(e => e.deviceId === deviceId)?.values[device.modeIndex] ?? 0;

            delete rule.slots;
            return rule;
        })
    }

    // add rule at the specified index
    addRule(rule, deviceId, rowIndex = -1) {
        // check the url is exist in the flikRuleArray already.
        const matchInfo = this.checkUrlMatch(rule.url);
        if (matchInfo.info == "empty" || matchInfo.info == "exact" || matchInfo.info == "invalid") return;

        // make new rule
        const newRule = {
            url: rule.url,
            handling: rule.handling || "Last tab",
            banding: rule.banding || "Show & fade",
            label: rule.label || DATA_Z.band_label,
            color: rule.color || DATA_Z.band_color,
        }

        newRule.slots = [];
        this.deviceArray.forEach(device => {
            const slots = {
                deviceId: device.deviceId,
                values: new Array(device.modes.length).fill(0),
            }
            if(deviceId === device.deviceId) {
                slots.values[device.modeIndex] = rule.slot || 0;
            }

            newRule.slots.push(slots);
        })

        // set the rowIndex to add
        if (matchInfo.info === "submatch") {
            rowIndex = matchInfo.index;
        }

        if (rowIndex === -1) {
            this.flikRuleArray.push(newRule);
        } else {
            this.flikRuleArray.splice(rowIndex, 0, newRule);
        }
    }

    // update rules
    updateRules(deviceId, flikRuleArray) {
        const deviceIndex = this.getDeviceIndexById(deviceId);
        const device = this.deviceArray[deviceIndex];

        const newInfoArray = [];
        for (let i = 0; i < flikRuleArray.length; i++) {
            const rule = flikRuleArray[i];
            const newRule = { ...rule }
            newRule.order_num = i+ 1;
            delete newRule.slot;

            // find in old rule array
            let oldRule = this.flikRuleArray.find(element => element.url === rule.url);
            if (oldRule) {
                newRule.slots = oldRule.slots;
            } else {
                newRule.slots = [];
                this.deviceArray.forEach(device => {
                    newRule.slots.push({
                        deviceId: device.deviceId,
                        values: new Array(device.modes.length).fill(0),
                    });
                })
            }
            newRule.slots.find(e => e.deviceId === deviceId).values[device.modeIndex] = rule.slot;

            newInfoArray.push(new FlikRule(newRule));
        }

        this.flikRuleArray = newInfoArray;
    }

    // insert rule at the specified index
    insertRule(info) {
        const rule = new FlikRule(info);
        const index = this.flikRuleArray.findIndex(rule => rule.url === info.url);
        if (index >= 0) {
            this.flikRuleArray[index] = rule;
        } else {
            this.flikRuleArray.push(rule);
            this.sortRules();
            console.log("insertRule: ", this.flikRuleArray);
        }
    }

    // update rule
    updateRule(oldRuleInfo, newRuleInfo) {
        const rule = new FlikRule(newRuleInfo);
        const index = this.flikRuleArray.findIndex(rule => rule.url === oldRuleInfo.url);
        if (index >= 0) {
            this.flikRuleArray[index] = rule;
        } else {
            this.flikRuleArray.push(rule);
        }

        this.sortRules();
    }

    // remove rule
    removeRule(url) {
        const index = this.flikRuleArray.findIndex(rule => rule.url === url);
        if(index >= 0) {
            this.flikRuleArray.splice(index, 1);
        }
    }

    // merge rules. direction means the dirction of merge
    mergeRules(rules, direction = "<<") {
        let firstRules, secondRules;
        if (direction === "<<") {
            firstRules = this.flikRuleArray;
            secondRules = rules;
        } else {
            firstRules = rules;
            secondRules = this.flikRuleArray;
        }

        const newRules = [];

        // merge rule base on main data
        for(let idx = 0; idx < firstRules.length; idx++) {
            const firstRule = firstRules[idx];
            const newRule = {
                url: firstRule.url,
                handling: firstRule.handling,
                banding: firstRule.banding,
                label: firstRule.label,
                color: firstRule.color,
                order_num: idx + 1,
            };

            const secondRule = secondRules.find((e) => e.url == firstRule.url);
            newRule.slots = [];
            this.deviceArray.forEach((device) => {
                const slot =  {
                    deviceId: device.deviceId,
                    values : device.modes.map((mode, index) => {
                        let value = firstRule.slots.find((e) => e.deviceId === device.deviceId)?.values[index]?? -1;
                        if(value == -1 && secondRule) {
                            value = secondRule.slots.find((e) => e.deviceId === device.deviceId)?.values[index]?? -1;
                        }

                        return value === -1 ? 0 : value;
                    })
                }

                newRule.slots.push(slot);
            })

            newRules.push(newRule);
        }

        this.flikRuleArray = newRules;
    }

    // sort rules accoring the order number
    sortRules() {
        this.flikRuleArray.sort((a, b) => {
            return a.order_num - b.order_num;
        });
    }

    // refresh rules.
    refreshRules() {
        this.flikRuleArray.forEach(rule => {
            const slots = [];
            this.deviceArray.forEach((device) => {
                const slot =  {
                    deviceId: device.deviceId,
                    values : device.modes.map((mode, index) => {
                        return rule.slots.find((e) => e.deviceId === device.deviceId)?.values[index]?? -1;
                    })
                }

                slots.push(slot);
            })

            rule.slots = slots;
        })
    }

    // check the url is conflict with already existed urls.
    checkUrlMatch(url, omitIndex = -1) {
        if (url === "") {
            return ({ info: "empty" });
        }

        // check url is valid
        if (!utils.isValidUrl(url)) {
            return ({ info: "invalid" });
        }

        for (let i = 0; i < this.flikRuleArray.length; i++) {
            if (i === omitIndex) continue;

            const flikRule = this.flikRuleArray[i];
            let flikUrl = utils.removeUrlPrefix(flikRule.url);

            let ret = utils.isMatched(url, flikUrl);
            if (ret === 1) {
                return ({ info: "exact", index: i });
            }

            if (ret === 2) {
                return ({ info: "submatch", index: i });
            }
        }

        return ({ info: "nomatch" });
    }

    // get slot count of specific device and mode
    getSlotCount(deviceId, modeIndex = null) {
        const device = this.getDeviceById(deviceId);
        if(modeIndex === null) {
            modeIndex = device.modeIndex;
        }
        let slotCount = device.getSlotCount(modeIndex);

        // get slot counts devices in layout
        device.modes[modeIndex].devicesInLayout.forEach(deviceLayout => {
            slotCount += this.getDeviceById(deviceLayout.deviceId)?.getSlotCount() ?? 0;
        })

        return slotCount;
    }

    // get device first slot number
    getDeviceFirstSlotNumber(maindDeviceId, deviceId) {
        let slotNumber = 1;
        if(maindDeviceId === deviceId) {
            return slotNumber;
        }

        const mainDevice = this.getDeviceById(maindDeviceId);
        slotNumber += mainDevice.getSlotCount();
        for(const deviceLayoutInfo of mainDevice.activeMode().devicesInLayout) {
            if (deviceLayoutInfo.deviceId == deviceId) {
                break;
            }
            slotNumber += this.getDeviceById(deviceLayoutInfo.deviceId).getSlotCount();
        }

        return slotNumber;
    }

    // check if all flik slots are validate
    validateSlot() {
        let slotCount = this.getSlotCount();
        for (const flikRule in this.flikRuleArray) {
            if (flikRule.slot <= 0 || flikRule.slot > slotCount) {
                return false;
            }
        }

        return true;
    }

    // add a targetInfo into the targetInfoArray
    pushTargetInfo(targetInfo) {
        this.targetInfoArray.push(new TargetInfo(targetInfo));
    }

    // check if all target slots are validate
    validateTargetSlot() {
        let slotCount = this.activeMode().getSlotCount();
        for (const targetInfo in this.targetInfoArray) {
            if (targetInfo.slot > slotCount) {
                return false;
            }
        }

        return true;
    }

    // make information object of synced rules per slot.(1-index)
    getRuleSyncedInfo(deviceId) {
        const deviceIdx = this.getDeviceIndexById(deviceId);
        const device = this.deviceArray[deviceIdx];

        let info = {};
        this.flikRuleArray.forEach(flik => {
            const slotNumber = flik.slots.find(e => e.deviceId === deviceId).values[device.modeIndex];
            if (slotNumber) {
                info[slotNumber] = (info[slotNumber] || 0) + 1;
            }
        });

        return info;
    }

    // convert slotIndex to device's internal slotIndex
    convertInternalSlotIndex(deviceId, slotIndex) {
        const myDevice = this.getDeviceById(this.myDeviceId);
        slotIndex -= myDevice.getSlotCount();

        for(const deviceLayout of myDevice.activeMode().devicesInLayout) {
            const device = this.getDeviceById(deviceLayout.deviceId);
            if (device.deviceId === deviceId) {
                break;
            }
            slotIndex -= device.getSlotCount();
        }

        return slotIndex;
    }

    // get deviceId contained slotIndex
    getContainerDevice(slotIndex) {
        const myDevice = this.getDeviceById(this.myDeviceId);
        slotIndex -= myDevice.getSlotCount();

        if(slotIndex < 0) {
            return myDevice.deviceId;
        }

        for(const deviceLayout of myDevice.activeMode().devicesInLayout) {
            const device = this.getDeviceById(deviceLayout.deviceId);
            slotIndex -= device.getSlotCount();
            if(slotIndex < 0) {
                return device.deviceId;
            }
        }

        return null;
    }
}
