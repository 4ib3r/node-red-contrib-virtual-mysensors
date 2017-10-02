# node-red-virtual-mysensors
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
* MyBarometer - S_BARO
* MyDoor - S_DOOR
* MyMotion - S_MOTION
* MyHumidity - S_HUM
* MyTemperature - S_TEMP

## Send non default values
For example each sensor can send battery level, each sensor check topic before send message,
if that contains message type for example I_BATTERY_LEVEL, message subtype is set to that value.
<p>For simple set proper topic You can add MySetMsg component and select message type in this.</p>