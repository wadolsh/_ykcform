var _DateConvertUtil = function() {
};
_DateConvertUtil.prototype = {
	baseYear : null,
	eiKeyData : null,
	abbrEi : "",

	/**
	 * 和暦西暦変換用のデータををサーバから取得
	 */
	dataGet : function() {
		// span1-5 datepicker hasDatepicker
		var util = this;
		//$.ajaxSetup({async:false});

		$.ajax({
			//cache : false,
			async:false,
			url: full_path('/api/common/convertJpnDateData'),
			dataType: 'json',
			success : function(data, textStatus, jqXHR) {

				if (data.status != "success") {
					alert(data.status);
					return;
				}

				util.eiKeyData = {};
				util.baseYear = data.data.baseYear;
				var data = data.data.convData;
				for (key in data) {
					var ei = data[key].warekiAbbrEi;
					util.abbrEi += ei;
					data[key].seirekiStartYmd = new Date(data[key].seirekiStartYmd);
					data[key].seirekiEndYmd = new Date(data[key].seirekiEndYmd);
					util.eiKeyData[ei] = data[key];
				}
			}
		});

		//$.ajaxSetup({async:true});
	},

	getEiKeyData : function() {
		if (this.eiKeyData == null) {
			this.dataGet();
		}
		return this.eiKeyData;
	},

	/**
	 * 和暦の年表記を西暦に変換（H24　⇒　2012）
	 * @param Gyy
	 * @returns {Number}
	 */
	getEiToAdyy : function(Gyy) {
		return this.getEiKeyData()[Gyy.charAt(0)].seirekiStartYmd.getFullYear() + Number(Gyy.substring(1)) - 1;
	},

	/** Dateから和暦の年を取得 */
	getJpnYear : function(date) {
		var year, startYmd, endYmd;
		for (key in this.eiKeyData) {
			startYmd = this.eiKeyData[key].seirekiStartYmd;
			endYmd = this.eiKeyData[key].seirekiEndYmd;

			if (date.getTime() >= startYmd.getTime() && date.getTime() < endYmd.getTime()) {
				year = key + this.lpad((date.getFullYear() - startYmd.getFullYear() + 1));
				return year;
			}
		}
	},

	toDateType : function(oData) {
		// データ取得なしの場合変換用データを取得
		this.getEiKeyData();

		if (!oData) {
			return null;
		} else if (typeof oData == 'object') {
			return oData;
		}

		var splitChar = oData.match("[/.-]+");

		// span1-5 datepicker hasDatepicker
		var oDataArray = oData.split(splitChar);
		var reversed = oDataArray.reverse();
		if (reversed[0] < 1 || reversed[0] > 31 || reversed[1] < 1 || reversed[1] > 12) {
			return null;
		}
		var year = reversed[2];

		if (year) {
			if (year < 1000) {
				// 11　⇒　2011に変換
				year = (Number(year) + 2000) + '';
			}
			if (year.search("[" + this.abbrEi + "]+") != -1) {
				year = this.getEiToAdyy(year);
			}
		} else {
			// yearがない場合はクライアントの現在年を設定
			year = this.baseYear;
		}

		var date = new Date(year, reversed[1] - 1, reversed[0]);

		// 変換失敗時はnullを返却
		return isNaN(date) ? null : date;
	},

	/** 西暦に変換 */
	convertToAdDate : function(oData, conChar) {
		conChar = conChar || "/";
		var date = this.toDateType(oData);
		if (!date) {
			return oData;
		}
		return date.getFullYear() + conChar + this.lpad(date.getMonth() + 1) + conChar + this.lpad(date.getDate());
	},

	/** 和暦に変換 */
	convertToJpnDate : function(oData, conChar) {

		var date = this.toDateType(oData);
		if (!date) {
			return oData;
		}

		conChar = conChar || ".";
		var year = this.getJpnYear(date);
		return (year || date.getFullYear()) + conChar + this.lpad(date.getMonth() + 1) + conChar + this.lpad(date.getDate());
	},

	toDateTypeYearMonth : function(oData) {
		if (!oData) {
			return oData;
		}
		var splitChar = oData.match("[/.-]+");
		var oDataArray = oData.split(splitChar);
		if (oDataArray.length < 3) {
			oData = oData + splitChar + "01";
		}

		return this.toDateType(oData);
	},

	/** 年月の西暦変更 */
	convertToAdYearMonth : function(oData, conChar) {

		var date = this.toDateTypeYearMonth(oData);
		if (!date) {
			return oData;
		}

		conChar = conChar || "/";
		return date.getFullYear() + conChar + this.lpad(date.getMonth() + 1);
	},

	/** 年月の和暦変更 */
	convertToJpnYearMonth : function(oData, conChar) {

		var date = this.toDateTypeYearMonth(oData);
		if (!date) {
			return oData;
		}

		conChar = conChar || ".";
		var year = this.getJpnYear(date);
		return (year || date.getFullYear()) + conChar + this.lpad(date.getMonth() + 1);
	},

	/** 和暦の現在日付を取得 */
	convertToJpnDateNow : function() {

		var date = new Date();
		if (!date) {
			return oData;
		}

		conChar = ".";
		var year, startYmd, endYmd;
		for (key in this.eiKeyData) {
			startYmd = this.eiKeyData[key].seirekiStartYmd;
			endYmd = this.eiKeyData[key].seirekiEndYmd;

			if (date.getTime() >= startYmd.getTime() && date.getTime() < endYmd.getTime()) {
				year = key + this.lpad((date.getFullYear() - startYmd.getFullYear() + 1));
				break;
			}
		}
		return (year || date.getFullYear()) + conChar + this.lpad(date.getMonth() + 1) + conChar + this.lpad(date.getDate());
	},


	/**
	 * 日を調整して和暦に出力
	 * @param oData 変換対象
	 * @param diffDay 差分(1, -1などの日日を設定)
	 * @param conChar 日付区切り文字
	 * @returns
	 */
	addDaysJpnDate : function(oData, diffDay, conChar) {
		var date = this.toDateType(oData);
		date.addDays(diffDay);
		return this.convertToJpnDate(date);
	},

	/**
	 * 日を調整して西暦に出力
	 * @param oData 変換対象
	 * @param diffDay 差分(1, -1などの日日を設定)
	 * @param conChar 日付区切り文字
	 * @returns
	 */
	addDaysAdDate : function(oData, diffDay, conChar) {
		var date = this.toDateType(oData);
		date.addDays(diffDay);
		return this.convertToAdDate(date);
	},

	/**
	 *　backboneモデルに格納されているパラメータを和暦から西暦に変換
	 * @param model backboneモデル
	 * @param keysArray パラメータキー new Array('tset', ''...)
	 */
	convertToAdDateFormModel : function(model, keysArray, conChar) {
		for (key in keysArray) {
			model.set(keysArray[key], this.convertToAdDate(model.get(keysArray[key]), conChar));
		}
	},

	/**
	 * [2001年～、1～]を[01～]に表示
	 * @param val
	 * @returns
	 */
	lpad : function(val) {
		if (val > 99) {
			return val;
		}
		return ("0" + val).slice(-2);
	},

	/**
	 * 年月まで入力されたのかのチェック
	 * @param oData
	 */
	isYM : function(oData) {
		var splitChar = oData.match("[/.-]+");
		var oDataArray = oData.split(splitChar);
		return oDataArray.length == 2;
	}
};
var DateConvertUtil = new _DateConvertUtil();

// DOM構築後の任意のタイミングでも以下を呼び出したいので外だし
/** カレンダ設定 */
var DatepickerAppender = {

	minDate : new Date(1900, 0, 01),
	maxDate : new Date(2100, 11, 31),

	setup : function(selector) {
		var parent = selector ||'';
		$(parent + ' :input.datepicker').change(function() {
			if (this.className.indexOf('ymAble') > -1) {
				if (this.value.length < 8) {
					this.value = DateConvertUtil.convertToJpnYearMonth(this.value);
				} else {
					// 西暦⇒和暦変換
					this.value = DateConvertUtil.convertToJpnDate(this.value);
				}
			} else {
				// 西暦⇒和暦変換
				this.value = DateConvertUtil.convertToJpnDate(this.value);
			}

		}).keydown(function(event) {
		    if (event.which === $.ui.keyCode.ENTER) {
		    	// datepickerのEnterキー押下の挙動をキャンセル
		    	// datepickerはデフォルト状態からEnterキー入力で以下の動作をする
		    	// 1) 未入力状態でEnter　⇒　現在日付を設定
		    	// 2) 不正な値入力でEnter　⇒　現在日付を設定
		    	//     今回は、和暦を入力時に不正値とみなされてしまうため、この挙動をキャンセルする
		    	event.stopImmediatePropagation();
		    }
		});

		if ($.datepicker) {
			// カレンダ表示設定
			$.datepicker.setDefaults($.extend($.datepicker.regional['ja']));
			$(parent + " :input.datepicker").datepicker({
				dateFormat: 'yy/mm/dd',
				constrainInput: false,
				defaultDate: '',
				changeMonth:true,
				changeYear:true,
				beforeShow: function(input,inst){
					if (input.className.indexOf("birthDate") > -1) {
						inst.settings.yearRange = "1900:";
					}
					inst.settings.minDate = DatepickerAppender.minDate;
					inst.settings.maxDate = DatepickerAppender.maxDate;

					var date = DateConvertUtil.convertToAdDate(this.value);
					//this.value = date;
					inst.settings.defaultDate = new Date(date);
					// z-indexの調整（bootstrapのコンポーネントの下に隠れることがあるため）
					setTimeout(function() {
						$(".ui-datepicker").css("z-index", 1100);
					}, 10);
				},
				onSelect: function(dateText, inst) {
					this.value = DateConvertUtil.convertToJpnDate(this.value);
					$(this).change();
				},
				onClose: function(dateText, inst) {
					$(this).trigger("closeDatePicker");
				}
			});
		}
	}
};

$(function() {
	DateConvertUtil.getEiKeyData();
	DatepickerAppender.setup();
});
