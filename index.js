"use strict";

var Service, Characteristic, HomebridgeAPI;
const { HomebridgeDummyVersion } = require('./package.json');

module.exports = function(homebridge) {

  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  HomebridgeAPI = homebridge;
  homebridge.registerAccessory("homebridge-dummy-accessory", "DummyAccessory", DummyAccessory);
}


function DummyAccessory(log, config) {
	this.log = log;
	this.name = config.name;
	this.accessorytype = config.accessorytype;	
	this.stateful = config.stateful;
	this.toggle = config.toggle;
	this.log(this.name+' Toggle Status '+this.toggle);
	this.reverse = config.reverse;
	this.time = config.time ? config.time : 1000;		
	this.resettable = config.resettable;
	this.timer = null;
	this._state = false;
	
	switch (this.accessorytype) {
		case 'Switch': this._service = new Service.Switch(this.name);break;
		case 'Outlet': this._service = new Service.Outlet(this.name);break;
		case 'Light': this._service = new Service.Lightbulb(this.name);break;
		default : this._service = new Service.Switch(this.name);break;
		}

  
  this.informationService = new Service.AccessoryInformation();
  this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Homebridge')
      .setCharacteristic(Characteristic.Model, 'Dummy Accessory '+this.type)
      .setCharacteristic(Characteristic.FirmwareRevision, HomebridgeDummyVersion)
      .setCharacteristic(Characteristic.SerialNumber, 'Dummy Accessory-'+this.accessorytype +'-' + this.name.replace(/\s/g, '-'));
  
  this.cacheDirectory = HomebridgeAPI.user.persistPath();
  this.storage = require('node-persist');
  this.storage.initSync({dir:this.cacheDirectory, forgiveParseErrors: true});
  
  this._service.getCharacteristic(Characteristic.On)
    .on('set', this._setOn.bind(this));

  if (this.reverse) this._service.setCharacteristic(Characteristic.On, true);

  if (this.stateful) {
	var cachedState = this.storage.getItemSync(this.name);
	if((cachedState === undefined) || (cachedState === false)) {
		this._service.setCharacteristic(Characteristic.On, false);
	} else {
		this._service.setCharacteristic(Characteristic.On, true);
	}
  }
}

DummyAccessory.prototype.getServices = function() {
  return [this.informationService, this._service];
}

DummyAccessory.prototype._setOn = function(on, callback) {

	if (this.toggle){
		if (on && this._state){
			setTimeout(() => {
				this._service.setCharacteristic(Characteristic.On, false)  
			}, 100);
		} 
		else {
			this._state = On;
			this.storage.setItemSync(this.name, on);
		}
	} 
	else {
	
	

  if (on && !this.reverse && !this.stateful) {
    if (this.resettable) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(function() {
      this._service.setCharacteristic(Characteristic.On, false);
    }.bind(this), this.time);
  } else if (!on && this.reverse && !this.stateful) {
    if (this.resettable) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(function() {
      this._service.setCharacteristic(Characteristic.On, true);
    }.bind(this), this.time);
  }
  
  if (this.stateful) {
	this.storage.setItemSync(this.name, on);
  }
}
  callback();
}

DummyAccessory.prototype.getStringFromState = function (state) {
  return state ? 'ON' : 'OFF'
}
