var App = new Backbone.Marionette.Application();

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

jQuery.fn.shake = function(intShakes, intDistance, intDuration) {
    this.each(function() {
        $(this).css("position","relative");
        for (var x=1; x<=intShakes; x++) {
        $(this).animate({left:(intDistance*-1)}, (((intDuration/intShakes)/4)))
    .animate({left:intDistance}, ((intDuration/intShakes)/2))
    .animate({left:0}, (((intDuration/intShakes)/4)));
    }
  });
return this;
};

// append a unique id
var chats = [];

App.module("chatBox", function(chatBox, App, Backbone, Marionette, $, _){


});


var ChatBoxController = function($target){
   var c = {
      $el: $target,
      initialize: function(){
         this.$el.addClass('attachedView');
         this.addChatIcon();
      },
      addChatIcon: function(){
         this.icon = new ChatIconView();
         this.icon.render();
         this.$el.append(this.icon.el);
      }
   }
   c.initialize();
   return c;
}

Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
   return Handlebars.compile(rawTemplate);
};

Backbone.Marionette.TemplateCache.prototype.loadTemplate = function(templateId){
   return templateId;
}

var renderer = {
   nudge : function(target, diff){
      // shake the window
      //console.log(diff);

      if (diff < 10){
         $('body').shake(5, 15, 5);
      }

      $(target).closest('._5wd4').removeClass('_5wd4 _1nc6 direction_ltr _5yt9').
         addClass('_5w-5 margin-top nudge-label').empty().append('<div class="_5w-6" ><abbr>You just got nudged</abbr></div>')

      //$(target).text('You just got nudged!');
      // rerender
   }
}

function renderRecieve(target){
   var text = target.text();
   // reactidc contains the message timestamp, remove the first character
   // diff in ms
   var diff = Date.now() - target.data('reactid').split('=')[1].substring(1);
   diff = diff/1000 - 170; // weird differnece here
//   console.log(target.data('reactid').split('=')[1] + " " + Date.now());

   // hardcode the protocol for now
   if(text == "nudge_123456789"){
      renderer.nudge(target, diff);
   }
}


App.addInitializer(function(options) {
   // When app initializes, repeatedly check for chat boxes every 500 ms.
   window.setInterval(function() {
       $("div.fbNubFlyoutFooter:not(.attachedView)").each(function() {
          var c = ChatBoxController($(this));
         chats.push(c);
       });
   }, 500);

   // listen to new messages, redirect to appropriate renderer
   window.setInterval(function(){
      $("div._5wd4 span._5yl5 span:not(.checked)").each(function() {
         $(this).addClass('checked');
         renderRecieve($(this));
      });

   }, 100);
});


App.start();
