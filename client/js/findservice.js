commonModel.loginCheckerAfter = function(data) {
    findServiceModel.savedData = Bridge.localStorageTool.get('findServiceModel_savedData');
    Bridge.tmplTool.render('navMenuAdminButtons', {});
}
commonModel.logoutAfter = function(data) {
    location.href = "/";
}
commonModel.loginCheckerFail = function(data) {
    location.href = "/";
}
commonModel.loginChecker();

var findServiceConn = new Bridge.Connector({dataName : "find_service",
    //url: navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/) ? "https://bridge-c9-choish.c9.io/bridge" : "/bridge"});
    //url: navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)
    //             ?  ((document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1) ? "https:" : "") + "//ykcform.herokuapp.com/bridge" : "/bridge"
    url:"/bridge"
});

var findServiceModel = {
    savedData: null,
    listData: null,
    listCount: 0,

	lineEdit: {click: function(e) {
			e.stopPropagation();
			findServiceConn.reqData('eventData', e.data._id).request(function(data, textStatus, jqXHR) {
				var data = data['eventData'];
				//data.list = findServiceModel.listData;
				data.editMode = 'lineEdit';
				Bridge.tmplTool.render('findServiceTable', data);
				if (data.findServiceLat && data.findServiceLng) {
				    findServiceModel.geocoding.mapCreate(new google.maps.LatLng(data.findServiceLat, data.findServiceLng));
				}
			});
			//alert(e.data.mark);
	}},
	lineDelete: {click: function(e) {
			e.stopPropagation();
			if (!confirm("'" + e.data.findServiceAddress3 + e.data.findServiceAddress4 + e.data.findServiceAddress5 + "' の記録を削除してもよろしいでしょか？")) {
			    return false;
			}
			
			findServiceConn.reqDelete('reqDelete', e.data._id).request(function(data, textStatus, jqXHR) {
				var data = data['reqDelete'];
				//$(e.target).parents('td').remove();
				findServiceModel.listAreaReset();
			});
			//alert(e.data.mark);
	}},
	toCsv: {click: function(e) {
        var search_findService = Bridge.sessionStorageTool.get('search_findService') || {};
	    var eData = null;
	    var lData = null;
	    var hasFlag = false;
	    var listData = findServiceModel.listData;
	    var existDataList = [];
	    var notExistDataList = [];
	    var csvText = null;
	    
	    /*
	    var eDataList = [];
	    for (var ind in exportdata) {
	        eData = exportdata[ind];
	        if (eData.id) {
	            eDataList.push(eData);
	        }
	    }
	    */

        var trtrCsvExportHeaderArray = $('#trtrCsvExportHeader').val().replace(/ /g, '').split(',');
        var findServiceCsvExportHeaderArray = $('#findServiceCsvExportHeader').val().replace(/ /g, '').split(',');

	    if (e.data == 2) {
            for (var ind in listData) {
    	        hasFlag = false;
    	        lData = listData[ind];
    	        for (var ind2 in exportdata) {
                	eData = exportdata[ind2];
                	if (lData._id == eData.id) {
                        hasFlag = true;
                        existDataList.push(eData);
                        eData.new_fileno = lData.fileno || '';
                        break;
                    }
    	        }
                if (!hasFlag) {
                    notExistDataList.push(lData);
                }
    	    }

            var trtrText = JSON2CSV(existDataList, trtrCsvExportHeaderArray, true, escape('\r\n'));
            var addDataText = JSON2CSV(notExistDataList, findServiceCsvExportHeaderArray, true, escape('\r\n'));
            csvText = trtrText + addDataText;
	    } else {
	        csvText = JSON2CSV(listData, findServiceCsvExportHeaderArray, true, escape('\r\n'));
	    }

        //window.open('data:text/csv;filename=exportData.csv;charset=utf-8,' + csv);
        
        var link = document.createElement('a');
        link.download = 'CSV_' + (search_findService.search_findServiceCityward || '')
        + (search_findService.search_findServiceTown || '') 
        + (search_findService.search_fileno || '') + '.csv';
        link.href = 'data:text/csv;charset=utf-8,' + csvText;
        link.click();
        
	}},
	geocoding: {
	    map: null,
	    geocoder: new google.maps.Geocoder(),
	    click: function(e) {
			e.stopPropagation();
            
            var address = '';
            $('#findServiceAddress1, #findServiceAddress2, #findServiceAddress3, #findServiceAddress4, #findServiceAddress5').each(function(idx, obj) {
                address += ' ' + obj.value;
            })
            findServiceModel.geocoding.latLngByAddress(address, function(latLng){
                $('#findServiceLat').val(latLng.lat());
                $('#findServiceLng').val(latLng.lng());
                findServiceModel.geocoding.mapCreate(latLng);
            });
	    },
	    mapCreate: function(latLng) {
            var mapOptions = {
                center: latLng,
                zoom: 20,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map_canvas = document.getElementById("map_canvas");
            map_canvas.style.height = '400px';
            var map = new google.maps.Map(map_canvas, mapOptions);
            var marker = new google.maps.Marker({
                //icon : 'https://chart.googleapis.com/chart?chst=d_map_pin_letter_withshadow&chld=' + idx + '|00a8e6|000000',
                map: map,
                position: latLng,
                draggable: true
            });
            google.maps.event.addListener(marker, 'dragend', function() {
                //map.setCenter(latLng);
                var markerLatLng = marker.getPosition();
                $('#findServiceLat').val(markerLatLng.lat());
                $('#findServiceLng').val(markerLatLng.lng());
            });
            google.maps.event.addListener(map, 'click', function(event) {
                var markerLatLng = event.latLng;
                marker.setPosition(markerLatLng);
                $('#findServiceLat').val(markerLatLng.lat());
                $('#findServiceLng').val(markerLatLng.lng());
                
            });
            //google.maps.event.addListener(marker, 'click', function() {
            //    map.setCenter(latLng);
            //});

	    }, 
	    latLngByAddress: function(address, func) {
            findServiceModel.geocoding.geocoder.geocode({'address': address}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    //func(results[0].geometry.location);
                    func(results[0].geometry.location);
                } else {
                    //console.log('Geocode失敗: ' + status  + '：' + address);
                    //mapTools.geocoding.latLngByAddress(address, func);
                    func(null);
                }
            });
	}},
	
	/*
	submit: {click: function(e) {
			var template = $(e.target).parents('.br-tmpl');
			var obj = Bridge.tmplTool.editor(template);
			findServiceConn.reqSave('reqSave', obj.data).request(function(data) {
				var data = data['reqSave'];
				findServiceModel.listAreaReset();
			});
	}},
	*/
	addNew: {click: function(e) {
	    Bridge.tmplTool.render('findServiceTable', {editMode: 'new'});
	}},
	clearField: {click: function(e) {
	    $(e.target).parents('.input-group').find('input').val('');
	}},
    save: {click: function(e) {
        var template = $(e.target).parents('.br-form');
        var obj = Bridge.tmplTool.editor(template, {
            findServiceDate : {validateRule : {label: '登録日', isNullAble : false}},
            findServiceFindFrom : {validateRule : {label: '情報元', isNullAble : false}},
            findServiceAddress1 : {validateRule : {label: '住所', isNullAble : false}},
            findServiceAddress2 : {validateRule : {label: '住所', isNullAble : false}},
            findServiceAddress3 : {validateRule : {label: '住所', isNullAble : false}},
            renderMessage : function(strArray) {
                $(this.target).after('<span>' + strArray.join('<br/>') + '</span>')
                .parent().addClass('has-error');
            },
            clearError : function(strArray) {
                var $target = $(this.target);
                $target.next('span').remove();
                $target.parent().removeClass('has-error');
            }
        });
        if (obj.validate()) {
            //delete obj.data._id;
            findServiceConn.reqSave('reqSave', obj.data).request(function(data) {
                //delete data[reqSave][Bridge.idName];
                findServiceModel.savedData = data['reqSave'];
                Bridge.localStorageTool.push('findServiceModel_savedData', findServiceModel.savedData);
                findServiceModel.listAreaReset();
                commonModel.messageAreaReset(data);
            });
        }
    }},
    saveCancel: {click: function(e) {
        findServiceModel.listAreaReset(false);
    }},
    addUpdateDate : function(data, prefix) {
        data[prefix + '_update_name'] = commonModel.user.name;
        data[prefix + '_update_date'] = Bridge.dateStr.getNowDate();
        data[prefix + '_update_user'] = commonModel.user._id;
        return data;
    },
    saveVisit: {click: function(e) {
        var ind = e.target.dataset.ind;
        var template = $(e.target).parents('.br-form');
        var obj = Bridge.tmplTool.editor(template, {});
        if (obj.validate()) {
            //delete obj.data._id;
            var query = null;
            var _data = obj.data;
            findServiceModel.addUpdateDate(_data, 'last');
            if (ind == 'new') {
                findServiceModel.addUpdateDate(_data, 'first');
                query = {$push : {findServiceVisitHistory : _data}};
            } else {
                query = {$set : {}};
                query['$set']["findServiceVisitHistory." + ind] = _data;
            }
            findServiceConn.reqUpdateOperator('saveVisit', e.data[Bridge.idName], query).request(function(data) {
                //e.data.findServiceComment = data.reqSave.findServiceComment;
                commonModel.messageAreaReset(data);
                if (data.saveVisit.$push || data.saveVisit.$set) {
                    if (ind == 'new') {
                        if (!e.data.findServiceVisitHistory) {
                            e.data.findServiceVisitHistory = [];
                        }
                        e.data.findServiceVisitHistory.push(data.saveVisit.$push.findServiceVisitHistory);
                    } else {
                        e.data.findServiceVisitHistory[ind] = data.saveVisit.$set["findServiceVisitHistory." + ind];
                    }
                }

                findServiceModel.listAreaReset(false);
                Bridge.tmplTool.render('searchedMapModal', e.data);
            });
        }
    }},
    removeVisit: {click: function(e) {
        if (!confirm('削除でよろしいでしょか？')) {
            return;
        }
        var ind = e.target.dataset.ind;
        var unset = {};
        unset["findServiceVisitHistory." + ind] = 1;
        findServiceConn
                .reqUpdateOperator('removeVisit1', e.data[Bridge.idName], {$unset: unset})
                .reqUpdateOperator('removeVisit2', e.data[Bridge.idName], {$pull: { 'findServiceVisitHistory': null }})
                .request(function(data) {
            if (data.removeVisit2.$pull) {
                e.data.findServiceVisitHistory.splice(ind, 1);
            }
            Bridge.tmplTool.render('searchedMapModal', e.data);
        });
    }},
    openVisit: {click: function(e) {
        Bridge.tmplTool.render('searchedMapModal', e.data);
        $('#searchedMapModal').modal('show');
    }},
    restoreFromPrev: {click: function(e) {
        var findServiceModel_savedData = Bridge.localStorageTool.get('findServiceModel_savedData');
        
        delete findServiceModel_savedData[Bridge.idName];
        //delete findServiceModel_savedData.findServiceAddress4;
        delete findServiceModel_savedData.findServiceName;
        delete findServiceModel_savedData.findServiceComment;
        delete findServiceModel_savedData.findServiceLng;
        delete findServiceModel_savedData.findServiceLat;
        
        Bridge.tmplTool.render('findServiceTable', Bridge.extend({editMode: 'new'}, findServiceModel_savedData));
    }},
    /*
    update: {click: function(e) {
        
        var template = $(e.target).parent('.br-tmpl');
        var obj = Bridge.tmplTool.editor(template);
        findServiceConn.reqUpdate('reqInsert', obj.data._id, obj.data).request(function(data) {
            findServiceModel.listAreaReset(data);
        });
    }},
    */
    setResult: {click: function(e) {
        var resultType = parseInt(e.target.dataset.resulttype);
        var _data = {result: resultType};
        findServiceModel.addUpdateDate(_data, 'last');
        findServiceModel.addUpdateDate(_data, 'first');
        var updateQuery = {$push : {findServiceVisitHistory : _data}};
        
        findServiceConn
                .reqUpdate('reqUpdate', e.data[Bridge.idName], findServiceModel.addUpdateDate({result: resultType}, 'result'))
                .reqUpdateOperator('addVisit', e.data[Bridge.idName], updateQuery)
                .request(function(data) {
            commonModel.messageAreaReset(data);
            e.data.result = data.reqUpdate.result;
            findServiceModel.listAreaReset(false);
            if (data.addVisit.$push) {
                e.data.findServiceVisitHistory.push(data.addVisit.$push.findServiceVisitHistory);
            }
            //if (e.target.dataset.frommap) {
            Bridge.tmplTool.render('searchedMapModal', e.data);
            $('#searchedMapModal').modal('show');
            //}
        });
    }},
    setToNew: {click: function(e) {
        findServiceConn.reqUpdate('reqUpdate', e.data._id, {isNew: e.data.isNew == 1 ? 0 : 1}).request(function(data) {
            commonModel.messageAreaReset(data);
            findServiceModel.listAreaReset();
        });
    }},
    setToDuplicate: {click: function(e) {
        findServiceConn.reqUpdate('reqUpdate', e.data._id, {isNew: e.data.isNew == 2 ? 0 : 2}).request(function(data) {
            commonModel.messageAreaReset(data);
            findServiceModel.listAreaReset();
        });
    }},
    
    getAuth: function(level) {
        return commonModel._auth && commonModel._auth.find_service && commonModel._auth.find_service._write >= level;
    },
    
    matchAddress: function() {
        /*
        address2: "501"
        banchi: "22"
        chome: "1"
        cityward: "川崎市川崎区"class: "返却済"congregation: "川崎市中央"description: "日本語"fileno: "03"gou: ""id: "KWS5352070940"lastvisit: ""lat: "35.53521"lng: "139.70940"name: ""notice: ""phonetic_town: "ｱｻﾋﾁｮｳ"
        prefecture: "神奈川県"serial: "0"tel: ""
        town: "旭町"
        zipcode: "2100808"
        */
        var address1 = $('#matchAddressInput1').val();
        var address2 = $('#matchAddressInput2').val();
        var address3 = $('#matchAddressInput3').val();
        var address4 = $('#matchAddressInput4').val();
        var $matchAddressTableBody = $('#matchAddressTable tbody').empty();

        var exports = [];
        var data = null;
        var addr = null;
        var hasData = false;
        var conv = function(str) {
            return str.replace('が', 'ケ')
                      .replace('ヶ', 'ケ')
                      .replace('ッ', 'ツ');
        }
        var cityward = null;
        var town = null;
        address2 = conv(address2);
        address3 = conv(address3);
        var addressList = [];
        for (var key in exportdata) {
            data = exportdata[key];
            cityward = conv(data.cityward);
            town = conv(data.town);
            if (//data.prefecture == address1 && 
                data.town != '' &&
                    (data.cityward.indexOf(address2) > -1 || address2.indexOf(data.cityward) > -1) 
                    && (address3.indexOf(data.town) > -1 || data.town.indexOf(address3) > -1)) {
                exports.push(data);
				addr = data.cityward + ' ' + data.town + ' '+ data.chome;
				addr += (data.banchi) ? ('-' + data.banchi):'';
				addr += (data.gou) ? ('-' + data.gou):'';
				addr += ' ' + data.address2 + ' ' + data.name;

                hasData = true;
                //$('<tr><td>' + data.class + '</td><td>' + addr + '</td></tr>').appendTo($matchAddressTableBody);
                addressList.push(addr);
            }
        }
        
        addressList.sort();
        for (var ind in addressList) {
            $('<tr><td>' + data.class + '</td><td>' + addressList[ind] + '</td></tr>').appendTo($matchAddressTableBody);
        }
        
        if (!hasData) {
            $('<tr><td></td><td>データがありません。</td></tr>').appendTo($matchAddressTableBody);
        }
    },
    
	listArea: {click: function(e) {
		findServiceModel.listAreaReset(false);
    }},
    
    pageSizeChange: {change: function(e) {
	    findServiceModel.page.pageSize = parseInt(e.target.value);
	    findServiceModel.page.pageNum = 1;
        findServiceModel.listAreaReset();
    }},
    pageSelect: {click: function(e) {
        findServiceModel.page.pageNum = parseInt(e.target.dataset.page);
        findServiceModel.listAreaReset();
    }},
    
    getMarkerIcon: function(text, fill_color, text_color) {
        text = (text || '');
        fill_color = fill_color || 'e63e00';
        text_color = text_color || '000000';
        return 'https://chart.googleapis.com/chart?chst=d_map_pin_letter_withshadow&chld=' + text + '|' + fill_color + '|' + text_color;
    },
    showAdminMap: {click: function(e) {
        var listData = findServiceModel.listData;
        var $adminMapArea = $('#adminMapArea');
        
        $adminMapArea.toggleClass('hidden');
        $('#findService').toggleClass('hidden');
        var isHidden = $adminMapArea.hasClass('hidden');
        if (isHidden) {
            $('#adminMapToggleButton').removeClass('btn-warning');
            return;
        }
        $('#adminMapToggleButton').addClass('btn-warning');
        
        var $adminMapPanelList = $('#adminMapPanelList');
        var $adminMapPanelCount = $('#adminMapPanelCount');
        var $adminMapPanelTotalCount = $('#adminMapPanelTotalCount');
        
        var $adminMapPanelFileNo = $('#adminMapPanelFileNo');
        if (!findServiceModel.adminMap) {
            var mapOptions = {
                center: {lat: parseFloat(listData[0].findServiceLat), lng: parseFloat(listData[0].findServiceLng)},
                zoom: 14,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map_canvas = document.getElementById("adminMap");
            
            findServiceModel.adminMap = new google.maps.Map(map_canvas, mapOptions);

            var listUpFunc = function() {
                var listData = findServiceModel.listData;
                var fileNo = $adminMapPanelFileNo.val();

                var inAreaMarkers = [];
                $adminMapPanelList.empty();
                $.each(listData, function(ind, data) {
                //for (var ind in listData) {
                    //(function() {
                        //var data = listData[ind];
                        if (!data.findServiceLat || !data.findServiceLng) {
                            return;
                        }
                        if (map.getBounds().contains(new google.maps.LatLng(parseFloat(data.findServiceLat), parseFloat(data.findServiceLng)))) {
                            inAreaMarkers.push(data);
                            //if (data.adminMapMarker.admiMapChekced == undefined && !data.fileno) {
                                
                            //}
                            var $li = $('<li class="list-group-item" data-id="' + data[Bridge.idName] + '">'
                                + '<label><input type="checkbox" ' + (data.adminMapMarker.admiMapChekced ? 'checked' : '') + ' data-fileno="' + data.fileno + '"> '
                                + '<span class="badge" ' + (fileNo && data.fileno && data.fileno == fileNo ? 'style="background-color:red;"' : '') + '>' + (data.fileno || '-') + '</span> '
                                + data.findServiceAddress3 
                                + data.findServiceAddress4 
                                + ' ' + data.findServiceAddress5 
                                + ' ' + data.findServiceName
                                + '</label>'
                                + '</li>').appendTo($adminMapPanelList);
                            
                            var $checkbox = $li.find(':checkbox').change(function(e){
                                var marker = data.adminMapMarker;
                                var checked = e.target.checked;
                                marker.admiMapChekced = checked;
                                marker.setIcon(findServiceModel.getMarkerIcon(data.fileno, ( !checked ? '00a8e6' : 'e63e00')));
                            });
                            $li[0].objData = data;
                            //data.$li = $li;
                            data.$checkbox = $checkbox;
                        }
                    //}).call(this);
                });
                
                countReset();
                $adminMapPanelTotalCount.html(inAreaMarkers.length);
                return resetMapMarker(inAreaMarkers);
            }
            
            $adminMapPanelFileNo.keyup(function() {
                listUpFunc();
            }).click(function() {
                var listData = findServiceModel.listData;
                var data = null;
                for (var ind in listData) {
                    data = listData[ind];
                    var marker = data.adminMapMarker;
                    var checked = marker.admiMapChekced;
                    marker.setIcon(findServiceModel.getMarkerIcon(data.fileno, ( !checked ? '00a8e6' : 'e63e00')));
                }
            });
            
            google.maps.event.addListener(findServiceModel.adminMap, 'idle', listUpFunc);
            //google.maps.event.addListener(findServiceModel.adminMap, "dragend", listUpFunc);
            //google.maps.event.addListener(findServiceModel.adminMap, "zoom_changed", listUpFunc);
            //listUpFunc();
        }
        
        var map = findServiceModel.adminMap;
        
        if (!findServiceModel.adminMapMarkerlist) {
            findServiceModel.adminMapMarkerlist = [];
        }
        
        var countReset = function() {
            var count = $("#adminMapPanelList li:has(input:checked)").size();
            $adminMapPanelCount.html(count);
        }
        var resetMapMarker = function(markerDataList) {
            var fileNo = $adminMapPanelFileNo.val();
            var adminMapMarkerlist = findServiceModel.adminMapMarkerlist;
            findServiceModel.adminMapDataList = markerDataList;
            
            for(var ind in adminMapMarkerlist) {
                adminMapMarkerlist[ind].setMap(null);
            }
            adminMapMarkerlist.length = 0;
            
            var listLat = [];
            var listLng = [];

            $.each(markerDataList, function(ind, data) {
            //for(var ind in markerDataList) {
            //for (var ind in listData) {
                //(function() {
                    //var data = listData[ind];
                    if (!data.findServiceLat || !data.findServiceLng) {
                        return;
                    }
                    
                    listLat.push(data.findServiceLat);
                    listLng.push(data.findServiceLng);

                    if (!data.adminMapMarker) {
                        data.adminMapMarker = new google.maps.Marker({
                            icon : findServiceModel.getMarkerIcon(data.fileno, ( data.fileno ? '00a8e6' : 'e63e00')),
                            map: map,
                            position: {lat: parseFloat(data.findServiceLat), lng: parseFloat(data.findServiceLng)},
                            draggable: false,
                        });
                        data.adminMapMarker.admiMapChekced = data.fileno ? false : true;
                        google.maps.event.addListener.call(this, data.adminMapMarker, 'click', function(e) {
                            var $checkbox = data.$checkbox;
                            $checkbox.prop('checked', !$checkbox.prop('checked'));
                            $checkbox.change();
                            countReset();
                        });
                    }

                    adminMapMarkerlist.push(data.adminMapMarker);
                    data.adminMapMarker.setMap(map);
                //}).call(this);
            });
            var sw = new google.maps.LatLng(Math.min.apply({}, listLat), Math.min.apply({}, listLng));
            var ne = new google.maps.LatLng(Math.max.apply({}, listLat), Math.max.apply({}, listLng));
            var bounds = new google.maps.LatLngBounds(sw, ne);
            return bounds;
        }
        
        var bounds = resetMapMarker(listData);
        map.fitBounds(bounds);
    }},
    searchFileNo: function(e) {
        var adminMapPanelSearchFileNo = $('#adminMapPanelSearchFileNo').val();
        var listData = findServiceModel.listData;
        var count = 0;
        var listLat = [];
        var listLng = [];
        $.each(listData, function(ind, data) {
            if (!data.adminMapMarker) {
                return;
            }

            if (data.fileno == adminMapPanelSearchFileNo) {
                count++;
                listLat.push(data.findServiceLat);
                listLng.push(data.findServiceLng);
            }
            data.adminMapMarker.setIcon(
                findServiceModel.getMarkerIcon(data.fileno, ( data.fileno == adminMapPanelSearchFileNo ? 'e63e00' : 'fdf498')));
        });
        $('#adminMapPanelSearchFileNoCount').html(count);
        var sw = new google.maps.LatLng(Math.min.apply({}, listLat), Math.min.apply({}, listLng));
        var ne = new google.maps.LatLng(Math.max.apply({}, listLat), Math.max.apply({}, listLng));
        findServiceModel.adminMapSearchBounds = new google.maps.LatLngBounds(sw, ne);

    },
    saveFileNo: {click: function(e) {
        var adminMapPanelFileNo = $('#adminMapPanelFileNo').val();
        var adminMapPanelCount = $('#adminMapPanelCount').val();
        if (!confirm('リスト内選択されたすべての区域の区域番号を上書きします。宜しいでしょうか？')) {
            return;
        }
        var updateCount = 0;
        var $adminMapPanelUpdateCount = $('#adminMapPanelUpdateCount');
        $("#adminMapPanelList li:has(input:checked)").each(function(ind, obj) {
            findServiceConn.reqUpdate('fileNoUpdate', obj.dataset.id, {
                    fileno: adminMapPanelFileNo
                }).request(function(data) {
                commonModel.messageAreaReset(data);
                var fileno = data['fileNoUpdate'].fileno;
                $(obj).find('.badge').html(fileno);
                var data = obj.objData;
                data.fileno = fileno;
                data.adminMapMarker.setIcon(findServiceModel.getMarkerIcon(data.fileno, ( data.fileno ? '00a8e6' : 'e63e00')));
                var flag = adminMapPanelFileNo ? false : true;
                data.adminMapMarker.admiMapChekced = flag;
                data.$checkbox.prop('checked', flag);
                updateCount++;
                $adminMapPanelUpdateCount.html(updateCount);
                if (updateCount == adminMapPanelCount) {
                    $('#adminMapPanelFileNo').keyup();
                }
            });
        });
    }},
    
    showSearchedMap: {click: function(e) {
        var listData = findServiceModel.listData;
        
        var $searchedMapArea = $('#searchedMapArea');
        
        $searchedMapArea.toggleClass('hidden');
        $('#findService').toggleClass('hidden');
        var isHidden = $searchedMapArea.hasClass('hidden');
        if (isHidden) {
            $('#mapToggleButton').removeClass('btn-success');
            return;
        }
        $('#mapToggleButton').addClass('btn-success');
        
        if (!findServiceModel.searchedMap) {
            var mapOptions = {
                center: {lat: parseFloat(listData[0].findServiceLat), lng: parseFloat(listData[0].findServiceLng)},
                zoom: 14,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map_canvas = document.getElementById("searchedMap");
            //map_canvas.style.height = '400px';
            findServiceModel.searchedMap = new google.maps.Map(map_canvas, mapOptions);
        }
        var map = findServiceModel.searchedMap;
        
        if (!findServiceModel.searchedMarkers) {
            findServiceModel.searchedMarkers = [];
        }
        
        var searchedMarkers = findServiceModel.searchedMarkers;
        
        for(var ind in searchedMarkers) {
            searchedMarkers[ind].setMap(null);
        }
        
        var listLat = [];
        var listLng = [];
        var marker, data = null;
        $.each(listData, function(ind, data) {
        //for (var ind in listData) {
            //data = listData[ind];
            if (!data.findServiceLat || !data.findServiceLng) {
                return;
            }
            listLat.push(data.findServiceLat);
            listLng.push(data.findServiceLng);
            marker = new google.maps.Marker({
                //icon : 'https://chart.googleapis.com/chart?chst=d_map_pin_letter_withshadow&chld=' + idx + '|00a8e6|000000',
                map: map,
                position: {lat: parseFloat(data.findServiceLat), lng: parseFloat(data.findServiceLng)},
                draggable: false
            });
            google.maps.event.addListener.call(this, marker, 'click', function(e) {
                Bridge.tmplTool.render('searchedMapModal', data);
                $('#searchedMapModal').modal('show');
                this.setIcon('http://maps.google.co.jp/mapfiles/ms/icons/blue-dot.png');
                findServiceModel.selectedMapMarker = this;
            });
            searchedMarkers.push(marker);
        });
        
        var sw = new google.maps.LatLng(Math.min.apply({}, listLat), Math.min.apply({}, listLng));
        var ne = new google.maps.LatLng(Math.max.apply({}, listLat), Math.max.apply({}, listLng));
        var bounds = new google.maps.LatLngBounds(sw, ne);
        map.fitBounds(bounds);
    }},
    
	search: {click: function(e) {
	    findServiceModel.page.pageNum = 1;

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
	    
		Bridge.sessionStorageTool.push('search_findService', search);
		findServiceModel.listAreaReset();
    }},
    listAreaReset: function(isReflash) {
        
		//var serviceDateMonth = $('#dat').val();
		var search = Bridge.sessionStorageTool.get('search_findService') || {};
		$.each(search, function(key, value) {
		    $('#' + key).val(value);
		});
		
	    if (isReflash == undefined) isReflash = true;
        if (!isReflash) {
            var data = {};
            data.search = search;
            data.page = findServiceModel.page;
            data.list = findServiceModel.listData;
            data.orderBy = findServiceModel.orderBy;
            data.listCount = findServiceModel.listCount;
            Bridge.tmplTool.render('findServiceTable', data);
            return;
        }
		
		var searchParm = {$query: {}, $orderby: findServiceModel.orderBy};
		if (Object.keys(search).length != 0) {
		    searchParm.$query.$and = [];
		}
		
		var searchFrom = findServiceModel.searchForm;
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
		var pageSize = findServiceModel.page.pageSize;
		var pageNum = findServiceModel.page.pageNum;

        findServiceConn.reset()
        .reqCount('count', searchParm.$query)
        .reqList('reqList', searchParm, {skip: (pageSize * ( pageNum - 1 )), limit: pageSize})
        //.reqList('reqList', searchParm)
        .request(function(data, textStatus, jqXHR) {
            findServiceModel.listCount = data['count'];
            findServiceModel.listData = data['reqList'];
            data.list = data['reqList'];
            data.listCount = data['count'];
            commonModel.messageAreaReset(data);
            
            data.search = search;
            data.page = findServiceModel.page;
            data.orderBy = findServiceModel.orderBy;
            
            Bridge.tmplTool.render('findServiceTable', data);
        });
    },
};

findServiceModel.page = {
        pageSize: 20,
        pageNum: 1,
        pageWidth: 4,
        pageSelectFunc: findServiceModel.pageSelect,
        pageSizeChangeFunc: findServiceModel.pageSizeChange
};
findServiceModel.orderBy = {
          
};
findServiceModel.searchForm = {
    search_findServiceDate: {
        searchField: "findServiceDate",
        searchComparison : "$eq",
        label: "登録日",
        type: "date",
        style: "width:160px;"
    },
    search_findServiceFindFrom: {
        searchField: "findServiceFindFrom",
        searchComparison : "$regex",
        label: "情報元",
        list: "findServiceFindFromList"
    },
    search_findServiceMapKu: {
        searchField: "findServiceMapKu",
        searchComparison : "$regex",
        label: "地図:市区",
        list: "findServiceMapKuList"
    },
    search_findServiceMapPage: {
        searchField: "findServiceMapPage",
        searchComparison : "$eq",
        label: "ページ",
        style: "width:60px;"
    },
    search_findServiceCityward: {
        searchField: "findServiceAddress2",
        searchComparison : "$regex",
        label: "住所:市区",
        list: "findServiceMapKuList",
        lineBreak: 1
    },
    search_findServiceTown: {
        searchField: "findServiceAddress3",
        searchComparison : "$regex",
        label: "町村",
        list: "townNameList"
    },
    search_fileno: {
        searchField: "fileno",
        searchComparison : "$eq",
        label: "区域番号",
        style: "width:100px;"
    }
}
findServiceModel.visitResultInfo = {'1' : '〇', '2' : '×'};
findServiceModel.resultTypeModel = {
    '1': {label: '韓国語', color:'btn-success'},
    '2': {label: '日本語', color:'btn-info'}, 
    '3': {label: '中国語', color:'btn-info'}, 
    '-1': {label: 'あいまい', color:'btn-warning'}, 
    '-2': {label: '住所不明', color:'btn-danger'}, 
    '0': {label: '未設定', color:'btn-default'}
};

var exportdate = null;
var exportdata = Bridge.localStorageTool.get('exportdata');
function refreshStorage() {
    
    var paregoriaParm = {
        accept: 'application/json',
        auth: 'korean:1914',
        hostname: 'paregoria.ddns.net',
        port: 80,
        path: '/trtr/exportdate.json'
    }
    paregoriaParm.path = '/trtr/exportdate.json';
    findServiceConn.reqExecMethod('export', 'getDataByUrl', {parm: paregoriaParm}).request(function(data, textStatus, jqXHR) {
        if ((localStorage['exportdate'] || '0') < data['export'].lastvisit ){
        	paregoriaParm.path = '/trtr/export.json';
        	findServiceConn.reqExecMethod('export', 'getDataByUrl', {parm: paregoriaParm}).request(function(data, textStatus, jqXHR) {
         	 	localStorage['exportdata'] = JSON.stringify(data['export']);
         	 	exportdata = data['export'];
        	});
			localStorage['exportdate'] = data['export'].lastvisit;
			exportdate = data.lastvisit;
		} else {
		    exportdate = localStorage['exportdate'];
		    exportdata = JSON.parse(localStorage['exportdata']);
		}
	});
}


function JSON2CSV(objArray, withHeader, quote, newline) {
    var withHeader = withHeader || true;
    var quote = quote || true;
    var newline = newline || '\n';
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

    var str = '';
    var line = '';

    var headArry = [];
    if (withHeader) {
        if (Array.isArray(withHeader)) {
            headArry = withHeader;
        } else {
            var head = array[0];
            for (var key in head) {
                headArry.push(key);
            } 
        }
        
        if (quote) {
            line = '"' + headArry.join('","') + '"';
        } else {
            line = headArry.join(',');
        }
        str += line + newline;
        
    }

    var obj = null;
    for (var i = 0; i < array.length; i++) {
        obj = array[i];
        var line = '';

        if (quote) {
            for (var index in headArry) {
                var value = (obj[headArry[index]] || '') + "";
                line += '"' + value.replace(/"/g, '""') + '",';
            }
        } else {
            for (var index in headArry) {
                line += (obj[headArry[index]]  || '') + ',';
            }
        }

        line = line.slice(0, -1);
        str += line + newline;
    }
    return str;
    
}


Bridge.tmplTool.bindTmpl($('[data-bind-tmpl-id]'));
Bridge.tmplTool.addTmpl($('[data-tmpl-id]'));
Bridge.tmplTool.render('menu', {});