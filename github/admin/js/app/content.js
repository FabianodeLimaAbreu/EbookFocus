window.Dropdown = Spine.Controller.sub({
  elements:{
    ".dropdown-menu":"menu",
    ".dropdown-menu li a":"item",
    ".dropdown-toggle":"drop"
  },
  events:{
    "mouseover .dropdown-toggle":"open",
    "mouseleave .dropdown-toggle":"close",
    "click .dropdown-toggle":"close",
    "click .dropdown-menu a":"set",
    "click .dropdown-menu span":"bug"
  },
  open:function(a){
    var li=$(a.target).parent();
    if($(a.target).hasClass("bdown")){
      if(!this.bedit.hasClass("sel") && !this.getloading()){
        li.find(".dropdown-menu").show();
      }
    }
  },
  close:function(a){
    $(a.target).parent().removeClass("sel");
    this.drop.find(".dropdown-menu").hide();
  },
  bug:function(a){
    $(a.target).parent().parent().trigger("click");
  },
  set:function(a){
    this.item.removeClass("sel");
    if(a.target.toString().indexOf("Span")!=-1){
      this.item.removeClass("sel");
    }
    $(a.target).addClass("sel");
  }
});

window.Formulario=Spine.Controller.sub({
  elements:{
    ".combo-input":"combovalue",
    ".bprompt":"bselect",
    "#combo li":"combolist",
    "#combo":"combo",
    "input[name='action']":"fake"
  },
  events:{
    "click .bprompt":"toggleSelect",
    "click #combo li":"setting"
  },
  toggleSelect:function(e){
    e.preventDefault();
    if($(e.target).hasClass("sel")){
      this.combo.hide();
      this.bselect.removeClass("sel");
    }
    else{
      this.combo.show();
      this.bselect.addClass("sel");
    }
  },
  hide:function(){
    this.combo.hide();
    this.bselect.removeClass("sel");
  },
  setting:function(e){
    e.preventDefault();
    var a=$(e.target).attr("data");
    this.fake.val(a);
    if(!$(e.target).hasClass("sel")){
      if(this.combolist.hasClass("sel")){
        this.combolist.removeClass("sel");
        $(e.target).addClass("sel");
      }
      else{
        $(e.target).addClass("sel");
      }
    }
    this.combovalue.val(a);
    this.hide();
  }
});

window.Modal = Spine.Controller.sub({
   elements:{
    ".modal-content":"content", ".modal-text h2":"title", ".modal-text p":"msg",".modal-buttons":"buttons",".big-icon":"bigicon"
  }, events:{
      "click .bclose":"close", "click .modal-buttons a":"action"
  }, 
  /**
  * Close modal window
  *
  * @param {event} a. click event
  * 
  * This method close modal window
  */
  close:function(a) {
    if("object" === typeof a) {
      a.preventDefault(), $(a.target);
    }
    this.el.fadeOut(function() {
      $(this).attr('class','hide');
    });
    this.callback && this.callback();
  }, 
  /**
  * Redirect after save
  *
  * After the user click in "yes" at modal window, this method redirect to home page
  */
  save:function(){
    //console.log("Ok");
    //window.location = "./";
    window.location.reload();
  },

  /**
  * Question modal
  *
  * @param {String} a. Title message
  * @param {String} b. Content message
  * @param {Boolean} c. true to set bad Modal
  * @param {function} d. true to set a callback function and show bigicon
  * 
  * This method make a question to user. Use the param "a" and "b" to set it's content and title, and use "c" and "d" to set it's type and callback.
  */
  question: function(a, b, c, d) {
    a = a || "Titulo da Mensagem";
    b = b || "";
    this.el.addClass("question");
    this.content.removeClass("bad");
    c && this.content.addClass("bad");
    d && this.bigicon.show();
    this.title.text(a.capitalize());
    this.msg.html(b);
    this.el.fadeIn();
    this.callback = null;
  },
  /**
  * Open modal
  *
  * @param {String} a. Title message
  * @param {String} b. Content message
  * @param {Boolean} c. true to set bad Modal
  * @param {function} d. receive a function to set a callback function and show bigicon
  * 
  * This method make a question to user. Use the param "a" and "b" to set it's content and title, and use "c" and "d" to set it's type and callback.
  */
  open:function(a, b, c, d) {
    a = a || "Titulo da Mensagem";
    b = b || "";
    this.content.removeClass("bad");
    c && this.content.addClass("bad");
    this.bigicon.hide();
    d && this.bigicon.show();
    this.title.text(a.capitalize());
    this.msg.html(b);
    this.el.fadeIn();
    if(d && "function" === typeof d)
      //If d is a function
      this.callback = d;
  },
  /**
  * Disable edit of page
  *
  * After modal, this method disable all functions of the page and reset onfocus table
  */
  disableedit:function(){
    this.bsave.fadeOut(); 
    this.content.removeClass("editing");
    $(".tab-2 input[name='description']").attr("disabled","disabled");
    $(".tab-2 input[name='search']").attr("disabled","disabled").val("");
    $(".product").removeClass("edit");
    $(".product .add-promo").addClass("remove");
    $(".bread-box-onfocus .bread-search").find('span').text("");
    $(".bread-box-onfocus .bread-total").text("0");
    $(".onfocus .add-promo").removeClass("remove");
    $(".onfocus .page-container").css("height","auto");
    $(".import").addClass("disabled").find(".filemask").addClass("disabled").find("input").attr("disabled","disabled");
    $( "input[name='endpromo']" ).attr("disabled","disabled");
    $(".end-desc").attr("disabled","disabled");
    $(".tab-2 .onfocus .scrollContent").empty().animate({
      height:0
    },"slow");
  },

  /**
  * After yes of cancel changes
  *
  * @param {event} a.event click.
  * After modal question, if user cancel all changes, this method has a call of some methods necessaries to reset all functions and objects
  */
  action:function(a) {
    if("object" === typeof a) {
      a.preventDefault(), a = $(a.target);
    }else {
      return!1;
    }
    if(a.hasClass('yes')){
      //If click in 'yes' button

      if(this.content.hasClass("editing")){
        //If is editing the page
          this.bedit.removeClass("sel");
          //Call methods
          this.clean();
          this.disableedit();
      }
      else{
        //Else editing page
        $("body").removeClass("edit");
        window.history.go(-1);
      }
      //Close modal
      this.close();
    }
    else{
      //Else, just close modal
      this.close();
    }
  },init:function() {
    this.itens = [];
}});

window.Content = Spine.Controller.sub({
  elements:{
    ".import .file":"bimport"
  },
  events:{
    "click .product a.add-promo":"matRemove",
    "click .onfocus a.add-promo":"matAdd",
    "click .product a.add-promo-parent":"matRemove",
    "click .onfocus a.add-promo-parent":"matAdd",
    "change .file":"importFile",
    "click .addAll":"addAll",
    "focus .end-desc":"endChange"
  },

  changeview:function(a){
    this.container=a;
  },

  /**
  * Table of Focus's materials
  *
  * @param {String} table. The table that we receive the data
  * @param {Boolean} b. If the table is going to receive data of a csv
  * 
  * This method write the table focus with all objects of the search or a csv file. This method search every object of csv to write it's PE and ATC.
  */
  tableFocus:function(table,file){
    console.log("TABLE FOCUS");
    var i,length,MATNR,MAKTX,PE,ATC,content=this,cod=[];
    this.tab=table;
    this.html="";
    length=this.focusitens.length;
    this.setloading(!0);
    for(i=0;i<length;i++){
      MATNR=this.focusitens[i].MATNR || this.focusitens[i].Codigo; //MATNR to search, Codigo to csv
      MAKTX=this.focusitens[i].MAKTX || this.focusitens[i].Nome; //MAKTX to search, Nome to csv
      if(MATNR.length>=15){ 
        //if Cod is complet
        if(file){
          //console.log("sem PE");
          PE="Aguarde...";
          ATC="Aguarde...";
          //Add item to array of itens without PE value
        }else{
          //If hasn't csv file, I say, the user made a search on search button
          //console.log("normal");
          PE=Math.floor(this.focusitens[i].PE);
          ATC=Math.floor(this.focusitens[i].ATC);
        }
        if(this.container === "images"){
          this.html+='<li class="col col-sm-1 col-sm-2 col-md-1 col-md-2"><div class="thumbnail"><img src="http://189.126.197.169/img/small/small_'+MATNR+'.jpg"><div class="caption"><div class="caption-top"><h3>'+MATNR+'</h3><h4>'+MAKTX+'</h4></div><ul class="estoque"><li class="storage line">PE: <span id="PE">'+Math.floor(PE)+'</span></li><li class="storage">ATC: <span id="ATC">'+Math.floor(ATC)+'</span></li></ul><ul class="add-cart"><li><a href="#'+MATNR+'" class="add-promo-parent"><span class="icon add-promo add"></span></a></li></ul></div></div></li>';
        }
        else{
          this.html+="<tr><td><a href='#"+MATNR+"' class='icon add-promo add'></a></td><td>"+MATNR+"</td><td>"+MAKTX+"</td><td id='PE'>"+PE+"</td><td id='ATC'>"+ATC+"</td></tr>";
        }
      }
      else{
        //If the item's code from csv has less than 15 caracters (father cod)
        //console.log("MENOR: "+this.focusitens[i].Codigo);
        $.post(nodePath + "SearchMaterial.svc/ebook/&query="+this.focusitens[i].Codigo+"?callback=?", this.proxy(this.father),"json").fail(function() {
         // console.log("error");
          return!1;
        });
      }
    }
    //console.log(this.html);

    this.el.find(table+" .onfocus .page-container").animate({
        //Animate the table to show values
        height:520
      },"slow",function(){
      //Write the table
      var self;
      if(content.container !== "images"){
        self= $(table+" .onfocus .scrollContent");
      }
      else{
        self = content.el.find(table+" .onfocus .viewfocus");
      }
  
      self.html(content.html);
      $(table+" .bread-box-onfocus ").find(".bread-total").text(content.focusitens.length);
      $(table+" .bread-box-onfocus .bread-search").find("span").text($(table+" .search .text").val());
      if(content.container !== "images"){
        self=self.find("tr");
      }
      else{
        self=self.find(".thumbnail");
      }
      self.each(function(index,obj){
          if(PE === "Aguarde..."){
            //If csv
            $(this).find(".add-promo").addClass("remove");
            if($(this).find("a").attr("href")){
              var context=$(this);
              //Search material
              $.post(nodePath + "SearchMaterial.svc/ebook/&query="+$(this).find("a").attr("href").replace("#","")+"?callback=?", function(d) {
                //console.log("DENTRO");
                //Write it's value
                context.find("#PE").text(Math.floor(d[0].PE));
                context.find("#ATC").text(Math.floor(d[0].ATC));
              },"json");
            }
          }
          if(file){
            //If has a csv file inserted
            //console.log("ok");
            $(table+" .bread-box-onfocus .bread-search").find("span").text("CSV Importado!");
            content.itensAdd.push({"MATNR":""+$(this).find("a").attr("href").replace("#",""),"COD":parseInt(index)});
          }
          //Set name attribute to the link add and remove itens for user be able to remove and add the itens after
          $(this).find("a,.add-promo").attr("name",index);
        });
    });
    
    //Remove loading
    content.setloading(!1);
  },

  /**
  * Concat all sons of a father's code into table onfocus.
  *
  * @param {Object} a. The list of returned itens after search made using father code
  * 
  * This method is called after a request to service that search all itens using a father code.
  * The result of this search is used is pushed into focusitens array(all object of a csv file or search).
  * With this result, a loop pass into all line and append on onfocus table.
  */
  father:function(a){
    var i,length,html="";
    length=a.length;
    for(i=0;i<length;i++){
      this.focusitens2.push(a[i]);
      this.focusitens.push(a[i]);
    }
    for(i=0;i<length;i++){
      //If csv, write Aguarde while is search this values
      PE=this.focusitens2[i].PE;
      ATC=this.focusitens2[i].ATC;
      html+="<tr><td><a href='#"+this.focusitens2[i].MATNR+"' class='icon add-promo add remove'></a></td><td>"+this.focusitens2[i].MATNR+"</td><td>"+this.focusitens2[i].MAKTX+"</td><td id='PE'>"+PE+"</td><td id='ATC'>"+ATC+"</td></tr>";
    }
    this.el.find(this.tab+" .onfocus .scrollContent").append(html);
  },

  /**
  * List homepage's promo
  *
  * @param {Object} list. List of all promos
  * 
  * This method filter the promos object and list them at home
  */
  listPromo:function(list){
    var i,length,html="";
    length=list.length-1;
    this.el.find(".tab-1").removeClass("hide");
    if(typeof this.filterHome ==="object"){
      //If don't need a filter
      for(i=length;i>=0;i--){
        html+="<tr><td class='name'>"+list[i].DESCRICAO+"</td><td><a href='#desc/"+list[i].COD+"' class='third-icon description' title='Descrição'></a></td><td><a href='#"+list[i].COD+"' class='cod'>"+list[i].COD+"</a></td><td>"+list[i].RESPONSAVEL+"</td><td>"+list[i].INICIO+"</td><td>"+list[i].FIM+"</td>";
        html+=this.status(!0,list[i]);
        html+=this.status(!1,list[i]); //After setDate of promo, if it's active yet
      }
    }
    else{
      for(i=length;i>=0;i--){
        if(list[i].active===this.filterHome){
          //If is true or false(object) to filter promos
          html+="<tr><td class='name'>"+list[i].DESCRICAO+"</td><td><a href='#desc/"+list[i].COD+"' class='third-icon description' title='Descrição'></a></td><td><a href='#"+list[i].COD+"' class='cod'>"+list[i].COD+"</a></td><td>"+list[i].RESPONSAVEL+"</td><td>"+list[i].INICIO+"</td><td>"+list[i].FIM+"</td>";
          html+=this.status(!0,list[i]);
          html+=this.status(!1,list[i]);
        }
      }
    }
    this.promos=list;
    this.el.find(".tab-1 .scrollContent").html(html);
    $("table").stupidtable();
    this.setloading(!1);
  },

  /**
  * Desc selected promo
  *
  * @param {String} code. The code of selected promo
  * @param {String} table. The table that will be used
  * 
  * This method use the filtro object that even had been wrote and the param table, knowing that this method is used by Desc and Materials page, to desc a promo
  */
  descPromo:function(code,table){
    var i,html="";
    this.el.find(table).removeClass("hide");
    html+="<tr><td class='name'>"+this.filtro[0].DESCRICAO+"</td><td><a href='#"+this.filtro[0].COD+"' class='cod'>"+this.filtro[0].COD+"</a></td><td>"+this.filtro[0].RESPONSAVEL+"</td><td><input name='startpromo' type='text' class='s-seven' value='"+this.filtro[0].INICIO+"' disabled/></td><td><input name='endpromo' type='text' class='s-seven end-desc' value='"+this.filtro[0].FIM+"' disabled/></td>";
    html+=this.status(!0,this.filtro[0]);
    html+=this.status(!1,this.filtro[0]);
    this.el.find(table+" .desc .scrollContent").html(html);
    this.el.find(table+" input[name='description']").val(this.filtro[0].DescPromocao); //Campo de descrição que sera substituido
  },

  /**
  * Status of promo
  *
  * @param {Boolean} what. If wanna know the type of promo or if it's ative or not
  * @param {Object} list. The promo itself
  * 
  * This method receive an object and return the properly html to it's definition
  */
  status:function(what,list){
    if(what){
      if(-1 !== list.Acao.indexOf("Interno")){
       return "<td class='act'>Interno</td>";
      }
      else{
        return "<td class='act alert'>Externo</td>";
      }
    }
    else{
      if(list.active){
        return "<td class='status'>Ativo</td></tr>";
      }
      else{
        return "<td class='status alert'>Inativo</td></tr>"; 
      }
    }
  },

  /**
  * List materials of promo
  *
  * @param {Object} list. List of material of a promo
  * @param {String} table. The table that is going to be write
  * 
  * This method receive the list of materials and write it's properties at product table
  */
  listMaterial:function(list,table){
    var i,length,fhtml="";
    length=list.length;
    this.active=[];
    if(length>24){
      for(i=0;i<24;i++){
        if(this.container === "images"){
          fhtml+='<li class="col col-sm-1 col-sm-2 col-md-1 col-md-2"><div class="thumbnail"><img src="http://189.126.197.169/img/small/small_'+list[i].MATNR+'.jpg"><div class="caption"><div class="caption-top"><h3>'+list[i].MATNR+'</h3><h4>'+list[i].MAKTX+'</h4></div><ul class="estoque"><li class="storage line">PE: '+Math.floor(list[i].PE)+'</li><li class="storage">ATC: '+Math.floor(list[i].ATC)+'</li></ul><ul class="add-cart"><li><a href="#'+list[i].MATNR+'" name="'+i+'" class="add-promo-parent"><span class="icon add-promo add remove" name="'+i+'"></span></a></li></ul></div></div></li>';
        }
        else{
          fhtml+="<tr><td><a href='#"+list[i].MATNR+"' class='icon add-promo add remove' name='"+i+"'></a></td><td>"+list[i].MATNR+"</td><td>"+list[i].MAKTX+"</td><td>"+Math.floor(list[i].PE)+"</td><td>"+Math.floor(list[i].ATC)+"</td></tr>";
        }
        list[i].COD=i; //Create a attribute COD into object with it's index as value
        this.active.push({"MATNR":list[i].MATNR,"MAKTX":list[i].MATNR,"PE":list[i].PE,"ATC":list[i].ATC,"COD":i});
      }
      if(this.container === "images"){
        this.el.find(table+" .viewitem").html(fhtml);
      }
      else{
        this.el.find(table+" .product .scrollContent").html(fhtml);
      }
      this.showByParts(list,table);
      this.setloading(!1);
    }
    else{
      for(i=0;i<length;i++){
        if(this.container === "images"){
          fhtml+='<li class="col col-sm-1 col-sm-2 col-md-1 col-md-2"><div class="thumbnail"><img src="http://189.126.197.169/img/small/small_'+list[i].MATNR+'.jpg"><div class="caption"><div class="caption-top"><h3>'+list[i].MATNR+'</h3><h4>'+list[i].MAKTX+'</h4></div><ul class="estoque"><li class="storage line">PE: '+Math.floor(list[i].PE)+'</li><li class="storage">ATC: '+Math.floor(list[i].ATC)+'</li></ul><ul class="add-cart"><li><a href="#'+list[i].MATNR+'" name="'+i+'"" class="add-promo-parent"><span class="icon add-promo add remove" name="'+i+'"></span></a></li></ul></div></div></li>';
        }
        else{
          fhtml+="<tr><td><a href='#"+list[i].MATNR+"' class='icon add-promo add remove' name='"+i+"'></a></td><td>"+list[i].MATNR+"</td><td>"+list[i].MAKTX+"</td><td>"+Math.floor(list[i].PE)+"</td><td>"+Math.floor(list[i].ATC)+"</td></tr>";
        }
        list[i].COD=i; //Create a attribute COD into object with it's index as value
      }
      if(this.container === "images"){
        this.el.find(table+" .viewitem").html(fhtml);
      }
      else{
        this.el.find(table+" .product .scrollContent").html(fhtml);
      }
      this.setloading(!1);
    }
    this.itens=list;
  },

  write:function(list,table){
    //console.log("Ok");
      var i,init,end,fhtml="";
      init=this.page*24;
      end=(this.page+1)*24;
      this.setloading(!0);
      for(i=init;i<end;i++){
        //console.dir(list[i]);
        if(i<list.length){
          fhtml+="<tr><td><a href='#"+list[i].MATNR+"' class='icon add-promo add remove' name='"+i+"'></a></td><td>"+list[i].MATNR+"</td><td>"+list[i].MAKTX+"</td><td>"+list[i].PE+"</td><td>"+list[i].ATC+"</td></tr>";
          list[i].COD=i; //Create a attribute COD into object with it's index as value
          this.active.push({"MATNR":list[i].MATNR,"MAKTX":list[i].MATNR,"PE":list[i].PE,"ATC":list[i].ATC,"COD":i});
        }
        else{
          //console.log("PAROU");
        }
      }
      //muda tabela
      console.dir(this.el.find(table+" .page-container .product .scrollContent"));
      this.el.find(table+" .page-container .product .scrollContent").append(fhtml);
      this.setloading(!1);
  },

  showByParts:function(list,table){
    $(table+" .bread-box-promo ").find(".bread-total").text(list.length);
    var length,content,nine,top,height;
    content=this;
    this.page=0;
    $(table+" .page-container").scroll(function(){
      //console.log("1");
      length=content.active.length;
      //console.log(list.length);
      top=$(table+" .page-container").eq(1).scrollTop()+100;
      height=$(table+" table.product").height()-$(table+" .page-container").eq(1).height();

      if(top>height && length<list.length){
        content.page++;
        if((24*(content.page+1)) > list.length){
          $(table+" .bread-box-promo ").find(".bread-page").text(list.length);
        }
        else{
          $(table+" .bread-box-promo ").find(".bread-page").text(24*(content.page+1));
        }
        content.write(list,table);
      }
    });
  },

  /**
  * When save changes.
  *
  * @param {Boolean} desc. If true, desc page.
  * @param {String} nameUser. The name of user logged at application
  * 
  * This method is called when the save button is clicked. It valid the form of create a promo, pass the materials of csv to the product table and add them to promo
  * or simply save the changes and send email if this promo is Interno.
  */
  editPromo:function(desc,nameUser){
    var content,crud;
    content=this;
    crud=this.crudPromo;
    if(desc){
      if(desc==="import"){
        //Description page with import file
        crud();
        this.bimport.val("");
        //this.el.find(".import").addClass("disabled").find("input").attr("disabled","disabled");
        $.each(this.focusitens,function(index,obj){
          content.itens.push({"MATNR":""+content.focusitens[index].Codigo,"COD":parseInt(index)})
        });
        $(".onfocus .scrollContent").find("a").not(".remove").parent().parent().remove(); //Remoce all elements that won't be insert at promo
        $(nameUser+" .product .scrollContent").html($(".onfocus .scrollContent").html()); //copy onfocus table into product table
        $(".onfocus .scrollContent").empty().animate({
          height:0
        },"slow");
        $(".product").addClass("edit");//Show add-promo button, because it's default is be hidden
      }
      else{
        //Just description page.
        if(-1 !== this.filtro[0].Acao.indexOf("Interno") && (this.filtro[0].DescPromocao !==this.el.find(".tab-2 input[name='description']").val() || this.filtro[0].FIM !==this.el.find(".tab-2 input[name='endpromo']").val())){
          $.getJSON(nodePath+"SendEmail.svc/send/&query=fabianoabreu@focustextil.com.br/yedaborgato@focustextil.com.br/Promocao alterada no Ebook/Promocao de nome - "+this.filtro[0].DESCRICAO.removeAccents()+ " - Favor altera-la na aplicacao/Ebook/fabianodelimaabreu@gmail.com?callback=?");
        }
        //Insert promo and call a method to insert materials
        //console.log(nodePath+"Ebook.svc/insertPromocao/&query="+this.filtro[0].COD+"/"+this.filtro[0].DESCRICAO+"/"+this.filtro[0].RESPONSAVEL+"/"+this.filtro[0].INICIO.replace("/","").replace("/","")+"/"+this.el.find(".tab-2 input[name='endpromo']").val().replace("/","").replace("/","")+"/"+this.filtro[0].Acao+"/"+ this.el.find(".tab-2 input[name='description']").val()+"/0"+"?callback=?");
        $.post("http://ii3/services/Services/Ebook.svc/insertPromocao/"+this.filtro[0].COD+"/"+this.filtro[0].DESCRICAO+"/"+this.filtro[0].RESPONSAVEL+"/"+this.filtro[0].INICIO.replace("/","").replace("/","")+"/"+this.el.find(".tab-2 input[name='endpromo']").val().replace("/","").replace("/","")+"/"+this.filtro[0].Acao+"/"+ this.el.find(".tab-2 input[name='description']").val()+"/0"+"?callback=?", function(d) {
          //console.log(d);
          crud();
        },"json");
      }
    }
    else{
      //Create promo page
      var cod,table,cimputs,complet;

      //cod var will be used when service of insertPromo be updated
      cod=parseInt(this.promos[this.promos.length-1].COD)+1 > 20140000 ? cod=parseInt(this.promos[this.promos.length-1].COD)+1 : cod=20140000;

      table=".tab-3";
      cimputs=$(table+" form .val");
      $.each(cimputs, function(index, obj) {
        //Valid form
        complet = !1;
        if(!obj.value || obj.value.length<4) {
          //if this input value is null
          return $(this).addClass('error'), content.setloading(!1), !1;

        }
        else{
          if($(this).hasClass('error')){
              $(this).removeClass('error');
          }
        }
        complet = !0;
      });
      if(complet){
        //When the form is completly and valid
        if(this.itensAdd.length){
          //If has itens in the promo
          if(-1 !== this.el.find(table+" input[name='action']").val().indexOf("Interno")){
            //Send email if promo is interno
            $.getJSON(nodePath+"SendEmail.svc/send/&query=fabianoabreu@focustextil.com.br/yedaborgato@focustextil.com.br/Promocao criada no Ebook/Nova promocao no Ebook com o nome - "+this.el.find(table+" input[name='name']").val().removeAccents()+ " - Favor inseri-la na home da aplicacao/Ebook/fabianodelimaabreu@gmail.com?callback=?");
            //console.log(nodePath+"SendEmail.svc/send/&query=fabianoabreu@focustextil.com.br/yedaborgato@focustextil.com.br/Promocao criada/Nova promocao no Ebook com o nome - "+this.el.find(table+" input[name='name']").val().removeAccents()+ "/Ebook/fabianodelimaabreu@gmail.com?callback=?");
          }
          //Insert promo using ii3 server to avoid error with special caracters
          console.log("http://ii3/services/Services/Ebook.svc/insertPromocao/0/"+this.el.find(table+" input[name='name']").val()+"/"+nameUser+"/"+this.el.find(table+" input[name='start']").val().replace("/","").replace("/","")+"/"+this.el.find(table+" input[name='end']").val().replace("/","").replace("/","")+"/"+this.el.find(table+" input[name='action']").val()+"/"+ this.el.find(table+" input[name='description']").val()+"/0"+"?callback=?")
          $.post("http://ii3/services/Services/Ebook.svc/insertPromocao/0/"+this.el.find(table+" input[name='name']").val()+"/"+nameUser+"/"+this.el.find(table+" input[name='start']").val().replace("/","").replace("/","")+"/"+this.el.find(table+" input[name='end']").val().replace("/","").replace("/","")+"/"+this.el.find(table+" input[name='action']").val()+"/"+ this.el.find(table+" input[name='description']").val()+"/0"+"?callback=?", function(d) {
            //console.log(d);
            crud(parseInt(d));
          },"json");
          this.successAlter("Promoção criada com sucesso!","Feche esta janela para continuar");
          return !0;
        }
        else{
          this.erro("Adicione materiais à promoção!","Antes de finalizar, adicione materias a promoção",!0);
        }
      }
      else{
          return !1;
      }
    }
  },

  /**
  * Convert date into string format to Date format, and format it like default "00/00/0000"
  *
  * @param {Object} list. Object to get it's date format
  * 
  * This method convert the date of object that come like: 11022013 to 11/02/2013 and say if it's active or not.
  */
  setDate:function(list){
    var i,length,dinicio,dfim,inicio,fim;
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
      inicio.day=list[i].INICIO.slice(0,2);
      inicio.month=list[i].INICIO.slice(2,4);
      inicio.year=list[i].INICIO.slice(4,8);
      inicio.all=list[i].INICIO.slice(0,2).concat("/",list[i].INICIO.slice(2,4),"/",list[i].INICIO.slice(4,8));
      list[i].INICIO=inicio.all; //complet date
      list[i].INICIO_ENG=inicio.year.concat("/",inicio.month,"/",inicio.day); //complet date IN ENGLISH

      //"fim" values
      fim.day=list[i].FIM.slice(0,2);
      fim.month=list[i].FIM.slice(2,4);
      fim.year=list[i].FIM.slice(4,8);
      fim.all=list[i].FIM.slice(0,2).concat("/",list[i].FIM.slice(2,4),"/",list[i].FIM.slice(4,8));
      list[i].FIM=fim.all;  
      list[i].FIM_ENG=fim.year.concat("/",fim.month,"/",fim.day); //complet date IN ENGLISH

      //Change string to Date object to compare
      dinicio=new Date(inicio.year,(inicio.month-1),inicio.day);
      dfim=new Date(fim.year,(fim.month-1),fim.day);
      
      if(dinicio<dfim && dfim > new Date()){
        list[i].active=true;
      }

      /*if(dinicio<dfim && dinicio < new Date() && dfim > new Date()){
        list[i].active=true;
      }
      */
      else{
        list[i].active=false;
      }
    }
  },

  /**
  * When edit a promo and click at "FIM" field to change it's value
  *
  */
  endChange:function(){
    console.log($( "input[name='startpromo']").val());
    $( "input[name='endpromo']" ).datepicker({
     defaultDate: "+1w",
     changeMonth: true,
     numberOfMonths: 2,
     monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
     monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
     dayNamesMin: ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'],
     dateFormat:"dd/mm/yy",
     minDate: $( "input[name='startpromo']").val()
    });
  },

  /**
  * Add item to itensAdd Array
  *
  * @param {event} a. event click.
  * 
  * This method is called by onfocus table
  * This method add a item searched to an array of objects to be add into promo.
  */
  matAdd:function(a){
    a.preventDefault();
    var index,MATNR,id;
    id=parseInt($(a.target).attr("name")); //Receive name of link and parse it to Int datatype
    MATNR=this.focusitens[id].MATNR || this.focusitens[id].Codigo;
    index=this.indice(id,!0) || 0; //Verify if this item even is at itensAdd object or pass 0 as value
    if($(a.target).hasClass("remove")){
      //If object even have been add
      this.itensAdd.splice(index,1); //Remove it of array
      $(a.target).removeClass("remove"); //Remove it's clas
    }
    else{
      //Add it into array
      this.itensAdd.push({"MATNR":""+MATNR,"COD":id});
      $(a.target).addClass("remove"); //Add class
    }
  },

  /**
  * Remove item from itensRemove Array
  *
  * @param {event} a. event click.
  * 
  * This method is called by product table
  * This method remove insert selected itens into an array to remove itens from promo
  */
  matRemove:function(a){
    a.preventDefault();
    var index,id;
    id=parseInt($(a.target).attr("name"));
    index=this.indice(id) || 0;
    if($(a.target).hasClass("remove")){
      //When click at item
      //console.log("remove");
      this.itensRemove.push({"MATNR":""+this.itens[id].MATNR,"COD":id});
      $(a.target).removeClass("remove");
    }
    else{
      //When click again at link, "canceling removing it"
      //console.log("tira remove");
       $(a.target).addClass("remove");
       this.itensRemove.splice(index,1);
    }
  },

  /**
  * Return indice of a element into array add and remove itens
  *
  * @param {int} id. The id o selected element
  * @param {Boolean} add. True when array is itensAdd.
  * 
  * This method compare all positions of specific array and compare element's cod with id passed as param.
  */

  indice:function(id,add){
    var length,i;
    if(add){
      length=this.itensAdd.length;
      for(i=0;i<length;i++){
          if(this.itensAdd[i].COD===id){
              return i;
          }
      }
    }
    else{
      length=this.itensRemove.length;
      for(i=0;i<length;i++){
          if(this.itensRemove[i].COD===id){
              return i;
          }
      }
    }
  },

  /**
  * Import a csv file
  *
  * @param {event} evt. change event
  * This method import a csv file to aplication, read it and clean the focus table to write in it
  */
  importFile:function(evt){
    console.log(this.container);
    var files,file,reader,content,erro,csv,i,length;
    content=this;
    erro=this.erro;
    files = evt.target.files || evt.target.value; // FileList object
    file = files[0];
    if(window.FileReader){
      reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function(event){
        csv = event.target.result; 
        if(!$(".tab-2").hasClass("hide")){
          $(".import").removeClass("disabled");
        }
        try{
          data = $.csv.toObjects(csv);
          //console.log(JSON.stringify(data));
          content.focusitens=data;
          $(".onfocus .scrollContent").empty();
          if($(".tab-2").hasClass("hide")){
            content.tableFocus(".tab-3",!0);
          }
          else{
            content.tableFocus(".tab-2",!0);
          }
        }
        catch(err){
          $(".import").addClass("disabled");
          erro("Um erro ocorreu!", "Verifique se o arquivo enviado é do formado CSV e tente novamente.");
          $(".onfocus .scrollContent").empty().animate({
            height:0
          },"slow");
        }
      };
      reader.onerror = function(){
        $(".import").addClass("disabled");
        erro("Um erro ocorreu!", "Verifique se o arquivo enviado é do formado CSV e tente novamente.");
        $(".onfocus .scrollContent").empty().animate({
          height:0
        },"slow");
      };
    }
    else{
      //Case don't have File Reader
      if($(".tab-2").hasClass("hide")){
        data= this.readCSV($(".tab-3 input[type='file']").val());
      }
      else{
        data= this.readCSV($(".tab-2 input[type='file']").val());
      }
      length=data.length;
      for(i=0;i<length;i++){
        data[i] = this.parseLineCSV(data[i]);
      }
      data=$.csv.toObjects(data);
      content.focusitens=data;
      if(!$(".tab-2").hasClass("hide")){
          $(".import").removeClass("disabled");
        }
      $(".onfocus .scrollContent").empty();
      if($(".tab-2").hasClass("hide")){
        content.tableFocus(".tab-3",!0);
      }
      else{
        content.tableFocus(".tab-2",!0);
      }
    }
  },

  /**
  * Http Request
  *
  * This method help readCSV to create a object to read 
  */
  XMLHttpRequest:function() {
   var i,arrSignatures = ["MSXML2.XMLHTTP.5.0", "MSXML2.XMLHTTP.4.0","MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP","Microsoft.XMLHTTP"];
   for (i=0; i < arrSignatures.length; i++) {
     try {
     var oRequest = new ActiveXObject(arrSignatures[i]);
     return oRequest;
     } catch (oError) {
     //ignore
     }
   }
   throw new Error("MSXML is not installed on your system.");
  },

  /**
  * read a CSV file
  *
  * @param {String} locfile. path of a csv file to read
  * This method create a object to read a file, read it, and return it's value
  */
  readCSV:function(locfile) {
    var req,ua;
    if(window.ActiveXObject){
      req=new this.XMLHttpRequest();
    }
    else{
      req = new XMLHttpRequest()
    }
    try{
      ua = navigator.userAgent.toLowerCase(); 
      if (ua.indexOf('safari') != -1) { 
        throw "safari"
      }
      // load a whole csv file, and then split it line by line
      req.open("POST",locfile,false);
      req.send("");
      return req.responseText;
    }
    catch(err){
      if(err.toString().indexOf("safari")!=-1){
        //See if is safari
        this.erro("Um erro ocorreu!", "Esta funcionalidade não é suportada pelo Safari. Utilize outro navegador.");
      }
      else{
        this.erro("Um erro ocorreu!", "Verifique se o arquivo enviado é do formado CSV e tente novamente.");
      }
      //disable add-all button 
      $(".import").addClass("disabled");
      $(".onfocus .scrollContent").empty().animate({
        height:0
      },"slow");
    }
  },

  parseLineCSV:function(lineCSV) {
    // parse csv line by line into array
   var i,CSV = new Array();
   
   // Insert space before character ",". This is to anticipate 'split' in IE
   // try this:
   //
   // var a=",,,a,,b,,c,,,,d";
   // a=a.split(/\,/g);
   // document.write(a.length);
   //
   // You will see unexpected result!
   //
   lineCSV = lineCSV.replace(/,/g," ,");
   
   lineCSV = lineCSV.split(/,/g);
   
   // This is continuing of 'split' issue in IE
   // remove all trailing space in each field
   for (i=0;i
      <lineCSV.length;i++) {
   lineCSV[i] = lineCSV[i].replace(/\s*$/g,"");   
   }
   
   lineCSV[lineCSV.length-1]=lineCSV[lineCSV.length-1].replace(/^\s*|\s*$/g,"");
   var fstart = -1;
   
   for (i=0;i<lineCSV.length;i++) {
   if (lineCSV[i].match(/"$/)) {
   if (fstart>=0) {
   for (var j=fstart+1;j<=i;j++) {
   lineCSV[fstart]=lineCSV[fstart]+","+lineCSV[j];
   lineCSV[j]="-DELETED-";
   }
   fstart=-1;
   }
   }
   fstart = (lineCSV[i].match(/^"/)) ? i : fstart;
   }
   
   var j=0;
   
   for (i=0;i
      <lineCSV.length;i++) {
   if (lineCSV[i]!="-DELETED-") {
   CSV[j] = lineCSV[i];
   CSV[j] = CSV[j].replace(/^\s*|\s*$/g,"");     // remove leading & trailing space
   CSV[j] = CSV[j].replace(/^"|"$/g,"");         // remove " on the beginning and end
   CSV[j] = CSV[j].replace(/""/g,'"');           // replace "" with "
   j++;
   }
   }
   
   return CSV;
  },

  /**
  * add all itens of csv to promo
  *
  * @param {event} a. click event
  * This method is called when click at add-all button
  */
  addAll:function(a){
    a.preventDefault();
    this.save(!1,!0);
  },
  
  /**
  * Clean arrays
  */
  clean:function() {
    this.itensAdd = [];
    this.itensRemove=[];
    $(".onfocus tbody").empty();
    $(".onfocus .viewfocus").empty();
    $(".viewitem").empty();
  },


  init:function(){
    console.log("dsa");
    this.itens=[];
    this.itensAdd=[];
    this.itensRemove=[];
    this.promos=[];
    this.focusitens=[];
    this.focusitens2=[];
    this.filtro=[];
    this.active=[];
    this.filterHome=true;
    this.container="list";
  },
  reset:function() {
    this.focusitens=[];
    this.focusitens2=[];
    this.table.addClass("hide");
    this.dropdown.hide();
    this.clean();
    //this.container="list";
    this.el.find(".tab-2 input[name='description']").attr("disabled","disabled");
    this.el.find(".tab-2 input[name='search']").attr("disabled","disabled");
    this.el.find(".import").addClass("disabled").find(".filemask").addClass("disabled").find("input").attr("disabled","disabled");
    /*$(".onfocus .scrollContent").empty().animate({
      height:0
    },"slow");*/
  }
});

/*Spotlight*/
window.Spotlight = Spine.Controller.sub({elements:{dd:"buttons"}, events:{"click dd":"select"}, select:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  }else {
    return!1;
  }
  this.input.val(this.list + a.text()).focus().trigger("submit");
  this.close();
}, over:function(a) {
  a.addClass("sel");
  this.input.val(this.list + a.text()).focus();
}, close:function(a) {
  if(a && (a.preventDefault(), a = $(a.target), this.el.find(a).length)) {
    return!1;
  }
  a && a.hasClass("bsearch") && this.input.trigger("submit");
  this.input && this.input.focus();
  this.list = "";
  this.id = -1;
  this.doc.unbind("click");
  this.el.empty().fadeOut();
  return!1;
}, open:function(a) {
  var b, c, d, e = [], g;
  this.doc.unbind("click").bind("click", this.proxy(this.close));
  this.input = $(a.target);
  g = d = a.target.value;
  this.list && (d = d.replace(this.list, ""));
  if(2 > d.length) {
      return!1;
  }
  if(40 === a.keyCode || 38 === a.keyCode) {
    return this.arrow(a), !1;
  }
  if(48 <= a.keyCode && 90 >= a.keyCode || 8 == a.keyCode) {
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
        this.el.html(e.join(" ")).fadeIn();
        this.buttons = this.el.find("dd");
        return !1;
    }else{
       this.gettips(g);
       return !1;
    }
  }else {
    this.id = -1, 32 === a.keyCode && (this.list += d);
    }
}, hint:function(a, b) {
  var c, d, e = [];
  this.el.empty();
  if(!a.length)
    return !1;
  this.doc.unbind("click").bind("click", this.proxy(this.close));
  d = 26 * a.length + 10;
  e.push("<dt style='height:" + d + "px'>Você quis dizer:</dt>");
    for(c = 0;c < a.length;c++) {
        e.push("<dd>" + a[c].WORD.capitalize() + "</dd>");
    }
    this.el.html(e.join(" ")).fadeIn();
    this.buttons = this.el.find("dd");
}, arrow:function(a) {
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
  return!1;
}, gettips: function(a){
    $.getJSON(nodePath + "SearchMaterial.svc/searchTermo/&query=" + a + "?callback=?", this.proxy(this.hint));
}, init:function() {
  this.spot = [];
  this.list = "";
  this.id = 0;
  this.input = null;
  this.doc = $(document);
  $.getJSON("/library/ajax/spotlight.js", this.proxy(function(a) {
    this.spot = a;
  }));
}});