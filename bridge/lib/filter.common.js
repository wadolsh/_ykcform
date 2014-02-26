exports.startLogger = function(reqData, req, res) {
    console.log(reqData);
}

exports.endLogger = function(reqData, result, req, res) {
    console.log(result);
}