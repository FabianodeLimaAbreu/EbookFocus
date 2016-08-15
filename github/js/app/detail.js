window.Video = Spine.Controller.sub({
  elements: {
    
  },
  events: {
    "click .vclose":"close",
  },
  close:function(a){
    a.preventDefault();
    $('body,html').css('overflow','auto');
    $('#videos').fadeOut('fast');
    
    player.pause();
    player.setCurrentTime(0);
  },
  open:function(a){
    $('#videos').fadeIn('fast');
    $('body').add('html').css('overflow','hidden');
    
    
    var url= $('.trainning').attr('name');
    
    // Mobile
    if(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/webOS/i)) {
      // window.location = url; //"./mobile.html
      window.open(url, '_blank');
    }else{
      $('.tb-player').html('<video width="640" height="360" src="'+url+'" type="video/mp4" class="player" autoplay="true""></video>');
      // $('.tb-player').html('<video width="640" height="360" src="http://www.focustextil.com.br/videos/colecoes/verao16/estampados.mp4" type="video/mp4" class="player" autoplay="true""></video>');

      player = new MediaElementPlayer(".player", {
        features: ['playpause','progress','duration','fullscreen'],
        alwaysShowControls: true
      });
      $(document).keypress(function(e) { 
        if (e.keyCode == 27) {
          $('#videos').fadeOut('fast');
        }
      });  
    }
  },
  init: function () {
    
  }
});

window.Detail = Spine.Controller.sub({
  elements: {
    ".detail":"el"
  },
  events: {
  },
  // link para Focus 24h - Reservar
  focus: function (a) {
    "object" === typeof a && a.preventDefault();
    var hash, url_focus;
    hash = window.location.hash.split("/")[1],
    url_focus = "/focus24h/#detail/" + hash,
    window.open(url_focus, "_blank");
    return !1;
  },
  close: function (a) {
    "object" === typeof a && a.preventDefault();
    this.on = !1;
    this.el.fadeOut("slow");
    $("html").attr('id', '');
    this.infobox.css({
      right: -480
    }); //Return the bar to its initial position

    this.infoback.removeClass('blackweek'); //BLACKWEEK

    if(this.getAmosVal() !== ""){
      this.navigate && this.navigate("search/"+this.getMode()+"/"+this.getAmosVal(), !0);
    }
    else{
      this.navigate && this.navigate("search/artigos/"+this.item.MATNR, !0);
    }
    //this.navigate && this.navigate("result", !0);
    //$(window).scrollTop(this.scrollp);
    return !1;
  },
  addElements:function(){
    this.el=$(".detail");
    this.util=$(".util");
    this.toplist=$(".info-text dd");
    this.infobox=$(".info-box");
    this.infoback=$(".info-back");
    this.infoside=$(".info-side");
    this.infolist=$(".info-list-itens");

    this.rapportbt=$(".brapport");
    this.recipiebt=$(".lavado");
    this.recordbt=$(".ficha");
    this.colorbt=$(".bcolor");
    this.colorlist=$(".color-list");
    this.bf=$(".view24h");
    this.trainningbt=$(".trainning");

  },
  addEvents:function(){
    var context=this;
    $(".top-size .goback").bind("click",context.proxy(context.close));
    $(".close-bar").bind("click",context.proxy(context.openbar));
    $(".bcolor").bind("click",context.proxy(context.color));
    $(".brapport").bind("click",context.proxy(context.rapport));
    $(".disable").bind("click",context.proxy(context.preventAction));
    $(".view24h").bind("click",context.proxy(context.focus));
    $(".trainning").bind("click",context.proxy(context.callmedia));
  },
  // link para Focus 24h - Reservar
  focus: function (a) {
    "object" === typeof a && a.preventDefault();
    var hash, url_focus;
    hash = window.location.hash.split("/")[1],
    url_focus = "/focus24h/#detail/" + hash,
    window.open(url_focus, "_blank");
    return !1;
  },
  open: function (a) {
    this.item = $.isArray(a) ? a[0] : a;
    this.navigate && this.navigate("detail", this.item.MATNR, !1);
    this.content.container=$(".info-text-holder");
    this.content.lines="";
    this.content.renderContent(this.content.temps["detail-top"],this.item);
    this.content.container.append(this.content.lines);
    this.content.container=$(".info-text2");
    this.content.lines="";
    this.content.renderContent(this.content.temps["detail-down"],this.item);
    this.content.container.append(this.content.lines);
    this.addElements();
    this.addEvents();
    this.el.find(".base").text(this.cmplist());  
    this.cpmAdonoList() ? this.el.find(".adorno").text(this.cpmAdonoList()) : (this.el.find(".adorno-title").hide(),this.el.find(".adorno").hide());
    this.cpmConjList() ? this.el.find(".conj").text(this.cpmConjList()) : (this.el.find(".conj-title").hide(),this.el.find(".conj").hide());
    this.utillist();
    this.getsimilaridade(this.item.MATNR);
    this.size();
    this.rapportlist(this.item.MATNR);
    this.recepieslist(this.item.MATNR);
    this.trainninglist(this.item.MATNR);
    this.recordlist(this.item.MATNR);
    this.getcolorlist(this.item.MATNR);
    this.getBlackWeek(this.item.MATNR); //blackweek
    this.el.find('.rend').hide();
    this.el.find(".storage").hide();
    window.scroll(0, 0);
    this.rendStatus();

    var b, d = "http://189.126.197.169/img/large/large_" + this.item.MATNR.slice(0,15) + ".jpg";

    // Reservar 24hr
    (this.item.PE >= this.item.MEDIA_PECA && (this.type == "CLIENTE" || this.type == "GESTOR") && this.item.PE > 0) ? this.bf.show() : this.bf.hide();
    /*for (var c = 0; c < this.toplist.length; c++) {
      console.log("ok")
      b = a[c] && " " !== a[c] ? a[c] : "N\u00e3o tem", this.toplist.eq(c).text(b);
    }*/

    switch (this.type)
    {
    case "GESTOR" :
      this.el.find(".storage").show();
      break;
    case "CLIENTE" :
      this.el.find(".storage").hide();
      break;
    default :
      this.el.find(".storage").show();
      break;
    }
    this.infoback.find(".image_detail").fadeOut(function () {
      //fadeOut the infoback and fadein it with another img init
      var p, q, context = $(this);
      p = new Image, q = d, $(p).load(function () {
        context.html("<img src='" + d + "'/>").fadeIn("slow");
      }).error(function () {
        //If don't find the image
        context.html("<img src='http://189.126.197.169/img/large/large_NONE.jpg' />").fadeIn("slow");
      }).attr("src", q);
    }); - 1 !== this.item.SGRUPO.indexOf("Estampado") && (this.colorbt.addClass("disable"), this.el.find('.info-color').hide());
    this.on || this.colorbt.removeClass("sel");
    this.el.fadeIn("fast");
  },
  getcolorlist: function (a) {
    var c = [],
      d = this;
    this.colorbt.addClass("disable");
    a = a.slice(0, 9);
    $.getJSON(nodePath + "index.js?service=CorMaterial.svc/get/&query=" + a + "/E?callback=?", function (a) {
    //$.getJSON("http://was-dev/focus24/Services/CorMaterial.svc/get/" + a + "/E?callback=?", function (a) { 
      a = a.sortBy("Grupo");
      if (a.length) {
        for (var b = 0; b < a.length; b++) {
          (-1 === a[b].Desc.indexOf("0")) && c.push("<a href='#detail/" + d.item.MATNR.slice(0, 9)+a[b].Grupo + a[b].Cod + "' class='color'><img src='/library/colors/" + a[b].Cod + ".jpg' width='80' height='80'/><span>" + a[b].Desc.capitalize() + "</span></a>");
        }
        c.length && d.colorbt.removeClass("disable");
        d.colorlist.html("<li>" + c.join("</li><li>") + "</li>").delay(500).fadeIn();
        d.el.find('.info-color').show();
      }
    });
  },
  rendStatus:function(){
    var e;
    e = this.item.RENDIMENTO.replace(/\s+/g, '') || 0;

    (e > 0) && this.el.find('.rend').show(),this.el.find('.rend-item').text(e+" m/Kg ");
  },
  utillist: function () {
    var context=this;

    if(" " === this.item.UTILIZACAO) {
      context.util.text(".");
      return!1;
    }
    $.getJSON(nodePath + "index.js?service=SearchMaterial.svc/util&query="+ this.item.UTILIZACAO+"?callback=?", this.proxy(function(a) {
      context.util.text(a.capitalize() + ".");

    }));
    /*$.getJSON("http://was-dev/focus24/Services/SearchMaterial.svc/util/"+ this.item.UTILIZACAO+"?callback=?", this.proxy(function(a) {
      context.util.text(a.capitalize() + ".");
    }));*/

  },
  getsimilaridade:function(a){
    var obj,i,length,c=[],context=this;
    /*if(" " === this.item.UTILIZACAO) {
      return!1;
    }*/
    //M11ML0049

    $.getJSON( nodePath + "briefing.js?service=SearchMaterial.svc/GetSimilaridade/"+a.slice(0, 9)+"?callback=?", this.proxy(function(a) {

    // $.getJSON("http://was-dev/Focus24/Services/SearchMaterial.svc/GetSimilaridade/"+a+"?callback=?", this.proxy(function(a) {
      obj=JSON.parse(a);
      length=obj.length;
      // console.dir(a);
      if(length){
        for(i=0;i<length;i++){
          c.push( "<b>Nome:</b> "+obj[i].MAKTX+" | <b>Código:</b> "+obj[i].MATNR+" | <b>Tipo:</b> "+obj[i].TIPO);
        }
        $(".similar").html("<br/>"+c.join("<br/>"));
      }
      else{
        $(".similar").text("Não tem.");
      }
    }));
  },
  /******* BLACK WEEK CODE ****/
  getBlackWeek:function(code){
      var i;
      $.getJSON("/library/ajax/blackweek.js", this.proxy(function (a) {
        for(i=0;i<a.length;i++){
              if(a[i].MATSKU === code){
                  this.infoback.addClass('blackweek');
              }
          }
      }));
  },
  /******* END BLACK WEEK CODE ****/
  rapportlist: function (c) {
    this.rapportbt.removeClass('sel').addClass("disable");
    this.el.find('.info-rapport').hide();

    $.getJSON("/library/ajax/rapport.js", this.proxy(function (a) {
      var b = a.filter(function (b) {
        return -1 !== b.MATNR.indexOf(c);
      });
      b.length && (this.rapportbt.removeClass("disable"), this.el.find('.info-rapport img').attr('src', 'http://189.126.197.169/img/rapport/raprt_' + b[0].MATNR + ".jpg"));
    }));
  },
  recepieslist: function (c) {
    this.recipiebt.removeClass('sel').addClass("disable");

    $.getJSON("/library/ajax/lavagem.js", this.proxy(function (a) {
      var b = a.filter(function (b) {
        return -1 !== c.indexOf(b.MATNR);
      });
      b.length && (this.recipiebt.attr("href", "/library/jeans/recepies/" + b[0].MATNR + ".pdf"), this.recipiebt.removeClass("disable"));
    }));
  },
  trainninglist: function (c) {
    //M11RN0437900084
    this.trainningbt.removeClass('sel').addClass("disable");
    //console.log("http://189.126.197.169/node/server/briefing.js?service=SearchMaterial.svc/getvideopaths/"+c.slice(0, -6)+"?callback=?");
    $.getJSON("http://189.126.197.169/node/server/briefing.js?service=SearchMaterial.svc/getvideopaths/"+c.slice(0, 9)+"?callback=?", this.proxy(function (a) {
      var b=a;
      b.length && (this.trainningbt.removeClass("disable"),this.trainningbt.attr("name",""+b[0]));
    }));
  },
  callmedia:function(a){
    if(this.trainningbt.hasClass('disable')){ 
      return false;
    }else{
      this.video.open(); 
    }
  },
  recordlist: function (c) {
    this.recordbt.removeClass('sel').addClass("disable");

    $.getJSON("/library/ajax/fichas.js", this.proxy(function (a) {
      var b = a.filter(function (b) {
        return -1 !== c.indexOf(b.MATNR);
      });
      b.length && (this.recordbt.attr("href", "/library/jeans/fichas/" + b[0].MATNR + ".pdf"), this.recordbt.removeClass("disable"));
    }));

  },
  cmplist: function () {
    for (var a = [], b = 1; 7 > b; b++) {
      this.item["CMP" + b] && a.push(this.item["PERCENT" + b] + "% " + this.item["CMP" + b].capitalize());
    }
    return a.join(", ");
  },
  cpmAdonoList: function () {
    for (var a = [], b = 1; 7 > b; b++) {
      this.item["COMP"+b+"_BRA_FT1" ] && a.push(this.item["PERCENT"+b+"_BRA_FT1"] + "% " + this.item["COMP"+b+"_BRA_FT1"].capitalize());
    }
    return a.join(", ");
  },
  cpmConjList: function () {
    for (var a = [], b = 1; 7 > b; b++) {
      this.item["COMP"+b+"_CJ_FT1" ] && a.push(this.item["PERCENT"+b+"_CJ_FT1"] + "% " + this.item["COMP"+b+"_CJ_FT1"].capitalize());
    }
    return a.join(", ");
  },
  openbar: function (a) {
    //Action of openbar's div
    if ("object" === typeof a) {
      a.preventDefault(), $(a.target);
    } else {
      return !1;
    }
    a = parseInt(this.infobox.css("right")); //Take the right position of infobox

    if (this.el.hasClass("large")) {
      //In large resolutions the bar don't close all
      this.infobox.animate({
        right: -510 === a ? -510 : -510
      }, 400);
    } else {
      //In small resolutions
      this.infobox.animate({
        right: -510 === a ? -884 : -510
      }, 400);
    }

    this.colorbt.removeClass("sel");
    this.rapportbt.removeClass("sel");
  },
  color: function (a) {
    if ("object" === typeof a) {
      a.preventDefault(), a = $(a.target);
    } else {
      return !1;
    }
    if (a.hasClass("disable")) {
      return !1;
    }
    var b, d = this,
      c = [],
      e;
    this.on = !0;
    b = this.item.MATNR.slice(0, 9);
    d.el.find('.info-rapport').hide();
    d.el.find('.info-color').show();
    d.colorlist.show();

    
    d.infolist.find('.sel').removeClass('sel');

    if (this.el.hasClass("large")) {
      b = parseInt(this.infobox.css("right"));
      b !== 0 && a.addClass("sel");
      this.infobox.animate({
        right: -510 === b ? 0 : -510
      }, 400);
    } else {
      b = parseInt(this.infoside.css("right"));
      b !== 0 && a.addClass("sel");
      this.infoside.animate({
        right: -385 === b ? 0 : -385
      }, 400);
    }
  },
  rapport: function (a) {
    if ("object" === typeof a) {
      a.preventDefault(), a = $(a.target);
    } else {
      return !1;
    }
    if (a.hasClass("disable")) {
      return !1;
    }
    var b, d = this,
      c = [];
    this.on = !0;
    this.el.find('.info-color').hide();
    this.el.find('.info-rapport').show();
    this.colorbt.removeClass("sel");

    this.infobox.find('.info-side').addClass('rapport');
    d.infolist.find('.sel').removeClass('sel');

    if (this.el.hasClass("large")) {
      b = parseInt(this.infobox.css("right"));
      b !== 0 && a.addClass("sel");
      d.infobox.animate({
        right: -510 === b ? 0 : -510
      }, 400);
    } else {
      b = parseInt(this.infoside.css("right"));
      b !== 0 && a.addClass("sel");
      this.infoside.animate({
        right: -385 === b ? 0 : -385
      }, 400);
    }
  },
  status: function (a) {
    return !1;
  },
  preventAction: function (a) {
    if($(a.target).hasClass('disable')){
      a.preventDefault();
      return !1;
    }
  },
  reload: function (a) {
    $(".infoback").removeClass('blackweek'); //BLACKWEEK
    if ("object" === typeof a) {
      a.preventDefault(), a = $(a.target), a = a.parent().attr("href").split("#")[1], a = this.item.MATNR.slice(0, 9) + a;
    } else {
      if (!a) {
        return !1;
      }
    }
    $.getJSON(nodePath + "index.js?service=SearchMaterial.svc/ebook&query=" + a + "?callback=?", this.proxy(this.open));
    //$.getJSON("http://was-dev/focus24/Services/SearchMaterial.svc/ebook/"+a+"?callback=?", this.proxy(this.open));
  },
  size: function () {
    if (this.stage().w >= 1195) {
      this.el.addClass("large"); //To larg resolutions
    }

    //Verify if is ipad and add the class
    var isiPad = navigator.userAgent.match(/iPad/i) != null;
    if (isiPad) {
      this.el.addClass("ipad");
    }
    //this.infoside.find(".viewport").height("13.2cm");
  },
  init: function () {
    this.item = null;
    this.on = !1;
    this.dcolor;
    this.dcolor;
    this.size();
    this.el.disableSelection && this.el.disableSelection();
  }
});


window.Menu = Spine.Controller.sub({
  elements: {
    "li a": "buttons"
  },
  events: {
    "click a": "action"
  },
  action: function (a) {
    if ("object" === typeof a) {
      a.preventDefault();
    } else {
      return !1;
    }
    var b = $(a.target).attr("href") || $(a.target).parent().attr("href");
    b = b.split("#")[1];
    switch (b) {
    case "tutorial":
      this.opentutorial();
      break;
    case "logout":
      this.logout();
      break;
    default:
      alert(b);
    }
    this.close();
  },
  close: function (a) {
    if (a && (a.preventDefault(), a = $(a.target), this.el.find(a).length)) {
      return !1;
    }
    this.el.offset({
      top: 0,
      left: 0
    });
    this.doc.unbind("click");
    this.el.hide();
    return !1;
  },
  open: function (a) {
    this.el.offset({
      top: a.pageY,
      left: a.pageX
    }).show();
    this.doc.unbind("click").bind("click", this.proxy(this.close));
  },
  init: function () {
    this.doc = $(document);
    this.el.disableSelection && this.el.disableSelection();
  }
});