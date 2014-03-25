/**
 * choish
 */
(function(){
    
    var root = this;
    
    var Bridge = root.Bridge = {};
    
    var log = root.log = function(str) {
        console.log(str);
    };
    
    var push             = Array.prototype.push,
        slice            = Array.prototype.slice;
    
    var extend, result, clone, isObject, isNumber, isString, isDate, isEmpty, each;

    // underscore.jsがある場合 underscoreを使用するようにする
    if (root._) {
        var _ = root._;
        extend = Bridge.extend = _.extend;
        // templateSettings = _.templateSettings;
        //tmpl = Bridge.tmpl = _.template;
        //tmpl = Bridge.tmpl = template;
        //tmplTool = Bridge.tmplTool = tmplTool;

        result = Bridge.result = _.result;
        clone = Bridge.clone = _.clone;
        isObject = Bridge.isObject = _.isObject;
        isNumber = Bridge.isNumber = _.isNumber;
        isString = Bridge.isString = _.isString;
        isDate = Bridge.isDate = _.isDate;
        isEmpty = Bridge.isEmpty = _.isEmpty;
        
        each = Bridge.each = _.each;
    }



    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'":      "'",
        '\\':     '\\',
        '\r':     'r',
        '\n':     'n',
        '\t':     't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
    
    
    Bridge.templateSettings = {
            evaluate    : /##([\s\S]+?)##/g,
            interpolate : /##=([\s\S]+?)##/g,
            escape      : /##-([\s\S]+?)##/g,
            func        : /##:([\s\S]+?)##/g,
            variable: 'data'
    };
    
    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    var template = Bridge.template = function($area, text, data, settings) {
        var render = null;
        settings = _.defaults({}, settings, Bridge.templateSettings);
    
        // Combine delimiters into one regular expression via alternation.
        var matcher = new RegExp([
          (settings.escape || noMatch).source,
          (settings.interpolate || noMatch).source,
          (settings.func || noMatch).source,
          (settings.evaluate || noMatch).source,
        ].join('|') + '|$', 'g');
    
        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        window.funcArray = {};
        window.funcIdCount = 0;
        text.replace(matcher, function(match, escape, interpolate, func, evaluate, offset) {
            source += text.slice(index, offset).replace(escaper, function(match) { return '\\' + escapes[match]; });

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            }
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            if (func) {
                source += "';\nvar funcId = (funcIdCount++);\n__p+='";
                source += "'+\nfuncId\n'";
                source += "';\nfuncArray[funcId] = {func: " + func + ", data: this};\n__p+='";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }
            index = offset + match.length;
            return match;
        });
        source += "';\n";
    
        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
    
        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + "return __p;\n";
    
        try {
            render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        if (data) {
            var html = render(data, _);
            $area.html($(html));
            $.each(funcArray, function(key, obj) {
                var $element = $area.find('[data-event="' + key + '"]');
                $.each(obj.func, function(eventId, eventFunc) {
                    $element.on(eventId, obj.data, eventFunc);
                });
            });
            return $area;
        }
        
        var template = function(data) {
            var html = render.call(this, data, _);
            $area.html($(html));
            $.each(funcArray, function(key, obj) {
                var $element = $area.find('[data-event="' + key + '"]');
                $.each(obj.func, function(eventId, eventFunc) {
                    $element.on(eventId, obj.data, eventFunc);
                });
            });
            return $area;
        };

        // Provide the compiled function source as a convenience for precompilation.
        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

        return template;
    };
    
    
    var tmplTool = Bridge.tmplTool =  {
        cache: {},
        addTmpl: function(obj) {
            var tmpl = this;
            if (obj instanceof jQuery) {
                obj.each(function(ind, ele) {
                    var tmpl_id = ele.dataset['tmplId'];
                    var $tmpl_container = $('#' + tmpl_id);
                    tmpl.cache[tmpl_id] = template($tmpl_container, ele.innerHTML);
                    $tmpl_container[0].innerHTML = '';
                });
            } else {
                /*
                $.get(obj, function(html) {
                        tmpl.addTmpl($(html).find('.br-tmpl'));
                    }
                );
                */
                $.ajax({
                    url: obj,
                    success: function(html) {
                        tmpl.addTmpl($(html).find('.br-tmpl'));
                    },
                    dataType: 'text',
                    async: false
                });
            }
            return this;
        },
        
        render: function(id, data) {
            var ele = document.getElementById(id)
            //ele.innerHTML = Bridge.tmpl($('#' + id), tmplTool.cache[id], data);
            var $html = tmplTool.cache[id](data);
            
            RouterTool.add(id, data);
            return $html;
        },
        
        editor: function($html, config) {
            config = config || {};
            var inputObjList = [];
            var data = {};
            var inputConfig = null;
            var inputObj = null;
            $html.find('input[name], textarea[name], select[name]').each(function(ind, input) {
                inputConfig = config[input.name] || {};
                inputObj = {
                    target: input,
                    name: input.name,
                    validateTool: inputConfig.validateTool || config.validateTool || Bridge.validateTool,
                    validateRule: inputConfig.validateRule,
                    
                    val: inputConfig.val || config.val || function () {
                        return this.target.value;
                    },
                    clearError: inputConfig.clearError || config.clearError || function() {
                        
                    },
                    renderMessage: inputConfig.renderMessage || config.renderMessage ||  function(strArray) {
                        alert(strArray.join('\n'));
                    },
                    validate: inputConfig.validate || config.validate || function() {
                        if (!this.validateTool || !this.validateRule) {
                            return true;
                        }
                        
                        this.clearError();
                        
                        var messages = [];
                        var message = null;
                        //var result
                        for (var ruleName in this.validateRule) {
                            if (!this.validateTool[ruleName]) {
                                continue;
                            }
                            message = this.validateTool[ruleName].call(this, {label : this.validateRule.label}, this.val(), this.validateRule[ruleName]);
                            if (message) {
                                messages.push(message);
                            }
                        }
                        
                        if (messages.length !== 0) {
                            this.renderMessage(messages);
                            return false;
                        }
                        return true;
                    }
                };
                inputObjList.push(inputObj);
                data[inputObj.name] = inputObj.val();
            });
            
            return {
                $obj: $html,
                inputObjList: inputObjList,
                data: data,
                oldData: {},
                flashData: function() {
                    this.oldData = this.data;
                    this.data = {};
                    var inputObj = null;
                    for (var ind in this.inputObjList) {
                        inputObj = this.inputObjList[ind];
                        this.data[inputObj.name] = inputObj.val();
                    }
                    return this.data;
                },
                
                validate: function() {
                    var result = true;
                    var inputObj = null;
                    for (var ind in this.inputObjList) {
                        inputObj = this.inputObjList[ind];
                        if (inputObj.validate) {
                            result = inputObj.validate() && result;
                        }
                    }
                    return result;
                }
            };
        },
        
        resetAll : function(initData) {
            initData = initData || {};
            for (var key in this.cache) {
                this.cache[key](initData[key] ? initData[key] : {});
            }
        },
		
		reset : function(initData) {
            for (var key in initData) {
				if (initData[key] == null) {
					document.getElementById(key).innerHTML = '';
				} else {
					this.cache[key](initData[key] ? initData[key] : {});
				}
            }
		}
        
    };


    var RouterTool = Bridge.RouterTool = {
        //history : {},
        temp: {},
        init: function() {
            this.add = function(id, data) {
                this.temp[id] = data;
            }
            var route = this;
            var history = localStorage.br_history ? JSON.parse(localStorage.br_history) : {};
            if (!history[location.hash]) {
                history[location.hash] = {};
            }
            //hashchange
            $(window).on('popstate', function(event) {
                if (Object.keys(route.temp).length > 0) {
                    history[location.hash] = route.temp;
                    localStorage.br_history = JSON.stringify(history);
                    route.temp = {};
                } else {
                    RouterTool.historyBack();
                }
            });
            $(window).trigger('popstate');
        },
        add: function(id, data) {
            
        },
        historyBack: function() {

            var history = localStorage.br_history ? JSON.parse(localStorage.br_history) : {};
            if (!history[location.hash]) {
                history[location.hash] = {};
            }
            $.each(history[location.hash], function(id, data) {
                tmplTool.render(id, data);
            });
        }
    };
    
    var localStorageTool = Bridge.localStorageTool = {
        push: function(key, data) {
            localStorage[key] = JSON.stringify(data);
        },
        get: function(key) {
            return JSON.parse(localStorage[key]);
        }
    };

    
    /**
     * jsonの場合子も拡張する
     */
    var extendObj = function(obj) {
        obj = obj || {};
        each(slice.call(arguments, 1), function(source) {
            if (source) {
                for (var prop in source) {
                    if (isObject(obj[prop]) && source[prop]) {
                        extendObj(obj[prop], source[prop]);
                    } else {
                        obj[prop] = source[prop];
                    }
                }
            }
        });
        return obj;
    };
    
    /** 基本メッセージ表示方法 */
    var msg = Bridge.msg = function(msg) {
        alert(msg);
    };


    var fileUpload = Bridge.fileUpload = function(url, fileObj, callBack){
        $.ajax(url, {
            type: 'post',
            processData: false,
            contentType: false,
            data: fileObj,
            dataType: 'html',
            success: callBack
        });
    };
    
    Bridge.dataType = "mysql";
    Bridge.dataTypeMap = {
        mysql : {
            VARCHAR : "String",
            INT : "Number",
            TINYINT : "Number",
            DECIMAL : "Number",
            DATETIME : "Date",
            DATE : "Date"
        },
        oracle : {
            
        },
        mssql : {
            
        }
    };
    
    var dataTypeConvert = Bridge.dataTypeConvert = function(fieldMap, dataTypeMap) {
        var typeName = null;
        dataTypeMap = dataTypeMap || Bridge.dataTypeMap[Bridge.dataType];
        for (var name in fieldMap) {
            typeName = fieldMap[name].typeName;
            fieldMap[name].typeName = dataTypeMap[typeName] || 'String';
        }
    };
    
    
    var validateTool = Bridge.validateTool = {
        isNullAble : function(messageObj, value, sw) {
            if (!sw && !value) {
                // messageObj.message.push("必須項目です。");
                return "必須項目です。";
            }
            return; 
        },
        
        patterns : {
            Digits: {patten : /^\d+$/, message : "数字のみ入力してください。"},
            Email: {patten : /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
                    message : "メールアドレスを入力してください。"},
            Number: {patten : /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,
                     message : "数字のみ入力してください。"},
            // Date :
        },
        
        typeName : function(messageObj, value, type) {
            if (!value || this.type != 'text' || type == "String") {
                return;
            }
            
            if (type == "isDate") {
                if (isNaN(new Date(value))) {
                    return  "日付の入力が正しくありません。";
                }
                return;
            }
            
            if (!value.toString().match(this.validateTool.patterns[type].patten)) {
                return this.validateTool.patterns[type].message;
            }
            return;
        },
        size : function(messageObj, value, size) {
            if (!size || size < 1 || !value) {
                return;
            } else if (value.toString().length > size) {
                // messageObj.message.push("サイズを超えました。");
                return "サイズを超えました。";
            }
            return;
        }
    };
    

    /** サーバーとの通信を担当 */
    var Connector = Bridge.Connector = function(config) {
        this.config = config || {};
        this.dataName = config.dataName || Bridge.dataName;
        this.url = config.url || Bridge.url ||"/bridge";
        this.idName = config.idName || Bridge.idName || "id";
        this.baseParm = config.baseParm;
        
        this.beforeFunc = config.beforeFunc;
        this.afterFunc = config.afterFunc;
        
        this.queueData = [];
    };
    
    extend(Bridge.Connector.prototype, {
        
        addId : function (obj, id) {
            obj[this.idName] = id;
            return obj;
        },
        
        /** 既存作業を初期化 */
        reset : function() {
            this.queueData.length = 0;
            this.dataName = this.config.dataName || Bridge.dataName;
            return this;
        },
        
        request : function(callBack) {
            var conn = this;
            $.post(this.url, {req : this.queueData}, function (data, textStatus, jqXHR) {
                if (conn.beforeFunc && !conn.beforeFunc(data, textStatus, jqXHR)) {
                    return false;
                }
                callBack(data, textStatus, jqXHR);
                if (conn.afterFunc) {
                    conn.afterFunc(data, textStatus, jqXHR);
                }
            }, "json");
            
            this.reset();
        },

        dataName :function(dataName) {
            this.dataName = dataName;
        },
        
        combine : function (data) {
            this.queueData.push(JSON.stringify(extend(data, {"dataName" : this.dataName}, this.baseParm)));
        },
        
        /** メタ情報要求 */
        reqMetaData : function(key) {
            this.combine({
                "key" : key,
                "method" : "reqMetaData"
            });
            return this;
        },
        /** 一つのデートのみ要求（あくまでインタペース的な意味） */
        reqData : function (key, id, query) {
            query = query || {};
            this.combine(extend(this.addId({
                "key" : key,
                "method" : "reqData",
                "parm" : query,
            }, id)));
            return this;
        },
        reqList : function (key, query) {
            query = query || {};
            this.combine({
                "key" : key,
                "method" : "reqList",
                "parm" : query,
            });
            return this;
        },
        reqMovePage : function (key, query) {
            query = query || {};
            this.combine({
                "key" : key,
                "method" : "reqMovePage",
                "parm" : query,
            });
            return this;
        },
        reqInsert : function (key, data) {
            this.combine({
                "key" : key,
                "method" : "reqInsert",
                "data" : data
            });
            return this;
        },
        reqUpdate : function (key, id, data) {
            this.combine({
                "key" : key,
                "method" : "reqUpdate",
                "data" : this.addId(data, id)
            });
            return this;
        },
        reqSave : function (key, data) {
            this.combine(extend({
                "key" : key,
                "method" : "reqSave",
                "data" : data
            }));
            return this;
        },
        reqDelete : function (key, id) {
            this.combine(this.addId({
                "key" : key,
                "method" : "reqDelete"
            }, id));
            return this;
        },
        reqExecMethod : function (key, method, data) {
            this.combine({
                "key" : key,
                "method" : method,
                "data" : data
            });
            return this;
        },
    });
    
    
    
    // backbone extend
    // Helpers
    // -------
    
    // Helper function to correctly set up the prototype chain, for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    var extendObject = function(protoProps, staticProps) {
        var parent = this;
        var child;

        // The constructor function for the new subclass is either defined by
        // you
        // (the "constructor" property in your `extend` definition), or
        // defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && _.has(protoProps, 'constructor')) {
          child = protoProps.constructor;
        } else {
          child = function(){ return parent.apply(this, arguments); };
        }
        
        // Add static properties to the constructor function, if supplied.
        _.extend(child, parent, staticProps);
        
        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        var Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;
        
        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) _.extend(child.prototype, protoProps);
        
        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;
        
        // child.prototype.super = parent.prototype;
        
        return child;
    };

    

    
}).call(this);