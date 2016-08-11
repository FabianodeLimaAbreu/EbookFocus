var e = [{
	"MATNR": "P11NL0277"
}, {
	"MATNR": "P11NL0282"
}, {
	"MATNR": "P11NL0281"
}, {
	"MATNR": "P11NL0280"
}, {
	"MATNR": "P11NL0279"
}, {
	"MATNR": "P11NL0278"
}, {
	"MATNR": "P11NL0274"
}, {
	"MATNR": "P11NL0275"
}, {
	"MATNR": "P11NL0276"
}, {
	"MATNR": "P11NL0290"
}, {
	"MATNR": "P11NL0291"
}, {
	"MATNR": "P11NL0287"
}, {
	"MATNR": "P11NL0288"
}, {
	"MATNR": "P11NL0283"
}, {
	"MATNR": "P11NL0285"
}, {
	"MATNR": "P11TP0071"
}, {
	"MATNR": "P11AC0007"
}, {
	"MATNR": "P11AC0006"
}, {
	"MATNR": "P11AC0013"
}, {
	"MATNR": "P11TF0003"
}, {
	"MATNR": "P11TF0023"
}, {
	"MATNR": "P11TF0024"
}, {
	"MATNR": "P11TC0056"
}, {
	"MATNR": "P11AF0143"
}, {
	"MATNR": "P11TC0006"
}, {
	"MATNR": "P11TC0057"
}, {
	"MATNR": "P11TC0058"
}, {
	"MATNR": "P11TC0059"
}, {
	"MATNR": "P11TC0029"
}, {
	"MATNR": "P11TC0033"
}, {
	"MATNR": "P11TC0028"
}, {
	"MATNR": "P21LN0114"
}, {
	"MATNR": "P21LN0128"
}, {
	"MATNR": "P11CR0001"
}, {
	"MATNR": "P11CR0015"
}, {
	"MATNR": "P11NP0242"
}, {
	"MATNR": "P11NP0245"
}, {
	"MATNR": "P11NP0247"
}, {
	"MATNR": "M11MM0004"
}, {
	"MATNR": "M11MM0034"
}, {
	"MATNR": "M11MM0038"
}, {
	"MATNR": "M11MM0236"
}, {
	"MATNR": "M11CR0054"
}, {
	"MATNR": "M11MP0125"
}, {
	"MATNR": "M11MP0124"
}, {
	"MATNR": "M11MP0061"
}];

insertMat(0);

function insertMat(id) {
	if(id < e.length){
		var actual = e[id].MATNR;
		console.log(actual);
		$.getJSON("http://was-dev/Focus24/Services/Ebook.svc/insertPromocaoMaterial/20130005/" + actual + "?callback=?", function(d) {
			console.log(d);
			id = id + 1;
			insertMat(id);

		});
	}
}
//$.getJSON("http://was-dev/Focus24/Services/Login.svc/historicosenha/?callback=?", function(e) {
//$.each(e, function(a, b){
//console.log(b.MATNR);
//$.getJSON("http://was-dev/Focus24/Services/Login.svc/historicosenha/?callback=?", function(e) {});
//});
//alert(e.length);
//});