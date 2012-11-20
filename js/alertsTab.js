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
var currentAccordianTab;    //variable to store currentAccrodian tab
var accordianContainerHeight;   //variable to store accordion container height
var storeAlertsLayerState;  //Variable to store current state of alerts

//function to add Alert layers
function AddAlertLayersOnMap() {
    for (var index in alertLayerInfo) {
        var alertLayer = new esri.layers.FeatureLayer(alertLayerInfo[index].LayerURL, {
            mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
            outFields: [alertLayerInfo[index].OutFields],
            id: alertLayerInfo[index].Key,
            displayOnPan: false,
            visible: alertLayerInfo[index].isLayerVisible
        });
        if (alertLayerInfo[index].hasDefinitionExpression) {
            if (alertLayerInfo[index].FilterDays) {
                var todayDate = new Date();
                var filterDate = todayDate.setDate(todayDate.getDate() - alertLayerInfo[index].FilterDays);
                filterDate = todayDate.getFullYear() + '/' + (todayDate.getMonth() + 1) + '/' + todayDate.getDate();
                alertLayer.setDefinitionExpression(dojo.string.substitute(alertLayerInfo[index].DefinitionExpression, [filterDate]));
            }
            else {
                alertLayer.setDefinitionExpression(alertLayerInfo[index].DefinitionExpression);
            }
        }
        map.addLayer(alertLayer);

        dojo.connect(alertLayer, "onClick", function (evtArgs) {    //on click handler for layer to show infowindow
            var layerIndex = GetAlertsIndex(this.id);
            var graphic = evtArgs.graphic;
            var mapPoint;
            if (graphic.geometry.type == "point") {
                mapPoint = graphic.geometry;
            }
            else {
                mapPoint = evtArgs.mapPoint;
            }
            ShowAlertsInfoWindow(alertLayerInfo[layerIndex].InfoWindowHeader, alertLayerInfo[layerIndex].InfoWindowFields, alertLayerInfo[layerIndex].InfoWindowSize, mapPoint, graphic.attributes);
        });

        dojo.connect(alertLayer, "onUpdateEnd", function (features) {
            var layerIndex = GetAlertsIndex(this.id);

            var accordionTable = dojo.byId(alertLayerInfo[layerIndex].Key).getElementsByTagName("table");   //check data is already populated
            if (accordionTable.length > 0) {
                return;
            }

            //checking first accordion content is populated
            if (alertLayerInfo[defaultAlertServicePanel].Key == this.id) {
                dojo.byId("divAccordianImage" + this.id).className = "accordionExpand";
                HideLoadingMessage();
            }

            RemoveChildren(dojo.byId(alertLayerInfo[layerIndex].Key + "Content"));  //Removing the existing data
            var layer = map.getLayer(this.id);
            AddLegendItem(layer, layerIndex, alertLayerInfo[layerIndex].isLayerVisible, "tableAlertsLegend");
            var table = document.createElement("table");
            var tbody = document.createElement("tbody");
            table.style.width = "100%";
            table.appendChild(tbody);
            for (var index in layer.graphics) {
                var graphic = layer.graphics[index];
                var tr = document.createElement("tr");
                tr.onmouseover = function () {  //functionality for mouse over
                    var rowIndex = this.rowIndex;
                    var graphic = layer.graphics[rowIndex]; //get the graphic from the list
                    if (graphic.geometry.type == "point") {     //if geometry is point
                        HighlightFeature(graphic.geometry, alertLayerInfo[layerIndex].RippleColor);
                    }
                    else {      //if geometry is not point
                        var shadowBorderColor = new dojo.Color(alertLayerInfo[layerIndex].RippleColor);
                        shadowBorderColor.a = 0.4;
                        var borderSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                                             new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                                             shadowBorderColor, 8), new dojo.Color([0, 0, 0, 0]));
                        var currentPrecientGraphicShadow = new esri.Graphic(graphic.geometry, borderSymbol, null, null);
                        map.getLayer(tempPolygonSelectLayerId).add(currentPrecientGraphicShadow);
                    }
                    this.className = "trRowHighlight";
                }
                tr.onmouseout = function () {   //function for mouse over
                    HideRipple();
                    map.getLayer(tempPolygonSelectLayerId).clear();
                    this.className = "trRowDefault";
                }
                tr.onclick = function () {  //function for row click event
                    map.infoWindow.hide();
                    var rowIndex = this.rowIndex;
                    var graphic = layer.graphics[rowIndex];
                    var mapPoint;
                    if (graphic.geometry.type == "point") {
                        mapPoint = graphic.geometry;
                        map.centerAndZoom(mapPoint, map._slider.maximum - 2);
                    }
                    else {
                        mapPoint = graphic.geometry.getExtent().getCenter();   //get the center of the polygon
                        if (!graphic.geometry.contains(mapPoint)) {       //check center is inside the polygon or take the first point of geometry
                            mapPoint = graphic.geometry.getPoint(0, 0);
                        }
                        map.setExtent(graphic.geometry.getExtent().expand(4));
                    }
                    //workaround for setting infowindow position
                    setTimeout(function () {
                        ShowAlertsInfoWindow(alertLayerInfo[layerIndex].InfoWindowHeader, alertLayerInfo[layerIndex].InfoWindowFields, alertLayerInfo[layerIndex].InfoWindowSize, mapPoint, graphic.attributes);
                    }, 1000);
                }
                tr.className = "trRowDefault";
                var td = document.createElement("td");
                td.className = "tdBottomRowSeperator";

                if (!alertLayerInfo[layerIndex].isDateConverted) {
                    //var attributes = graphic.attributes;
                    for (var i in graphic.attributes) {
                        if (!graphic.attributes[i]) {
                            graphic.attributes[i] = showNullValueAs;
                        }
                    }
                    var dateFields = alertLayerInfo[layerIndex].DateFields.split(",");
                    for (var j = 0; j < dateFields.length; j++) {   //check for date type attributes and format date
                        if (graphic.attributes[dateFields[j]]) {
                            var timeStamp = graphic.attributes[dateFields[j]];
                            var date = new js.date();
                            var utcMilliseconds = Number(timeStamp);

                            graphic.attributes[dateFields[j]] = date.utcTimestampFromMs(utcMilliseconds).toDateString();
                        }
                    }

                }

                td.innerHTML = dojo.string.substitute(alertLayerInfo[layerIndex].ListViewFormat, graphic.attributes);
                tr.appendChild(td);
                tbody.appendChild(tr);
            }
            alertLayerInfo[layerIndex].isDateConverted = true;
            dojo.byId(alertLayerInfo[layerIndex].Key + "Content").appendChild(table);
            CreateScrollbar(dojo.byId(alertLayerInfo[layerIndex].Key), dojo.byId(alertLayerInfo[layerIndex].Key + "Content"));
        });
    }
}

//function to create accordion control for Alert layers
function CreateAccordian(accordionContainer, layerInfo) {
    for (var index in layerInfo) {
        var divHeaderContainer = document.createElement("div");
        var divAccordionTitle = document.createElement("div");

        divAccordionTitle.className = "divAccordionTitle"
        divAccordionTitle.onselectstart = function () {
            return false;
        }
        divAccordionTitle.setAttribute("childContentId", layerInfo[index].Key);
        divAccordionTitle.onclick = function () {
            map.infoWindow.hide();
            ShowAccordianTab(this.getAttribute("childContentId"));
        }

        var headerTable = document.createElement("table");
        headerTable.cellSpacing = 0;
        headerTable.cellPadding = 0;
        headerTable.className = "tableAccordionHeader";
        var accordianTBody = document.createElement("tbody");
        headerTable.appendChild(accordianTBody);

        var tr = document.createElement("tr");
        var td = document.createElement("td");

        var divAccordian = document.createElement("div");
        divAccordian.className = "accordionCollapse";
        divAccordian.setAttribute("key", layerInfo[index].Key);
        divAccordian.id = "divAccordianImage" + layerInfo[index].Key;
        td.appendChild(divAccordian);
        td.style.width = "30px";
        td.align = "center";

        var td2 = document.createElement("td");
        td2.appendChild(document.createTextNode(layerInfo[index].DisplayText));

        td2.style.width = "85%";
        tr.appendChild(td);
        tr.appendChild(td2);
        accordianTBody.appendChild(tr);
        var td1 = document.createElement("td");
        var chkBox = CreateCheckBox("chk" + layerInfo[index].Key, layerInfo[index].Key, layerInfo[index].isLayerVisible)
        chkBox.onclick = function (e) {
            map.infoWindow.hide();  //hide infowindow if shown
            var divLegend = dojo.byId("divAlertsLegend");
            var legendRows = dojo.query('[layerID="' + this.value + '"]', divLegend);
            if (this.checked) {
                dojo.byId('divAlertsLegend').style.display = 'block';
                map.getLayer(this.value).show();
                legendRows[0].style.display = "block";
            }
            else {
                map.getLayer(this.value).hide();
                legendRows[0].style.display = "none";
                HideAccordianTab(this.value);
                var counter = 0;
                dojo.query('[layerID]', divLegend).forEach(function (node, index, arr) {
                    if (node.style.display == 'none') {
                        counter++;
                    }
                    if (counter == arr.length) {
                        dojo.byId('divAlertsLegend').style.display = 'none';
                    }
                });
            }

            //For cancelling event propagation
            e = (e) ? e : event;
            e.cancelBubble = true;
            if (e.stopPropagation) {
                e.stopPropagation();
            }
        }
        td1.appendChild(chkBox);
        chkBox.checked = layerInfo[index].isLayerVisible;

        td1.align = "center";
        tr.appendChild(td1);

        divAccordionTitle.appendChild(headerTable);
        divHeaderContainer.appendChild(divAccordionTitle);

        var divAccordionContent = document.createElement("div");
        divAccordionContent.className = "divAccordionContent";
        divAccordionContent.id = layerInfo[index].Key;

        var divAccordianScrollContent = document.createElement("div");
        divAccordianScrollContent.id = layerInfo[index].Key + "Content";
        divAccordianScrollContent.className = "scrollbar_content";

        accordionContainer.appendChild(divHeaderContainer);
        accordionContainer.appendChild(divAccordionContent);
        divAccordionContent.appendChild(divAccordianScrollContent);
    }
}

function ShowAccordianTab(accordianId) {
    var chkBox = dojo.byId('chk' + accordianId);
    if (!dojo.byId('chk' + accordianId).checked) {
        chkBox.checked = true;
        map.getLayer(accordianId).show();
        var divLegend = dojo.byId('divAlertsLegend');
        divLegend.style.display = 'block';
        var legendRows = dojo.query('[layerID="' + accordianId + '"]', divLegend);
        legendRows[0].style.display = "block";
    }

    if (currentAccordianTab == accordianId) {
        return;
    }
    var combinedAnimation;
    var openContent = dojo.animateProperty({ node: dojo.byId(accordianId), duration: 500, properties: { height: { end: accordianContainerHeight, unit: "px"}} });
    var closeContent = dojo.animateProperty({ node: dojo.byId(currentAccordianTab), duration: 500, properties: { height: { end: 0, unit: "px"}} });
    if (currentAccordianTab == "") {
        combinedAnimation = openContent;
        currentAccordianTab = accordianId;
        dojo.connect(combinedAnimation, "onEnd", function () {
            dojo.byId(currentAccordianTab + "Content").style.height = accordianContainerHeight + "px";
            CreateScrollbar(dojo.byId(currentAccordianTab), dojo.byId(currentAccordianTab + "Content"));
            dojo.byId("divAccordianImage" + currentAccordianTab).className = "accordionExpand";
        });
    }
    else {
        combinedAnimation = dojo.fx.combine([openContent, closeContent]);
        dojo.connect(combinedAnimation, "onEnd", function () {
            dojo.byId(currentAccordianTab).style.display = 'none';
            currentAccordianTab = accordianId;
            dojo.byId(currentAccordianTab + "Content").style.height = accordianContainerHeight + "px";
            CreateScrollbar(dojo.byId(currentAccordianTab), dojo.byId(currentAccordianTab + "Content"));
            dojo.byId("divAccordianImage" + currentAccordianTab).className = "accordionExpand";
        });
    }
    dojo.byId("divAccordianImage" + currentAccordianTab).className = "accordionCollapse";
    dojo.byId(accordianId).style.display = 'block';
    combinedAnimation.play();
}

//function to close accordion tab
function HideAccordianTab(accordianId) {
    var closeContent = dojo.animateProperty({ node: dojo.byId(accordianId), duration: 500, properties: { height: { end: 0, unit: "px"}} });
    dojo.byId("divAccordianImage" + accordianId).className = "accordionCollapse";
    closeContent.play();
    dojo.connect(closeContent, "onEnd", function () {
        dojo.byId(accordianId).style.display = 'none';
        if (currentAccordianTab == accordianId) {
            currentAccordianTab = "";
        }
    });
}

//function to set accordion container height
function SetAccordionContainerHeight(accordionContainerID) {
    //to calculate the accordion container height based on no of accordion tabs and available screen resolution.
    var tabHeaderHeight = dojo.coords(dojo.byId("divServiceTabContainer-header")).h;

    var arrayheights = [];
    dojo.query(".divInstructions", dojo.byId('divServiceTabContainer')).forEach(function (node, index, arr) {
        arrayheights.push(dojo.position(node).h);
    });

    var instructionHeight = Math.max.apply(null, arrayheights);

    var tabConainer = dojo.coords(dojo.byId("divLeftPanelBackground"));

    accordianContainerHeight = (tabConainer.h - (tabHeaderHeight + instructionHeight + tabConainer.t + (alertLayerInfo.length * 30))) - 25;
    if (accordianContainerHeight < 40) {    //Setting minimum height for accordion container
        accordianContainerHeight = 40;
    }
    if (accordionContainerID != "") {
        dojo.byId(accordionContainerID).style.height = accordianContainerHeight + "px";
        dojo.byId(accordionContainerID + "Content").style.height = accordianContainerHeight + "px";
    }
}

//function to return index of alerts layer info
function GetAlertsIndex(alertId) {
    for (var index in alertLayerInfo) {
        if (alertLayerInfo[index].Key == alertId) {
            return index;
        }
    }
}

//function to add legend item to table
function AddLegendItem(layer, layerIndex, isVisible) {
    var table = document.createElement("table");
    dojo.byId('divAlertsLegend').appendChild(table);
    table.style.color = "#fff";
    table.cellspacing = "0";
    table.cellpadding = "0";
    table.setAttribute("layerID", layer.id);
    if (!isVisible) {
        table.style.display = "none";
    }
    if (layer.geometryType == "esriGeometryPoint") {
        if (layer.renderer.infos) {
            for (var i = 0; i < layer.renderer.infos.length; i++) {
                var tr = table.insertRow(0);
                var td = document.createElement("td");
                var image = CreateImage(layer.renderer.infos[i].symbol.url, "", false, layer.renderer.infos[i].symbol.width, layer.renderer.infos[i].symbol.height);
                td.appendChild(image);
                td.vAlign = "middle";
                tr.appendChild(td);
                var td1 = document.createElement("td");
                td1.innerHTML = layer.renderer.infos[i].label;
                td1.vAlign = "middle";
                tr.appendChild(td1);
            }
        }
        else {
            var tr = table.insertRow(0);
            var td = document.createElement("td");
            var image = CreateImage(layer.renderer.symbol.url, "", false, layer.renderer.symbol.width, layer.renderer.symbol.height);
            td.appendChild(image);
            td.vAlign = "middle";
            tr.appendChild(td);
            var td1 = document.createElement("td");
            td1.innerHTML = alertLayerInfo[layerIndex].DisplayText;
            td1.vAlign = "middle";
            tr.appendChild(td1);
        }
    }
    else {
        var tr = table.insertRow(0); ;
        var td = document.createElement("td");
        var div = CreateDivElement(layer.renderer.symbol.color.toHex(), 20, 20, layer.renderer.symbol.outline.color.toHex());
        td.appendChild(div);
        td.vAlign = "middle";
        tr.appendChild(td);
        var td1 = document.createElement("td");
        td1.innerHTML = alertLayerInfo[layerIndex].DisplayText;
        td1.vAlign = "middle";
        tr.appendChild(td1);
    }
}

//function to create div element
function CreateDivElement(fillColor, width, height, borderColor) {
    var div = document.createElement("div");
    div.style.width = width + "px";
    div.style.height = height + "px";
    div.style.backgroundColor = fillColor;
    div.style.border = "2px solid " + borderColor;
    return div;
}

//function to show infowindow
function ShowAlertsInfoWindow(infoWindowTitle, infoWindowContent, infoWindowSize, mapPoint, attributes) {
    map.infoWindow.setTitle(dojo.string.substitute(infoWindowTitle, attributes));
    for (i in attributes) {
        if (attributes[i] == null)
            attributes[i] = showNullValueAs;
    }
    var infoWindowContent = CreateInfoWindowContent(dojo.string.substitute(infoWindowContent, attributes));
    map.infoWindow.setContent(infoWindowContent);

    var windowPoint = map.toScreen(mapPoint);
    infoWindowSize = infoWindowSize.split(",");
    map.infoWindow.resize(Number(infoWindowSize[0]), Number(infoWindowSize[1]));
    //var anchorPoint = GetInfoWindowAnchor(windowPoint, Number(infoWindowSize[0]));
    map.infoWindow.show(windowPoint, GetInfoWindowAnchor(windowPoint, Number(infoWindowSize[0])));

}

//function to create infowindow content
function CreateInfoWindowContent(infowindowContent) {
    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    infowindowContent = infowindowContent.split(",");
    for (var index in infowindowContent) {
        var data = infowindowContent[index].split(":");
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.innerHTML = data[0] + ":";
        var td1 = document.createElement("td");
        td1.innerHTML = data[1];
        tr.appendChild(td);
        tr.appendChild(td1);
        tbody.appendChild(tr);
    }

    return table;
}

//function to store Alert Layer States
function SaveAlertState() {
    dojo.byId('divAlertsLegend').style.display = 'none';
    storeAlertsLayerState = [];
    var chkBoxControls = dojo.query('input[type="checkbox"]', dojo.byId('divAccordianContainer'));
    for (var i = 0; i < chkBoxControls.length; i++) {
        storeAlertsLayerState[chkBoxControls[i].value] = chkBoxControls[i].checked;
        map.getLayer(chkBoxControls[i].value).hide();
    }
}

//function to restore Alert Layer State
function RestoreAlertLayers() {
    for (var key in storeAlertsLayerState) {
        if (storeAlertsLayerState[key]) {
            map.getLayer(key).show();
        }
    }
    dojo.byId('divAlertsLegend').style.display = 'block';
}