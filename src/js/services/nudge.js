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
