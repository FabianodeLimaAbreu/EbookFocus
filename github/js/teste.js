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
require(["methods","jquery.elevatezoom","sp/min", "app/content", "app/detail","app/filter"], function() {
  /**
  * Main application class, responsible for all main funcionalities and call anothers classes constructors
  * @exports App
  * @constructor
  */
  window.App = Spine.Controller.sub({
    el:$("body"),
    elements: {
      ".container":"container",
      ".nav-menu a":"menuopt",
      "header":"header",
      ".content":"contentEl",
      "#wrap .mask":"maskEl",
      "#wrap .loader":"loader",
       ".modal_mask" : "modalEl",
      ".login-name":"username",
      ".login-id":"usersegm"
    },

    events: {      
      "click .justit.bnote":"preventAction",
      "click .justit.bemail":"preventAction",
      "click .fornecedor_cadastro .nav-menu a":"preventAction",
      "hover .tooltip-selectable":"positionNote",
      "click .ai-holder button":"ChangeStatusFair",
      "click .changeview button":"changeview",
      "click .tooltip.borderby .tooltip-item":"sortItems",
      "click .bsel":"enableSelect",
      "click .btrash-big":'deleteNote',
      "click .bfav":'actionHeart',
      "click .bfisica":'actionFlag',
      "click .bhomologado":'actionHomolog',
      "change .countries": "changeCountries",
      "change .city": "changeCity",
      "change .inative": "changeCity",
      "keyup .forn": "getSpot",
      "change .fair":"changeFair",
      "click .export":"exportExcel",
      "blur .form-control-search":"search",
      "keyup .form-control-search":"search",
      "change .filter-data":"filterForn",
      "click .caption-downside a":"compChange",
      "click .edit-fair":"editFair",
      "click .fair-save":"saveFair",
      "click .delete-fair":"deleteFair",
      "click .not-autoshow":"showPicker",
      "click .save-date-filter":"submitDateFilter",
      "click .setitem":"SetItemAmos",
      "click .bselection-edit":"selectItem",
      "click .bselection":"selectItem",
      "click .tooltip-content.status button":"AmosByStatus",
      "click .filter-price":"AmosByPrice",
      "click .thumbnail img":"goDetail",
      "click .main_opt_button.bemail":"sendEmail",
      "click .main_opt_button.btrash":"CleanFilter",
      "click .open-info":"toggleTemplate",
      "click .close-temp":"toggleTemplate",
      "click .delete-temp":"deleteTemplate",
      "click .edit-temp":"editTemplate",
      "click .save-temp":"saveTemplate",
      "change .type":"filterTemplate",  
      "click .category_button":"showSubCategories",
      "change .SEGM_COD":"filterTemplate",
      "change .AMOS_SEGM_COD":"amosBySegment",
      "click .sub_category a":"setCompositions",
      "keyup input[name='FEIR_DESC']":"toUpperCaseValue",
      "keyup input[name='FORN_DESC']":"toUpperCaseValue",
      "keyup input[name='AMOS_DESC']":"toUpperCaseValue",
      "click .goback-relative":"goBack",
      "click .hash":"addHash",
      "focus .info-template textarea":"focusArea",
      "click .filterlist a":"setComboFilter",
      "click .combofilter":"makeComboFilter",
      "click .remain_text":"TakeAllSamples",
      "click .select_all":"SelectAllSamples"
    },
    init:function(){
      this.view = "images";
      this.page = "amostras";
      this.nsort="";
      this.itens = $([]);
      this.data=[];
      this.fdata = [];
      this.loading=!1;
      this.action_name="";
      this.callback=null;
      this.bfair;
      this.bforn; 
      this.filterisdone=!0;
      this.itens_by_page=20;
      this.itens_page_default=this.itens_by_page;
      this.ajaxrequest=!1;
      this.thanks=!1;

      //Var to storage the basic data
      this.fair=[];
      this.ffair=[];
      this.cities=[];
      this.forn=[];
      this.email=[];
      this.segm=[];
      this.prices=[];
      this.refine=[];
      this.select_items=[];
      this.fornidselect=0;
      this.fstatus=null;
      this.cadstatus=undefined;
      this.cadprincipal=undefined;
      this.fairval="";
      this.fornval="";
      this.amosval="";
      this.fornclick="";
      this.segmval="";
      this.initialTimeAmos=null;
      this.endTimeAmos=null;
      this.initialTimeForn=null;
      this.endTimeForn=null;
      this.unable_select=!1;
      this.is_selected=!1;
      this.combofilter={
        "FLAG_FISICA":{"clicked":0,"code":0},
        "FLAG_PRIORIDADE":{"clicked":0,"code":0},
        "AMOS_HOMOLOGAR":{"clicked":0,"code":0},
        "AMOS_ENV_EMAIL":{"clicked":0,"code":0},
        "NOTES":{"clicked":0,"code":0},
        "is_set":0
      };


      this.breadarr = [];
      this.usr = jQuery.parseJSON($.cookie("webfair"));
      if(!this.usr)
        window.location.href = 'login.html';

      this.cookiefornecedores=[];
      this.cookieamostras=[]

      this.header.addClass("goDown");
      
      this.username.text(this.usr.USU_NOME);
      this.usersegm.text(this.usr.SEGM_DESC);
      
      this.el.find("#wrap").removeClass("hide");

      this.modal = new Modal({el:this.modalEl,callService:this.proxy(this.callService),usr:this.usr,getPage:this.proxy(this.getPage),setEmailSent:this.proxy(this.setEmailSent)});
      this.content = new Content({el:this.contentEl,usr:this.usr,getPage:this.proxy(this.getPage)/*bread:this.breadEl, type:this.usr.TIPO*/});
      this.fornecedores = new Fornecedores({
        getloading:this.proxy(this.getloading),
        setloading:this.proxy(this.setloading),
        getdata:this.proxy(this.getdata),
        callService:this.proxy(this.callService),
        deleteNote:this.proxy(this.deleteNote),
        getSegm:this.proxy(this.getSegm),
        setSegm:this.proxy(this.setSegm),
        createComponent:this.proxy(this.createComponent),
        setDate:this.proxy(this.setDate),
        usr:this.usr,
        fair:this.fair,
        modal:this.modal,
        setFornClick:this.proxy(this.setFornClick),
        savingCookie:this.proxy(this.savingCookie)
      });

      this.detail = new Detail({
        getloading:this.proxy(this.getloading),
        setloading:this.proxy(this.setloading),
        body:this.el,
        getdata:this.proxy(this.getdata),
        actionHeart:this.proxy(this.actionHeart),
        actionFlag:this.proxy(this.actionFlag),
        actionHomolog:this.proxy(this.actionHomolog),
        SetItemAmos:this.proxy(this.SetItemAmos),
        callService:this.proxy(this.callService),
        deleteNote:this.proxy(this.deleteNote),
        setDate:this.proxy(this.setDate),
        usr:this.usr,
        modal:this.modal,
        cookieamostras:this.cookieamostras
      });

      this.spotlight = new Spotlight({
        callService:this.proxy(this.callService),
        reset:this.proxy(this.reset),
        getFornVal:this.proxy(this.getFornVal),
        setFornVal:this.proxy(this.setFornVal),
        getFairVal:this.proxy(this.getFairVal),
        setFairVal:this.proxy(this.setFairVal),
        getAmosVal:this.proxy(this.getAmosVal),
        getPage:this.proxy(this.getPage),
        getInitialTime:this.proxy(this.getInitialTime),
        getEndTime:this.proxy(this.getEndTime),
        setCookieFair:this.proxy(this.setCookieFair),
        getContPrincipalFornecedores:this.proxy(this.getContPrincipalFornecedores)
      });
      this.filter = new Filter({
        getloading: this.proxy(this.getloading),
        content:this.content,
        Componentfilter:this.proxy(this.Componentfilter),
        setloading:this.proxy(this.setloading)
      });

      if(!this.fair.length){
        this.callService("local",'<FEIR_COD></FEIR_COD>','<PAIS_COD></PAIS_COD>','<REGI_COD></REGI_COD>');
      }
      this.routes({
        "":function() {
          this.menuopt.eq(2)[0].click();
        },
        "amostras":function(){
          var context=this;
          this.page ="amostras";
          this.view = "images";
          //console.log("AMOSTRAS NORMAL");
          $("html").attr("class","").addClass(this.page);
          //this.restartValues();
          this.PassCookie();
          this.writePage(this.page);
        },
        "amostras/*fairval/*fornval/*amosval":function(res){
         //debugger;
          var a,b,c;
          this.page ="amostras";
          this.filterisdone=!0;
          this.fairval = a=res.fairval !== "padrao" ? parseInt(res.fairval) : ""; 
          this.fornval = b=res.fornval !== "padrao" ? res.fornval.replace("_"," ").replace("_"," ").replace("_"," ").replace("--","/").replace("--","/") : "";
          this.amosval = c=res.amosval !== "padrao" ? res.amosval.replace("_"," ").replace("_"," ").replace("_"," ").replace("--","/").replace("--","/") : ""; 
          if(this.cookieamostras.length){
            if(a == this.cookieamostras[0].fairval && b === this.cookieamostras[0].fornval  && c === this.cookieamostras[0].amosval ){
              //console.log("bateu parametros do cookie");
              this.initialTimeAmos=this.cookieamostras[0].dates[0];
              this.endTimeAmos=this.cookieamostras[0].dates[1];
              this.prices=this.cookieamostras[0].prices;
              this.refine=this.cookieamostras[0].refine;
              this.combofilter=this.cookieamostras[0].combofilter;
              this.fstatus=this.cookieamostras[0].fstatus; 
              this.nsort=this.cookieamostras[0].nsort;
              this.fornclick=this.cookieamostras[0].fornclick;
              this.segmval=this.cookieamostras[0].segmval;
                              //console.dir(this.cookieamostras[0]);

            }
            else{
              //console.log("WINDOW 0");
              this.cookieamostras=[];
              $.removeCookie('posscroll'+this.page, { path: '/' }); 
              //debugger;
              $(".container-fullsize.scroller").scrollTop(0);
            }
          }
          else{
            //console.log("nao achou");
            if(jQuery.parseJSON($.cookie('posscroll'+this.page))){
              this.cookieamostras.push(jQuery.parseJSON($.cookie('posscroll'+this.page)));
              if(a == this.cookieamostras[0].fairval && b === this.cookieamostras[0].fornval  && c === this.cookieamostras[0].amosval ){
                //console.dir(this.cookieamostras[0]);
                //console.log("bateu parametros do cookie");
                this.initialTimeAmos=this.cookieamostras[0].dates[0];
                this.endTimeAmos=this.cookieamostras[0].dates[1];
                this.prices=this.cookieamostras[0].prices;
                this.refine=this.cookieamostras[0].refine;
                this.combofilter=this.cookieamostras[0].combofilter;
                this.fstatus=this.cookieamostras[0].fstatus;
                this.nsort=this.cookieamostras[0].nsort;
                this.fornclick=this.cookieamostras[0].fornclick;
                this.segmval=this.cookieamostras[0].segmval;
                                //console.dir(this.cookieamostras[0]);

              }
              else{
                //console.log("WINDOW 0");
                //debugger;
                this.cookieamostras=[];
                $.removeCookie('posscroll'+this.page, { path: '/' });
                $(".container-fullsize.scroller").scrollTop(0);
              }
            }
            else{
              //console.log("WINDOW 0");
              //debugger;
              $(".container-fullsize.scroller").scrollTop(0);
            }
          }

          if(parseInt(b)){
            b="<FORN_ID>"+b+"</FORN_ID>";
          }
          else{
            if(b){
              if(b.slice(0, 3) === "alt"){
                b=b.slice(3,(b.length));
              }
              b="<FORN_DESC>"+b+"</FORN_DESC>";
            }
            else{
              b="";
            }
          }
          if(parseInt(c)){
            c="<AMOS_ID>"+c+"</AMOS_ID>";
          }
          else{
            if(c){
              c="<AMOS_DESC>"+c+"</AMOS_DESC>";
            }
            else{
              c="";
            }
          }
          a="<FEIR_COD>"+a+"</FEIR_COD>";
          $("html").attr("class","").addClass(this.page);
          this.writePage(this.page,[a,b,c]);
        },
        "fornecedores":function(){
          var context=this;
          this.page ="fornecedores";
          //this.restartValues();
          this.PassCookie();
          $("html").attr("class","").addClass(this.page);
          this.writePage(this.page);
        },
        "fornecedores/*fairval/*fornval/*amosval":function(res){
          var a,b,c;
          this.fairval = a=res.fairval !== "padrao" ? parseInt(res.fairval) : ""; 
          this.fornval = b=res.fornval !== "padrao" ? res.fornval.replace("_"," ").replace("_"," ").replace("_"," ").replace("--","/").replace("--","/") : "";
          this.amosval = c=res.amosval !== "padrao" ? res.amosval.replace("_"," ").replace("_"," ").replace("_"," ").replace("--","/").replace("--","/") : ""; 


          if(this.cookiefornecedores.length){
            //console.dir(this.cookiefornecedores);
            //console.dir(this.cookiefornecedores);
            this.initialTimeForn=this.cookiefornecedores[0].dates[0];
            this.endTimeForn=this.cookiefornecedores[0].dates[1];
            this.prices=this.cookiefornecedores[0].prices;
            this.refine=this.cookiefornecedores[0].refine;
            this.cadstatus=this.cookiefornecedores[0].fstatus;
            this.cadprincipal=this.cookiefornecedores[0].cadprincipal;
            this.fornclick=this.cookiefornecedores[0].fornclick;
            this.nsort=this.cookiefornecedores[0].nsort;
            this.combofilter=this.cookiefornecedores[0].combofilter;
            this.segmval=this.cookiefornecedores[0].segmval;
            //console.dir(this.cookiefornecedores[0]);


            if(a == this.cookiefornecedores[0].fairval && b === this.cookiefornecedores[0].fornval){
              //console.log("bateu parametros do cookie");
              this.initialTimeForn=this.cookiefornecedores[0].dates[0];
              this.endTimeForn=this.cookiefornecedores[0].dates[1];
              this.prices=this.cookiefornecedores[0].prices;
              this.refine=this.cookiefornecedores[0].refine;
              this.combofilter=this.cookiefornecedores[0].combofilter;
              this.cadstatus=this.cookiefornecedores[0].fstatus;
              this.cadprincipal=this.cookiefornecedores[0].cadprincipal;
              this.fornclick=this.cookiefornecedores[0].fornclick;
              this.nsort=this.cookiefornecedores[0].nsort;
              this.fornclick=this.cookiefornecedores[0].fornclick;
              this.segmval=this.cookiefornecedores[0].segmval;
              //console.dir(this.cookiefornecedores[0]);

            }
            else{
              console.log("WINDOW 0");
              this.cookiefornecedores=[];
              $.removeCookie('posscroll'+"fornecedores", { path: '/' });
              //debugger;
              $(".container-fullsize.scroller").scrollTop(0);
            }
          }
          else{
            //console.log("nao achou");
            if(jQuery.parseJSON($.cookie("posscroll"+"fornecedores"))){

              this.cookiefornecedores.push(jQuery.parseJSON($.cookie("posscroll"+"fornecedores")));
              if(a == this.cookiefornecedores[0].fairval && b === this.cookiefornecedores[0].fornval){
                //console.dir(this.cookiefornecedores[0]);
                //console.log("bateu parametros do cookie");
                this.initialTimeForn=this.cookiefornecedores[0].dates[0];
                this.endTimeForn=this.cookiefornecedores[0].dates[1];
                this.prices=this.cookiefornecedores[0].prices;
                this.refine=this.cookiefornecedores[0].refine;
                this.combofilter=this.cookiefornecedores[0].combofilter;
                this.cadstatus=this.cookiefornecedores[0].fstatus;
                this.cadprincipal=this.cookiefornecedores[0].cadprincipal;
                this.nsort=this.cookiefornecedores[0].nsort;  
                this.fornclick=this.cookiefornecedores[0].fornclick;
                //console.dir(this.cookiefornecedores[0]);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
              }
              else{
                console.log("WINDOW 0");
                this.cookiefornecedores=[];
                $.removeCookie('posscroll'+"fornecedores", { path: '/' });

                //debugger;
                $(".container-fullsize.scroller").scrollTop(0);
              }
            }
            else{
              console.log("WINDOW 0");
              //debugger;
              $(".container-fullsize.scroller").scrollTop(0);
            }
          }

          //console.dir(this.cookiefair[0]);
          this.fairval = a=res.fairval !== "padrao" ? parseInt(res.fairval) : ""; 
          this.fornval = b=res.fornval !== "padrao" ? res.fornval.replace("_"," ").replace("_"," ").replace("_"," ").replace("--","/").replace("--","/") : "";
          this.amosval = c=res.amosval !== "padrao" ? res.amosval.replace("_"," ").replace("_"," ").replace("_"," ").replace("--","/").replace("--","/") : ""; 

          if(isNaN(b)){

            if(b){
              if(b.slice(0, 3) === "alt"){
                b=b.slice(3,(b.length));
              }
              b="<FORN_DESC>"+b+"</FORN_DESC>";
            }
            else{
              b="";
            }
          }
          else{
            if(b){
              b="<FORN_ID>"+b+"</FORN_ID>";
            }
            else{
              b="";
            }
          }

          if(parseInt(c)){
            c="<AMOS_ID>"+c+"</AMOS_ID>";
          }
          else{
            if(c){
              c="<AMOS_DESC>"+c+"</AMOS_DESC>";
            }
            else{
              c="";
            }
          }
          
          a="<FEIR_COD>"+a+"</FEIR_COD>";
          var context=this;
          this.page ="fornecedores";
          $("html").attr("class","").addClass(this.page);
          this.writePage(this.page);
          this.setloading(!0,!1);
          this.submit(a,b,c,!1,this.cadstatus,this.cadprincipal);
        },
        "fornecedores/*func/*code":function(a){
          var context=this;
          this.page ="fornecedor_cadastro";
          $("html").attr("class","fornecedor_cadastro edit_forn");
          this.writePage(this.page,a.code);
        },
        "fornecedores/*func":function(a){
          var context=this;
          this.page ="fornecedor_cadastro";
          $("html").attr("class","fornecedor_cadastro add_forn");
          this.writePage(this.page,"new");
        },
        "relatorio":function(){
          var context=this;
          this.page ="relatorio";
          this.writePage(this.page);
        },
        "local":function(){
          var context=this;
          this.page ="local";
          $("html").attr("class","").addClass(this.page);
          this.writePage(this.page);
        },
        "local/*func/*code":function(a){
          var context=this;
          this.page ="local_cadastro";
          $("html").attr("class","local_cadastro view_fair");
          this.writePage(this.page,a.code);
        },
        "local/*func":function(a){
          var context=this;
          this.page ="local_cadastro";
          $("html").attr("class","local_cadastro add_fair");
          this.writePage(this.page,"new");
        },
        "template_email":function(){
          var context=this;
          this.page ="template_email";
          $("html").attr("class","").addClass(this.page);
          this.writePage(this.page);
        },
        "template_email/*func":function(a){
          var context=this
          $("html").attr("class","template_email add_temp");
          this.page ="template_cadastro";
          this.writePage(this.page);
        },
        "gestao":function(){
          var context=this;
          this.page ="gestao";
          this.writePage(this.page);
        },
        "detail/*fair/*code" : function(a) {
          this.page ="detail";
          this.writePage(this.page);
          this.fairval=a.fair;
          this.amosval=a.code;
        }
      }); 
    },
    /**
    * `This method is responsible to pass the forn's search to samples search when the user click at Samples's menu link and vice-versa
    * @memberOf App#
    */
    PassCookie:function(){
      var url="";
      if(this.page === "amostras"){
        if(this.cookiefornecedores.length){
          url=this.page+"/"+(this.cookiefornecedores[0].fairval || "padrao")+"/"+(this.cookiefornecedores[0].fornclick ||  this.cookiefornecedores[0].fornval ||"padrao")+"/"+(this.cookiefornecedores[0].amosval || "padrao");
          this.navigate(url, !0);
        }
      }
      else{
        if(this.cookieamostras.length){
          url=this.page+"/"+(this.cookieamostras[0].fairval || "padrao")+"/"+(this.cookieamostras[0].fornval || "padrao")+"/"+(this.cookieamostras[0].amosval || "padrao");
          this.navigate(url, !0);
        }
      }
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
      window.history.go(-1);
    },

    /**
    * `Prevent Action from click when user click on note's and email's button in sample's page.`
    * `Prevent when user is on fornecedor_cadastro's page and click on a menu's item too, confirming if the user desire to change the page, if true, call this.redirect`
    * @memberOf App#
    * @param {event} a. The click event.
    */
    preventAction:function(a){
      a.preventDefault();
      if(this.page === "fornecedor_cadastro"){
        this.redirect_val=$(a.target).attr('href').replace("#","");
        this.modal.open("message","Sair sem salvar as alterações nesta aba?<br> Para salvar, basta trocar de aba", this.proxy(this.redirect),!0, !0);
      }
    },

    /**
    * `This method is called by preventAction when the user click in yes in the Modal.`
    * `The method take the redirect_val set in preventAction method and change the hash of the page using it.`
    * @memberOf App#
    */
    redirect:function(a){
      window.location.hash=this.redirect_val;
    },

    /**
    * `This method is called every time that the user point the mouse to a combonote to see the note of a supplier or a sample.`
    * `The method take the outerHeight of the table's scroller and compare to the tooltip of note's height. Then, if is needed, the method change the position of the element to top.`
    * @memberOf App#
    * @param {event} a. The click event.
    */
    positionNote:function(a){
      var tablesize=$(".scroller").outerHeight();
      if(($(a.target).position().top+$(a.target).height()+50 )> tablesize){
        var el=$(a.target).find(".notepadmess");
        el.css("top","-"+el.height()+"px").addClass('otherbefore');
      }
    },

    /**
    * `This method change the container's value of the index.html according to the hash's change and hash's value.`
    * @memberOf App#
    * @param {String} hash. hash's value.
    * @param {number} val. The code of a local or supplier that has to be edited.
    */
    writePage:function(hash,val){
      var context=this;  
      if(this.page !== "detail" && this.page !== "fornecedor_cadastro"){
        context.reset();
      }
      $(".zoomContainer").remove();
      $(".nav-menu a").removeClass('sel');
      this.container.load("pages/"+hash+".html",function( response, status, xhr){
        switch(context.page){
          case "amostras":
            var status,second;
            context.viewBtn=$(".changeview button");
            context.order_box=$(".tooltip.borderby");
            context.bfair=$(".fair");
            context.bforn=$(".forn");
            context.spotlight.el=$(".spotlight");
            this.view = "images";
            $("body").removeAttr("class");
            $(".nav-menu a[href='#amostras']").addClass('sel');
            if(!context.fair.length){
              status=setInterval(function(){
                if(context.fair.length){
                  context.ajaxrequest=!1;
                  context.createComponent(context.fair,context.bfair,'fair');
                  clearInterval(status);
                }
              },100);
              second=setInterval(function(){
                if(context.segm.length){
                  context.ajaxrequest=!1;
                  context.createComponent(context.segm,$(".AMOS_SEGM_COD"),'segm');
                  clearInterval(second);
                }
              },100);
              $(".fair option").each(function(a,b){
                if(parseInt($(b).attr("value")) ==  parseInt(context.fairval)){
                  $(b).attr("selected","selected");
                }
              });
              $("select.AMOS_SEGM_COD").find("option").each(function(index, el) {
                if($(el).attr("value") === context.segmval){
                  $(el).attr('selected', 'selected');
                }
              });
            }
            else{
              if(val && val.length){
                context.setloading(!0,!1);
                context.submit(val[0],val[1],val[2],!1);
              }
              if(context.usr.SEGM_COD === "TD"){
                status=setInterval(function(){
                  if(val && val.length){
                    if(context.data.length){
                      context.callService("listarSegmentos");
                      context.ajaxrequest=!1;
                      clearInterval(status);
                    }
                    
                  }
                  else{
                    context.callService("listarSegmentos");
                    context.ajaxrequest=!1;
                    clearInterval(status);
                  }
                },100);
              }
              else{
                $(".AMOS_SEGM_COD").addClass("hide");
                context.segmval=context.usr.SEGM_COD;
              }

              second=setInterval(function(){
                if(context.usr.SEGM_COD === "TD"){
                  context.ajaxrequest=!1;
                  if(context.segm.length){
                    context.createComponent(context.segm,$(".AMOS_SEGM_COD"),'segm');
                    context.createComponent(context.fair,context.bfair,'fair');
                    if(context.fairval){
                      $(".fair option").each(function(a,b){
                        if(parseInt($(b).attr("value")) ==  parseInt(context.fairval)){
                          $(b).attr("selected","selected");
                        }
                      });
                    }
                    $("select.AMOS_SEGM_COD").find("option").each(function(index, el) {
                      if($(el).attr("value") === context.segmval){
                        $(el).attr('selected', 'selected');
                      }
                    });
                    clearInterval(second);
                  }
                }
                else{
                  context.createComponent(context.fair,context.bfair,'fair');
                  if(context.fairval){
                    $(".fair option").each(function(a,b){
                      if(parseInt($(b).attr("value")) ==  parseInt(context.fairval)){
                        $(b).attr("selected","selected");
                      }
                    });
                  }
                  clearInterval(second);
                }
              },100);  
            }
            if(context.fairval){
              $(".fair option").each(function(a,b){
                if(parseInt($(b).attr("value")) ==  parseInt(context.fairval)){
                  $(b).attr("selected","selected");
                }
              });
            }
            if(context.fornval){
              if(context.fornval.slice(0,3) ===  "alt"){
                context.bforn.val(context.fornval.slice(3,(context.fornval.length)));
              }
              else{
                context.bforn.val(context.fornval);
              }
            }
            if(context.amosval){
              $(".form-control-search").val(context.amosval);
            }
            $( "input[name='initial_date']" ).datepicker({
              changeMonth: true,
              changeYear: true,
              numberOfMonths: 1,
              monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
              monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
              dayNamesMin: ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'],
              dateFormat:"yy-mm-dd",
              onClose: function( selectedDate ) {
                $( "input[name='end_date']" ).datepicker( "option", "minDate", selectedDate );
              }
            });
            $( "input[name='end_date']" ).datepicker({
              changeMonth: true,
              changeYear: true,
              numberOfMonths: 1,
              monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
              monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
              dayNamesMin: ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'],
              dateFormat:"yy-mm-dd",
              onClose: function( selectedDate ) {
                $( "input[name='initial_date']").datepicker( "option", "maxDate", selectedDate );
              }
            }); 
            //context.callService("fornecedores",'<FORN_DESC></FORN_DESC>','<FEIR_COD></FEIR_COD>','<CREATE_DATE_I>1900-10-17</CREATE_DATE_I>','<CREATE_DATE_F>2020-10-17</CREATE_DATE_F>',20);
            break;
          case "fornecedores":
            context.bfair=$(".fair");
            context.bforn=$(".forn");
            context.spotlight.el=$(".spotlight");
            $(".nav-menu a[href='#fornecedores']").addClass('sel');
            if(!context.fair.length){
              status=setInterval(function(){
                if(context.fair.length){
                  context.ajaxrequest=!1;
                  context.createComponent(context.fair,context.bfair,'fair');
                  clearInterval(status);
                }
              },100);
            }
            else{
              context.createComponent(context.fair,context.bfair,'fair');
            }

            if(context.fairval){
              $(".fair option").each(function(a,b){
                if(parseInt($(b).attr("value")) ==  parseInt(context.fairval)){
                  $(b).attr("selected","selected");
                }
              });
            }
            if(context.fornval){
              if(context.fornval.slice(0,3) ===  "alt"){
                context.bforn.val(context.fornval.slice(3,(context.fornval.length)));
              }
              else{
                context.bforn.val(context.fornval);
              }
            }

            $( "input[name='initial_date']" ).datepicker({
              defaultDate: "+1w",
              changeMonth: true,
              changeYear: true,
              numberOfMonths: 1,
              monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
              monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
              dayNamesMin: ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'],
              dateFormat:"yy-mm-dd",
              onClose: function( selectedDate ) {
                $( "input[name='end_date']" ).datepicker( "option", "minDate", selectedDate );
              }
            });
            $( "input[name='end_date']" ).datepicker({
              defaultDate: "+1w",
              changeMonth: true,
              changeYear: true,
              numberOfMonths: 1,
              monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
              monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
              dayNamesMin: ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'],
              dateFormat:"yy-mm-dd",
              onClose: function( selectedDate ) {
                $( "input[name='initial_date']").datepicker( "option", "maxDate", selectedDate );
              }
            });
            break;
          case "local":
            var status;
            $(".nav-menu a[href='#local']").addClass('sel');
            context.bcity=$(".city");
            if(context.usr.USU_COD !== 1){
              $(".bnew-fair").hide();
            }
            if(!context.fair.length){
              status=setInterval(function(){
                if(context.fair.length){
                  context.ajaxrequest=!1;
                  context.setdata(context.fair,"local");
                  clearInterval(status);
                }
              },100);
            }
            else{
              context.setdata(context.fair,"local");
            }          
            break;
          case "local_cadastro":
            $(".nav-menu a[href='#local']").addClass('sel');
            $(".ai-holder").hide();
            context.bcity=$(".city");
            if(context.ffair.length){
              context.createComponent(context.cities,context.bcity,"cities");
              context.fair.filter(function(a,b){
                if((parseInt(a.FEIR_COD) == (parseInt(val)))){
                  $(".ai-holder").show();
                  context.popComponent(a);
                }
              });
            }
            else{
              context.fair.filter(function(a,b){
                if((parseInt(a.FEIR_COD) == (parseInt(val)))){
                  $(".ai-holder").show();
                  context.popComponent(a);
                }
              });
              //Mandar para pagina anterior
            }
            //context.callService(context.page,"<FEIR_COD></FEIR_COD>","<PAIS_COD>BR</PAIS_COD>","<REGI_COD>SP</REGI_COD>");
            break;
          case "detail":
            $(".nav-menu a[href='#amostras']").addClass('sel');
            $("html").attr("class","").addClass(context.page);

            if(context.usr.SEGM_COD === 'TD'){
              //Usuario TD não pode inserir na primeira etapa do projeto
              $(".bplus-big").hide();
            }
            
            context.detail.reload(context.fairval,context.amosval);
            break;
          case "fornecedor_cadastro":
            var second,status;
            $(".nav-menu a[href='#fornecedores']").addClass('sel');
            context.bfair=$(".fair");
            context.bcity=$(".city");
            if(context.usr.SEGM_COD === 'TD'){
              //Usuario TD não pode inserir na primeira etapa do projeto
              $(".bplus-big[name='shownote']").hide();
            }
            //console.log("fornecedor cadastro");

            if(!context.fair.length){
              status=setInterval(function(){
                if(context.fair.length){
                  context.ajaxrequest=!1;
                  context.createComponent(context.fair,context.bfair,'fair');
                  clearInterval(status);
                }
              },100);
            }
            else{
              context.createComponent(context.fair,context.bfair,'fair');
            }
            context.fornecedores.reload(val);
            break;
          case "template_email":
            $(".nav-menu a[href='#template_email']").addClass('sel');
            if(context.usr.SEGM_COD === 'TD'){
              //Usuario TD não pode inserir na primeira etapa do projeto
              $(".newtemp").hide();
            }
            if(!context.fair.length){
              status=setInterval(function(){
                if(context.fair.length){
                  context.ajaxrequest=!1;
                  context.createComponent(context.segm,$(".SEGM_COD"),'segm');
                  context.callService("template_email",'','<TEMP_DESC></TEMP_DESC><SEGM_COD></SEGM_COD>');
                  clearInterval(status);
                }
              },100);
            }
            else{
              if(context.usr.SEGM_COD === "TD"){
                status=setInterval(function(){
                  if(context.fair.length){
                    context.callService("listarSegmentos");
                    context.ajaxrequest=!1;
                    clearInterval(status);
                  }
                },100);

                second=setInterval(function(){
                  if(context.segm.length){
                    context.ajaxrequest=!1;
                    context.createComponent(context.segm,$(".SEGM_COD"),'segm');
                    context.callService("template_email",'','<TEMP_DESC></TEMP_DESC><SEGM_COD></SEGM_COD>');
                    clearInterval(second);
                  }
                },100);
              }
              else{
                $(".SEGM_COD").addClass('hide');
                second=setInterval(function(){
                  if(context.fair.length){
                    context.ajaxrequest=!1;
                    context.callService("template_email",'','<TEMP_DESC></TEMP_DESC><SEGM_COD></SEGM_COD>');
                    clearInterval(second);
                  }
                },100);
              }
            }
            break;
          case "template_cadastro":
            $(".nav-menu a[href='#template_email']").addClass('sel');
            $(".usr_segm").text(context.usr.SEGM_DESC);

            break;   
          default:
            alert("dssda");
        }
      });
    },

    /**
    * `Populate the local's component on the page to be changed.`
    * @memberOf App#
    * @param {Object} item. The Local that is goint to be edited or viewed.
    */
    popComponent:function(item){
      var status,elem=$(".form-control"),context=this;
      elem.each(function(a,b){
        $(b).attr("disabled","disabled").val(item[$(b).attr("name")]);
      });
      this.fairval=item;
      if(this.usr.USU_COD === 1){
        $(".edit-fair").trigger('click');
      }
      else{
        $(".bnew-fair").hide();
        $(".delete-fair").hide();
      }
      $(".ai-holder button[name='"+item.FEIR_INATIVO+"']").trigger('click');
      this.callService("cities",'<PAIS_COD>'+item.PAIS_COD+'</PAIS_COD>','<PAIS_DESC></PAIS_DESC>','<REGI_COD></REGI_COD>','<REGI_DESC></REGI_DESC>');
      status=setInterval(function(){
        if(context.cities.length){
          $(".city option").each(function(a,b){
            if($(b).attr("value") === item["REGI_COD"]){
              $(b).attr("selected","selected");
            }
          });
          clearInterval(status);
        }
      },100);
    },

    /**
    * `On click to ativate or disable a fair.`
    * @memberOf App#
    * @param {event} a. The click event.
    */
    ChangeStatusFair:function(a){
      var el=$(a.target);
      $(".ai-holder button").removeClass('sel');
      el.addClass('sel');
    },

    /**
    * `Click on the button to unable a fair to be edited. When the user has permission to edit or create a fair, this button is clicked automatically`
    * @memberOf App#
    * @param {event} a. The click event.
    */
    editFair:function(a){
      $(a.target).addClass("sel");
      $("html").attr("class","local_cadastro edit-fair");
      var elem=$(".form-control").removeAttr("disabled");
    },

    /**
    * `This method save a fair after changes`
    * @memberOf App#
    */
    saveFair:function(){
      var elem=$(".form-control"),html="";
      var day,date,month;
      date=new Date();
      if(parseInt(date.getDate())<10){
        day="0"+parseInt(date.getDate());
      }
      else{
        day=date.getDate();
      }

      if((parseInt(date.getMonth())+1)<10){
        month="0"+parseInt(date.getMonth()+1);
      }
      else{
        month=parseInt(date.getMonth()+1);
      }

      date=""+date.getFullYear()+"-"+month+"-"+day;
      if($("html").hasClass("edit-fair")){
        html+="<FEIR_COD>"+parseInt(this.fairval.FEIR_COD)+"</FEIR_COD>";
        elem.each(function(a,b){
          if($(b).hasClass("bselect")){
            html+="<"+$(b).attr("name")+">"+$(b).find("option:selected").val().replace(' ',"")+"</"+$(b).attr("name")+">";
          }
          else{
            html+="<FEIR_DESC>"+$(b).val()+"</FEIR_DESC>";
          }9
        });
        html+="<CREATE_DATE>"+date+"</CREATE_DATE>";
        html+="<FEIR_INATIVO>"+$(".ai-holder .sel").attr("name")+"</FEIR_INATIVO>";
        this.callService("gravarLocal",html,"U");
      }
      else{
        html+="<FEIR_COD></FEIR_COD>";
        elem.each(function(a,b){
          if($(b).hasClass("bselect")){
            html+="<"+$(b).attr("name")+">"+$(b).find("option:selected").val().replace(' ',"")+"</"+$(b).attr("name")+">";
          }
          else{
            html+="<FEIR_DESC>"+$(b).val()+"</FEIR_DESC>";
          }
        });
        html+="<CREATE_DATE>"+date+"</CREATE_DATE>";
        this.callService("gravarLocal",html,"I");
      }
    },

    /**
    * `This method call a service to delete a fair`
    * @memberOf App#
    */
    deleteFair:function(){
      var html="";
      html+="<FEIR_COD>"+parseInt(this.fairval.FEIR_COD)+"</FEIR_COD>"+"<CREATE_DATE>"+"2015-12-12"+"</CREATE_DATE>";
      this.callService("gravarLocal",html,"D");
    },

    /**
    * `This method is called when the user click on filter not-autoshow's button, this method just set a class to the clicked element.`
    * @memberOf App#
    * @param {event} a. The click event.
    */
    showPicker:function(a){
      if($(a.target).hasClass("sel")){
        $(a.target).removeClass("sel");
        return !1;
      }
      $(a.target).addClass("sel");
      if($(a.target).hasClass('refine-filter')){
        this.filter.checklist(this.data);
      }
    },

    /**
    * `This method is called when the user do a filter by date.
    * `This method take the input's date values and apply to a new request in the web service
    * @memberOf App#
    * @param {event} a. The click event.
    */
    submitDateFilter:function(a){
      this.setloading(!0,!1);
      this.fairval=$(".bselect.fair").find("option:selected").val();
      this.fornval=this.bforn.val();
      this.fornclick=this.fornval;
      this.amosval=$(".form-control-search").val();
      this.reset();
      
      this.resetFilters();
      switch (this.page){
        case "fornecedores":
          this.initialTimeForn=$("input[name='initial_date']").val() || null;
          this.endTimeForn=$("input[name='end_date']").val() || null;
          if(this.cookiefornecedores.length){
            //debugger;
            this.cookiefornecedores[0].posscroll=0;
          }
          if(!this.fairval && !this.fornval){
            var vprincipal="";
            if(typeof this.cadprincipal !== "undefined"){
              vprincipal="<CONT_PRINCIPAL>"+this.cadprincipal+"</CONT_PRINCIPAL>";
            }
            this.mode="fornecedores/"+"padrao"+"/"+"padrao"+"/"+"padrao";
            this.navigate(this.mode, !1);
            this.callService("fornecedores",'<FEIR_COD>'+this.fairval+'</FEIR_COD>','<LINHA_I>1</LINHA_I>','<LINHA_F>20000</LINHA_F>',(this.initialTimeForn ? '<CREATE_DATE_I>'+this.initialTimeForn+'</CREATE_DATE_I>' : ""),(this.endTimeForn ? '<CREATE_DATE_F>'+this.endTimeForn+'</CREATE_DATE_F>' : ""),vprincipal);
            //this.modal.open("message","Selecione ao menos uma feira para filtrar!!!",!1,!0);
            return !0;
          }

          this.savingCookie(this.page);

          this.mode="fornecedores/"+(this.fairval || "padrao")+"/"+(this.fornval || "padrao")+"/"+(this.amosval || "padrao");
          this.navigate(this.mode, !1);
          this.callService("fornecedores",'<FORN_DESC>'+this.fornval+'</FORN_DESC>','<FEIR_COD>'+this.fairval+'</FEIR_COD>','<LINHA_I>'+(this.content.page*20+1)+'</LINHA_I>','<LINHA_F>20000</LINHA_F>',(this.initialTimeForn ? '<CREATE_DATE_I>'+this.initialTimeForn+'</CREATE_DATE_I>' : ""),(this.endTimeForn ? '<CREATE_DATE_F>'+this.endTimeForn+'</CREATE_DATE_F>' : ""),vprincipal);
          break;
        case "amostras":
          this.initialTimeAmos=$("input[name='initial_date']").val() || null;
          this.endTimeAmos=$("input[name='end_date']").val() || null;
          if(this.cookieamostras.length){
            //debugger;
            this.cookieamostras[0].posscroll=0;
          }
          if(!this.fairval && !this.fornval && !this.amosval){
            //this.mode="amostras/"+"padrao"+"/"+"padrao"+"/"+"padrao";
            //this.navigate(this.mode, !1);
            this.callService("amostras",'<FEIR_COD>'+this.fairval+'</FEIR_COD>','<LINHA_I>1</LINHA_I>','<LINHA_F>20000</LINHA_F>',(this.initialTimeAmos ? '<CREATE_DATE_I>'+this.initialTimeAmos+'</CREATE_DATE_I>' : ""),(this.endTimeAmos ? '<CREATE_DATE_F>'+this.endTimeAmos+'</CREATE_DATE_F>' : ""));
            //this.modal.open("message","Selecione ao menos uma feira para filtrar!!!",!1,!0);
            return !0;
          }
          var FORN_DESC=this.fornval;
          if(FORN_DESC){
            if(FORN_DESC.slice(0, 3) === "alt"){
              FORN_DESC=FORN_DESC.slice(3,(FORN_DESC.length));
            }
            FORN_DESC="<FORN_DESC>"+FORN_DESC+"</FORN_DESC>";
          }
          else{
            FORN_DESC="";
          }

          this.savingCookie(this.page);

          this.mode="amostras/"+(this.fairval || "padrao")+"/"+(this.fornval || "padrao")+"/"+(this.amosval || "padrao");
          this.navigate(this.mode, !1);
          this.callService("amostras",'<AMOS_DESC>'+this.amosval+'</AMOS_DESC>','<FEIR_COD>'+this.fairval+'</FEIR_COD>',FORN_DESC,'<LINHA_I>'+(this.content.page*20+1)+'</LINHA_I>','<LINHA_F>20000</LINHA_F>',(this.initialTimeAmos ? '<CREATE_DATE_I>'+this.initialTimeAmos+'</CREATE_DATE_I>' : ""),(this.endTimeAmos ? '<CREATE_DATE_F>'+this.endTimeAmos+'</CREATE_DATE_F>' : ""));
          break;
      }
      $(".date-filter").removeClass("sel");
    },

    /**
    * `This method is called when the user click in one of the shortcut itens of a sample in result's page 
    * `This method set: "Favorite", "approved", "physical". This method call "gravarAmostras", passing the updated values.
    * @memberOf App#
    * @param {event} a. The click event.
    */
    SetItemAmos:function(ev){
      var el=$(ev.target);
      var item=[],result,pattern="",html="";
      if(this.page === "amostras"){
        item=this.data.filter(function(a,b){
          if(a.AMOS_ID == el.attr("name")){
            return a;
          }
        });
        item=item[0];
      }
      else{
        item=this.detail.item;
      }
      if(el.hasClass("has")){
        el.removeClass("has").addClass("nothas");
      }
      else{
        el.removeClass("nothas").addClass("has");
      }

      switch (el.attr("title")){
        case "Fisica":
          result= el.hasClass("has") ? 1 : 0;
          item.FLAG_FISICA=result;
          html+="<FLAG_PRIORIDADE>"+item.FLAG_PRIORIDADE+"</FLAG_PRIORIDADE><AMOS_HOMOLOGAR>"+item.AMOS_HOMOLOGAR+"</AMOS_HOMOLOGAR><FLAG_FISICA>"+result+"</FLAG_FISICA>";
          break;
        case "Homologar":
          result= el.hasClass("has") ? 1 : 0;
          item.AMOS_HOMOLOGAR=result;
          html+="<FLAG_PRIORIDADE>"+item.FLAG_PRIORIDADE+"</FLAG_PRIORIDADE><AMOS_HOMOLOGAR>"+result+"</AMOS_HOMOLOGAR><FLAG_FISICA>"+item.FLAG_FISICA+"</FLAG_FISICA>";
          break;
        case "Favoritar":
          result= el.hasClass("has") ? 1 : 0;
          item.FLAG_PRIORIDADE=result;
          html+="<FLAG_PRIORIDADE>"+result+"</FLAG_PRIORIDADE><AMOS_HOMOLOGAR>"+item.AMOS_HOMOLOGAR+"</AMOS_HOMOLOGAR><FLAG_FISICA>"+item.FLAG_FISICA+"</FLAG_FISICA>";
          break;
        default:
          return !1;
      }
      pattern="<AMOS_ID>"+item.AMOS_ID+"</AMOS_ID><FORN_ID>"+item.FORN_ID+"</FORN_ID><FEIR_COD>"+parseInt(item.FEIR_COD)+"</FEIR_COD><USU_COD>"+item.USU_COD+"</USU_COD><AMOS_DESC>"+item.AMOS_DESC+"</AMOS_DESC><AMOS_LARGURA_TOTAL>"+item.AMOS_LARGURA_TOTAL+"</AMOS_LARGURA_TOTAL><AMOS_LARGURA_UTIL>"+item.AMOS_LARGURA_UTIL+"</AMOS_LARGURA_UTIL><AMOS_GRAMATURA_M>"+item.AMOS_GRAMATURA_M+"</AMOS_GRAMATURA_M><AMOS_GRAMATURA_ML>"+item.AMOS_GRAMATURA_ML+"</AMOS_GRAMATURA_ML><AMOS_ONCAS>"+item.AMOS_ONCAS+"</AMOS_ONCAS><AMOS_COTACAO_M>"+item.AMOS_COTACAO_M+"</AMOS_COTACAO_M><AMOS_COTACAO_KG>"+item.AMOS_COTACAO_KG+"</AMOS_COTACAO_KG><AMOS_STATUS>"+item.AMOS_STATUS+"</AMOS_STATUS><AMOS_ENV_EMAIL>"+item.AMOS_ENV_EMAIL+"</AMOS_ENV_EMAIL><AMOS_PRECO_UM>"+item.AMOS_PRECO_UM+"</AMOS_PRECO_UM><AMOS_PRECO>"+item.AMOS_PRECO+"</AMOS_PRECO><TECI_COD>"+(item.TECI_COD || "")+"</TECI_COD><BASE_COD>"+(item.BASE_COD || "")+"</BASE_COD><GRUP_COD>"+(item.GRUP_COD || "")+"</GRUP_COD><SUBG_COD>"+(item.SUBG_COD || "")+"</SUBG_COD><SEGM_COD>"+item.SEGM_COD+"</SEGM_COD><CREATE_DATE>"+"2015-01-01"+"</CREATE_DATE>";
      this.setloading(!0,!1);
      this.callService("gravarAmostras",pattern,html,'U');
    },

    /**
    * `This method is called when the user select a sample to edit or send a email for example.
    * `When has a select event, this method add that sample to select_items array to be used after.
    * @memberOf App#
    * @param {event} a. The click event.
    */
    selectItem:function(a){
      var context=this;
      a.preventDefault();
      if($(a.target).hasClass("sel")){
        this.select_items = this.select_items.filter(function(element,i){
          if(element.AMOS_ID !== parseInt($(a.target).attr("name"))){
            return {
              'AMOS_DESC':element.AMOS_DESC,
              'AMOS_ID':element.AMOS_ID,
              'FORN_ID':element.FORN_ID,
            };
          }
        });
      }
      else{
        this.data.filter(function(element,i){
          if(element.AMOS_ID === parseInt($(a.target).attr("name"))){
            context.select_items.push({
              'AMOS_DESC':element.AMOS_DESC,
              'AMOS_ID':element.AMOS_ID,
              'FORN_ID':element.FORN_ID,
            });
          }
        });
      }
      $(a.target).toggleClass("sel");
      if($(a.target).attr("bselection-edit")){
        this.action_name="edit";
      }
      else{
        this.action_name="select";
      }
    },
    /**
    * `This method is called when the user change the view image or list
    * `The method add and remove the sel class and call setdata method
    * @memberOf App#
    * @param {event} a. The click event.
    */
    changeview : function(a) {
      if ("object" === typeof a) {
          a.preventDefault(), a = $(a.target);
      } else {
          return !1;
      }
      /*if (this.loading){
              return !1;
      }*/ 
      $(".thumbnail .icon").attr("class","icon");
      $("html").attr("class","amostras");
      this.select_items.length=0;
      if(this.page === "amostras"){
        //debugger;
        this.cookieamostras[0].posscroll=0;
        this.content.page=0;
      }
      a.hasClass("sel") || (this.viewBtn.removeClass("sel"), a.addClass("sel"), this.view = a.attr('alt'), this.setdata(this.data, "amostras"));
    },
    /**
    * `This method has a list of all useful webservices in a soap structure, execute a request to a webservice and call a callback method
    * @memberOf App#
    * @param {String} name. The name of the web service to be requested.
    * @param {String} a. One of the parameters to a web service being requested.
    * @param {String} b. One of the parameters to a web service being requested.
    * @param {String} c. One of the parameters to a web service being requested.
    * @param {String} d. One of the parameters to a web service being requested.
    * @param {String} e. One of the parameters to a web service being requested.
    * @param {String} f. One of the parameters to a web service being requested.
    * @param {String} g. One of the parameters to a web service being requested.
    */
    callService:function(name,a,b,c,d,e,f,g){
        var core=this;
        var soapRequest=[
          {
            //FEIR_COD e FORN_ID are optional fields
            'name':'amostras',
            'serviceName':'ListarAmostras',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ListarAmostras xmlns="http://tempuri.org/">'+a+''+b+''+c+''+d+''+e+''+f+''+g+'<SEGM_COD>'+(core.usr.SEGM_COD === "TD" ? "" : core.usr.SEGM_COD)+'</SEGM_COD></ListarAmostras></soap:Body></soap:Envelope>',
            callback:function(data,req){
              core.convertData(data,req,name);
            }
          },
          {
            //FEIR_COD e FORN_ID are optional fields
            'name':'singleSample',
            'serviceName':'ListarAmostras',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ListarAmostras xmlns="http://tempuri.org/">'+a+''+b+''+c+''+d+''+e+''+f+'<SEGM_COD>'+(core.usr.SEGM_COD === "TD" ? "" : core.usr.SEGM_COD)+'</SEGM_COD></ListarAmostras></soap:Body></soap:Envelope>',
            callback:function(data,req){
              var item=jQuery.parseJSON($(req.responseXML).text()).unique();
              this.setDate(item);
              return core.detail.open(item[0]);
            }
          },
          {
            'name':'delete',
            'serviceName':'GravarAnotacao',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GravarAnotacao xmlns="http://tempuri.org/"><note><NOTA_ID>'+a+'</NOTA_ID><USU_COD>'+b+'</USU_COD><PLAT_ID>2</PLAT_ID><CREATE_DATE>2016-07-08</CREATE_DATE></note><action>D</action></GravarAnotacao></soap:Body></soap:Envelope>',
            'callback':null
          },
          {
            'name':'local',
            'serviceName':'ListarFeiras',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ListarFeiras xmlns="http://tempuri.org/">'+a+''+b+''+c+'</ListarFeiras></soap:Body></soap:Envelope>',
            callback:function(data,req){
              core.convertData(data,req,name);
            }
          },
          {
            'name':'gravarLocal',
            'serviceName':'GravarFeira',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GravarFeira xmlns="http://tempuri.org/"><fair>'+a+'</fair><action>'+b+'</action></GravarFeira></soap:Body></soap:Envelope>',
            callback:function(data,req){
              this.modal.open("message","Local Salvo com Sucesso!!!",!1,!0);
              window.location.reload();
            }
          },
          {
            'name':'fornecedores',
            'serviceName':'ListarFornecedores',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ListarFornecedores xmlns="http://tempuri.org/">'+a+''+b+''+c+''+d+''+e+''+f+g+'<SEGM_COD>'+core.usr.SEGM_COD+'</SEGM_COD></ListarFornecedores></soap:Body></soap:Envelope>',
            callback:function(data,req){
              core.convertData(data,req,name,!0);
            }
          },
          {
            'name':'singleForn',
            'serviceName':'ListarFornecedores',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ListarFornecedores xmlns="http://tempuri.org/">'+a+'</ListarFornecedores></soap:Body></soap:Envelope>',
            callback:function(data,req){
              return core.fornecedores.open(jQuery.parseJSON($(req.responseXML).text()).unique()[0]);
            }
          },
          {
            'name':'combosearch',
            'serviceName':'ListarFornecedores',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ListarFornecedores xmlns="http://tempuri.org/">'+a+''+b+''+c+''+d+''+e+''+f+'<SEARCH_TYPE>1</SEARCH_TYPE></ListarFornecedores></soap:Body></soap:Envelope>',
            callback:function(data,req){
              core.convertData(data,req,name);
            }
          },
          {
            'name':'email_fornecedor',
            'serviceName':'ListarFornecedores',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ListarFornecedores xmlns="http://tempuri.org/">'+a+''+b+''+c+''+d+''+e+''+f+'</ListarFornecedores></soap:Body></soap:Envelope>',
            callback:function(data,req){
              core.convertData(data,req,name);
            }
          },
          {
            'name':'cities',
            'serviceName':'ListarRegioes',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ListarRegioes xmlns="http://tempuri.org/">'+a+''+b+''+c+''+d+'</ListarRegioes></soap:Body></soap:Envelope>',
            callback:function(data,req){
              core.convertData(data,req,name);
            }
          },
          {
            'name':'gravarAmostras',
            'serviceName':'GravarAmostra',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GravarAmostra xmlns="http://tempuri.org/"><sample>'+a+''+b+'</sample><action>'+c+'</action></GravarAmostra></soap:Body></soap:Envelope>',
            'callback':function(){
              if(d !== "PROMISSE"){
                core.setloading(!1);
              }
            }
          },
          {
            'name':'gravarNotes',
            'serviceName':'GravarAnotacao',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GravarAnotacao xmlns="http://tempuri.org/"><note><NOTA_ID>0</NOTA_ID>'+a+'<PLAT_ID>2</PLAT_ID>'+b+'</note><action>I</action></GravarAnotacao></soap:Body></soap:Envelope>',
            'callback':function(){
              switch (core.page){
                case "detail":
                  core.detail.writeNote();
                  break;
                case "fornecedor_cadastro":
                  core.fornecedores.writeNote();
                  break;
              }    
            }
          },
          {
            'name':'gravarAmostraComposicao',
            'serviceName':'GravarAmostraComposicao',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GravarAmostraComposicao xmlns="http://tempuri.org/"><AMOS_ID>'+a+'</AMOS_ID><compositions>'+b+'</compositions></GravarAmostraComposicao></soap:Body></soap:Envelope>',
            'callback':function(){
              if(c !== "PROMISSE"){
                core.setloading(!1);
              }
            }
          },
          {
            'name':'listarSegmentos',
            'serviceName':'ListarSegmentos',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ListarSegmentos xmlns="http://tempuri.org/"><SEGM_COD></SEGM_COD></ListarSegmentos></soap:Body></soap:Envelope>',
            'callback':function(data,req){
              core.convertData(data,req,name);
            }
          },
          {
            'name':'GravarFornecedor',
            'serviceName':'GravarFornecedor',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GravarFornecedor xmlns="http://tempuri.org/"><supplier>'+a+''+b+''+c+''+d+'<PLAT_ID>2</PLAT_ID></supplier>'+e+'</GravarFornecedor></soap:Body></soap:Envelope>',
            'callback':function(data,req){
              core.setloading(!1);
            }
          },
          {
            'name':'GravarFornecedorContato',
            'serviceName':'GravarFornecedorContato',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GravarFornecedorContato xmlns="http://tempuri.org/"><contact>'+a+''+b+''+c+'<PLAT_ID>2</PLAT_ID></contact>'+d+'</GravarFornecedorContato></soap:Body></soap:Envelope>',
            'callback':function(data,req){
              if(core.page === "fornecedor_cadastro"){
                core.setloading(!1);
              }
            }
          },
          {
            'name':'GravarFornecedorFavorito',
            'serviceName':'GravarFornecedorFavorito',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GravarFornecedorFavorito xmlns="http://tempuri.org/">'+a+'<USU_COD>'+core.usr.USU_COD+'</USU_COD><segments>'+b+'</segments></GravarFornecedorFavorito></soap:Body></soap:Envelope>',
            'callback':function(data,req){
              core.setloading(!1);
            }
          },
          {
            'name':'GravarFornecedorProfile',
            'serviceName':'GravarFornecedorProfile',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GravarFornecedorProfile xmlns="http://tempuri.org/">'+a+'<profiles>'+b+'</profiles></GravarFornecedorProfile></soap:Body></soap:Envelope>',
            'callback':function(data,req){
              if(core.page === "fornecedor_cadastro"){
                core.setloading(!1);
              }
            }
          },
          {
            'name':'GravarFornecedorComposicao',
            'serviceName':'GravarFornecedorComposicao',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GravarFornecedorComposicao xmlns="http://tempuri.org/">'+a+'<compositions>'+b+'</compositions></GravarFornecedorComposicao></soap:Body></soap:Envelope>',
            'callback':function(data,req){
              if(core.page === "fornecedor_cadastro"){
                core.setloading(!1);
              }
            }
          },
          {
            'name':'GravarFornecedorProduto',
            'serviceName':'GravarFornecedorProduto',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GravarFornecedorProduto xmlns="http://tempuri.org/">'+a+'<products>'+b+'</products></GravarFornecedorProduto></soap:Body></soap:Envelope>',
            'callback':function(data,req){
              if(core.page === "fornecedor_cadastro"){
                core.setloading(!1);
              }
            }
          },
          {
            'name':'GravarFornecedorMercado',
            'serviceName':'GravarFornecedorMercado',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GravarFornecedorMercado xmlns="http://tempuri.org/">'+a+'<markets>'+b+'</markets></GravarFornecedorMercado></soap:Body></soap:Envelope>',
            'callback':function(data,req){
              if(core.page === "fornecedor_cadastro"){
                core.setloading(!1);
              }
            }
          },
          {
            'name':'template_email',
            'serviceName':'listarTemplates',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ListarEmailTemplates xmlns="http://tempuri.org/">'+a+''+b+'</ListarEmailTemplates></soap:Body></soap:Envelope>',
            callback:function(data,req){
              core.convertData(data,req,name);
            }
          },
          {
            'name':'gravarTemplate',
            'serviceName':'gravarTemplate',
            'code':'<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GravarEmailTemplate xmlns="http://tempuri.org/"><template>'+a+''+b+'</template>'+c+'</GravarEmailTemplate></soap:Body></soap:Envelope>',
            'callback':function(data,req){
              if(c === "<action>D</action>"){
                core.modal.open("message","Template de email excluído com sucesso!!!",!1,!1);
              }
              else{
                core.modal.open("message","Template de email salvo com sucesso!!!",!1,!1);
                if(core.page === "template_cadastro"){
                  window.location.reload();
                }
              }
            }
          },
        ];

        $.support.cors=true;
        soapRequest.filter(function(a,b){
          if(a['name'] === name){
            console.log(a['code']);
            core.callback=a['callback'];
            core.ajaxrequest=!0;                                                                        
            $.ajax({
                type: "POST",
                url: nodePath+a['serviceName'],
                contentType: "text/xml; charset=utf-8",
                dataType: "xml",
                crossDomain: true,
                context: core,
                data: a['code'],
                success: core.callRequest,
                error: core.processError
            });
          }
        });
    },
    /**
    * `This method is a first way to call the requester of web services
    * `Its called and changeFair, filterForn and others
    * @memberOf App#
    * @param {String} a. To say if need a reset of content or not and is a param to WebService in soap format
    * @param {String} b. A param to WebService in soap format
    * @param {String} c. A param to WebService in soap format
    * @param {String} d. A param to WebService in soap format
    * @param {String} fstatus. A param to WebService in soap format
    * @param {String} fprincipal. A param to WebService in soap format
    */
    submit:function(a,b,c,d,fstatus,fprincipal){
      var status,vprincipal,core=this;
      var b=b || "";
      var c=c || "";
      status=setInterval(function(){
        if(!core.ajaxrequest){
          //console.log("STATUS: "+core.ajaxrequest);

          core.ajaxrequest=!1;
          clearInterval(status);
          if(!d){
            core.reset();
          }
          if(core.page ===  "amostras"){
            //core.callService(core.page,a,b,c,'<LINHA_I>'+(core.content.page*core.itens_by_page+1)+'</LINHA_I>','<LINHA_F>'+((core.content.page+1)*core.itens_by_page)+'</LINHA_F>','<CREATE_DATE_I>'+core.initialTime+'</CREATE_DATE_I>',"<CREATE_DATE_F>"+core.endTime+"</CREATE_DATE_F>");
            $("select.AMOS_SEGM_COD").find("option").each(function(index, el) {
              if($(el).attr("value") === core.segmval){
                $(el).attr('selected', 'selected');
              }
            });
            core.callService(core.page,a,b,c,'<LINHA_I>'+(core.content.page*core.itens_by_page+1)+'</LINHA_I>','<LINHA_F>20000</LINHA_F>',(core.initialTimeAmos ? '<CREATE_DATE_I>'+core.initialTimeAmos+'</CREATE_DATE_I>' : ""),(core.endTimeAmos ? '<CREATE_DATE_F>'+core.endTimeAmos+'</CREATE_DATE_F>' : ""));
          }
          else{
            if(typeof fstatus !== "undefined"){
              fstatus="<FORN_STATUS>"+fstatus+"</FORN_STATUS>";
            }
            else{
              fstatus="";
            }
            if(typeof fprincipal !== "undefined"){
              vprincipal="<CONT_PRINCIPAL>"+fprincipal+"</CONT_PRINCIPAL>";
            }
            else{
              vprincipal="";
            }

            $("input[name='initial_date']").datepicker('setDate', (core.initialTimeForn && core.initialTimeForn.slice(0,4)+'-'+core.initialTimeForn.slice(5, 7)+"-"+core.initialTimeForn.slice(8, 10)));
            $("input[name='end_date']").datepicker('setDate', (core.endTimeForn && core.endTimeForn.slice(0,4)+'-'+core.endTimeForn.slice(5, 7)+"-"+core.endTimeForn.slice(8, 10)));
            
            $("select[name='FORN_STATUS']").find("option").each(function(index, el) {
              if($(el).attr("value").bool() === core.cadstatus){
                $(el).attr('selected', 'selected');
              }
            });

            $("select[name='CONT_PRINCIPAL']").find("option").each(function(index, el) {
              if($(el).attr("value") === core.cadprincipal){
                $(el).attr('selected', 'selected');
              }
            });
            core.callService(core.page,a,b,fstatus,'<LINHA_I>'+(core.content.page*core.itens_by_page+1)+'</LINHA_I>','<LINHA_F>'+((core.content.page+1)*core.itens_by_page)+'</LINHA_F>',(core.initialTimeForn ? '<CREATE_DATE_I>'+core.initialTimeForn+'</CREATE_DATE_I>' : "")+(core.endTimeForn ? '<CREATE_DATE_F>'+core.endTimeForn+'</CREATE_DATE_F>' : ""),vprincipal);
            //core.callService(core.page,a,b,'<LINHA_I>'+(core.content.page*core.itens_by_page+1)+'</LINHA_I>','<LINHA_F>20000</LINHA_F>','<CREATE_DATE_I>'+core.initialTime+'</CREATE_DATE_I>',"<CREATE_DATE_F>"+core.endTime+"</CREATE_DATE_F>");
          }
        }
      },100);
    },
    /**
    * `This method is called on blue and press into input-search
    * @memberOf App#
    * @param {event} a. The blur or keypress event.
    */
    search:function(a){
      var search;
      var forn_desc=this.fornval || "";
      this.itens_by_page=this.itens_page_default;

      if(isNaN(forn_desc)){
        if(forn_desc.slice(0, 3) === "alt"){
          forn_desc=forn_desc.slice(3,(forn_desc.length));
        }
        forn_desc="<FORN_DESC>"+forn_desc+"</FORN_DESC>";
      }
      else{
        if(forn_desc.length){
          forn_desc="<FORN_ID>"+forn_desc+"</FORN_ID>";
        }
        else{
          forn_desc="";
        }
      }


      var fair_id="<FEIR_COD>"+this.fairval+"</FEIR_COD>";
      if(13 === a.keyCode){
        if(isNaN($(a.target).val())){
          search="<AMOS_DESC>"+$(a.target).val()+"</AMOS_DESC>";
        }
        else if(!$(a.target).val().length){
          search="";
        }
        else{
          search="<AMOS_ID>"+$(a.target).val()+"</AMOS_ID>";
        } 
        this.amosval=$(a.target).val();
        this.setloading(!0,!1);
        this.mode="amostras/"+((""+this.fairval).replace(" ","_") || "padrao")+"/"+(this.fornval.replace(" ","_") || "padrao")+"/"+($(a.target).val().replace(" ","_") || "padrao");
        this.navigate(this.mode, !1);
        this.submit(fair_id,forn_desc,search);
      }
    },
    /**
    * `This method is called when the request in CallService return an error
    * @memberOf App#
    * @param {Object} data. The object return]
    * @param {Int} status. Status of the return, like 500 to error
    * @param {String} req. The name of the error
    */
    processError:function(data, status, req){
      this.ajaxrequest=!1;
      this.fornecedores.ajaxrequest=!1;
      if(this.page === "fornecedor_cadastro"){
        //This condicional code is used now because I need that the web service be fixed to receive special caracteres like in supplier's name.
        //Then in order to avoid be showing erros to user in gravarFornecedor Web Service, I don't show any error message in supplier's cad page.
        return !0;
      }
      if(data.status === 500){
        return this.modal.open("message","Servidor instável, tente novamente ou aguarde alguns instantes!!!",!1,!0), this.setloading(!1);
      }
      else{
        return this.modal.open("message","Um erro ocorreu!!!",!1,!0), this.setloading(!1);
      }      
    },
    /**
    * `This method is called after the return of callService to set the data and call a method to write the itens on the page.
    * @memberOf App#
    * @param {Array} data. The list of object to write on page
    * @param {String} b. The page name to switch
    */
    setdata:function(a,b){  
      var i,length;
      //this.content.page = 0;
      

      if (!this.data.length && b !="local") {    
        return this.modal.open("message","Nenhum Item Encontrado!!!",!1,!0), $(".overview-container").remove(),$('<div class="brea"></div>d-search').find(".spec").text("0 Resultados"),this.page === "amostras" ? $("input[name='initial_date']").datepicker('setDate', (this.initialTimeAmos && this.initialTimeAmos.slice(0,4)+'-'+this.initialTimeAmos.slice(5, 7)+"-"+this.initialTimeAmos.slice(8, 10))) && $("input[name='end_date']").datepicker('setDate', (this.endTimeAmos && this.endTimeAmos.slice(0,4)+'-'+this.endTimeAmos.slice(5, 7)+"-"+this.endTimeAmos.slice(8, 10))) :$("input[name='initial_date']").datepicker('setDate', (this.initialTimeAmos && this.initialTimeAmos.slice(0,4)+'-'+this.initialTimeAmos.slice(5, 7)+"-"+this.initialTimeAmos.slice(8, 10))) && $("input[name='end_date']").datepicker('setDate', (this.endTimeAmos && this.endTimeAmos.slice(0,4)+'-'+this.endTimeAmos.slice(5, 7)+"-"+this.endTimeAmos.slice(8, 10))), this.setloading(!1);
      }  
      switch(b){
        case 'amostras':
          //this.data = a.sortBy(this.nsort);
          //debugger;
          this.data = a;
          console.dir(a);
          this.content.changeview(this.view);
          //this.filter.checklist(a);
          //$(".changeview button.b"+this.view);
          if(!$(".changeview button.sel").hasClass('b'+this.view)){
            $(".changeview button").removeClass('sel');
            $(".changeview button.b"+this.view).addClass('sel');
          }
          if(!this.cookieamostras.length){
            this.savingCookie(this.page);
          }

          //REOPEN
          //this.createbox(this.data, this.content.page, !0);
          this.reopenFilter(this.data, this.content.page, !0);
          break;
        case 'template':
          this.data = a.sortBy("TEMP_ID");
          this.content.changeview("list");
          this.filterTemplate();
          break;
        case 'fornecedores':
          if(this.initialTimeForn !== null || this.endTimeForn !== null){
            $(".date-filter").parent().addClass('has');
          }
          else{
            $(".date-filter").parent().removeClass('has');
          }
          $("input[name='initial_date']").datepicker('setDate', (this.initialTimeForn && this.initialTimeForn.slice(0,4)+'-'+this.initialTimeForn.slice(5, 7)+"-"+this.initialTimeForn.slice(8, 10)));
          $("input[name='end_date']").datepicker('setDate', (this.endTimeForn && this.endTimeForn.slice(0,4)+'-'+this.endTimeForn.slice(5, 7)+"-"+this.endTimeForn.slice(8, 10)));

          this.data = a.sortBy("FORN_ID");
          console.dir(this.data);
          this.content.changeview("list");
          if(!this.cookiefornecedores.length){
            var scroll={
              "fornval":''+this.fornval,
              "fairval":''+this.fairval,
              "amosval":''+this.amosval,
              "fornclick":''+this.fornclick,
              "dates":[this.initialTimeForn,this.endTimeForn],
              "prices":this.prices,
              "refine":this.filter.list,
              "combofilter":this.combofilter,
              "fstatus":this.cadstatus,
              "cadprincipal":this.cadprincipal,
              "nsort":this.nsort,
              "view":""+this.view,
              "segmval":this.segmval,
              "posscroll":0,
              "total":(this.total || 20)
            };
            $.cookie.json = !0;
            this.cookiefornecedores=[];
            this.cookiefornecedores.push(scroll);
          }
          this.createbox(this.data, this.content.page, !0,"list");
          break;
        case 'local':
          this.content.changeview("list");
          this.createbox(a, this.content.page, !0,"list");
          break;
        default:
          //console.log("ALGO ERRADO");
      }
      ("images" !== this.view) ? this.scroll($(".container-fullsize.scroller")) : this.scroll();      
    },
    callRequest:function(data, status, req){
        var query;
        this.ajaxrequest=!1;
        this.fornecedores.ajaxrequest=!1;
        if (status == "success") {
          if(this.page === "fornecedor_cadastro" && jQuery.parseJSON($(req.responseXML).text()).OBJ_ID){
            //console.log("salvou: "+jQuery.parseJSON($(req.responseXML).text()).OBJ_ID);
            query=data.URL.replace(stringServer,"");
            //console.log(query === "GravarAnotacao");
            if(query === "GravarFornecedor"){
              if(!this.fornecedores.item){
                this.fornecedores.item={};
              }
              //OBJ_ID
              this.fornecedores.item["FORN_ID"]=jQuery.parseJSON($(req.responseXML).text()).OBJ_ID;
            }
            else{
              this.fornecedores.noteid=jQuery.parseJSON($(req.responseXML).text()).OBJ_ID;
            }
          }
          if(this.page === "detail" && jQuery.parseJSON($(req.responseXML).text()).OBJ_ID){
            this.detail.noteid=jQuery.parseJSON($(req.responseXML).text()).OBJ_ID;
          }
          if(this.callback && "function" === typeof this.callback){
            this.callback(data,req);
          }
        }
    },
    convertData:function(data,req,what){
        var context=this;
        switch(what){
          case "amostras":
            if(!this.data.length){
              this.data=jQuery.parseJSON($(req.responseXML).text()).unique();
              this.data=this.data.filter(function(a,b){
                if(a.SEGM_COD === context.usr.SEGM_COD || context.usr.SEGM_COD === "TD"){
                  return a;
                }
              });
              this.setDate(this.data);
              this.setdata(this.data,"amostras");
            }
            else{
              if(this.nsort.length){
                var temp=jQuery.parseJSON($(req.responseXML).text()).unique().sortBy(this.nsort);
              }
              else{
                var temp=jQuery.parseJSON($(req.responseXML).text()).unique();
              }
              this.data=this.data.filter(function(a,b){
                if(a.SEGM_COD === context.usr.SEGM_COD || context.usr.SEGM_COD === "TD"){
                  return a;
                }
              });
              this.setDate(temp);
              this.data=this.data.concat(temp);

              //REOPEN
              //console.log("reopen: "+this.content.page);
              //this.createbox(this.data, this.content.page, !0);
              this.reopenFilter(this.data, this.content.page, !0);
            }
            break;
          case "local":
            this.fair.push(jQuery.parseJSON($(req.responseXML).text()).sortBy('FEIR_DESC').unique());
            this.fair=this.fair[0];
            //context.setdata(this.fair,"local");
            break;
          case "fornecedores":
            if(!this.data.length){
              this.data=jQuery.parseJSON($(req.responseXML).text());
              this.setDate(this.data);
              this.setdata(this.data,"fornecedores");
            }
            else{
              var temp=jQuery.parseJSON($(req.responseXML).text()).unique().sortBy('FORN_ID');
              /*console.dir(this.data);*/
              this.setDate(temp);
              console.dir(temp);
              this.data=this.data.concat(temp);
              console.dir(this.data);
              this.createbox(this.data, this.content.page, !0,"list");
            }
            break;
          case 'combosearch':
            this.spotlight.forn=[];
            this.spotlight.forn=jQuery.parseJSON($(req.responseXML).text()).sortBy('FORN_DESC').unique();
            //this.createComponent(this.forn,this.bforn,what);
            this.spotlight.open();
            break;
          case 'email_fornecedor':
            this.sendEmailGo(jQuery.parseJSON($(req.responseXML).text()).unique());
            break;
          case "cities":
            this.cities=jQuery.parseJSON($(req.responseXML).text());//.sortBy('FEIR_DESC').unique();
            this.createComponent(this.cities,this.bcity,what);
            break;
          case "listarSegmentos":
            this.setSegm(jQuery.parseJSON($(req.responseXML).text()));//.sortBy('FEIR_DESC').unique();
            break;
          case "template_email":
            var context=this;
            //console.log("convert");
            if(this.page === "template_email"){
              this.data=jQuery.parseJSON($(req.responseXML).text());//.sortBy('FEIR_DESC').unique();
              this.data=this.data.filter(function(a,b){
                if(a.SEGM_COD === context.usr.SEGM_COD || context.usr.SEGM_COD === "TD"){
                  return a;
                }
              });
              this.setdata(this.data,"template");
            }
            else{
              this.email=jQuery.parseJSON($(req.responseXML).text());//.sortBy('FEIR_DESC').unique();
              this.email=this.email.filter(function(a,b){
                if(a.SEGM_COD === context.usr.SEGM_COD || context.usr.SEGM_COD === "TD"){
                  return a;
                }
              });
            }
            break;
          default:
        }
    },
    showComboTemplateEmail:function(){
      //console.log("show");
    },
    setDate:function(list){
      var i,length;
      length=list.length;
      var dateReg = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
      //console.dir(list);
      for(i=0;i<length;i++){
        if(!dateReg.test(list[i].CREATE_DATE)){
          //Verifica se a data já está no formato dd/mm/yyyy, caso contrario converte-a
          list[i].CREATE_DATE=parseJsonDate(list[i].CREATE_DATE).toLocaleDateString();
        }
      }
    },
    createComponent:function(data,comp,what){
      var i,html="";
      switch (what){
        case "fair":
          html+="<option value=''>Local de Coleta: </option>";
          for(i=0;i<data.length;i++){
            if(data[i].FEIR_INATIVO === 0){
              html+="<option value='"+parseInt(data[i].FEIR_COD)+"'>"+data[i].FEIR_DESC+" - "+data[i].PAIS_COD+" - "+data[i].REGI_DESC+"</option>";
            }
          }
          break;
        case "fornecedores":
          html+="<option value=''>Fornecedores: </option>";
          for(i=0;i<data.length;i++){
            html+="<option value='"+data[i].FORN_ID+"'>"+data[i].FORN_DESC+"</option>";
          }
          break;
        case "cities":
          comp.empty();
          html+="<option value=''>Cidades: </option>";
          for(i=0;i<data.length;i++){
            html+="<option value='"+data[i].REGI_COD+"'>"+data[i].REGI_DESC+"</option>";
          }
          break;
        case "segm":
          comp.empty();
          html+="<option value=''>Segmentos: </option>";
          for(i=0;i<data.length;i++){
            html+="<option value='"+data[i].SEGM_COD+"'>"+data[i].SEGM_DESC+"</option>";
          }
          break;
      }
      comp.html(html);
    },
    createbox : function(a, b, d, c,length) {  
        var f, g, n, m,v;     
        var context=this; 
        c = c || this.view;
        n = "images" === c ? "li" : "tr";
        this.setloading(!0,!1);
        this.active = this.active || this.content;
        

        /*d = this.content.itens && !d ? this.content.itens.length : 0;
        m = 40 * (b + 1) < a.length ? 40 * (b + 1) : a.length;
        console.log("d: "+d);
        console.log("a.length: "+a.length);
        console.log("m: "+m);
        var p, h, q, k = 20*b, l = 20, e = this;
        console.log("l: "+l);
        console.log("k: "+k);
        console.log("d < a.length: "+(d < a.length));*/

        /*console.log("m: "+m);
        console.log("l: "+l);
        console.log("k: "+k);*/

        if(length){
          var i;
          m=((0+1)*length);
          var p, h, q, k = (0*length), l = length, e = this,countf=1;
          if (a[k]) {
            f = setInterval(function() {
                h = a[k];   
                if (!h) {

                    clearInterval(f);
                    e.setloading(!1);
                    if(e.page === "amostras"){
                      if(e.view === "images"){
                        var view_container=$(".overview-container");
                        view_container=$(view_container).eq(view_container.length-1);
                        view_container.find(".bread-search .spec").text(view_container.find(".viewport .thumbnail").length);
                      }
                      else{
                        var view_container=$(".overview-container");
                        view_container=$(view_container).eq(view_container.length-1);
                        //console.dir(view_container.find("tbody tr"));
                        view_container.find(".bread-search .spec").text(view_container.find("tbody tr").length);
                      }
                      if(e.cookieamostras.length){
                        //debugger;
                        //console.log("scroll: "+e.cookiefair[0].posscroll);
                        $(".container-fullsize.scroller").scrollTop(e.cookieamostras[0].posscroll);
                      }
                    }
                    else{
                      if(e.cookiefornecedores.length){
                        //debugger;
                        //console.log("scroll: "+e.cookiefair[0].posscroll);
                        $(".container-fullsize.scroller").scrollTop(e.cookiefornecedores[0].posscroll);
                      }
                    }
                    
                }

                if ("images" === c && l > 0) {
                  //console.log("images");

                    if (h && v === h.AMOS_ID){
                      l--;
                      k++;
                      return !1;
                    }

                    v = h.AMOS_ID || null; 
                    //Usando por enquanto o caminho para a imagem large, pois as amostras antigas eram salvas em tamanho muito pequeno
                    p = new Image, q = imgPath+h.IMG_PATH_SAMPLE, $(p).load(function() {
                        if (!l > 0)
                          return !1;

                        p.name=parseInt(h.FEIR_COD)+"/"+h.AMOS_ID;
                        g = new Box({
                            item : h,
                            view : c,
                            tag : n,
                            usr:e.usr,
                            unable_select:e.unable_select,
                            is_selected:e.is_selected,
                            fornidselect:e.fornidselect,
                            // reloadcart : e.proxy(e.reloadcart),
                            detail : e.detail,
                            url : this
                        });
                        e.active.create(g.render());
                        l--;
                        k++;
                    }).error(function() {

                        if (!l > 0)
                            return !1;
                        var a = new Image;
                        a.name=parseInt(h.FEIR_COD)+"/"+h.AMOS_ID;
                        a.src = "http://189.126.197.169/img/small/small_NONE.jpg";

                        g = new Box({
                            item : h,
                            view : c,
                            tag : n,
                            usr:e.usr,
                            unable_select:e.unable_select,
                            is_selected:e.is_selected,
                            fornidselect:e.fornidselect,
                            // reloadcart : e.proxy(e.reloadcart),
                            detail : e.detail,
                            url : a
                        });
                        e.active.create(g.render());
                        l--;
                        k++;
                    }).attr("src", q);

                    // Mostrando (box sendo carregados)
                    if(k === 0){
                      $(".overview").append('<div class="overview-container"><div class="filter-crumb"><p class="bread-search">Mostrando:<span class="spec">0</span><span> de </span><span class="specall">0</span><span> Amostras </span><span class="specforn"> de 0 Fornecedores</span></p><button type="button" class="bdefault select_all hide" name="'+h.FORN_ID+'">Selecionar Todos</button></div><ul class="viewport"></ul></div>');
                    }
                    else if(h.FORN_ID !== a[k-1].FORN_ID){
                      var view_container=$(".overview-container");
                      view_container=$(view_container).eq(view_container.length-1);
                      view_container.find(".bread-search .spec").text(view_container.find(".viewport .thumbnail").length);
                      $(".overview").append('<div class="overview-container"><div class="filter-crumb"><p class="bread-search">Mostrando:<span class="spec">0</span><span> de </span><span class="specall">0</span><span> Amostras </span><span class="specforn"> de 0 Fornecedores</span></p><button type="button" class="bdefault select_all hide" name="'+h.FORN_ID+'">Selecionar Todos</button></div><ul class="viewport"></ul></div>');
                      countf++;
                    }
 
                    var view_container=$(".overview-container");
                    view_container=$(view_container).eq(view_container.length-1);
                    view_container.find(".bread-search .spec").text(view_container.find(".viewport .thumbnail").length+1);
                    view_container.find(".bread-search .specall").text(a.length);
                    view_container.find(".bread-search .specforn").text("/ "+h.FORN_DESC);
                    //$('.bread-search').find(".spec").text(k+1+" de "+h.COUNT_AMOS+" Resultados / "+countf+" Fornecedores");
                } else {
                    if (l > 0) {
                      if(e.page === "amostras"){
                        if(k === 0){
                          var html='<div class="overview-container"><div class="filter-crumb"><p class="bread-search">Mostrando:<span class="spec">0</span><span> de </span><span class="specall">0</span><span> Amostras </span><span class="specforn"> de 0 Fornecedores</span></p><button type="button" class="bdefault select_all hide" name="'+h.FORN_ID+'">Selecionar Todos</button></div><table id="table" class="table-striped table-large"><thead><tr><th></th><th>Fornecedor</th><th>Código</th><th>Data</th>';
                          if(e.usr.SEGM_COD === "TD"){
                            html+='<th>Segmento</th>';
                          }
                          html+='<th><button type="button" class="caption-icons-icon justit bfisica nothas unable">Fisica</button></th><th>Preco Inicial</th><th>M/kg</th><th><button type="button" class="caption-icons-icon justit bfav nothas unable">Favorita</button></th><th><button type="button" class="caption-icons-icon justit bhomologado nothas unable">Homologada</button></th><th><button type="button" class="caption-icons-icon justit bnote">Anotacoes</button></th>'+/*<th><button type="button" class="icon bannex">Anexo</button></th>*/'<th><button type="button" class="caption-icons-icon justit bemail">Email</button></th><th>Tecimento</th><th>Base</th><th>Grupo</th><th>Sub-Grupo</th><th>Composicao</th><th class="tlast">Status</th></tr></thead><tbody></tbody></div>';
                          $(".floatThead").append(html);
                        }
                        else if(h.FORN_ID !== a[k-1].FORN_ID){
                          var html='<div class="overview-container"><div class="filter-crumb"><p class="bread-search">Mostrando:<span class="spec">0</span><span> de </span><span class="specall">0</span><span> Amostras </span><span class="specforn"> de 0 Fornecedores</span></p><button type="button" class="bdefault select_all hide" name="'+h.FORN_ID+'">Selecionar Todos</button></div><table id="table" class="table-striped table-large"><thead><tr><th></th><th>Fornecedor</th><th>Código</th><th>Data</th>';
                          if(e.usr.SEGM_COD === "TD"){
                            html+='<th>Segmento</th>';
                          }
                          html+='<th><button type="button" class="caption-icons-icon justit bfisica nothas unable">Fisica</button></th><th>Preco Inicial</th><th>M/kg</th><th><button type="button" class="caption-icons-icon justit bfav nothas unable">Favorita</button></th><th><button type="button" class="caption-icons-icon justit bhomologado nothas unable">Homologada</button></th><th><button type="button" class="caption-icons-icon justit bnote">Anotacoes</button></th>'+/*<th><button type="button" class="icon bannex">Anexo</button></th>*/'<th><button type="button" class="caption-icons-icon justit bemail">Email</button></th><th>Tecimento</th><th>Base</th><th>Grupo</th><th>Sub-Grupo</th><th>Composicao</th><th class="tlast">Status</th></tr></thead><tbody></tbody></div>';
                          var view_container=$(".overview-container");
                          view_container=$(view_container).eq(view_container.length-1);
                          view_container.find(".bread-search .spec").text(view_container.find("tbody tr").length);
                          $(".floatThead").append(html);
                          countf++;
                        }
                        var view_container=$(".overview-container");
                        view_container=$(view_container).eq(view_container.length-1);
                        view_container.find(".bread-search .spec").text(view_container.find("tbody tr").length+1);
                        view_container.find(".bread-search .specall").text(a.length);
                        view_container.find(".bread-search .specforn").text("/ "+h.FORN_DESC);
                      }

                      g = new Box({
                            item : h,
                            view : c,
                            tag : n,
                            detail : e.detail,
                            unable_select:e.unable_select,
                            is_selected:e.is_selected,
                            fornidselect:e.fornidselect,
                            modal : e.modal,
                            usr:e.usr,
                            page: e.page
                        });
                        //return 
                        e.active.create(g.render());
                        return $("tbody .bstar").unbind("click").bind("click",function(a){context.starForn(a)}),l--,k++;
                    } else {
                        if(e.page === "amostras"){
                          if(e.cookieamostras.length){
                            //debugger;
                            $(".container-fullsize.scroller").scrollTop(e.cookieamostras[0].posscroll);
                          }
                        }
                        else{
                          if(e.cookiefornecedores.length){
                            //debugger;
                            $(".container-fullsize.scroller").scrollTop(e.cookiefornecedores[0].posscroll);
                          }
                        }
                        clearInterval(f), e.setloading(!1);
                    }
                }
            }, 300);
          } else {
            //return setTimeout(function(){ e.setloading(!1); }, 3000),!1;
            return this.setloading(!1), !1;
          }
        }
        else{
          //console.log("ESCREVENDO SEM SORTBY");
          m=((this.content.page+1)*this.itens_by_page);
          var p, h, q, k = (this.content.page*this.itens_by_page), l = this.itens_by_page, e = this,countf=1;
          if (a[k]) {
            f = setInterval(function() {
                h = a[k];   
                if (!h) {
                    clearInterval(f);
                    e.setloading(!1);
                    if(e.page === "amostras"){
                      if(e.view === "images"){
                        var view_container=$(".overview-container");
                        view_container=$(view_container).eq(view_container.length-1);
                        view_container.find(".bread-search .spec").text(view_container.find(".viewport .thumbnail").length);
                      }
                      else{
                        var view_container=$(".overview-container");
                        view_container=$(view_container).eq(view_container.length-1);
                        view_container.find(".bread-search .spec").text(view_container.find("tbody tr").length);
                      }
                      if(e.cookieamostras.length){
                        //debugger;
                        $(".container-fullsize.scroller").scrollTop(e.cookieamostras[0].posscroll);
                      }
                    }
                    else if(e.page === "local"){
                      view_container.find(".bread-search .spec").text(k+1);
                    }
                    else if(e.page === "fornecedores"){
                      if(e.cookiefornecedores.length){
                        //debugger;
                        //console.log(e.cookiefornecedores[0].posscroll);
                        $(".container-fullsize.scroller").scrollTop(e.cookiefornecedores[0].posscroll);
                      }
                    }
                }

                if ("images" === c && l > 0) {
                  //console.log("images: "+h.AMOS_ID+" , "+h.AMOS_DESC+" , "+h.CONT_PRINCIPAL);

                    if (h && v === h.AMOS_ID){
                      l--;
                      k++;
                      return !1;
                    }
                      

                    v = h.AMOS_ID || null; 
                    //Usando por enquanto o caminho para a imagem large, pois as amostras antigas eram salvas em tamanho muito pequeno
                    p = new Image, q =imgPath+h.IMG_PATH_SAMPLE, $(p).load(function() {
                        if (!l > 0)
                            return !1;

                        p.name=parseInt(h.FEIR_COD)+"/"+h.AMOS_ID;
                        g = new Box({
                            item : h,
                            view : c,
                            tag : n,
                            usr:e.usr,
                            unable_select:e.unable_select,
                            is_selected:e.is_selected,
                            fornidselect:e.fornidselect,
                            // reloadcart : e.proxy(e.reloadcart),
                            detail : e.detail,
                            url : this
                        });
                        e.active.create(g.render());
                        l--;
                        k++;
                    }).error(function() {

                        if (!l > 0)
                            return !1;

                        var a = new Image;
                        a.name=parseInt(h.FEIR_COD)+"/"+h.AMOS_ID;
                        a.src = "http://189.126.197.169/img/small/small_NONE.jpg";

                        g = new Box({
                            item : h,
                            view : c,
                            tag : n,
                            usr:e.usr,
                            unable_select:e.unable_select,
                            is_selected:e.is_selected,
                            fornidselect:e.fornidselect,
                            // reloadcart : e.proxy(e.reloadcart),
                            detail : e.detail,
                            url : a
                        });
                        e.active.create(g.render());
                        l--;
                        k++;
                    }).attr("src", q);

                    // Mostrando (box sendo carregados)
                    if(k === 0){
                      $(".overview").append('<div class="overview-container"><div class="filter-crumb"><a href="#" class="fornlink"><p class="bread-search">Mostrando:<span class="spec">0</span><span> de </span><span class="specall">0</span><span> Amostras </span><span class="specforn"> de 0 Fornecedores</span></a></p><button type="button" class="bdefault select_all hide" name="'+h.FORN_ID+'">Selecionar Todos</button></div><ul class="viewport"></ul></div>');
                    }
                    else if(h.FORN_ID !== a[k-1].FORN_ID){
                      var html=''
                      var view_container=$(".overview-container");
                      view_container=$(view_container).eq(view_container.length-1);
                      //view_container.find(".fornlink").attr("href","#fornecedores/edit/"+h.FORN_ID);
                      view_container.find(".bread-search .spec").text(view_container.find(".viewport .thumbnail").length);
                      $(".overview").append('<div class="overview-container"><div class="filter-crumb"><a href="#" class="fornlink"><p class="bread-search">Mostrando:<span class="spec">0</span><span> de </span><span class="specall">0</span><span> Amostras </span><span class="specforn"> de 0 Fornecedores</span></p></a><button type="button" class="bdefault select_all hide" name="'+h.FORN_ID+'">Selecionar Todos</button></div><ul class="viewport"></ul></div>');
                      countf++;
                    }
 
                    var view_container=$(".overview-container");
                    view_container=$(view_container).eq(view_container.length-1);
                    view_container.find(".fornlink").attr("href","#fornecedores/edit/"+h.FORN_ID);
                    view_container.find(".bread-search .spec").text(view_container.find(".viewport .thumbnail").length+1);
                    view_container.find(".bread-search .specall").text(a.length);
                    view_container.find(".bread-search .specforn").text("/ "+h.FORN_DESC);
                    if(h.CONT_PRINCIPAL){
                      $(".filter-crumb").addClass('has-maincontact');
                    }
                } else {
                    var count="COUNT_FORN";
                    if(context.page === "amostras"){
                      count="COUNT_AMOS";

                      if(a[k-1]){
                        //console.log(h.FORN_ID+" , "+a[k-1].FORN_ID);
                        if(h.FORN_ID !== a[k-1].FORN_ID){
                          //console.log(h.FORN_ID+" = "+a[k-1].FORN_ID);
                          countf++;
                        }
                      }
                    }
                    var html='<div class="overview-container"><div class="filter-crumb"><p class="bread-search">Mostrando:<span class="spec">0</span><span> de </span><span class="specall">0</span><span> Amostras </span><span class="specforn"> de 0 Fornecedores</span></p><button type="button" class="bdefault select_all hide" name="'+h.FORN_ID+'">Selecionar Todos</button></div><table id="table" class="table-striped table-large"><thead><tr><th></th><th>Fornecedor</th><th>Código</th><th>Data</th>';
                          if(e.usr.SEGM_COD === "TD"){
                            html+='<th>Segmento</th>';
                          }

                    if (l > 0) {
                        if(e.page === "amostras"){
                          if(k === 0){
                            var html='<div class="overview-container"><div class="filter-crumb"><a href="#" class="fornlink"><p class="bread-search">Mostrando:<span class="spec">0</span><span> de </span><span class="specall">0</span><span> Amostras </span><span class="specforn"> de 0 Fornecedores</span></p></a><button type="button" class="bdefault select_all hide" name="'+h.FORN_ID+'">Selecionar Todos</button></div><table id="table" class="table-striped table-large"><thead><tr><th></th><th>Fornecedor</th><th>Codigo</th><th>Data</th>';
                            if(e.usr.SEGM_COD === "TD"){
                              html+='<th>Segmento</th>';
                            }
                            html+='<th><button type="button" class="caption-icons-icon justit bfisica nothas unable">Fisica</button></th><th>Preco Inicial</th><th>M/kg</th><th><button type="button" class="caption-icons-icon justit bfav nothas unable">Favorita</button></th><th><button type="button" class="caption-icons-icon justit bhomologado nothas unable">Homologada</button></th><th><button type="button" class="caption-icons-icon justit bnote">Anotacoes</button></th>'+/*<th><button type="button" class="icon bannex">Anexo</button></th>*/'<th><button type="button" class="caption-icons-icon justit bemail">Email</button></th><th>Tecimento</th><th>Base</th><th>Grupo</th><th>Sub-Grupo</th><th>Composicao</th><th class="tlast">Status</th></tr></thead><tbody></tbody></div>';
                            $(".floatThead").append(html);
                          }
                          else if(h.FORN_ID !== a[k-1].FORN_ID){
                            var html='<div class="overview-container"><div class="filter-crumb"><a href="#" class="fornlink"><p class="bread-search">Mostrando:<span class="spec">0</span><span> de </span><span class="specall">0</span><span> Amostras </span><span class="specforn"> de 0 Fornecedores</span></p></a><button type="button" class="bdefault select_all hide" name="'+h.FORN_ID+'">Selecionar Todos</button></div><table id="table" class="table-striped table-large"><thead><tr><th></th><th>Fornecedor</th><th>Codigo</th><th>Data</th>';
                            if(e.usr.SEGM_COD === "TD"){
                              html+='<th>Segmento</th>';
                            }
                            html+='<th><button type="button" class="caption-icons-icon justit bfisica nothas unable">Fisica</button></th><th>Preco Inicial</th><th>M/kg</th><th><button type="button" class="caption-icons-icon justit bfav nothas unable">Favorita</button></th><th><button type="button" class="caption-icons-icon justit bhomologado nothas unable">Homologada</button></th><th><button type="button" class="caption-icons-icon justit bnote">Anotacoes</button></th>'+/*<th><button type="button" class="icon bannex">Anexo</button></th>*/'<th><button type="button" class="caption-icons-icon justit bemail">Email</button></th><th>Tecimento</th><th>Base</th><th>Grupo</th><th>Sub-Grupo</th><th>Composicao</th><th class="tlast">Status</th></tr></thead><tbody></tbody></div>';
                            var view_container=$(".overview-container");
                            view_container=$(view_container).eq(view_container.length-1);
                            //view_container.find(".fornlink").attr("href","#fornecedores/edit/"+h.FORN_ID);
                            view_container.find(".bread-search .spec").text(view_container.find("tbody tr").length);
                            $(".floatThead").append(html);
                            countf++;
                          }
                          var view_container=$(".overview-container");
                          view_container=$(view_container).eq(view_container.length-1);
                          view_container.find(".fornlink").attr("href","#fornecedores/edit/"+h.FORN_ID);
                          view_container.find(".bread-search .spec").text(view_container.find("tbody tr").length+1);
                          view_container.find(".bread-search .specall").text(a.length);
                          view_container.find(".bread-search .specforn").text("/ "+h.FORN_DESC);
                          if(h.CONT_PRINCIPAL){
                            $(".filter-crumb").addClass('has-maincontact');
                          }

                        }

                        g = new Box({
                            item : h,
                            view : c,
                            tag : n,
                            detail : e.detail,
                            unable_select:e.unable_select,
                            is_selected:e.is_selected,
                            fornidselect:e.fornidselect,
                            modal : e.modal,
                            usr:e.usr,
                            page: e.page
                        });
                        //return 
                        e.active.create(g.render());
                        (e.page !== "amostras" && e.page !== "template_email") && (e.page === "local" ? $('.bread-search').find(".spec").text(k+1) : $('.bread-search').find(".spec").text(k+1),(e.page === "fornecedores" ? $('.bread-search').find(".specall").text(h.COUNT_FORN) : $('.bread-search').find(".specall").text(a.length))),$("tbody .bstar").unbind("click").bind("click",function(a){context.starForn(a)});
                        return l--,k++;
                        //, $('.bread-box').find(".bread-load").text(k+1), l--, k++, !1*/
                    } else {
                      if(c === "list"){
                        $("button.main_opt_button.bselect.bsel").trigger('click');
                      }
                      if(e.page === "amostras"){
                        if(e.cookieamostras.length){
                          //debugger;
                          $(".container-fullsize.scroller").scrollTop(e.cookieamostras[0].posscroll);
                          //debugger;
                          //console.dir($(".container-fullsize.scroller"));
                        }
                      }
                      else if( e.page === "fornecedores"){
                        if(e.cookiefornecedores.length){
                          //debugger;
                          $(".container-fullsize.scroller").scrollTop(e.cookiefornecedores[0].posscroll);
                          //debugger;
                          //console.dir($(".container-fullsize.scroller"));
                        }
                      }
                      clearInterval(f), e.setloading(!1);
                    }
                }
            }, 300);
          } else {
            //    $("tbody .bstar").unbind("click").bind("click",function(a){context.starForn(a)});
            //return setTimeout(function(){ e.setloading(!1); }, 3000),!1;
            return this.setloading(!1), !1;
          } 
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
    deleteNote:function(a){
      a.preventDefault();
      var i,obj=$(a.target),how;
      if(this.page === "amostras"){
        how="AMOS_ID";
      }
      else{
        how="FORN_ID";
      }
      this.callService("delete",obj.attr("title"),obj.attr("name"));
      obj.closest("li").fadeOut();
      this.data.filter(function(item,index) {
        if(item[how] === parseInt(obj.attr("alt"))){
          //console.dir(item);
          for(i=0;i<item.NOTES.length;i++){
            if(item.NOTES[i].NOTA_ID === parseInt(obj.attr("title"))){
              item.NOTES.splice(i, 1);
            }
          }
        }
      });

      /*for(i=0;i<this.detail.item.NOTES.length;i++){
        console.log(this.detail.item.NOTES[i].NOTA_ID+" , "+parseInt(obj.attr("title")));
        if(this.detail.item.NOTES[i].NOTA_ID === parseInt(obj.attr("title"))){
          this.detail.item.NOTES.splice(i, 1);
        }
      }*/
    },
    actionHeart:function(a){
      a.preventDefault();
      var obj=$(a.target);
    },
    actionFlag:function(a){
      a.preventDefault();
      var obj=$(a.target);
    },
    actionHomolog:function(a){
      a.preventDefault();
      var obj=$(a.target);
    },
    enableSelect : function(a){
      var status;
      var context=this;
      if(!context.email.length){
        status=setInterval(function(){
          //console.log("enable select");
          if(context.fair.length && !context.email.length){
            context.ajaxrequest=!1;
            context.callService("template_email",'','<TEMP_DESC></TEMP_DESC><SEGM_COD></SEGM_COD>');
            clearInterval(status);
          }
        },100);
      }
      else{
        context.callService("template_email",'','<TEMP_DESC></TEMP_DESC><SEGM_COD></SEGM_COD>');
      }

      if($(a.target).hasClass("sel") && this.view !== "list"){
        //Reseta array
        this.select_items=[];
        this.unable_select=!1;
        $(a.target).removeClass("sel");
        $(".remain_text").addClass('hide').removeClass('sel');
        $(".select_all").addClass('hide').removeClass('sel');
        $(".thumbnail .icon").attr("class","icon");
        $("html").attr("class","amostras");
        this.action_name="";
      }
      else if($(a.target).hasClass("sel") && this.view === "list"){
        this.select_items=[];
        this.unable_select=!1;
        $(a.target).removeClass("sel");
        $(".icon.bselection").removeClass('sel');
        $(".remain_text").addClass('hide').removeClass('sel');
        $(".select_all").addClass('hide').removeClass('sel');
      }
      else{
        //Inicia gravação
        this.select_items=[];
        this.unable_select=!0;
        $(".bsel").removeClass("sel");
        $(a.target).addClass("sel");
        $(".remain_text").removeClass('hide').removeClass('sel');
        $(".select_all").removeClass('hide').removeClass('sel');
        $(".thumbnail .icon").attr("class","icon").addClass($(a.target).attr("name"));
        $("html").attr("class","amostras").addClass("select");
        if($(a.target).hasClass("bedit") && !$(a.target).hasClass('unable')){
          $("html").addClass("edit");
        }
      }
    },
    changeCity:function(val){
      var country,city,context=this,arr=[];
      country=$(".countries").find("option:selected").val();
      city=$(".city").find("option:selected").val();
      this.ffair=[];
      if(this.page !== "local_cadastro" && this.page !== "fornecedor_cadastro"){
        if(this.fair.length){
          arr.push(this.fair.filter(function(a,b){
            if(country){
              if(a.PAIS_COD === country && a.REGI_COD === city && (!$(".inative option:selected").val() || a.FEIR_INATIVO == $(".inative option:selected").val())){
                return a;
              }
            }
            else{
              if(!$(".inative option:selected").val() || a.FEIR_INATIVO == $(".inative option:selected").val()){
                return a;
              }
            }
          }));
          this.ffair=arr[0];
          if(!arr[0].length){
            this.modal.open("message","Nenhum Item Encontrado!!!",!1,!0);
            this.content.clean();
            $('.bread-search').find(".spec").text("0");
          }
          else{
            context.setdata(arr[0],"local");
          }
        }
        else{
          this.callService("local",'<FEIR_COD></FEIR_COD>','<PAIS_COD>'+country+'</PAIS_COD>','<REGI_COD>'+city+'</REGI_COD>');
        }
      }
    },
    changeFair:function(a){
      //console.log("mudou feira, RESETOU COOKIE")
      /*this.initialTime=null;
      this.endTime=null;*/
      //this.scroller=0;
      //debugger;
      if(this.page === "fornecedor_cadastro"){
        this.fornecedores.setfair=$(a.target).find("option:selected").val();
        this.submit("<FEIR_COD>"+this.fairval+"</FEIR_COD>",!1,!1,!0);
        return !1;
      }
      this.restartValues();
      $.removeCookie('posscrollamostras', { path: '/' });
      $.removeCookie('posscrollfornecedores', { path: '/' });
      $(".container-fullsize.scroller").scrollTop(0);
      //this.reopenFilter();
      this.itens_by_page=this.itens_page_default;
      this.resetFilters();
      $(".overview-container").remove();
      this.fairval=$(a.target).find("option:selected").val();
      this.fornval=this.bforn.val();
      this.fornclick=this.fornval;
      this.amosval=$(".form-control-search").val() || "";
      this.savingCookie(this.page);


      if (this.page === "amostras") {
        this.mode=this.page+"/"+(this.fairval.replace(" ","_") || "padrao")+"/"+(this.fornval || "padrao")+"/"+(this.amosval || "padrao");
        this.navigate(this.mode, !0);
      }
      else{
        this.mode=this.page+"/"+(this.fairval.replace(" ","_") || "padrao")+"/"+(this.fornval || "padrao")+"/"+(this.amosval || "padrao");
        this.navigate(this.mode, !0);
      }      
    },
    changeCountries: function(a){
      if(!$(a.target).find("option:selected").val().length){
        $(".inative option").each(function(a,b){
          if($(b).attr("value") === ""){
            $(b).attr("selected","selected");
          }
        });
        this.createbox(this.fair, this.content.page, !0,"list");
      }



      this.callService("cities",'<PAIS_COD>'+$(a.target).find("option:selected").val()+'</PAIS_COD>','<PAIS_DESC></PAIS_DESC>','<REGI_COD></REGI_COD>','<REGI_DESC></REGI_DESC>');
      //this.setdata(this.fair,"local");
    },
    /*THis method was deprecated in 10/11/2015 09:56 by Fabiano de Lima
    Because Supplier's status filter are being using like a Search Param and no more a filter of a complet list.
    filterForn:function(ev){
      var aux;
      aux=this.data;
      this.reset();
      this.fdata = aux.filter(function(a,b){
        if(Boolean(a[$(ev.target).find("option:selected").attr("name")]) === $(ev.target).find("option:selected").val().bool()){
          return a;
        }
      });
      this.data=aux;
      //console.dir(this.fdata);
      //this.content.page = 0;
      this.createbox(this.fdata, this.content.page, !0,"list");
      //console.dir(typeof Boolean($(a.target).find("option:selected").val()));
    },*/


    filterForn:function(ev){
      this.reset();
      if($(ev.target).find("option:selected").val().length){
        if($(ev.target).attr('name') === "FORN_STATUS"){
          this.cadstatus=$(ev.target).find("option:selected").val().bool();
        }
        else{
          this.cadprincipal=$(ev.target).find("option:selected").val();
        }
      }
      else{
        if($(ev.target).attr('name') === "FORN_STATUS"){
          this.cadstatus=undefined;
        }
        else{
          this.cadprincipal=undefined;
        }  
      }
      var scroll={
        "fornval":''+this.fornval,
        "fairval":''+this.fairval,
        "amosval":''+this.amosval,
        "fornclick":''+(this.fornclick || ""),
        "dates":[this.initialTimeForn,this.endTimeForn],
        "prices":this.prices,
        "refine":this.filter.list,
        "combofilter":this.combofilter,
        "fstatus":this.cadstatus,
        "nsort":this.nsort,
        "cadprincipal":this.cadprincipal,
        "view":""+this.view,
        "segmval":this.segmval,
        "posscroll":(this.posscroll || 0),
        "total":(this.total || 20)
      }

      $.cookie.json = !0;
      $.cookie("posscroll"+"fornecedores", scroll, {expires:7, path:"/"});
      this.submit("<FEIR_COD>"+(this.fairval || "")+"</FEIR_COD>","<FORN_DESC>"+(this.fornval || "")+"</FORN_DESC>",(this.amosval || ""),!0,this.cadstatus,this.cadprincipal);
    },
    starForn:function(ev){
      var el,i,html="",diff=!1,item,context=this;
      el=this.data.filter(function(a,b) {
        if(parseInt(a.FORN_ID) == parseInt($(ev.target).attr('name'))){
          item=a.FAVORITES;
          //a.FAVORITES.push({"S'EGM_COD":context.usr.SEGM_COD,"SEGM_DESC":context.usr.SEGM_DESC});
          return a;
        }
      });
      if(el.length){
        if($(ev.target).hasClass('has')){
          //console.log("entrou has");
          for(i=0;i<el[0].FAVORITES.length;i++){
            if(el[0].FAVORITES[i].SEGM_COD !== this.usr.SEGM_COD){
              //console.log("diferente");
              html+="<string>"+el[0].FAVORITES[i].SEGM_COD+"</string>";
              
              diff=!0;
            }
            else{
              //console.dir(item[i]);
              
              //console.dir(item[i]);
              //item.push({"SEGM_COD":this.usr.SEGM_COD,"SEGM_DESC":this.usr.SEGM_DESC});
              if(el[0].FAVORITES.length >1){
                //console.log("mais que 1");
                diff=!0;
                item.splice(i, 1);
              }
              else{
                //console.log("apenas 1");
                $(ev.target).parent().removeClass('tooltip').find("ul").remove();
                diff=!1;
                item.splice(i, 1);
              }
            }
          }
          if(diff){
            var parent=$(ev.target).parent();
            //console.log("middle o favorito");
            $(ev.target).removeClass('nothas').removeClass('has').addClass('middle');
            parent.find("ul li").each(function(index, el) {
              //console.dir($(el));
              if($(el).find("button").attr('name') === context.usr.SEGM_COD){
                $(el).remove();
              }
            });
            //parent.find("ul").prepend('<li><button type="button" class="tooltip-item caption-icons-icon bstar has">'+this.usr.SEGM_DESC+'</button></li>');
          }
          else{
            //console.log("limpou o favorito");
            $(ev.target).removeClass('middle').removeClass('has').addClass('nothas');
            item.length=0;
          }
        }

        else if($(ev.target).hasClass('middle')){
          //console.log("middle");
          for(i=0;i<el[0].FAVORITES.length;i++){
            html+="<string>"+el[0].FAVORITES[i].SEGM_COD+"</string>";
          }
          html+="<string>"+this.usr.SEGM_COD+"</string>";
          item.push({"SEGM_COD":this.usr.SEGM_COD,"SEGM_DESC":this.usr.SEGM_DESC});
          $(ev.target).removeClass('nothas').removeClass('middle').addClass('has');
        }
        else{
          //console.log("nova");
          html+="<string>"+this.usr.SEGM_COD+"</string>";
          item.push({"SEGM_COD":this.usr.SEGM_COD,"SEGM_DESC":this.usr.SEGM_DESC});
          $(ev.target).removeClass('nothas').removeClass('middle').addClass('has');
          $(ev.target).parent().addClass('tooltip').append('<ul class="tooltip-content col-large"><li><button type="button" class="tooltip-item caption-icons-icon bstar has">'+this.usr.SEGM_DESC+'</button></li></ul>')
        }
      }
      this.callService("GravarFornecedorFavorito","<Forn_ID>"+parseInt($(ev.target).attr("name"))+"</Forn_ID>",html);

    },
    AmosByStatus:function(ev){
      if($(ev.target).hasClass("sel")){
        this.fstatus=null;
      }
      else{
        $(".tooltip-content.status button").removeClass("sel");
        this.fstatus=$(ev.target).attr("name").bool();
      }
      $(ev.target).toggleClass("sel");
      //debugger;
      $(".container-fullsize.scroller").scrollTop(0);
      this.cookieamostras[0].posscroll=0;
      this.itens = $([]);
      this.itens.remove();
      this.unable_select=!1;
      this.is_selected=!1;
      this.content.reset();
      $(".overview-container").remove();
      this.order_box.find("button").removeClass("sel");
      //console.dir($(".tooltip-content.status button"));
      if($(".tooltip-content.status button").hasClass('sel')){
        $(".status.tooltip-selectable").addClass('has');
      }
      else{
        $(".status.tooltip-selectable").removeClass('has');
      }
      this.Componentfilter(this.data, 0, !0);
    },AmosByPrice:function(){
      //debugger;
      $(".container-fullsize.scroller").scrollTop(0);
      this.cookieamostras[0].posscroll=0;
      this.itens = $([]);
      this.itens.remove();
      this.unable_select=!1;
      this.is_selected=!1;
      this.content.reset();
      this.order_box.find("button").removeClass("sel");
      $(".overview-container").remove();
      $(".main_opt_item.tooltip.tooltip-selectable").eq(0).addClass('has');
      this.Componentfilter(this.data, 0, !0);
    },
    amosBySegment:function(){
      this.segmval=$(".AMOS_SEGM_COD option:selected").attr("value");
      $(".container-fullsize.scroller").scrollTop(0);
      this.cookieamostras[0].posscroll=0;
      this.itens = $([]);
      this.itens.remove();
      this.unable_select=!1;
      this.is_selected=!1;
      this.content.reset();
      this.order_box.find("button").removeClass("sel");
      $(".overview-container").remove();
      $(".main_opt_item.tooltip.tooltip-selectable").eq(0).addClass('has');
      this.Componentfilter(this.data, 0, !0);
    },
    makeComboFilter:function(){
      $(".container-fullsize.scroller").scrollTop(0);
      this.cookieamostras[0].posscroll=0;
      var is_set=!1;
      this.itens = $([]);
      this.itens.remove();
      this.unable_select=!1;
      this.is_selected=!1;
      this.content.reset();
      this.order_box.find("button").removeClass("sel");
      $(".overview-container").remove();
      //this.combofilter.is_set=1;
      for(prop in this.combofilter){
        if(this.combofilter[prop].clicked){
          is_set=!0;
        }
      }
      this.combofilter.is_set=is_set;
      if(is_set){
        $(".tooltip-filter").addClass('has');
      }
      else{
         $(".tooltip-filter").removeClass('has');
      }
      this.Componentfilter(this.data, 0, !0);
    },
    TakeAllSamples:function(a){
      if($(a.target).hasClass('sel')){
        this.is_selected=!1;
        this.select_items=[];
        $(a.target).removeClass("sel");
        $(".select_all ").removeClass('hide');
        if(this.view === "images"){
          $(".thumbnail .icon").removeClass('sel'); 
        }
        else{
          $(".icon.bselection").removeClass('sel'); 
        }
      }
      else{
        this.is_selected=!0;
        this.select_items=this.data;
        $(a.target).addClass("sel");
        $(".select_all ").removeClass('sel').addClass('hide');
        if(this.view === "images"){
          $(".thumbnail .icon").addClass('sel'); 
        }
        else{
          $(".icon.bselection").addClass('sel'); 
        }
      }
    },

    SelectAllSamples:function(a){
      var target,ctx=this;
      target=$(a.target);
      if(target.hasClass("sel")){
        target.removeClass("sel");
        this.fornidselect=0;
        if(this.view === "images"){
          target.closest('.overview-container').find(".thumbnail .icon").removeClass('sel');
        }
        else{
          target.closest('.overview-container').find(".icon.bselection").removeClass('sel');
        }
        this.select_items=[];
      }
      else{
        $(".select_all ").removeClass('sel');
        $(".thumbnail .icon").removeClass('sel');
        $(".icon .bselection").removeClass('sel');
        target.addClass("sel");

        if(this.view === "images"){
          target.closest('.overview-container').find(".thumbnail .icon").addClass('sel');
        }
        else{
          target.closest('.overview-container').find(".icon.bselection").addClass('sel');
        }
        this.fornidselect=parseInt(target.attr("name"));
        this.select_items=[];
        this.data.filter(function(el,index) {
          if(parseInt(target.attr("name")) === el.FORN_ID){
            ctx.select_items.push({
              'AMOS_DESC':el.AMOS_DESC,
              'AMOS_ID':el.AMOS_ID,
              'FORN_ID':el.FORN_ID,
            });
          }
        });
      }   
    },
    sortItems : function(a,b){
      var type,i,length,temp=[],aux=[];
      if($(a.target).hasClass("sel") || this.loading){
        return !1;
      }
      type=$(a.target).attr("name") || this.nsort;
      $("html").attr("class","amostras");
      if(!b){
        this.content.page=0;
        $(".container-fullsize.scroller").scrollTop(0);
        this.cookieamostras[0].posscroll=0;
        this.content.clean();
        $(".overview-container").remove();
      }
      this.order_box.find("button").removeClass("sel");
      $(a.target).addClass("sel");
      switch(type){
        case 'BIGPRICE':
          this.nsort="AMOS_PRECO";
          if(this.fdata.length){
            length= this.fdata.length-1;
            aux = this.fdata.sortBy(this.nsort).unique();
          }
          else{
            length= this.data.length-1;
            aux = this.data.sortBy(this.nsort).unique();
          }
          for(i=length;i>=0;i--){
            temp.push(aux[i]);
          }
          this.nsort="BIGPRICE";
          if(b){
            $(".tooltip.borderby .bcircle").each(function(index, el) {
              if($(el).attr("name") === type){
                $(el).addClass('sel');
              }
            });
            return temp.unique();
          }
          
          break;
        case 'CREATE_DATE':
          this.nsort=type;
          if(this.fdata.length){
            length= this.fdata.length-1;
            temp = this.fdata.sort(function(a,b){
              var parts1 = a.CREATE_DATE.split("/");
              var parts2 = b.CREATE_DATE.split("/");
              // Turn your strings into dates, and then subtract them
              // to get a value that is either negative, positive, or zero.
              return new Date(parts2[2], parts2[1] - 1, parts2[0]) - new Date(parts1[2], parts1[1] - 1, parts1[0]);
            });
          }
          else{
            length= this.data.length-1;
            temp = this.data.sort(function(a,b){
              var parts1 = a.CREATE_DATE.split("/");
              var parts2 = b.CREATE_DATE.split("/");
              // Turn your strings into dates, and then subtract them
              // to get a value that is either negative, positive, or zero.
              return new Date(parts2[2], parts2[1] - 1, parts2[0]) - new Date(parts1[2], parts1[1] - 1, parts1[0]);
            });
          }
          if(b){
            $(".tooltip.borderby .bcircle").each(function(index, el) {
              if($(el).attr("name") === type){
                $(el).addClass('sel');
              }
            });
            return temp.unique();
          }
          break;
        case 'OLD_DATE':
          this.nsort="CREATE_DATE";
          if(this.fdata.length){
            length= this.fdata.length-1;
            aux = this.fdata.sort(function(a,b){
              var parts1 = a.CREATE_DATE.split("/");
              var parts2 = b.CREATE_DATE.split("/");
              // Turn your strings into dates, and then subtract them
              // to get a value that is either negative, positive, or zero.
              return new Date(parts2[2], parts2[1] - 1, parts2[0]) - new Date(parts1[2], parts1[1] - 1, parts1[0]);
            });
          }
          else{
            length= this.data.length-1;
            aux = this.data.sort(function(a,b){
              var parts1 = a.CREATE_DATE.split("/");
              var parts2 = b.CREATE_DATE.split("/");
              // Turn your strings into dates, and then subtract them
              // to get a value that is either negative, positive, or zero.
              return new Date(parts2[2], parts2[1] - 1, parts2[0]) - new Date(parts1[2], parts1[1] - 1, parts1[0]);
            });
          }
          for(i=length;i>=0;i--){
            temp.push(aux[i]);
          }
          this.nsort="OLD_DATE";
          if(b){
            $(".tooltip.borderby .bcircle").each(function(index, el) {
              if($(el).attr("name") === type){
                $(el).addClass('sel');
              }
            });
            return temp.unique();
          }
          break;
        default:
          this.nsort=type;
          if(this.fdata.length){
            length= this.fdata.length;
            temp = this.fdata.sortBy(type).unique();
          }
          else{
            length= this.data.length;
            temp = this.data.sortBy(type).unique();
          }
          if(b){
            $(".tooltip.borderby .bcircle").each(function(index, el) {
              if($(el).attr("name") === type){
                $(el).addClass('sel');
              }
            });
            return temp;
          }
          break;
      }
      this.fdata=temp;
      this.createbox(temp.unique(), this.content.page,!1,!1,(this.content.page + 1)*20);
    },
    Componentfilter:function(data,page,d,view,haslength){
      //debugger;
      //Componente para todos os filtros, vou passar em todo o data e filtrar todos os filtros sempre que o filtro for mudado.
      var aux,context=this,status,i;
      if(this.filter.list.length){
        $(".refine-container").addClass('has');
        //$(".container-fullsize.scroller").scrollTop(0);
        //this.cookieamostras[0].posscroll=0;
        if(!data.length){
          return this.modal.open("message","Nenhum Item Encontrado!!!",!1,!0), $('.bread-search').find(".spec").text("0 Resultados");
        }
        this.fdata=this.data;
        aux=context.filter.confirm(this.data,!0);
      }
      else{
        $(".refine-container").removeClass('has');
        if(this.nsort.length && this.fdata.length){
          aux=this.fdata;
        }
        else{
          aux=this.data;
        }
      }
      this.prices=[];
      this.prices.push($("input[name='initial_price']").val() || 0);
      this.prices.push($("input[name='end_price']").val() || 100000);
      this.fdata = aux.filter(function(a,b){
        if(!context.segmval.length || a['SEGM_COD'] === context.segmval){
          if(parseInt(a["AMOS_PRECO"]) >= parseInt(context.prices[0]) && parseInt(a["AMOS_PRECO"]) <= parseInt(context.prices[1])){
            if(Boolean(a["AMOS_STATUS"]) === context.fstatus || context.fstatus === null){
              for(var prop in context.combofilter) {
                if(context.combofilter.is_set){
                  if(context.combofilter[prop].clicked === 1){
                    if(prop === "NOTES"){
                      //Caso seja anotações
                      if(context.combofilter[prop].code){
                        if(a['NOTES'].length){
                          return a;
                        }
                      }
                      else{
                        if(!a['NOTES'].length){
                          return a;
                        }
                      }
                    }
                    else{
                      //Caso seja boolean normal como favoritos por exemplo
                      if(context.combofilter[prop].code === a[prop]){
                        return a;
                      }
                    }
                  }
                }
                else{
                  return a;
                }
              }
            }
          }
        }
      });
      if(!this.fdata.length){
        this.modal.open("message","Nenhum Item Encontrado!!!",!1,!0);
        this.setloading(!1);
        this.data=this.data;
        //debugger;
        $('.bread-search').find(".spec").text("0 Amostras");
        return !1;
      }

      var pos=0;
      var scroll={
        "fornval":''+this.fornval,
        "fairval":''+this.fairval,
        "amosval":""+this.amosval,
        "fornclick":""+this.fornclick,
        "prices":this.prices,
        "refine":this.filter.list,
        "combofilter":this.combofilter,
        "fstatus":this.fstatus,
        "nsort":this.nsort,
        "view":""+this.view,
        "segmval":this.segmval,
        "total": 20
      };

      if(this.page === "amostras"){
        pos = this.cookieamostras[0].posscroll;
        scroll.dates=[this.initialTimeAmos,this.endTimeAmos];
        scroll.posscroll=pos;
      }
      else{
        pos = this.cookiefornecedores[0].posscroll;
        scroll.dates=[this.initialTimeForn,this.initialTimeForn];
        scroll.posscroll=pos;
      }

      if(this.prices[0] != this.cookieamostras[0].prices[0] || this.prices[1] != this.cookieamostras[0].prices[1] || context.fstatus !== this.cookieamostras[0].fstatus || this.cookieamostras[0].combofilter.is_set !== context.combofilter.is_set && this.page == "amostras"){
        this.cookieamostras[0].posscroll=0;
      }
      
      if(this.page === "amostras"){
        $.cookie.json = !0;
        this.cookieamostras=[];
        this.cookieamostras.push(scroll);
      }
      else{
        $.cookie.json = !0;
        this.cookiefornecedores=[];
        this.cookiefornecedores.push(scroll);
      }
     
      if(!this.filter.list.length){
        //debugger;
        this.data=aux;
      }  
      this.setloading(!1);
      if(this.nsort !== ""){
        this.fdata=this.sortItems(this.fdata,!0);
      }
      this.createbox(this.fdata, page,d,view,haslength);
    },

    goDetail:function(a){
      this.navigate("detail/"+$(a.target).attr("name"), !0);
    },
    sendEmail:function(){
      //debugger;
      //console.log("clicou");
      console.dir(this.select_items);
      var i,context=this,error=!1;
      if(!this.select_items.length){
        if($(".overview-container").length>=1){
          this.modal.open("message","Selecione ao menos um item",!1,!0);
          return !1;
        }
        else{
          var status,last;
          this.thanks=!0;
          last_request=!1;
          status=setInterval(function(){
            last_request=!0;
            if(!context.ajaxrequest){
              context.callService("template_email",'','<TEMP_DESC></TEMP_DESC><SEGM_COD></SEGM_COD>');
              clearInterval(status);
              last_request=!1;
            }
          },100);
          last=setInterval(function(){
            if(!context.ajaxrequest && !last_request){
              context.callService("email_fornecedor","<FEIR_COD></FEIR_COD>","<FORN_ID>"+context.data[0].FORN_ID+"</FORN_ID>",'<LINHA_I>'+'1'+'</LINHA_I>','<LINHA_F>'+'20'+'</LINHA_F>','<CREATE_DATE_I>2000-04-10</CREATE_DATE_I>','<CREATE_DATE_F>2050-04-10</CREATE_DATE_F>');
              clearInterval(last);
            }
          },100);
        }
      }
      else{
        this.thanks=!1;
        for(i=0;i<=this.select_items.length;i++){
          if(this.select_items[i]){
            if(i>0 && this.select_items[i].FORN_ID !== context.select_items[i-1].FORN_ID){
              error=!0;
            }
          }
          else{
            if(error){
              context.modal.open("message","Email pode ser enviado para apenas 1 fornecedor",!1,!0);
              return !1;
            }
            else{
              this.callService("email_fornecedor","<FEIR_COD></FEIR_COD>","<FORN_ID>"+this.select_items[0].FORN_ID+"</FORN_ID>",'<LINHA_I>'+'1'+'</LINHA_I>','<LINHA_F>'+'20'+'</LINHA_F>','<CREATE_DATE_I>2000-04-10</CREATE_DATE_I>','<CREATE_DATE_F>2050-04-10</CREATE_DATE_F>');
            }
          } 
        }
        //alert("Enviar email para: "+this.select_items.join(" , "));
      }
    },
    sendEmailGo:function(item){
      //debugger;
      var i,j,length,amos_sel=[],counter,any_principal=!0,contemail="",context=this,listtemplates;
      if(!item.length){
        this.modal.open("message","Fornecedor Inativo!!!",!1,!0);
        return !1;
      }
      length=item[0].CONTACTS.length;
      if(!length){
        this.modal.open("message","O Fornecedor não possui contatos cadastrados",!1,!0);
        return !1;
      }
      else{
        for(i=0;i<=length;i++){
          if(item[0].CONTACTS[i]){
            if(item[0].CONTACTS[i].CONT_PRINCIPAL){
              if(item[0].CONTACTS[i].CONT_EMAIL.length){
                contemail=item[0].CONTACTS[i];
                any_principal=!1;
              }   
            }
          }
          else{
            /*for(j=0;j<this.select_items.length;j++){
              amos_sel.push(this.select_items[j]);
            }*/
            for(j=0;j<this.select_items.length;j++){  
              amos_sel.push({"AMOS_ID":this.select_items[j].AMOS_ID,"AMOS_DESC":this.select_items[j].AMOS_DESC});
            }
            if(any_principal){
                if(!amos_sel.length){
                  this.modal.open("message","Selecione ao menos um item",!1,!0);
                  return !1;
                }


                listtemplates=this.email.filter(function(a,b){
                  return a;
                  /*Seguindo demanda da segunda etapa do projeto webfair (93 Manter Todas os templates de email juntos (Cotação e Agradecimento))
                  06/01/2015*/
                });

                //debugger;
                item[0].CONTACTS.forEach(function(element,index){
                  if((element.CONT_EMAIL.length && !contemail.length) && !isEmail(element.CONT_EMAIL)){
                    contemail=element.CONT_EMAIL;
                    context.modal.open("message","O contato principal deste fornecedor não possui email cadastrado!!!",!1,!0);
                    //context.modal.open("contacts",item[0],!1,!1);
                    return !1;
                  }
                  else{
                    if(!contemail.length){
                      context.modal.open("message","Os Contatos deste fornecedor não possuem email cadastrado",!1,!0);
                    }
                  }

                });
            }
            else{
              //debugger;
              /*for(j=0;j<this.select_items.length;j++){  
                amos_sel.push(this.select_items[j].AMOS_DESC);
              }*/

              //console.log("email para: "+email);
              listtemplates=this.email.filter(function(a,b){
                return a;
              });

              /*if(amos_sel.length>20){
                var f,i=0,arr=[],l=amos_sel.length;
                f = setInterval(function() {
                  //k = (0*length), l = length
                  if(i < length){}
                },100);
                arr.push(amos_sel.slice(i, end))
                
              }
              return !1;*/
              $.cookie.json = !0;
              var temp={
                "opt":[amos_sel,contemail,this.usr]
              }
              var tempforn={
                "opt":[item[0]]
              }
              // console.dir(temp);
              // console.dir(tempforn);
              /*$.cookie("sendemail", temp, {expires:7, path:"/"});
              $.cookie("tempforn", tempforn, {expires:7, path:"/"});*/
              localStorage.setItem('sendemail', JSON.stringify(temp));
              localStorage.setItem('tempforn', JSON.stringify(tempforn));
              context.modal.open("template",[listtemplates,amos_sel,contemail,item[0]],!1,!1);
            }
          }
        }
      }
    },
    CleanFilter:function(){
      var scroll;
      this.resetFilters();
      $.removeCookie('posscroll'+this.page, { path: '/' });
      this.mode="amostras/"+(this.fairval || "padrao")+"/"+(this.fornval.replace(" ","_") || "padrao")+"/"+(this.amosval.replace(" ","_") || "padrao");
      /*scroll=this.cookiefair[0];
      this.restartValues();
      $.cookie.json = !0;
      this.cookiefair=[];
      this.cookiefair.push(scroll);
      $.cookie("posscroll", scroll, {expires:7, path:"/"});*/
      window.location.reload();
      //this.navigate("ok", !0);
    },

    enableDisabledTemplate:function(notshow,id){
      if(notshow){
        if(notshow === "reload"){
          item=this.data.filter(function(a,b){
            if(parseInt(a.TEMP_ID) == id){
              $(".info-template.item"+id).find("textarea[name='TEMP_BODY']").val(a.TEMP_BODY);
              $(".info-template.item"+id).find("textarea[name='TEMP_SUBJECT']").val(a.TEMP_SUBJECT);
            }
          });
        }
        $(".edit-temp").removeClass('sel');
        $(".info-template.item"+id).find("textarea").attr('disabled','disabled');
        $(".info-template textarea").removeClass('focused');
        $(".info-template.item"+id).find(".custombuttons").addClass('hide');

      }
      else{
        $(".info-template.item"+id).find("textarea").removeAttr('disabled');
        $(".info-template.item"+id+" .save-temp").removeClass('hide');
        $(".info-template.item"+id).find(".custombuttons").removeClass('hide');
      }
    },
    toggleTemplate:function(a){ 
      var el;
      if($(a.target).prop("tagName") ===  "SPAN"){
        el=$(a.target).parent();
      }
      else{
        el=$(a.target);
      }
      if(el.hasClass('open-info')){
        $(".info-template").addClass('hide');
        $('.open-info').removeClass('hide');

        $(".info-template.item"+el.attr('name')).removeClass('hide');
        el.addClass('hide');
        $(".info-template.item"+el.attr('name')+" .delete-temp").addClass('active');
      }
      else{
        if($(".info-template.item"+el.attr('name')+" .edit-temp").hasClass('sel')){
          this.modal.open("message","Deseja cancelar a edição?", this.proxy(this.requestCancelTemplate),!0, !0);
        }
        else{
          $(".info-template.item"+el.attr('name')+" .delete-temp").removeClass('active');
          $(".open-info").removeClass('hide');
          $(".info-template").addClass('hide');
        }
        //Remover classe do editar e esconder o save
      }
    },
    
    requestCancelTemplate:function(){
      var parent=$(".info-template").not(".hide");
      parent.find(".delete-temp").removeClass('active');
      $(".open-info").removeClass('hide');
      
      this.enableDisabledTemplate("reload",parent.attr('class').slice(18,parent.attr('class').length));
      parent.addClass('hide');
    },
    deleteTemplate:function(a){
      //confirmar exclusão
      this.modal.open("message","Deseja realmente excluir este template de Email?", this.proxy(this.requestDeleteTemplate),!0, !0);
    },
    requestDeleteTemplate:function(){
      if(!$(".delete-temp.active").length){
        return !1;
      }
      this.callService("gravarTemplate","<TEMP_ID>"+$(".delete-temp.active").attr('title')+"</TEMP_ID>","<TP_TEMP_ID>"+$(".delete-temp.active").attr('name')+"</TP_TEMP_ID>","<action>D</action>");
      $(".delete-temp.active").closest('tr').remove();
    },
    editTemplate:function(a){
      var item,el=$(a.target);
      el.toggleClass('sel');
      if(el.hasClass('sel')){
        this.enableDisabledTemplate(false,$(a.target).attr('name'));
      }
      else{
        this.enableDisabledTemplate(true,$(a.target).attr('name'));
      }
    },
    saveTemplate:function(a){
      var item,el=$(a.target),complet=!0;
      if(this.page === "template_email"){
        item=this.data.filter(function(a,b){
          if(parseInt(a.TEMP_ID) == parseInt(el.attr("name"))){
            return a;
          }
        });
        
        //Validando
        if(!$(".info-template.item"+el.attr("name")+" textarea[name='TEMP_SUBJECT']").val().length || !$(".info-template.item"+el.attr("name")+" textarea[name='TEMP_BODY']").val().length){
          complet=!1;
        }
        else{
          this.enableDisabledTemplate(true,el.attr('name'));
          item[0].TEMP_SUBJECT=$(".info-template.item"+el.attr("name")+" textarea[name='TEMP_SUBJECT']").val();
          item[0].TEMP_BODY=$(".info-template.item"+el.attr("name")+" textarea[name='TEMP_BODY']").val();
          this.callService("gravarTemplate","<TEMP_ID>"+item[0].TEMP_ID+"</TEMP_ID>","<TP_TEMP_ID>"+item[0].TP_TEMP_ID+"</TP_TEMP_ID><TEMP_SUBJECT>"+$(".info-template.item"+el.attr("name")+" textarea[name='TEMP_SUBJECT']").val()+"</TEMP_SUBJECT><TEMP_BODY>"+$(".info-template.item"+el.attr("name")+" textarea[name='TEMP_BODY']").val()+"</TEMP_BODY><SEGM_COD>"+item[0].SEGM_COD+"</SEGM_COD>"+"<TEMP_DESC>"+item[0].TEMP_DESC+"</TEMP_DESC>","<action>U</action>");
        }
      }
      else{
        //Validando
        if(!$(".info-template textarea[name='TEMP_SUBJECT']").val().length || !$(".info-template textarea[name='TEMP_BODY']").val().length || !$(".edit-description").val().length){
          complet=!1;
        }
        else{
          this.callService("gravarTemplate","<TEMP_ID>0</TEMP_ID>","<TP_TEMP_ID>"+$(".type option:selected").attr("value")+"</TP_TEMP_ID><TEMP_SUBJECT>"+$(".info-template textarea[name='TEMP_SUBJECT']").val()+"</TEMP_SUBJECT><TEMP_BODY>"+$(".info-template textarea[name='TEMP_BODY']").val()+"</TEMP_BODY><SEGM_COD>"+this.usr.SEGM_COD+"</SEGM_COD>"+"<TEMP_DESC>"+$(".edit-description").val()+"</TEMP_DESC>","<action>I</action>");
        }
      }
    },
    addHash:function(a){
      var el=$(a.target),area;
      area=$(".info-template textarea.focused");
      var caretPos = area[0].selectionStart;
      var textAreaTxt = area.val();
      var txtToAdd = "##"+el.attr("alt");
      area.val(textAreaTxt.substring(0, caretPos) + txtToAdd + textAreaTxt.substring(caretPos) );
    },
    focusArea:function(a){
      $(".info-template textarea").removeClass('focused');
      $(a.target).addClass('focused');
    },
    setComboFilter:function(a){
      a.preventDefault();
      var el=$(a.target),is_set=!1;
      if(el.hasClass('sel')){
        el.removeClass('sel');
        this.combofilter[el.attr('name')].code=0;
        this.combofilter[el.attr('name')].clicked=0;
        for(prop in this.combofilter){
          if(this.combofilter[prop].clicked){
            is_set=!0;
          }
        }
        this.combofilter.is_set=is_set;
      }
      else{
        $(".filterlist."+el.attr("name")).find("a").removeClass('sel');
        el.addClass('sel');
        this.combofilter[el.attr('name')].code=parseInt(el.attr("href").replace("#",""));
        this.combofilter[el.attr('name')].clicked=1;
      }
    },

    filterTemplate:function(){
      if(this.page !== "template_email"){
        return !1;
      }
      var aux,type,segm,context=this;
      type=$(".type option:selected").attr("value");
      segm=$(".SEGM_COD option:selected").attr("value");
      aux=this.data;
      this.reset();

      this.fdata = aux.filter(function(a,b){
        if(parseInt(a.TP_TEMP_ID) === parseInt(type) || !type.length){
          if(context.usr.SEGM_COD === "TD"){
            //console.log(segm+" , "+a.SEGM_COD);
            if(segm === a.SEGM_COD || !segm.length){
              return a;
            }
          }
          else{
            return a;
          }
        }
      });

      this.data=aux;

      if(!this.fdata.length){
        this.modal.open("message","Nenhum Item Encontrado!!!",!1,!0); 
        this.setloading(!1);
        return !1;
      }
      this.createbox(this.fdata, this.content.page, !0,"list"); 
    },
    showSubCategories:function(a){
      a.preventDefault();
      if($(a.target).hasClass('actived')){
        $(".category_button").removeClass('actived');
        $(".sub_category").removeClass('maximum');
      }
      else{
        $(".category_button").removeClass('actived');
        $(".sub_category").removeClass('maximum');
        $(a.target).addClass('actived').parent().find(".sub_category").addClass('maximum');
      }

    },
    setCompositions:function(a){
      //debugger;
      //console.log("SET COMPOSITIONS");
      var length,context=this,l=0,obj,status;
      if($(a.target).prop("tagName") ===  "SPAN"){
        a.preventDefault();
        obj=$(a.target).parent();
      }
      else{
        obj=$(a.target);
        a.preventDefault();
      }
      length=this.select_items.length;
      if(!length){
        this.modal.open("message","Por favor, selecione ao menos uma amostra para alterar!!!",!1,!0);
        return !1;
      }
      this.setloading(!0,!1);
      if(obj.attr("name") === "COMP"){
        //debugger;
        status=setInterval(function(){
          if(l<length){
            var html="";
            context.data.filter(function(elem,index){
              if(elem.AMOS_ID == context.select_items[l].AMOS_ID){
                elem.COMPOSITIONS.push({"COMP_COD":obj.attr("href").replace("#",""),"COMP_DESC":obj.attr("title")})
              }
            });

            $("#"+context.select_items[l].AMOS_ID+" .caption-downside ul").append("<li><a href='#"+obj.attr('href').replace("#","")+"' name='"+context.select_items[l].AMOS_ID+"'>"+obj.attr('title').toUpperCase()+"</a></li>");
            $("#"+context.select_items[l].AMOS_ID+" .caption-downside a").each(function(index, el) {
              if($(el).attr("href").replace("#","") !== "M" && $(el).attr("href").replace("#","") !== "P" && $(el).attr("href").replace("#","") !== "null"){
                html+="<Composition><COMP_COD>"+$(el).attr("href").replace("#","")+"</COMP_COD><COMP_OTHERS></COMP_OTHERS><TP_COMP_ID>1</TP_COMP_ID></Composition>";
              }
            });
            context.setloading(!0,!1);
            context.callService("gravarAmostraComposicao",context.select_items[l].AMOS_ID,html,"PROMISSE");     
            l++;
          }
          else{
            context.setloading(!1);
            clearInterval(status);
          }
        },200);
      }
      else{
        status=setInterval(function(){
          if(l<length){
            var html="",pattern="";
            if(!$("#"+context.select_items[l].AMOS_ID+" .caption-downside a[href='"+obj.attr('href')+"']").length){
              //Fazer identificar se ja tem um para aquele atributo e remover
              if($("#"+context.select_items[l].AMOS_ID+" .caption-downside a[name='"+obj.attr('name')+"']").length){
                $("#"+context.select_items[l].AMOS_ID+" .caption-downside a[name='"+obj.attr('name')+"']").parent().remove();
              }
              $("#"+context.select_items[l].AMOS_ID+" .caption-downside ul").append("<li><a href='#"+obj.attr('href').replace("#","")+"' name='"+obj.attr('name')+"'>"+obj.attr('title').toUpperCase()+"</a></li>");
              context.data.filter(function(elem,index){
                if(elem.AMOS_ID == context.select_items[l].AMOS_ID){
                  var day,date,month;
                  date=new Date();
                  if(parseInt(date.getDate())<10){
                    day="0"+parseInt(date.getDate());
                  }
                  else{
                    day=date.getDate();
                  }

                  if((parseInt(date.getMonth())+1)<10){
                    month="0"+parseInt(date.getMonth()+1);
                  }
                  else{
                    month=parseInt(date.getMonth()+1);
                  }

                  date=""+date.getFullYear()+"-"+month+"-"+day;
                  //pattern+="<AMOS_ID>"+parseInt(elem.AMOS_ID)+"</AMOS_ID><FORN_ID>"+parseInt(elem.FORN_ID)+"</FORN_ID><FEIR_COD>"+parseInt(elem.FEIR_COD)+"</FEIR_COD><USU_COD>"+parseInt(elem.USU_COD)+"</USU_COD><AMOS_DESC>"+elem.AMOS_DESC+"</AMOS_DESC><AMOS_STATUS>"+elem.AMOS_STATUS+"</AMOS_STATUS><AMOS_ENV_EMAIL>"+elem.AMOS_ENV_EMAIL+"</AMOS_ENV_EMAIL><TECI_COD>"+(elem.TECI_COD || "")+"</TECI_COD><BASE_COD>"+(elem.BASE_COD || "")+"</BASE_COD><GRUP_COD>"+(elem.GRUP_COD || "")+"</GRUP_COD><SUBG_COD>"+(elem.SUBG_COD || "")+"</SUBG_COD><SEGM_COD>"+(elem.SEGM_COD || "")+"</SEGM_COD><FLAG_PRIORIDADE>"+elem.FLAG_PRIORIDADE+"</FLAG_PRIORIDADE><AMOS_HOMOLOGAR>"+elem.AMOS_HOMOLOGAR+"</AMOS_HOMOLOGAR><FLAG_FISICA>"+elem.FLAG_FISICA+"</FLAG_FISICA><CREATE_DATE>"+date+"</CREATE_DATE>";
                  //html+="<AMOS_PRECO>"+elem.AMOS_PRECO+"</AMOS_PRECO><AMOS_LARGURA_TOTAL>"+elem.AMOS_LARGURA_TOTAL+"</AMOS_LARGURA_TOTAL><AMOS_GRAMATURA_M>"+elem.AMOS_GRAMATURA_M+"</AMOS_GRAMATURA_M><AMOS_COTACAO_M>"+elem.AMOS_COTACAO_M+"</AMOS_COTACAO_M><AMOS_COTACAO_KG>"+elem.AMOS_COTACAO_KG+"</AMOS_COTACAO_KG><AMOS_LARGURA_UTIL>"+elem.AMOS_LARGURA_UTIL+"</AMOS_LARGURA_UTIL><AMOS_GRAMATURA_ML>"+elem.AMOS_GRAMATURA_ML+"</AMOS_GRAMATURA_ML><AMOS_ONCAS>"+elem.AMOS_ONCAS+"</AMOS_ONCAS><AMOS_PRECO_UM>"+elem.AMOS_PRECO_UM+"</AMOS_PRECO_UM>";
                  
                  elem[obj.attr("name")]=obj.attr("href").replace("#","");
                  elem[obj.attr("name").replace("_COD","_DESC")]=obj.attr("title");
                  pattern+="<AMOS_ID>"+parseInt(elem.AMOS_ID)+"</AMOS_ID><FORN_ID>"+parseInt(elem.FORN_ID)+"</FORN_ID><FEIR_COD>"+parseInt(elem.FEIR_COD)+"</FEIR_COD><USU_COD>"+parseInt(elem.USU_COD)+"</USU_COD><AMOS_DESC>"+elem.AMOS_DESC+"</AMOS_DESC><AMOS_STATUS>"+elem.AMOS_STATUS+"</AMOS_STATUS><AMOS_ENV_EMAIL>"+elem.AMOS_ENV_EMAIL+"</AMOS_ENV_EMAIL><TECI_COD>"+(elem.TECI_COD || "")+"</TECI_COD><BASE_COD>"+(elem.BASE_COD || "")+"</BASE_COD><GRUP_COD>"+(elem.GRUP_COD || "")+"</GRUP_COD><SUBG_COD>"+(elem.SUBG_COD || "")+"</SUBG_COD><SEGM_COD>"+(elem.SEGM_COD || "")+"</SEGM_COD><FLAG_PRIORIDADE>"+elem.FLAG_PRIORIDADE+"</FLAG_PRIORIDADE><AMOS_HOMOLOGAR>"+elem.AMOS_HOMOLOGAR+"</AMOS_HOMOLOGAR><FLAG_FISICA>"+elem.FLAG_FISICA+"</FLAG_FISICA><CREATE_DATE>"+date+"</CREATE_DATE>";
                  html+="<AMOS_DESC>"+elem.AMOS_DESC+"</AMOS_DESC><AMOS_PRECO>"+elem.AMOS_PRECO+"</AMOS_PRECO><AMOS_LARGURA_TOTAL>"+elem.AMOS_LARGURA_TOTAL+"</AMOS_LARGURA_TOTAL><AMOS_GRAMATURA_M>"+elem.AMOS_GRAMATURA_M+"</AMOS_GRAMATURA_M><AMOS_COTACAO_KG>"+elem.AMOS_COTACAO_KG+"</AMOS_COTACAO_KG><AMOS_LARGURA_UTIL>"+elem.AMOS_LARGURA_UTIL+"</AMOS_LARGURA_UTIL><AMOS_GRAMATURA_ML>"+elem.AMOS_GRAMATURA_ML+"</AMOS_GRAMATURA_ML><AMOS_ONCAS>"+elem.AMOS_ONCAS+"</AMOS_ONCAS><AMOS_PRECO_UM>"+elem.AMOS_PRECO_UM+"</AMOS_PRECO_UM>";
                  context.callService("gravarAmostras",pattern,html,"U","PROMISSE");
                }
              });
              
            }  
            l++;
          }
          else{
            context.setloading(!1);
            clearInterval(status);
          }
        },200);
      }

      //this.callService("gravarAmostraComposicao","102004997","<Composition><COMP_COD>CL_1</COMP_COD><COMP_OTHERS></COMP_OTHERS><TP_COMP_ID>1</TP_COMP_ID></Composition>");
    },
    compChange:function(ev){
      //debugger;
      //console.log("COMP CHANGE");
      ev.preventDefault();
      var aux,html="",context=this;
      if(typeof ev === "object"){
        var el=$(ev.target);
      }
      else{
        var el=ev;
      }
      aux=el.closest("ul");
      if(!isNaN(parseInt(el.attr("name")))){
        var code=el.attr('name');
        el.parent().remove();
        var items=aux.find("a");
        $("#"+code+" .caption-downside a").each(function(index, el) {
          if($(el).attr("href").replace("#","") !== "M" && $(el).attr("href").replace("#","") !== "P" && $(el).attr("href").replace("#","") !== "null"){
            html+="<Composition><COMP_COD>"+$(el).attr("href").replace("#","")+"</COMP_COD><COMP_OTHERS></COMP_OTHERS><TP_COMP_ID>1</TP_COMP_ID></Composition>";
          }
        });
        context.callService("gravarAmostraComposicao",code,html);  
      }
      else{
        var html="",pattern="";
        el.parent().remove();
        context.data.filter(function(elem,index){
          if(elem.AMOS_ID == el.attr("title")){
            var day,date,month;
            date=new Date();
            if(parseInt(date.getDate())<10){
              day="0"+parseInt(date.getDate());
            }
            else{
              day=date.getDate();
            }

            if((parseInt(date.getMonth())+1)<10){
              month="0"+parseInt(date.getMonth()+1);
            }
            else{
              month=parseInt(date.getMonth()+1);
            }
            date=""+date.getFullYear()+"-"+month+"-"+day;
            
            elem[el.attr("name")]=null;
            elem[el.attr("name").replace("_COD","_DESC")]="";
            pattern+="<AMOS_ID>"+parseInt(elem.AMOS_ID)+"</AMOS_ID><FORN_ID>"+parseInt(elem.FORN_ID)+"</FORN_ID><FEIR_COD>"+parseInt(elem.FEIR_COD)+"</FEIR_COD><USU_COD>"+parseInt(elem.USU_COD)+"</USU_COD><AMOS_DESC>"+elem.AMOS_DESC+"</AMOS_DESC><AMOS_STATUS>"+elem.AMOS_STATUS+"</AMOS_STATUS><AMOS_ENV_EMAIL>"+elem.AMOS_ENV_EMAIL+"</AMOS_ENV_EMAIL><TECI_COD>"+(elem.TECI_COD || "")+"</TECI_COD><BASE_COD>"+(elem.BASE_COD || "")+"</BASE_COD><GRUP_COD>"+(elem.GRUP_COD || "")+"</GRUP_COD><SUBG_COD>"+(elem.SUBG_COD || "")+"</SUBG_COD><SEGM_COD>"+(elem.SEGM_COD || "")+"</SEGM_COD><FLAG_PRIORIDADE>"+elem.FLAG_PRIORIDADE+"</FLAG_PRIORIDADE><AMOS_HOMOLOGAR>"+elem.AMOS_HOMOLOGAR+"</AMOS_HOMOLOGAR><FLAG_FISICA>"+elem.FLAG_FISICA+"</FLAG_FISICA><CREATE_DATE>"+date+"</CREATE_DATE>";
            html+="<AMOS_DESC>"+elem.AMOS_DESC+"</AMOS_DESC><AMOS_PRECO>"+elem.AMOS_PRECO+"</AMOS_PRECO><AMOS_LARGURA_TOTAL>"+elem.AMOS_LARGURA_TOTAL+"</AMOS_LARGURA_TOTAL><AMOS_GRAMATURA_M>"+elem.AMOS_GRAMATURA_M+"</AMOS_GRAMATURA_M><AMOS_COTACAO_KG>"+elem.AMOS_COTACAO_KG+"</AMOS_COTACAO_KG><AMOS_LARGURA_UTIL>"+elem.AMOS_LARGURA_UTIL+"</AMOS_LARGURA_UTIL><AMOS_GRAMATURA_ML>"+elem.AMOS_GRAMATURA_ML+"</AMOS_GRAMATURA_ML><AMOS_ONCAS>"+elem.AMOS_ONCAS+"</AMOS_ONCAS><AMOS_PRECO_UM>"+elem.AMOS_PRECO_UM+"</AMOS_PRECO_UM>";

            context.callService("gravarAmostras",pattern,html,"U");
          }
        });
        el.parent().remove(); //
      }
    },
    setEmailSent:function(a){
      /*This method was changed since 15-03-2016 by Isaac
      Now When click to send a email, the sample is checked by sent, but db base just is changed when in the new window
      The email is sent, otherwise when user press F5, all samples will be equal.*/
      var length,context=this,l=0,obj,status;
      length=a.length;
      this.setloading(!0,!1);
      status=setInterval(function(){
        if(l<length){
            var html="",pattern="";
            context.data.filter(function(elem,index){
              if(elem.AMOS_ID == a[l]){
                /*var day,date,month;
                date=new Date();
                if(parseInt(date.getDate())<10){
                  day="0"+parseInt(date.getDate());
                }
                else{
                  day=date.getDate();
                }
                if((parseInt(date.getMonth())+1)<10){
                  month="0"+parseInt(date.getMonth()+1);
                }
                else{
                  month=parseInt(date.getMonth()+1);
                }
                date=""+date.getFullYear()+"-"+month+"-"+day;*/
                $(".bemail[name='"+elem.AMOS_ID+"']").removeClass('disabled');
                /*pattern+="<AMOS_ID>"+parseInt(elem.AMOS_ID)+"</AMOS_ID><FORN_ID>"+parseInt(elem.FORN_ID)+"</FORN_ID><FEIR_COD>"+parseInt(elem.FEIR_COD)+"</FEIR_COD><USU_COD>"+parseInt(elem.USU_COD)+"</USU_COD><AMOS_DESC>"+elem.AMOS_DESC+"</AMOS_DESC><AMOS_STATUS>"+elem.AMOS_STATUS+"</AMOS_STATUS><AMOS_ENV_EMAIL>1</AMOS_ENV_EMAIL><TECI_COD>"+(elem.TECI_COD || "")+"</TECI_COD><BASE_COD>"+(elem.BASE_COD || "")+"</BASE_COD><GRUP_COD>"+(elem.GRUP_COD || "")+"</GRUP_COD><SUBG_COD>"+(elem.SUBG_COD || "")+"</SUBG_COD><SEGM_COD>"+(elem.SEGM_COD || "")+"</SEGM_COD><FLAG_PRIORIDADE>"+elem.FLAG_PRIORIDADE+"</FLAG_PRIORIDADE><AMOS_HOMOLOGAR>"+elem.AMOS_HOMOLOGAR+"</AMOS_HOMOLOGAR><FLAG_FISICA>"+elem.FLAG_FISICA+"</FLAG_FISICA><CREATE_DATE>"+date+"</CREATE_DATE>";
                html+="<AMOS_DESC>"+elem.AMOS_DESC+"</AMOS_DESC><AMOS_PRECO>"+elem.AMOS_PRECO+"</AMOS_PRECO><AMOS_LARGURA_TOTAL>"+elem.AMOS_LARGURA_TOTAL+"</AMOS_LARGURA_TOTAL><AMOS_GRAMATURA_M>"+elem.AMOS_GRAMATURA_M+"</AMOS_GRAMATURA_M><AMOS_COTACAO_KG>"+elem.AMOS_COTACAO_KG+"</AMOS_COTACAO_KG><AMOS_LARGURA_UTIL>"+elem.AMOS_LARGURA_UTIL+"</AMOS_LARGURA_UTIL><AMOS_GRAMATURA_ML>"+elem.AMOS_GRAMATURA_ML+"</AMOS_GRAMATURA_ML><AMOS_ONCAS>"+elem.AMOS_ONCAS+"</AMOS_ONCAS><AMOS_PRECO_UM>"+elem.AMOS_PRECO_UM+"</AMOS_PRECO_UM>";
                context.callService("gravarAmostras",pattern,html,"U");*/
              }
            });
          l++;
        }
        else{
          clearInterval(status);
          context.setloading(!1);
        }
      },200);
    },
    toUpperCaseValue:function(a){
      $(a.target).val($(a.target).val().toUpperCase());
    },
    getPage:function(){
      return this.page;
    },
    getInitialTime:function(a){ 
      if(a){
        return this.initialTimeAmos;
      }
      else{
        return this.initialTimeForn;
      }  
    },
    getEndTime:function(a){
      if(a){
        return this.endTimeAmos;
      }
      else{
        return this.endTimeForn;
      }
    },
    exportExcel:function(){
      var j,i,fdata=[];
      var homologado,fisica,fav,email,status,length;
      var indice_forn=[
        {"code":"FORN_DESC","name":"Fornecedor"},
        {"code":"FEIR_DESC","name":"Local da Coleta"},
        {"code":"CREATE_DATE","name":"Criacao do fornecedor"},
        {"code":"CONTACTS","name":"Contatos"},
        {"code":"CONTACTS_CREATE_DATE","name":"Cadastro do Contato"},
        {"code":"SEGM_DESC","name":"Segmento"},
        {"code":"NOTES","name":"Anotacoes"},
        {"code":"FAVORITES","name":"Favoritos"},
        {"code":"FORN_STATUS","name":"Status"}
      ]
      var indice_amos=[
        {"code":"FORN_DESC","name":"Fornecedor","pattern":false,"pvalue":""},
        {"code":"AMOS_DESC","name":"Codigo","pattern":false,"pvalue":""},
        {"code":"SEGM_COD","name":"Segmento","pattern":false,"pvalue":""},
        {"code":"CREATE_DATE","name":"Data","pattern":false,"pvalue":""},
        {"code":"FLAG_FISICA","name":"Fisica","pattern":true,"pvalue":""},
        {"code":"AMOS_PRECO","name":"Preco Inicial","pattern":true,"pvalue":"0"},
        {"code":"AMOS_GRAMATURA_M","name":"M/kg","pattern":true,"pvalue":"0"},
        {"code":"FLAG_PRIORIDADE","name":"Favorita","pattern":true,"pvalue":""},
        {"code":"AMOS_HOMOLOGAR","name":"Homologada","pattern":true,"pvalue":""},
        {"code":"NOTES","name":"Anotacoes","pattern":false,"pvalue":""},
        {"code":"AMOS_ENV_EMAIL","name":"Email","pattern":true,"pvalue":""},
        {"code":"TECI_DESC","name":"Tecimento","pattern":false,"pvalue":""},
        {"code":"BASE_DESC","name":"Base","pattern":false,"pvalue":""},
        {"code":"GRUP_DESC","name":"Grupo","pattern":false,"pvalue":""},
        {"code":"SUBG_DESC","name":"Sub-Grupo","pattern":false,"pvalue":""},
        {"code":"COMPOSITIONS","name":"Composicao","pattern":false,"pvalue":""},
        {"code":"AMOS_STATUS","name":"Status","pattern":true,"pvalue":""}
      ]

      tab_text='<table border="2px"><tr bgcolor="#71abcc">';
      if(this.fdata.length){
        fdata=this.fdata;
      }
      else{
        fdata=this.data;
      }

      if(this.page === "amostras"){
        for(i=0;i<indice_amos.length;i++){
          tab_text+='<th>'+indice_amos[i].name+'</th>';
        }
      }
      else{
        for(i=0;i<indice_forn.length;i++){
          tab_text+='<th>'+indice_forn[i].name+'</th>';
        }
      }
      
      tab_text+="</tr>";

      for(i = 0 ; i < fdata.length ; i++) 
      {     
        tab_text+="<tr>";
        if(this.page === "amostras"){
          homologado=fdata[i].AMOS_HOMOLOGAR ? "Sim":"Nao";  
          fisica=fdata[i].FLAG_FISICA ? "Sim":"Nao";
          fav=fdata[i].FLAG_PRIORIDADE ? "Sim":"Nao";
          status=fdata[i].AMOS_STATUS ? "Completo":"Incompleto";
          email=fdata[i].AMOS_ENV_EMAIL? "Enviado":"Nao enviado";
          length=indice_amos.length;
          for(j=0;j<indice_amos.length;j++){
            if(indice_amos[j].pattern){
              switch(indice_amos[j].code){
                case "AMOS_HOMOLOGAR":
                  indice_amos[j].pvalue=homologado;
                  break;
                case "FLAG_FISICA":
                  indice_amos[j].pvalue=fisica;
                  break;
                case "FLAG_PRIORIDADE":
                  indice_amos[j].pvalue=fav;
                  break;
                case "AMOS_STATUS":
                  indice_amos[j].pvalue=status;
                  break;
                case "AMOS_ENV_EMAIL":
                  indice_amos[j].pvalue=email;
                  break;
                case "AMOS_PRECO":
                  indice_amos[j].pvalue=this.fdata[i].AMOS_PRECO;
                  break;
                case "AMOS_GRAMATURA_M":
                  indice_amos[j].pvalue=this.fdata[i].AMOS_GRAMATURA_M;
                  break;
                default:
                  indice_amos[j].pvalue="";
                  break;
              }
            }
            else{
              indice_amos[j].pvalue="";
            }
          }
        }
        else{
          fav= fdata[i].FAVORITES.length ? true:false;
          length=indice_forn.length;
        }
        for(j=0;j<length;j++){
          if(this.page !== "amostras"){
            switch (indice_forn[j].code){
              case "NOTES":
                var segnote=[];
                for(var k=0;k<fdata[i].NOTES.length;k++){
                  if(fdata[i].NOTES[k].SEGM_COD === this.usr.SEGM_COD || this.usr.SEGM_COD === "TD"){
                    segnote.push(fdata[i].NOTES[k]);
                  }
                }
                if(segnote.length){
                  this.setDate(segnote);
                  tab_text+="<td>";
                  for(var k=0;k<segnote.length;k++){
                    tab_text+="<b>"+segnote[k].CREATE_DATE+" | "+segnote[k].OBJ_ID+" - </b>"+segnote[k].USU_NOME+" - "+segnote[k].SEGM_DESC+" - "+segnote[k].NOTA_DESC.removeAccents()+"<hr/>";
                  }
                  tab_text+="</td>";
                }
                else{
                  tab_text+="<td></td>";
                }
                break;
              case "CONTACTS":
                if(fdata[i].CONTACTS.length){
                  //console.log(fdata[i].FORN_DESC);
                  tab_text+="<td>";
                  this.setDate(fdata[i].CONTACTS);
                  for(var k=0;k<fdata[i].CONTACTS.length;k++){
                    tab_text+="<p>"+(fdata[i].CONTACTS[k].CONT_NOME || "SEM NOME")+"</p>";
                  }
                  tab_text+="</td>";
                }
                else{
                  tab_text+="<td></td>";
                }
                break;
              case "CONTACTS_CREATE_DATE":
                if(fdata[i].CONTACTS.length){
                  //console.log(fdata[i].FORN_DESC);
                  tab_text+="<td>";
                  for(var k=0;k<fdata[i].CONTACTS.length;k++){
                    tab_text+="<p>"+(fdata[i].CONTACTS[k].CREATE_DATE || "")+"</p>";
                  }
                  tab_text+="</td>";
                }
                else{
                  tab_text+="<td></td>";
                }
                break;
              case "SEGM_DESC":
                if(fdata[i].CONTACTS.length){
                  tab_text+="<td>";
                  for(var k=0;k<fdata[i].CONTACTS.length;k++){
                    tab_text+="<p>"+fdata[i].CONTACTS[k].SEGM_DESC+"</p>";
                  }
                  tab_text+="</td>";
                }
                else{
                  tab_text+="<td></td>";
                }
                break;
              case "FAVORITES":
                if(fav){
                  tab_text+="<td>";
                  for(var k=0;k<fdata[i].FAVORITES.length;k++){
                    tab_text+="<p>"+fdata[i].FAVORITES[k].SEGM_DESC+"</p>";
                  }
                  tab_text+="</td>";
                }
                else{
                  tab_text+="<td>Nao</td>";
                }
                break;
              default:
                tab_text+="<td>";
                if(indice_forn[j].code === "FORN_STATUS"){
                  tab_text+=fdata[i][indice_forn[j].code] ? "Completo" : "Incompleto";
                }
                else{
                  if(fdata[i][indice_forn[j].code]){
                    tab_text+=fdata[i][indice_forn[j].code].toString().removeAccents();              
                  }
                  else{
                    tab_text+="";
                  }
                }
                tab_text+="</td>";
                break;
            }
          }
          else{
            switch (indice_amos[j].code){
              case "NOTES":
                var segnote=[];
                for(var k=0;k<fdata[i].NOTES.length;k++){
                  if(fdata[i].NOTES[k].SEGM_COD === this.usr.SEGM_COD || this.usr.SEGM_COD === "TD"){
                    segnote.push(fdata[i].NOTES[k]);
                  }
                }
                if(segnote.length){
                  this.setDate(segnote);
                  tab_text+="<td>";
                  for(var k=0;k<segnote.length;k++){
                    tab_text+="<b>"+segnote[k].CREATE_DATE+" | "+segnote[k].OBJ_ID+" - </b>"+segnote[k].USU_NOME+" - "+segnote[k].SEGM_DESC+" - "+segnote[k].NOTA_DESC.removeAccents()+"<hr/>";
                  }
                  tab_text+="</td>";
                }
                else{
                  tab_text+="<td></td>";
                }
                break;
              case "COMPOSITIONS":
                var arr=[];
                tab_text+="<td>";
                for(var k=0;k<fdata[i].COMPOSITIONS.length;k++){
                  arr.push(this.fdata[i].COMPOSITIONS[k].COMP_DESC.capitalize());
                }
                tab_text+=arr.join(" , ")+"</td>";
                break;
              default:
                tab_text+="<td>";
                if(indice_amos[j].pattern){
                  tab_text+=indice_amos[j].pvalue;
                }
                else{
                  if(fdata[i][indice_amos[j].code]){
                    tab_text+=fdata[i][indice_amos[j].code].toString().removeAccents();
                  }
                  else{
                    tab_text+="";
                  }
                }
                tab_text+="</td>";
                break;
            }
          }
          
        }
        tab_text+="</tr>";
      }

      var ua = window.navigator.userAgent;
      var msie = ua.indexOf("MSIE "); 
      if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
      {
        document.open("txt/html","replace");
        document.write(tab_text);
        document.close();
        
        var sa = document.execCommand("SaveAs",true,"WebFair Report.xls");
        return (sa);
        /*this.mode=this.page+"/"+(this.fairval || "padrao")+"/"+(this.fornval.replace(" ","_") || "padrao")+"/"+(this.amosval.replace(" ","") || "padrao");
        window.open(link+"#"+this.mode);*/
      }  
      else{
        sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
        return (sa);
      }                 //other browser not tested on IE 11


      
    },
    getSpot:function(a){
      //debugger;
      var context=this;
      //13 === a.keyCode ? (this.spotlight.close(), this.searchEl.trigger("submit")) : (this.filter.close(), 1 < a.target.value.length ? this.spotlight.open(a) : this.spotlight.close());
      if(13 === a.keyCode){
        var a=$(a.target);
        if(!a.val().length){
          this.fornval="";
        }
        else{
          if(isNaN(a.val())){
            this.fornval=a.val();
          }
          else{
            this.fornval="alt"+a.val();
          }
        }
        this.fornclick=this.fornval;
        this.savingCookie(this.page);
        
        this.resetFilters();
        this.mode=this.page+"/"+((""+this.fairval).replace(" ","_") || "padrao")+"/"+((""+this.fornval).replace(" ","_").replace("/","--").replace("/","--") || "padrao")+"/"+((""+this.amosval).replace(" ","_").replace("/","--").replace("/","--") || "padrao");
        
        var status;
        status=setInterval(function(){
          if(!context.ajaxrequest){
            context.navigate(context.mode, !0);
            clearInterval(status);
          }
        },1000);
        //this.spotlight.select(a);
      }
      else{
        if(0 < a.target.value.length){
          this.spotlight.input=$(a.target);
          if(40 === a.keyCode || 38 === a.keyCode) {
            return this.spotlight.arrow(a), !1;
            //return this.arrow(a), !1;
          }
          else{
            $(".spotlight").html("<li>Carregando...</li>").show();
            this.callService("combosearch",'<FORN_DESC>'+a.target.value+'</FORN_DESC>','<FEIR_COD></FEIR_COD>','<LINHA_I>'+'1'+'</LINHA_I>','<LINHA_F>'+'60'+'</LINHA_F>','<CREATE_DATE_I>1900-10-17</CREATE_DATE_I>','');
          }
        }
        else{
          this.fornval=a.target.value;
          this.fornclick=this.fornval;
          this.spotlight.close();
        }
      }
      return !1;
    },
    getFornVal:function(){
      return this.fornval;
    },
    getFairVal:function(){
      return this.fairval;
    },
    setFairVal:function(a){
      this.fairval=a;
    },
    setFornVal:function(a){
      this.fornval=a;
    },
    getAmosVal:function(){
      return this.amosval;
    },
    setAmosVal:function(a){
      this.amosval=a;
    },
    getPage:function(){
      return this.page;
    },
    setPage:function(a){
      this.page=a;
    },
    getSegm:function(){
      return this.segm;
    },
    setSegm:function(a){
      this.segm=a;
    },
    setFornClick:function(a){
      this.fornclick=a;
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
          if($(".date-filter").hasClass('sel')){
            $(".date-filter").trigger('click');
          }
          this.spotlight.close();
          this.maskEl.fadeIn();
          //$("html").attr("id",'noscroll');
          this.loading = !0;
        } else {
          this.maskEl.fadeOut();
          //$("html").removeAttr("id");
          this.loading = !1;
        }
      } else {
        if (a) {
          if($(".date-filter").hasClass('sel')){
            $(".date-filter").trigger('click');
          }
          this.spotlight.close();
          this.loader.fadeOut();
          this.maskEl.fadeIn();

          //$("html").attr("id",'noscroll');
          this.loading = !0;
        } else {
          this.maskEl.fadeOut();
          this.loader.fadeIn();
          //$("html").removeAttr("id");
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
      a && !this.loading ? (this.maskEl.fadeIn(), this.loading = !0) : !1 === a && this.loading && (this.maskEl.fadeOut(), this.loading = !1);
      return this.loading;
    },
    

    getdata:function(filter){
      if(filter){
        var context=this,itens=[];
        this.fdata.filter(function(a,b){
          if(a.AMOS_ID){
            if(a.AMOS_ID == filter){
              itens.push(a);
              itens.push(context.fdata[b-1]);
              itens.push(context.fdata[b+1]);
              return itens;
            }
          }
          else{
            if(a.FORN_ID == filter){
              itens.push(a);
              return itens;
            }
          }
        });
        return itens;
      }
      else{
        return this.fdata;
      }
    },
    savingCookie:function(what,tofornclick,valforn){
      if(tofornclick){
        if(what === "fornecedores"){
          if($.cookie("cookiefornecedores")){
            this.cookiefornecedores.push(jQuery.parseJSON($.cookie("posscroll"+"cookiefornecedores")));
            var scroll={
              "fornval":''+this.cookiefornecedores[0].fornval,
              "fairval":''+this.cookiefornecedores[0].fairval,
              "amosval":''+this.cookiefornecedores[0].amosval,
              "fornclick":''+valforn,
              "dates":this.cookiefornecedores[0].dates[0],
              "prices":this.cookiefornecedores[0].prices,
              "refine":this.cookiefornecedores[0].refine,
              "combofilter":this.cookiefornecedores[0].combofilter,
              "fstatus":this.cookiefornecedores[0].cadstatus,
              "nsort":this.cookiefornecedores[0].nsort,
              "view":""+this.cookiefornecedores[0].view,
              "segmval":this.cookiefornecedores[0].segval,
              "cadprincipal":this.cookiefornecedores[0].cadprincipal,
              "posscroll":(this.cookiefornecedores[0].posscroll || 0),
              "total":(this.cookiefornecedores[0].total || 20)
            }

            //console.dir(this.cookiefornecedores[0]); 
            //console.dir(this.fornecedores.item);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
          }
          else{
            var scroll={
              "fornval":''+this.fornval,
              "fairval":''+this.fairval,
              "amosval":''+this.amosval,
              "fornclick":''+(valforn || ""),
              "dates":[this.initialTimeForn,this.endTimeForn],
              "prices":this.prices,
              "refine":this.filter.list,
              "combofilter":this.combofilter,
              "fstatus":this.cadstatus,
              "nsort":this.nsort,
              "cadprincipal":this.cadprincipal,
              "view":""+this.view,
              "segmval":this.segmval,
              "posscroll":(this.posscroll || 0),
              "total":(this.total || 20)
            }
          }
        }
        else{
          var scroll={
            "fornval":''+this.fornval,
            "fairval":''+this.fairval,
            "amosval":''+this.amosval,
            "fornclick":''+(valforn || ""),
            "dates":[this.initialTimeAmos,this.endTimeAmos],
            "prices":this.prices,
            "refine":this.filter.list,
            "combofilter":this.combofilter,
            "fstatus":this.fstatus,
            "nsort":this.nsort,
            "cadprincipal":this.cadprincipal,
            "view":""+this.view,
            "segmval":this.segmval,
            "posscroll":(this.posscroll || 0),
            "total":(this.total || 20)
          }
          /*console.log("WINDOW 0");
          //debugger;
          $(".container-fullsize.scroller").scrollTop(0);*/
        }
      }
      else{
        if(what === "amostras"){
          var scroll={
            "fornval":''+this.fornval,
            "fairval":''+this.fairval,
            "amosval":''+this.amosval,
            "fornclick":''+this.fornclick,
            "dates":[this.initialTimeAmos,this.endTimeAmos],
            "prices":this.prices,
            "refine":this.filter.list,
            "combofilter":this.combofilter,
            "fstatus":this.fstatus,
            "nsort":this.nsort,
            "view":""+this.view,
            "segmval":this.segmval,
            "cadprincipal":this.cadprincipal,
            "posscroll":(this.posscroll || 0),
            "total":(this.total || 20)
          };
        }
        else{
          var scroll={
            "fornval":''+this.fornval,
            "fairval":''+this.fairval,
            "amosval":''+this.amosval,
            "fornclick":''+this.fornclick,
            "dates":[this.initialTimeForn,this.endTimeForn],
            "prices":this.prices,
            "refine":this.filter.list,
            "combofilter":this.combofilter,
            "fstatus":this.cadstatus,
            "nsort":this.nsort,
            "view":""+this.view,
            "segmval":this.segmval,
            "cadprincipal":this.cadprincipal,
            "posscroll":(this.posscroll || 0),
            "total":(this.total || 20)
          };
        }
        
      }
      $.cookie.json = !0;
      this["cookie"+what]=[];
      this["cookie"+what].push(scroll);
      //console.dir(e.cookiefair);
      $.cookie("posscroll"+what, scroll, {expires:7, path:"/"});
    },
    setCookieFair:function(page,val){
      if(this["cookie"+page].length){
        this["cookie"+page][0].fornclick = val;
        this["cookie"+page][0].fornval = val;
      }
    },
    getContPrincipalFornecedores:function(){
      return this.cadprincipal;
    },
    scroll:function(z) {
      var b, c, f, clone,e = this;
      z = z || $(".container-fullsize.scroller");
      //console.log("DEU SCROLL");
      //$.hasData(z[0]) && z.unbind("scroll");
      //console.dir(e.content.itens);
      //console.dir(z);
      if (!e.content.itens) {
        return !1;
      }
      z.scroll(function() {
        //console.log(e.page);
        if (e.loading || e.page === "detail") {
          return!1;
        }
        e.spotlight.close();

        switch (e.page){
          case "amostras":
            d = z.scrollTop();
            b = e.content.itens.length;
            console.log(b);
            f=0;
            if(e.view === "images"){
              $(".overview-container").each(function() {
                  f += $(this).height();
              });
              f-=$(".scroller").outerHeight();
            }
            else{
              $(".overview-container").each(function() {
                  f += $(this).height();
              });
              f-=$(".scroller").outerHeight();
            }

            if(d<f){
              e.posscroll=d;
              e.total=b;
              e.savingCookie("amostras");
            }

            if (d >= f && b) {
              console.log(b+" = "+e.data.length);
              if(b<e.data.length){
                console.log("OK");
                e.content.page++;
                e.setloading(!0,!1);
                e.reopenFilter(e.data, e.content.page, !0);
                //e.submit("<FEIR_COD>"+(e.fairval || "")+"</FEIR_COD>","<FORN_DESC>"+e.fornval+"</FORN_DESC>",(e.amosval || ""),!0);
              }
            }
            break;
          case "fornecedores":

            /*var $table = $('#table');
            $table.floatThead({
                scrollContainer: function($table){
                return $table.closest('.scroller');
              }
            });*/

            d = z.scrollTop();
            b = e.content.itens.length;
            f= $("#table").height()-$(".scroller").outerHeight();
            console.log(b);

            if(d<f){
              e.posscroll=d;
              e.total=b;
              e.savingCookie("fornecedores");
            }
            
            if (d >= f && b) {
              if(b < e.data[0].COUNT_FORN){
                e.content.page++;
                e.setloading(!0,!1);
                e.submit("<FEIR_COD>"+(e.fairval || "")+"</FEIR_COD>","<FORN_DESC>"+(e.fornval || "")+"</FORN_DESC>",(e.amosval || ""),!0,e.cadstatus,e.cadprincipal);
                //e.createbox(e.data, e.content.page, !0,"list");
              }
            }
            break;
          case "fornecedor_cadastro":
            //console.log("SCROLL CADASTRO");
            break;
          case "local":
            /*var $table = $('#table');
            $table.floatThead({
                scrollContainer: function($table){
                return $table.closest('.scroller');
              }
            });
            $(".floatThead-container").css({'left':"50%","margin-left":"-458px"});*/
            //$(".floatThead-table").css({'left':"50%","margin-left":"502px"});
            d = z.scrollTop();
            b = e.content.itens.length;
            //f= $("#table").height()-720;
            f= $("#table").height()-$(".scroller").outerHeight();

            //console.log(d+" , "+f);
            if (d >= f && b) {
              if(b < e.fair.length){
                e.content.page++;
                e.setloading(!0,!1);
                if(e.ffair.length){
                  e.createbox(e.ffair, e.content.page, !1,"list");
                }
                else{
                  e.createbox(e.fair, e.content.page, !1,"list");
                }
              }
            }
            break;
          case "template_email":
            /*var $table = $('#table');
            $table.floatThead({
                scrollContainer: function($table){
                return $table.closest('.scroller');
              }
            });
            $(".floatThead-container").css({'left':"50%","margin-left":"-458px"});*/
            d = z.scrollTop();
            b = e.content.itens.length;
            f= $("#table").height()-$(".scroller").outerHeight();
            if (d >= f && b) {
              if(b < e.fdata.length){
                //console.log("chegou");
                e.content.page++;
                e.setloading(!0,!1);
                e.createbox(e.fdata, e.content.page, !1,"list");
              }
            }
            break;
        }
      });
      /* Act on the event */
    },
    reopenFilter:function(data,page,d,view,haslength){
      //this.setloading(!0,!1);
      this.filterisdone=!1;
      if(this.page === "amostras"){

        $("input[name='initial_date']").datepicker('setDate', (this.initialTimeAmos && this.initialTimeAmos.slice(0,4)+'-'+this.initialTimeAmos.slice(5, 7)+"-"+this.initialTimeAmos.slice(8, 10)));
        $("input[name='end_date']").datepicker('setDate', (this.endTimeAmos && this.endTimeAmos.slice(0,4)+'-'+this.endTimeAmos.slice(5, 7)+"-"+this.endTimeAmos.slice(8, 10)));
      }
      else{
        $("input[name='initial_date']").datepicker('setDate', (this.initialTimeForn && this.initialTimeForn.slice(0,4)+'-'+this.initialTimeForn.slice(5, 7)+"-"+this.initialTimeForn.slice(8, 10)));
        $("input[name='end_date']").datepicker('setDate', (this.endTimeForn && this.endTimeForn.slice(0,4)+'-'+this.endTimeForn.slice(5, 7)+"-"+this.endTimeForn.slice(8, 10)));
      }
      if(this.prices.length){
        //Fazer o trigger no filtro
        $(".main_opt_item.tooltip.tooltip-selectable").eq(0).addClass('has');
        $("input[name='initial_price']").val(this.prices[0]);
        $("input[name='end_price']").val(this.prices[1]);
      }
      if(this.fstatus !==null){
        $(".status.tooltip-selectable").addClass('has');
        $(".status[name='"+this.fstatus+"']").addClass('sel');
      }
      if(this.combofilter){
        if(this.combofilter.is_set){
          $(".tooltip-filter").addClass('has');
        }
        for(prop in this.combofilter){
          if(this.combofilter[prop].clicked){
            $(".filterlist a[name='"+prop+"'][href='"+this.combofilter[prop].code+"']").addClass('sel');
          }
        }
      }

      if(this.refine.length){
        //Fazer o trigger no filtro
        this.filter.list=this.refine;
        this.filter.data=this.data;
      }
      if(this.page === "amostras"){
        if(this.initialTimeAmos !== null || this.endTimeAmos !== null){
          $(".date-filter").parent().addClass('has');
        }
        else{
          $(".date-filter").parent().removeClass('has');
        }
      }
      else{
        if(this.initialTimeForn !== null || this.endTimeForn !== null){
          $(".date-filter").parent().addClass('has');
        }
        else{
          $(".date-filter").parent().removeClass('has');
        }
      }
      

      //REOPEN      
      this.Componentfilter(data,page,d,view,haslength);
    },
    reset:function(){
      //console.log("resetou APP");
      this.data = [];
      this.fdata = [];
      this.itens = $([]);
      this.select_items = [];
      this.itens.remove();
      this.filter.reset();
      this.unable_select=!1;
      this.is_selected=!1;
      this.fornidselect=0;
      this.thanks=!1;
      this.content.reset();
      //$("#table").floatThead('destroy');
    },
    restartValues:function(){
      //Var to storage the basic data
      //console.log("restartValues");
      this.unable_select=!1;
      this.is_selected=!1;
      this.fornidselect=0;
      if(this.page === "amostras"){
        this.cookieamostras=[];
      }
      else{
        this.cookiefornecedores=[];
      }
      this.prices=[];
      this.refine=[];
      this.fstatus=null;
      this.cadstatus=undefined;
      this.cadprincipal=undefined;
      this.fairval="";
      this.fornval="";
      this.amosval="";
      this.fornclick="";
      //this.nsort="AMOS_DESC";
      this.nsort="";
      /*this.initialTime=null;
      this.endTime=null;*/
      $.removeCookie('posscroll'+this.page, { path: '/' });
      this.combofilter={
        "FLAG_FISICA":{"clicked":0,"code":0},
        "FLAG_PRIORIDADE":{"clicked":0,"code":0},
        "AMOS_HOMOLOGAR":{"clicked":0,"code":0},
        "AMOS_ENV_EMAIL":{"clicked":0,"code":0},
        "NOTES":{"clicked":0,"code":0},
        "is_set":0
      };
      //$table.floatThead('destroy');
    },
    resetFilters:function(){  
      //console.log("resetou FILTROS");
      //DATE
      /*$("input[name='initial_date']").val("");
      $("input[name='end_date']").val("");
      this.initialTime=null;
      this.endTime=null;*/

      //PRICE
      $("input[name='initial_price']").val("");
      $("input[name='end_price']").val("");
      this.prices=[];
      $(".main_opt_item.tooltip.tooltip-selectable").eq(0).removeClass('has');


      this.fstatus=null;
      this.cadstatus=undefined;
      this.cadprincipal=undefined;
      $(".status button").removeClass('sel');
      $(".status.tooltip-selectable").removeClass('has');
      //this.nsort="AMOS_DESC";
      this.nsort="";

      this.combofilter={
        "FLAG_FISICA":{"clicked":0,"code":0},
        "FLAG_PRIORIDADE":{"clicked":0,"code":0},
        "AMOS_HOMOLOGAR":{"clicked":0,"code":0},
        "AMOS_ENV_EMAIL":{"clicked":0,"code":0},
        "NOTES":{"clicked":0,"code":0},
        "is_set":0
      };
      $(".filterlist a").removeClass('sel');
      $(".tooltip-filter").removeClass('has');

      $(".refine a").removeClass('sel').addClass('unsel');
      $(".topcount").text("").addClass('hide');
      $(".not-autoshow").removeClass('sel');
      $(".sub-refine").addClass('hide').hide().find("ul").empty();

      $("select[name='FORN_STATUS']").find("option").removeAttr('selected');
      $("select[name='CONT_PRINCIPAL']").find("option").removeAttr('selected');
      $("select.AMOS_SEGM_COD").find("option").removeAttr('selected');
      //Filter list
      //this.filterlist.length=0;
    }
  });
  new App;
  Spine.Route.setup();
});