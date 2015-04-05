var tabTpl = '\
   <div class="tabs">\
      <button class = "btn btn-primary plus-btn nudge-btn" >Nudge</button><br>\
      <button class = "btn btn-primary sticker-btn" >Stickers</button><br>\
      <button class = "btn btn-primary encrypt-btn" >Encrypt</button><br>\
   </div>';

var contentTpl = '<div class="stickers hidden"><span><img class="back-btn" height="15" width="15" src=\"' + chrome.extension.getURL("icons/back.png") + '\"><input id="stickerSearch" type="text" placeholder="Search for Stickers">    <button type="button" id="stickerBtn">Search</button></span><div id="stickerCont"></div></div>';

var popOverTpl = tabTpl + contentTpl;

function populateStickers(data, cb){
   var stickersEl = $("#stickerCont");
   for(var i = 0; i<data['data'].length;i++){
      stickersEl.append("<img src=\""+ chrome.extension.getURL("icons/spinning-wheel.gif") + "\" data-src=\""+data['data'][i]['images']['fixed_height_downsampled']['url']+"\" data=\"" + data['data'][i]['images']['original']['url'] + "\"height=\"50\" width=\"50\">");
   }
   $("img").unveil();
   $("#stickerCont").on("click", "img", function(){

      url = $(this).attr('data');
      var that = this;
      getAttachment(url, function(attachInfo){
         var id = $(that).closest('.fbNubFlyoutFooter').attr('id').replace("chat-", "");
         var c = getChatBoxController(id);
         c.sendMessage(url, attachInfo);
      });
      //$(this).closest('.fbNubFlyoutInner').find('textarea').val(url);
   });
   cb();
}
trending = [];
chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
      switch(message.type) {
            case "searchResult":
               $(".loading").remove();
               console.log("search results:");
               console.log(message.result);
               populateStickers(message.result, function(){
                  $("img").unveil(100);
               });
               break;
            case "trendingResult":
               $(".loading").remove();
               console.log("trending results:");
               console.log(message.result);
               populateStickers(message.result,function(){
                  $("img").unveil(100);
               });
               break;
        }
});

var ChatIconPopoverView = Marionette.LayoutView.extend({
   template: popOverTpl,

   events: {
      'click .plus-btn': 'onNudgeClick',
      'click .sticker-btn': 'onStickerClick',
      'click .encrypt-btn': 'onEncryptClick',
      'click #stickerBtn' : 'onStickerBtn',
      'click .back-btn' : 'back'
   },
   initialize: function(option){
      this.control = option.control;
   },
   onNudgeClick: function(){
      this.control.sendMessage("nudge_123456789");
   },

   onStickerClick: function(){
      $('.popover.fade.top.in').css('width', 250);
      $(".tabs").toggle('slow');
      $("#stickerCont").empty();
      console.log("on sticker");
      $("#stickerCont").append("<img class=\"loading\" src=\"" + chrome.extension.getURL("icons/spinning-wheel.gif") + "\">");
      chrome.extension.sendMessage({
            type: "trending"
      });
      if($(".stickers").hasClass('hidden')){
         $(".stickers").removeClass('hidden');
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
   },

   back: function(){
      $('.popover.fade.top.in').css('width', 150);
      $(".tabs").toggle('slide');
      $(".stickers").addClass('hidden');
   }
});

var iconTpl = '<div class="fb-plusplus-btn-wrap">\
      <img class="fb-plusplus-btn" src="{{icon}}">\
      <img class="loading-sign hide" src="{{loading}}">\
   </div>'
var ChatIconView = Marionette.LayoutView.extend({
   className: 'fb-plusplus-wrap',
   template : iconTpl,
   events: {
      'click .fb-plusplus-btn' : 'onIconClick',
   },
   initialize: function(option){
      this.control = option.control;
   },
   serializeData: function(){
      return {
         icon: chrome.extension.getURL("icons/chimp.png"),
         loading: chrome.extension.getURL("icons/spinning-wheel.gif"),
      }
   },
   showLoading: function(){
      this.$("img.fb-plusplus-btn").addClass('hide');
      this.$("img.loading-sign").removeClass('hide');
   },
   showIcon: function(){
      this.$("img.fb-plusplus-btn").removeClass('hide');
      this.$("img.loading-sign").addClass('hide');
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
