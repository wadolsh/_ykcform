/**
 * choish
 */
(function(){

	var Input = Bridge.Input = function(config) {
		this.config = config || {};
		if (config.isView) {
			this.isView = config.isView;
		}
		this.name = config.name;
		this.uiMap = config.uiMap || this.uiMap || {};
		this.type = config.type || this.type || this.uiMap._type || 'text';
		this.size = config.size || this.size || this.uiMap.size || 1024;
		this.typeName = config.typeName || this.typeName || this.uiMap.typeName ||  'String';
		this.isUpdateAble = true;
		
		this.parent = config.parent;
		
		//this.label = this.uiMap._label || this.name;
		this.label = config.label || this.label || this.name;
		
		this.validateRule = extend({size : this.size, isNullAble : this.isNullAble || true, typeName : this.typeName}, config.validateRule) || {};
		this.validateTool = config.validateTool;
		this.dataConvertTool = config.dataConvertTool;
		
		this.render$input();
	};
	
	extend(Bridge.Input.prototype, {

		render : function() {
			// this.$inputArea
			// this.$input
			log("InputタグのUI作成ロジックがありません。Bridge.Input.prototype.renderをoverwriteしてください。");
			return this;
		},
		
		render$input : function() {
			var uiMap = this.uiMap;
			var type = this.type;
			if (type == 'select') {
				this.$input = $('<select />').val(type);
				
				if (uiMap._options) {
					var option = null;
					for (var ind in uiMap._options) {
						option = uiMap._options[ind];
						$('<option />').text(option.label ? option.label : option).val(option.value ? option.value : option).appendTo(this.$input);
					}
				}
			} else if (type == 'radio' && uiMap._options) {
				this.$input = $("<div />");
				var option = null;
				for (var ind in uiMap._options) {
					option = uiMap._options[ind];
					$('<input type="radio" />').val(option.value ? option.value : option).appendTo(this.$input);
					// $('<label />').html(option.label ? option.label :
					// option).appendTo(this.$input);
				}
				this.$input = this.$input.children();
			} else if (type == 'textarea') {
				this.$input = $('<textarea />').val(this.value).attr('maxlength', this.size);
			} else if (typeof type == "object") {
				// 他のviewを実装する。
				this.isView = true;
				this.$input = $('<div />');
				
				if (type && type.render) {
					// bridge objectの場合
					type.$area = this.$input;
					type.render();
				} else if (type instanceof jQuery) {
					// jquery objectの場合
					this.$input.append(this.type);
				} else if (type.tag) {
					this.$input = $(type.tag);
				}
				
			} else if (type.charAt(0) == "$") {
				this.$input = this.parent[type];
				// return;
			} else if (type == "blank") {
				this.$input = $();
				return;
			} else {
				this.$input = $('<input />').val(this.value).attr('type', type).attr('maxlength', this.size);
			}
			
			this.$input.attr('name', this.name).addClass(uiMap._class);
			
			for (var name in uiMap) {
				if (name.charAt(0) != '_') {
					this.$input.attr(name, uiMap[name]);
				}
			}
			
			if (uiMap.disabled == "disabled") {
				this.isUpdateAble = false;
			}
			
			if (uiMap._widget) {
				this.widget(uiMap._widget);
			}
		},
		
		widget : function(config) {
			for (var name in config) {
				this.$input[name](config[name]);
			}
		},
		
		
		val : function(value) {
			
			if (this.isView) {
				// viewの場合
				return this.type.val(value);
			}
			
			if (value || value == 0 || value == "") {
				// デーアを画面に設定
				if (this.type == "checkbox") {
					var checked = value == true ? true : value == false ? false : this.$input.val() == value;
					this.$input.attr("checked", checked);
					return;
				} else if (this.type == "radio") {
					this.$input.closest('[value="' + value + '"]').attr("checked", "checked");
					return;
				}

				if (this.dataConvertTool && this.dataConvertTool.parser) {
					// データを変換して設定
					value = this.dataConvertTool.parser.call(this, value)
				}
				this.$input.val(value);
				return this;
			}

			// データを取得
			if (this.type == "checkbox") {
				if (this.$input.prop('checked')) {
					return this.$input.val() ? this.$input.val() : true;
				} else {
					return this.$input.val() ? "" : false;
				}
			} else if (this.type == "radio") {
				return this.$input.closest(':checked').val();
			}
			
			var val = this.$input.val();
			if (val == "true") {
				return true;
			} else if (val == "false") {
				return false;
			} else if (val == "") {
				return null;
			}
			
			if (this.dataConvertTool && this.dataConvertTool.unparser) {
				// データを変換して取得
				val = this.dataConvertTool.unparser.call(this, val);
			}
			return val;
		},
		
		validate : function() {
			
			if (this.isView) {
				// viewの場合
				return this.type.validate();
			}
			
			if (!this.validateTool || !this.validateRule) {
				return true;
			}
			
			this.clearError();
			
			var messages = new Array();
			var massage = null;
			//var result
			for (var ruleName in this.validateRule) {
				message = this.validateTool[ruleName].call(this, {label : this.label}, this.val(), this.validateRule[ruleName]);
				if (message) {
					messages.push(message);
				}
			}
			
			if (messages.length != 0) {
				this.renderMessage(messages.join('<br/>'));
				return false;
			}
			return true;
		},
		
		clearError : function() {
			log("バリデーションメッセージのクリア処理が実装されていません。");
		},
		
		renderMessage : function () {
			// this.$message
			log("バリデーションメッセージ表示が実装されていません。");
		},
		
		remove : function() {
			this.$inputArea.remove();
		}
		
	});
	
	

	var ViewBase = {
		veiwBaseInit : function(config) {
			this.$area = config.$area;
			this.isRequestMetaData = config.isRequestMetaData || true;
			
			// jsで定義するfieldMap（最優先になるデータ）
			var baseFieldMap = this.fieldMap;
			
			if (this.isRequestMetaData) {
				this.fieldMap = extendObj(this.findFieldMap(config.fieldMapKey || config.dataName || Bridge.dataName || this.connector.dataName), baseFieldMap, config.fieldMap);
			} else {
				this.fieldMap = extendObj(baseFieldMap, config.fieldMap);
			}
		},
		
		findFieldMap : function(dataName, fields) {
			var view = this;
			if (!dataName) {
				log("テーブル名情報がありません");
				return;
			}
			
			var fieldMap = null;
			if (!Bridge.fieldMapCache[dataName]) {
				var key = this.nameKey + dataName;
				this.connector.reset().reqMetaData(key).request(function(data) {
					// fieldMap = _.clone(data[key]);
					fieldMap = Bridge.fieldMapCache[dataName] = data[key];
					Bridge.dataTypeConvert(fieldMap, view.dataTypeMap);

					var field = null;
					for (var name in fieldMap) {
						var field = fieldMap[name];
						field.label = field.label || name;
						field.validateRule = {
								size : field.size,
								isNullAble : field.isNullAble,
								typeName : field.typeName};
					};
				});
				

			} else {
				fieldMap = _.clone(Bridge.fieldMapCache[dataName]);
			}
			


			return fieldMap;
		},
		
		/**
		 * デザインをクリア
		 */
		clearRender : function() {
			this.$area.detach();
			//this.$area.empty();
		},
		
		hide : function() {
			this.$area.hide();
		},
		
		show : function() {
			this.$area.show();
		}
	};
	
	var EditorBase = {
		
		editorBaseInit : function(config) {
			this.validateTool = extend(clone(Bridge.validateTool), config.validateTool);
			
			// Inputを格納
			this.inputMap = {};
			
			// 画面から入力したバリデーションを通した値
			this.inputValueMap = {};
			
			// 伝送でもらったデータ（初期値復元用）
			this.dataMap = {};
			this.validateResult = true;
		},
		
		renderFieldAppend : function($area) {
			for (var key in this.fieldMap) {
				var field = this.fieldMap[key];
				var Input = this.Input;
				if (field.uiMap && jQuery.isFunction(field.uiMap._type)) {
					Input = field.uiMap._type;
				}
				var input = new Input({
								name : field.name || key,
								typeName : field.typeName,
								size : field.size,
								uiMap : field.uiMap,
								validateRule : field.validateRule,
								parent : this,
								isView : field.isView,
								label : field.label,
								validateTool : this.validateTool,
								dataConvertTool : field.dataConvertTool
							});
				
				this.inputMap[input.name] = input;
				$area.append(input.render().$inputArea);
				
			}
		},
		
		validate : function() {
			this.validateResult = true;
			this.inputValueMap = {};
			var input = null;
			for (var name in this.inputMap) {
				input = this.inputMap[name];
				if (!input.isUpdateAble) {
					continue;
				}
				this.validateResult = this.inputMap[name].validate() && this.validateResult ? true : false;
				this.inputValueMap[name] = input.val();
			}
			return this.validateResult;
		},
		
		val : function(value) {
			
			if (value) {
				
				this.dataBind(value);
				return this;
			}
			
			return this.inputValueMap;
		}
	};
	
	/**
	 * ほぼダミー
	 */
	var PanelView = Bridge.PanelView = function(config) {
		this.$area = config.$area;
		this.init();
	}
	
	extend(Bridge.PanelView.prototype, {
		init : function() {
		},
		
		render : function() {
		}
	});
	
	
	/**
	 * 入力フォーム
	 */
	var EditorView = Bridge.EditorView = function(config) {
		
		this.nameKey = config.nameKey || this.nameKey || "EditorView";
		this.connector = config.connector || this.connector || Bridge.connector;
		
		// fieldタイプのjs側変換ルール
		this.dataTypeMap = config.dataTypeMap || this.dataTypeMap || Bridge.dataTypeMap[Bridge.dataType];
		
		this.veiwBaseInit(config);
		
		this.Input = config.Input || this.Input || Bridge.Input;

		this.editorBaseInit(config);
		
		this.init();
	};
	
	extend(Bridge.EditorView.prototype, ViewBase, EditorBase, {
		init : function() {
			//var view = this;
			Bridge.buttonCreate(this, '登録', 'submit');
			Bridge.buttonCreate(this, '初期化', 'reset');
			Bridge.buttonCreate(this, 'クリア', 'clear');
			Bridge.buttonCreate(this, '削除', 'del');
			Bridge.buttonCreate(this, '新規登録', 'newInput');

			Bridge.buttonCreate(this, 'メニューへ', 'moveToMenu');
		},
		
		render : function() {

			this.renderFieldAppend(this.$area);
		},
		
		sort : function() {
			
		},
		
		dataBind : function (dataMap) {
			this.dataMap = dataMap;
			if (!dataMap) {
				return;
			}
			for (var name in this.inputMap) {
				this.inputMap[name].val(dataMap[name]);
			}
		},
		
		reset : function() {
			this.dataBind(this.dataMap);
		},
		
		clear : function() {
			for (var name in this.inputMap) {
				if (this.inputMap[name].$input.attr('type') != 'hidden'
					&& this.inputMap[name].$input.attr('disabled') != 'disabled'
					&& this.inputMap[name].$input.attr('readonly') != 'readonly') {

					this.inputMap[name].$input.val("");
				}
			}
		},
		
		newInput : function() {
			for (var name in this.inputMap) {
				this.inputMap[name].$input.val("");
			}
		},
		
		reqData : function(id) {
			if (!id) {
				return;
			}
			var view = this;
			this.connector.reset().reqData("EditorViewReqData", id).request(function(data, textStatus, jqXHR) {
				var data = data['EditorViewReqData'];
				if (!data) {
					Bridge.msg("データが存在しません。");
					return;
				}
				view.dataBind(data);
			});
			return this;
		},
		
		del : function() {
			var view = this;
			var id = this.dataMap[this.connector.idName];
			this.connector.reset().reqDelete("EditorViewDel", id).request(function(data, textStatus, jqXHR) {
				view.dataBind(data['EditorViewDel']);
			});
			return this;
		},
		
		submit : function() {
			//var view = this;
			if (this.validate()) {
				var id = this.inputValueMap[this.connector.idName];
				if (id) {
					// 更新モード
					this.reqUpdate(id);
				} else {
					// 新規登録
					this.reqInsert();
				}
			}
		},
		
		reqUpdate : function(id) {
			var view = this;
			this.connector.reqUpdate("EditorViewUpdate", id, {parm : this.inputValueMap}).request(function(data, textStatus, jqXHR) {
				if (data.messageKey) {
					Bridge.msg(data.messageKey);
					return;
				}
				view.dataBind(data['EditorViewUpdate']);
			});
		},
		
		reqInsert : function() {
			var view = this;
			this.connector.reqInsert("EditorViewInsrt", {parm : this.inputValueMap}).request(function(data, textStatus, jqXHR) {
				if (data.messageKey) {
					Bridge.msg(data.messageKey);
					return;
				}
				if (view.reloadAfterInsert) {
					view.reloadAfterInsert(data.EditorViewInsrt[view.connector.idName]);
					return;
				}
				view.dataBind(data.EditorViewInsrt);
			});
		}
	});

	
	
	
	var Tag = Bridge.Tag = function(config) {
		this.config = config || {};
		if (config.isView) {
			this.isView = config.isView;
		}
		this.name = config.name;
		this.uiMap = config.uiMap || this.uiMap || {};
		this.typeName = config.typeName || this.typeName || this.uiMap.typeName ||  'String';
		
		this.parent = config.parent;
		//this.label = this.uiMap._label || this.name;
		this.label = config.label || this.label || this.name;
		
		this.dataConvertTool = config.dataConvertTool;
		
		this.render$tag();
	};
	
	extend(Bridge.Tag.prototype, {

		render$tag : function() {
			var uiMap = this.uiMap;
			
			// 他のviewを実装する。
			this.$tagArea = this.$tag = Bridge.createTag(this, uiMap._tag || {});
			
			if (uiMap._widget) {
				this.widget(uiMap._widget);
			}
		},

		render : function($wrap) {
			
			this.$tagArea = $wrap.append(this.$tagArea);
			if (!this.$tag || !this.$tag[0]) {
				this.$tag = this.$tagArea;
			}
			return this;
		},
		
		val : function (value) {
			
			if (value || value == 0 || value == "") {
				if (this.dataConvertTool && this.dataConvertTool.parser) {
					// データを変換して設定
					value = this.dataConvertTool.parser.call(this, value);
				}
				
				if (this.$tag.get(0).tagName == "input") {
					this.$tag.val(value);
					return this;
				} else {
					this.$tag.html(value);
					return this;
				}
			}

			// データを変換して取得
			if (this.$tag.get(0).tagName == "input") {
				value = this.$tag.val();
			} else {
				value = this.$tag.html();
			}
			
			if (this.dataConvertTool && this.dataConvertTool.unparser) {
				return this.dataConvertTool.unparser.call(this, value);
			} else {
				return value;
			}
		}
	});
	
	/**
	 * 入力フォーム
	 */
	var GridLineView = Bridge.GridLineView = function(config) {
		
		this.nameKey = config.nameKey || this.nameKey || "GridLineView";
		this.connector = config.connector || this.connector || Bridge.connector;
		this.Tag = config.Tag || this.Tag || Bridge.Tag;
		
		this.veiwBaseInit(config);
		
		this.tagMap = {};
		this.dataMap = {};
		
		this.init();
	};
	
	extend(Bridge.GridLineView.prototype, ViewBase, {

		init : function() {
			
		},
		
		render : function() {
			
			if (this.$lineArea) {
				// 既存テーブルとラインobjectを初期化
				this.$lineArea.detach();
				this.tagMap.length = 0;
			}
			
			this.$lineArea = $('<tr/>').appendTo(this.$area);
			this.renderFieldAppend(this.$lineArea, "<td/>");
			
			return this;
		},
		
		renderFieldAppend : function($area, columnTag) {
			
			for (var key in this.fieldMap) {
				var field = this.fieldMap[key];
				if (!field.label) {
					continue;
				}
				var column = new this.Tag({
								name : field.name || key,
								typeName : field.typeName,
								uiMap : field.uiMap,
								parent : this,
								isView : field.isView,
								label : field.label,
								dataConvertTool : field.dataConvertTool
							});
				
				this.tagMap[column.name] = column;
				$area.append(column.render($(columnTag)).$tagArea);
			}
		},

		dataBind : function (dataMap) {
			this.dataMap = dataMap;
			for (var name in this.tagMap) {
				this.tagMap[name].val(dataMap[name]);
			}
		},
		
		reqData : function(id) {
			if (!id) {
				return;
			}
			var view = this;
			this.connector.reset().reqData("GridLineViewReqData", id).request(function(data, textStatus, jqXHR) {
				view.dataBind(data['GridLineViewReqData']);
			});
			return this;
		},
		
		del : function() {
			var view = this;
			var id = this.dataMap[this.connector.idName];
			this.connector.reset().reqDelete("GridLineViewDel", id).request(function(data, textStatus, jqXHR) {
				view.dataBind(data['GridLineViewDel']);
			});
			return this;
		}
	});
	
	
	/**
	 * 入力フォーム
	 */
	var GridView = Bridge.GridView = function(config) {
		this.pagination = config.Pagination || false;
		this.nameKey = config.nameKey || this.nameKey || "GridView";
		this.dataName = config.dataName || this.dataName;
		
		this.connector = config.connector || this.connector || Bridge.connector;
		
		this.veiwBaseInit(config);
		
		this.lineView = config.lineView || this.lineView || Bridge.GridLineView;

		
		// Inputを格納
		this.lineObjList = new Array();
		this.dataList = new Array();
		
		// 検索条件
		this.search = config.search || this.search || {limit : 10};
		
		this.init();
	};
	
	extend(Bridge.GridView.prototype, ViewBase, {
		
		init : function() {
			//var view = this;
			Bridge.buttonCreate(this, 'ライン追加', 'addNewLine');
			Bridge.buttonCreate(this, '新規追加', 'addNew');
			Bridge.buttonCreate(this, 'メニューへ', 'moveToMenu');
		},
		
		addNewLine : function(data) {
			var view = this;
			var lineViewObj = new this.lineView({$area : this.$tbody, connector : this.connector, dataName : this.dataName}).render();
			this.lineObjList.push(lineViewObj);
			var length = this.lineObjList.length;
			
			lineViewObj.remove = function() {
				var lineNum = length - 1;
				lineViewObj.$formArea.remove();
				delete view.lineObjList[lineNum];
			}
			
			if (data) {
				lineViewObj.dataBind(data);
			}
			
			return lineViewObj;
		},
		
		renderHeader : function() {
			//var $area = this.$area;
			var fieldMap = this.fieldMap;
			
			this.$tableArea = $('<table/>');
			this.$thead = $('<thead/>');
			var $tr = $('<tr/>');
			var label = null;
			for (var name in fieldMap) {
				label = fieldMap[name].label;
				if (label) {
					$tr.append('<th>' + label.replace('/^_$/', '') + '</th>');
				}
			}

			this.$thead.append($tr);
			this.$tableArea.append(this.$thead);
			this.$area.append(this.$tableArea);
		},
		
		render : function() {
			//var view = this;
			
			if (this.$tableArea) {
				// 既存テーブルとラインobjectを初期化
				this.$tableArea.detach();
				this.lineObjList.length = 0;
			}

			this.renderHeader();
			this.$tbody = $('<tbody/>');
			
			//var $area = this.$area;
			//var lineViewObj = null;
			
			for (var line in this.dataList) {
				this.addNewLine(this.dataList[line]);
			}
			
			// this.addNewLine();
			
			this.$tableArea.append(this.$tbody);
			this.renderFooter();
			return this;
		},

		renderFooter : function() {
			this.$tfoot = $('<tfoot><tr><td colspan="' +  Object.keys(this.fieldMap).length + '"></td></tr></tfoot>');
			this.$tableArea.append(this.$tfoot);
			this.$tfoot = this.$tfoot.find('td');
		},

		val : function(valueList) {
			if (valueList) {
				this.dataList = valueList;
				this.render();
				return;
			}
			return this.dataList;
		},
		
		validate : function() {
			this.validateResult = true;
			
			var lineObj = null;
			this.dataList.length = 0;
			for (var line in this.lineObjList) {
				lineObj = this.lineObjList[line];
				this.validateResult = lineObj.validate() && this.validateResult ? true : false;
				this.dataList.push(lineObj.val());
			}
			
			return this.validateResult;
		},
		
		dataBind : function (data) {
			this.dataList = data;
			for (var name in this.lineObjList) {
				this.lineObjList[name].val(dataMap[name]);
			}
		},
		
		reqData : function(id) {
			if (!id) {
				return;
			}
			var view = this;
			this.connector.reset().reqData("GridViewReqData", id).request(function(data, textStatus, jqXHR) {
				view.dataBind(data['GridViewReqData']);
			});
			return this;
		},
		
		reqList : function(query) {
			query.fields = query.fields || this.search.fields || null;

			var view = this;
			this.connector.reset().reqList("GridViewReqList", query).request(function(data, textStatus, jqXHR) {
				view.dataList = data['GridViewReqList'];
				view.render();
			});
			return this;
		},
		
		setFilter : function (fields, where, orderBy) {
			if (fields) {
				for (var name in this.fieldMap) {
					if (!fields[name]) {
						delete this.fieldMap[name];
					}
				}
			}
			this.search.fields = fields;
			this.search.where = where;
			this.search.orderBy = orderBy;
			return this;
		},
		
		pageData : {
			dispPageMaxSize : 7,
			firstPage : 1,
		},
		
		renderPagination : function(page) {
			return this;
		},
		
		/**
		 * 
		 */
		resetPageData : function(page) {
			var pageData = this.pageData;
			pageData.totalPages = Math.ceil(this.search.countAll / this.search.limit);
			
			// 画面表示開始ページ計算
	        if (pageData.totalPages < pageData.dispPageMaxSize) {
	            // デフォールト設定値
	        	pageData.dispFirstPage = pageData.firstPage;
	        } else {
	        	pageData.dispFirstPage = page
	                    - (Math.floor(pageData.dispPageMaxSize / 2));
	        	pageData.dispFirstPage = pageData.dispFirstPage < 1 ? pageData.firstPage : pageData.dispFirstPage;
	        }

	        // 画面表示終了ページ計算
	    	var displayPageRange = pageData.totalPages - pageData.dispFirstPage;
	        if (displayPageRange < pageData.dispPageMaxSize) {
	        	pageData.dispLastPage = pageData.totalPages;
	        	if (pageData.totalPages > pageData.dispPageMaxSize) {
	        		pageData.dispFirstPage = pageData.dispLastPage - pageData.dispPageMaxSize + pageData.firstPage;
	        	}
	        } else {
	        	pageData.dispLastPage = pageData.dispFirstPage + pageData.dispPageMaxSize - 1;
	        }
		},
		
		movePage : function(page) {
			var view = this;
			this.pageData.page = page;
			this.connector.reset().reqMovePage(
					"GridViewMovePage", 
					{limit : (page - 1) * this.search.limit + ", " + this.search.limit,
					 fields : this.search.fields,
					 where : this.search.where,
					 orderBy : this.search.orderBy}).request(function(data, textStatus, jqXHR) {
				
				if (data.message) {
					Bridge.msg(data.message);
				}
				view.dataList = data['GridViewMovePage'];
				view.search.countAll = data['GridViewMovePageCountAll'];
				view.resetPageData(page);
				view.renderPagination(page);
				view.render();
			});

			return this;
		}
	});
	
	var LoginView = Bridge.LoginView = function(config) {
		
		this.nameKey = config.nameKey || this.nameKey || "LoginView";
		this.connector = config.connector || this.connector || Bridge.connector;

		this.Input = config.Input || this.Input || Bridge.Input;
		
		this.veiwBaseInit(config);
		this.editorBaseInit(config);
		this.init();
	};
	
	
	extend(Bridge.LoginView.prototype, ViewBase, EditorBase, {
		
		init : function() {
			//var view = this;
			this.$messageArea = $('<div/>').appendTo(this.$area);
			Bridge.buttonCreate(this, 'ログイン', 'login');
			Bridge.buttonCreate(this, 'ログアウト', 'logout');
			Bridge.buttonCreate(this, '新規登録', 'signUp');
			Bridge.buttonCreate(this, '登録', 'regist');
			Bridge.buttonCreate(this, 'ログイン画面へ', 'moveLogin');
		},
		
		render : function() {
			this.inputMap = {};
		},
		
		login : function() {
			this.$messageArea.html('');
			var view = this;
			if (this.validate()) {
				this.connector.reset().reqExecMethod("LoginViewLogin", 'login', {parm : this.inputValueMap}).request(function(data, textStatus, jqXHR) {
					if (data.LoginViewLogin.messageKey) {
						view.loginFail(data.LoginViewLogin);
						return;
					}
					view.afterLogin(data.LoginViewLogin);
				});
			};
		},
		
		afterLogin : function(data) {
			log("afterLogin");
			this.$messageArea.empty();
		},
		
		loginFail : function(data) {
			log("loginFail");
			var msg = null;
			if (data.messageKey == "loginFail") {
				msg = "ログイン情報不一致";
			} else if (data.messageKey == "notValidEmail") {
				msg = "メールアドレスが確認されていません。";
			}
			this.$messageArea.append(msg);
		},
		
		logout : function() {
			log("logout");
		},
		
		regist : function() {
			this.$messageArea.html('');
			var view = this;
			if (this.validate()) {
				this.connector.reset().reqExecMethod("LoginViewRegist", 'regist', {parm : this.inputValueMap}).request(function(data, textStatus, jqXHR) {
					if (data.LoginViewRegist.messageKey == "registSuccess") {
						view.afterRegist(data.LoginViewRegist);
						return;
					}
					view.registFail(data.LoginViewRegist);
				});
			};
		},
		
		afterRegist : function(data) {
			log("beforeRegist");
			this.$messageArea.html("メールアドレス確認のためにメールを送信しました。<br/>登録完了のため、メールの確認を行ってください。");
			this.$formArea.detach();
			this.$area.append(this.$moveLoginButton);
		},
		
		registFail : function(data) {
			if (data.messageKey == "loginIdExist") {
				this.$messageArea.append("既に登録されているＩＤです。");
				return;
			}
			log("registFail");
		},
		
		signUp : function() {
			this.fieldMap = this.findFieldMap('signUpMeta');
			this.render();
			this.$loginButton.detach();
			this.$signUpButton.detach();
			this.$buttonArea.append(this.$registButton).append(this.$moveLoginButton);
		},
		
		moveLogin : function() {
			this.fieldMap = this.findFieldMap(this.connector.dataName);
			this.render();
			this.$registButton.detach();
			this.$moveLoginButton.detach();
			this.$buttonArea.append(this.$loginButton).append(this.$signUpButton);
		}
	});
	
	// Set up inheritance for the model, collection, router, view and history.
	LoginView.extend = GridView.extend = GridLineView.extend = EditorView.extend = Input.extend = PanelView.extend =extendObject;
}).call(this);