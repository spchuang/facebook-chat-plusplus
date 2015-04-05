/*! facebook-chat-plusplus - v0.1.0 - */
var tabTpl = '\
   <div class="tabs">\
      <button class = "btn btn-primary plus-btn nudge-btn" >Nudge</button><br>\
      <button class = "btn btn-primary sticker-btn" >Stickers</button><br>\
      <button class = "btn btn-primary encrypt-btn" >Encrypt</button><br>\
   </div>';

var contentTpl = '<div class="stickers hidden"><span><img class="back-btn" height="15" width="15" src=\"' + chrome.extension.getURL("icons/back.png") + '\"><input id="stickerSearch" type="text" placeholder="Search for Stickers">    <button type="button" id="stickerBtn">Search</button></span><div id="stickerCont"></div></div>';

var popOverTpl = tabTpl + contentTpl;

function populateStickers(data){
   var stickersEl = $("#stickerCont");
   for(var i = 0; i<data['data'].length;i++){
      stickersEl.append("<img src=\""+ chrome.extension.getURL("icons/spinning-wheel.gif") + "\" data-src=\""+data['data'][i]['images']['fixed_height_downsampled']['url']+"\" data=\"" + data['data'][i]['images']['original']['url'] + "\"height=\"50\" width=\"50\">");
   }

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
   $("img").unveil(100);
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

RenderFactory = {
   services: [],
   registerService: function(options){
      if(!_.isFunction(options.matchFunc) || !_.isFunction(options.renderMessageFunc)){
         console.log('ERROR: render service has to be functions!');
      };

      this.services.push(function(target){
         var text = target.find("span._5yl5 span").text();
         var isOwner = target.hasClass('_1nc6'); // HACKY

         // reactidc contains the message timestamp, remove the first character
         var diff = Date.now() - target.data('reactid').split('=')[1].substring(1);
         diff = diff/1000 - 170; // weird differnece here

         // trigger render function if match return true (NOTE: there should only be 1 true matching for each message)
         if(options.matchFunc(text)){
            // pass in target, time difference, and isOnwer(boolean)
            options.renderMessageFunc(target, diff, isOwner);
         }
      })
   },
   renderRecieve:function(target){
      _.each(this.services, function(service){
         service(target);
      });
   }
}

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function sendMessage(msg, toID, attachInfo){
   var fb_dtsg = $('[name=fb_dtsg]:first-child').val();
   var fd = fb_dtsg;
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

   // if attachment is true
   if (attachInfo){
      data["message_batch[0][has_attachment]"] = "true";
      data = _.extend(data, attachInfo);
   }


   var promise = $.ajax({
       type: "POST",
       url: "https://www.facebook.com/ajax/mercury/send_messages.php",
       data: $.param(data),
       dataType: "json",
       cache: false
   });
   return promise;
}

function getAttachment(url, callback){
   // https://www.facebook.com/ajax/share_scrape.php
   console.log("SEND");
   var myID = getCookie("c_user");//"1390253346";//$.cookie("c_user");
   var fb_dtsg = $('[name=fb_dtsg]:first-child').val();

   var data = {
      'chat': 'true',
      'u' : url,
      '__user': myID,
      '__a': '1',
      '__req': 'n',
      'fb_dtsg': fb_dtsg,
      '__rev': '1674690'
   }

   $.ajax({
       type: "POST",
       url: "https://www.facebook.com/ajax/share_scrape.php",
       data: $.param(data),
       dataType: "json",
       cache: false
   })
      .done(function(result){
         console.log(result);
      })
      .always(function(result) {

         var str = result.responseText.substring(9);
         var json = JSON.parse(str);
         var img = json.payload.__html;

         // extarct out the values
         var info = {};
         _.each($(img).find('input[type=hidden]'), function(el){
            input = $(el);
            // fix the naming format
            var t = input.attr('name').split("[");
            t[0] = '[' + t[0] + ']';
            for (var i = 1; i < t.length; i++){
               t[i] = '[' + t[i];
            }
            var name = t.join("");
            info["message_batch[0][content_attachment]"+name] = input.val();
         });

         // insert hardcoded s
         //info["message_batch[0][content_attachment][attachment][params][images][0]"] =
         //   "https://fbexternal-a.akamaihd.net/safe_image.php?d=AQCrgv0nQ14JIee0&w=100&h=100&url=http%3A%2F%2Fmedia3.giphy.com%2Fmedia%2F14eGJZQvtrl1wk%2Fgiphy.gif&cfs=1&upscale=1";
         info["message_batch[0][content_attachment][composer_metrics][best_image_w]"] = 100;
         info["message_batch[0][content_attachment][composer_metrics][best_image_h]"] = 100;
         info["message_batch[0][content_attachment][composer_metrics][image_selected]"] = 0;
         info["message_batch[0][content_attachment][composer_metrics][images_provided]"] = 1;
         info["message_batch[0][content_attachment][composer_metrics][images_loaded]"] = 1;
         info["message_batch[0][content_attachment][composer_metrics][images_shown]"] = 1;
         info["message_batch[0][content_attachment][composer_metrics][load_duration]"] = 4;
         info["message_batch[0][content_attachment][composer_metrics][timed_out]"] = 0;
         info["message_batch[0][content_attachment][composer_metrics][sort_order]"] = "";
         info["message_batch[0][content_attachment][composer_metrics][selector_type]"] = "UIThumbPager_6";

         if (callback) callback(info);
      });
}

function addAttachment(data){
   /*
   message_batch[0][content_attachment][subject]:media3.giphy.com
   message_batch[0][content_attachment][app_id]:2309869772
   message_batch[0][content_attachment][attachment][params][urlInfo][canonical]:http://media3.giphy.com/media/mfvWax2ZKWBck/giphy.gif
   message_batch[0][content_attachment][attachment][params][urlInfo][final]:http://media3.giphy.com/media/mfvWax2ZKWBck/giphy.gif
   message_batch[0][content_attachment][attachment][params][urlInfo][user]:http://media3.giphy.com/media/mfvWax2ZKWBck/giphy.gif
   message_batch[0][content_attachment][attachment][params][images][0]:https://fbexternal-a.akamaihd.net/safe_image.php?d=AQC30-EsaqP04ff9&w=100&h=100&url=http%3A%2F%2Fmedia3.giphy.com%2Fmedia%2FmfvWax2ZKWBck%2Fgiphy.gif&cfs=1&upscale=1
   message_batch[0][content_attachment][attachment][params][medium]:101
   message_batch[0][content_attachment][attachment][params][url]:http://media3.giphy.com/media/mfvWax2ZKWBck/giphy.gif
   message_batch[0][content_attachment][attachment][type]:100
   message_batch[0][content_attachment][link_metrics][source]:ShareStageExternal
   message_batch[0][content_attachment][link_metrics][domain]:media3.giphy.com
   message_batch[0][content_attachment][link_metrics][base_domain]:giphy.com
   message_batch[0][content_attachment][link_metrics][title_len]:16
   message_batch[0][content_attachment][link_metrics][summary_len]:0
   message_batch[0][content_attachment][link_metrics][min_dimensions][0]:70
   message_batch[0][content_attachment][link_metrics][min_dimensions][1]:70
   message_batch[0][content_attachment][link_metrics][images_with_dimensions]:1
   message_batch[0][content_attachment][link_metrics][images_pending]:0
   message_batch[0][content_attachment][link_metrics][images_fetched]:0
   message_batch[0][content_attachment][link_metrics][image_dimensions][0]:400
   message_batch[0][content_attachment][link_metrics][image_dimensions][1]:222
   message_batch[0][content_attachment][link_metrics][images_selected]:1
   message_batch[0][content_attachment][link_metrics][images_considered]:1
   message_batch[0][content_attachment][link_metrics][images_cap]:3
   message_batch[0][content_attachment][link_metrics][images_type]:ranked
   message_batch[0][content_attachment][composer_metrics][best_image_w]:100
   message_batch[0][content_attachment][composer_metrics][best_image_h]:100
   message_batch[0][content_attachment][composer_metrics][image_selected]:0
   message_batch[0][content_attachment][composer_metrics][images_provided]:1
   message_batch[0][content_attachment][composer_metrics][images_loaded]:1
   message_batch[0][content_attachment][composer_metrics][images_shown]:1
   message_batch[0][content_attachment][composer_metrics][load_duration]:4
   message_batch[0][content_attachment][composer_metrics][timed_out]:0
   message_batch[0][content_attachment][composer_metrics][sort_order]:
   message_batch[0][content_attachment][composer_metrics][selector_type]:UIThumbPager_6
   */
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


function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
   return Handlebars.compile(rawTemplate);
};

Backbone.Marionette.TemplateCache.prototype.loadTemplate = function(templateId){
   return templateId;
}

RenderFactory.registerService({
   matchFunc: function(text){
      return text == "nudge_123456789"
   },
   renderMessageFunc: function(target, diff, isOwner){
      // rerender the text (HACKY)
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
});
