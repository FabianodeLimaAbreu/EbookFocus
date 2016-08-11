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
require(["methods","modernizr", "sp/min","jquery.csv", "app/content"], function() {
	window.Admin = Spine.Controller.sub({
		el: $("body"),
		elements: {
			"#wrap .user-name": "userTx",
			"#content": "contentEl",
			"#content>div": "tables",
			".mask": "maskEl",
			".actions .edit": "bedit",
			".actions .save": "bsave",
			".back": "bback",
			"#modal": "modalEl",
			".search": "searchEl",
			".mask img": "loader",
			".dropdown":"dropdownEl",
			".dropdown-menu":"menu",
			"form.creat-promo":"formEl",
			".comboact":"comboEl",
			".form-group":"group",
			".spotlight":"spotEl",
			".search":"searchEl",
			".filter a":"dropfilter",
			".search.search-promo input":"searchElPromo",
			".select-view":"viewEl"
		},
		events: {
			//"click .user-help":"opentutorial",
			"click #wrap .user-logout": "logout",
			"click a.cod": "showLink",
			"click .actions .edit": "edit",
			"click .actions .save": "save",
			"click .back": "goBack",
			"keyup .search-itens .text": "getspot",
			"keyup .search-promo .searchtext": "getFilterPromo",
			"click tr .materials": "goMaterials",
			"submit .search":"submit",
			"click .filter a":"filterHome",
			"click .dropdown-toggle>a":"prevent",
			"click .logo":"prevent",
			"click .bfilterdate":"filterByDate",
			"click .select-view button": "changeview"
		},
		init: function() {
			mobilecheck() && $(document.body).addClass("mobile");
			this.loading = !1;
			this.view = "list";
			this.page = "home";
			this.listdata=[]

			this.codpromo="";
			this.usr = jQuery.parseJSON($.cookie("portal"));
			if (!this.usr) {
				return this.logout(), !1;
			}
			this.userTx.text(this.usr.Nome.capitalize());
			this.el.find("#wrap").removeClass("hide");
			this.content = new Content({
				el: this.contentEl,
				dropdown: this.menu,
				table:this.tables,
				mask: this.maskEl,
				setloading: this.proxy(this.setloading),
				crudPromo:this.proxy(this.crudPromo),
				successAlter:this.proxy(this.successAlter),
				erro:this.proxy(this.erro),
				save:this.proxy(this.save)
			});
			this.modal = new Modal({
				el: this.modalEl,
				bedit: this.bedit,
				bsave: this.bsave,
				clean: this.proxy(this.cleanItens)
			});
			this.dropdown = new Dropdown({
				el: this.dropdownEl,
				bedit: this.bedit,
				setloading: this.proxy(this.setloading),
				getloading:this.proxy(this.getloading)
			});
			this.formulario=new Formulario({
				el:this.formEl,
				comboEl:this.comboEl,
				group:this.group
			});
			this.spotlight=new Spotlight({
				el:this.spotEl
			});
			this.routes({
				"desc/*code": function(a) {
					//The description page
					this.page = "descrição";
					this.reset(!0);
					this.codpromo=a.code;
					if (!this.content.promos.length){
						//When the user refresh the page or when they go directly to the description page don't passing through the home
						$.post(nodePath + "Ebook.svc/getPromocao/&query=0?callback=?", this.proxy(this.getPromo),"json")
						.fail(this.proxy(this.erro));
					} else {
						this.content.filtro=filterBy(this.content.promos,'COD',this.codpromo);
						this.content.descPromo(a.code, ".tab-2");
						$.post(nodePath + "SearchMaterial.svc/ebookPromo/" + a.code + "&query=0?callback=?", this.proxy(this.getPromoMaterial),"json")
						.fail(this.proxy(this.erro));
					}
					this.setloading(!0);
				},
				"create/*code": function(a) {
					//Create Promo
					var a=parseInt(a.code);
					this.reset();
					this.bedit.hide();
					this.bsave.fadeIn();
					this.bback.fadeIn();
					this.el.removeClass("noscroll home");
					this.page = "create";
					this.el.find(".tab-3").removeClass("hide");
					this.formulario.combolist.eq(a).trigger("click");
					this.contentEl.find(".filemask").removeClass("disabled").find("input").removeAttr("disabled");
					if (!this.content.promos.length) {
						$.post(nodePath + "Ebook.svc/getPromocao/&query=0?callback=?", this.proxy(this.getPromo),"json")
						.fail(this.proxy(this.erro));
					}
				},
				"": function() {
					this.page = "home";
					this.setloading(!0);
					this.el.addClass("noscroll home");
					this.reset(!1);
					this.dropfilter.eq(2).trigger("click");
				}
			});
		},

		/**
		*	Prevent the hash change of the page
		*
		*	@param {event} The event of click mouse
		*
		*	This method deals with the preventDefault of click at logo when loading is setted true or the bedit has class "sel", and .dropdown-toggle>a click
		*/
		prevent:function(a){
			if($(a.target).hasClass("logo")){
				if(this.getloading() || this.bedit.hasClass("sel")){
					a.preventDefault();
				}
			}
			else{
				a.preventDefault();
			}
		},
		changeview:function(a){
			if ("object" === typeof a) {
				a.preventDefault(), a = $(a.target);
			} else {
				return !1;
			}
			if (this.loading){
				return !1;
			}
		    a.hasClass("sel") || (this.viewEl.find("button").removeClass("sel").addClass("unsel"), a.addClass("sel").removeClass("unsel"), this.view = a.attr("name"),$("html").removeClass("list").removeClass("images").addClass(this.view),this.content.changeview(this.view));
		},

		/**
		*	Show a error message customized
		*
		*	@param {String} a.The tittle of the message
		*	@param {String} b. The content of the message
		*
		*	This method open a modal message error when an error ocurr
		*/
		erro: function(a,b) {
			var a,b;
			a=a || "Desculpe-nos!";
			b=b || "Um erro ocorreu, tente novamente mais tarde.";
			this.modal.open(a,b, !0, !0);
		},


		/**
		*	Set the loading state
		*
		*	@param {Boolean} a. If true show mask, else hide mask.
		*	@param {Boolean} b. If is false, open the loader ebook, else open just the mask div
		*
		*	This method set the state loader
		*/

		setloading: function(a, b) {
			if (!b) {
				if (a) {
					this.maskEl.fadeIn();
					this.loading = !0;
				} else {
					this.maskEl.fadeOut();
					this.loading = !1;
				}
			} else {
				if (a) {
					this.loader.fadeOut();
					this.maskEl.fadeIn();
					this.loading = !0;
				} else {
					this.maskEl.fadeOut();
					this.loader.fadeIn();
					this.loading = !1;
				}
			}
			return this.loading;
		},

		/**
		*	Return the loading state
		*/
		getloading:function(){
			return this.loading;
		},

		/*
		*
		*	This method clean the array of itens to add and remove after the changes were saved or the edit is canceled. It's used by Modal Object to access Content's array object
		*/
		cleanItens:function(){
			this.content.itensAdd=[];
			this.content.itensRemove=[];
		},

		/**
		*	Spotlight
		*
		*	@param {Boolean} a. The keypress event
		*
		*	This method open spotlight on keypress if, value.lenght>1, end close it when press enter
		*/
		getspot: function(a) {
			if (a.keyCode === 13) {
                this.spotlight.close(), this.searchEl.trigger('submit');
            } else {
                (a.target.value.length > 1) ? this.spotlight.open(a) : this.spotlight.close();
            }
            return !1;
		},
		getFilterPromo: function(el){
			this.dropfilter.removeClass("sel").eq(2).addClass("sel");
			$("#ex1").val("");
      		$("#ex2").val("");
			this.content.filterHome=null;
			this.filterdata= this.listdata.filter(function(a,b){
				if(-1 !== a.DESCRICAO.indexOf($(el.target).val())){
					//console.dir(a.DESCRICAO);
					return this;
				}
			});	
			this.content.listPromo(this.filterdata);
			//console.dir(list);
		},
		filterByDate:function(){
			var start,end;
			if($("#ex1").val()){
				start=new Date($("#ex1").val());
			}
			else{
				start=new Date("2000/01/01");
			}

			if($("#ex2").val()){
				end=new Date($("#ex2").val());
			}
			else{
				end=new Date("2020/01/01");
			}

			if(!this.filterdata.length){
				this.filterdata = this.listdata;
			}
			var datelist= this.filterdata.filter(function(a,b){
				var inicio,fim;
				_inicio = new Date(a.INICIO_ENG);
				_fim = new Date(a.FIM_ENG);
				if(_inicio <= end){
					if(_inicio>=start){
						return this;
					}
					if(_fim >= start){
						return this;
					}
				}
			});	
			this.content.listPromo(datelist);
		},

		/**
		*	Submit search itens
		*
		*	@param {Boolean} a. The click event
		*
		*	This method is called when submit button is submited, is with the enter pressed on getspot method are even submitting the submit button. In the end
		*	this method do request to server and call the setdata method passing the result of the request as param
		*/
		submit:function(a){
			a.preventDefault();
			var a,c, d = "Branco Poliester Viscose Cotton Focus Alfaiataria Algodao Azuis Alf Gloss Malhas Malha Rendas Renda Acetinados Acetinado Elastano Estampado Poliamida Print Printed Verdes White Vermelho".split(" ");
			//In case of description page, clean the scrollContent of the table and set the value as a search
			if (this.page === "descrição") {
		    	this.contentEl.find(".tab-2 .onfocus .scrollContent").empty();
		    	c= this.contentEl.find(".tab-2 .search .text").val().removeAccents().capitalize().replace(/\s/g, "");
		    	a=".tab-2";
		    }
		    //In case of create promo page
		    else{
		    	this.contentEl.find(".tab-3 .onfocus .scrollContent").empty();
		    	c= this.contentEl.find(".tab-3 .search .text").val().removeAccents().capitalize().replace(/\s/g, "");
		    	a=".tab-3";
		    }
		    //In case of c value isn't found at d value.
			if (-1 !== d.indexOf(c)) {
		      return this.modal.open("Tente novamente", "Adicione mais par\u00e2metros a sua pesquisa.", !1), !1;
		    }

		    //Make the requested search and call the setdata method
		    if(c.length){
		    	$.post(nodePath + "SearchMaterial.svc/ebook/&query="+this.contentEl.find(a+" .search .text").val().removeAccents()+"?callback=?", this.proxy(this.setdata),"json").fail(function() {
			      //console.log("error");
			      return!1;
			    });
			    return this.setloading(!0), !1;
		    }
		},

		/**
		*	Submit search itens
		*
		*	@param {Object} data. The result of request
		*	@param {String} status. Return success if request return something
		*
		*	This method is called after the request at submit method and set the focusitens array/object equal to data returned return a modal message 
		*	error if the length of it is 0, or call tableFocus method at Content Class to write the table with itens
		*/
		setdata:function(data,status){
			this.content.focusitens=[];
			this.content.focusitens = data;
			if (!this.content.focusitens.length) {
		      return this.modal.open("Tente novamente", "Nenhum resultado encontrado para busca.", !0,!0), this.setloading(!1), this.breadEl.find(".bread-search span").text(""), this.filter.list = [], this.active.itens.remove(), !1;
		    }
		    this.content.clean();
		    if (this.page === "descrição") {
		    	//In case of description page
		    	this.content.tableFocus(".tab-2");
		    }
		    else{
		    	//In case of create page
		    	this.content.tableFocus(".tab-3");
		    }
		},

		/*
		*	This method logout the user and remove Cookie
		*/
		logout: function(a) {
			a && a.preventDefault();
			$.removeCookie("portal", {
				path: "/"
			});
			window.location = "login.html" + window.location.hash;
		},

		/*
		*	This method show the promo clicked link at a modal
		*/
		showLink: function(a) {
			//http://189.126.197.169/node/server/bitlyurl.js?query=http://www.uol.com.br/
			a.preventDefault();
			var self=this;
			$.get("http://189.126.197.169/node/server/bitlyurl.js?query="+encodeURIComponent("http://www.focustextil.com.br/ebookfocus/app.html#search/express/") + $(a.target).text(),function(a){
				if(-1 !== a.status_txt.indexOf("OK")){
					self.modal.open("Link para a promoção:", a.data.url);
				}
				else{
					self.modal.open("Um erro OCorreu!!!", "Entre em contato com o administrador do sistema.",!0,!0);
				}
				
			})
			//http://189.126.197.169/node/server/bitlyurl.js?query=http://www.uol.com.br/
		},

		/**
		*	Go back button
		*
		*	This method return the user to a previews page since the page isn't loading or bedit isn't selected.
		*	Before redirect a previews page the method open modal question, and if the user click 'yes' it will be redirected
		*/
		goBack: function() {
			if (this.loading === !0) {
				return false;
			}
			if (!this.bedit.hasClass("sel")) {
				if(this.page==="create"){
					//In case of create page, history.go(-1) don't work correctly because we have two options of page to create that can be change inside them. In this way, user go directly to home
					window.location = "./";
				}
				else{
					window.history.go(-1);
				}
			} else {
				this.modal.question("Retornar?", "Suas alterações serão desfeitas!", !0, this.modal.action);
			}
		},

		/**
		*	Filter Home
		*
		*	@param {event} a. The result of request
		*	
		*	This method is called when dropdown options of filters is clicked. It will take the href value and call method to recieve the promos that will be filtered at Content Class method
		*/
		filterHome:function(a){
			if(this.page!=="home"){
				window.location="./";
			}
			else{
				a.preventDefault();
			}
			var hash=$(a.target).attr("href").replace("#","");
			if(-1 !== hash.indexOf("all")){
				//Case all values
				this.content.filterHome=null;
			}
			else{
				//Case other values, take the string "true" or "false" and convert to boolean
				this.content.filterHome=hash.bool();
			}

			//Clean Filters
			this.searchElPromo.val("");
			$("#ex1").val("");
      		$("#ex2").val("");
      		$( "#ex1").datepicker( "option", "maxDate", new Date() );
			$.post(nodePath + "Ebook.svc/getPromocao/&query=0?callback=?", this.proxy(this.setPromos),"json")
			.fail(this.proxy(this.erro));
		},

		/**
		*	Get Promotions
		*
		*	@param {Object} data. The result of request
		*	@param {String} status. Return success if request return something
		*	
		*	This method is called When the user refresh the page or when they go directly to another page don't passing through the home, then The getpromo
		*	request is done again and in this method is the the content.promo equals to the result of request
		*/
		getPromo: function(data, status) {
			this.content.promos = data;
			$.post(nodePath + "SearchMaterial.svc/ebookPromo/" +this.codpromo + "&query=0?callback=?", this.proxy(this.nocachePromo),"json")
			.fail(this.proxy(this.erro));
		},

		/**
		*	Promotion not in cache
		*
		*	@param {Object} data. The result of request
		*	@param {String} status. Return success if request return something
		*	
		*	After request all the promos, this method call a method to list materials respective to the codpromo attribute, 
		*	after it call the method to setDate of the promo formated and
		*	after it filter the promos by the code of the promo using codpromo attribute to call the method to desc the Promo
		*/
		nocachePromo:function(data,status){
			this.content.filtro=filterBy(this.content.promos,'COD',this.codpromo); //Filter the promos by the COD, searching the cod of promo in the COD field at promos list
			this.content.setDate(this.content.filtro);
			this.content.listMaterial(data, ".tab-2");
			this.content.descPromo(this.codpromo, ".tab-2");
		},

		/**
		*	The set Promos method
		*
		*	@param {Object} data. The result of request
		*	@param {String} status. Return success if request return something
		*	
		*	This method is used as default to set the Promos indexed at the application until this moment.
		*	When is at home, this method is called after request of "\getPromocao" to call the listPromo method of Content Class to list the promos at the page
		*/
		setPromos: function(data, status) {
			this.listdata=data;
			this.content.setDate(data);
			this.content.listPromo(data);
		},

		/**
		*	The get Promo's materials method
		*
		*	@param {Object} data. The result of request
		*	
		*	This method is used as defaut to call the listMaterial method of a promo
		*/
		getPromoMaterial: function(data) {
			this.content.listMaterial(data, ".tab-2");
		},

		/**
		*	Go to materials page
		*
		*	@param {event} e. The event click.
		*
		*	This method is called when the materials button is click. It's check if the button edit is selected.
		*/
		goMaterials: function(e){
			if(this.page==="material"){
				e.preventDefault();
			}
			else{
				if (this.bedit.hasClass("sel")) {
					e.preventDefault();
					this.modal.open("Atenção!!!", "Finalize suas edições antes de trocar de página", !0, !0);
				}
			}
		},

		/**
		*	Promo created
		*
		*	@param {String} title. The title of the message
		*	@param {String} content. The content of the message
		*	
		*	This method is a way to Content Class access the save method of Modal Class
		*/
		successAlter:function(title,content){
			var context=this;
			var myVar=setInterval(function(){
				context.modal.disableedit();
				context.myTimer(title , content , !1);
			},10000);
		},

		/**
		*	Edit Button function
		*
		*	@param {event} a. Event click
		*	
		*	This method is select the button and enable the functionality to change the promo and it's materials, or show a question to cancel all changes
		*/
		edit: function(a) {
			var el = $(a.target);
			a.preventDefault();
			if (this.loading === !0) {
				return false;
			}
			if (el.hasClass("sel")) {
				//editing promo, add class "editing" to modal's content
				this.modal.content.addClass("editing");
				this.modal.question("Desfazer as alterações?", "Todas as suas serão desfeitas!", !0, this.modal.action);
			} else {
				el.addClass("sel");
				this.bsave.fadeIn();
				this.contentEl.find(".tab-2 input[name='description']").removeAttr("disabled");
				this.contentEl.find(".tab-2 input[name='search']").removeAttr("disabled");
				this.contentEl.find(".filemask").removeClass("disabled").find("input").removeAttr("disabled");
				$(".product").addClass("edit");
				if(this.page!=="material"){
					$( "input[name='endpromo']" ).removeAttr("disabled");
				}
			}
		},

		/**
		*	Save button functionalities
		*
		*	@param {event} a. Event click
		*	@param {Boolean} b. If true, call a Content's editPromo method, passing as param "import" and ".tab-2". To clean the table and add all the
		*	Itens selected to the current promo.
		*	
		*	This method call the method to  save all changes of text and call the method to save all changes of itens of a promo, end call the method 
		*	to create a promo
		*/
		save: function(a,b) {
			var context=this;
			if(b){
				this.setloading(!0);
				if(this.page==="descrição"){
					this.content.editPromo("import",".tab-2");
					var myVar=setInterval(function(){
						context.myTimer("Alterações realizadas com sucesso!", "Feche esta janela para continuar",!1);
					},10000);
				}
				else if(this.page==="create"){
					this.content.editPromo(!1,this.usr.Nome.capitalize());
				}
			}
			else{
				this.setloading(!0);
				a.preventDefault();
				this.bedit.removeClass("sel");
				if(this.page==="descrição"){
					this.content.editPromo(!0);
					var myVar=setInterval(function(){
						context.myTimer("Alterações realizadas com sucesso!", "Feche <esta></esta> janela para continuar",!1);
					},10000);
					
				}
				else if(this.page==="create"){
					this.content.editPromo(!1,this.usr.Nome.capitalize());
				}
				else{
					this.crudPromo();
					var myVar=setInterval(function(){
						context.myTimer("Alterações realizadas com sucesso!", "Feche esta janela para continuar",!1);
					},10000);
				}
			}
		},

		myTimer:function(title,content,a,b){
			this.setloading(!1);
			this.modal.open(title,content,a,this.modal.save);
		},

		/**
		*	Saving Added and Removed itens to the promos
		*
		*	@param {String} cod. This method is null when is just saving the changes of a promo, and is set when is creating a new promo.
		*	
		*	This method is called when the save button is clicked. It's function is add or/and remove materials from a promo that is already create or is
		*	being create at this moment.
		*/
		crudPromo:function(cod){
			var cod,i,length;
			/*console.dir("add: "+ this.content.itensAdd);
			console.dir(" , remove: "+this.content.itensRemove);*/
			cod=this.codpromo || cod; //Recieve the codpromo attribute or the param cod
			if(this.content.itensRemove.length){
				//Case the itensRemove array have materials to be removed
				length=this.content.itensRemove.length;
				for(i=0;i<length;i++){
					//Passing into positions and deleting
					//console.log(this.content.itensRemove[i].MATNR);	
					$.post(nodePath + "Ebook.svc/DeletePromocaoMaterial/&query="+cod+"/"+this.content.itensRemove[i].MATNR+"?callback=?", function(d) {
						//console.log(d);
					},"json");
				}
			}
			if(this.content.itensAdd.length){
				//Case the itensAdd array have materials to be added
				length=this.content.itensAdd.length;
				for(i=0;i<length;i++){
					//Passing into positions and adding
					//console.log(this.content.itensAdd[i].MATNR);
					$.post(nodePath + "Ebook.svc/insertPromocaoMaterial/&query="+cod+"/"+this.content.itensAdd[i].MATNR+"?callback=?", function(d) {
						//console.log(d);
					},"json");
				}
			}
			this.content.clean(); //Clean the objects
		},

		/**
		*	Reseting the application
		*
		*	@param {Boolean} nothome. This method say if the application is at home or not.
		*	
		*	This method hide all some objects of the page, clean the search value and call the Content Class's reset.
		*/

		reset: function(nothome) {
			this.maskEl.fadeOut();
			this.bedit.removeClass("sel").fadeOut();
			this.bsave.fadeOut();
			this.bback.fadeOut();
			this.content.reset();
			this.listdata=[];
			this.filterdata=[];
			this.searchEl.find(".text").val("").blur();
			$(".product").removeClass("edit");
			if(nothome){
				this.bedit.fadeIn();
				this.bback.fadeIn();
				this.el.removeClass("noscroll home");
			}
		}
	});
	new Admin; //Creates application
	Spine.Route.setup(); //Enables @route
	$(window).bind("orientationchange", function(a, c) {
		var d = null != navigator.userAgent.match(/iPad/i);
		d && c && 90 != Math.abs(window.orientation) || d && 90 != Math.abs(window.orientation) ? $(document.body).addClass("portrait") : $(document.body).removeClass("portrait");
	});
	$(window).trigger("orientationchange", !0);
});