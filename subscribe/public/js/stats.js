//------------------------------------------------------------------------------
// Copyright IBM Corp. 2014
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------
var sockjs_url = '/sensortag';
var sockjs = new SockJS(sockjs_url);

var multiplexer = new WebSocketMultiplex(sockjs);

var accel  = multiplexer.channel('accel');

accel.onopen = function() {
  console.log("accel open");
};
accel.onclose = function(e) {
	console.log("accel closed");
}
accel.onmessage = function(e) {
  var data = jQuery.parseJSON(e.data);
  var value = data.d;
  value.x = parseFloat(value.accelX);
  value.y = parseFloat(value.accelY);
  value.z = parseFloat(value.accelZ);
  $("#accelerometerPayload").html("accel<br> {x: " + value.accelX + ", y: " + value.accelY + ", z: " + value.accelZ + "}");
  sensorData.setReading("accelerometer", value);
};
var gyro  = multiplexer.channel('gyro');
gyro.onopen = function() {
  console.log("gyro open");
};
gyro.onmessage = function(e) {
  var data = jQuery.parseJSON(e.data);
  var value = data.d;
  value.x = parseFloat(value.gyroX);
  value.y = parseFloat(value.gyroY);
  value.z = parseFloat(value.gyroZ);
  $("#gyroscopePayload").html("gyro<br> {x: " + value.gyroX + ", y: " + value.gyroY + ", z: " + value.gyroZ + "}");
  sensorData.setReading("gyroscope", value);
};
var mag  = multiplexer.channel('mag');
mag.onopen = function() {
  console.log("mag open");
};
mag.onmessage = function(e) {
  var data = jQuery.parseJSON(e.data);
  var value = data.d;
  value.x = parseFloat(value.magX);
  value.y = parseFloat(value.magY);
  value.z = parseFloat(value.magZ);
  $("#magnetometerPayload").html("mag<br> {x: " + value.magX + ", y: " + value.magY + ", z: " + value.magZ + "}");
  sensorData.setReading("magnetometer", value);
};
var air  = multiplexer.channel('air');
air.onopen = function() {
  console.log("air open");
};
air.onmessage = function(e) {
  var data = jQuery.parseJSON(e.data);
  sensorData.setReading("barometer", parseFloat(data.d.pressure));
  $("#barometerPayload").html("air/barometer :: " + data.d.pressure);
  sensorData.setReading("humidity", parseFloat(data.d.humidity));
  $("#humidityPayload").html("air/humidity :: " + data.d.humidity);
  sensorData.setReading("ambientTemp", parseFloat(data.d.ambientTemp));
  $("#ambientTemp").html("air/ambientTemp :: " + data.d.ambientTemp);
  sensorData.setReading("objectTemp", parseFloat(data.d.objTemp));
  $("#objectTemp").html("air/objectTemp :: " + data.d.objTemp);
  
};
function connectOnClick() {
	var uuid = document.getElementById('uuid').value;
	var data = JSON.stringify({"deviceId": uuid});
	air.send(data);
	mag.send(data);
	gyro.send(data);
	accel.send(data);
	$('#uuid').hide();
	$('#uuidConfirm').hide();
}


function SensorData() {
	this.accelerometer = {
		x: null,
		y: null,
		z: null
	};
	this.gyroscope = {
		x: null,
		y: null,
		z: null
	};
	this.magnetometer = {
		x: null,
		y: null,
		z: null
	};
	this.humidity = null;

	this.objectTemp = [];
	this.ambientTemp = [];
}
SensorData.prototype.setReading = function(type, value) {
	console.log("new value for " + type, value);

	switch (type) {
		case "ambientTemp":
		case "objectTemp":
			var data = {
				time: (new Date()),//Math.round((new Date()).getTime() / 1000) * 1000,
				//time: (new Date()).toTimeString().substring(0, 8),
				value: value
			};
			console.log("data: " + JSON.stringify(data));
			this[type].push(data);
			updateTemperatureGraph();
			break;
		case "humidity":
			this[type] = value;
			updateHumidityValue();
			break;
		case "barometer":
			this[type] = value;
			updateBarometerValue();
			break;
		case "accelerometer":
			this[type] = value;
			accelGraph.updateValue(value);
			break;
		case "gyroscope":
			this[type] = value;
			gyroscopeGraph.updateValue(value);
			break;
		case "magnetometer":
			this[type] = value;
			magnetometerGraph.updateValue(value);
			break;
		default:
			this[type] = value;
			break;
	}
}
SensorData.prototype.getTempGraphData = function() {
	var availableData = Math.min(sensorData.ambientTemp.length, sensorData.objectTemp.length);
	var values = [];

	for (var i = 0; i < availableData; i++) {
		values.push({
			x: sensorData.ambientTemp[i].time,
			//x: 0,
			y: sensorData.ambientTemp[i].value,
			z: sensorData.objectTemp[i].value
		});
	}

	if (availableData < 30) {
		for (var i = 0; i < 30 - availableData; i++) { 
			values.splice(0,0,{x: 0, y: 0, z: 0 }); 
		}
	}
	if (availableData > 30) {
		values.splice(0, availableData - 30);
	}

	// fill in x values
	for (var i = 0; i < values.length; i++) {
		if (values[i].x == 0) {
			values[i].x = new Date((new Date()).getTime() - (values.length - i) * 1000);
		}
	}

	return values;
}

var sensorData = new SensorData();

function onMessage(msg) {
	var topic = msg.destinationName;
	var tagData = JSON.parse(msg.payloadString);

	try {
		for (var count in tagData.d) {
			prop = tagData.d[count];
			var type = prop.p;
			var value = prop.v;

			console.log(type);
			switch (type) {
				case "accelerometer":
				case "magnetometer":
				case "gyroscope":
				value.x = parseFloat(value.x);
				value.y = parseFloat(value.y);
				value.z = parseFloat(value.z);
				$("#"+type+"Payload").html(topic + "<br>" + JSON.stringify(value));
				break;
				case "humidity":
				case "ambientTemp":
				case "objectTemp":
				case "barometer":
				value = parseFloat(value);
				default:
				$("#"+type+"Payload").html(topic + "/" + type + " :: " + value);
				break;
			}
			console.log(type, value);
			sensorData.setReading(type, value);
		}
	} catch (e) { console.error(e.stack, e.message); }
}

function Graph3D(domElement) {
	this.controls = null;
	this.camera = null;
	this.scene = null;
	this.renderer = null;
	this.domElement = domElement;

	this.value = {
		x: 0,
		y: 0,
		z: 0
	};
	this.scale = 1;
	this.valueLine = null;
	this.valueMarker = null;
}
Graph3D.prototype.init = function() {
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize( 350, 350 );
	this.renderer.setClearColor(0xffffff, 1);
	this.domElement.appendChild( this.renderer.domElement );

	this.camera = new THREE.PerspectiveCamera( 45, 350 / 350, 1, 1000 );
	this.camera.position.z = 400;
	this.camera.position.x = 150;
	this.camera.position.y = 200;
	this.scene = new THREE.Scene();
	this.camera.lookAt(this.scene.position);

	//this.controls = new THREE.OrbitControls(this.camera);
	//this.controls.addEventListener('change', (function(self) { return function() { self.animate(); } })(this));

	var cube = new THREE.BoxHelper();
	cube.material.color.setRGB( 0, 0, 0 );
	cube.scale.set( 100, 100, 100);
	this.scene.add( cube );

	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	this.scene.add( light );

	light = new THREE.DirectionalLight( 0x002288 );
	light.position.set( -1, -1, -1 );
	this.scene.add( light );

	light = new THREE.AmbientLight( 0x222222 );
	this.scene.add( light );

	axes = new THREE.Object3D();

	var lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
	var lineGeo = new THREE.Geometry();
	lineGeo.vertices.push(new THREE.Vector3(0,0,0));
	lineGeo.vertices.push(new THREE.Vector3(this.value.x,this.value.y,this.value.z));
	this.valueLine = new THREE.Line(lineGeo, lineMaterial);
	this.scene.add(this.valueLine);

	var buildAxis = function( src, dst, colorHex, dashed ) {
		var geom = new THREE.Geometry(), mat; 

		if(dashed) {
			mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
		} else {
			mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
		}

		geom.vertices.push( src.clone() );
		geom.vertices.push( dst.clone() );
		geom.computeLineDistances();

		var axis = new THREE.Line( geom, mat, THREE.LinePieces );

		return axis;
	}

	var length = 110;
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xAA0000, false ) ); // +X
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xAA0000, true) ); // -X
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00AA00, false ) ); // +Y
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00AA00, true ) ); // -Y
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000AA, false ) ); // +Z
	axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000AA, true ) ); // -Z

	this.scene.add(axes);
}
Graph3D.prototype.animate = function() {
	//this.renderer.render(this.scene, this.camera);
	requestAnimationFrame((function(self) { 
		return function() { 
			self.animate(); 
			self.renderer.render(self.scene, self.camera);
		} 
	})(this));
}
Graph3D.prototype.updateValue = function(data) {
	this.value = {
		x: data.x / this.scale * 100,
		y: data.y / this.scale * 100,
		z: data.z / this.scale * 100
	}

	if (this.valueLine) { this.scene.remove(this.valueLine); }
	if (this.valueMarker) { this.scene.remove(this.valueMarker); }
	if (this.valueCube) { this.scene.remove(this.valueCube); }
	if (this.valueMarker_xz1) { this.scene.remove(this.valueMarker_xz1); }
	if (this.valueMarker_xz2) { this.scene.remove(this.valueMarker_xz2); }
	if (this.valueMarker_xy1) { this.scene.remove(this.valueMarker_xy1); }
	if (this.valueMarker_xy2) { this.scene.remove(this.valueMarker_xy2); }

	var lineMaterial = new THREE.LineBasicMaterial({ linewidth: 3, color: 0x000000 });
	var lineGeo = new THREE.Geometry();
	lineGeo.vertices.push(new THREE.Vector3(0,0,0));
	lineGeo.vertices.push(new THREE.Vector3(this.value.x,this.value.y,this.value.z));
	lineGeo.computeLineDistances();
	this.valueLine = new THREE.Line(lineGeo, lineMaterial);
	this.scene.add(this.valueLine);

	this.valueMarker = new THREE.Mesh(new THREE.SphereGeometry(4, 4, 4), new THREE.MeshNormalMaterial());
	this.valueMarker.position.x = this.value.x;
	this.valueMarker.position.y = this.value.y;
	this.valueMarker.position.z = this.value.z;
	this.scene.add(this.valueMarker);

	if (Math.abs(this.value.x) < 2 || Math.abs(this.value.y) < 2 || Math.abs(this.value.z) < 2) {
		// do nothing
	} else {
		val = [];
		if (data.x > 0) { val.push(51) } else { val.push(-51); }
		if (data.y > 0) { val.push(51) } else { val.push(-51); }
		if (data.z > 0) { val.push(51) } else { val.push(-51); }
		this.valueCube = new THREE.BoxHelper();
		this.valueCube.material.color.setRGB( 0, 0, 0);
		this.valueCube.scale.set(48, 48, 48);
		this.valueCube.position.set( val[0], val[1], val[2] );
		this.scene.add(this.valueCube);
	}

	var lineMaterial = new THREE.LineBasicMaterial({ linewidth: 2, color: 0x000000 });
	var lineGeo = new THREE.Geometry();
	lineGeo.vertices.push(new THREE.Vector3(this.value.x - 3,0,this.value.z - 3));
	lineGeo.vertices.push(new THREE.Vector3(this.value.x + 3,0,this.value.z + 3));
	lineGeo.computeLineDistances();
	this.valueMarker_xz1 = new THREE.Line(lineGeo, lineMaterial);
	this.scene.add(this.valueMarker_xz1);

	var lineMaterial = new THREE.LineBasicMaterial({ linewidth: 2, color: 0x000000 });
	var lineGeo = new THREE.Geometry();
	lineGeo.vertices.push(new THREE.Vector3(this.value.x + 3,0,this.value.z - 3));
	lineGeo.vertices.push(new THREE.Vector3(this.value.x - 3,0,this.value.z + 3));
	lineGeo.computeLineDistances();
	this.valueMarker_xz2 = new THREE.Line(lineGeo, lineMaterial);
	this.scene.add(this.valueMarker_xz2);

	var lineMaterial = new THREE.LineBasicMaterial({ linewidth: 2, color: 0x000000 });
	var lineGeo = new THREE.Geometry();
	lineGeo.vertices.push(new THREE.Vector3(this.value.x - 3,this.value.y - 3, 0));
	lineGeo.vertices.push(new THREE.Vector3(this.value.x + 3,this.value.y + 3, 0));
	lineGeo.computeLineDistances();
	this.valueMarker_xy1 = new THREE.Line(lineGeo, lineMaterial);
	this.scene.add(this.valueMarker_xy1);

	var lineMaterial = new THREE.LineBasicMaterial({ linewidth: 2, color: 0x000000 });
	var lineGeo = new THREE.Geometry();
	lineGeo.vertices.push(new THREE.Vector3(this.value.x + 3,this.value.y - 3, 0));
	lineGeo.vertices.push(new THREE.Vector3(this.value.x - 3,this.value.y + 3, 0));
	lineGeo.computeLineDistances();
	this.valueMarker_xy2 = new THREE.Line(lineGeo, lineMaterial);
	this.scene.add(this.valueMarker_xy2);
}

function updateTemperatureGraph() {

	var values = sensorData.getTempGraphData();

	var maxval = -10000000;
	for (var i in values) { 
		if (values[i].y > maxval) { maxval = values[i].y; } 
		if (values[i].z > maxval) { maxval = values[i].z; } 
	}
	maxval = Math.floor(maxval * 1.3);

	var margin = {
		top: 30, 
		right: 20, 
		bottom: 30, 
		left: 50
	};
	var width = 900 - margin.left - margin.right;
	var height = 400 - margin.top - margin.bottom;

	// Parse the date / time
	var parseDate = d3.time.format("%d-%b-%y").parse;

	// Set the ranges
	var x = d3.time.scale().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);

	// Define the axes
	var xAxis = d3.svg.axis().scale(x)
		.orient("bottom").ticks(5);

	var yAxis = d3.svg.axis().scale(y)
		.orient("left").ticks(5);

	// Define the line
	var ambientline = d3.svg.line()
		.x(function(d) { return x(d.x); })
		.y(function(d) { return y(d.z); });
	var objectline = d3.svg.line()
		.x(function(d) { return x(d.x); })
		.y(function(d) { return y(d.y); });

	// Adds the svg canvas
	$("#temperatureGraph").html("");
	var svg = d3.select("#temperatureGraph")
		.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Scale the range of the data
	x.domain(d3.extent(values, function(d) { return d.x; }));
	y.domain([0, maxval]);

	// Add the paths.
	svg.append("path")
		.attr("class", "ambientline")
		.attr("d", ambientline(values));

	svg.append("path")
		.attr("class", "objectline")
		.attr("d", objectline(values));

	// Add the X Axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	// Add the Y Axis
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis);

	svg.append("svg:rect")
			.attr("x", 3*width/4 - 20)
			.attr("y", 0)
			.attr("stroke", "darkblue")
			.attr("height", 2)
			.attr("width", 40);

	svg.append("svg:text")
			.attr("x", 30 + 3*width/4)
			.attr("y", 5)
			.text("Object Temp (\u00B0C)");

	svg.append("svg:rect")
			.attr("x", 3*width/4 - 20)
			.attr("y", 30)
			.attr("stroke", "maroon")
			.attr("height", 2)
			.attr("width", 40);

	svg.append("svg:text")
			.attr("x", 30 + 3*width/4)
			.attr("y", 35)
			.text("Ambient Temp (\u00B0C)");
} 

var accelGraph = new Graph3D($("#accelerometerGraph")[0]);
accelGraph.scale = 2;
accelGraph.init();
accelGraph.animate();

var magnetometerGraph = new Graph3D($("#magnetometerGraph")[0]);
magnetometerGraph.scale = 100;  // teslas???
magnetometerGraph.init();
magnetometerGraph.animate();

var gyroscopeGraph = new Graph3D($("#gyroscopeGraph")[0]);
gyroscopeGraph.scale = 250;   // degrees??
gyroscopeGraph.init();
gyroscopeGraph.animate();

updateTemperatureGraph();

function updateHumidityValue() {
	var humidity = sensorData.humidity;
	$("#humidityValue").html(humidity);
}
function updateBarometerValue() {
	var barometer = sensorData.barometer;
	$("#barometerValue").html(barometer);
}