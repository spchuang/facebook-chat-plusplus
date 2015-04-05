var App = new Backbone.Marionette.Application();

// append a unique id
var chats = {};

var ChatBoxController = function($target){
   var c = {
      id: guid(),
      $el: $target,
      initialize: function(){
         this.$el.addClass('attachedView');
         this.$el.attr('id', 'chat-'+this.id);
         // get the other dude's id
         this.url = this.$el.closest(".fbNubFlyoutInner").find('.fbNubFlyoutTitlebar').find('.titlebarText').attr('href');
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
         this.encryptMode = false;
         this.encryptPassword = "test";
         this.addChatIcon();
         this.addEncryptTextBox();
      },
      addChatIcon: function(){
         this.icon = new ChatIconView({control: this});
         this.icon.render();
         this.$el.append(this.icon.el);
      },
      addEncryptTextBox: function(){
         //Append encrypt textarea next to original 
         var that = this;
         this.$el.closest(".fbNubFlyoutInner").find('textarea').addClass('original-textarea');
         this.$el.closest(".fbNubFlyoutInner").find('div._552h').append('<textarea class="uiTextareaAutogrow _552m encrypt-textarea hidden" style="height: 12px;"></textarea>');
         //Bind jquery events to textbox
         this.$el.closest(".fbNub").click(function() {
            if(that.encryptMode) {
               $(this).find(".encrypt-textarea").focus();
            }
         });
         this.$el.closest(".fbNubFlyoutInner").find('.encrypt-textarea').keydown(function(e){
            if(e.which == 13 && that.encryptMode) {
               //Enter is pressed
               var msg = encryptText($(this).val(), that.encryptPassword);
               that.sendMessage(msg);
               $(this).val('');
            } else if(e.which == 27){
               //ESC is pressed
               that.encryptMode = false;
               $(this).closest('div._552h').removeClass('encrypt-chat');
               $(this).closest('div._552h').find(".encrypt-textarea").addClass('hidden');
               $(this).closest('div._552h').find(".original-textarea").removeClass('hidden');               
            }
         });
      },
      sendMessage: function(msg, attachInfo){
         this.icon.showLoading();
         if(!this.valid){
            console.log("THIS IS INVALID");
            return;
         }


         if(!this.toID){
            console.log("NO ID");
            return;
         }

         var that = this;
         var promise = sendMessage(msg, this.toID, attachInfo);
         promise.always(function(){
            that.icon.showIcon();
         });
      }
   }
   c.initialize();
   return c;
}

function getChatBoxController(id){
   return chats[id];
}

function encryptText(text, password){
   if (password == null) {
      console.log("encryptPassword is null, error!");
      return null;
   }
   var encrypted = CryptoJS.AES.encrypt(text, password);
   return "encrypt_123456789\n\n" + encrypted.toString();
}

function decryptText(ciphertext, password){
   if (password == null) {
      console.log("decryptPassword is null, error!");
      return null;
   }   

   var decrypted = CryptoJS.AES.decrypt(ciphertext, password);
   return decrypted.toString(CryptoJS.enc.Utf8);
}

App.addInitializer(function(options) {
   // When app initializes, repeatedly check for chat boxes every 500 ms.
   window.setInterval(function() {
       $("div.fbNubFlyoutFooter:not(.attachedView)").each(function() {
         var c = ChatBoxController($(this));
         chats[c.id] = c;
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
