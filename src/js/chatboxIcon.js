
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
