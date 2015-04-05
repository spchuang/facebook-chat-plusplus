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
         console.log(this.url)
         if(!this.url){
            this.valid = false;
         }else {
            this.valid = true;
            this.name = this.url.match(/https?\:\/\/(?:www\.)?facebook\.com\/(\d+|[A-Za-z0-9\.]+)\/?/)[1];

            this.toID = "";
            // if we have //messages/id, then messages is already given
            if(this.name === "messages") {
               // retrieve the id directoy
               this.toID = this.url.match(/https?\:\/\/(?:www\.)?facebook\.com\/(messages\/)(\d+|[A-Za-z0-9\.]+)\/?/)[2];
            } else {
               // get the id
               var that = this;

               console.log(this.name);
               $.get("https://graph.facebook.com/" + this.name)
                  .done(function(data){
                     that.toID = data.id;
                  });
            }

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
         //renderRecieve($(this));
         RenderFactory.renderRecieve($(this));
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
