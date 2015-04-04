
var popOverTpl = '\
   <div class="plus-btn nudge-btn"><a href="#">Nudge</a></div>\
'

var ChatIconPopoverView = Marionette.LayoutView.extend({
   template: popOverTpl,
   events: {
      'click .plus-btn': 'onNudgeClick'
   },
   onNudgeClick: function(){
      console.log("on nudge");
   }
});

var ChatIconView = Marionette.LayoutView.extend({
   className: 'fb-plusplus-wrap',
   template : '<img class="fb-plusplus-btn" src="{{icon}}">',
   events: {
      'click .fb-plusplus-btn' : 'onIconClick'
   },
   serializeData: function(){
      return {
         icon: chrome.extension.getURL("icons/chimp.png")
      }
   },
   onRender: function(){
      this.$('.fb-plusplus-btn').webuiPopover({
         title:'Facebook-chat ++',
         content: function(){
            return new ChatIconPopoverView().render().el;
         },
         placement:'top'
      });
   },
   onIconClick: function(){

   }
});
