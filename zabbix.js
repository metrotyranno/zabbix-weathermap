//Import Modules
import fs from 'fs';
import axios from 'axios';

//Read config file
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

let authToken = null;

const request = (method, params) => {
    const requestObject = {
        jsonrpc: "2.0",
        method: method,
        params: params,
        auth: authToken,
        id: 1
    };

    //Check if method is unathenticated
    if (method === 'user.login' | method === 'user.checkAuthentication') {
        requestObject.auth = null;
    }

    return axios.post(config.zabbix.url, requestObject, {
        headers: {
            'Content-Type': 'application/json-rpc'
        }
    }).catch(error => {
        console.log(`Zabbix API Error: ${error.code}`);
        process.exit(1)
    });
}

// Create login method
const login = async () => {
    const response = await request('user.login', {
        user: config.zabbix.user,
        password: config.zabbix.password
    });
    authToken = response.data.result;
    return authToken;
}

const getMaps = async () => {
    const response = await request('map.get', {
        "output": "extend",
        "selectSelements": "extend",
        "selectLinks": "extend"
    });
    return response.data.result;
}

const updateImage = async (id, image) => {
    const response = await request('image.update', {
        "imageid": id,
        "image": image
    });
    return response.data;
}

const getImage = async (id) => {
    const response = await request('image.get', {
        "output": "extend",
        "imageids": id,
        "select_image": true
    });
    return response.data.result[0].image;
}

const getItem = async (host, key) => {
    const response = await request('item.get', {
        "output": "extend",
        "hostids": host,
        "search": {
            "key_": key
        }
    });
    return response.data.result[0] ? response.data.result[0].lastvalue : 0;
}

// Export methods
export {
    login,
    getMaps,
    updateImage,
    getImage,
    getItem
}