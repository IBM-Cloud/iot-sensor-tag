## About
This project contains different ways of visualizing and consuming the data published to 
the IBM IoT Cloud from a TI Sensor Tag.  In other words the code in this directory connects to the IoT Cloud
subscribes to topics and then does something with the data.  If you are looking for how to publish data to the IoT
Cloud check out the project within the 
[publish directory](https://github.com/IBM-Bluemix/iot-sensor-tag/tree/master/publish).

## Server Code
Most of the hard work of connecting to the IoT Cloud and subscribing to various topics happens in a Node.js
app on the server.  This app connects to the IoT Cloud using MQTT and subscribes to the topics published
from the Node.js app in the publish directory.  In order to connect to the IoT Cloud the code needs an API Key
and Auth Token from the IoT Cloud.  This can be provided via a properties file (for running locally) or via
a service when the app is deployed to Bluemix.  After connecting to the IoT Cloud the app will publish the data 
to the client side browser code over several web sockets using 
the [sockjs Node.js library](https://github.com/sockjs/sockjs-node).

## Client Side Code
As mentioned above the server side code is using websockets to push data in 
real time down to the client side code.  The client side code uses the 
[sockjs client library](https://github.com/sockjs/sockjs-client) to connect to the websockets and retrieve and 
send data.  Before the client side code can receive data it needs to send the device id of the device that
is sending data so the code on the server knows which device to listen for data from.

## Running The Code

### Prerequisites

Since this Node app uses the IBM IoT Cloud you must create an IoT service in Bluemix in order
to create an organization and register applications.  To create an IoT service

1.  Log into bluemix.net.
2.  Go to the catalog and select the Internet of Things service.  
3.  Give the service the name iot-sensor-tag.
4.  In the App dropdown select "Leave Unbound".
5.  Click Create.


### Locally
You can run this code locally on your dev machine if you want.  Before doing this you will need to create a file
named config.properties in the subscribe directory.  Inside this file you should add two properties one for the API Key and one for the Auth Token.  For example

    apikey=myapikey
    apitoken=myapitoken

To get an API Key and Token select the IoT service in your Bluemix dashboard and click Launch to launch
the IoT dashboard.  On the dashboard click the 
API Keys tab.  Then click the Add API Key link.  This will bring up a dialog with an API Key and Auth
Token.  Copy these values to your config.properties and save the file.

After you have added the config.properties file run the following commands in a terminal window from the subscribe
directory.
    
    $ npm install
    $ node app.js

Open your favorite browser and go to [http://localhost:9999](http://localhost:9999).

### Bluemix
To deploy the code to Bluemix you will need to have an internet of things service within the space you are
deploying the application called iot-sensor-tag.  This should have been done in the Prerequisites section.

Now from within the subscribe directory deploy the application using the provided manifest.
Then from
within the subscribe directory run the following command.

    $ cf push

## Using The Demo Apps
The apps need to know the device ID of the device which is publishing the Sensor Tag data.  The device ID
is the MAC address of the device publishing the Sensor Tag data.  This allows
you to connect to multiple devices from the same deployment.

## Dependencies
For a list of 3rd party dependencies that are used see the package.json file
in the root of the repository.