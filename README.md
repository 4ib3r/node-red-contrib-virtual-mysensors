# node-red-virtual-mysensors
[![npm version](https://badge.fury.io/js/node-red-contrib-virtual-mysensors.svg)](https://badge.fury.io/js/node-red-contrib-virtual-mysensors)

## Info
This component add components and tcp gate compatible with
MySensors protocol.

## Gateway
Gateway define tcp port for server, and nodes for server.
Nodes add possibility to group sensors, each sensor has
auto generated id unique for node.

## Supported components
* MyGateway - TCP Gateway component
* MyBinary - S_BINARY
* MyDimmer - S_DIMMER
* MyHeater - S_HEATER
* MyIR - S_IR
* MyRGB - S_RGB
* MyScene - S_SCENE
* MyBarometer - S_BARO (V_HUM, V_TEMP, V_PRESSURE, V_FORECAST, I_BATTERY_LEVEL)
* MyDoor - S_DOOR (V_TRIPPED I_BATTERY_LEVEL)
* MyMotion - S_MOTION (V_TRIPPED I_BATTERY_LEVEL)
* MyHumidity - S_HUM (V_HUM, V_TEMP, I_BATTERY_LEVEL)
* MyTemperature - S_TEMP (V_HUM, V_TEMP, V_PRESSURE, I_BATTERY_LEVEL)

## Send non default values
For example each sensor can send battery level, each sensor check topic before send message,
if that contains message type for example I_BATTERY_LEVEL, and it supported by sensor, message subtype is set to that value.
<p>For simple set proper topic You can add MySetMsg component and select message type in this.</p>