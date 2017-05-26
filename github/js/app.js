 /**
*@fileOverview Main application class, responsible for all main funcionalities and call anothers classes constructors
* @module App
*
*/

require.config({
  shim: {
    spine: {
      deps: ["jquery"],
      exports: "Spine"
    }
  },
  baseUrl: "js/lib",
  paths: {
    app: "../app",
    models: "../models",
    sp: "spine"
  }
});
require(["methods","sp/min", "app/filter","app/content", "app/detail"], function() {
  /**
  * Main application class, responsible for all main funcionalities and call anothers classes constructors
  * @exports App
  * @constructor
  */
  window.App = Spine.Controller.sub({
    el:$("body"),
    elements: {
      ".user-box .user-name":"username",
      ".controllers-container .amos_search":"searchEl",
      ".page-container":"page_container",
      "#spotlight":"spotEl",
      "#modal":"modalEl",
      ".select-view":"viewEl",
      ".bread-box":"breadEl",
      ".borderby":"order_box",
      ".filter-container":"filterEl",
      "#alt-menu":"menuEl",
      "header":"header",
      ".backtotop":"backtotop",
      "#videos":"videoEl",
      ".menu-modal": "group_modal",
      ".group-menu":"group_menu",
      ".subtitle": "group_selected",
      ".menu-container": "menu_container"
      /*".container":"container",
      ".nav-menu a":"menuopt",
      "header":"header",
      ".content":"contentEl",
      "#wrap .mask":"maskEl",
      "#wrap .loader":"loader",
       ".modal_mask" : "modalEl",
      ".login-name":"username",
      ".login-id":"usersegm"*/
    },

    events: {    
      "click .user-box .user-logout": "logout",
      "submit .amos_search": "submit",
      "click .controllers-container .goback":"goBack",
      "keyup .result-form": "getSpot",
      "click #wrap .user-help": "opentutorial",
      "click .select-view button": "changeview",
      "click .borderby .b_order":"sortItems",
      "click .callfilter":"callFilter",
      "click .view_24 a":"resertItem",
      "click .backtotop":"goTop",
      "click .groups":"callExpPromoRequestMenu"
      /*"click .justit.bnote":"preventAction",
      "click .justit.bemail":"preventAction",
      "click .fornecedor_cadastro .nav-menu a":"preventAction",
      "hover .tooltip-selectable":"positionNote"*/
    },
    init:function(){
      this.usr=null;
      this.view = "images";
      this.mode = "artigos";
      this.page="home";
      this.nsort="";
      this.group="";
      this.breadarr = [];
      this.itens = $([]);
      this.data=[];
      this.fdata = [];
      this.blackweek=[]; //BLACKWEEK
      this.loading=!1;
      this.callback=null;
      this.ajaxrequest=!1;
      this.takedot = !1;
      this.tutpage = 1;
      this.itens_bypage = 10;

      //Var to storage the basic data
      this.amosval="";

      this.breadarr = [];
      this.usr = $.cookie("usr") || $.cookie("portal");
      if(this.usr){
        this.usr=jQuery.parseJSON(this.usr);
      }
      else
        window.location.href = 'login.html'+ window.location.hash;

      this.cookiescroll=[];

      //this.header.addClass("goDown");
      this.username.text(this.usr.Nome);
      if(this.usr.TIPO !== "FUNCIONARIO" && this.usr.TIPO !== "GESTOR"){
        $("html").addClass('nocopy');
      }

      /***** BLACK WEEK CODE ***/
      $.getJSON("/library/ajax/blackweek.js", this.proxy(function(a) {
          this.blackweek = a;
      }));
      /***** END BLACK WEEK CODE ***/
      
      this.el.find("#wrap").removeClass("hide");

      this.modal = new Modal({el:this.modalEl});
      this.content = new Content({
        el:this.contentEl,
        autoscroll:this.proxy(this.autoscroll),
        /*bread:this.breadEl, */
        type:this.usr.TIPO
      });
      this.promotion = new Promotion({
        el:this.group_modal,
        breadEl:this.breadEl,
        getloading:this.proxy(this.getloading),
        setdata:this.proxy(this.setdata),
        setloading:this.proxy(this.setloading),
        setBreadarr:this.proxy(this.setBreadarr),
        getBreadarr:this.proxy(this.getBreadarr),
        breadarr:this.breadarr,
        group_menu:this.group_menu,
        group_modal:this.group_modal,
        menu_container:this.menu_container,
        group_selected:this.group_selected,
        searchEl:this.searchEl,
        reset:this.proxy(this.reset),
        getAmosVal:this.proxy(this.getAmosVal),
      });
      this.filter = new Filter({
        el: this.filterEl,
        getloading: this.proxy(this.getloading),
        setdata: this.proxy(this.setdata),
        page_container:this.page_container,
        setloading:this.proxy(this.setloading),
        order_box:this.order_box,
        resetOptFilter:this.proxy(this.resetOptFilter)
      });

      this.video = new Video({el:this.videoEl});

      this.detail = new Detail({
        getloading:this.proxy(this.getloading),
        body:this.el,
        type:this.usr.TIPO,
        stage: this.proxy(this.stage),
        content:this.content,
        setBreadarr:this.proxy(this.setBreadarr),
        getAmosVal:this.proxy(this.getAmosVal),
        getMode:this.proxy(this.getMode),
        getCodPromo:this.proxy(this.getCodPromo),
        video:this.video
      });

      this.spotlight = new Spotlight({
        el:this.spotEl
      });

      this.menu = new Menu({
        el: this.menuEl,
        opentutorial: this.proxy(this.opentutorial),
        logout: this.proxy(this.logout)
      });
      this.header.addClass('goDown');

      this.routes({
        "":function() {
          //console.log("vazio");
        },
        artigos:function(){
          "artigos" !== this.mode && this.content.reset();
          this.mode = "artigos";
          this.reset();
          //console.log("artigos vazio");
        },
        express:function(){
          //console.log("express vazio");
        },
        "search/*type/*promo/*code":function(a){
          this.mode=a.type;
          this.page="search";
          this.promotion.codpromo = a.promo;
          //this.writePage("amostras",a.code);
          ga('send', 'pageview',  'app.html#search/'+a.type+"/"+a.promo+"/"+a.code);
          this.group_modal.hide();
          if(this.promotion.codpromo === "exception"){
            this.group_selected.text(" - ");
            
            $.getJSON(nodePath + "index.js?service=SearchMaterial.svc/searchOutlet/&query="+a.code.removeAccents().initialCaps().replace(" de "," ")+"/" + "0" + "/" + "0" +"?callback=?", this.proxy(this.setdata)).fail(function () {
              //console.log("error");
              return !1;
            });
          }
          else{
            $.getJSON(nodePath + "index.js?service=" + "SearchMaterial.svc/ebookPromo/" + a.promo + "&query=" + a.code.removeAccents().initialCaps().replace(" de "," ") + "?callback=?", this.proxy(this.setdata)).fail(function () {
              //console.log("error");
              return !1;
            });
          }
          
          /*$.getJSON("http://was-dev/focus24/Services/SearchMaterial.svc/ebookPromo/" + a.promo + "/" + a.code.removeAccents().initialCaps().replace(" de "," ") + "?callback=?", this.proxy(this.setdata)).fail(function () {
            //console.log("error");
            return !1;
          });*/
        },
        "search/*type/*code":function(a){
          this.mode=a.type;
          this.page="search";
          ga('send', 'pageview',  'app.html#search/'+a.type+"/"+a.code);
          this.writePage("amostras",a.code);
          switch(a.type){
            case "artigos":
              //console.log("artigos");
              this.mode = "artigos";
              this.tutpage = 1;
              this.promotion.codpromo = 0;
              break;
            case "express":
              this.mode = "express";
              //console.log("express");
              this.tutpage = 1;
              this.amosval=a.code;
              this.promotion.codpromo = a.code;
              if(this.promotion.codpromo === "exception"){
                this.promotion.expPromoRequestMenu();
              }
              else{
                this.promotion.requestPromo(a.code);
              }

              //this.promotion.expPromoRequestMenu();
              
              break;
            case "redirect":
              //console.log("redirect");
              this.mode = "artigos";
              this.searchEl.find(".form-control").val(a.code);
              this.promotion.codpromo = 0;
              break;
            default:
              //console.log("default");
          }
        },
        "detail/*code" : function(a) {
          this.page="detail";
          this.backtotop.fadeOut();
          this.group_modal.hide();
          this.writePage("detail");
          this.tutpage = 2;
          ga('send', 'pageview',  'app.html#detail/'+a.code);
          this.detail.reload(a.code);
        }
      });
      this.loading = !1;
      $(document).on("contextmenu", this.proxy(function (a) {
        a.preventDefault();
        this.menu.open(a);
      }));
    },

    callExpPromoRequestMenu:function(evt){
      this.promotion.expPromoRequestMenu(evt);
    },
    /**
    * `Logout of app - Calling Logout Method from methods.js`
    * @memberOf App#
    * @param {event} a. The click event.
    */
    getOut : function(a){
      a.preventDefault();
      Logout();
    },

    /**
    * `Return 1 hash from history`
    * @memberOf App#
    * @param {event} a. The click event.
    */
    goBack : function(){
      window.location.href="./";
    },
    goTop:function(){
      $(".page-container").animate({
        scrollTop:0
      },500
      );
    },

    /*
    * `Prevent Action from click when user click on note's and email's button in sample's page.`
    * `Prevent when user is on fornecedor_cadastro's page and click on a menu's item too, confirming if the user desire to change the page, if true, call this.redirect`
    * @memberOf App#
    * @param {event} a. The click event.
    */
    preventAction:function(a){
      /*a.preventDefault();
      if(this.page === "fornecedor_cadastro"){
        this.redirect_val=$(a.target).attr('href').replace("#","");
        this.modal.open("message","Sair sem salvar as alterações nesta aba?<br> Para salvar, basta trocar de aba", this.proxy(this.redirect),!0, !0);
      }*/
    },


    /**
    * `This method change the container's value of the index.html according to the hash's change and hash's value.`
    * @memberOf App#
    * @param {String} hash. hash's value.
    * @param {number} val. The code of an article to be search.
    */
    writePage:function(hash,val){
      var context=this;  
      /*if(this.page !== "detail" && this.page !== "fornecedor_cadastro"){
        context.reset();
      }*/
      this.page_container.load("pages/"+hash+".html",function( response, status, xhr){
        switch(hash){
          case "amostras":
            $("html").attr('id', '');
            context.el.removeClass("exception_promo");
            if(context.promotion.codpromo === "exception"){
                context.el.addClass("exception_promo");
            }
            if(context.mode === "artigos"){
              context.searchEl.find(".form-control").val(val);
              context.searchEl.trigger('submit');
            }
            
            break;
          case "detail":
            $("html").attr('id', 'detail-page');
            break;   
          default:
            alert("dssda");
        }
      });
    },

    setBreadcrumb : function(a, val){
      var loja, area, grupo, artigo, bread_text;
        
      // Error
      if(!a[0]){
        return this.modal.open(),this.breadEl.find('.bread-colec a').text("").removeClass('active'),this.setloading(!1), this.searchEl.find('input').blur();
      }

      loja        = a[0].DESC_STORE;
      grupo       = a[0].GRUPO;
      area        = a[0].TYPE_MAT;
      artigo      = this.artigo;
      bread_text  = loja+' - '+area+' - '+val;



      // FILHO
      if(!loja){
        this.area=a[0].TYPE_MAT;
        this.breadEl.find('.bread-colec a').text(area+' - '+grupo+' - '+artigo).addClass('active');
        return false;
      }
      // PAI      
      (this.area=="X") ? (bread_text=loja+' - '+val) : bread_text=(loja+' - '+area+' - '+val);
      this.breadEl.find('.bread-colec a').text(bread_text).addClass('active')   
    },
    changeview : function(a) {
      if ("object" === typeof a) {
          a.preventDefault(), a = $(a.target);
      } else {
          return !1;
      }
      if (this.loading){
        return !1;
      }

      var class_promo="";
      if(this.promotion.codpromo === "exception"){
          class_promo="exception_promo";
      }
      /*this.cookiescroll=[];
      $.removeCookie('posscroll', { path: '/' });*/

      a.hasClass("sel") || (this.viewEl.find("button").removeClass("sel").addClass("unsel"), a.addClass("sel").removeClass("unsel"), this.view = a.attr("name"),$("body").attr("class","").addClass(this.view+" "+class_promo),this.setdata(this.fdata),      $(".page-container").scrollTop(0));
    },
    logout: function (a) {
      a && a.preventDefault();
      $.removeCookie("portal", {
        path: "/"
      });
      window.location = "login.html" + window.location.hash;
    },

    submit:function(a){
      /*var takedot=$.cookie("takedoft");
      console.log("chegou: "+takedot);*/
      a.preventDefault();
      a = arrayObject($(a.target).serializeArray());
      a = a.search;
      this.searchEl.find(".form-control").val(a).focus();
      this.filter.reset();
      this.reset();

      var c, context=this,d="Nome Nome".split(" ");
      if(this.promotion.codpromo !== "exception"){
        d = "Branco Poliester Cotton Focus Algodao Azuis Alf Malhas Malha Acetinados Acetinado Elastano Poliamida Print Printed Verdes White Vermelho".split(" "); //Rendas Renda 
      }
      if (this.loading || !a) {
        return !1;
      }

      this.breadarr = [];
      this.breadEl.find(".bread-search span").text("");

      //The case below is for some compost products like Veludo 4.5 that I have to know that the search has a point, then request all Veludo products and filter all itens that matches with the search with point or not
      if (-1 !== a.removeAccents().capitalize().indexOf(",") || -1 !== a.removeAccents().capitalize().indexOf(".")) {
        //If has ',' in the search
        if (-1 !== a.removeAccents().capitalize().indexOf("Veludo")) {
          //if the word is veludo
          var str = a.removeAccents().capitalize();
          a = str.substr(0, str.indexOf(' ')); //Take the first word before space so that it can do a search and filter by attr after
          this.breadarr.push(str); //Escreve o breadcrumb com a palavra da busca inteira
          this.takedot = str.substr((a.length) + 1, str.indexOf(' ')); //Passa para um atributo da classe, a palavra apos o espaço
        }
      } else {
        //Caso não tenha , na busca
        var str = a.removeAccents().capitalize();
        if(this.promotion.codpromo === "exception"){
          this.breadarr.push("ConnectOutlet - "+a);
        }
        else{
          this.breadarr.push(a);
        }
        this.takedot = !1;
      } 

      c = a.removeAccents().capitalize().replace(/\s/g, "");
      if (-1 !== d.indexOf(c)) {
        return this.modal.open("Tente novamente", "Adicione mais par\u00e2metros a sua pesquisa.");
      }
      d = this.codpromo ? ("SearchMaterial.svc/ebookPromo/" + this.codpromo) : "SearchMaterial.svc/ebook/";       
      //this.breadEl.find(".bread-search").show();
      this.amosval=str.removeAccents().replace(" de "," ");
      if(this.promotion.codpromo === 0){
        this.navigate(this.page+"/"+this.mode+"/"+str.removeAccents().replace(" de "," "),!1);

        $.getJSON(nodePath + "index.js?service=" + d + "&query=" + a.removeAccents().initialCaps().replace(" de "," ") + "?callback=?", this.proxy(this.setdata)).fail(function () {
          context.modal.open("Um erro ocorreu!", "Por favor, entre em contato com o administrador do sistema.",!0);
          return !1;
        });
        /*$.getJSON("http://was-dev/focus24/Services/"+ d + a.removeAccents().initialCaps().replace(" de "," ")+ "?callback=?", this.proxy(this.setdata)).fail(function () {
          context.modal.open("Um erro ocorreu!", "Por favor, entre em contato com o administrador do sistema.",!0);
          return !1;
        });*/
        return this.setloading(!0,!1);
      }
      else{
        this.navigate(this.page+"/"+this.mode+"/"+this.promotion.codpromo+"/"+str.removeAccents().replace(" de "," "),!0);
      }
    },
    setdata:function(a,c,cancelfilter){  
      //Repassar neste metodo
      if(a.length && -1 !== a[0].MAKTX.indexOf("Timeout")){
          return this.modal.open("Tente novamente","O número de itens pesquisado excede a capacidade de processamento.<br>Sugerimos incluir mais parâmetros na sua pesquisa.",!0),this.setloading(!1,!0),this.content.reset(),!1;
      }
      c ? this.data= this.filterDot(a) : this.fdata=a
      this.breadarr = this.breadarr.slice(0, 1);
      if(this.promotion.codpromo === 0){
        this.breadEl.find(".bread-search span").text("");
        this.breadEl.find(".bread-page").text(0);
        this.breadEl.find(".bread-total").text(0);
      }
      
      this.content.reset();
      this.page_container.scrollTop(0);
      if(this.fdata.length){
        this.content.changeview(this.view);
        c && this.filter.checklist(this.fdata);
        this.Componentfilter(this.fdata,this.content.page);
      }
      else{
        if(a.length){
          this.content.changeview(this.view);
          c && this.filter.checklist(this.data);
          this.Componentfilter(this.data,this.content.page);
        }
        else{
          if(cancelfilter){
            this.content.changeview(this.view);
            c && this.filter.checklist(this.data);
            this.Componentfilter(this.data,this.content.page);
          }
          else{
            return this.modal.open("Tente novamente","Item digitado errado ou esgotado no momento. <br> Tente refazer a busca usando termos diferentes, caso não encontre, entre em contato com seu representante.",!0),this.setloading(!1,!0),this.content.reset(),!1;
          }
        }
      }
      //this.reopenFilter(this.data, this.content.page, !0);
      this.scroll($(".page-container"));      
    },
    filterDot:function(a){
      if (this.takedot) {
        if (-1 !== this.takedot.indexOf(".")) {
          this.takedot = this.takedot.replace(".", ",");
        }
        this.takedot = this.takedot.replace("Ca", "");
        //Caso tenha ponto na busca, ao invez de filtrar pelo MAKTX, filtra pelo ATRIBUTO

        return this.filterBySearch(filterBy(a, 'ATRIBUTOS', this.takedot).sortBy("MAKTX").unique());
      } else {
        return this.filterBySearch(a.sortBy("MAKTX").unique());
      }
    },
    filterBySearch:function(data){
      var ocorrence=[],num=[];
      /*The lines below work like a new feature implemented in April,2 2015. Before this feature
      all search's result was written in alfabetic ordem without any param, now All search's result
      is written in alfabetic ordem, but before this, the preference is for items that it's description match with
      the value of search's input.*/

      for(var i=0;i<data.length;i++){
          if(data[i].MAKTX.indexOf(this.breadarr.slice(0, 1).toString().toUpperCase().replace("  "," ")) === 0){
              //Passing all positions of result compare search's value with object name
              ocorrence.push(data[i]);
              //console.log(i+" * "+data[i].MATNR+" , "+data[i].MAKTX);
              num.push(data[i].MATNR); //Save the position of this ocorrence to splice array after all
          }
      }  
      var i=0;
      while(i< num.length){
          //Pass into array of positions to data
          for(j=0;j<data.length;j++){
              if(data[j].MATNR === num[i]){
                  //Passing in data json also, and comparing with the position number saver previously
                  //If it match, remove this item from data array
                  data.splice(j,1);
              }
          }
          i++;
      }
      ocorrence= ocorrence.sortBy("MAKTX").unique();
      return ocorrence.concat(data);
    },
    createbox : function(items, page) {  
      var auxList,length;
      if(!items){
        this.setloading(!1,!0);
        return !1;
      }
      auxList=items.slice(this.content.page*this.itens_bypage, (this.content.page+1)*this.itens_bypage);
      length=auxList.length;
      this.content.lines="";
      //console.time("load");
      for(var i=0;i<=length;i++){
        if(i === length){
          this.content.container.append(this.content.lines);
          $(".amos-container").fadeIn("slow");
          this.getBlackWeek();
          this.autoscroll();
        }
        else{
          var temp_name=this.view;
          var pe=Math.floor(auxList[i].PE);
          switch (this.usr.TIPO)
          {
          case "GESTOR" :
            temp_name+="_estoque";
            if(pe >= auxList[i].MEDIA_PECA && pe>0){
              temp_name+="_view24h";
            }
            break;
          case "CLIENTE" :
            if(pe >= auxList[i].MEDIA_PECA && pe>0){
              temp_name+="_view24h";
            }
            break;
          default :
            temp_name+="_estoque";
            break;
          }
          this.content.renderContent(this.content.temps[temp_name],auxList[i]);
        }
      }
      //console.timeEnd("load");

      this.breadEl.find(".bread-search span").text(this.breadarr.join(" > ").capitalize());
      if(((this.content.page+1)*this.itens_bypage) > this.fdata.length){
        this.breadEl.find(".bread-page").text(this.fdata.length);
      }
      else{
        this.breadEl.find(".bread-page").text((this.content.page+1)*this.itens_bypage);
      }
      this.breadEl.find(".bread-total").text(this.fdata.length);
      this.setloading(!1,!0);
    }, 
    getBlackWeek:function(){
      var ctx=this;
      if(this.view === "images"){
        $(".thumbnail").each(function(a,b){
          var i;
          for(i=0;i<ctx.blackweek.length;i++){
            if(ctx.blackweek[i].MATSKU === $(b).find(".link").text()){
              $(b).addClass('blackweek');
            }
          }    
        });
      }
    },
    autoscroll:function(){
      if(this.verifyEqualCookie()){
        $(".page-container").scrollTop(this.cookiescroll[0].posscroll);
      }
      else{
        this.cookiescroll=[];
        $.removeCookie('posscroll', { path: '/' });
        $(".page-container").scrollTop(0);
        this.resetOptFilter(!0);
      }
    },
    verifyEqualCookie:function(){
      // && this.cookiescroll[0].view === this.view
      if(this.cookiescroll.length){
        if(this.cookiescroll[0].amosval === this.amosval){
          return true;
        }
        else{
          return false;
        }
      }
      else{
        if($.cookie("posscroll")){
          this.cookiescroll=[];
          this.cookiescroll.push(jQuery.parseJSON($.cookie("posscroll")));
          if(this.cookiescroll[0].amosval === this.amosval){
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
      }
    },
    Componentfilter:function(data,page){
      var aux,context=this,status,i;
      this.fdata.length ? aux=this.fdata : aux=this.data;
      this.fdata=aux.filter(function(a,b){
        return a;
        /*if(a.SGRUPO === "Bordados"){
          console.log("Ok");
          return a;
        }*/
      });

      if (!this.fdata.length) { 
        return this.modal.open("Tente novamente","Item digitado errado ou esgotado no momento. <br> Tente refazer a busca usando termos diferentes, caso não encontre, entre em contato com seu representante.",!0),this.setloading(!1,!0),this.content.reset(),!1;
      }
      if(this.verifyEqualCookie()){
        this.filter.list=this.cookiescroll[0].filter;
        if(this.filter.list.length){
          this.fdata= this.filter.confirm(!1,!0);
        }
        if (this.filter.list.length) {
          var aux=[];
          aux.push(this.breadarr[0]);
          this.breadarr.length=0;
          this.breadarr=aux;
          for (a = 0; a < this.filter.list.length; a++) {
            this.breadarr.push(" " + this.filter.list[a].ft);
          }
        }
        this.sortItemsbyCookie(this.cookiescroll[0].nsort[0],this.cookiescroll[0].nsort[1]);
      }
      else{
        if (this.filter.list.length) {
          var aux=[];
          aux.push(this.breadarr[0]);
          this.breadarr.length=0;
          this.breadarr=aux;
          for (a = 0; a < this.filter.list.length; a++) {
            this.breadarr.push(" " + this.filter.list[a].ft);
          }
        }
        this.createbox(this.fdata,page);
      }
    },
    stage:function() {
      var a, c;
      "number" === typeof window.innerWidth ? (a = window.innerWidth, c = window.innerHeight) : (a = document.documentElement.clientWidth, c = document.documentElement.clientHeight);
      return{w:a, h:c};
    },  
    endloading : function(a) {
        a && clearInterval(a);
        var b = this;
        b.getloading(!1);
        /*b.content.itens.fadeIn(function() { 
            b.getloading(!1);
        });  */          
    },
    sortItemsbyCookie:function(type,name){
      if(!name){
        return this.createbox(this.fdata, this.content.page);
      }
      var i,length,temp=[];
      this.order_box.find(".b_order").removeClass("sel");
      this.order_box.find(".b_order").each(function(index, el) {
        if($(el).attr("name") === type){
          $(el).addClass('sel');
        }
      });
      this.order_box.find(".orderby").addClass("sel").text(name);

      if(type !== "bigPE"){
        this.nsort=type;
        length= this.fdata.length;
        if(type !== "PE"){
          for(i=0;i<length;i++){
            //.replace("  "," ");
            this.fdata[i][type]=this.fdata[i][type]; //Validating when article has doble space insert in SAP
          }
        }
        this.fdata = this.fdata.sortBy(type).unique();
        this.createbox(this.fdata, this.content.page);
      }
      else{
        this.nsort="bigPE";
        temp = this.fdata.sortBy("PE").unique();
        length=this.fdata.length-1;
        for(i=length;i>=0;i--){
          temp.push(this.fdata[i]);
        }

        this.fdata=[];
        this.fdata=temp.unique();
        this.createbox(this.fdata, this.content.page);
      }
    },
    sortItems:function(a){
      var type,i,length,temp=[];
      if($(a.target).hasClass("sel") || this.loading){
        return !1;
      }
      this.setloading(!0,!1);
      type=$(a.target).attr("name");
      this.content.reset();
      this.content.changeview(this.view);
      
      if(type !== "bigPE"){
        this.nsort=type;
        length= this.fdata.length;
        if(type !== "PE"){
          for(i=0;i<length;i++){
              this.fdata[i][type]=this.fdata[i][type].replace("  "," "); //Validating when article has doble space insert in SAP
          }
        }
        this.page_container.scrollTop(0);
        this.order_box.find(".b_order").removeClass("sel");
        $(a.target).addClass('sel');
        this.order_box.find(".orderby").addClass("sel").text($(a.target).attr("title"));
        if(this.cookiescroll.length){
          this.cookiescroll[0].nsort[0]=this.nsort;
          this.cookiescroll[0].nsort[1]=this.order_box.find(".b_order.sel").attr("title") || "";
          this.cookiescroll[0].posscroll=0;
          $.cookie.json = !0;
          $.cookie("posscroll", this.cookiescroll[0], {expires:7, path:"/"});
        }
        else{
          var scroll={
            "posscroll":0,
            "amosval":this.amosval,
            "view":this.view,
            "nsort":[this.nsort,(this.order_box.find(".b_order.sel").attr("title") || "")],
            "filter":this.filter.list
          };
          $.cookie.json = !0;
          this.cookiescroll=[];
          this.cookiescroll.push(scroll);
          $.cookie("posscroll", scroll, {expires:7, path:"/"});
        }
        this.fdata = this.fdata.sortBy(type).unique();
        this.createbox(this.fdata, this.content.page);
      }
      else{
        this.nsort="bigPE";
        temp = this.fdata.sortBy("PE").unique();
        length=this.fdata.length-1;
        for(i=length;i>=0;i--){
          temp.push(this.fdata[i]);
        }
        this.page_container.scrollTop(0);
        this.order_box.find(".b_order").removeClass("sel");
        $(a.target).addClass('sel');
        this.order_box.find(".orderby").addClass("sel").text($(a.target).attr("title"));
        if(this.cookiescroll.length){
         this.cookiescroll[0].nsort[0]=this.nsort;
          this.cookiescroll[0].nsort[1]=this.order_box.find(".b_order.sel").attr("title") || "";
          this.cookiescroll[0].posscroll=0;
          $.cookie.json = !0;
          $.cookie("posscroll", this.cookiescroll[0], {expires:7, path:"/"});
        }
        else{
          var scroll={
            "posscroll":0,
            "amosval":this.amosval,
            "view":this.view,
            "nsort":[this.nsort,(this.order_box.find(".b_order.sel").attr("title") || "")],
            "filter":this.filter.list
          };
          $.cookie.json = !0;
          this.cookiescroll=[];
          this.cookiescroll.push(scroll);
          $.cookie("posscroll", scroll, {expires:7, path:"/"});
        }

        this.fdata=[];
        this.fdata=temp.unique();
        this.createbox(this.fdata, this.content.page);
        
      }
    },
    callFilter:function(){
      $(".filter-container.small-filter").fadeIn();
    },
    resertItem:function(a){
      ga('send', 'event', 'link','click', 'Reserve este artigo: '+$(a.target).attr("name"));
    },

    goDetail:function(a){
      this.navigate("detail/"+$(a.target).attr("name"), !0);
    },
    getAmosVal:function(){
      return this.amosval;
    },
    getMode:function(){
      return this.mode;
    },
    setBreadarr:function(a){
      this.breadarr=[];
      if(a){
        this.breadarr.push(a);
      }
    },
    getBreadarr:function(){
      return this.breadarr;
    },
    getCodPromo:function(){
      return this.promotion.codpromo;
    },
    getSpot:function(a){
      if(13 === a.keyCode){
        this.spotlight.close();
        this.searchEl.trigger("submit");
      }
      else{
        if(1 < a.target.value.length){
          this.spotlight.open(a)
        }
        else{
          this.spotlight.close();
        }
      }
    },
    opentutorial: function (a) {
      "object" === typeof a && (a.preventDefault(), $(a.target));
      this.modal.openTutorial(this.tutpage);
      return !1;
    },
    /**
    * `Set the loading state`
    * @memberOf App#
    * @param {Boolean} a. If true show mask, else hide mask.
    * @param {Boolean} b. If is false, open the loader ebook, else open just the mask div
    */
    setloading: function(a, b) {
      if (!b) {
        if (a) {
          this.spotlight.close();
          $(".mask").fadeIn();
          this.loading = !0;
        } else {
          $(".mask").fadeOut();
          this.loading = !1;
        }
      } else {

        if (a) {
          this.spotlight.close();
          $(".mask").find("img").fadeOut();
          $(".mask").fadeIn();
          this.loading = !0;
        } else {
          $(".mask").fadeOut();
          $(".mask").find("img").fadeIn();
          this.loading = !1;
        }
      }
      return this.loading;
    },

    /**
    * `Return loading status`
    * @memberOf App#
    *@return {boolean} status - return loading status
    *
    */
    getloading:function(a){
      return this.loading;
    },

    scroll:function(z) {
      var b, c, f, clone,e = this,itens;
      z = z || $(window);
      $.hasData(z[0]);
      if (!$(".thumbnail").length && !$("tbody tr").length || this.loading) {
        return !1;
      }
      z.scroll(function() {
        if (e.loading || e.page === "detail") {
          return!1;
        }
        if (!$(".thumbnail").length && !$("tbody tr").length) {
          return !1;
        }
        e.spotlight.close();

        d = z.scrollTop();
        if(d<=0){
          e.backtotop.fadeOut();
        }
        else{
          e.backtotop.fadeIn();
        }

        if(e.view === "images"){
          b = $(".viewport").height()-z.height();
          itens=$(".thumbnail").length;
        }
        else{
          b = $("table tbody").height()-z.height();
          itens=$("tbody tr").length;
        }


        if(d<b){
          var scroll={
            "posscroll":d,
            "amosval":e.amosval,
            "view":e.view,
            "nsort":[e.nsort,(e.order_box.find(".b_order.sel").attr("title") || "")],
            "filter":e.filter.list
          };
          $.cookie.json = !0;
          e.cookiescroll=[];
          e.cookiescroll.push(scroll);
          $.cookie("posscroll", scroll, {expires:7, path:"/"});
        }
        
        //console.log(itens+" = "+e.fdata.length);
        if(d>b && itens<e.fdata.length ){
          e.content.page++;
          e.setloading(!0,!1);
          setTimeout(function(){
            e.Componentfilter(e.fdata,e.content.page);
          },800)
          return !0;
        }
      });
    },
    reset:function(){
      this.takedot = !1;
      this.amosval="";
      this.data = [];
      this.fdata = [];

      var $table = $('#table');
      this.promotion.group="";

      /*this.itens = $([]);
      this.select_items = [];
      this.itens.remove();
      this.unable_select=!1;
      this.thanks=!1;
      this.content.reset();*/
    },
    resetOptFilter:function(cleanclass){
      this.nsort="";
      this.order_box.find(".b_order").removeClass("sel");
      this.order_box.find(".orderby").removeClass('sel').text("Ordenar");
      if(cleanclass){
        $(".filter_list li span").text(0).addClass('hide');
        $(".filter-area-down").hide().find(".allowitens").empty();
        $(".filter_list").find("a").removeClass("sel").addClass("unsel");
        this.filter.list.length=0;
      }
      if(this.cookiescroll.length){
        this.cookiescroll[0].posscroll=0;
        this.cookiescroll[0].filter=this.filter.list;
        $.cookie.json = !0;
        $.cookie("posscroll", this.cookiescroll[0], {expires:7, path:"/"});
      }
      else{
        var scroll={
          "posscroll":0,
          "amosval":this.amosval,
          "view":this.view,
          "nsort":["",""],
          "filter":this.filter.list
        };
        $.cookie.json = !0;
        this.cookiescroll=[];
        this.cookiescroll.push(scroll);

        $.cookie("posscroll", scroll, {expires:7, path:"/"});
      }
    }
  });
  new App;
  Spine.Route.setup();
});