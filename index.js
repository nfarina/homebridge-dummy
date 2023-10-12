"use strict";

var Service, Characteristic, HomebridgeAPI;
const { HomebridgeDummyVersion } = require('./package.json');

module.exports = function(homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	HomebridgeAPI = homebridge;
	homebridge.registerAccessory("homebridge-dummy", "DummySwitch", DummySwitch);
}


function DummySwitch(log, config) {
	this.log = log;
	this.name = config.name;
	this.type = config.type;
	this.startup = config.startup;
	this.startupValue = config.startupValue ? config.startupValue : false;
	this.timerEnabled= config.timerEnabled;	
	this.reverse = config.reverse;
	this.time = config.time ? config.time : 1000;		
	this.timeUnit = config.timeUnit;	
	this.resettable = config.resettable;
	this.timer = null;
	this.random = config.random;
	this.disableLogging = config.disableLogging;
	
	
	if (this.type == 'switch') {
		this._service = new Service.Switch(this.name);
		this.modelString = "Dummy Switch";
	}
	else if (this.type == 'dimmer') {
		this._service = new Service.Lightbulb(this.name);
		this.modelString = "Dummy Dimmer";
	} 
	else if (this.type == 'blind') {
		this._service = new Service.WindowCovering(this.name);
		this.modelString = "Dummy Blind";
	} 
	else if (this.type == 'motion') {
		this._service = new Service.MotionSensor(this.name);
		this.modelString = "Dummy Motion";
	} 
	else if (this.type == 'lock') {
		this._service = new Service.LockMechanism(this.name);
		this.modelString = "Dummy Lock";
	} 
	else if (this.type == 'garage') {
		this._service = new Service.GarageDoorOpener(this.name);
		this.modelString = "Dummy Garage";
	} 
	else if (this.type == 'contact') {
		this._service = new Service.ContactSensor(this.name);
		this.modelString = "Dummy Contact";
	} 
	else if (this.type == 'security') {
		this._service = new Service.SecuritySystem(this.name);
		this.modelString = "Dummy Security";
	} 
	else if (this.type == 'thermostat') {
		this._service = new Service.Thermostat(this.name);
		this.modelString = "Dummy Thermostat";
	} 
	

	this.informationService = new Service.AccessoryInformation();
	this.informationService
		.setCharacteristic(Characteristic.Manufacturer, 'Homebridge')
		.setCharacteristic(Characteristic.Model, this.modelString)
		.setCharacteristic(Characteristic.FirmwareRevision, HomebridgeDummyVersion)
		.setCharacteristic(Characteristic.SerialNumber, 'Dummy-' + this.name.replace(/\s/g, '-'));

	this.cacheDirectory = HomebridgeAPI.user.persistPath();
	this.storage = require('node-persist');
	this.storage.initSync({dir:this.cacheDirectory, forgiveParseErrors: true});




	if (this.type == 'switch') {
		this._service.getCharacteristic(Characteristic.On)
		.on('set', this._setValue.bind(this));
	}
	else if (this.type == 'dimmer') {
		this._service.getCharacteristic(Characteristic.On)
			.on('set', this._setValue.bind(this));
		
		this._service.getCharacteristic(Characteristic.Brightness)
			.on('set', this._setValue.bind(this));		
	}
	else if (this.type == 'blind') {
		this._service.getCharacteristic(Characteristic.TargetPosition)
	        .on('set', this._setValue.bind(this));
	}
	else if (this.type == 'motion') {
		this._service.getCharacteristic(Characteristic.MotionDetected)
	        .on('set', this._setValue.bind(this));
	}
	else if (this.type == 'lock') {
		this._service.getCharacteristic(Characteristic.LockTargetState)
	        .on('set', this._setValue.bind(this));
	}
	else if (this.type == 'garage') {
		this._service.getCharacteristic(Characteristic.TargetDoorState)
	        .on('set', this._setValue.bind(this));
	}
	else if (this.type == 'contact') {
		this._service.getCharacteristic(Characteristic.ContactSensorState)
	        .on('set', this._setValue.bind(this));
	}
	else if (this.type == 'security') {
		this._service.getCharacteristic(Characteristic.SecuritySystemTargetState)
	        .on('set', this._setValue.bind(this));
	}
	else if (this.type == 'thermostat') {
		this._service.getCharacteristic(Characteristic.TargetHeatingCoolingState)
	        .on('set', this._setValue.bind(this));
			
		this._service.getCharacteristic(Characteristic.TargetTemperature)
	        .on('set', this._setValue.bind(this));
	}
	

  
	if (this.startup == 'on') {
	
	    if (this.type == 'switch') {
			this._service.setCharacteristic(Characteristic.On, true);
		}
		else if (this.type == 'dimmer') {		
			this._service.setCharacteristic(Characteristic.On, true); 
			this._service.setCharacteristic(Characteristic.Brightness, 100);
		}		
		else if (this.type == 'blind') {
			this._service.setCharacteristic(Characteristic.TargetPosition, 100);
		}
		else if (this.type == 'motion') {
			this._service.setCharacteristic(Characteristic.MotionDetected, 1);
		}
		else if (this.type == 'lock') {
			this._service.setCharacteristic(Characteristic.LockTargetState, 0);
		}
		else if (this.type == 'garage') {
			this._service.setCharacteristic(Characteristic.TargetDoorState, 0);
		}
		else if (this.type == 'contact') {
			this._service.setCharacteristic(Characteristic.ContactSensorState, 'CONTACT_NOT_DETECTED');
		}
		else if (this.type == 'security') {
			this._service.setCharacteristic(Characteristic.SecuritySystemTargetState, 0);	
		}
		else if (this.type == 'thermostat') {
			this._service.setCharacteristic(Characteristic.TargetHeatingCoolingState, 3);
		}
		
	}
	
	else if (this.startup == 'setValue' && this.startupValue && (this.type == 'dimmer' || this.type == 'blind')) {
		
		if (this.type == 'dimmer') {
			this._service.setCharacteristic(Characteristic.On, true);
			this._service.setCharacteristic(Characteristic.Brightness, this.startupValue);
		}
		else if (this.type == 'blind') {
			this._service.setCharacteristic(Characteristic.TargetPosition, this.startupValue);
		}	
	}  
  
	else if (this.startup == 'last') {
	  
		if (this.type == 'switch') {
			var cachedState = this.storage.getItemSync(this.name + 'on');
			if((cachedState === undefined) || (cachedState === false)) {
				this._service.setCharacteristic(Characteristic.On, false);
			} 
			else {
				this._service.setCharacteristic(Characteristic.On, true);
			}
		}
  	
		else if (this.type == 'dimmer') {
			var cachedValue = this.storage.getItemSync(this.name + 'on');
			if ((cachedValue == undefined) || cachedValue == 0) {				
				this._service.setCharacteristic(Characteristic.On, false);
			} 
			else {				
				this._service.setCharacteristic(Characteristic.On, true);			
			}

			var cachedValue = this.storage.getItemSync(this.name + 'value');
			if ((cachedValue == undefined) || cachedValue == 0) {				
				this._service.setCharacteristic(Characteristic.Brightness, 0);
			} 
			else {				
				this._service.setCharacteristic(Characteristic.Brightness, cachedValue);			
			}

		}
  
	  	else if (this.type == 'blind') {
			var cachedValue = this.storage.getItemSync(this.name + 'value');
			if ((cachedValue == undefined) || cachedValue == 0) {				
				this._service.setCharacteristic(Characteristic.TargerPosition, 0);
			} 
			else {
				this._service.setCharacteristic(Characteristic.TargetPosition, cachedValue);
			}
	  	}
		
	  	else if (this.type == 'motion') {
			var cachedValue = this.storage.getItemSync(this.name + 'value');
			if ((cachedValue == undefined) || cachedValue == 0) {				
				this._service.setCharacteristic(Characteristic.MotionDetected, 0);
			} 
			else {
				this._service.setCharacteristic(Characteristic.MotionDetected, cachedValue);
			}
	  	}
		
	  	else if (this.type == 'lock') {
			var cachedValue = this.storage.getItemSync(this.name + 'value');
			if ((cachedValue == undefined) || cachedValue == 0) {				
				this._service.setCharacteristic(Characteristic.LockTargetState, 1);
			} 
			else {
				this._service.setCharacteristic(Characteristic.LockTargetState, cachedValue);
			}
	  	}
		
	  	else if (this.type == 'garage') {
			var cachedValue = this.storage.getItemSync(this.name + 'value');
			if ((cachedValue == undefined) || cachedValue == 0) {				
				this._service.setCharacteristic(Characteristic.TargetDoorState, 1);
			} 
			else {
				this._service.setCharacteristic(Characteristic.TargetDoorState, cachedValue);
			}
	  	}
		
	  	else if (this.type == 'contact') {
			var cachedValue = this.storage.getItemSync(this.name + 'value');
			if ((cachedValue == undefined) || cachedValue == 0) {				
				this._service.setCharacteristic(Characteristic.ContactSensorState, 'CONTACT_DETECTED');
			} 
			else {
				this._service.setCharacteristic(Characteristic.ContactSensorState, cachedValue);
			}
	  	}
		
	  	else if (this.type == 'security') {
			var cachedValue = this.storage.getItemSync(this.name + 'value');
			if ((cachedValue == undefined) || cachedValue == 0) {				
				this._service.setCharacteristic(Characteristic.SecuritySystemTargetState, 0);
			} 
			else {
				this._service.setCharacteristic(Characteristic.SecuritySystemTargetState, cachedValue);
			}
	  	}
		
	  	else if (this.type == 'thermostat') {
			var cachedValue = this.storage.getItemSync(this.name + 'value');
			if ((cachedValue == undefined) || cachedValue == 0) {				
				this._service.setCharacteristic(Characteristic.TargetHeatingCoolingState, 0);
			} 
			else {
				this._service.setCharacteristic(Characteristic.TargetHeatingCoolingState, cachedValue);
			}

	  	}

	}
	
	else {
	
		if (this.type == 'switch') {	    
			this._service.setCharacteristic(Characteristic.On, false);
		}		
		else if (this.type == 'motion') {
			this._service.setCharacteristic(Characteristic.MotionDetected, 0);
		}
		else if (this.type == 'lock') {
			this._service.setCharacteristic(Characteristic.LockTargetState, 1);
		}
		else if (this.type == 'garage') {
			this._service.setCharacteristic(Characteristic.TargetDoorState, 1);
		}
		else if (this.type == 'contact') {		
			this._service.setCharacteristic(Characteristic.ContactSensorState, 'CONTACT_DETECTED');
		}
		else if (this.type == 'security') {
			this._service.setCharacteristic(Characteristic.SecuritySystemTargetState, 3);	
		}
		else if (this.type == 'thermostat') {
			this._service.setCharacteristic(Characteristic.TargetHeatingCoolingState, 0);
		}
		else if (this.type == 'dimmer') {		
			this._service.setCharacteristic(Characteristic.On, false); 
			this._service.setCharacteristic(Characteristic.Brightness, 0);
		}
		else if (this.type == 'blind') {
			this._service.setCharacteristic(Characteristic.TargetPosition, 0);
		}
			
	}
	
	
  	if ((this.type == 'thermostat') && (this.storage.getItemSync(this.name + 'value2') != undefined)) {
						
			this._service.setCharacteristic(Characteristic.TargetTemperature, cachedValue);

  	}

}



DummySwitch.prototype.getServices = function() {
	return [this.informationService, this._service];
}

function randomize(time) {
	return Math.floor(Math.random() * (time + 1));
}





DummySwitch.prototype._setValue = function(value, callback) {


	if (!this.disableLogging) {
		
		if (value === true) {
			this.log("ON");
		}

		else if (value === false) {
			this.log("OFF");
		}

		else if ((this.type == 'lock') && (value == 1)) {
			this.log("Lock");
		}

		else if ((this.type == 'lock') && (value == 0)) {
			this.log("Unlock");
		}

		else if ((this.type == 'garage') && (value == 1)) {
			this.log("Open");
		}

		else if ((this.type == 'garage') && (value == 0)) {
			this.log("Close");
		}

		else if ((this.type == 'motion') && (value == 0)) {
			this.log("Motion not detected");
		}

		else if ((this.type == 'motion') && (value == 1)) {
			this.log("Motion detected");
		}

		else if ((this.type == 'contact') && (value == 'CONTACT_DETECTED')) {
			this.log("Contact detected");
		}

		else if ((this.type == 'contact') && (value == 'CONTACT_NOT_DETECTED')) {
			this.log("Contact not detected");
		}

		else if ((this.type == 'security') && (value == 0)) {
			this.log("Stay Arm");
		}

		else if ((this.type == 'security') && (value == 1)) {
			this.log("Away Arm");
		}

		else if ((this.type == 'security') && (value == 2)) {
			this.log("Night Arm");
		}

		else if ((this.type == 'security') && (value == 3)) {
			this.log("Disarm");
		}

		else if ((this.type == 'thermostat') && (value == 0)) {
			this.log("OFF");
		}

		else if ((this.type == 'thermostat') && (value == 1)) {
			this.log("Heat");
		}

		else if ((this.type == 'thermostat') && (value == 2)) {
			this.log("Cool");
		}

		else if ((this.type == 'thermostat') && (value == 3)) {
			this.log("Auto");
		}

		else {
			this.log(value);
		}

	}


	

	
	// Calculate Timer
  
	var delay = this.time;

	if (this.timeUnit == 'seconds') {
		delay = this.time * 1000;
	}
	else if (this.timeUnit == 'minutes') {
		delay = this.time * 60000;
	}
	else if (this.timeUnit == 'hours') {
		delay = this.time * 3600000;
	}
	else if (this.timeUnit == 'days') {
		delay = this.time * 86400000;
	}
	
	
	
	// Randomize Delay
	
	if (this.random) {
		delay = randomize(delay);
	} 
	
	
  
  
	// Clear Timer
  
	if (this.resettable) {
		clearTimeout(this.timer);

		if (!this.disableLogging) {
			this.log("Reset Timer");
		}
		
	}
	
	

	
	// Target to Curent value
	
	if (this.type == 'blind') {
		this._service.setCharacteristic(Characteristic.CurrentPosition, value);
	}

	else if (this.type == 'lock') {
		this._service.setCharacteristic(Characteristic.LockCurrentState, value);
	}
	
	else if (this.type == 'garage') {
		this._service.setCharacteristic(Characteristic.CurrentDoorState, value);
	}
	
	else if (this.type == 'security') {
		this._service.setCharacteristic(Characteristic.SecuritySystemCurrentState, value);
	}
	
	else if (this.type == 'thermostat') {
		
		if (value == 0 || value == 1 || value == 2) { 
			this._service.setCharacteristic(Characteristic.CurrentHeatingCoolingState, value);
		}
		else if (value == 3) {
			this._service.setCharacteristic(Characteristic.CurrentHeatingCoolingState, 1);
		}
		else {
			this._service.setCharacteristic(Characteristic.CurrentTemperature, value);
		}
		
	}
	
	
	

	
	
	// Set Timer
	if (this.timerEnabled) {	


		if (!this.reverse) {

			if ((this.type == 'switch') && (value === true)) {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.On, false);
				}.bind(this), delay);
			}
			else if ((this.type == 'dimmer') && (value === true)) {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.On, false);
				}.bind(this), delay);
			}
			else if ((this.type == 'dimmer') && (value != 0)) {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.Brightness, 0);
				}.bind(this), delay);
			}
			else if ((this.type == 'blind') && (value != 0)) {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.TargetPosition, 0);
				}.bind(this), delay);
			}
			else if ((this.type == 'motion') && (value == 1))  {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.MotionDetected, 0);
				}.bind(this), delay);
			}
			else if ((this.type == 'lock') && (value == 0))  {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.LockTargetState, 1);
				}.bind(this), delay);
			}
			else if ((this.type == 'garage') && (value == 0))  {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.TargetDoorState, 1);
				}.bind(this), delay);
			}
			else if ((this.type == 'contact') && (value == 'CONTACT_NOT_DETECTED'))  {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.ContactSensorState, 'CONTACT_DETECTED');
				}.bind(this), delay);
			}
			else if ((this.type == 'security') && (value != 3))  {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.SecuritySystemTargetState, 3);
				}.bind(this), delay);
			}
			else if ((this.type == 'thermostat') && (value != 0))  {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.TargetHeatingCoolingState, 0);
				}.bind(this), delay);
			}
		}
		
		else if (this.reverse) {
		
			if ((this.type == 'switch') && (value === false)) {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.On, true);
				}.bind(this), delay);
			}
			else if ((this.type == 'dimmer') && (value === false)) {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.On, true);
				}.bind(this), delay);
			}
			else if ((this.type == 'dimmer') && (value != 100)) {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.Brightness, 100);
				}.bind(this), delay);
			}
			else if ((this.type == 'blind') && (value != 100))  {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.TargetPosition, 100);
				}.bind(this), delay);
			}
			else if ((this.type == 'motion') && (value == 0))  {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.MotionDetected, 1);
				}.bind(this), delay);
			}
			else if ((this.type == 'lock') && (value == 1))  {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.LockTargetState, 0);
				}.bind(this), delay);
			}
			else if ((this.type == 'garage') && (value == 1))  {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.TargetDoorState, 0);
				}.bind(this), delay);
			}
			else if ((this.type == 'contact') && (value == 'CONTACT_DETECTED'))  {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.ContactSensorState, 'CONTACT_NOT_DETECTED');
				}.bind(this), delay);
			}
			else if ((this.type == 'security') && (value == 3))  {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.SecuritySystemTargetState, 0);
				}.bind(this), delay);
			}
			else if ((this.type == 'thermostat') && (value == 0))  {
				this.timer = setTimeout(function() {
				this._service.setCharacteristic(Characteristic.TargetHeatingCoolingState, 3);
				}.bind(this), delay);
			}
		}


		if ((!this.disableLogging) && (this.timer)) {
			if (!this.random){
				this.log("Set Timer: " + this.time + " " + this.timeUnit );
			}
			else {
				this.log("Setting random Timer: " + delay + " ms");
			}
		}

	}

	
	
		
	if (value === true || value === false) {

		this.storage.setItemSync(this.name + 'on', value);
		
	}

	else if ((this.type == 'thermostat') && (value > 3)) {

		this.storage.setItemSync(this.name + 'value2', value);

	}

	else {

		this.storage.setItemSync(this.name + 'value', value);

	}
		
	

	callback();
}
