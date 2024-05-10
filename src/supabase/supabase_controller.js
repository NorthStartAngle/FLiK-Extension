import { createClient, AuthChangeEvent, Session, User, AuthSession, SupabaseClient } from '@supabase/supabase-js'

///////////////////// For the supabase ///////////////////////////

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcnFqa3J4a3F3anN2Z3Z0aWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIwMDM0NzksImV4cCI6MTk5NzU3OTQ3OX0.fvE4hjxmButu-uFUIKuK-kJda13eaGKtwtMcvxB3lL0"
const SUPABASE_URL = "https://uprqjkrxkqwjsvgvtigb.supabase.co"
const utils = require('../js/utils');
import { Profile } from "../js/profile.js";

const onlinePollDuration = 15000;

class SupabaseController {
    constructor() {
        this._supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
            reconnectLimit: 5,          // Number of reconnection attempts
            reconnectInterval: 1000,    // Interval between reconnection attempts in milliseconds
        });
        this.setServerEventHandler();

        this.profile = null;                           // variable to keep global profile
    }

    // getter of profile ( to prevent reload profile each time )
    async getProfile() {
        if(this.profile){
            return this.profile;
        }

        this.profile = new Profile(await Profile.load());
        return this.profile;
    }

    // reload profile forcely
    async reloadProfile() {
        this.profile = new Profile(await Profile.load());
        return this.profile;
    }

    async getOnlineUsers() {
        var myStartDate = utils.subtractDateTimes(new Date(), onlinePollDuration);
        const resp = await this.from('users').select("user_id").gt('lastdt', myStartDate); //match({ lastdt: 2, name: 'Albania' })
        if (!resp.error) {
            return resp.data;
        }
    }

    // set auth notification event
    setServerEventHandler() {
        this._supabase.auth.onAuthStateChange(async(event, session) => {
            console.log("AuthState changed: ", event);
            switch (event) {
                case "SIGNED_IN":
                case "TOKEN_REFRESHED":{
                    // save user credential
                    const password = await utils.getPwd();
                    await utils.saveAccountInfo({
                        uuid: session.user.id,
                        email: session.user.email,
                        name: session.user.user_metadata.name,
                        password: password.tempPwd,
                        accessToken: session.access_token,
                        refreshToken: session.refresh_token
                    })

                    // update flik user list
                    await this.updateFlikUserList(session.user.id);

                    // const deviceId = await utils.loadMyDeviceId();
                    // this.startPacketHook(session.user.id, deviceId);

                    // sechdule re-create accessToken using refreshToken
                    setTimeout(async () => {
                        const refreshToken = await utils.getRefreshToken();
                        this._supabase.auth.refreshSession({refresh_token: refreshToken});
                    }, parseInt(session.expires_in - 120) * 1000);

                    break;
                }
                case "SIGNED_OUT":
                case "USER_DELETED": {
                    this.stopAllHook();
                    await utils.cleanAccountInfo();
                    // await this.updateFlikUserList({ uuid: null });
                    break;
                }
                case "PASSWORD_RECOVERY": {
                    const newpwd = await this.getResetPassword();
                    console.log("saved reset password=", newpwd.resetpassword);
                    // await this.saveAccountInfo({
                    //     uuid: session.user.id,
                    //     email: session.user.email,
                    //     name: session.user.user_metadata.name
                    // });

                    this.updatePwd(newpwd.resetpassword);
                    break;
                }
            }
        });
    }

    async getResetPassword() {
        let res = await chrome.storage.local.get(["resetpassword"]);
        return res
    }

    async updatePwd(newpwd) {
        const { data, error } = await this._supabase.auth.updateUser({ password: newpwd })
        console.log("updating password", data, error );
    }

    async updateFlikUserList(uuid = null) {
        if (uuid == null) {
            const accountInfo = await utils.getAccountInfo();
            uuid = accountInfo.accountId
        }

        let userInfoArray = [];

        if (uuid != undefined && uuid != null) {
            const { data, error } = await this._supabase
                .from("users")
                .select("user_id,name")
                .neq('user_id', uuid);
            if (!error) {
                userInfoArray = [...data];
            } else {
                console.log("while saving userlist, error is occured:", error);
            }
        }

        await utils.saveFlikUserlist(userInfoArray);
    }

    stopAllHook() {
        this._supabase.removeChannel(this._supabase.channel('flik'));
    }

    startPacketHook(userId, deviceId) {
        this._supabase.channel('flik')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, async payload => {
                console.log("user was added in supabase realtime");
                this.updateFlikUserList();
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shared_slots', filter: `receiver=eq.${deviceId}` }, async payload => {
                console.log("new row is inserted in shared_slot table.");
                this.handleInsertedSharedSlot(payload.new);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, async payload => {
                this.updateFlikUserList();
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'users' }, async payload => {
                console.log("user was removed in supabase realtime");
                this.updateFlikUserList();
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'enduser', filter: 'status=eq.TRUE', }, async payload => {
                console.log("user was activated in supabase realtime");
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'device_info', filter: `user_id=eq.${userId}`, }, async payload => {
                console.log("device_info table was updated");
                this.handleChangedDeviceInfo(payload.new);
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'device_info', filter: `user_id=eq.${userId}` }, async payload => {
                console.log("device_info table was inserted");
                this.handleChangedDeviceInfo(payload.new);
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'device_info', filter: `user_id=eq.${userId}` }, async payload => {
                console.log("device_info table was updated");
                this.handleRemovedDeviceInfo(payload.old);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'monitor_info' }, async payload => {
                console.log("monitor_info table was updated");
                this.handleChangedMonitorInfo(payload.new);
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'monitor_info' }, async payload => {
                console.log("monitor_info table was insert");
                this.handleChangedMonitorInfo(payload.new);
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'monitor_info'}, async payload => {
                console.log("monitor_info table remove a record");
                this.handleRemovedMonitorInfo(payload.old);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'flik_rule', filter: `user_id=eq.${userId}` }, async payload => {
                console.log("flik_rule table was updated");
                this.handleChangedRule(payload.old, payload.new);
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'flik_rule', filter: `user_id=eq.${userId}` }, async payload => {
                console.log("flik_rule table was insert");
                this.handleInsertedRule(payload.new);
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'flik_rule', filter: `user_id=eq.${userId}`}, async payload => {
                console.log("flik_rule table remove a record");
                this.handleRemovedRule(payload.old);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_status', filter: `user_id=eq.${userId}` }, async payload => {
                console.log("user_status table was updated");
                this.handleChangedUserStatus(payload.new);
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_status', filter: `user_id=eq.${userId}` }, async payload => {
                console.log("user_status table was insert");
                this.handleChangedUserStatus(payload.new);
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'user_status', filter: `user_id=eq.${userId}`}, async payload => {
                console.log("user_status table remove a record");
            })
            .subscribe(async(status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Realtime notification is subscribed.');
                }
            });
    }

    handleDisconnect = () => {
        this.stopPacketHook();
        this._supabase.realtime.disconnect();
        this._supabase.auth.signOut();
    }

    async getUsernameById(userID) {
        let { data: users, error } = await this._supabase
            .from('users')
            .select('name')
            .eq('user_id', userID)
            .limit(1)
            .single();
        console.log(users);
        if (!error) {
            return users["name"];
        } else {
            console.log("error while get user", error);
            return "unnamed";
        }
    }

    async getUserIDByName(username) {
        let { data: user, error } = await this._supabase
            .from('users')
            .select('user_id')
            .eq('name', username)
            .limit(1)
            .single();

        if (!error) {
            return user["user_id"];
        } else {
            return "none";
        }
    }

    async removeRecordFromDB(tblName, field, value,IsAll = false) {
        if(IsAll) {
            const { error } = await this._supabase
            .from(tblName)
            .delete()
            .neq('id',0);

            return { error };
        } else {
            const { error } = await this._supabase
            .from(tblName)
            .delete()
            .eq(field, value);

            return { error };
        }
    }

    async selectQuery(tblName, filter, fields, orderfield="id", ascending = true) {
        if (filter != null) {
            const { data, error } = await this._supabase
                .from(tblName)
                .select(fields)
                .match(filter)
                .order(orderfield, { ascending: ascending });
            return { data, error }
        } else {
            const { data, error } = await this._supabase
                .from(tblName)
                .select(fields)
                .order(orderfield, { ascending: ascending });
            return { data, error }
        }
    }

    async insertQuery(tblName, fields) {
        const { data, error } = await this._supabase
            .from(tblName)
            .insert(fields)
            .select();

        return { data, error };
    }

    async updateQuery(tblName, fields, filter) {
        const { data, error } = await this._supabase
            .from(tblName)
            .update(fields)
            .match(filter)
            .select();

        return { data, error };
    }

    async deleteQuery(tblName, eq_condition, gte_condition=null) {
        if(gte_condition == null) {
            const { data, error } = await this._supabase
            .from(tblName)
            .delete()
            .match(eq_condition);

            return { data, error };
        } else {
            const { data, error } = await this._supabase
            .from(tblName)
            .delete()
            .gte(gte_condition[0], gte_condition[1])
            .match(eq_condition);
            return { data, error };
        }
    }

    async getUsers() {
        const { data, error } = await this._supabase.rpc('getusers');
        return { data, error };
    }

    async sendPacketToUsers(receiver, data) {
        const accountInfo = await utils.getAccountInfo();
        console.log("send packet of uuid:", accountInfo.accountId, ",Receivers =", receiver);
        if (accountInfo.accountId == null) {
            return "UUID is not existed!";
        } else {
            const { result, error } = await this._supabase.rpc('func_create_packet_target', { owner: accountInfo.accountId, targets: receiver, datas: data });
            return error;
        }
    }

    async resetPassword(e_mail, redirect_url) {
        // await chrome.storage.local.set({resetpassword:newpassword});
        // const { data, error } = await this._supabase.auth.resetPasswordForEmail(`${e_mail}`,{ redirectTo:`${redirect_url}`, });
        const { data, error } = await this._supabase.auth.resetPasswordForEmail(`${e_mail}`, {
            redirectTo: redirect_url,
        })
        return { data, error };
    }

    // login to server using token
    async signInFromToken(accessToken, refreshToken) {
        const respone = await this._supabase.auth.setSession({
            refresh_token: refreshToken,
            access_token: accessToken
        })
        return respone;
    }

    // login to server using email and password
    async signIn(email, password) {
        const { data, error } = await this._supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        return { data, error };
    }

    async signUp(username, email, password) {

        const { data, error } = await this._supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: username,
                }
            }
        });
        if (error == null) {
            await utils.savePwd(password);
        }
        return { data, error };
    }

    async getRole() {
        const { error: sessionError } = await supabase_controller.AuthSession.update({
            role: "master",
        });
        if (sessionError) console.log("Role changed error=", sessionError);
        const { data, error } = await this._supabase.rpc('getuser_role');
        console.log("current role is", data, ", error =", error);
        return { data, error }
    }

    async signOut() {
        return await this._supabase.auth.signOut();
    }

    async getUserProfile(uuid) {
        const { data, error } = await this.selectQuery("users", { user_id: uuid }, "name,location,description,website,photo,banner")

        if (error == null && data.length == 1) {
            let result = data[0];
            result["result_status"] = "ok";
            return result;
        } else {
            return { result_status: "error" };
        }
    }

    async getStorageUrl(filter, bucket, folder) {
        const { data, error } = await this._supabase.storage
            .from(bucket)
            .list(folder, {
                limit: 100,
                offset: 0,
                search: filter
            });

        if (error == null) {
            if (data) {
                let _p = folder + '/' + data[0].name;
                let p = this._supabase.storage
                    .from(bucket)
                    .getPublicUrl(_p);

                return p.data.publicUrl;
            } else {
                return '';
            }
        } else
            return '';
    }

    async saveUserProfile(userProfile) {
        const { error } = await this._supabase
            .from('users')
            .update({ name: userProfile.name, location: userProfile.location, description: userProfile.bio, website: userProfile.website })
            .eq('user_id', userProfile.uuid);

        if (error) return { result_status: "error:" + error };

        const { data, err } = await this._supabase.storage
            .from('profile')
            .upload(`photo/1.png`, userProfile.photo, {
                contentType: 'image/png'
            })

        console.log("photo=", userProfile.photo);
        if (err) return { result_status: "error:" + err };

        const { data1, e } = await this._supabase.storage
            .from('profile')
            .upload(`banner/1.png`, userProfile.banner, {
                contentType: 'image/png'
            })

        console.log("banner=", userProfile.banner);
        if (e) return { result_status: "error:" + e };

        return { result_status: "ok" };
    }

    // event handler of device_info table
    async handleChangedDeviceInfo(row) {
        const myDeviceId = await utils.loadMyDeviceId();
        const profile = await this.getProfile();

        if(row.modifier !== myDeviceId) {
            row.synced_at = utils.getLocalTime();
            profile.addDevice(row);

            await utils.setDeviceChangedByServer();
            profile.saveDeviceArray();
        }
    }

    // event handler of device_info table
    async handleRemovedDeviceInfo(row) {
        const profile = await this.getProfile();
        const myDeviceId = profile.myDeviceId;

        // if deleted device is myDevice, unregister myDevice
        if(row.deviceId === myDeviceId) {
            await Profile.unregister();
            await this.reloadProfile();
            await utils.setDeviceDeletedByServer();
        } else {
            profile.removeDevice(row.deviceId);
            await utils.setDeviceChangedByServer();
            profile.saveDeviceArray();
        }
    }

    // event handler of monitor_info table
    async handleChangedMonitorInfo(row) {
        const myDeviceId = await utils.loadMyDeviceId();
        const profile = await this.getProfile();

        if(row.modifier !== myDeviceId) {
            const device = profile.getDeviceById(row.deviceId);
            if(device) {
                device.updateMonitorInfo(row);
                device.synced_at = utils.getLocalTime();
            }

            await utils.setDeviceChangedByServer();
            profile.saveDeviceArray();
        }
    }

    async handleRemovedMonitorInfo(row) {
        const profile = await this.getProfile();
        const myDeviceId = profile.myDeviceId;

        // if only deleted monitor is not myDevice
        if(row.deviceId !== myDeviceId) {
            const device = profile.getDeviceById(row.deviceId);
            if(device) {
                device.removeMonitorInfo(row.monitorId);
                await utils.setDeviceChangedByServer();
                profile.saveDeviceArray();
            }
        }
    }

    // event handler of flik_rule table
    async handleChangedRule(oldRow, newRow) {
        const profile = await this.getProfile();
        const myDeviceId = profile.myDeviceId;

        if(newRow.modifier !== myDeviceId) {
            profile.updateRule(oldRow, newRow);
            await utils.setRuleChangedByServer();
            profile.saveFlikRule();
        }
    }

    async handleInsertedRule(row) {
        const profile = await this.getProfile();
        const myDeviceId = profile.myDeviceId;

        if(row.modifier !== myDeviceId) {
            profile.insertRule(row);
            await utils.setRuleChangedByServer();
            profile.saveFlikRule();
        }
    }

    async handleRemovedRule(row) {
        const profile = await this.getProfile();
        const myDeviceId = profile.myDeviceId;

        if(row.modifier !== myDeviceId) {
            profile.removeRule(row.url);
            await utils.setRuleChangedByServer();
            profile.saveFlikRule();
        }
    }

    // event handler of user_status table
    async handleChangedUserStatus(row) {
        const profile = await this.getProfile();
        const myDeviceId = profile.myDeviceId;
        const locked = await utils.getLockFlag();

        if(row.status === 1) {
            if(row.modifier !== myDeviceId) {
                await utils.setEditLocker(row.modifier, row.note);
                await utils.addLog(`  ${utils.getLocalTime()}, locked by ${profile.getDeviceById(row.modifier)?.title || ''} : ${row.note}`);
                await utils.setLockFlag(true);
            }
        } else if (row.status === 0 && locked) {
            await utils.addLog(`  ${utils.getLocalTime()}, released lock : ${row.note}`);
            await utils.setLockFlag(false);
        }

        await utils.setLockedAt(row.updated_at);
    }

    // event handler of shared_slots table
    async handleInsertedSharedSlot(row) {
        const content = row.content;
        await utils.setFlikReceivedFlag(content.url, content.slotIndex, row.sender);

        // remove from db.
        await this.deleteQuery("shared_slots", { id: row.id });
    }

};

export const supabase_controller = new SupabaseController();