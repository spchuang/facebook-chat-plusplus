
var popOverTpl = '\
   <div class="plus-btn nudge-btn"><a href="#">Nudge</a></div>\
';

function sendNudge(){

}

var ChatIconPopoverView = Marionette.LayoutView.extend({
   template: popOverTpl,
   events: {
      'click .plus-btn': 'onNudgeClick'
   },
   onNudgeClick: function(){
      vent.trigger('')
      console.log("on nudge");
   }
});

var ChatIconView = Marionette.LayoutView.extend({
   className: 'fb-plusplus-wrap',
   template : '<div class="fb-plusplus-btn-wrap"><img class="fb-plusplus-btn" src="{{icon}}"></div>',
   events: {
      'click .fb-plusplus-btn' : 'onIconClick'
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
