/** @license
 | Copyright 2012 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
var searchAddress;

//Function to locate the entered address on the map
function locate() {
    ClearGraphics();
    if (dojo.byId('spanAddress').className == 'text') {
        if (dojo.byId("txtAddress").value.trim() == '') {
            dojo.byId('txtAddress').focus();
            ShowDialog('Locator Error', messages.getElementsByTagName("mapAddress")[0].childNodes[0].nodeValue);
            return;
        }
        GeoCodeAddress();
    }
    else {
        if (dojo.byId("txtAddress").value.trim() == '') {
            ShowDialog('Locator Error', messages.getElementsByTagName("blankService")[0].childNodes[0].nodeValue);
            return;
        }
        var query = new esri.tasks.Query();
        query.where = "REQUESTID = '" + dojo.byId('txtAddress').value.trim() + "'";
        map.getLayer(serviceRequestLayerInfo.Key).queryFeatures(query, function (features) {
            if (features.features.length > 0) {
                ActivateTab('divServiceTabContainer', 1, true);
                map.centerAndZoom(features.features[0].geometry, map._slider.maximum - 2);
                setTimeout(function () {
                    ShowServiceRequestDetails(features.features[0].geometry, features.features[0].attributes);
                }, 500);
            }
            else {
                ShowDialog('Locator Error', messages.getElementsByTagName("unableService")[0].childNodes[0].nodeValue);
            }
        }, function (err) {
            ShowDialog('Locator Error', messages.getElementsByTagName("unableService")[0].childNodes[0].nodeValue);
        });
    }
}

//Geocoding address
function GeoCodeAddress() {
    var node = dojo.byId('divAddressContainer');
    var nodeBaseMap = dojo.byId('divBaseMapTitleContainer');

    if (nodeBaseMap.style.display != "none") {
        ShowHideBaseMapComponent();
    }

    if (node.style.display != "none") {
        WipeOutControl(node, 100);
    }
    var appNode = dojo.byId('divAppContainer');
    if (dojo.coords(appNode).h > 0) {
        WipeOutControl(appNode, 500);
    }

    if (dojo.byId('spanAddress').className == 'text') {
        if (searchAddress == dojo.byId("txtAddress").value && node.style.display != "none") {
            WipeOutControl(node, 500);
        }
        else if (searchAddress == dojo.byId("txtAddress").value && node.style.display == "none") {
            WipeInControl(node, 500);
        }

        var address = [];

        address[locatorFields] = dojo.byId('txtAddress').value;

        ShowLoadingMessage('Searching...');
        var locator = new esri.tasks.Locator(locatorURL);
        locator.outSpatialReference = map.spatialReference;
        locator.addressToLocations(address, ["Loc_name"], function (candidates) {
            ShowLocatedAddress(candidates);
        }, function (err) {
            HideLoadingMessage();
            ShowDialog('Locator Error', messages.getElementsByTagName("unableLocate")[0].childNodes[0].nodeValue);

        });
    }
}

//function to populate bing/esri addresses in table
function ShowLocatedAddress(candidates) {
    RemoveChildren(dojo.byId('divAddressContainer'));
    if (candidates.length > 0) {
        if (candidates[0].score == 100) {
            LocateAddressOnMap(new esri.geometry.Point(candidates[0].location.x, candidates[0].location.y, map.spatialReference));
        }
        else {
            var table = document.createElement("table");
            var tBody = document.createElement("tbody");
            table.appendChild(tBody);
            table.cellSpacing = 0;
            table.cellPadding = 0;
            for (var i = 0; i < candidates.length; i++) {
                var candidate = candidates[i];
                var tr = document.createElement("tr");
                tBody.appendChild(tr);
                var td1 = document.createElement("td");
                td1.innerHTML = candidate.address;
                td1.className = 'tdAddress';
                td1.height = 20;
                td1.setAttribute("x", candidate.location.x);
                td1.setAttribute("y", candidate.location.y);
                td1.onclick = function () {
                    dojo.byId('txtAddress').value = this.innerHTML;
                    LocateAddressOnMap(new esri.geometry.Point(Number(this.getAttribute("x")), Number(this.getAttribute("y")), map.spatialReference));
                }
                tr.appendChild(td1);
            }
            dojo.byId('divAddressContainer').appendChild(table);
            AnimateAdvanceSearch();
        }
    }
    else {
        dojo.byId('txtAddress').focus();
        ShowDialog('Locator Error', messages.getElementsByTagName("unableLocate")[0].childNodes[0].nodeValue);
        HideLoadingMessage();
        return;
    }
    HideLoadingMessage();
}

//function to locate bing/esri address on map
function LocateAddressOnMap(mapPoint) {
    ClearGraphics();

    if (!map.getLayer('streetMap').fullExtent.contains(mapPoint)) {
        alert('Data not available for the specified address.');
        return;
    }
    if (map.getLayer(serviceRequestLayerInfo.Key).visible) {
        var symbol = new esri.symbol.PictureMarkerSymbol('images/pushpin.png', 22, 22);
        var attr = [];
        attr = { Address: dojo.byId('txtAddress').value };
        var graphic = new esri.Graphic(mapPoint, symbol, attr, null);
        map.getLayer(tempServiceRequestLayerId).add(graphic);
    }
    else {
        var symbol = new esri.symbol.PictureMarkerSymbol('images/pushpin.png', 25, 25);
        var graphic = new esri.Graphic(mapPoint, symbol, null, null);
        map.getLayer(tempPointLayer).add(graphic);
    }
    map.centerAndZoom(mapPoint, map._slider.maximum - 2);
    WipeOutControl(dojo.byId('divAddressContainer'), 500);
}

//function for locating current location
function ShowMyLocation() {
    if (dojo.coords(dojo.byId('divBaseMapTitleContainer')).h > 0) {
        WipeOutControl(dojo.byId('divBaseMapTitleContainer'), 400);
    }
    if (dojo.coords(dojo.byId('divAddressContainer')).h > 0) {
        WipeOutControl(dojo.byId('divAddressContainer'), 500);
    }

    dijit.byId('imgBaseMap').attr("checked", false);
    dojo.byId('imgGPS').src = "images/BlueGPS.png";
    if (map.getLayer(tempPointLayer)) {
        map.getLayer(tempPointLayer).clear();
    }
    navigator.geolocation.getCurrentPosition(
		function (position) {
		    ShowLoadingMessage("Finding your current location...");
		    mapPoint = new esri.geometry.Point(position.coords.longitude, position.coords.latitude, new esri.SpatialReference({ wkid: 4326 }));
		    var graphicCollection = new esri.geometry.Multipoint(new esri.SpatialReference({ wkid: 4326 }));
		    graphicCollection.addPoint(mapPoint);
		    geometryService.project([graphicCollection], map.spatialReference, function (newPointCollection) {
		        HideLoadingMessage();
		        if (!map.getLayer(baseMapLayerCollection[0].Key).fullExtent.contains(newPointCollection[0].getPoint(0))) {
		            ShowDialog('Error', messages.getElementsByTagName("dataNotAvailable")[0].childNodes[0].nodeValue);
		            return;
		        }
		        mapPoint = newPointCollection[0].getPoint(0);
		        map.centerAt(mapPoint);
		        var gpsSymbol = new esri.symbol.PictureMarkerSymbol(defaultImg, 25, 25);
		        var attr = {
		            lat: position.coords.longitude,
		            long: position.coords.latitude
		        };
		        var graphic = new esri.Graphic(mapPoint, gpsSymbol, attr, null);
		        map.getLayer(tempPointLayer).add(graphic);
		    });
		},
		function (error) {
		    HideLoadingMessage();
		    if (dojo.byId('imgGPS').src = "images/BlueGPS.png") {
		        dojo.byId('imgGPS').src = "images/gps.png";
		        var gpsButton = dijit.byId('imgGPSButton');
		        gpsButton.attr("checked", false);
		    }
		    switch (error.code) {
		        case error.TIMEOUT:
		            ShowDialog('Error', messages.getElementsByTagName("timeOut")[0].childNodes[0].nodeValue);
		            break;
		        case error.POSITION_UNAVAILABLE:
		            ShowDialog('Error', messages.getElementsByTagName("positionUnavailable")[0].childNodes[0].nodeValue);
		            break;
		        case error.PERMISSION_DENIED:
		            ShowDialog('Error', messages.getElementsByTagName("permissionDenied")[0].childNodes[0].nodeValue);
		            break;
		        case error.UNKNOWN_ERROR:
		            ShowDialog('Error', messages.getElementsByTagName("unknownError")[0].childNodes[0].nodeValue);
		            break;
		    }
		}, { timeout: 10000 });
}