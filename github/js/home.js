/**
*@fileOverview Home Page
* @module  Home
* @module  Page
* @module  Promotion
*
*/

/**
*@classDesc This class deal with all action of ' `HomePage` and is a base to others classes
*@exports Home
*@constructor
*/
function Home(){
	this.elements = {
		"el":$("body"),
		"userTx" : $(".user-name"),
		"logoutbtn" : $(".user-logout"),
		"mask" : $(".mask"),
		"promo_container":$(".promos ul"),
		"wrap":$("#wrap"),
		"viewer_buttons":$(".viewer-buttons button"),
		"viewer_desc":$(".viewer-desc"),
		"viewer_media":$(".viewer-media"),
		"search":$(".search"),
		"spotlight":$("#spotlight"),
		"modal":$("#modal"),
		"user_help":$(".user-help"),
		"searchEl":$("form"),
		"menuEl":$("#alt-menu"),
		"header":$("header")
	};

	/**
	*This method is responsible for call all listeners, in our case, call submit listener
	* @memberOf Home#
	* @name events
	*/
	this.events = function(){
		var context=this;
		this.elements.logoutbtn.click(context.logout);
		this.elements.search.bind("keyup",function(a){context.spotlight.getSpot(a)});
		this.elements.searchEl.bind("submit",function(a){context.page.submit(a)});
		this.elements.user_help.bind("click",function(a){context.modal.openTutorial(a)});
		this.elements.viewer_buttons.bind("click",function(a){
			var b;
			if($(a.target).hasClass('ispromo')){
				b=!0;
			}
			else{
				b=!1;
			}
			context.page.changeViewer(a,b);
		});
	};

	/**
	*Initial method, responsible for call events method, verify if user is logged or not and construct others classes.
	* @memberOf Home#
	* @name init
	*/
	this.init = function(){
		this.ajaxrequest=!1;
		this.usr = null;
		this.events();
		//(this.usr = jQuery.parseJSON($.cookie("usr")) || jQuery.parseJSON($.cookie("portal")));
		(this.usr = $.cookie("usr") || $.cookie("portal"));
		if(this.usr){
			this.usr=jQuery.parseJSON(this.usr);
		}
		else
            return this.logout(), !1;

        //Old express url, redirect
        if(window.location.hash.indexOf("express") !== -1){
        	var hash=window.location.hash;
        	pos_string=hash.indexOf("/")+1;
            cod_promo=hash.substr(pos_string, hash.length);
        	window.open("./app.html#search/express/"+cod_promo,"_self");
        }
        this.promo = new PromotionHome(this.elements.promo_container);
        this.page = new Page(this.elements.el);
        this.spotlight = new SpotlightHome(this.elements.spotlight);
        this.modal = new ModalHome(this.elements.modal);
        this.menu=new Menu(this.elements.menuEl);
        this.render();
	};

	/**
	*Render method, responsible to trigger click in base buttons and call methods of crucial classes
	* @memberOf Home#
	* @name render
	*/
	this.render = function(){
		this.page.render();
		this.elements.viewer_desc.find(".viewer-buttons button").eq(0).trigger('click');
		this.elements.viewer_media.find(".viewer-buttons button").eq(0).trigger('click');
		this.promo.requestPromo();
	};

	/**
	*Logout method
	* @param {event} a - Logout event itself
	* @memberOf Home#
	* @name logout
	*/
	this.logout = function (a) {
      a && a.preventDefault();
      $.removeCookie("portal", {
        path: "/"
      });
      window.location = "login.html" + window.location.hash;
    };
};

/**
*@classDesc This class deal with all Page actions, like changeViewer and render
*@exports Page
*@constructor
*/
function Page(el){
	this.el=el;
	this.takedot = !1;
	/**
	* Page's render method
	* @memberOf Page#
	* @name render
	*/
	this.render = function(){
		this.elements.wrap.removeClass('hide');
		this.elements.userTx.text(this.usr.Nome.capitalize());
	};

	/**
	* Change Promos/Criteries view
	* @param {event} a - click event itself
	* @param {boolean} b - Polimorfism attribute to reuse method for promos and media component.If true, change promos component, else change media component.
	* @memberOf Page#
	* @name changeViewer
	*/
	this.changeViewer = function(a,ispromo){
		var target=$(a.target);
		if(ispromo){
			this.elements.viewer_desc.find(".viewer-buttons button").removeClass('sel');
			$(".viewer-desc .home-view").addClass('hide');
			$("."+target.attr("name")).removeClass('hide');
		}
		else{
			this.elements.viewer_media.find(".viewer-buttons button").removeClass('sel');
			$(".viewer-media .media-box").addClass('hide');
			$("."+target.attr("name")).removeClass('hide');
		}
		target.addClass('sel');
	};

	/**
	* When submit the home page's form.Take value, compare if no permissions words, and send to result page.
	* @param {event} a - submit event itself
	* @memberOf Page#
	* @name submit
	*/
	this.submit = function(a){
		a.preventDefault();
		a = arrayObject($(a.target).serializeArray());
		a = a.search;
		this.elements.search.val(a).focus();
		var c, d = "Branco Poliester Cotton Focus Algodao Azuis Alf Malhas Malha Acetinados Acetinado Elastano Poliamida Print Printed Verdes White Vermelho".split(" "); //Rendas Renda 
      	if (this.loading || !a) {
	        return !1;
      	}

      	//The case below is for some compost products like Veludo 4.5 that I have to know that the search has a point, then request all Veludo products and filter all itens that matches with the search with point or not
      	if (-1 !== a.removeAccents().capitalize().indexOf(",") || -1 !== a.removeAccents().capitalize().indexOf(".")) {
	        //If has ',' in the search
	        if (-1 !== a.removeAccents().capitalize().indexOf("Veludo")) {
	          //if the word is veludo
	          var str = a.removeAccents().capitalize();
	          this.takedot = str.substr((a.length) + 1, str.indexOf(' ')); //Passa para um atributo da classe, a palavra apos o espaço
	        }
      	} else {
	        //Caso não tenha , na busca
	        this.takedot = !1;
  		}
  		//alert(this.takedot);
  		//$.cookie("takedot", this.takedot, {expires:7, path:"/"}); // This cookie is to pass the value to another page
  		c = a.removeAccents().capitalize().replace(/\s/g, "");
      	if (-1 !== d.indexOf(c)) {
        	return this.modal.open("Tente novamente", "Adicione mais par\u00e2metros a sua pesquisa.");
      	}
      	window.location.href="app.html#search/artigos/"+a.removeAccents().replace(" de "," ").replace(".",",");
	};
};

/**
*@classDesc This class deal with all Promotion actions, like create and render
*@exports PromotionHome
*@constructor
*/
function PromotionHome(el){
	this.el=el;

	/**
	* Promo's request method
	* @memberOf PromotionHome#
	* @name requestPromo
	*/
	this.requestPromo = function(){
		var context=this;
		this.ajaxrequest=!0;
		$.post(nodePath + "index.js?service=Ebook.svc/getPromocao/&query=0?callback=?",function(data){
			context.promos=data;
			context.render();
		},"json")
		.fail(function(error){
			context.modal.open("Tente novamente", "Um erro ocorreu! Atualize a página e tente novamente.");
		});
		/*$.post("http://was-dev/focus24/Services/Ebook.svc/getPromocao/0?callback=?",function(data){
			context.promos=data;
			context.render();
		},"json")
		.fail(function(error){
			context.modal.open("Tente novamente", "Um erro ocorreu! Atualize a página e tente novamente.");
		});*/
	};

	/**
	* Promo's Render method
	* @memberOf PromotionHome#
	* @name render
	*/
	this.render = function(){
		var first,first_html; // to set a first promo in home
		var i,length,html="",counter=0;
	    length=this.promos.length;
	    this.setDate(this.promos);
	    for(i=0;i<length;i++){
	      if(this.promos[i].active){

	      	if(this.promos[i].COD === "20130345"){
	      		//First promo block code, set a var to be prepend after all
	      		first=this.promos[i];
	      	}
	      	else{
	      		counter++;
	        	html+="<li class='viewer-itens'><a class='item' href='app.html#search/express/"+this.promos[i].COD+"' name='promo'>"+"<h1>"+this.promos[i].DESCRICAO+"</h1>"+"<h2>"+this.promos[i].DescPromocao+"</h2></a></li>";
	      	}
	      }
	    }
	    if(!counter){
	    	html+="<li class='viewer-itens'></li>";
	    }
	    //Set html to first promo
	    first_html="<li class='viewer-itens'><a class='item' href='app.html#search/express/"+first.COD+"' name='promo'>"+"<h1>"+first.DESCRICAO+"</h1>"+"<h2>"+first.DescPromocao+"</h2></a></li>";
	    this.el.html(html).prepend(first_html);
	    this.elements.header.addClass('goDown');
	};

	/**
	*Convert date into string format to Date format, and format it like default "00/00/0000"
	* @param {array} list - List of object to convert Date
	* @memberOf PromotionHome#
	* @name setDate
	*/
	this.setDate = function(list){
	    var i,length,dinicio,dfim,inicio,fim,atualtime;
	    atualtime=new Date();
	    length=list.length;

	    //Pattern
	    inicio=[{
	      "day":10,
	      "month":00,
	      "year":0000,
	      "all":"01/01/0000"
	    }];
	    fim=[{
	      "day":10,
	      "month":00,
	      "year":0000,
	      "all":"01/01/0000"
	    }];

	    for(i=0;i<length;i++){
	      //"inicio" values
	      inicio.day=parseInt(list[i].INICIO.slice(0,2));
	      inicio.month=parseInt(list[i].INICIO.slice(2,4));
	      inicio.year=parseInt(list[i].INICIO.slice(4,8));
	      inicio.all=list[i].INICIO.slice(0,2).concat("/",list[i].INICIO.slice(2,4),"/",list[i].INICIO.slice(4,8));
	      list[i].INICIO=inicio.all; //complet date

	      //"fim" values
	      fim.day=parseInt(list[i].FIM.slice(0,2));
	      fim.month=parseInt(list[i].FIM.slice(2,4));
	      fim.year=parseInt(list[i].FIM.slice(4,8));
	      fim.all=list[i].FIM.slice(0,2).concat("/",list[i].FIM.slice(2,4),"/",list[i].FIM.slice(4,8));
	      list[i].FIM=fim.all; //complet date

	      //Change string to Date object to compare
	      dinicio=new Date(inicio.year,(inicio.month-1),inicio.day);
	      dfim=new Date(fim.year,(fim.month-1),fim.day);

	      if(dinicio<dfim && dfim > atualtime){
	        if(-1 !== this.promos[i].Acao.indexOf("Interno")){
	          if(dinicio.getFullYear() < atualtime.getFullYear()){
	            list[i].active=true;
	          }
	          else if(dinicio.getFullYear() == atualtime.getFullYear()){
	            if(dinicio.getMonth() <= atualtime.getMonth()){
	              if(dinicio.getMonth() < atualtime.getMonth()){
	                list[i].active=true;
	              }
	              else{
	                if(dinicio.getDate() <= atualtime.getDate()){
	                  list[i].active=true;
	                }
	                else{
	                  list[i].active=false;
	                }
	              }
	            }
	            else{
	              list[i].active=false;
	            }
	          }
	          else{
	            list[i].active=false;
	          }
	        }
	      }
	      else{
	        list[i].active=false;
	      }
	    }
	};
	this.init = function(){
		this.promos=[];
	};
	this.init();
};

/**
*@classDesc This class deal with Spotlight actions at HomePage
*@exports SpotlightHome
*@constructor
*/
function SpotlightHome(el){
	this.el=el;
	this.buttons=$("dd");
	this.events = function(){
		var ctx=this;
		this.buttons.bind("click",function(a){ctx.select(a)});
	};

	/**
	* When the user if typing this method is called. This method verify if enter was pressioned, if not, it call open method.
	* @param {event} a - key event
	* @memberOf ModalHome#
	* @name getSpot
	*/
	this.getSpot = function(a){
		if(13 === a.keyCode){
			this.spotlight.close();
			this.elements.searchEl.trigger("submit");
		}
		else{
			if(1 < a.target.value.length){
				this.spotlight.open(a)
			}
			else{
				this.spotlight.close();
			}
		}

	};

	/**
	* Open Spotlight, change arrow down and top and search sycronious during user's type words that matches
	* @param {event} a - key event
	* @memberOf ModalHome#
	* @name open
	*/
	this.open= function(a){
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
		        this.events();
		        return !1;
		    }else{
		    	//If don't find any item, call gettips method to show sugestions to user
		       this.gettips(g);
		       return !1;
		    }
	  	}else {
		    this.id = -1, 32 === a.keyCode && (this.list += d);
	    }

	};
	this.close = function(a){
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
	};
	this.select = function(a){
		console.dir(a);
		if("object" === typeof a) {
		    a.preventDefault(), a = $(a.target);
		}else {
		    return!1;
		}
		this.input.val(this.list + a.text()).focus().trigger("submit");
		this.close();
	};
	this.arrow = function(a){
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
	};
	this.over = function(a){
		a.addClass("sel");
  		this.input.val(this.list + a.text()).focus();
	};
	this.hint = function(a,b){
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
		this.events();
	};
	this.gettips = function(a){
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
	};
	this.init = function(){
		var context=this;
		this.spot = [];
		this.list = "";
		this.id = 0;
		this.input = null;
		this.doc = $(document);
		$.getJSON("/library/ajax/spotlight.js",function(data){
			context.spot = data;
		},"json");
	};
	this.init();
};

/**
*@classDesc This class deal with Spotlight actions at HomePage
*@exports ModalHome
*@constructor
*/
function ModalHome(el){
	this.el=el;
	this.content=$(".modal-content");
	this.bclose = $(".bclose");
	this.dots = $(".pag-list");
	this.box = $(".tut-box");
	this.buttons = $(".tut-list li");
	this.contut = $(".tut-content");
	this.title = $(".modal-text h2");
	this.msg = $(".modal-text p");
	this.events = function(){
		var ctx=this;
		this.bclose.bind('click',function(event) {
			ctx.close(event);
		});
		this.buttons.bind("click",function(a){ctx.select(a)});
		this.dots.bind("click",function(a){ctx.page(a)});
	};

	/**
	* Open Modal with title and contentMessage
	* @param {String} a - Title to modal
	* @param {String} b - Content Message to modal
	* @memberOf ModalHome#
	* @name open
	*/
	this.open = function(a,b){
		a = a || "Titulo da Mensagem";
  		b = b || "";
  		this.content.addClass("bad");
  		this.title.text(a.capitalize());
  		this.msg.html(b);
  		this.el.fadeIn();
	};

	/**
	* Open Modal with tutorial set
	* @param {event} a - click button to tutorial
	* @memberOf ModalHome#
	* @name openTutorial
	*/
	this.openTutorial = function(a){
		a.preventDefault();
		this.el.addClass("tutorial");
		this.content.removeClass('bad');
		this.buttons.eq(0).trigger("click");
		this.el.fadeIn();
	};

	/**
	* Close Modal
	* @param {event} a - click button to close
	* @memberOf ModalHome#
	* @name close
	*/
	this.close = function(a){
		if("object" === typeof a) {
		    a.preventDefault(), $(a.target);
		}
		this.el.fadeOut(function() {
			$(this).attr('class','hide');
		});
	};

	/**
	* Change page to slideshow
	* @param {event} a - click button to close
	* @memberOf ModalHome#
	* @name page
	*/
	this.page = function(a){
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
	};

	/**
	* Change slidepage when click at tut-list buttons. This method filter into ajax from tutorial and call This.Boxed to create the page
	* @param {event} a - click button to close
	* @memberOf ModalHome#
	* @name select
	*/
	this.select = function(a){
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
	};

	/**
	* Create the Tutorial's Page itself
	* @param {array} a - Value of two container of the page
	* @memberOf ModalHome#
	* @name boxes
	*/
	this.boxes = function(a){
		this.contut.empty();
		for(var b = [], c, d = 0;d < a.length;d++) {
			c = "<div class='tut-box'><span class='tut-img' style='background-position: 0px -" + parseInt(90 * (a[d].ID - 1)) + "px'></span><h2><span class='tut-number'>" + parseInt(d + 1) + "</span>" + a[d].TITLE + "</h2><p>" + a[d].DESC + "</p></div>", b.push(c);
		}
		c = Math.round(a.length / 2);
		1 < c && this.dots.find("li:lt(" + c + ")").removeClass("sel").show().eq(0).addClass("sel");
		this.contut.width(320 * a.length).html(b.join(" ")).animate({left:0}, 0);
	};
	this.init = function(){
		var ctx=this;
		this.events();
		this.tutlist = [];
		$.getJSON("ajax/tutorial.js", function(a) {
			ctx.tutlist = a;
		});
	};
	this.init();
};

function Menu(el){
	this.el=el;
	this.buttons=$("#alt-menu li a");
	this.events = function(){
		var ctx=this;
		this.buttons.bind('click',function(event) {
			ctx.action(event);
		});
		$(document).on("contextmenu", function (a) {
        	a.preventDefault();
        	ctx.open(a);
      	});
	};
	this.action = function(a){
		if ("object" === typeof a) {
	      a.preventDefault();
	    } else {
	      return !1;
	    }
	    var b = $(a.target).attr("href") || $(a.target).parent().attr("href");
	    b = b.split("#")[1];
	    switch (b) {
		    case "logout":
		      this.logout();
	      	break;
	    }
	    this.close();
	};
	this.open = function(a){
		var ctx=this;
		this.el.offset({
	      top: a.pageY,
	      left: a.pageX
	    }).show();
	    this.doc.unbind("click").bind("click", function(a){
	    	ctx.close(a);
	    });
	};
	this.close = function(a){
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
	};
	this.init = function(){
		this.doc = $(document);
		this.events();
	};
	this.init();

};

//Declaring app and inherit its attributes to other classes
var home= new Home();
PromotionHome.prototype=home;
Page.prototype=home;
SpotlightHome.prototype=home;
ModalHome.prototype=home;
Menu.prototype=home;

//Starting app
home.init();