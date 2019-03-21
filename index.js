"use strict";

var Service, Characteristic, HomebridgeAPI;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  HomebridgeAPI = homebridge;
  homebridge.registerAccessory("homebridge-dummy", "DummySwitch", DummySwitch);
};


function DummySwitch(log, config) {
  this.log = log;
  this.name = config.name;
  this.stateful = config.stateful;
  this.reverse = config.reverse;
  this.contact = config['contact'] || false;
  this._service = new Service.Lightbulb(this.name);
  this._service
    .addCharacteristic(Characteristic.Brightness);

  this._contact = new Service.ContactSensor(this.name);

  this.cacheDirectory = HomebridgeAPI.user.persistPath();
  this.storage = require('node-persist');
  this.storage.initSync({
    dir: this.cacheDirectory,
    forgiveParseErrors: true
  });

  this._service.getCharacteristic(Characteristic.On)
    .on('set', this._setOn.bind(this));

  if (this.reverse) this._service.setCharacteristic(Characteristic.On, true);

  if (this.stateful) {
    var cachedState = this.storage.getItemSync(this.name);
    if ((cachedState === undefined) || (cachedState === false)) {
      this._service.setCharacteristic(Characteristic.On, false);
      this.state = false;
    } else {
      this._service.setCharacteristic(Characteristic.On, true);
      this.state = true;
    }
  }
}

DummySwitch.prototype.getServices = function() {
  if (this.contact) {
    return [this._service, this._contact];
  } else {
    return [this._service];
  }
};

DummySwitch.prototype._setOn = function(on, callback, context) {
  this.log("Setting switch to " + on);

  if (this.contact) {
    this._contact.setCharacteristic(Characteristic.ContactSensorState, (on ? 1 : 0));
  }

  if (this.state === on) {
    this._service.getCharacteristic(Characteristic.On)
      .emit('change', {
        oldValue: on,
        newValue: on,
        context: context
      });
  }

  if (on && !this.reverse && !this.stateful) {
    setTimeout(function() {
      this._service.setCharacteristic(Characteristic.On, false);
      this._contact.setCharacteristic(Characteristic.ContactSensorState, 0);
    }.bind(this), 1000);
  } else if (!on && this.reverse && !this.stateful) {
    setTimeout(function() {
      this._service.setCharacteristic(Characteristic.On, true);
      this._contact.setCharacteristic(Characteristic.ContactSensorState, 1);
    }.bind(this), 1000);
  }

  if (this.stateful) {
    this.storage.setItemSync(this.name, on);
  }

  this.state = on;
  callback();
};
