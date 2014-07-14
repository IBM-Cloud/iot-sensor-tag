## About 
This repo contains the code needed to connect to [IBM's IoT Cloud](https://internetofthings.ibmcloud.com/#/) 
and publish and retrieve data from a [Texas Instruments Sensor Tag](http://www.ti.com/tool/cc2541dk-sensor).

The publish directory contains a Node.js application that can be placed on any device connected to the internet
and can use Bluetooth low-energy (LE) to connect to the Sensor Tag.  This application publishes sensor data from the
Sensor Tag to the IBM IoT Cloud.

The publish directory contains a Node.js application which connects to the IBM IoT Cloud and uses the Sensor Tag data
in various ways.  

* One application allows you to control an HTML 5 presentation deck with the
Sensor Tag buttons.  
* The other application visualizes the temperature, accelerometer, gyroscope, and magnetometer
data from the Sesnor Tag.

Here is a diagram that describes how the apps work with the IBM IoT Cloud and Bluemix.

<img src="subscribe/public/sensor-tag.jpg"/>

## License
This code is licensed under Apache v2.  See the LICENSE file in the root of
the repository.