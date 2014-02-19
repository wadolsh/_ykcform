Bridge.dataType = "mongodb";

/*
Bridge.dataTypeConvert = function(fieldMap, dataTypeMap) {
	Bridge.msg('1');
};
*/

Bridge.extend(Bridge.Input.prototype, {
	render : function (){
		var target = this;
		if (this.isView) {
			this.$inputArea = this.$input.addClass('control-group');
			
			if (this.label == "_") {
				//this.type.$area = this.$input = this.$inputArea;
			} else {
				this.$input.addClass('controls');
				this.$inputArea.append('<label class="control-label" for="' + this.name + '">' + this.label + '</label>')
								.append(this.$input);
				
				//this.type.$area = this.$input;
			}
			
			this.$input.attr('id', this.name);
			return this;
		}
		
		this.$input.attr('id', this.name);    //.attr('placeholder', '入力例：');
		
		if (this.type == "hidden") {
			this.validateRule = null;
			// hiddenは画面表示しない。
			this.$inputArea = this.$input;
			return this;
		}
		
		this.$inputArea = $('<div/>').addClass('control-group')
							.append('<label class="control-label" for="' + this.name + '">' + this.label + '</label>')
							.append(this.$input.wrap('<div class="controls"/>').parent());
		
		if (this.type == "radio") {
			this.$inputArea.find(':input').each(function(ind, input) {
				$(input).after(target.uiMap._options[ind].label ? target.uiMap._options[ind].label : target.uiMap._options[ind]);
			});
		}
		
		return this;
	},
	
	clearError : function() {
		this.$inputArea.removeClass('error').find('.help-inline').remove();
	},
	
	renderMessage : function(message) {
		this.$inputArea.addClass('error');
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
		
		this.$buttonArea = $('<div/>').addClass('controls').wrap('<div class="control-group"/>').appendTo(this.$formArea);
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
	
	render : function() {
		this.gridViewRender();
		
		// bootstrap用の追加デザイン
		this.$tableArea.addClass('table table-bordered');
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
		this.$inputArea.parent().removeClass('control-group error')
		this.$inputArea.next('.help-inline').remove();
	},
	
	renderMessage : function(message) {
		this.$inputArea.parent().addClass('control-group error');
		$('<span class="help-inline" />').html(message).insertAfter(this.$input);
	}
});



var InlineEditor = Bridge.EditorView.extend({
	nameKey : "InlineEditor",
	Input : InlineEditerInput,
	
	render : function() {
		//this.$formArea = $('<form />').addClass('form-inline').appendTo(this.$area);
		this.$formArea = $('<tr/>').appendTo(this.$area);
		//this.$formArea.append($tr);
		
		this.renderFieldAppend(this.$formArea);
		this.$formArea.append(this.$delButton);
		//this.$formArea.find('input:not(:type=hidden)').wrap('<td/>')
		
		var fieldMap = this.fieldMap;
		var label = null;
		for (var name in fieldMap) {
			label = fieldMap[name].uiMap._label;
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
		var target = this;

		this.$inputArea = $('<div/>').addClass('control-group');
		
		if (this.label == "_") {
			//this.type.$area = this.$input = this.$inputArea;
		} else {
			this.$input.addClass('controls');
			this.$inputArea.append('<label class="control-label" for="' + this.name + '">' + this.label + '</label>')
							.append(this.$inputSet);
		}
		
		return this;
	},
	
	
	render$input : function() {
		var view = this;
		var $input = $('<input type="file" id="' + this.name + '" name="' + this.name + '" style="display:none"/>').change(function() {
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


