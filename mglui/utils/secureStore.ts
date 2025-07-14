import * as SecureStore from "expo-secure-store";

const setToken= async (t: string)=>{
    SecureStore.setItemAsync('token',t);
}

const setUser= async(user: object)=>{
    SecureStore.setItemAsync('user',JSON.stringify(user));
}

const setUserid= async(userid : string)=>{
    SecureStore.setItemAsync('userid',userid);
}

const getItem= async (key: string)=>{
    return await SecureStore.getItemAsync(key);
}

const delToken= async(key: string)=>{
    return await SecureStore.deleteItemAsync(key);
}

export default {setToken,getItem,delToken,setUser,setUserid}

