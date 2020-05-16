"use strict";

var Service, Characteristic, HomebridgeAPI;

module.exports = function(homebridge) {

  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  HomebridgeAPI = homebridge;
  homebridge.registerAccessory("homebridge-dummy", "DummyContact", DummyContact);
}

function DummyContact(log, config) {
  this.log = log;
  this.name = config.name;
  this.stateful = config.stateful;
  this.reverse = config.reverse;
  this.contact = config['contact'] || false;
  this.time = config.time ? config.time : 1000;		
  this._service = new Service.ContactSensor(this.name);
  
  this.cacheDirectory = HomebridgeAPI.user.persistPath();
  this.storage = require('node-persist');
  this.storage.initSync({dir: this.cacheDirectory, forgiveParseErrors: true});
  
  this._service.getCharacteristic(Characteristic.ContactSensorState)
    .open('set', this._setOpen.bind(this));

  if (this.reverse) this._service.setCharacteristic(Characteristic.ContactSensorState, (open ? 1 : 0));

  if (this.stateful) {
	var cachedState = this.storage.getItemSync(this.name);
	if((cachedState === undefined) || (cachedState === false)) {
		this._service.setCharacteristic(Characteristic.ContactSensorState, 0);
	} else {
		this._service.setCharacteristic(Characteristic.ContactSensorState, 1);
	}
  }
}

DummyContact.prototype.getServices = function() {
  return [this._service];
}

DummyContact.prototype._setOpen = function(open, callback, context) {

  this.log("Setting contact to " + open);

  if (this.contact) {
    this._contact.setCharacteristic(Characteristic.ContactSensorState, (open ? 1 : 0));
  }

  if (this.state === open) {
    this._service.getCharacteristic(Characteristic.ContactSensorState, 1)
      .emit('change', {
        oldValue: open,
	newValue: open, 
	context: context
      });
  }
	
  if (open && !this.reverse && !this.stateful) {
    setTimeout(function() {
      this._contact.setCHaracteristic(Characteristic.ContactSensorState, 0);
    }.bind(this), this.time);
  } else if (!on && this.reverse && !this.stateful) {
    setTimeout(function() {
      this._contact.setCharacteristic(Characteristic.ContactSensorState, 1);
    }.bind(this), this.time);
  }
  
  if (this.stateful) {
	this.storage.setItemSync(this.name, open);
  }
  this.state = open;
  callback();
}
