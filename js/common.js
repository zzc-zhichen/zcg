$(function () {
	$('#accordion .link').on('click', function () {
		var span = $(this).children()[1];
		$(span).toggleClass('icon-xia');
		$(span).toggleClass('icon-shang');
		$(this).siblings().stop(true, false).slideToggle();
	})
	$('#userInfo').on('click', function () {
		$('.user-info').toggle();
	})



	$(".cs-nav-left-cen").on("click", function () {
		$(this).find(".iconfont-down").addClass("rote");
	});
	$(".shezhi").on("click", function () {
		$(".edit").toggle();
	});

});

var common = {};

//弹出框模板构造方法
//用的时候，common.lightBox.showMessage("你确定要删除此条信息吗？")
common.lightBox = {
	el: '',
	initTemplate: function (message) {
		if (this.el.length > 0) {
			this.el.remove();
		}
		var a = [],
			$this = this;
		a.push('<div class="modal fade" id="showModalMessageBox">');
		a.push('    <div class="modal-dialog">');
		a.push('        <div class="modal-content">');
		a.push('            <div class="modal-header">');
		a.push('                <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>');
		a.push('                <h4 class="modal-title">提示</h4>');
		a.push('            </div>');
		a.push('            <div class="modal-body">');
		a.push('                <p>' + message + '</p>');
		a.push('            </div>');
		a.push('            <div class="modal-footer">');
		a.push('                <button type="button" class="btn btn-primary" data-dismiss="modal" style="background-color: #f2ae43;border-color: #f2ae43;" >关闭</button>');
		a.push('            </div>');
		a.push('        </div>');
		a.push('    </div>');
		a.push('</div>');
		var alertBox = a.join('');
		$(document.body).append(alertBox);
		var showModal = $("#showModalMessageBox");
		this.el = showModal;
	},
	showMessage: function (info, callback) {
		this.initTemplate(info);
		this.el.modal("show");
	},
	showLoading: function () {
		if ($("#loading").length > 0) {
			$("#loading").show();
			return;
		}
		var loadingHtml = "<div id='loading' style='width: 100%;height: 100%;position:fixed;top:0;z-index:999;background-color: black;opacity:0.5;'><img src='../images/ajaxLoading.gif' style='margin: 20% 48%'/><div>";
		$(document.body).append(loadingHtml);

	},
	hideLoading: function () {
		if ($("#loading").length > 0) {
			$("#loading").hide();
			return;
		}
	}
};

//设置浏览器地址
function setPageParam(pageNum) {
	var url = "";
	//用正则匹配url里面是否包含"p=",如果包含的话,需要把后面的值替换了
	if (/[\?]name=[\S*]/.test(location.search)) {
		url = location.search.replace(/\?name=[\s\S]*/, "?" + pageNum);
	} else if (/[\?|\&]pageNo=[\d*]/.test(location.search)) {
		url = location.search.replace(/\?pageNo=[\d*]/, "?" + pageNum);
	} else {
		if (location.search) {
			url = location.search + "&" + pageNum;
		} else {
			url = "?" + pageNum;
		}
	}
	window.history.replaceState("", "", url);
	console.log(url);
}

// 截取浏览器地址
function GetQueryString(name) {
	var reg = new RegExp('(^|&)' + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) {
		return decodeURI(r[2]);
	}
	return null;
}

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	var r = window.location.search.substr(1).match(reg); //匹配目标参数
	if (r != null) return unescape(r[2]);
	return null; //返回参数值
}

var storeUrl = 'http://172.168.1.61:8080/ProductMaven/repository/get_repository_list';