## Sensor Tag IoT Cloud

## About
This Node.js app allows you to connect to a [TI Sensor Tag](http://www.ti.com/tool/cc2541dk-sensor), retrieve 
data from its sensors, and publish that data to the [IBM IoT Cloud](https://internetofthings.ibmcloud.com/#/).  
You can run this application on a device such as a Raspberry PI, Beaglebone Black,
Mac, or PC, basically anything that supports the Node.js runtime and Bluetooth LE.

## Getting The Code
Just clone the repository.

    $ git clone git@github.com:IBM-Bluemix/iot-sensor-tag.git

## Prerequisites
Since this Node app uses the IBM IoT Cloud you must create an IoT service in Bluemix in order
to create an organization and register devices.  To create an IoT service

1.  Log into bluemix.net.
2.  Go to the catalog and create an new IoT service.  Give the service the name
    iot-sensor-tag.
3.  In the App dropdown select "Leave Unbound".

After you create a new IoT service you will need to launch the dashboard to register a device.  In the Dashboard
in Bluemix, select the IoT service you just created and click Launch to launch the IoT dashboard.  Follow the
the steps below to register your device.

1.  Click the Devices tab
2.  Click Add Device
3.  In the Device Type dropdown select CC2541 Sensor Tag
4.  In the Device ID field, enter the MAC address (without the colons) for the adapter publishing the data.  You can find the MAC address from OS network preferences.
5.  Click Continue

After clicking Continue you will be brought to a page containing some properties for the device you registered.
Copy the properties into a file called config.properties in the publish directory of this repo.
Make sure you do this before you leave this page, you will not be able to retrieve these properties after you leave the 
page.

### If You Are Using OSX
Newer Macs should support Bluetooth LE.  If you Mac supports Bluetooth 4.0 then chances are it supports Bluetooth
LE as well.  If you are using OSX you need to make one configuration change so your Mac can connect to the Sensor Tag.
Run the following command in a terminal window and restart your machine.

    $ sudo nvram bluetoothHostControllerSwitchBehavior="never"

### If You Are Using Linux
If you are using Linux then you need to install some software packages in order to connect to the Sensor Tag.
Run the following commands in a terminal window.

    $ apt-get install bluez
    $ apt-get install libbluetooth-dev

### Beaglebone Black
This app has been tested on a [Beaglebone Black Rev C ](http://beagleboard.org/black) using 
[this](http://plugable.com/products/usb-bt4le) Bluetooth LE USB adapter.

### If You Are Using Windows
I have not tested this on Windows, feel free to open issues and submit pull requests if you find problems.

## Running The App

    $ cd publish
    $ npm install
    $ node sensor-tag.js

If there is no config.properties file present in the publish directory the app will fail to start.  Please 
review the instructions in the Prerequisites section of this README.

When the app starts you will see the MAC address of the network adapter printed to the console and then a message
saying "Make sure the Sensor Tag is on!".  After that you will see a message saying that the Node app has connected
to the IoT Cloud.  Turn on the Sensor Tag by pressing the power button.  The Node app should find the Sensor Tag and print
out various properties about it.  If you see that, than data is being published to the IoT Cloud.  It should look
something like this

    $ node sensor-tag.js 
    Device MAC Address: c8e0eb18df49
    Make sure device is on!
    MQTT client connected to IBM IoT Cloud.
    Discovered device with UUID: ca230130de1a4e728779b4636fe57202
    Connected To Sensor Tag
    readSerialNumber: N.A.
    readManufacturerName: Texas Instruments
    readDeviceName: TI BLE Sensor Tag
    readSystemId: bc:6a:29:0:0:ab:ab:50
    readFirmwareRevision: 1.5 (Oct 23 2013)
    readHardwareRevision: N.A.
    readSoftwareRevision: N.A.

 The Node app will publish various topics containing data from the Sensor Tag sensors to the IoT Cloud.
 The table below describes the topics published, which data is being published to those topics, and how frequently
 the data is being published.  You can then subscribe to these topics from your own applications.

| Publish Topic              | Subscription Topic                   | Values                                    | Frequency       | 
|----------------------------|--------------------------------------|-------------------------------------------|-----------------|
| iot-2/evt/air/fmt/json     | iot-2/type/+/id/+/evt/air/fmt/json   | Object Temperature, Ambient Temperature, Humidity, and Barometric Pressure  | Every 5 seconds |
| iot-2/evt/click/fmt/json   | iot-2/type/+/id/+/evt/click/fmt/json | Left or Right Click                       | On Click        |
| iot-2/evt/mag/fmt/json     | iot-2/type/+/id/+/evt/mag/fmt/json   | Magnetometer                              | On Change       |
| iot-2/evt/accel/fmt/json   | iot-2/type/+/id/+/evt/accel/fmt/json | Accelerometer                             | On Change       |
| iot-2/evt/gyro/fmt/json    | iot-2/type/+/id/+/evt/gyro/fmt/json  | Gyroscope                                 | On Change       |


## Confirming Data Is Being Published
To confirm that data is being published to the IoT Cloud you can use a Node-RED app in Bluemix.  To do this follow
the instructions in [this](https://developer.ibm.com/iot/recipes/node-red-registered-application/) IoT recipe.

## Dependencies
For a list of 3rd party dependencies that are used see the package.json file
in the root of the repository.