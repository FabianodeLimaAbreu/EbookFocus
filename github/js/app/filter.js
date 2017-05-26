/**
*@fileOverview Filter's page with Modal, Content and Boxes classes
* @module Spotlight
*
*/

window.Filter = Spine.Controller.sub({
  elements:{
    ".filter_list":"listEl",
    ".filter-area-down":"subfilter",
    ".bclear":"bclear"
  }, 
  events:{
    "click .filter_list a":"select",
    "click .allowitens a":"add",
    "click .bfilter":"confirm",
    "click #filter-sublist .bclose":"close",
    "click .bclear":"cancel"
  },

  //Ao clicar para adicionar no subfiltro
  add:function(a) {
    if("object" === typeof a) {
      a.preventDefault(), a = $(a.target);
    }else {
      return!1
    }
    var b, c, d;
    b = this.listEl.find(".sel").attr("href").split("#")[1];
    c = a.attr("data");
    d = this.listEl.find("a").index(this.listEl.find(".sel"));
    a.hasClass("sel") ? (b = this.list.filter(function(a) {
      return a.id === d && a.ft === c.toLowerCase();
    }), this.list = this.list.diff(b), a.removeClass("sel")) : (this.list.push({id:d, bt:b, ft:c.toLowerCase()}), a.addClass("sel"));
  },

  //Ao clicar em uma das opcoes do filtro
  select:function(a) {
    if("object" === typeof a) {
      a.preventDefault(), a = $(a.target);
    }else {
      return!1;
    }
    this.subfilter.hide().find(".allowitens").empty();
    if(!a.hasClass("unsel") || a.hasClass("off")) {
      a.removeClass('sel').addClass('unsel');
      this.close();
      return!1;
    }
    this.subfilter.hide().find(".allowitens").empty();
    this.listEl.find("a").removeClass("sel").addClass("unsel");
    a.addClass("sel").removeClass("unsel");
    var b = a.attr("href").split("#")[1];
    (a = this.getfilter(b)) && this.setfilters(a.sort(), b);
    this.setloading(!0,!0);
    //$(".mask").fadeIn().find(".loader").hide();
    $(".toshow").hide();
    this.subfilter.slideDown("slow");
  }, 

  //Cria a sub lista, apos receber a lista de itens e a string do filtro inicial
  setfilters:function(a,b){
    var c, d, e = [], f;
    d = this;
    a.forEach(function(a) {
      c = d.list.length ? d.list.filter(function(c) {
        return c.bt === b && (c.ft === a || c.ft.toUpperCase() === a);
      }) : !1;
      c = parseInt(c) || c.length ? "sel" : " ";
      f = (-1 !== a.indexOf('oz')) ? a : a.capitalize();
      e.push('<li><a href="#" data="' + a + '" class="'+c+'">' + f + "</a></li>");
    });
    this.subfilter.find(".allowitens").html(e.join(""));
  },
  /**
  * This method take a string of filter's option name and verify into this.data's items to enable or not a filter option
  * @param {String} a - String/Name of filter's option
  * @memberOf Filter#
  * @name getfilter
  */
  getfilter:function(a){
    var b, c;
    if("CMP" !== a) {
      for(var d = [], e = 0;e < this.data.length;e++) {
        (b = this.data[e][a]) && " " !== b && 0 !== parseInt(b, 10) && 1 !== parseInt(b, 10) && d.push(b.toLowerCase());
      }
    }else {
      for(d = [], e = 0;e < this.data.length;e++) {
        for(c = 0;7 > c;c++) {
          (b = this.data[e][a + (c + 1)]) && " " !== b && d.push(b);
        }
      }
    }
    return d.unique();
  },

  /**
  * This method pass into all array itens received as param, and call getFilter's method,  if this called method return false, add class "off" 
  * @param {json} a - List object
  * @memberOf Filter#
  * @name checklist
  */
  checklist:function(a){
    this.data = a;
    var b, c;
    a = this.listEl.find(".unsel");
    b = this;
    a.each(function() {
      $(this).removeClass("off");
      c = $(this).attr("href").split("#")[1];
      c = b.getfilter(c);
      c.length || $(this).addClass("off");
    });
  },
  reload:function(a,b){
    var i,b,d=[];
      b = b || this.data;
      if("CMP" !== a.bt) {
        return b.filter(function(b) {
          return b[a.bt] && -1 !== b[a.bt].toLowerCase().indexOf(a.ft);
        });
      }
      if(!a.pc) {
        c=b;
        c=c.filter(function(b){
          for(i=1;7 > i;i++){
            if(b[a.bt+""+i]){
              //If composition has a value
              if((b[a.bt+""+i].toLowerCase().indexOf(a.ft))+1){
                //console.log(b[a.bt+""+i]);
                return 1;
              }
            }
          }
          return 0;
        });
        if(c.length){
          if(d.length){
            d.concat(c);
          }
          else{
            d = c;
          }
        }
        //console.dir(d);
        return d;
      }
  },
  confirm:function(a,cookie) {
    var b, c, d, e = this, f, g;
    //console.dir(this.list);
    this.list = this.list.sortBy("id");
    $(".filter_list li span").text(0).addClass('hide');
    c = this.list.map(function(a, b) {
      $(".filter_list a[href='#"+a.bt+"']").parent().find("span").removeClass('hide').html(parseInt($(".filter_list a[href='#"+a.bt+"']").parent().find("span").html())+1);
        return a.id;
    });
    c = c.unique();
    if(c.length){
      for(b = 0;b < c.length;b++) {
        a = this.list.filter(function(a) {  
          return a.id === c[b];
        });

        a.length && (f = []) && a.forEach(function(a) {
          f = d = f.concat(e.reload(a, g));
          //console.log(a.bt +" "+ a.ft +" "+ d.length);
        }), g = d;
        if(!g.length){
          return this.resetOptFilter(),this.setdata(g.unique()), this.close(), !1; 
        }
      }
      if(g){
        if(cookie){
          return g.unique();
        }
        this.resetOptFilter();
        this.setdata(g.unique());
        this.close();
      }
    }
    else{
      if(cookie){
        return this.data;
      }
      this.bclear.eq(0).trigger('click');
    }
  },
  cancel:function(a) {
    "object" === typeof a && (a.preventDefault(), $(a.target));
    $(".filter_list li span").text(0).addClass('hide');
    this.subfilter.hide().find(".allowitens").empty();
    this.listEl.find("a").removeClass("sel").addClass("unsel");
    //this.filterEl.slideUp("slow");
    this.list = [];
    //this.resetSort();
    this.resetOptFilter();
    this.setdata(this.list,!1,!0);
    this.close();
    return!1;
  },

  close:function(){
    this.subfilter.hide().find(".allowitens").empty();
    this.listEl.find("a").removeClass("sel").addClass("unsel");
    this.setloading(!1,!1),$(".toshow").show();
    $(".filter-container.small-filter").fadeOut();
  },
  reset:function(){
    this.list = [];
    this.resetOptFilter();
  },
  init : function(){
    this.list = [];
    this.data = null;
    this.subfilter.hide().find(".allowitens").empty();
  }
});

/**
* Spotlight's class and actions
* @exports Spotlight
* @constructor
*/
window.Spotlight = Spine.Controller.sub({
  elements:{
    "dd":"buttons"

  }, 
  events:{
    "click dd":"select"
  }, 
  /**
  * Open Spotlight, change arrow down and top and search sycronious during user's type words that matches
  * @param {event} a - key event
  * @memberOf ModalHome#
  * @name open
  */
  open: function(a){
    var b, c, d, e = [], g;
    var context=this;
    this.doc.unbind("click").bind("click", function(a){context.close(a)}); //Click out spotlight area
    this.input = $(a.target);
    g = d = a.target.value;
    this.list && (d = d.replace(this.list, ""));
    if(2 > d.length) {
      return!1;
    }
    if(40 === a.keyCode || 38 === a.keyCode) {
      //Arrow top and down
      return this.arrow(a), !1;
    }
    if(48 <= a.keyCode && 90 >= a.keyCode || 8 == a.keyCode) {
      //Typing...
        b = this.spot.filter(function(a) {
          return-1 !== a.VALUE.toLowerCase().indexOf(d.toLowerCase());
        });
        d = null;
        for(c in b) {
          b[c].DESC && (d === b[c].DESC ? e.push("<dd>" + b[c].VALUE + "</dd>") : (a = b.filter(function(a) {
            return a.DESC === b[c].DESC;
          }), a = 26 * a.length + 2, e.push("<dt style='height:" + a + "px'>" + b[c].DESC.capitalize() + "</dt><dd>" + b[c].VALUE + "</dd>"), d = b[c].DESC));
        }
        if(e.length){
          //When found out unless 1 item
            this.el.html(e.join(" ")).fadeIn();
            this.buttons = this.el.find("dd");
            return !1;
        }else{
          //If don't find any item, call gettips method to show sugestions to user
           this.gettips(g);
           return !1;
        }
      }else {
        this.id = -1, 32 === a.keyCode && (this.list += d);
      }

  },
  close : function(a){
    if(a && (a.preventDefault(), a = $(a.target), this.el.find(a).length)) {
      return!1;
    }
    //a && a.hasClass("bsearch") && this.input.trigger("submit");
    this.input && this.input.focus();
    this.list = "";
    this.id = -1;
    this.doc.unbind("click");
    this.el.empty().fadeOut();
    return!1;
  },
  select: function(a){
    //console.dir(a);
    if("object" === typeof a) {
        a.preventDefault(), a = $(a.target);
    }else {
        return!1;
    }
    this.input.val(this.list + a.text()).focus().trigger("submit");
    this.close();
  },
  arrow : function(a){
    a = a || window.event;
    this.buttons.removeClass("sel");
    switch(a.keyCode) {
    case 38:
      this.id--;
      this.id < -this.buttons.length && (this.id = 0);
      a = this.buttons.eq(this.id);
      this.over(a);
      break;
    case 40:
      this.id++, this.id > this.buttons.length - 1 && (this.id = 0), a = this.buttons.eq(this.id), this.over(a);
    }
    return !1;
  },
  over : function(a){
    a.addClass("sel");
    this.input.val(this.list + a.text()).focus();
  },
  hint : function(a,b){
    var c, d, e = [];
    var context=this;
    this.el.empty();
    if(!a.length)
      return !1;
    this.doc.unbind("click").bind("click", function(a){context.close(a)});
    d = 26 * a.length + 10;
    e.push("<dt style='height:" + d + "px'>Você quis dizer:</dt>");
    for(c = 0;c < a.length;c++) {
        e.push("<dd>" + a[c].WORD.capitalize() + "</dd>");
    }
    this.el.html(e.join(" ")).fadeIn();
    this.buttons = this.el.find("dd");
  },
  gettips : function(a){
    var context=this;
    $.getJSON(nodePath + "index.js?service=SearchMaterial.svc/searchTermo/&query=" + a + "?callback=?",function(data){
      context.hint(data);
    },"json")
    .fail(function(error){
      context.modal.open("Tente novamente", "Um erro ocorreu! Atualize a página e tente novamente.");
    });
    /*$.getJSON("http://was-dev/focus24/Services/SearchMaterial.svc/searchTermo/" + a + "?callback=?",function(data){
      context.hint(data);
    },"json")
    .fail(function(error){
      context.modal.open("Tente novamente", "Um erro ocorreu! Atualize a página e tente novamente.");
    });*/
  },
  init : function(){
    var context=this;
    this.spot = [];
    this.list = "";
    this.id = 0;
    this.input = null;
    this.doc = $(document);
    $.getJSON("/library/ajax/spotlight.js",function(data){
      context.spot = data;
    },"json");
  }
});