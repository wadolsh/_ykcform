var MapLayer = function(config) {
	this.map = null;
	this.xmlDoc = null;
	this.createConnection();
};


Bridge.extend(MapLayer.prototype, {
	readKml: function(kmlUrl) {
		this.xmlDoc = this.getXmlData(kmlUrl);
		//this.createPolygon();
		return this;
	},
	createConnection: function() {
		this.appSettingConn = new Bridge.Connector({dataName : "app_setting",
            url: "/bridge"
        });
	},
	getXmlData: function(url) {
		var xmlhttp = null;
		if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		} else {// code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.open("GET", url ,false);
		xmlhttp.send();
		return xmlhttp.responseXML;
	},
	
	createPolygon: function() {
		var datas = [];
		var that = this;
		var placemarks = this.xmlDoc.getElementsByTagName('Placemark');
		var placemark = null;
		for(var i=0; i < placemarks.length; i++) {
			placemark = placemarks[i];
			var data = {
				name: placemark.getElementsByTagName('name')[0].textContent,
				infoWindow: new google.maps.InfoWindow({
					content: placemark.getElementsByTagName('name')[0].textContent
				})
			}
			var lineStyle = placemark.getElementsByTagName('LineStyle')[0];
			var polyStyle = placemark.getElementsByTagName('PolyStyle')[0];
			var points = [];
			var latlngs = placemark.getElementsByTagName('coordinates')[0].textContent.split(' ');
			for (var li in latlngs) {
				var latlng = latlngs[li].split(',');
				points.push(new google.maps.LatLng(latlng[1], latlng[0]));
			}
			
			var color = "#" + polyStyle.getElementsByTagName('color')[0].textContent.slice(3);
			data.polygon = new google.maps.Polygon({
			    paths: points,
			    strokeColor: color,
			    strokeOpacity: 0.8,
			    strokeWeight: polyStyle.getElementsByTagName('outline')[0].textContent,
			    fillColor: color,
			    fillOpacity: 0.35
			});
			
			google.maps.event.addListener(data.polygon, 'click', (function(data) {
				var dataa = data;
				return function(event) {
					that.clickEvent(event, dataa);
				};
			})(data));
			datas.push(data);
		}
		return datas;
	},
	
	clickEvent: function(event, data) {
		//data.infoWindow.setContent(data.name);
		data.infoWindow.setPosition(event.latLng);
		data.infoWindow.open(data.polygon.getMap());
	},
	
	setMapAll: function(mmap) {
		this.map = mmap;
		/*
		for(var ind in this.datas) {
			this.datas[ind].polygon.setMap(mmap);
		}*/
		
		this.setDrawing();
		// https://developers.google.com/maps/documentation/javascript/datalayer#style_options
		var findServiceModel_congGeoJson = Bridge.localStorageTool.get('findServiceModel_congGeoJson');// || this.toKmlGeoJson();
		this.map.data.addGeoJson(findServiceModel_congGeoJson);
		this.map.data.setStyle(function(feature) {
		    var style = feature.getProperty('style');
		    return style;
		});
	},
	
	polygonData: function() {
		var self = this;
		self.polygons = [];
		self.congNames = [];
		self.map.data.forEach(function(feature) {
			var polygon = new google.maps.Polygon({paths: feature.getGeometry().getArray()[0].getArray()});
			polygon.name = feature.getProperty('name');
			self.polygons.push(polygon);
			self.congNames.push(polygon.name);
		});
	},
	
	findCong: function(latlng) {
		/*
		var data = null;
		for(var ind in this.datas) {
			data = this.datas[ind];
			if (google.maps.geometry.poly.containsLocation(latlng, data.polygon)) {
				return data.name;
			};
		}*/
		
		var polygons = this.polygons;
		var polygon = null;
		for(var ind in polygons) {
			polygon = polygons[ind];
			if (google.maps.geometry.poly.containsLocation(latlng, polygon)) {
				return polygon.name;
			};
		}
		
		
		return '***';
	},
	
	toKmlGeoJson: function() {
		//this.map.data.toGeoJson(function(o){console.log(o)});
        var geoJson = {
            "type": "FeatureCollection",
            "features": [
            ]
        }
		
		var self = this;
		var placemarks = this.xmlDoc.getElementsByTagName('Placemark');
		var placemark = null;
		for (var i=0; i < placemarks.length; i++) {
			var feature = geoJson.features[i] = {   
                "type": "Feature",
                "properties": {
                	"style": {
                		editable: false,
                	}
                },
                "geometry": {
                   "type": "Polygon",
                   "coordinates": [[]]
                 }
            };
            
            var properties = feature.properties;
            var style = properties.style;
			var coordinates = feature.geometry.coordinates[0];
			
			placemark = placemarks[i];
			
			properties.name = placemark.getElementsByTagName('name')[0].textContent;
			feature.id = properties.name;
			
			var linesStyle = placemark.getElementsByTagName('LineStyle')[0];
			var polyStyle = placemark.getElementsByTagName('PolyStyle')[0];
			var points = [];
			var latlngs = placemark.getElementsByTagName('coordinates')[0].textContent.split(' ');
			for (var li in latlngs) {
				var latlng = latlngs[li].split(',');
				coordinates.push([parseFloat(latlng[0]), parseFloat(latlng[1])]);
			}
			
			var color = "#" + polyStyle.getElementsByTagName('color')[0].textContent.slice(3);

		    style.strokeColor = color;
		    style.strokeOpacity = 0.8;
		    style.strokeWeight = polyStyle.getElementsByTagName('outline')[0].textContent;
		    style.fillColor = color;
		    style.fillOpacity = 0.35;
		}
		
        return geoJson;
	},
	setDrawing: function() {
		this.map.data.setControls(["Polygon"]);
		
		this.map.data.setStyle({
			fillOpacity: 0.6,
			//strokeWeight: 1,
			strokeWeight: 1,
			clickable: true,
			editable: false,
			zIndex: 1
		});

		
		//this.map.data.addGeoJson(this.toKmlGeoJson());
		
		/*
	    var drawingManager = new google.maps.drawing.DrawingManager({
	        drawingMode: google.maps.drawing.OverlayType.MARKER,
	        drawingControl: true,
	        drawingControlOptions: {
	          position: google.maps.ControlPosition.TOP_CENTER,
	          drawingModes: [
	            google.maps.drawing.OverlayType.POLYGON
	          ]
	        },
	        polygonOptions: {
	          //fillColor: '#ffff00',
	          fillOpacity: 0.6,
	          strokeWeight: 1,
	          clickable: true,
	          editable: true,
	          zIndex: 1
	        }
	    });
	    drawingManager.setMap(this.map);
		google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
			var $congLayerPanel = $('#congLayerPanel');
			$congLayerPanel.removeClass('hidden');
			
			var path = polygon.getPath();
			var pathArray = [];
			path.forEach(function(ele, ind) {
				pathArray.push([ele.lng(), ele.lat()]);
			});
			
		});
		*/
	},
	removeAll: function() {
		var mapData = this.map.data;
		this.map.data.forEach(function(feature) {
			mapData.remove(feature);
		});
	},
	toGeoJson: function() {
		this.map.data.toGeoJson(function(obj) {
			console.log(obj);
		});
	}
});
MapLayer.extend = Bridge.extendObject;


var CongLayer = MapLayer.extend({
	editTargetFeature: null,
	setDrawing: function() {
		MapLayer.prototype.setDrawing.call(this);
		var self = this;
		
		
		self.map.data.addListener('setgeometry', function(event) {
			self.map.data.overrideStyle(event.feature, {
				//editable: true,
			});
		});
		
		self.map.data.addListener('click', function(event) {
			self.map.data.overrideStyle(self.editTargetFeature, {
				editable: false,
			});
			self.editTargetFeature = event.feature;
			var target = self.editTargetFeature;
			self.map.data.overrideStyle(event.feature, {
				editable: true,
			});
			var style = target.getProperty('style');
			$('#congEditPanel #congLayerColor').val(style ? style.fillColor : '');
			$('#congEditPanel #congName').val(target.getProperty('name'));
		});
	},
	changeColor: {change:function(e, self) {
		var target = self.editTargetFeature;

	}},
	setToCongLayer: {click:function(e, self) {
		var target = self.editTargetFeature;
		target.setProperty('name', $('#congEditPanel #congName').val());
		var color = $('#congEditPanel #congLayerColor').val();
		var style = {
			fillColor: color,
			fillOpacity: 0.35,
			strokeColor: color,
			strokeOpacity: 0.8,
			strokeWeight: 1
		};
		self.map.data.overrideStyle(target, style);
		target.setProperty('style', style);

	}},
	reloadGeoJson: {click:function() {
		//Bridge.localStorageTool.push('findServiceModel_savedData', findServiceModel.savedData);
		congLayer.appSettingConn.reqData('reqData', 'congGeoJson', {}).request(function(data) {
			Bridge.localStorageTool.push('findServiceModel_congGeoJson', data.reqData.geoJson);
			congLayer.removeAll();
	    	congLayer.map.data.addGeoJson(data.reqData.geoJson);
	    });
	}},
	saveGeoJson: {click:function() {
		congLayer.map.data.toGeoJson(function(geoJson){
			var geoJsonData = {'_id': 'congGeoJson', 'geoJson': geoJson};
			congLayer.appSettingConn.reqSave('result', geoJsonData).request(function(data) {
				Bridge.localStorageTool.push('findServiceModel_congGeoJson', geoJson);
	            console.log('save');
	        });
		});
	}},
	mapGeoJsonExport: {click:function() {
		congLayer.map.data.toGeoJson(function(geoJson){
			console.log(geoJson);
		});
	}},
	removeCongLayer: {click:function() {
		var target = congLayer.editTargetFeature;
		congLayer.map.data.remove(target);
	}}
});


var congLayer = new CongLayer().readKml('js/cong.kml');