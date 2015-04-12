$.ajaxSetup({
    //async : false,
    beforeSend : function(jqXHR, textStatus) {
        $('#loadingModal').modal('show');
    },
    complete : function(jqXHR, textStatus) {
        $('#loadingModal').modal('hide');
    },
    error : function(jqXHR, textStatus, errorThrown ) {
        console.log('error');
        //$('#loadingModal').modal('hide');
        if (jqXHR.status == 404) {
            Bridge.msg("サーバーとの通信時にエラーが発生しました。");
        }
        log(textStatus + " : " + errorThrown);
    }
});

//## Bridge
Bridge.idName = '_id';


var commonConn = new Bridge.Connector({
    //url: navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/) ? "https://bridge-c9-choish.c9.io/bridge" : "/bridge"});
    url: navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)
                 ?  ((document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1) ? "https:" : "") + "//ykcform.herokuapp.com/bridge" : "/bridge"});

var commonModel = {
    _id : null,
	signup: {click: function(e) {
	    Bridge.tmplTool.render('login', {isSignup: true});
	}},
	signupInsert: {click: function(e) {
		var template = $(e.target).parents('.br-tmpl');
        var obj = Bridge.tmplTool.editor(template, {
            login_id : {validateRule : {label: 'ID', isNullAble : false}},
            name : {validateRule : {label: 'ID', isNullAble : false}},
            password : {validateRule : {label: 'パスワード', isNullAble : false}},
            password2 : {validateRule : {label: 'パスワード確認', isNullAble : false}},
            //email : {validateRule : {label: 'E-mail', patterns : 'email'}},
            renderMessage : function(strArray) {
                //Bridge.tmplTool.render('message', {msg : strArray.join('<br/>')});
                alert(strArray.join('\n'));
            },
            clearError : function(strArray) {

            }
        });
        
	    if (obj.validate()) {
            commonConn.reqExecMethod('reqExecSignup', 'signup', obj.data).request(function(data) {
                
                if (data['reqExecSignup'][Bridge.idName]) {
                    Bridge.tmplTool.render('login', {isSignup: false});
                    commonModel.messageAreaReset({msg : 'ユーザーを登録しました。'});
                } else {
                    commonModel.messageAreaReset(data['reqExecSignup']);
                }
            });
	    }		    
	}},
	signupCancel: {click: function(e) {
	    Bridge.tmplTool.render('login', {isSignup: false});
	}},
    login: {click: function(e) {
        var template = $(e.target).parents('.br-tmpl');
        var obj = Bridge.tmplTool.editor(template);
        Bridge.localStorageTool.push('keepLogin', obj.data.keep_login);
        //Bridge.sessionStorageTool.push('keepLogin', obj.data.keep_login);
        commonConn.reqExecMethod('reqExecLogin', 'login', obj.data).request(function(data) {
            commonModel._id = data['reqExecLogin'][Bridge.idName];
            if (commonModel._id) {
                //console.log(data['reqExecLogin']);
                commonModel.loginChecker();
                commonModel.loginAfter(data['reqExecLogin']);
            } else {
                commonModel.messageAreaReset(data['reqExecLogin']);
            }

        });
    }},
    loginAfter: function(data) {
		//Bridge.tmplTool.render('mainMenu', {});
    },
    logout: {click: function(e) {
        var template = $(e.target).parent('.br-tmpl');
        var obj = Bridge.tmplTool.editor(template);
        commonConn.reqExecMethod('reqExecLogout', 'logout', obj.data).request(function(data) {
            //console.log(data['reqExecLogout']);
            commonModel.logoutAfter(data['reqExecLogout']);
        });
    }},
    logoutAfter: function(data) {
        //Bridge.tmplTool.reset({login: {keep_login : Bridge.localStorageTool.get('keepLogin')}, mainMenu: null});
    },
    viewport: {change: function(e) {
        var value = e.target.value;
        localStorage['viewport_scale'] = e.target.value;
        $('meta[name="viewport"]').attr('content', 'width=device-width, initial-scale=' + value + ', maximum-scale=' + value + ', user-scalable=no');
    }, setScale: function(value) {
        $('meta[name="viewport"]').attr('content', 'width=device-width, initial-scale=' + value + ', maximum-scale=' + value + ', user-scalable=no');
    }},
    
    loginChecker: function() {
        commonConn.reqExecMethod('loginChecker', 'loginChecker').request(function(data) {
            data.loginChecker['keep_login'] = Bridge.localStorageTool.get('keepLogin');
			if (data.loginChecker[Bridge.idName]) {
			    commonModel._id = data.loginChecker[Bridge.idName];
				Bridge.tmplTool.render('loginUser', data['loginChecker']);
				commonModel.loginCheckerAfter(data.loginChecker);
			} else {
			    commonModel.loginCheckerFail(data.loginChecker);
			}
        });
    },
    loginCheckerAfter: function(data) {
        //Bridge.tmplTool.reset({login: {keep_login : Bridge.localStorageTool.get('keepLogin')}, mainMenu: null});
    },
    loginCheckerFail: function(data) {
        //Bridge.tmplTool.reset({login: {keep_login : Bridge.localStorageTool.get('keepLogin')}, mainMenu: null});
    },
    messageAreaReset: function(data) {
        data = data || {};
        Bridge.tmplTool.render('message', {msg : data.msg || data.error || data.warm});
    }
};