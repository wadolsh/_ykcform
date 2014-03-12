

var customMethod = {};
for(var key in bridge_config) {
    //console.log("method module load = " + bridge_config[key].module.filename);
    
    var moduel = customMethod[key] = bridge_config[key].module;
    moduel.methodConfig = bridge_config[key];
}

/**
 * 入口
 */
exports.process = function(req, res) {
    console.log(req.body.req);
    var reqDataArray = req.body.req;
    var resData = {};

    this.excuteMethod(0, reqDataArray, resData, req, res);
}


/**
 * 機能を実行
 */
exports.excuteMethod = function(ind, reqDataArray, resData, req, res) {
    var reqData = JSON.parse(reqDataArray[ind]);
    try {
        var configKey = null;
        var methodObj = null;
        var selected = null;
        for (var key in customMethod) {
            selected = customMethod[key];
            if (selected[reqData.method]) {
                configKey = key;
                methodObj = selected;
                break;
            }
        }

        beforeFilter(configKey, reqData, req, res);
        methodObj[reqData.method](reqData, function(result) {
            afterFilter(configKey, reqData, result, req, res);
            //return result;
            resData[reqData.key] = result;

            if (reqDataArray[++ind]) {
                exports.excuteMethod(ind, reqDataArray, resData, req, res);
            } else {
                res.json(resData);
            }
        }, req, res);

    } catch (e) {
        console.log(e.message);
        //console.log(e.stack);
        res.json({error : e.message});
        //return {error : e.message};
    } finally {
        
    }
};

var beforeFilter = function(configKey, reqData, req, res) {
    
    var filters = bridge_config[configKey].beforeFilter;

    if (filters) {
        for(var ind in filters) {
            console.log("beforeFilter - " + ind);
            filters[ind](reqData, req, res);
        }
    }

    //throw new Error('例外');
}

var afterFilter = function(configKey, reqData, result, req, res) {
    var filters = bridge_config[configKey].afterFilter;
    if (filters) {
        for(var ind in filters) {
            console.log("afterFilter - " + ind);
            filters[ind](reqData, result, req, res);
        }
    }
}