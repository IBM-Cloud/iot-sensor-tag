## About
This directory contains an exported Node-RED flow that you can import into a Node-RED instance
on Bluemix to see the data being published from the TI Sensor Tag to the IoT Cloud.

## Importing The Flow
1.  Follow the instructions in [this IoT recipe](https://www.ng.bluemix.net/docs/#services/IoT/index.html#iot180) 
to setup and a Node-RED instance in Bluemix
2.  Copy the content of node-red-flow.json to your clipboard
3.  Open you Node-RED instance running on Bluemix and click the drop-down menu in the top
left and select Import from... -> Clipboard...
4.  In the Import nodes dialog paste the JSON you copied onto your clipboard from node-red-flow.json
5.  Click OK
6.  Click Deploy
7.  In the Debug tab in Node-RED you should now see the data being published from the Sensor Tag,
assuming it is running

Pro Tip:  You can disable or enable specific debug nodes in Node-RED to filter the data being published in
the debug tab.