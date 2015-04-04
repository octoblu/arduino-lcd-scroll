'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('insta-lcd')
var five = require("johnny-five");
var scroll = require('lcd-scrolling');
var _ = require('lodash');


// @markdown
// [Grove - LCD RGB w/ Backlight](http://www.seeedstudio.com/depot/grove-lcd-rgb-backlight-p-1643.html)
// ![Grove LCD RGB](http://www.seeedstudio.com/wiki/images/0/03/Serial_LEC_RGB_Backlight_Lcd.jpg)
// @markdown

var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum : ['clear', 'write'],
      required: true
    },
    message: {
      type: 'string',
      required: true
    }
  }
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    firstExampleOption: {
      type: 'string',
      required: true
    }
  }
};

function Plugin(){
  var self = this;
  self.initializeBoard();
  this.options = {};
  this.messageSchema = MESSAGE_SCHEMA;
  this.optionsSchema = OPTIONS_SCHEMA;
  return this;
};

util.inherits(Plugin, EventEmitter);

Plugin.prototype.initializeBoard = function(callback){
   var self = this;
   self.board = new five.Board();
   self.board.on("ready", function(){
       var lcd = new five.LCD({
        controller: "JHD1313M1"
      });

      self.scroll = scroll.setup({
        lcd: lcd,
        char_length : 16,
        row : 2
      });
    self.lcd = lcd;

    scroll.line(0, 'Connected!');
  });
};

Plugin.prototype.onMessage = function(message){
  var self = this;
  console.log('Message received', message)
  var payload = message.payload;
  if(payload.action === 'clear'){
    this.lcd.clear();
  }  else if (payload.action === 'write'){

     self.scroll.line(0, payload.text);
  }

};

Plugin.prototype.onConfig = function(device){
  this.setOptions(device.options||{});
};

Plugin.prototype.setOptions = function(options){
  this.options = options;
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
