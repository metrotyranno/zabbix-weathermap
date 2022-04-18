import * as zabbix from './zabbix.js';
import {Canvas} from 'canvas'
import fs from 'fs';
import nodeCron from 'node-cron';
import {getHostOffset, getColorFromColorMap} from './utilities.js';

//Import canvas lines
import Line from './canvas/line.js';
import BezierCurve from './canvas/bezier.js';

//Read config
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const tick = async () => {
    console.log(`Starting a run...`)

    //Login to zabbix
    await zabbix.login();

    //Get maps
    const maps = await zabbix.getMaps();

    //For each map
    for (const map of maps) {
        const elements = [];
        const links = [];

        //Check if map does not exist
        if (!fs.existsSync(`./maps/${map.name}.json`)) {
            const defaultMap = {
                "name": map.name,
                "enabled": false,
                "colorMap": [
                    {
                        "start": 0,
                        "end": 0,
                        "color": "#c0c0c0"
                    },
                    {
                        "start": 0,
                        "end": 1,
                        "color": "#ffffff"
                    },
                    {
                        "start": 1,
                        "end": 10,
                        "color": "#8c00ff"
                    },
                    {
                        "start": 10,
                        "end": 25,
                        "color": "#2020ff"
                    },
                    {
                        "start": 25,
                        "end": 40,
                        "color": "#00c0ff"
                    },
                    {
                        "start": 40,
                        "end": 55,
                        "color": "#00f000"
                    },
                    {
                        "start": 55,
                        "end": 70,
                        "color": "#f0f000"
                    },
                    {
                        "start": 70,
                        "end": 85,
                        "color": "#ffc000"
                    },
                    {
                        "start": 85,
                        "end": 100,
                        "color": "#ff0000"
                    }
                ],
                "links": {}
            }

            //Write map to disk
            fs.writeFileSync(`./maps/${map.name}.json`, JSON.stringify(defaultMap, null, 4));
        }

        //Read map from disk
        const config = JSON.parse(fs.readFileSync(`./maps/${map.name}.json`));

        //Write data from API to an numbered array for easier processing
        for (const element of map.selements) {
            elements[element.selementid] = element
        }
        for(const element of map.links){
            links[element.linkid] = element
        }

        //Check if all links in the config still exist
        for (const [id, element] of Object.entries(config.links)) {
            if (!links[element.id]) {
                //Delete link from config
                console.log(`Deleting link ${id} from map ${map.name}`);
                delete config.links[id];
            }
        }

        //Create / update links in config
        for (const link of map.links) {
            //get host1 icon
            const host1icon = elements[link.selementid1].iconid_off;
            //get host2 icon
            const host2icon = elements[link.selementid2].iconid_off;

            //Get image offset
            const host1offset = await getHostOffset(host1icon);
            const host2offset = await getHostOffset(host2icon);

            config.links[`${link.linkid}`] = {
                "id": link.linkid,
                "host1": {
                    "id": elements[link.selementid1].elements[0] ? elements[link.selementid1].elements[0].hostid : null,
                    "name": elements[link.selementid1].label,
                    "x": Number(elements[link.selementid1].x) + host1offset.x,
                    "y": Number(elements[link.selementid1].y) + host1offset.y,
                },
                "host2": {
                    "id": elements[link.selementid2].elements[0] ? elements[link.selementid2].elements[0].hostid : null,
                    "name": elements[link.selementid2].label,
                    "x": Number(elements[link.selementid2].x) + host2offset.x,
                    "y": Number(elements[link.selementid2].y) + host2offset.y,
                },
                "bandwidth": typeof(config.links[link.linkid]) === "undefined" ? 1000 : typeof(config.links[link.linkid].bandwidth) === "undefined" ? 1000 : config.links[link.linkid].bandwidth,
                "items": {
                    "inverted": typeof(config.links[link.linkid]) === 'undefined' ? false : typeof(config.links[link.linkid].items.inverted) === 'undefined' ? false : config.links[link.linkid].items.inverted,
                    "upload": typeof(config.links[link.linkid]) === 'undefined' ? '' : typeof(config.links[link.linkid].items) === 'undefined' ? '' : typeof(config.links[link.linkid].items.upload) === 'undefined' ? '' : config.links[link.linkid].items.upload,
                    "download": typeof(config.links[link.linkid]) === 'undefined' ? '' : typeof(config.links[link.linkid].items) === 'undefined' ? '' : typeof(config.links[link.linkid].items.download) === 'undefined' ? '' : config.links[link.linkid].items.download
                },
                "link": typeof(config.links[link.linkid]) === 'undefined' ? {
                    type: 'line',
                } : config.links[link.linkid].link
            }
        }

        //Write config to disk after timeout
        fs.writeFileSync(`./maps/${map.name}.json`, JSON.stringify(config, null, 4));

        //Check if map is enabled
        if (config.enabled) {
            const canvas = new Canvas(parseInt(map.width), parseInt(map.height));
            const ctx = canvas.getContext('2d');

            //For every link
            for (const [id, link] of Object.entries(config.links)) {
                let bwUp, bwDwn;

                //If items upload or download not defined
                if (link.items.upload === '' || link.items.download === '' || link.host1.id === null ) {
                    bwUp = 0, bwDwn = 0;
                } else {
                    //Get item values
                    bwUp = await zabbix.getItem(link.items.inverted ? link.host2.id : link.host1.id, link.items.upload);
                    bwDwn = await zabbix.getItem(link.items.inverted ? link.host2.id : link.host1.id, link.items.download);

                    //convert bits to mbps
                    bwUp = bwUp / 1000000;
                    bwDwn = bwDwn / 1000000;
                }

                //Get percentage
                const upPercent = bwUp / link.bandwidth * 100;
                const dwnPercent = bwDwn / link.bandwidth * 100;

                //Clamp percent to 2 decimal places
                const upPercentClamped = upPercent.toFixed(2)
                const dwnPercentClamped = dwnPercent.toFixed(2)

                const upColor = getColorFromColorMap(config.colorMap, upPercent);
                const dwnColor = getColorFromColorMap(config.colorMap, dwnPercent);

                //Clamp bw to 0 decimals
                const upBwClamped = bwUp.toFixed(0);
                const dwnBwClamped = bwDwn.toFixed(0);

                const upLabel = `${upPercentClamped}%\n${(upBwClamped)} Mbit/s`
                const dwnLabel = `${dwnPercentClamped}%\n${(dwnBwClamped)} Mbit/s`

                //Check if link is a line
                if (link.link.type === 'line') {
                    //Create line
                    const line = new Line(ctx, link.host1, link.host2, 10, upColor, dwnColor, upLabel, dwnLabel, "black", 2);
                    //Draw line
                    line.draw();
                } else if (link.link.type === 'curve') {
                    //Create curve
                    const curve = new BezierCurve(ctx, link.host1, link.link.c1, link.link.c2, link.host2, 10, upColor, dwnColor, upLabel, dwnLabel, "black", 2, 100);
                    //Draw curve
                    curve.draw();
                }
            }

            //Write canvas to disk
            // fs.writeFileSync(`./maps/${map.name}.png`, canvas.toBuffer('image/png'));

            //Get map base64 image without header
            const base64 = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');

            //If background image is already set
            if (map.backgroundid) {
                //Upload image to zabbix
                await zabbix.updateImage(map.backgroundid, base64);
            } else {
                const image = await zabbix.createImage(map.name + " " + new Date().toLocaleString(), base64);

                //Update zabbix map to use new background
                await zabbix.setMapBackground(map.sysmapid, config.backgroundImage);
            }
        }
    }
    console.log(`Run finished`)
}

nodeCron.schedule(config.updateInterval, tick)
tick()