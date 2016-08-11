require.config({shim:{spine:{deps:["jquery"], exports:"Spine"}}, baseUrl:"js/lib", paths:{app:"../app", models:"../models", sp:"spine"}});
require(["methods", "sp/spine", "app/filter", "app/content"], function() {
  window.App = Spine.Controller.sub({el:$("body"), elements:{"#spotlight":"spotEl", "#modal":"modalEl", "#main form":"mainEl", "#main input":"inputs", "#main .insc":"insc", "#main .select-cart":"isento", "#wrap .mask":"maskEl"}, events:{"submit #main form":"submit", "click #main .cancel":"getout", "click #main .bconfirm":"cep", "blur #main .cep":"cep", "blur #main .cnpj":"cnpj", "focus #main .combo-input":"prompt", "click #main .bprompt":"prompt", "click #main .combo li":"combo", "click #main .select-cart":"select"}, 
  init:function() {
    this.inputs.attr("autocomplete", "off");
    this.doc = $(document);
    this.loading = !1;
    this.doc.on("click", this.proxy(this.anyclick));
    this.modal = new Modal({el:this.modalEl});
    $.getJSON("ajax/location.js", this.proxy(this.source));
    this.maskEl.height(this.stage().h);
    this.el.disableSelection();
  }, submit:function(a) {
    a.preventDefault();
    var b, c, f, d = this, g = [], h = [];
    this.getloading(!0);
    b = this.isento.hasClass("on") ? "x" : " ";
    this.inputs.filter('[name="isento"]').val(b);
    f = this.inputs.filter('[name="cnpj"]').hasClass("error");
    a = arrayObject($(a.target).serializeArray());
    $.each(a, function(a, e) {
      c = !1;
      if ("cnpj" === a && f) {
        return d.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", "CNPJ inv\u00e1lido!", !0), !1;
      }
      if (!e && "ie" === a && "x" === b || e && "ie" === a) {
        if (e && !isNumber(e) && "x" !== b) {
          return d.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", a.capitalize() + " inv\u00e1lido!", !0), !1;
        }
        e || (e = " ");
      } else {
        if (!e && "ie" === a && "x" !== b) {
          return d.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", "Por favor preecher o campo " + a.capitalize() + ".", !0), !1;
        }
      }
      if (e && ("ddd1" === a || "telefone1" === a || "ddd2" === a || "telefone2" === a) && !isNumber(e)) {
        return d.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", a.capitalize() + " inv\u00e1lido!", !0), !1;
      }
      if (e || "complemento" === a || "ddd2" === a || "telefone2" === a) {
        e || (e = " ");
      } else {
        return d.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", "Por favor preecher o campo " + a.capitalize() + ".", !0), !1;
      }
      if ("email" === a && !isEmail(e)) {
        return d.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", "E-Mail inv\u00e1lido!", !0), !1;
      }
      "senha" === a && (b = e);
      if ("csenha" === a && b !== e) {
        return d.modal.open("Erro ao confirmar Senha", "Senha e confirma\u00e7\u00e3o diferentes!", !0), !1;
      }
      "none" !== a && "csenha" !== a && (g.push(e), h.push(a + " : " + e));
      c = !0;
    });
    c || d.getloading(!1);
    c && alert(g);
    g = g.join("/");
    c && $.getJSON("http://was-dev/Focus24Dev/Services/Cliente.svc/client/" + g + "/0/?callback=?", this.proxy(function(a) {
      if (-1 !== a.indexOf("salvo")) {
        return d.modal.open("Cadastro enviado com sucesso!", "Obrigado por fazer seu cadastro na Focus T\u00eaxtil. Aguarde contato de um representante Focus para finalizar o seu cadastro e receber seu login e senha.", !1, d.proxy(d.getout)), !1;
      }
    }));
    return!1;
  }, getloading:function(a) {
    a && !this.loading ? (this.maskEl.fadeIn(), this.loading = !0) : !1 === a && this.loading && (this.maskEl.fadeOut(), this.loading = !1);
    return this.loading;
  }, getout:function() {
    window.location = "login.html";
  }, anyclick:function(a) {
    if ("object" !== typeof a && a.hasClass("button")) {
      return!1;
    }
    a.preventDefault();
    a = $(a.target);
    if (a.hasClass("send")) {
      return this.mainEl.trigger("submit"), !1;
    }
    if (!a.parents("label").find(".open").length) {
      return this.el.find(".open").hide().removeClass("open"), !1;
    }
  }, prompt:function(a) {
    if ("object" === typeof a) {
      a.preventDefault(), a = $(a.target);
    } else {
      return!1;
    }
    if (a.hasClass("disable")) {
      return!1;
    }
    var b = a.parent().find(".combo");
    if (b.hasClass("open")) {
      return b.hide().removeClass("open"), !1;
    }
    a = a.parents("label").find("input");
    b.width(a.width() + 31);
    this.el.find(".open").hide().removeClass("open");
    b.addClass("open");
    b.fadeIn();
    b.tinyscrollbar();
    return!1;
  }, source:function(a) {
    var b, c, f = this;
    this.inputs.filter(".combo-input").each(function(d) {
      d = $(this);
      c = d.next("input");
      d = d.parent().find(".combo-list");
      c = c.attr("name").toUpperCase();
      b = a.filter(function(a) {
        return a.INPUT === c;
      });
      f.fillbox(b, d);
    });
    return!1;
  }, fillbox:function(a, b) {
    for (var c = [], f = 0;f < a.length;f++) {
      c.push('<li data="' + a[f].ID + '">' + a[f].VALUE + "</li>");
    }
    b.html(c.join(""));
    return!1;
  }, combo:function(a) {
    if ("object" === typeof a) {
      a.preventDefault(), a = $(a.target);
    } else {
      return!1;
    }
    var b = a.parents("label").find(".combo");
    a.parents("label").find(".fake-input").val(a.attr("data"));
    a.parents("label").find(".combo-input").val(a.text());
    b.hide();
    b.removeClass("open");
    return!1;
  }, getspot:function(a) {
    13 === a.keyCode ? (this.spotlight.close(), this.searchEl.trigger("submit")) : 1 < a.target.value.length ? this.spotlight.open(a) : this.spotlight.close();
    return!1;
  }, cep:function(a) {
    "object" === typeof a && (a.preventDefault(), a = $(a.target));
    var b, c = this;
    (b = a.val() || a.prev().val()) && $.getJSON("http://was-dev/Focus24Dev/Services/CEP.svc/cep/" + b + "?callback=?", function(f) {
      f && f.CLIENT ? f.PAIS = "BR" : (c.modal.open("Campo Inv\u00e1lido", "CEP Digitado n\u00e3o encontrado. Por favor, digite novamente.", !0), c.inputs.filter(".cep").val(""));
      for (var d in f) {
        (b = c.inputs.filter('[name="' + d.toLowerCase() + '"]')) && b.val(f[d].capitalize()), b.hasClass("fake-input") && b.parent().find('[data="' + f[d] + '"]').trigger("click");
      }
      c.el.find(".bprompt").addClass("disable");
      a.blur();
    });
  }, cnpj:function(a) {
    "object" === typeof a && (a.preventDefault(), a = $(a.target));
    var b, c = this;
    b = a.val();
    a.val(onlyNumbers(b));
    if (b && isCnpj(b)) {
      a.removeClass("error"), $.getJSON("http://was-dev/Focus24Dev/Services/Cliente.svc/procurar/" + onlyNumbers(b) + "?callback=?", function(b) {
        return-1 !== b.toLowerCase().indexOf("n\u00e3o cadastrado") ? (a.blur(), !1) : -1 !== b.toLowerCase().indexOf("inativo") ? (c.modal.open(b.replace(".", ""), "Favor entrar em contato com o seu Representante para solicitar acesso ao Focus 24h."), a.val("").blur(), !1) : (c.modal.open(b.replace(".", ""), " Favor entrar em contato com o seu Representante ou solicitar uma nova senha."), a.val("").blur(), !1);
      });
    } else {
      if (b) {
        return!a.hasClass("error") && a.addClass("error").blur(), !1;
      }
    }
  }, select:function(a) {
    if ("object" === typeof a) {
      a.preventDefault(), a = $(a.target);
    } else {
      return!1;
    }
    a.hasClass("on") ? this.insc.removeClass("off").attr("readonly", !1) : this.insc.addClass("off").attr("readonly", !0).val(" ");
    a.toggleClass("on");
  }, stage:function() {
    var a, b;
    "number" === typeof window.innerWidth ? (a = window.innerWidth, b = window.innerHeight) : (a = document.documentElement.clientWidth, b = document.documentElement.clientHeight);
    return{w:a, h:b};
  }});
  new App;
});