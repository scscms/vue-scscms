module.exports = {
    state:{
        data: {}
    },
    mutations:{
        SET_USER_INFO(state,obj) {
            if(typeof obj === "object"){
                state.data = obj;
            }
        },
        SET_USER_KEY_VALUE(state,obj) {
            if(obj.hasOwnProperty("key") && obj.hasOwnProperty("value")){
                state.data[obj.key] = obj.value;
            }
        }
    },
    actions:{
        set_userInfo: ({commit},obj) => {
            commit("SET_USER_INFO",obj);
        },
        set_userInfo_keyValue: ({commit},obj) => {
            commit("SET_USER_KEY_VALUE",obj);
        }
    }
};
