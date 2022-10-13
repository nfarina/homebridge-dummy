
# "Dummy Switches" Plugin

Example config.json:

```
    "accessories": [
        {
          "accessory": "DummySwitch",
          "name": "My Switch 1",
          "disableLogging": false
        }   
    ]

```

With this plugin, you can create any number of fake switches that will do nothing when turned on (and will automatically turn off right afterward, simulating a stateless switch). This can be very useful for advanced automation with HomeKit scenes.

For instance, the Philips Hue app will automatically create HomeKit scenes for you based on Hue Scenes you create. But what if you want to create a scene that contains both Philips Hue actions and other actions (like turning on the coffee maker with a WeMo outlet)? You are forced to either modify the Hue-created scene (which can be a HUGE list of actions if you have lots of lights) or build your own HomeKit lighting scenes.

Instead, you can link scenes using these dummy switches. Let's say you have a Hue Scene called "Rise and Shine" that you want to activate in the morning. And you have also setup the system HomeKit scene "Good Morning" to turn on your coffee maker and disarm you security system. You can add a single dummy switch to your Good Morning scene, then create a Trigger based on the switching-on of the dummy switch that also activates Rise And Shine.

If the disableLogging option is true, state changes (On/Off) will not be logged. The disableLogging option is per switch, so you can choose which ones will get log entries. If not supplied, the default value is false and state changes will be logged.

## Stateful Switches

The default behavior of a dummy switch is to turn itself off one second after being turned on. However you may want to create a dummy switch that remains on and must be manually turned off. You can do this by passing an argument in your config.json:

```
    "accessories": [
        {
          "accessory": "DummySwitch",
          "name": "My Stateful Switch 1",
          "stateful": true
        }   
    ]

```

## Reverse Switches

You may also want to create a dummy switch that turns itself on one second after being turned off. This can be done by passing the 'reverse' argument in your config.json:

```
    "accessories": [
        {
          "accessory": "DummySwitch",
          "name": "My Stateful Switch 1",
          "reverse": true
        }   
    ]

```

## Timed Switches

You may also want to create a timed switch that turns itself off after being on for a given time (for example, five seconds). This can be done by passing the 'time' argument in your config.json:

```
    "accessories": [
        {
          "accessory": "DummySwitch",
          "name": "My Stateful Switch 1",
          "time": 5000
        }   
    ]

```

## Resettable Timed Switches

You may also want to create a timed switch that is reset each time it is activated. This way, the original timer is reset instead of creating a new timer. 
This can be done by passing the 'resettable' argument in your config.json:

```
    "accessories": [
        {
          "accessory": "DummySwitch",
          "name": "My Stateful Switch 1",
          "time": 5000,
          "resettable": true
        }   
    ]

```

## Random Timed Switches

You might want to create a switch that given a random time turns itself off.
This can be achieved by enabling 'random'.
Each time a non-stateful, random timed switch is triggered, the time is set to a random value between 0 and 'time' milliseconds.
A random period within one hour is defined as follows in your config.json:

```
    "accessories": [
        {
          "accessory": "DummySwitch",
          "name": "My Stateful Random Switch 1",
          "time": 3600000,
          "random": true
        }
    ]

```

