//Import zabbix
import * as zabbix from './zabbix.js';

const imageCache = [];

function toInt32(bytes) {
    return (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
}

function getDimensions(data) {
    //base64 decode
    const buffer = Buffer.from(data, 'base64');
    //get dimensions
    const width = toInt32(buffer.slice(16, 20));
    const height = toInt32(buffer.slice(20, 24));
    return {
        width,
        height
    };
}

const getHostOffset = async (hostID) => {
    //Check if hostID is in cache
    if (imageCache[hostID]) {
        return imageCache[hostID];
    }

    //Get host icon
    const imageBase64 = await zabbix.getImage(hostID)

    //Get dimensions
    const dimensions = getDimensions(imageBase64);

    //Offset for host icon
    const offset = {
        x: dimensions.width / 2,
        y: dimensions.height / 2
    };

    //Add to cache
    imageCache[hostID] = offset;

    return offset;
}

const getColorFromColorMap = (map, value) => {
    //Loop over map
    for (const colorMap of map) {
        //Check if value is in range
        if (value >= colorMap.start && value <= colorMap.end) {
            return colorMap.color;
        }
    }
    return '#ff0000';
}


//Export functions
export {
    getHostOffset,
    getColorFromColorMap
}