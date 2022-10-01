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
  this.stateful = config.stateful;
  this.reverse = config.reverse;
  this.time = config.time ? config.time : 1000;		
  this.resettable = config.resettable;
  this.timer = null;
  this.random = config.random;
  this.disableLogging = config.disableLogging;
  this._service = new Service.Switch(this.name);
  
  this.informationService = new Service.AccessoryInformation();
  this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Homebridge')
      .setCharacteristic(Characteristic.Model, 'Dummy Switch')
      .setCharacteristic(Characteristic.FirmwareRevision, HomebridgeDummyVersion)
      .setCharacteristic(Characteristic.SerialNumber, 'Dummy-' + this.name.replace(/\s/g, '-'));
  
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

DummySwitch.prototype.getServices = function() {
  return [this.informationService, this._service];
}

function randomize(time) {
  return Math.floor(Math.random() * (time + 1));
}

DummySwitch.prototype._setOn = function(on, callback) {

  var delay = this.random ? randomize(this.time) : this.time;
  var msg = "Setting switch to " + on
  if (this.random && !this.stateful) {
      if (on && !this.reverse || !on && this.reverse) {
        msg = msg + " (random delay " + delay + "ms)"
      }
  }
  if( ! this.disableLogging ) {
      this.log(msg);
  }

  if (on && !this.reverse && !this.stateful) {
    if (this.resettable) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(function() {
      this._service.setCharacteristic(Characteristic.On, false);
    }.bind(this), delay);
  } else if (!on && this.reverse && !this.stateful) {
    if (this.resettable) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(function() {
      this._service.setCharacteristic(Characteristic.On, true);
    }.bind(this), delay);
  }
  
  if (this.stateful) {
	this.storage.setItemSync(this.name, on);
  }
  
  callback();
}
