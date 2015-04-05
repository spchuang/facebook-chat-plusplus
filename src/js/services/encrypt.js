RenderFactory.registerService({
   matchFunc: function(text){
      return text.substr(0, 19) == "encrypt_123456789\n\n"
   },
   renderMessageFunc: function(target, diff, isOwner){
      target = target.find("span._5yl5 span");
      var text = target.text();
      $(target).empty().append('<a href="#">Encrypted Message</a><span class="encrypted-text" hidden>' + text.substr(19) + '</span>')
         
      $(target).find('a').on('click', function(){
         var ciphertext = $(this).closest('._5wd4').find('.encrypted-text').text();
         console.log(ciphertext);
         var password = prompt("Please enter the decrypt password", "");
         if (password) {
            var text = decryptText(ciphertext, password);
            if (text) {
               $(this).parent().empty().text(text);
            } else {
               alert("Wrong decryption password provided!");
            }
         }
      });
   }
});
