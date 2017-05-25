/**
*@fileOverview Content's page with Modal, Content and Boxes classes
* @module Modal
* @module Content
*
*/

/**
* Spotlight's class and actions
* @exports Spotlight
* @constructor
*/
window.Modal = Spine.Controller.sub({
  elements:{
     ".modal-content":"content", ".tut-content":"contut", ".tut-list li":"buttons", ".pag-list":"dots", ".tut-box":"box", ".modal-text h2":"title", ".modal-text p":"msg"
  }, 
  events:{
    "click .bclose":"close",/* "click .modal-buttons a":"action",*/ "click .tut-list li":"select", "click .pag-list li":"page"
  }, 
  /**
  * Open Modal with title and contentMessage
  * @param {String} a - Title to modal
  * @param {String} b - Content Message to modal
  * @memberOf ModalHome#
  * @name open
  */
  open : function(a,b,c,d){
    a = a || "Titulo da Mensagem";
    b = b || "";
    this.content.removeClass("bad");
    c && this.content.addClass("bad");
    this.title.text(a.capitalize());
    this.msg.html(b);
    this.el.fadeIn();
    if(d && "function" === typeof d)
      this.callback = d;
  },

  /**
  * Open Modal with tutorial set
  * @param {event} a - click button to tutorial
  * @memberOf ModalHome#
  * @name openTutorial
  */
  openTutorial : function(a){
    a = a || 0;
    this.el.addClass("tutorial");
    this.content.removeClass('bad');
    this.buttons.eq(a).trigger("click");
    this.el.fadeIn();
  },

  /**
  * Close Modal
  * @param {event} a - click button to close
  * @memberOf ModalHome#
  * @name close
  */
  close : function(a){
    if("object" === typeof a) {
        a.preventDefault(), $(a.target);
    }
    this.el.fadeOut(function() {
      $(this).attr('class','hide');
    });
    this.callback && this.callback();
  },

  /**
  * Change page to slideshow
  * @param {event} a - click button to close
  * @memberOf ModalHome#
  * @name page
  */
  page : function(a){
    if("object" === typeof a) {
        a.preventDefault(), a = $(a.target);
    }else {
        return!1;
    }
    if(a.hasClass("sel")) {
        return!1;
    }
    this.dots.find("li").removeClass("sel");
    a.addClass("sel");
    a = 610 * -a.index();
    this.contut.animate({left:a}, 400);
  },

  /**
  * Change slidepage when click at tut-list buttons. This method filter into ajax from tutorial and call This.Boxed to create the page
  * @param {event} a - click button to close
  * @memberOf ModalHome#
  * @name select
  */
  select : function(a){
    var b;
    if("object" === typeof a) {
      a.preventDefault(), a = $(a.target);
    }else {
      return!1;
    }
    if(a.hasClass("sel")) {
      return!1;
    }
    this.dots.find("li").hide();
    this.buttons.removeClass("sel");
    a.addClass("sel");
    b = this.tutlist.filter(function(b) {
      return-1 !== b.MENU.toLowerCase().indexOf(a.text().toLowerCase());
    });
    this.boxes(b);
  },

  /**
  * Create the Tutorial's Page itself
  * @param {array} a - Value of two container of the page
  * @memberOf ModalHome#
  * @name boxes
  */
  boxes : function(a){
    this.contut.empty();
    for(var b = [], c, d = 0;d < a.length;d++) {
      c = "<div class='tut-box'><span class='tut-img' style='background-position: 0px -" + parseInt(90 * (a[d].ID - 1)) + "px'></span><h2><span class='tut-number'>" + parseInt(d + 1) + "</span>" + a[d].TITLE + "</h2><p>" + a[d].DESC + "</p></div>", b.push(c);
    }
    c = Math.round(a.length / 2);
    1 < c && this.dots.find("li:lt(" + c + ")").removeClass("sel").show().eq(0).addClass("sel");
    this.contut.width(320 * a.length).html(b.join(" ")).animate({left:0}, 0);
  },
  init : function(){
    this.tutlist = [];
    this.callback = null;
    $.getJSON("ajax/tutorial.js", this.proxy(function(a) {
      this.tutlist = a;
    }));
  }
});

/**
* Spotlight's class and actions
* @exports Content
* @constructor
*/
window.Content = Spine.Controller.sub({
  elements:{
  }, 
  events:{
  }, 
  changeview:function(a){
    if(a === "images"){
      this.container=$(".viewport");
    }
    else{
      this.container=$("table tbody");
    }
  },
  /**
  * Replace all attributes of the html with the values of json
  * @param {String} tpl - template to create itens
  * @param {Array} data - list of object to replate template
  * @return {String} tpl - return a String to be append to container after
  * @memberOf Content#
  * @name mergeData
  */
  mergeData:function(tpl, data) {
    var val, i,atts;
        if(data.hasOwnProperty("MATNR")){
          data["IMG_MATNR"]=data.MATNR.slice(0,15);
        }
        if(!data["ATC"]){
          data["ATC"]="Indefinido";
        }
        atts = Object.keys(data);
    for (i = atts.length - 1; i >= 0; i--) {
        val = this.contentType(atts[i], data);
        tpl = tpl.replaceAll("{{" + atts[i] + "}}", val);
    }
    return tpl;
  },

  /**
  * Fill a table or list with data
  * @param {string} tpl - string HTML Template
  * @param {Function} callback - function to be executed after renderContent
  * @memberOf Content#
  * @name renderContent
  */
  renderContent: function(tpl, data, callback) {
    var i;

    /*for (i = 0; i < data.length; i++) {
        lines += this.mergeData(tpl, data[i]);
    }*/
    this.lines += this.mergeData(tpl, data);

    //'<li class="col col-sm-1 col-sm-2 col-md-1 col-md-2 col-md-3 col-med-4 col-lg-1 col-lg-2 col-lg-3 col-lg-4 ng-scope"><div class="thumbnail"><a href="#detail/{{MATNR}}"><img src="http://189.126.197.169/img/small/small_{{IMG_MATNR}}.jpg"></a><div class="caption"><div class="caption-top"><a href="#detail/{{MATNR}}" class="link">{{MATNR}}</a><h4>{{MAKTX}}</h4><p class="pantone">Pantone: {{CODIGO_PANTONE}}</p></div><ul class="estoque"><li class="storage line">PE: {{PE}}</li><li class="storage">ATC: {{ATC}}</li></ul><ul ng-show="true" class="view_24"><li><a href="/focus24h/#detail/{{MATNR}}" name="{{MATNR}}" target="_blank"><p>Reserve este artigo</p></a></li></ul></div></div></li></ul>'
    if (callback && typeof(callback) === "function") {
        callback();
    }else{
        return !1;
    }
  },



  /**
  * Adjustments in the content when some attributes need a special treatment
  * @param {String} att - Attribute to be find and treat
  * @param {Array} data - Object to has it's attr treated
  * @return {Object} data[att] - Value returned from a treat
  * @memberOf Content#
  * @name contentType
  */
  contentType: function(att, data) {
    switch (att) {
        case "CODIGO_PANTONE":
          if(!data[att] || data[att] === " "){
            return "Indefinido";
          }
          else{
            return data[att].capitalize();
          }
          break;
        case "PE":
          var uni="";
          if(data['UNIDADE_MEDIDA'] === "MT"){    
            uni="m";
          }
          else{
            uni=data['UNIDADE_MEDIDA'];
          }
          return Math.floor(data[att])+" "+uni;
          break;
        case "ATC":
            if(isNaN(data["ATC"])){
              return "Indefinido";
            }

            var uni="";
            if(data['UNIDADE_MEDIDA'] === "MT"){    
              uni="m";
            }
            else{
              uni=data['UNIDADE_MEDIDA'];
            }
            return Math.floor(data[att])+" "+uni;
            break;
        case "GRUPO":
          if(this.container.hasClass('info-text-holder')){
            return data[att];
          }
          else{
            return data[att].toUpperCase();
          }
          break;
        case "SGRUPO":
          if(this.container.hasClass('info-text-holder')){
             return data[att];
          }
          else{
            return data[att].toUpperCase();
          }
          break;
        case "LARGURA_UTIL":
          return parseFloat(data[att])
          break;
        case "LARGURA_TOTAL":
          return parseFloat(data[att])
          break;
        case "ATRIBUTOS":
          return data[att].initialCaps();     
          break;     
        case "CARACTERISTICAS":
          return data[att].initialCaps();
          break;
        default:
            return data[att];
    }
  },
  /**
  * Search for a line in JSON data
  * @param {String} key - Key to be searched
  * @param {String} value - Value to be compared
  * @param {Array} data - Array or json elements
  * @memberOf Content#
  * @name renderContent
  */
  searchLine: function(key, value, data) {
      for (var i = 0; i < data.length; i++) {
          if (data[i][key] === value) {
              return data[i];
          }
      }
      return;
  },

  clean: function(){
    $("table tbody").empty();
    $(".viewport").empty();
    this.lines = "";
  },
  reset: function(){
    this.page = 0;
    this.container=$(".viewport");
    this.clean();
    this.lines = "";
  },
  init : function(){
    this.lines = "";
    // Samples of templates
    // {{XX}} - XX sendo o nome do atributo no objeto.
    this.temps={
      'images':'<li class="col col-sm-1 col-sm-2 col-md-1 col-md-2 col-md-3 col-med-4 col-lg-1 col-lg-2 col-lg-3 col-lg-4 ng-scope"><div class="thumbnail"><a href="#detail/{{MATNR}}"><img src="http://189.126.197.169/img/small/small_{{IMG_MATNR}}.jpg"></a><div class="caption"><div class="caption-top"><a href="#detail/{{MATNR}}" class="link">{{MATNR}}</a><h4>{{MAKTX}}</h4><p class="pantone">Pantone: {{CODIGO_PANTONE}}</p></div>',
      'images_estoque':'<li class="col col-sm-1 col-sm-2 col-md-1 col-md-2 col-md-3 col-med-4 col-lg-1 col-lg-2 col-lg-3 col-lg-4 ng-scope"><div class="thumbnail"><a href="#detail/{{MATNR}}"><img src="http://189.126.197.169/img/small/small_{{IMG_MATNR}}.jpg"></a><div class="caption"><div class="caption-top"><a href="#detail/{{MATNR}}" class="link">{{MATNR}}</a><h4>{{MAKTX}}</h4><p class="pantone">Pantone: {{CODIGO_PANTONE}}</p></div><ul class="estoque"><li class="storage line">PE: {{PE}}</li><li class="storage">ATC: {{ATC}}</li></ul>',
      'images_view24h':'<li class="col col-sm-1 col-sm-2 col-md-1 col-md-2 col-md-3 col-med-4 col-lg-1 col-lg-2 col-lg-3 col-lg-4 ng-scope"><div class="thumbnail"><a href="#detail/{{MATNR}}"><img src="http://189.126.197.169/img/small/small_{{IMG_MATNR}}.jpg"></a><div class="caption"><div class="caption-top"><a href="#detail/{{MATNR}}" class="link">{{MATNR}}</a><h4>{{MAKTX}}</h4><p class="pantone">Pantone: {{CODIGO_PANTONE}}</p></div><ul ng-show="true" class="view_24"><li><a href="/focus24h/#detail/{{MATNR}}" name="{{MATNR}}" target="_blank"><p>Reserve este artigo</p></a></li></ul></div></div></li></ul>',
      'images_estoque_view24h':'<li class="col col-sm-1 col-sm-2 col-md-1 col-md-2 col-md-3 col-med-4 col-lg-1 col-lg-2 col-lg-3 col-lg-4 ng-scope"><div class="thumbnail"><a href="#detail/{{MATNR}}"><img src="http://189.126.197.169/img/small/small_{{IMG_MATNR}}.jpg"></a><div class="caption"><div class="caption-top"><a href="#detail/{{MATNR}}" class="link">{{MATNR}}</a><h4>{{MAKTX}}</h4><p class="pantone">Pantone: {{CODIGO_PANTONE}}</p></div><ul class="estoque"><li class="storage line">PE: {{PE}}</li><li class="storage">ATC: {{ATC}}</li></ul><ul ng-show="true" class="view_24"><li><a href="/focus24h/#detail/{{MATNR}}" name="{{MATNR}}" target="_blank"><p>Reserve este artigo</p></a></li></ul></div></div></li></ul>',
      
      'list':'<tr><td><a href="#detail/{{MATNR}}" class="detail-link">{{MAKTX}}</a></td><td class="amoscode">{{MATNR}}</td><td>{{CODIGO_PANTONE}}</td><td>{{GRUPO}}</td><td>{{SGRUPO}}</td><td>-</td><td>-</td></tr>',
      'list_estoque':'<tr><td><a href="#detail/{{MATddddR}}" class="detail-liddddk">{{MAKTX}}</a></td><td class="amoscode">{{MATNR}}</td><td>{{CODIGO_PANTONE}}</td><td>{{GRUPO}}</td><td>{{SGRUPO}}</td><td>{{PE}}</td><td>{{ATC}}</td></tr>',
      'list_view24h':'<tr><td><a href="#detail/{{MATNR}}" class="detail-link">{{MAKTX}}</a></td><td> class="amoscode"{{MATNR}}</td><td>{{CODIGO_PANTONE}}</td><td>{{GRUPO}}</td><td>{{SGRUPO}}</td>><td>-</td><td>-</td></tr>',
      'list_estoque_view24h':'<tr><td><a href="#detail/{{MATNR}}" class="detail-link">{{MAKTX}}</a></td><td class="amoscode">{{MATNR}}</td><td>{{CODIGO_PANTONE}}</td><td>{{GRUPO}}</td><td>{{SGRUPO}}</td><td>{{PE}}</td><td>{{ATC}}</td></tr>',

      'detail-top':'<h4>{{MAKTX}}</h4><dl><dt>Código do Artigo:</dt><dd>{{MATNR}}</dd><dt>Pantone:</dt><dd class="ng-binding">{{CODIGO_PANTONE}}</dd><dt>Composição de Base:</dt><dd class="base">Carregando...</dd> <dt class="adorno-title">Composição de Bordado, Revestimento, Adorno:</dt><dd class="adorno">Carregando...</dd><dt  class="conj-title">Composição de Conjunto:</dt><dd class="conj">Carregando...</dd> <dt>Gram/m²:</dt><dd>{{GRAMATURA_M}} g/m²</dd><dt>Gram/m:</dt><dd>{{GRAMATURA_ML}} g/m</dd><dt>Largura Útil:</dt><dd class="ng-binding">{{LARGURA_UTIL}} m</dd><dt>Largura Total:</dt><dd class="ng-binding">{{LARGURA_TOTAL}} m</dd><dt class="rend">Rendimento</dt><dd class="rend rend-item">Carregando...</dd><dt>Grupo:</dt><dd class="ng-binding">{{GRUPO}}</dd><dt>Sub-Grupo:</dt><dd class="ng-binding">{{SGRUPO}}</dd><dt>Book:</dt><dd class="ng-binding">{{EBOOK_CODE}} / {{EBOOK_PAGE}}</dd><dt>Unidade de Medida:</dt><dd class="ng-binding">{{UNIDADE_MEDIDA}}</dd><dt class="storage">PE:</dt><dd class="storage">{{PE}}</dd><dt ng-show="estoque" class="storage">ATC:</dt><dd class="storage">{{ATC}}</dd></dl>',
      'detail-down':'<dl><dt>Instruções de Lavagem:</dt><dd class="wash ng-binding">{{ETIQUETA}}</dd><br><dt>Utilização:</dt><dd class="util">Carregando...</dd><br><dt>Atributos:</dt><dd class="ng-binding">{{ATRIBUTOS}}.</dd><br><dt>Características:</dt><dd class="ng-binding">{{CARACTERISTICAS}}.</dd><br><dt>Similaridade:</dt><dd class="similar">Carregando...</dd></dl>'
    }
    this.page = 0;
    this.container=$(".viewport");
  }
});

window.Promotion=Spine.Controller.sub({
  elements:{
      
  }, 
  events:{
      "click .group-menu .group_menu_item":"selectGroup"
  },
  requestPromo:function(code){
    if(this.getloading()){
      return !1
    }
    $.post(nodePath + "index.js?service=Ebook.svc/getPromocao/&query=0?callback=?", this.proxy(this.getPromo), "json")
    .fail(function(){console.log("erro")});
    /*$.post("http://was-dev/focus24/Services/Ebook.svc/getPromocao/0?callback=?", this.proxy(this.getPromo), "json")
    .fail(function(){console.log("erro")});*/
  },
  expPromoRequestMenu:function(evt){
    if ("object" === typeof evt) {
      evt.preventDefault();
    }
    //http://ii3/services/Services/SearchMaterial.svc/OutletGroup/
    if (this.getloading()) {
        return !1;
    }
    if((parseInt($('.bread-page').text())) && ("object" !== typeof evt)){
      console.log("OK - "+this.group+" , "+this.getAmosVal());
      this.startListOutlet("Alfaiatarias");
    }
    else{
      this.setloading(!0);
      $.getJSON(nodePath + "index.js?service=SearchMaterial.svc/OutletGroup/&query=?callback=?", this.proxy(this.expPromoCreateGroupMenu)).fail(function() {
          console.log("second success");
      }).fail(function() {
          console.log("error");
      }).always(function() {
          console.log("complete");
      });
    }
    
  },
  expPromoCreateGroupMenu:function(a,b){
    var html="";
    for(var i=0;i<a.length;i++){
        console.log(a[i]);
        html+="<li><a href='#"+a[i].capitalize()+"' name='"+a[i].capitalize()  +"' class='group_menu_item'>"+a[i].capitalize()+"</button></li>";
    }
    //$(".bclear").trigger("click");
    /*if(parseInt($('.bread-page').text())){
      console.log("ok");
      //return !0;
    }*/
    this.setloading(!1);
    this.group_menu.html(html);
    this.group_modal.fadeIn().find(".menu-container").fadeIn();
  },
  selectGroup:function(evt){
    evt.preventDefault();
    this.reset();
    this.group=$(evt.target).attr("name");
    this.group_selected.text(this.group);
    //this.searchEl.removeClass("big");
    this.setloading(!1);
    this.searchEl.find(".form-control").val("");
    this.setBreadarr();
    this.setBreadarr("FocusConnect - "+this.group);
    console.dir(this.getBreadarr());
    this.startListOutlet(this.group);
    this.group_modal.fadeOut();
    //this.g_opened=!1;
    
    //this.breadEl.find(".bread-search span").text(this.group);
  },
  startListOutlet:function(val){
    if (this.getloading()) {
        return !1;
    }
    //this.breadarr = [];
    this.setloading(!0,!1);
    console.log(nodePath + "index.js?service=SearchMaterial.svc/searchOutlet/&query="+val.removeAccents().initialCaps().replace(" de "," ") + "/" + "0" + "/" + "0" +"?callback=?");
    $.getJSON(nodePath + "index.js?service=SearchMaterial.svc/searchOutlet/&query="+val.removeAccents().initialCaps().replace(" de "," ")+ "/" + "0" + "/" + "0" +"?callback=?", this.proxy(this.setdata)).fail(function() {
        console.log("second success");
    }).fail(function() {
        console.log("error");
    }).always(function() {
        console.log("complete");
    });
    return !1;
  },
  getPromo:function(data){
    this.setloading(!0,!1);
    this.promos=data;
    var npromo = filterBy(data, 'COD', this.codpromo);
    var b = npromo[0].DESCRICAO;
    this.breadarr.push(b);
    $.getJSON(nodePath + "index.js?service=SearchMaterial.svc/ebookPromo/" + this.codpromo + "&query=0?callback=?", this.proxy(this.setdata)).fail(function () {
      console.log("erro");
    });
    /*$.getJSON("http://was-dev/focus24/Services/SearchMaterial.svc/ebookPromo/" + this.codpromo + "/0?callback=?", this.proxy(this.setdata)).fail(function () {
      console.log("erro");
    });*/
  },
  init:function(){
    this.promos=[];

    this.codpromo=0;
  },
  reset:function() {
    this.codpromo=0;
    this.group="";
  }
});