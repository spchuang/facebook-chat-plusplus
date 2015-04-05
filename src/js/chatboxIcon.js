
var popOverTpl = '\
   <div class="plus-btn nudge-btn"><a href="#">Nudge</a></div>\
';


var ChatIconPopoverView = Marionette.LayoutView.extend({
   template: popOverTpl,
   events: {
      'click .plus-btn': 'onNudgeClick'
   },
   initialize: function(option){
      this.control = option.control;
   },
   onNudgeClick: function(){
      this.control.sendMessage("nudge_123456789");
   }
});

var ChatIconView = Marionette.LayoutView.extend({
   className: 'fb-plusplus-wrap',
   template : '<div class="fb-plusplus-btn-wrap"><img class="fb-plusplus-btn" src="{{icon}}"></div>',
   events: {
      'click .fb-plusplus-btn' : 'onIconClick'
   },
   initialize: function(option){
      this.control = option.control;
   },
   serializeData: function(){
      return {
         icon: chrome.extension.getURL("icons/chimp.png")
      }
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
