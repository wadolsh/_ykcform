
/**
 * choish
 */
(function(){
    var root = this;
    var Bridge = root.Bridge = {};
    var log = root.log = function(str) {
        //console.log(str);
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

    var bind = Bridge.bind = function (fn, scope) {
        return function () {
            fn.apply(scope, arguments);
            //fn.call
        };
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
            include    : /##@([\s\S]+?)##/g,
            variable: 'data'
    };
    
    
    var templateParser = function(text, settings) {
        settings = _.defaults({}, settings, Bridge.templateSettings);
    
        // Combine delimiters into one regular expression via alternation.
        var matcher = new RegExp([
          (settings.escape || noMatch).source,
          (settings.interpolate || noMatch).source,
          (settings.func || noMatch).source,
          (settings.include || noMatch).source,
          (settings.evaluate || noMatch).source,
        ].join('|') + '|$', 'g');
    
        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "";
        window.funcArray = {};
        window.funcIdCount = 0;
        text.replace(matcher, function(match, escape, interpolate, func, include, evaluate, offset) {
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
                var funcArray = func.split('::');
                source += "';\nfuncArray[funcId] = {func: " + funcArray[0] + ", data: " + (funcArray[1] || 'this') + "};\n__p+='";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }
            if (include) {
                source += "';\n__p+='" + new Function('return ' + include).call(this);
            }
            index = offset + match.length;
            return match;
        });
        return source;
    }
    
    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    var template = Bridge.template = function($area, text, data, settings) {
        settings = _.defaults({}, settings, Bridge.templateSettings);
        var render = null;
        var source = "__p+='";
        source += templateParser(text, settings);
        source += "';\n";
    
        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
    
        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + "return __p;\n";
    
        //try {
            render = new Function(settings.variable || 'obj', '_', source);
        //} catch (e) {
        //    e.source = source;
        //    throw e;
        //}

        if (data) {
            var html = render.call(data, data, _);
            //$area.html($(html));
            $area[0].innerHTML = html;
            $.each(funcArray, function(key, obj) {
                var $element = $area.find('[data-event="' + key + '"]');
                $.each(obj.func, function(eventId, eventFunc) {
                    //$element.on(eventId, obj.data, eventFunc);
                    var eventKey = key + eventId;
                    $element.on(eventKey, null, obj.data, eventFunc);
                    $element.on(eventId, function(event) {
                        $element.trigger(eventKey, obj.data);
                    });
                });
            });
            return $area;
        }
        
        var template = function(data, element) {
            var html = render.call(data, data, _);
            //var $html = $(html);
            //try {
                if (element) {
                    //$(element).html($html);
                    element.innerHTML = html;
                    $area = $(element);
                } else {
                    //$area.html($html);
                    $area[0].innerHTML = html;
                }
            //} catch(e) {
            //    console.log(e);
            //}
            
            //$area[0].innerHTML = html;
            $.each(funcArray, function(key, obj) {
                var $element = $area.find('[data-event="' + key + '"]');
                $.each(obj.func, function(eventId, eventFunc) {
                    //$element.on(eventId, null, obj.data, function(e) {
                    //    RouterTool.capture(eventFunc, e);
                    //});
                    var eventKey = key + eventId;
                    $element.on(eventKey, null, obj.data, eventFunc);
                    $element.on(eventId, function(event) {
                        //RouterTool.capture(eventFunc, event);
                        $element.trigger(eventKey, obj.data);
                    });
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
        addTmpl: function(obj, insideCatch) {
            var insideCatch = insideCatch || false;
            var tmpl = this;
            if (obj instanceof jQuery) {
                var container = [];
                obj.each(function(ind, ele) {
                    var tmpl_id = ele.dataset['tmplId'];
                    var tmpl_option = JSON.parse(ele.dataset['tmplOption'] || '{}');
                    var $tmpl_container = $('[data-bind-tmpl-id="' + tmpl_id + '"], #' + tmpl_id);
                    //$tmpl_container = $tmpl_container[0] ? $tmpl_container : ;
                    var render = tmpl.cache[tmpl_id] = template($tmpl_container, ele.innerHTML);//ele.innerHTML);
                    if (insideCatch) {
                        tmpl.addTmpl($(ele.innerHTML).find(obj.selector));
                    }
                    if ($tmpl_container[0] && !tmpl_option.render) {
                        container.push($tmpl_container[0]);
                    } else if (tmpl_option.render) {
                        render(tmpl_option.data || {});
                    }
                });
                
                for (var i=0, size=container.length; i < size; i++) {
                    container[i].innerHTML = '';
                }
                
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
                        tmpl.addTmpl($(html).find('[data-tmpl-id]'), insideCatch);
                    },
                    dataType: 'text',
                    //async: false,
                    cache: true
                });
            }
            return this;
        },
        
        render: function(tmplKey, data, callback, route) {
            var tmplKeys = tmplKey.split('::');
            var route = route || true;
            var ele = document.getElementById(tmplKeys[1] || tmplKeys[0])
            //ele.innerHTML = Bridge.tmpl($('#' + tmplKey), tmplTool.cache[tmplKey], data);

            if (route) {
                RouterTool.add(tmplKey, data);
            }
            var $html = '';
            try {
                $html = tmplTool.cache[tmplKeys[0]](data, ele);
            } catch(e) {
                console.log(e);
            }
            if (callback) {
                callback(data, $html);
            }
            return $html;
        },
        bindTmpl: function(obj) {
            if (obj instanceof jQuery) {
                obj.each(function(ind, ele) {
                    var bindTmplId = ele.dataset['bindTmplId'];
                    var tmplSrc = ele.dataset['tmplSrc'];
                    if (tmplSrc) {
                        //tmplTool.addTmpl(tmplSrc);
                        
                        $.ajax({
                            url: tmplSrc,
                            success: function(html) {
                                var $html = $(html);
                                var $ele = $(ele);
                                var eleHtml = ele.innerHTML;
                                ele.innerHTML = $html.find('[data-tmpl-id="' + bindTmplId + '"]').add($html.filter('[data-tmpl-id="' + bindTmplId + '"]')).html();
                                $ele.find('content').replaceWith(eleHtml);
                                tmplTool.addTmpl($ele.find('[data-tmpl-id]').add($ele.filter('[data-tmpl-id]')));
                            },
                            dataType: 'text',
                            async: false,
                            cache: true
                        });
                    }

                });
            } else {
                
            }
        },
        include: function(tmplSrc, tmplId) {
            var html = $.ajax({
                url: tmplSrc,
                /*
                success: function(html) {
                    var $html = $(html);
                    return $html.find('[data-tmpl-id="' + tmplId + '"]').add($html.filter('[data-tmpl-id="' + tmplId + '"]')).html();
                    //tmplTool.addTmpl($ele.find('[data-tmpl-id]').add($ele.filter('[data-tmpl-id]')));
                },
                */
                dataType: 'text',
                async: false,
                cache: true
            }).responseText;
            var $html = $(html);
            return templateParser($html.find('[data-tmpl-id="' + tmplId + '"]').add($html.filter('[data-tmpl-id="' + tmplId + '"]')).html());
        },
        editor: function($html, config) {
            config = config || {};
            var inputObjList = [];
            var data = {};
            var inputConfig = null;
            var inputObj = null;
            $html.find(':input[name]').each(function(ind, input) {
                inputConfig = config[input.name] || {};
                if (input.type == "radio" && !input.checked) {
                    return;
                }
                inputObj = {
                    target: input,
                    name: input.name,
                    validateTool: inputConfig.validateTool || config.validateTool || Bridge.validateTool,
                    validateRule: inputConfig.validateRule,
                    
                    val: inputConfig.val || config.val || function () {
                        var target = this.target;
                        if (target.type == "checkbox") {
                            return target.checked ? (target.value || true) : (target.value ? '' : false);
                        } else if (target.type == "radio") {
                            return target.checked ? (target.value || true) : null;
                        }
                        return target.value;
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
                        var validateRule = this.validateRule;
                        var validateTool = this.validateTool;
                        for (var ruleName in validateRule) {
                            if (!validateTool[ruleName]) {
                                continue;
                            }
                            message = validateTool[ruleName].call(this, {label : validateRule.label}, this.val(), validateRule[ruleName]);
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
                    var data = this.data = {};
                    var inputObjList = this.inputObjList;
                    var inputObj = null;
                    //for (var ind in this.inputObjList) {
                    for (var ind=0, size=inputObjList; ind < size; ind++) {
                        inputObj = inputObjList[ind];
                        data[inputObj.name] = inputObj.val();
                    }
                    return data;
                },
                
                validate: function() {
                    var result = true;
                    var inputObj = null;
                    var inputObjList = this.inputObjList;
                    //for (var ind in this.inputObjList) {
                    for (var ind=0, size=inputObjList; ind < size; ind++) {
                        inputObj = inputObjList[ind];
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
            var cache = this.cache;
            for (var key in cache) {
                cache[key](initData[key] ? initData[key] : {});
            }
        },
		
		reset : function(initData) {
		    var cache = this.cache;
            for (var key in initData) {
				if (initData[key] == null) {
					document.getElementById(key).innerHTML = '';
				} else {
					cache[key](initData[key] ? initData[key] : {});
				}
            }
		}
        
    };


    var RouterTool = Bridge.RouterTool = {
        history : {},
        temp: {},
        init: function() {
            this.add = function(id, data) {
                RouterTool.temp[id] = data;
            }
            
            this.capture = function(func, event) {
                //RouterTool.RTL = true;
                RouterTool.temp = {};
                //func(event);
                var state = new Date().getTime();
                window.history.pushState(state, null);
                RouterTool.history[state] = RouterTool.temp;
                //RouterTool.RTL = false;
            }
            
            var route = this;
            /*
            var history = localStorage.br_history ? JSON.parse(localStorage.br_history) : {};
            if (!history[location.hash]) {
                history[location.hash] = {};
            }
            */
            //hashchange
            
            window.addEventListener('popstate', function(event) {
                // コンテンツを操作するコード
                var state = event.state; // stateオブジェクト
            //});
            //$(window).on('popstate', function(event) {
                
                if (!state) {
                    return; // 初回アクセス時対策
                }
                
                var tempDatas = RouterTool.history[state];
                
                $.each(tempDatas, function (key, data) {
                    Bridge.tmplTool.render(key, data, null, false);
                })
                
                
                /*
                if (Object.keys(route.temp).length > 0) {
                    history[location.hash] = route.temp;
                    localStorage.br_history = JSON.stringify(history);
                    route.temp = {};
                } else {
                    RouterTool.historyBack();
                }
                */
            });
            //$(window).trigger('popstate');
        },
        add: function(id, data) {
            
        },
        capture: function(func, event) {
            //func(event);
        },
        historyBack: function() {
            /*
            var history = localStorage.br_history ? JSON.parse(localStorage.br_history) : {};
            if (!history[location.hash]) {
                history[location.hash] = {};
            }
            $.each(history[location.hash], function(id, data) {
                tmplTool.render(id, data);
            });
            */
        }
    };
    
    
    
    var storageTool = {
        storge: null,
        push: function(key, data) {
            this.storge[key] = JSON.stringify(data);
        },
        get: function(key) {
            //try {
                return JSON.parse(this.storge[key] || null);
            //} catch(e) {
            //    return null;
            //}
        },
        remove: function(key) {
            this.storge.removeItem(key);
        }
    };

    var localStorageTool = Bridge.localStorageTool = Bridge.clone(storageTool);
    localStorageTool.storge = localStorage;
    
    var sessionStorageTool = Bridge.sessionStorageTool = Bridge.clone(storageTool);
    sessionStorageTool.storge = sessionStorage;
    
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
        
        if (config.hasError) {
            this.hasError = config.hasError;
        }
        
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
        hasError : function() {
          return false;  
        },
        request : function(callBack) {
            var conn = this;
            $.post(this.url, {req : this.queueData}, function (data, textStatus, jqXHR) {
                if (conn.beforeFunc && !conn.beforeFunc(data, textStatus, jqXHR)) {
                    return false;
                }
                
                if (conn.hasError(data, textStatus, jqXHR)) {
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
        reqList : function (key, query, option) {
            query = query || {};
            //option = option || {};
            this.combine({
                "key" : key,
                "method" : "reqList",
                "parm" : query,
                "option": option
            });
            return this;
        },
        reqCount : function (key, query) {
            query = query || {};
            //option = option || {};
            this.combine({
                "key" : key,
                "method" : "reqCount",
                "parm" : query
            });
            return this;
        },
        reqDistinct : function (key, field, query) {
            query = query || {};
            //option = option || {};
            this.combine({
                "key" : key,
                "method" : "reqDistinct",
                "field" : field,
                "parm" : query
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
        /*
        reqInsertId : function (key, id, data) {
            this.combine({
                "key" : key,
                "method" : "reqInsertId",
                "data" : this.addId(data, id)
            });
            return this;
        },
        */
        reqBulkUpdate : function (key, data) {
            this.combine({
                "key" : key,
                "method" : "reqBulkUpdate",
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
        reqUpdateOperator : function (key, id, data) {
            this.combine({
                "key" : key,
                "method" : "reqUpdateOperator",
                "data" : this.addId({}, id),
                "operator" : data
            });
            return this;
        },
        reqSave : function (key, data) {
            if (data[this.idName] == "") {
                delete data[this.idName];
            }
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
    var extendObject = Bridge.extendObject = function(protoProps, staticProps) {
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