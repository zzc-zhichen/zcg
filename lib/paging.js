(function ($, window, document, undefined) {
    //定义分页类
    function Paging(element, options) {
        this.element = element;
        //传入形参
        this.options = {
            pageNo: options.pageNo,
            totalPage: options.totalPage,
            totalHref:options.totalHref,
            totalSize: options.totalSize,
            callback: options.callback
        };
        //根据形参初始化分页html和css代码
        this.init();
    }

    //对Paging的实例对象添加公共的属性和方法
    Paging.prototype = {
        constructor: Paging,
        init: function () {
            this.creatHtml();
            this.bindEvent();
        },
        creatHtml: function () {
            var me = this;
            var content = "";
            var current = +me.options.pageNo;
            var total = me.options.totalPage;
            var locahref = me.options.totalHref;
            if(/pageNo=[\d]*/.test(location.search)){
                locahref = location.href.match(/(\S*)pageNo=/)[1] + "pageNo=";
            }else {
                if (location.search) {
                    locahref = location.href.match(/(\S*)pageNo=/)[1] + "&pageNo=";
                }else {
                    locahref = location.href + "?pageNo="
                }
            }
            content += "<a id='prePage' href=\"javascript:;\"><i class=\"icon iconfont-zuojiantou\"></i></a>";
            if (total < 3) {
                for(var i = 1; i < total + 1; i++) {
                    if(current == i) {
                        content += "<a href='"+locahref + i +"' class='current'>" + i + "</a>";
                    } else {
                        content += "<a href= '"+locahref + i +"'>" + i + "</a>";
                    }
                }
            }else {
                if(current == 1){
                    for (var i = current; i < current + 3; i++) {
                        if (current == i) {
                            content += "<a href='"+locahref + i +"' class='current'>" + i + "</a>";
                        } else {
                            content += "<a href= '"+locahref + i +"'>" + i + "</a>";
                        }
                    }
                } else if (current > 1 && current < total){
                    for (var i = current - 1; i < current + 2; i++) {
                        if (current == i) {
                            content += "<a href='"+locahref + i +"' class='current'>" + i + "</a>";
                        } else {
                            content += "<a href= '"+locahref + i +"'>" + i + "</a>";
                        }
                    }
                }else if(current = total){
                    for (var i = current - 2; i < current + 1; i++) {
                        if (current == i) {
                            content += "<a href='"+locahref + i +"' class='current'>" + i + "</a>";
                        } else {
                            content += "<a href= '"+locahref + i +"'>" + i + "</a>";
                        }
                    }
                }
            }
            content += "<a id='nextPage' href=\"javascript:;\"><i class=\"icon iconfont-youjiantou\"></i></a>";

            me.element.html(content);
        },
        //添加页面操作事件
        bindEvent: function () {
            var me = this;
            var locahref = me.options.totalHref;
            if(/pageNo=[\d]*/.test(location.search)){
                locahref = location.href.match(/(\S*)pageNo=/)[1] + "pageNo=";
            }else {
                if (location.search) {
                    locahref = location.href.match(/(\S*)pageNo=/)[1] + "&pageNo=";
                }else {
                    locahref = location.href + "?pageNo="
                }
            }
            me.element.on('click', 'a', function () {
                var id = $(this).attr("id");
                if (id == "prePage") {
                    if (me.options.pageNo == 1) {
                        me.options.pageNo = 1;
                    } else {
                        me.options.pageNo = +me.options.pageNo - 1;
                        window.location.href = locahref+ me.options.pageNo;
                    }
                } else if (id == "nextPage") {
                    if (me.options.pageNo == me.options.totalPage) {
                        me.options.pageNo = me.options.totalPage
                    } else {
                        me.options.pageNo = +me.options.pageNo + 1;
                        window.location.href = locahref+ me.options.pageNo;
                    }
                }
                me.creatHtml();
                if (me.options.callback) {
                    me.options.callback(me.options.pageNo);
                }
            });
        }
    };
    //通过jQuery对象初始化分页对象
    $.fn.paging = function (options) {
        return new Paging($(this), options);
    }
})(jQuery, window, document);

