"use strict";

var Service, Characteristic, HomebridgeAPI;
const { HomebridgeDummyVersion } = require('./package.json');

module.exports = function(homebridge) {

  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  HomebridgeAPI = homebridge;
  homebridge.registerAccessory("homebridge-dummy-accessory", "DummyAccessory", DummyAccessory);
}


function DummyAcessory(log, config) {
  this.log = log;
  this.name = config.name;
  this.type = config.type;
  this.stateful = config.stateful;
  this.reverse = config.reverse;
  this.time = config.time ? config.time : 1000;		
  this.resettable = config.resettable;
  this.timer = null;
	
switch (type) {
	case 'Switch': this._service = new Service.Switch(this.name);
		case 'Outlet': this._service = new Service.Outlet(this.name);
		case 'Light': this._service = new Service.Light(this.name);
	default:this._service = new Service.Switch(this.name)
		
}
	
  
  this.informationService = new Service.AccessoryInformation();
  this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Homebridge')
      .setCharacteristic(Characteristic.Model, 'Dummy Accessory '+this.type)
      .setCharacteristic(Characteristic.FirmwareRevision, HomebridgeDummyVersion)
      .setCharacteristic(Characteristic.SerialNumber, 'Dummy Accessory-'+this.type +'-' + this.name.replace(/\s/g, '-'));
  
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

  this.log("Setting switch to " + on);

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
  
  callback();
}
