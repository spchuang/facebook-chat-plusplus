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
