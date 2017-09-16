jQuery(function () {
	var $ = jQuery;

// 拖拽元素
	var origin;
// 是否移动
	var is_moveing = false;
// 容器元素 div id='uploader'
	var $wrap = $('#' + window.webuploader.config.wrapId);
// 创建一个<ul class="filelist"></ul> 添加到 .queueList容器中
	var $queue = $('<ul class="filelist"></ul>').appendTo($wrap.find('.queueList'));
// 获取到 div id='uploader' 中的 .statusBar元素
	var $statusBar = $wrap.find('.statusBar');
// 获取到 .statusBar元素 中的 info是选中图片信息,和图片总大小KB
	var $info = $statusBar.find('.info');
// 获取到 div id='uploader' 中的 .uploadBtn 按钮 第二个上传按钮
	var $upload = $wrap.find('.uploadBtn');
// placeholder是id="dndArea"元素
	var $placeHolder = $wrap.find('.placeholder');
// 进度条元素
	var $progress = $statusBar.find('.progress').hide();
// 文件总数量
	var fileCount = 0;
// 文件大小
	var fileSize = 0;
// 状态
	var state = 'pedding';
	//
	var id = getUrlParam('product_id');
// 文件对象存储了文件的id 大小
	var percentages = {};
// 判断支持transition属性
	var supportTransition = (function () {
		var s = document.createElement('p').style,
			r = 'transition' in s ||
				'WebkitTransition' in s ||
				'MozTransition' in s ||
				'msTransition' in s ||
				'OTransition' in s;
		s = null;
		return r;
	})();
// 优化retina, 在retina下这个值是2
// 视网膜屏幕
	var ratio = window.devicePixelRatio || 1;
// 缩略图大小 如果配置了就自己配置的 默认创建缩略图宽度
	var thumbnailWidth = window.webuploader.config.thumbWidth || 110;
	thumbnailWidth *= ratio;
// 缩略图大小 如果配置了就自己配置的 默认创建缩略图宽度
	var thumbnailHeight = window.webuploader.config.thumbHeight || 110;
	thumbnailHeight *= ratio;
	
	
	var uploader = WebUploader.create({
		swf: "./js/lib/webuploader/Uploader.swf",
		// 上传服务地址uploadFile  file/upload
		server: 'http://172.168.1.61:8080/ProductMaven/pic/file/upload',
		pick: {
			id: '#filePicker',
			label: '点击选择图片'
		},
		// 指定Drag And Drop拖拽的容器，如果不指定，则不启动
		dnd: '.queueList',
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

// 设置拖拽事件
// setDragEvent();
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
	
	function updateServerFiles() {
		var postData = {};
		$('[data-src="server"]').each(function (index, obj) {
			postData[$(obj).attr('data-key')] = $(obj).attr('data-sort');
		});
		$.ajax({
			type: 'post',
			url: '',
			data: postData,
			dataType: 'json',
			success: function (data) {
				//setState('finish');
				alert('更新成功');
				$upload.removeClass('disabled');
				setState('ready');
				uploader.reset();
			}
		});
	}
	
	function addFile(file) {
		var index = $queue.find('li').length;
		var imgLeft = index * (thumbnailWidth + 10);
		var imgTop = 0;
		var wrapHeight = thumbnailHeight + 20;
		var wrapWidth = $queue.width() + 20 + 10;
		if (imgLeft >= wrapWidth) {
			imgTop = parseInt(imgLeft / wrapWidth) * (thumbnailHeight + 10);
			wrapHeight = imgTop + wrapHeight;
			imgLeft = (index % (parseInt(wrapWidth / (thumbnailWidth + 10)) ) ) * (thumbnailWidth + 10);
		}
		$queue.height(wrapHeight);
		var $li = $('<li data-key="' + file.key + '"  data-src="' + file.src + '" data-sort="' + index + '" draggable="true" id="' + file.id + '" style="position:absolute;margin:0;cursor:move;width:' + thumbnailWidth + 'px;height:' + thumbnailHeight + 'px;left:' + imgLeft + 'px;top:' + imgTop + '">' +
			'<p class="title">' + file.name + '</p>' +
			'<p class="imgWrap"></p>' +
			'<p class="progress"><span></span></p>' +
			'<p class="zn-cropper-img"></p>' +
			'</li>'
			),
			$btns = $('<div class="file-panel">' +
				'<span class="cancel">删除</span>').appendTo($li),
			
			$progess = $li.find('p.progress span'),
			$wrap = $li.find('p.imgWrap'),
			$info = $('<p class="error"></p>'),
			
			showError = function (code) {
				var text;
				switch (code) {
					case 'exceed_size':
						text = '文本大小超出';
						break;
					case 'interrupt':
						text = '上传暂停';
						break;
					default:
						text = '上传失败';
						break;
				}
				$info.text(text).appendTo($li);
			};
		
		if (file.src == "client") {
			if (file.getStatus() == 'invalid') {
				showError(file.statusText);
			} else {
				$wrap.text('预览中');
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
			}
			
			file.on('statuschange', function (cur, prev) {
				if (prev == 'progress') {
					$progress.hide().width(0);
				} else if (prev == 'queued') {
					$li.off('mouseenter mouseleave');
					$btns.remove();
				}
				
				if (cur == 'error' || cur == 'invalid') {
					showError(file.statusText);
					percentages[file.id][1] = 1;
				} else if (cur == 'interrupt') {
					showError('interrupt');
				} else if (cur == 'queued') {
					percentages[file.id][1] = 0;
				} else if (cur == 'progress') {
					$info.remove();
					$progress.css('display', 'block');
				} else if (cur == 'complete') {
					$li.append('<span class="success"></span>');
				}
				
				$li.removeClass('state-' + prev).addClass('state-' + cur);
			});
		}
		else {
			var img = $('<img draggable="true" src="' + file.path + '">');
			img.bind('load', setDragEvent);
			$wrap.empty().append(img);
		}
		
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
					$queue.find('li').each(function (index, obj) {
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
			
			if (supportTransition) {
				deb = 'rotate(' + file.rotation + 'deg)';
				$wrap.css({
					'-webkit-transform': deb,
					'-mos-transform': deg,
					'-o-transform': deg,
					'transform': deg
				});
			} else {
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
		
		$li.appendTo($queue);
	}
	
	function removeFile(file) {
		var $li = $('#' + file.id);
		delete percentages[file.id];
		updateTotalProgress();
		$li.off().find('.file-panel').off().end().remove();
	}
	
	function updateTotalProgress() {
		var loaded = 0,
			total = 0,
			spans = $progress.children(),
			percent;
		
		$.each(percentages, function (k, v) {
			total += v[0];
			loaded += v[0] * v[1];
		});
		
		percent = total ? loaded / total : 0;
		
		spans.eq(0).text(Math.round(percent * 100) + '%');
		spans.eq(1).css('width', Math.round(percent * 100) + '%');
		updateStatus();
	}
	
	function updateStatus() {
		var text = '', stats;
		if (state == 'ready') {
			text = '选中' + fileCount + '张图片，共' + WebUploader.formatSize(fileSize) + '.';
		} else if (state == 'confirm') {
			stats = uploader.getStats();
			if (stats.uploadFailNum) {
				text = '已成功上传' + stats.successNum + '张照片' + stats.uploadFailNum + '张照片上传失败,<a class="retry" href="#">重新上传</a>失败图片或<a class="ignore" href="#">忽略</a>';
			}
		} else {
			stats = uploader.getStats();
			text = '共' + fileCount + '张(' + WebUploader.formatSize(fileSize) + ')，已上传' + stats.successNum + '张';
			if (stats.uploadFailNum) {
				text += ',失败' + stats.uploadFailNum + '张';
			}
		}
		$info.html(text);
	}
	
	function setState(val, file) {
		var stats;
		if (val == state) {
			return;
		}
		$upload.removeClass('state-' + state);
		$upload.addClass('state-' + val);
		state = val;
		
		switch (state) {
			case 'pedding':
				$placeHolder.removeClass('element-invisible');
				$queue.parent().removeClass('filled');
				$queue.hide();
				$statusBar.addClass('element-invisible');
				uploader.refresh();
				break;
			case 'ready':
				$placeHolder.addClass('element-invisible');
				$('#filePicker2').removeClass('element-invisible');
				$queue.parent().addClass('filled');
				$queue.show();
				$statusBar.removeClass('element-invisible');
				uploader.refresh();
				break;
			case 'uploading':
				$('filePicker2').addClass('element-invisible');
				$progress.show();
				$upload.text('暂停上传');
				break;
			case 'paused':
				$progress.show();
				$upload.text('继续上传');
				break;
			case 'confirm':
				$progress.hide();
				$upload.text('开始上传').addClass('disabled1');
				stats = uploader.getStats();
				if (stats.successNum && !stats.uploadFailNum) {
					setState('finish');
					return;
				}
				break;
			case 'finish':
				stats = uploader.getStats();
				if (stats.successNum) {
					$queue.find('.zn-cropper-img').off('click');
					$queue.find('.zn-cropper-img').remove();
				} else {
					state = 'done';
					location.reload();
				}
				break;
		}
		updateStatus();
	}
	
	function fileQueue(file) {
		file.src = file.src || "client";
		fileCount++;
		fileSize += file.size;
		if (fileCount == 1) {
			$placeHolder.addClass('element-invisible');
			$statusBar.show();
		}
		
		addFile(file);
		setState('ready', file);
		
		updateTotalProgress();
	}
	
	
	if (!WebUploader.Uploader.support()) {
		console.log('WebUploader 不支持');
		throw new Error('WebUploader does not support');
	}
	
	uploader.addButton({
		id: '#filePicker2',
		label: '继续添加',
	});
	
	uploader.on('beforeFileQueued', function (file) {
		var uploadNum = parseInt($('.filelist').find('li').length)
		if (config.fileNumLimit && uploadNum >= config.fileNumLimit) {
			$('#my-alert').modal('open')
			return false;
		}
	});
	
	uploader.on('uploadProgress', function (file, percentage) {
		var $li = $('#' + file.id),
			$percent = $li.find('.progess span');
		
		$percent.css("width", percentage * 100 + '%');
		updateTotalProgress();
	});
	uploader.on('fileQueued', fileQueue);
	
	uploader.on('fileDequeued', function (file) {
		fileCount--;
		fileSize -= file.size;
		if (!fileCount) {
			setState('pedding');
		}
		removeFile(file);
		updateTotalProgress();
	});
	
	uploader.on('uploadStart', function (file) {
		uploader.options.formData.pro_id = id;
		uploader.options.formData.image_type = file.ext;
	});
	// 成功后的回调函数
	uploader.on('uploadSuccess', function (file, response) {
		var obj = uploader.getStats();
		console.log(response);
		$('#' + file.id).find('p.state').text('已上传');
		if (obj.successNum === 4) {
			var time = setInterval(function () {
				window.location.href = '/product/product.html';
				clearInterval(time);
			}, 1000);
			return;
		}
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
	
	uploader.on('uploadComplete', function (file) {
		$('#' + file.id).find('p.state').fadeOut();
	});
	
	uploader.on('all', function (type) {
		
		if (type == 'uploadFinished') {
			setState('confirm');
		} else if (type == 'startUpload') {
			setState('uploading');
		} else if (type == 'stopUpload') {
			setState('paused');
		}
	});
	
	uploader.on('uploadBeforeSend', function (block, data) {
		data.sort = $('#' + data.id).attr('data-sort');
	});
	
	$upload.on('click', function () {
		uploader.sort(function (obj1, obj2) {
			return $('#' + obj1.id).attr('data-sort') > $('#' + obj2.id) ? -1 : 1;
		});
		var baseCode = $queue.find('.imgWrap > img').attr('src')
		
		if ($(this).hasClass('disabled')) {
			return false;
		}
		if (state == 'ready') {
			if (uploader.getFiles().length < 1)
				updateServerFiles();
			else
				uploader.upload();
		} else if (state == 'paused') {
			uploader.upload();
		} else if (state == 'uploading') {
			uploader.stop();
		}
		var imgLi = $queue.find('li').length;
		if (imgLi != 4) {
			$('#my-confirm').modal('open')
			$('#imgCancel').on('click', function () {
				window.location.href = '/product/product.html';
			})
		}
	});
	
	$info.on('click', '.retry', function () {
		uploader.retry();
	});
	
	$info.on('click', '.ignore', function () {
		alert('请刷新页面重新上传');
	});
	
	$upload.addClass('state-' + state);
	updateTotalProgress();
	
	
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
			// 常见图片canvas画布
			var canvas = document.createElement('canvas');
			canvas.width = sWidth;
			canvas.height = sHeight;
			var ctx = canvas.getContext('2d');
			// 绘制图片填充白色背景
			ctx.fillStyle = "#fff";
			ctx.fillRect(0, 0, sWidth, sHeight);
			// 绘制裁剪图片
			ctx.drawImage(sourceCanvas, canvasOffsetX, canvasOffsetY, canvasCutWidth, canvasCutHeight, pX, pY, sWidth, sHeight);
			// 裁剪图片的base64编码
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
			
			// canvas裁切圖片
			var dataURL = imageProc.drawCanvasImage(croppedCanvas, 0, 0, croppedCanvas.width, croppedCanvas.height, pX, pY, sWidth, sHeight);
			// 裁切完成后，把裁切圖的Base64編碼設置到file對象中
			imageProc.file.imgData = dataURL;
			// 裁切完成后，重新設置file對象中的圖片size
			imageProc.file.size = imageProc.getImageSize(dataURL);
			
			$('#' + imageProc.file.id).find('.imgWrap img').attr('src', dataURL);
		},
		
		/**
		 * 计算Base64编码图片的size
		 */
		getImageSize: function (dataURL) {
			// 首先把头部的data:image/png;base64,去掉。
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
		 * 销毁cropper实例
		 */
		destroy: function () {
			imageProc.image.cropper('destroy');
		}
	}
	
	/**
	 * 封装生成图片预览 缩略图 计算图片尺寸
	 */
	var image = {
		liWidth: 223,
		/**
		 * 缩略图
		 */
		thumb: function () {
			$('#uploaded_list').find('img').each(function () {
				var size = image.getThumbSize($(this));
				$(this).width(size.width).height(size.height);
			});
		},
		/**
		 * 计算图片的缩略尺寸
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
		 * 预览
		 */
		preview: function () {
			var thumbWidth = parseInt($('.filelist').find('li').width());
			$('.filelist').find('img').each(function () {
				$(this).width(thumbWidth).height(thumbWidth);
			});
		}
	};


// 模态框中的还原,旋转,放大,缩小等时间按钮
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
	
	
});

