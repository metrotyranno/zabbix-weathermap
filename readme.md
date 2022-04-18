# zabbix-weathermap
A program that creates a weathermap to be used as a background in zabbix maps.

![chrome_sXgbCMtJUk](https://user-images.githubusercontent.com/335004/163728234-5e3640c6-8af2-42a1-89c1-7332ad0874c3.png)

## Features ##
* Get the bandwidth data from Zabbix
* Auto-Generate JSON Configuration from Zabbix Maps
* Create & Upload image to Zabbix
* Support for straight or curved (bezier) links.

## Caveats ##
* Zabbix's native link lines remain vissible. In order to 'fix' this you can use a custom adblock element filter: my.zabbix.domain.com##.map-links

## Requirements ##
* Zabbix 6.0 (Lower versions were not checked)
* NodeJS V16.13.0 (Lower versions were not checked)
* PM2 or some other method to run NodeJS Continuously
* Zabbix account with API access

## Installation ##

```bash
git clone https://github.com/metrotyranno/zabbix-weathermap.git
cd zabbix-weathermap
npm install
pm2 start . --name zabbix-weathermap
```

## Configuration ##
### Main Configuration ###
**config.json**
``` json
{
    "zabbix": {
        "url": "http://zabbix.company.com/zabbiz/api_jsonrpc.php",
        "user": "Admin",
        "password": "Password"
    },
    "updateInterval": "0 * * * * *" // Every minute
}
```
This configuration is fairly straight forward. Keep in mind that the protocol should be correct. If you use HTTPS, the API url should be HTTPS too.

### Map Configuration ###
The map configuration file is automatically generated on every run. It is created in a disabled state.

**mapname.json**
```json
{
    "name": "MAP NAME",
    "enabled": false,       //Set to true to draw / update the background image with a weathermap
    "colorMap": [           // The color map is used to convert the link utilization % to a color to draw with.
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
    "links": {
        "3": {
            "id": "3",
            "host1": {
                "id": "10377",
                "name": "LABEL1",
                "x": 525,
                "y": 824.5
            },
            "host2": {
                "id": "10374",
                "name": "LABEL2",
                "x": 525,
                "y": 325.5
            },
            "bandwidth": 10000,                                 // Link speed capacity in MBIT
            "items": {
                "inverted": false,                              // False: Keys below belong to host 1, True: Keys belong to host 2
                "upload": "net.if.out[ifHCOutOctets.1]",        // OUT item key
                "download": "net.if.in[ifHCInOctets.1]"         // IN item key
            },
            "link": {
                "type": "line"                                  // Line requires no additional arguments
            }
        },
        "12": {
            "id": "12",
            "host1": {
                "id": "10375",
                "name": "LABEL3",
                "x": 1425,
                "y": 824.5
            },
            "host2": {
                "id": "10415",
                "name": "LABEL4",
                "x": 525,
                "y": 1325.5
            },
            "bandwidth": 10000,                                 // Link speed capacity in MBIT
            "items": {
                "inverted": false,                              // False: Keys below belong to host 1, True: Keys belong to host 2
                "upload": "net.if.out[ifHCOutOctets.1]",        // OUT item key
                "download": "net.if.in[ifHCInOctets.1]"         // IN item key
            },
            "link": {
                "type": "curve",                                // Curve requires 2 control points to steer the curve with.
                "c1": {                                         // Anchor point 1
                    "x": 1425,
                    "y": 1325.5
                },
                "c2": {                                         // Anchor point 2
                    "x": 1425,
                    "y": 1325.5
                }
            }
        }
    }
}
```


## TODO's ##
- [ ] Include a legend / generation time
- [ ] Create a graphical interface to modify the JSON configuration. Particularly useful for finding / setting the source items & playing with the curves.
- [ ] Create a release with nodeJS embedded running as a service
- [ ] Clean up code
- [ ] Overall error detection & handeling, simple crashes / hangs now
- [ ] ?