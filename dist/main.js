/*! facebook-chat-plusplus - v0.1.0 - */

var popOverTpl = '\
   <div class="tabs">\
      <span><a class = "plus-btn nudge-btn" href="#" data-toggle="tab">Nudge</a></span>\
      <span><a class = "active sticker-btn" href="#" data-toggle="tab">Stickers</a></span>\
      <span><a class = "encrypt-btn" href="#" data-toggle="tab">Encrypt</a></span>\
   </div>\
   <div class="contents">\
      <div class="tab stickers">\
      <span><input id="stickerSearch" type="text" placeholder="Search for Stickers"> <button type="button" id="stickerBtn">Search</button></span>\
      <div id="stickerCont"></div>\
      </div>\
      <div class="tab hidden encryption">\
         Encryption\
      </div>\
   </div>\
   ';

function sendNudge(){

}

function populateStickers(data){
   var stickersEl = $("#stickerCont");
   for(var i = 0; i<data['data'].length;i++){
      stickersEl.append("<img src=\""+data['data'][i]['images']['original']['url']+"\" height=\"50\" width=\"50\">");
   }
   $("#stickerCont").on("click", "img", function(){
      url = $(this).attr('src');
      $(this).closest('.fbNubFlyoutInner').find('textarea').val(url);
   });
}
trending = [];
chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
      switch(message.type) {
            case "searchResult":
               $(".loading").remove();
               console.log("search results:");
               console.log(message.result);
               populateStickers(message.result);
               break;
            case "trendingResult":
               $(".loading").remove();
               console.log("trending results:");
               console.log(message.result);
               populateStickers(message.result);
               break;
        }
});

var ChatIconPopoverView = Marionette.LayoutView.extend({
   template: popOverTpl,

   events: {
      'click .plus-btn': 'onNudgeClick',
      'click .sticker-btn': 'onStickerClick',
      'click .encrypt-btn': 'onEncryptClick',
      'click #stickerBtn' : 'onStickerBtn'
   },
   onNudgeClick: function(){
      console.log("on nudge");
   },

   onStickerClick: function(){
      $("#stickerCont").empty();
      console.log("on sticker");
      $("#stickerCont").append("<img class=\"loading\" src=\"" + chrome.extension.getURL("icons/spinning-wheel.gif") + "\">");
      chrome.extension.sendMessage({
            type: "trending"
      });
      if($(".stickers").hasClass('hidden')){
         $(".stickers").removeClass('hidden');
      }
      if(!$(".encryption").hasClass('hidden')){
         $(".encryption").addClass('hidden');
      }
   },

   onStickerBtn: function(){
      $("#stickerCont").empty();
      console.log("button clicked");
      $("#stickerCont").append("<img class=\"loading\" src=\"" + chrome.extension.getURL("icons/spinning-wheel.gif") + "\">");
      var query = $("#stickerSearch").val();
      console.log(query);
      chrome.extension.sendMessage({
            type: "search",
            value: query
      });
   },

   onEncryptClick: function(){
      if($(".encryption").hasClass('hidden')){
         $(".encryption").removeClass('hidden');
      }
      if(!$(".stickers").hasClass('hidden')){
         $(".stickers").addClass('hidden');
      }
   }
});

var ChatIconView = Marionette.LayoutView.extend({
   className: 'fb-plusplus-wrap',
   template : '<div class="fb-plusplus-btn-wrap"><img class="fb-plusplus-btn" src="{{icon}}"></div>',
   events: {
      'click .fb-plusplus-btn' : 'onIconClick',
   },
   serializeData: function(){
      return {
         icon: chrome.extension.getURL("icons/chimp.png")
      }
   },
   onRender: function(){

      this.$(".fb-plusplus-btn-wrap").popover({
         trigger: 'manual',
         placement: 'top',
         html: true,
         container: this.$(".fb-plusplus-btn-wrap"),
         animation: true,
         title: 'Facebook-chat ++',
         content: function(){
            return new ChatIconPopoverView().render().el;
         }
      });
   },
   onIconClick: function(){
      this.$(".fb-plusplus-btn-wrap").popover('toggle');
   }
});

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
      if (diff < 10){
         $('body').shake(5, 15, 5);
      }

      // rerender the text
      $(target).closest('._5wd4').removeClass('_5wd4 _1nc6 direction_ltr _5yt9').addClass('_5w-5').empty()
         .append('<div class="_5w-6" style="color: red; margin-top: 5px;" ><abbr>You just got nudged</abbr></div>')
   }
}

function renderRecieve(target){
   var text = target.text();
   // reactidc contains the message timestamp, remove the first character
   // diff in ms
   var diff = Date.now() - target.data('reactid').split('=')[1].substring(1);
   diff = diff/1000 - 170; // weird differnece here

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
   }, 300);

   // listen to new messages, redirect to appropriate renderer
   window.setInterval(function(){
      $("div._5wd4 span._5yl5 span:not(.checked)").each(function() {
         $(this).addClass('checked');
         renderRecieve($(this));
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

