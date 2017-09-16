$(function () {
	// 起点
	var origin;
	// 是否移动
	var is_moveing = false;
	// uploader box元素
	var $wrap = $('#uploader');
	// 图片列表的ul元素
	var $fileList = $('.filelist');
	// 上传按钮元素
	var $upload = $wrap.find('.uploadBtn');
	// 文件总数量
	var fileCount = 0;
	// 文件大小
	var fileSize = 0;
	// 文件对象存储了文件的id 大小
	var percentages = {};
	var ratio = window.devicePixelRatio || 1;
// 缩略图大小 如果配置了就自己配置的 默认创建缩略图宽度
	var thumbnailWidth = window.webuploader.config.thumbWidth || 110;
	thumbnailWidth *= ratio;
// 缩略图大小 如果配置了就自己配置的 默认创建缩略图宽度
	var thumbnailHeight = window.webuploader.config.thumbHeight || 110;
	thumbnailHeight *= ratio;
	// 获取地址栏的商品id
	var id = getUrlParam('product_id');
	// 配置信息
	var uploader = WebUploader.create({
		swf: "./js/lib/webuploader/Uploader.swf",
		server: 'http://172.168.1.61:8080/ProductMaven/pic/file/upload',
		// 上传按钮容器
		pick: {
			id: '#filePicker1',
			multiple: false
		},
		// 指定Drag And Drop拖拽的容器，如果不指定，则不启动
		dnd: '.btns',
		// 指定监听paste事件的容器，如果不指定，不启用此功能。此功能为通过粘贴来添加截屏的图片。建议设置为document.body
		paste: document.body,
		// 设置指定接受哪些类型的文件
		accept: {
			title: 'Images',
			extensions: 'gif,jpg,jpeg,png',
			mimeTypes: 'images/*'
		},
		// 调整
		resize: false,
		// 禁掉整个页面的拖拽功能，如果不禁用，图片拖进来的时候会默认被浏览器打开。
		disableGlobalDnd: true,
		// 开启分片处理大文件上传
		// chunked: true,
		// 验证文件总数量, 超出则不允许加入队列。
		fileNumLimit: 4,
		// 去重,根据文件名字、文件大小和最后修改时间来生成hash Key.
		duplicate: true
	});
	// 配置多个按钮
	uploader.addButton({
		id: '#filePicker2',
		multiple: false
	});
	uploader.addButton({
		id: '#filePicker3',
		multiple: false
	});
	uploader.addButton({
		id: '#filePicker4',
		multiple: false
	});
	uploader.on('beforeFileQueued', function (file) {
		$upload.removeClass('disabled');
	});
	
	uploader.on('uploadProgress', function (file, percentage) {
		var $li = $('#' + file.id),
			$percent = $li.find('.progess span');
		
		$percent.css("width", percentage * 100 + '%');
	});
	var indexSort = 0;
	uploader.on('fileQueued', function (file) {
		fileCount++;
		fileSize += file.size;
		// 创建元素
		var index = $fileList.find('li').length;
		// 图片的left值
		var imgLeft = index * (thumbnailWidth + 10);
		// 图片的top值为0 基础两个数值来定位元素
		var imgTop = 10;
		// 设置ul.filelist元素的高度 等于默认缩略图高度+20
		// 如当前默认150  150+20 170收ul.filelist的高度
		var wrapHeight = thumbnailHeight + 20;
		// 获取ul.filelist的宽度
		var wrapWidth = $fileList.width() + 20 + 10;
		if (flag) {
			var $li = $('<li data-key="' + file.key + '"  data-src="' + file.src + '" data-sort="' + index + '" draggable="true" id="' + file.id + '" style="position:absolute;margin:0;cursor:move;width:' + thumbnailWidth + 'px;height:' + thumbnailHeight + 'px;left:' + imgLeft + 'px;top:' + imgTop + '">' +
				'<p class="title">' + file.name + '</p>' +
				'<p class="imgWrap"></p>' +
				'<p class="progress"><span></span></p>' +
				'<p class="zn-cropper-img"></p>' +
				'</li>'
				),
				$btns = $('<div class="file-panel">' +
					'<span class="cancel">删除</span>').appendTo($li);
		} else if (delSortArr.length !== 4 && delSortArr.length !== 0) {
			var $li = $('<li data-key="' + file.key + '"  data-src="' + file.src + '" data-sort="' + delSortArr[indexSort] + '" draggable="true" id="' + file.id + '" style="position:absolute;margin:0;cursor:move;width:' + thumbnailWidth + 'px;height:' + thumbnailHeight + 'px;left:' + imgLeft + 'px;top:' + imgTop + '">' +
				'<p class="title">' + file.name + '</p>' +
				'<p class="imgWrap"></p>' +
				'<p class="progress"><span></span></p>' +
				'<p class="zn-cropper-img"></p>' +
				'</li>'
				),
				$btns = $('<div class="file-panel">' +
					'<span class="cancel">删除</span>').appendTo($li);
		} else {
			var $li = $('<li data-key="' + file.key + '"  data-src="' + file.src + '" data-sort="' + index + '" draggable="true" id="' + file.id + '" style="position:absolute;margin:0;cursor:move;width:' + thumbnailWidth + 'px;height:' + thumbnailHeight + 'px;left:' + imgLeft + 'px;top:' + imgTop + '">' +
				'<p class="title">' + file.name + '</p>' +
				'<p class="imgWrap"></p>' +
				'<p class="progress"><span></span></p>' +
				'<p class="zn-cropper-img"></p>' +
				'</li>'
				),
				$btns = $('<div class="file-panel">' +
					'<span class="cancel">删除</span>').appendTo($li);
		}
		indexSort++;
		$wrap = $li.find('p.imgWrap')
		uploader.makeThumb(file, function (error, src) {
			if (error) {
				$wrap.text('不能预览');
				return;
			}
			var img = $('<img draggable="true" src="' + src + '">');
			
			img.bind('load', setDragEvent);
			
			$wrap.empty().append(img);
			
			file.size = imageProc.getImageSize(src);
			file.imgData = src;
		}, 1, 1);
		
		percentages[file.id] = [fileSize, 0];
		
		file.on('statuschange', function (cur, prev) {
			if (prev == 'progress') {
			} else if (prev == 'queued') {
				$li.off('mouseenter mouseleave');
				$btns.remove();
			}
			if (cur == 'error' || cur == 'invalid') {
				percentages[file.id][1] = 1;
			} else if (cur == 'interrupt') {
			} else if (cur == 'queued') {
				percentages[file.id][1] = 0;
			} else if (cur == 'progress') {
			} else if (cur == 'complete') {
				$li.append('<span class="success"></span>');
			}
			$li.removeClass('state-' + prev).addClass('state-' + cur);
		});
		$li.on('mouseenter', function () {
			$btns.stop().animate({height: 30});
		});
		$li.on('mouseleave', function () {
			$btns.stop().animate({height: 0})
		});
		
		$btns.on('click', 'span', function () {
			var index = $(this).index(), deg;
			switch (index) {
				case 0:
					//修改删除后面所有图片的位置
					var allImgs = {};
					var del_sort = parseInt($('#' + file.id).attr('data-sort'));
					$fileList.find('li').each(function (index, obj) {
						if ($(obj).attr('data-sort') > del_sort) {
							var sort = parseInt($(obj).attr('data-sort'));
							var $prevObj = $("li[data-sort=" + (sort - 1) + "]");
							if ($prevObj) {
								allImgs[$(obj).attr('id')] = $prevObj.position();
							}
						}
					});
					for (var k in allImgs) {
						var sort = parseInt($('#' + k).attr('data-sort'));
						$('#' + k).attr('data-sort', sort - 1).css({left: allImgs[k].left + 'px', top: allImgs[k].top + 'px'});
					}
					allImgs = null;
					if (file.src == "client")
						uploader.removeFile(file);
					else {
						$('#' + file.id).remove();
					}
					return;
				case 1:
					file.rotation += 90;
					break;
				case 2:
					file.rotation -= 90;
					break;
			}
			
		});
		
		$li.find('.zn-cropper-img').on('click', function () {
			var image = $(this).parent('li').find('img').attr('src');
			imageProc.initCropper(image, file);
			$('#zn-photodiy-edit').modal({
				onConfirm: function () {
					imageProc.getCanvasImage();
					imageProc.destroy();
				},
				onCancel: function () {
					imageProc.destroy();
				}
			});
		});
		
		$li.appendTo($fileList);
	});// end fileQueued事件
	
	
	uploader.on('fileDequeued', function (file) {
		fileCount--;
		fileSize -= file.size;
		removeFile(file);
	});
	
	uploader.on('uploadStart', function (file) {
		uploader.options.formData.pro_id = id;
		uploader.options.formData.image_type = file.ext;
	});
	
	uploader.on('uploadSuccess', function (file, response) {
		$('#' + file.id).find('p.state').text('已上传');
	});
	
	uploader.on('uploadError', function (file, code) {
		console.log(file.id + '上传出错');
	});
	
	
	uploader.on('error', function (code) {
		var err = '';
		switch (code) {
			case 'F_EXCEED_SIZE':
				err += '单张图片大小不得超过' + config.fileSingleSizeLimit + 'kb！';
				break;
			case 'Q_EXCEED_NUM_LIMIT':
				err += '最多只能上传' + config.fileNumLimit + '张！';
				break;
			case 'Q_EXCEED_SIZE_LIMIT':
				err += '上传图片总大小超出100M！';
				break;
			case 'Q_TYPE_DENIED':
				err += '无效图片类型，请上传正确的图片格式！';
				break;
			default:
				err += '上传错误，请刷新重试！';
				break;
		}
		alert('系统提示' + err);
		return false;
	});
	
	// 做了图片的排序
	uploader.on('uploadBeforeSend', function (block, data) {
		data.sort = $('#' + data.id).attr('data-sort');
	});
	
	uploader.on('uploadComplete', function (file) {
		$('#' + file.id).find('p.state').fadeOut();
	});
	$upload.on('click', function () {
		if ($(this).hasClass('disabled')) {
			return false;
		}
		$(this).addClass('disabled')
		uploader.sort(function (obj1, obj2) {
			return $('#' + obj1.id).attr('data-sort') > $('#' + obj2.id) ? -1 : 1;
		});
		$fileList.find('.zn-cropper-img').remove();
		uploader.upload();
	});
	
	var imageProc = {
		file: {},
		image: $('#image_cropper'),
		/**
		 * cropper初始化
		 */
		initCropper: function (src, file) {
			imageProc.file = file;
			imageProc.image.attr('src', src).cropper({
				viewMode: 1,
				//定义cropper的拖拽模式。
				dragMode: 'move',
				//初始化时，可以自动生成图像。
				autoCrop: true,
				//定义自动裁剪面积大小(百分比) 0-1区间
				autoCropArea: 0.8,
				// 是否允许拖动裁剪框，默认true
				cropBoxMovable: true,
				// 是否允许拖动 改变裁剪框大小
				cropBoxResizable: true,
				
				ready: function () {
					if (imageProc.file.cropData != '') {
						var data = {
							left: imageProc.file.x,
							top: imageProc.file.y
						}
						imageProc.image.cropper('setCropBoxData', data);
					}
				},
				
				crop: function (e) {
					imageProc.file.cropData = {
						left: e.x,
						top: e.y,
						width: e.width,
						height: e.height
					}
				}
				
			});
		},
		
		/**
		 * canvas繪製照片
		 */
		drawCanvasImage: function (sourceCanvas, canvasOffsetX, canvasOffsetY, canvasCutWidth, canvasCutHeight, pX, pY, sWidth, sHeight) {
			var canvas = document.createElement('canvas');
			canvas.width = sWidth;
			canvas.height = sHeight;
			var ctx = canvas.getContext('2d');
			ctx.fillStyle = "#fff";
			ctx.fillRect(0, 0, sWidth, sHeight);
			ctx.drawImage(sourceCanvas, canvasOffsetX, canvasOffsetY, canvasCutWidth, canvasCutHeight, pX, pY, sWidth, sHeight);
			var dataURL = canvas.toDataURL('image/jpeg');
			return dataURL;
		},
		
		/**
		 * 生产裁切后的图片
		 */
		getCanvasImage: function () {
			var croppedCanvas;
			var roundedCanvas;
			var roundedImage;
			
			
			// 生成裁剪画布
			croppedCanvas = imageProc.image.cropper('getCroppedCanvas');
			
			var sWidth = config.canvas.sWidth;
			var sHeight = config.canvas.sHeight;
			var pX = 0, pY = 0;
			
			var dataURL = imageProc.drawCanvasImage(croppedCanvas, 0, 0, croppedCanvas.width, croppedCanvas.height, pX, pY, sWidth, sHeight);
			imageProc.file.imgData = dataURL;
			imageProc.file.size = imageProc.getImageSize(dataURL);
			
			$('#' + imageProc.file.id).find('.imgWrap img').attr('src', dataURL);
		},
		
		/**
		 * 計算Base64編碼圖片的size
		 */
		getImageSize: function (dataURL) {
			var dataStr = dataURL.substring(23);
			var eqIndex = dataStr.indexOf('=');
			if (dataStr.indexOf('=') > 0) {
				dataStr = dataStr.substring(0, eqIndex);
			}
			var strLength = dataStr.length;
			var fileLength = parseInt(strLength - (strLength / 8) * 2);
			
			return fileLength;
		},
		
		/**
		 * 銷毀cropper實例
		 */
		destroy: function () {
			imageProc.image.cropper('destroy');
		}
	}
	
	var image = {
		liWidth: 223,
		/**
		 * 縮略圖
		 */
		thumb: function () {
			$('#uploaded_list').find('img').each(function () {
				var size = image.getThumbSize($(this));
				$(this).width(size.width).height(size.height);
			});
		},
		/**
		 * 計算圖片的縮略尺寸
		 */
		getThumbSize: function (imgObj) {
			var origin = new Image();
			origin.src = $(imgObj).attr('src');
			
			var thumbWidth;
			var thumbHeight;
			if (origin.width > origin.height) {
				if (origin.width > image.liWidth) {
					thumbWidth = image.liWidth;
					thumbHeight = origin.height * origin.width / image.liWidth;
				} else {
					thumbWidth = origin.width;
					thumbHeight = origin.height;
				}
			} else if (origin.width < origin.height) {
				if (origin.height > image.liWidth) {
					thumbHeight = image.liWidth;
					thumbWidth = origin.width * image.liWidth / origin.height;
				} else {
					thumbHeight = origin.height;
					thumbWidth = origin.width;
				}
			}
			return {
				'width': thumbWidth,
				'height': thumbHeight
			};
		},
		/**
		 * 預覽
		 */
		preview: function () {
			var thumbWidth = parseInt($('.filelist').find('li').width());
			$('.filelist').find('img').each(function () {
				$(this).width(thumbWidth).height(thumbWidth);
			});
		}
	};
	
	
	$(document.body).on('click', '[data-method]', function () {
		var data = $(this).data(),
			$target, result;
		if (data.method) {
			data = $.extend({}, data); // Clone a new one
			if (typeof data.target !== 'undefined') {
				$target = $(data.target);
				if (typeof data.option === 'undefined') {
					try {
						data.option = JSON.parse($target.val());
					} catch (e) {
						console.log(e.message);
					}
				}
			}
			result = $('#image_cropper').cropper(data.method, data.option);
			if ($.isPlainObject(result) && $target) {
				try {
					$target.val(JSON.stringify(result));
				} catch (e) {
					console.log(e.message);
				}
			}
		}
	})
	
	
	function setDragEvent() {
		$(this).on('drop', function (e) {
			var $from = $(origin).parents('li');
			var $to = $(e.target).parents('li');
			var origin_pos = $from.position();
			var target_pos = $to.position();
			var from_sort = $from.attr('data-sort');
			var to_sort = $to.attr('data-sort');
			
			$from.addClass('move').animate(target_pos, "fast", function () {
				$(this).removeClass('move');
			}).attr('data-sort', to_sort);
			
			$to.addClass('move').animate(origin_pos, 'fast', function () {
				$(this).removeClass('move');
			}).attr('data-sort', from_sort);
		})
			.on('dragstart', function (e) {
				if (is_moveing) {
					return false;
				}
				is_moveing = true;
				e.originalEvent.dataTransfer.effectAllowd = 'move';
				origin = this;
			})
			.on('dragover', function (e) {
				if (e.preventDefault)
					e.preventDefault();
				is_moveing = false;
				e.originalEvent.dataTransfer.dropEffect = 'move';
			});
	}
	
	function removeFile(file) {
		var $li = $('#' + file.id);
		delete percentages[file.id];
		$li.off().find('.file-panel').off().end().remove();
	}
});// end