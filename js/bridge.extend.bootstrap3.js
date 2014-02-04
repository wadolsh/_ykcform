Bridge.dataType = "mysql";

/*
Bridge.dataTypeConvert = function(fieldMap, dataTypeMap) {
	Bridge.msg('1');
};
*/

var oButtonCreate = Bridge.buttonCreate;
Bridge.buttonCreate = function(view, label, method) {
	oButtonCreate(view, label, method).addClass('btn btn-default btn-mini');
};


Bridge.extend(Bridge.Input.prototype, {
	render : function (){
		var target = this;
		if (this.isView) {
			this.$inputArea = this.$input.addClass('form-group');
			
			if (this.label == "_") {
				//this.type.$area = this.$input = this.$inputArea;
			} else {
				this.$input.addClass('col-lg-4');
				this.$inputArea.append('<label class="control-label col-lg-3" for="' + this.name + '">' + this.label + '</label>')
								.append(this.$input);
				
				//this.type.$area = this.$input;
			}
			
			this.$input.attr('id', this.name);
			return this;
		}
		
		this.$input.attr('id', this.name).addClass('form-control');    //.attr('placeholder', '入力例：');
		
		if (this.type == "hidden") {
			this.validateRule = null;
			// hiddenは画面表示しない。
			this.$inputArea = this.$input;
			return this;
		}
		
		this.$inputArea = $('<div/>').addClass('form-group')
							.append('<label class="control-label col-lg-3" for="' + this.name + '">' + this.label + '</label>')
							.append(this.$input.wrap('<div class="col-lg-4"/>').parent());
		
		if (this.type == "radio") {
			this.$inputArea.find(':input').each(function(ind, input) {
				$(input).after(target.uiMap._options[ind].label ? target.uiMap._options[ind].label : target.uiMap._options[ind]);
			});
		}
		
		return this;
	},
	
	clearError : function() {
		this.$inputArea.removeClass('has-error').find('.help-inline').remove();
	},
	
	renderMessage : function(message) {
		this.$inputArea.addClass('has-error');
		$('<span class="help-inline" />').html(message).insertAfter(this.$input);
	}
});

Bridge.extend(Bridge.EditorView.prototype, {

	render : function() {
		
		var $formArea = $('<form />').addClass('form-horizontal').appendTo(this.$area);
		this.renderFieldAppend($formArea);
		$formArea.append(this.$submitButton)
				 .append(this.$resetButton)
				 .append(this.$clearButton)
				 .append(this.$delButton)
				 .append(this.$newInputButton)
				 .append(this.$moveToMenuButton);
		return this;
	}
});


Bridge.extend(Bridge.LoginView.prototype, {

	render : function() {
		this.$messageArea.addClass('alert alert-block');
		if (this.$formArea) {
			this.inputMap = {};
			this.$formArea.detach();
		}
		this.$formArea = $('<form />').addClass('form-horizontal').appendTo(this.$area);
		this.renderFieldAppend(this.$formArea);
		
		this.$buttonArea = $('<div/>').addClass('col-lg-4').wrap('<div class="form-group"/>').appendTo(this.$formArea);
		this.$buttonArea.append(this.$loginButton).append(this.$signUpButton);
		return this;
	}
});


Bridge.extend(Bridge.Tag.prototype, {
	/*
	tagRender : Bridge.Tag.prototype.render,

	render : function($wrap) {
		this.tagRender($wrap);
		return this;
	}
	*/
});

/*
Bridge.extend(Bridge.GridLineView.prototype, {
	gridLineViewRender : Bridge.GridLineView.prototype.render,
	gridLineViewRenderFooter : Bridge.GridLineView.prototype.renderFooter,
	
	render : function() {
		this.gridLineViewRender();
		
		// bootstrap用の追加デザイン
		return this;
	},
	
	renderFooter : function() {
		this.gridLineViewRenderFooter();
	},
});
*/

Bridge.extend(Bridge.GridView.prototype, {
	gridViewRender : Bridge.GridView.prototype.render,
	gridViewRenderPagination : Bridge.GridView.prototype.renderPagination,
	
	render : function() {
		this.gridViewRender();
		
		// bootstrap用の追加デザイン
		this.$tableArea.addClass('table table-bordered');
		return this;
	},
	

	renderPagination : function(page) {
		var view = this;
		
		if (this.$pagination) {
			this.$pagination.detach();
		}
		
		
		//if (!this.$pagination) {
		var $paginationUl = $('<ul/>').addClass('pagination').append($('<li class="" />').append($('<a href="#">' + ((page - 1) * this.search.limit + 1) + ' ~ ' + Math.min(page * this.search.limit, this.search.countAll) + ' / ' + this.search.countAll +  '</a>')));
		this.$pagination = $('<div id="pagination"/>').append($paginationUl);
		//}
		
		var pageData = this.pageData;

		$paginationUl.append($('<li/>').addClass(pageData.dispFirstPage == pageData.firstPage ? 'active' : '').append($('<a href="#">&laquo; ' + pageData.firstPage + '...</a>').click(function() {
			view.movePage(pageData.firstPage);
		})));
		for (var i = pageData.dispFirstPage; i <= pageData.dispLastPage; i++) {
			$paginationUl.append($('<li/>').addClass(page == i ? 'active' : '').append($('<a href="#">' + i + '</a>').click(function() {
				view.movePage(this.innerText);
			})));
		}
		$paginationUl.append($('<li/>').addClass(pageData.dispLastPage == pageData.totalPages ? 'active' : '').append($('<a href="#" class="">...' + pageData.totalPages + ' &raquo;</a>').click(function() {
			view.movePage(pageData.totalPages);
		})));
		
		//this.$tfoot.append(this.$pagination);
		return this;
	},
});


var SearchPagerGridView = Bridge.GridView.extend({
	gridViewAddNewLine : Bridge.GridView.prototype.addNewLine,
	gridViewRenderExtend : Bridge.GridView.prototype.render,
	
	addNewLine : function(data) {
		var view = this;
		var obj = this.gridViewAddNewLine(data);
		Bridge.buttonCreate(obj, '編集', 'editCall');
		obj.$lineArea.append(obj.$editCallButton);
		obj.$editCallButton.wrap('<td/>');
		
		// ライン選択時に銀行を修正可能にする。
		obj.editCall = function() {
			view.editCall(data);
		};
	},
	
	editCall : function(data) {
		return this;
	},
	
	render : function() {
//		/var view = this;
		
		this.renderSearch();

		this.$area.append(this.$searchInput);
		this.gridViewRenderExtend();
		this.$area.append(this.$pagination);
		return this;
	},
	
	
	renderSearch : function() {
		return this;
	}
});



var InlineEditerInput = Bridge.Input.extend({
	render : function (){
		this.$input.attr('id', this.name);    //.attr('placeholder', '入力例：');
		
		if (this.type == "hidden") {
			this.validateRule = null;
			// hiddenは画面表示しない。
			this.$inputArea = this.$input;
			return this;
		}
		
		this.$inputArea = this.$input.addClass('input-small');
		
		return this;
	},
	
	clearError : function() {
		this.$inputArea.parent().removeClass('form-group error');
		this.$inputArea.next('.help-inline').remove();
	},
	
	renderMessage : function(message) {
		this.$inputArea.parent().addClass('form-group error');
		$('<span class="help-inline" />').html(message).insertAfter(this.$input);
	}
});



var InlineEditor = Bridge.EditorView.extend({
	nameKey : "InlineEditor",
	Input : InlineEditerInput,
	
	render : function() {
		//this.$formArea = $('<form />').addClass('form-inline').appendTo(this.$area);
		this.$lineArea = this.$formArea = $('<tr/>').appendTo(this.$area);
		//this.$formArea.append($tr);
		
		this.renderFieldAppend(this.$formArea);
		this.$formArea.append(this.$delButton);
		this.$delButton.wrap('<td/>');
		//this.$formArea.find('input:not(:type=hidden)').wrap('<td/>')
		
		var fieldMap = this.fieldMap;
		var label = null;
		for (var name in fieldMap) {
			label = fieldMap[name].label;
			if (label) {
				this.inputMap[name].$input.wrap('<td/>');
			}
		}

		//$formArea.append(this.$submitButton).append(this.$resetButton).append(this.$clearButton).append(this.$delButton);
		return this;
	},
	
	// $delButtonボタン押下時の機能
	del : function () {
		// 修正ラインからこの行のhtmlを削除
		this.remove();
	}
});



var GridViewWithEditorButton = Bridge.GridLineView.extend({
	nameKey : "GridViewWithEditorButton",

	init : function() {
		
	},
	
	render : function() {
		//this.$formArea = $('<form />').addClass('form-inline').appendTo(this.$area);
		this.$lineArea = this.$formArea = $('<tr/>').appendTo(this.$area);
		//this.$formArea.append($tr);
		
		this.renderFieldAppend(this.$formArea);
		this.$formArea.append(this.$delButton);
		this.$delButton.wrap('<td/>');
		//this.$formArea.find('input:not(:type=hidden)').wrap('<td/>')
		
		var fieldMap = this.fieldMap;
		var label = null;
		for (var name in fieldMap) {
			label = fieldMap[name].label;
			if (label) {
				this.inputMap[name].$input.wrap('<td/>');
			}
		}

		//$formArea.append(this.$submitButton).append(this.$resetButton).append(this.$clearButton).append(this.$delButton);
		return this;
	},
	
	// $delButtonボタン押下時の機能
	del : function () {
		// 修正ラインからこの行のhtmlを削除
		this.remove();
	}
});



var FileUploadInput = Bridge.Input.extend({
	
	render : function (){
		//var target = this;

		this.$inputArea = $('<div/>').addClass('form-group');
		
		if (this.label == "_") {
			//this.type.$area = this.$input = this.$inputArea;
		} else {
			this.$input.addClass('col-lg-4');
			this.$inputArea.append('<label class="control-label col-lg-3" for="' + this.name + '">' + this.label + '</label>')
							.append(this.$inputSet);
		}
		
		return this;
	},
	
	
	render$input : function() {
		var view = this;
		var $input = $('<input type="file" class="form-control" id="' + this.name + '" name="' + this.name + '" style="display:none"/>').change(function() {
			$text.val(this.value);
			view.fileInserted.call(this);
		});
		var $text = $('<input type="text" class="input-medium"/>');
		var $button = $('<input type="button" class="btn" value="ファイル選択">').click(function() {
			view.$input.click();
		});
		var $div = $('<div class="input-append"/>').append($text).append($button);
		this.$inputSet = $('<div/>').append($input).append($div).children();
		
		this.$input = $input;
		
	},
	
	fileInserted : function() {
		
	}
});


