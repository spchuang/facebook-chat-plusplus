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


   $.ajax({
       type: "POST",
       url: "https://www.facebook.com/ajax/mercury/send_messages.php",
       data: $.param(data),
       dataType: "json",
       cache: false
   });
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
