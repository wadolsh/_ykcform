
var adminTableModel = {
    dataListForCong: null,
    congMap: null,
    showAdminTable: {click: function(e) {
        var $adminTableArea = $('#adminTableArea');
        var isClose = findServiceModel.toggleArea($adminTableArea, $('#adminTableToggleButton'));
        if (isClose) {
            return;
        }
        
        Bridge.tmplTool.render('adminTableArea', {search: {}, dataList: {}});
        var map = findServiceModel.congMap;
        
        if (!findServiceModel.congMap) {
            var mapOptions = {
                center: {lat: 35.531328, lng: 139.696899},
                zoom: 14,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map_canvas = document.getElementById("congMap");
            //map_canvas.style.height = '400px';
            findServiceModel.congMap = new google.maps.Map(map_canvas, mapOptions);
            congLayer.setMapAll(findServiceModel.congMap);
        }
    }},
    searchAdminTable: {click: function(e) {
        var self = adminTableModel;
        var search = {};
	    var value = null;
	    for (var key in findServiceModel.searchForm) {
	        value = $('#' + key).val();
	        if (value) {
	            search[key] = value;
	        }
	    }
	    value = $('#search_isNew').val();
	    if (value) {
	        search['search_isNew'] = value;
	    }
	    value = $('#search_result').val();
	    if (value) {
	        search['search_result'] = value;
	    }
	    value = $('#search_findServiceCongStatus').val();
	    if (value) {
	        search['search_findServiceCongStatus'] = value;
	    }
	    
	    var searchParm = {$query: {}, $orderby: findServiceModel.orderBy};
		if (Object.keys(search).length != 0) {
		    searchParm.$query.$and = [];
		}
	    
	    
	    var searchFrom = findServiceModel_searchForm;
		var searchFormObj = null;
		var searchValue = null;
		for(var key in searchFrom) {
		    searchFormObj = searchFrom[key];
			if (search[key]) {
			    searchValue = {};
			    searchValue[searchFormObj.searchField] = {};
			    searchValue[searchFormObj.searchField][searchFormObj.searchComparison] = search[key];
                searchParm.$query.$and.push(searchValue);
                //searchParm.$query.$and.push({}[searchFormObj.searchField] = {}[searchFormObj.searchComparison] = search[key]);
			    //searchParm.$query.$and.push(JSON.parse('{"' + searchFormObj.searchField + '" : {"' + searchFormObj.searchComparison + '" : "' + search_findService[key] + '"}}'));
			}
		}

		if (search.search_isNew) {
		    if (search.search_isNew == 0) {
		        searchParm.$query.$and.push({'$or': [{isNew : {$exists : false}}, {isNew : {$eq : 0}}, {isNew : {$eq : '0'}}]});
		    } else {
		        searchParm.$query.$and.push({'isNew': {$eq : parseInt(search.search_isNew)}});
		    }
		}
		if (search.search_result) {
		    if (search.search_result == 0) {
		        searchParm.$query.$and.push({'$or': [{result : {$exists : false}}, {result : {$eq : 0}}]});
		    } else {
		        searchParm.$query.$and.push({'result': {$eq : parseInt(search.search_result)}});
		    }
		}
		if (search.search_findServiceCongStatus) {
		    if (search.search_findServiceCongStatus == '') {
		        searchParm.$query.$and.push({'$or': [{findServiceCongStatus : {$exists : false}}, {findServiceCongStatus : {$eq : ''}}]});
		    } else {
		        searchParm.$query.$and.push({'findServiceCongStatus': {$eq : (search.search_findServiceCongStatus)}});
		    }
		}
	    
	    findServiceConn.reset()
        .reqCount('count', searchParm.$query)
        .reqList('reqList', searchParm)
        //.reqList('reqList', searchParm)
        .request(function(data, textStatus, jqXHR) {
            
            self.congTableData(data.reqList);
        });
	    
    }},
    resetCongregationAdminTable: {click: function(e) {
        var self = adminTableModel;
        var html = "";
        
        findServiceConn.reset()
        .reqCount('count', {})
        .reqList('reqList', {$query:{}})
        .request(function(data, textStatus, jqXHR) {
            
            var list = data.reqList;
            self.congTableData(list, data.count);
            self.dataListForCong = list;
            //console.log(data.count + " : resetCongregationAdminTable end");
        });
        
    }},
    congTableData: function(list, totalCount) {
        congLayer.polygonData();
        var adminTableResultListArea = document.getElementById('adminTableResultListArea');
        var congMap = {};
        var fdata = null;
        for (var ind in list) {
            fdata = list[ind];
            var cong = congLayer.findCong(new google.maps.LatLng(fdata.findServiceLat, fdata.findServiceLng));

            var listCong = congMap[cong];
            if (!listCong) {
                listCong = congMap[cong] = [];
            }
            fdata.findServiceAddress = fdata.findServiceAddress1 + fdata.findServiceAddress2 + fdata.findServiceAddress3
                                        + fdata.findServiceAddress4 + fdata.findServiceAddress5;
            fdata.isNew = findServiceModel_isNew[fdata.isNew || 0].label;
            fdata.result = findServiceModel_resultTypeModel[fdata.result || 0].label;
            listCong.push(fdata);
            //console.log(cong);
            //html = html + "<div>" + ind + " : " + fdata._id + " : " + cong + "</div>";
        }
        adminTableModel.congMap = congMap;
        $('#adminTableResultListArea').collapse('show');
        Bridge.tmplTool.render('adminTableResultListArea', {dataList: congMap, totalCount: totalCount});
        
    },
    congCollectTarget: function(key, target) {
        var self = this;
        var list = self.congMap[key];
        var targetData = [];
        if (target.tagName) {
            $(target).parents('table').find('tbody :checked').each(function(ind, obj) {
                targetData.push(list[obj.value]);
            });
        } else {
            targetData.push(list[target]);
        }
        
        return targetData;
    },
    congDownloadCsv: { click: function(e, key) {
        //var findServiceCsvExportHeaderArray = $('#findServiceCsvExportHeader').val().replace(/ /g, '').split(',');
        var findServiceCsvExportHeaderArray = '_id,fileno,isNew,result,findServiceCong,findServiceDate,findServiceFindFrom,findServiceMapKu,findServiceMapPage,findServiceAddress,findServiceName,findServiceComment'.replace(/ /g, '').split(',');;
        var targetList = adminTableModel.congCollectTarget(key, e.target);
        var csvText = JSON2CSV(targetList, findServiceCsvExportHeaderArray, true, escape('\r\n'));
        
        var link = document.createElement('a');
        link.download = 'CSV_' + (key || '') + '_' + Bridge.dateStr.getNowDate('yyyyMMdd_HHmmss') + '.csv';
        link.href = 'data:text/csv;charset=UTF-8,' + '\uFEFF' + csvText;
        link.click();
    }},
    congSetCong: { click: function(e, key, target) {
        var self = adminTableModel;
        var targetList = adminTableModel.congCollectTarget(key, target || e.target);
        
        findServiceConn.reset();
        var obj = null;
        for (var i=0, size=targetList.length; i < size; i++) {
            obj = targetList[i];
            obj.findServiceCong = key;
            findServiceConn.reqUpdate('reqUpdate' + i, obj._id, {findServiceCong: key});
        }
        findServiceConn.request(function(data) {
            console.log(data);
            //self.congTableData(self.dataListForCong);
        });
    }},
    congSetStatus: { click: function(e, key, status, target) {
        var self = adminTableModel;
        var targetList = adminTableModel.congCollectTarget(key, target || e.target);
        
        findServiceConn.reset();
        var obj = null;
        for (var i=0, size=targetList.length; i < size; i++) {
            obj = targetList[i];
            obj.findServiceCongStatus = status;
            findServiceConn.reqUpdate('reqUpdate' + i, obj._id, {findServiceCongStatus: status});
        }
        findServiceConn.request(function(data) {
            console.log(data);
            //self.congTableData(self.dataListForCong);
        });
    }},
    resetFileno: { click: function() {
        refreshStorage();
        findServiceConn.reset()
        .reqCount('count', {})
        .reqList('reqList', {$query:{}})
        .request(function(data, textStatus, jqXHR) {
            findServiceConn.reset();
            var list = data.reqList;
            var edata = null;
            var ldata = null;
            var updateable = 0;
            var list = data.reqList;
            for (var i=0, size=list.length; i<size; i++) {
                ldata = list[i];
            	for (var ind in exportdata) {
                	edata = exportdata[ind];
                	if (ldata._id == edata.id) {
                	    updateable = 1;
                	    findServiceConn.reqUpdate('reqUpdate' + i, ldata._id, {fileno: edata.fileno, serial: edata.serial});
                        break;
                    }
                }
            }
            
            if (updateable == 1) {
                findServiceConn.request(function(data) {
                    alert("finished");
                });
            }
        });
        

    }}
}