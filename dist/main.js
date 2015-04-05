/*! facebook-chat-plusplus - v0.1.0 - */

var popOverTpl = '\
   <div class="plus-btn nudge-btn"><a href="#">Nudge</a></div>\
';


var ChatIconPopoverView = Marionette.LayoutView.extend({
   template: popOverTpl,
   events: {
      'click .plus-btn': 'onNudgeClick'
   },
   initialize: function(option){
      this.control = option.control;
   },
   onNudgeClick: function(){
      this.control.sendMessage("nudge_123456789");
   }
});

var ChatIconView = Marionette.LayoutView.extend({
   className: 'fb-plusplus-wrap',
   template : '<div class="fb-plusplus-btn-wrap"><img class="fb-plusplus-btn" src="{{icon}}"></div>',
   events: {
      'click .fb-plusplus-btn' : 'onIconClick'
   },
   initialize: function(option){
      this.control = option.control;
   },
   serializeData: function(){
      return {
         icon: chrome.extension.getURL("icons/chimp.png")
      }
   },
   onRender: function(){
      var that = this;
      this.$(".fb-plusplus-btn-wrap").popover({
         trigger: 'manual',
         placement: 'top',
         html: true,
         container: this.$(".fb-plusplus-btn-wrap"),
         animation: true,
         title: 'Facebook-chat ++',
         content: function(){
            return new ChatIconPopoverView({control: that.control}).render().el;
         }
      });
   },
   onIconClick: function(){
      this.$(".fb-plusplus-btn-wrap").popover('toggle');
   }
});

var App = new Backbone.Marionette.Application();

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

var ChatBoxController = function($target){
   var c = {
      $el: $target,
      initialize: function(){
         this.$el.addClass('attachedView');
         // get the other dude's id
         this.url = this.$el.closest(".fbNubFlyoutInner").find('.fbNubFlyoutTitlebar').find('.titlebarText').attr('href');

         if(!this.url){
            this.valid = false;
         }else {
            this.valid = true;
            this.name = this.url.match(/https?\:\/\/(?:www\.)?facebook\.com\/(\d+|[A-Za-z0-9\.]+)\/?/)[1];

            // get the url
            var that = this;
            this.toID = "";
            $.get("https://graph.facebook.com/" + this.name)
               .done(function(data){
                  that.toID = data.id;
               });
         }

         this.addChatIcon();
      },
      addChatIcon: function(){
         this.icon = new ChatIconView({control: this});
         this.icon.render();
         this.$el.append(this.icon.el);
      },
      sendMessage: function(msg){
         if(!this.valid){
            console.log("THIS IS INVALID");
            return;
         }

         if(!this.toID){
            console.log("NO ID");
            return;
         }

         sendMessage(msg, this.toID);
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
   nudge : function(target, diff, isOwner){
      // rerender the text
      var a = $(target).removeClass('_5wd4 _1nc6 direction_ltr _5yt9').addClass('_5w-5').empty()
      if(isOwner){
         a.append('<div class="_5w-6" style="color: red; margin-top: 5px;" ><abbr>You just Nudged the other person!</abbr></div>')
      }else{
         // shake the window
         if (diff < 10){
            $('html').shake(5, 20, 8);
         }
         a.append('<div class="_5w-6" style="color: red; margin-top: 5px;" ><abbr>You just got nudged</abbr></div>')
      }

   }
}

function renderRecieve(target){
   var text = target.find("span._5yl5 span").text();
   var isOwner = target.hasClass('_1nc6');

   // reactidc contains the message timestamp, remove the first character
   // diff in ms
   var diff = Date.now() - target.data('reactid').split('=')[1].substring(1);
   diff = diff/1000 - 170; // weird differnece here

   // hardcode the protocol for now
   if(text == "nudge_123456789"){
      renderer.nudge(target, diff, isOwner);
   }
}


App.addInitializer(function(options) {
   // When app initializes, repeatedly check for chat boxes every 500 ms.
   window.setInterval(function() {
       $("div.fbNubFlyoutFooter:not(.attachedView)").each(function() {
         var c = ChatBoxController($(this));
         chats.push(c);
       });
   }, 300);

   // listen to new messages, redirect to appropriate renderer
   window.setInterval(function(){
      $("div._5wd4:not(.checked)").each(function() {
         $(this).addClass('checked');
         renderRecieve($(this));
         console.log("WHAT");
      });
   }, 100);

   // hacky
   $('body').on('click', function (e) {
      if(!$(e.target).hasClass('fb-plusplus-btn')){
         if(!$(e.target).closest('.popover').length) {
              $('.popover').each(function(){
                 $(this).parent().popover('hide');
              });
          }
      }
   });

});


App.start();


function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function sendMessage(msg, toID){
   var fb_dtsg = $('[name=fb_dtsg]:first-child').val();
   var fd = fb_dtsg; //var fd=fb_dtsg.substr(0,8);
   var myID = getCookie("c_user");//"1390253346";//$.cookie("c_user");

   var data = {
       "message_batch[0][action_type]": "ma-type:user-generated-message",
       "message_batch[0][author]": "fbid:" + myID,
       "message_batch[0][thread_id]": "",
       "message_batch[0][author_email]": "",
       "message_batch[0][coordinates]": "",
       "message_batch[0][timestamp]": Date.now(),
       "message_batch[0][timestamp_absolute]": "Today",
       "message_batch[0][timestamp_relative]": "9:48pm",
       "message_batch[0][timestamp_time_passed]": "0",
       "message_batch[0][is_filtered_content]": "false",
       "message_batch[0][manual_retry_cnt]": "0",
       "message_batch[0][client_thread_id]": "user:"+toID, // other user
       "message_batch[0][is_unread]": "false",
       "message_batch[0][is_cleared]": "false",
       "message_batch[0][is_forward]": "false",
       "message_batch[0][is_spoof_warning]": "false",
       "message_batch[0][source]": "source:chat:web",
       "message_batch[0][source_tags][0]": "source:chat",
       "message_batch[0][body]": msg,
       "message_batch[0][has_attachment]": "false",
       "message_batch[0][html_body]": "false",
       "message_batch[0][specific_to_list][0]": "fbid:" + toID, // other dude
       "message_batch[0][specific_to_list][1]": "fbid:" + myID,
       "message_batch[0][status]": "0",
       "message_batch[0][message_id]": "<1428209280630:3291052910-1015224784@mail.projektitan.com>",
                                       //"<1428209306638:3413793109-1015224784@mail.projektitan.com>"
       //_0x11fax14["replace"]("undefined", _0x11fax17),
       "message_batch[0][ui_push_phase]": "V3",
       "client": "mercury",
       "__a": "1",
       "fb_dtsg": fb_dtsg,
       "__user": myID,
       "__rev": "1674690",
       "phstamp": "165816710611285106" + Math["floor"](Math["random"]() * 5)
   };
   $.ajax({
       type: "POST",
       url: "https://www.facebook.com/ajax/mercury/send_messages.php",
       data: $.param(data),
       dataType: "json",
       cache: false
   });
}
