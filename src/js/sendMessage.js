function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function sendMessage(msg, toID){
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
   $.ajax({
       type: "POST",
       url: "https://www.facebook.com/ajax/mercury/send_messages.php",
       data: $.param(data),
       dataType: "json",
       cache: false
   });
}
