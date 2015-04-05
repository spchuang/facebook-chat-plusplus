var App = new Backbone.Marionette.Application();


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
      });
   }, 100);

   // hacky to close popover when click outside
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
