# This plugin is not currently functional, do not use!

# "Dummy Contact Sensor" Plugin

Example config.json:

```
    "accessories": [
        {
          "accessory": "DummyContact",
          "name": "Contact 1"
        }   
    ]

```

With this plugin, you can create any number of fake contact sensors that will do nothing when "opened" (and will automatically "close" right afterward, simulating a stateless switch). This can be very useful for advanced automation with HomeKit scenes.

For instance, the Philips Hue app will automatically create HomeKit scenes for you based on Hue Scenes you create. But what if you want to create a scene that contains both Philips Hue actions and other actions (like turning on the coffee maker with a WeMo outlet)? You are forced to either modify the Hue-created scene (which can be a HUGE list of actions if you have lots of lights) or build your own HomeKit lighting scenes.

Instead, you can link scenes using these dummy contact sensors. Let's say you have a Hue Scene called "Rise and Shine" that you want to activate in the morning. And you have also setup the system HomeKit scene "Good Morning" to turn on your coffee maker and disarm you security system. You can add a single dummy contact sensor to your Good Morning scene, then create a Trigger based on the opening of the dummy contact sensor that also activates Rise And Shine.

## Stateful Contact Sensors

The default behavior of a dummy contact sensor is to close itself off one second after being turned on. However you may want to create a dummy contact sensor that remains open and must be manually closed. You can do this by passing an argument in your config.json:

```
    "accessories": [
        {
          "accessory": "DummyContact",
          "name": "Stateful Contact 1",
          "stateful": true
        }   
    ]

```

## Reverse Contact Sensors

You may also want to create a dummy switch that turns itself on one second after being turned off. This can be done by passing the 'reverse' argument in your config.json:

```
    "accessories": [
        {
          "accessory": "DummyContact",
          "name": "Reverse Contact 1",
          "reverse": true
        }   
    ]

```

## Timed Contact Sensors

You may also want to create a timed contact sensor that closes itself after being open for a given time (for example, five seconds). This can be done by passing the 'time' argument in your config.json:

```
    "accessories": [
        {
          "accessory": "DummyContact",
          "name": "Contact 1",
          "time": 5000
        }   
    ]

```
