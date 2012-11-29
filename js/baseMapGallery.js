/** @license
 | Version 10.1.1
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
function CreateBaseMapComponent() {

    for (var i = 0; i < baseMapLayerCollection.length; i++) {
        map.addLayer(CreateBaseMapLayer(baseMapLayerCollection[i].MapURL, baseMapLayerCollection[i].Key, (i == 0) ? true : false));
    }

    if (baseMapLayerCollection.length == 1) {
        dojo.byId('divBaseMapTitleContainer').style.display = 'none';
        return;
    }

    var layerList = dojo.byId('layerList');

    for (var i = 0; i < Math.ceil(baseMapLayerCollection.length / 2); i++) {
        var previewDataRow = document.createElement("tr");

        if (baseMapLayerCollection[(i * 2) + 0]) {
            var layerInfo = baseMapLayerCollection[(i * 2) + 0];
            layerList.appendChild(CreateBaseMapElement(layerInfo));
        }

        if (baseMapLayerCollection[(i * 2) + 1]) {
            var layerInfo = baseMapLayerCollection[(i * 2) + 1];
            layerList.appendChild(CreateBaseMapElement(layerInfo));
        }
    }
    if (!(dojo.isIE < 9)) {
        dojo.addClass(dojo.byId("imgThumbNail" + baseMapLayerCollection[0].Key), "selectedBaseMap");
        if (dojo.isIE) {
            dojo.addClass(dojo.byId("imgThumbNail" + baseMapLayerCollection[0].Key), "selectedBaseMap");
            dojo.byId("imgThumbNail" + baseMapLayerCollection[0].Key).style.marginTop = "-5px";
            dojo.byId("imgThumbNail" + baseMapLayerCollection[0].Key).style.marginLeft = "-5px";
            dojo.byId("spanBaseMapText" + baseMapLayerCollection[0].Key).style.marginTop = "5px";
        }
    }
}

function CreateBaseMapElement(baseMapLayerInfo) {
    var divContainer = document.createElement("div");
    divContainer.className = "baseMapContainerNode";
    var imgThumbnail = document.createElement("img");
    imgThumbnail.src = baseMapLayerInfo.ThumbnailSource;
    imgThumbnail.className = "basemapThumbnail";
    imgThumbnail.id = "imgThumbNail" + baseMapLayerInfo.Key;
    imgThumbnail.setAttribute("layerId", baseMapLayerInfo.Key);
    imgThumbnail.onclick = function () {
        ChangeBaseMap(this);
    };
    var spanBaseMapText = document.createElement("span");
    var spanBreak = document.createElement("br");
    spanBaseMapText.className = "basemapLabel";
    spanBaseMapText.id = "spanBaseMapText" + baseMapLayerInfo.Key;
    spanBaseMapText.innerHTML = baseMapLayerInfo.Name;
    divContainer.appendChild(imgThumbnail);
    divContainer.appendChild(spanBreak);
    divContainer.appendChild(spanBaseMapText);
    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) { //test for MSIE x.x;

        if (dojo.isIE == 7) {
            divContainer.style.paddingBottom = "10px";
        }
    }
    return divContainer;


}

function ChangeBaseMap(spanControl) {
    dijit.byId('imgBaseMap').attr("checked", false);

    HideMapLayers();
    var key = spanControl.getAttribute('layerId');

    for (var i = 0; i < baseMapLayerCollection.length; i++) {
        dojo.removeClass(dojo.byId("imgThumbNail" + baseMapLayerCollection[i].Key), "selectedBaseMap");
        if (dojo.isIE) {
            dojo.byId("imgThumbNail" + baseMapLayerCollection[i].Key).style.marginTop = "0px";
            dojo.byId("imgThumbNail" + baseMapLayerCollection[i].Key).style.marginLeft = "0px";
            dojo.byId("spanBaseMapText" + baseMapLayerCollection[i].Key).style.marginTop = "0px";
        }
        if (baseMapLayerCollection[i].Key == key) {
            if (!(dojo.isIE < 9)) {
                dojo.addClass(dojo.byId("imgThumbNail" + baseMapLayerCollection[i].Key), "selectedBaseMap");
                if (dojo.isIE) {
                    dojo.byId("imgThumbNail" + baseMapLayerCollection[i].Key).style.marginTop = "-5px";
                    dojo.byId("imgThumbNail" + baseMapLayerCollection[i].Key).style.marginLeft = "-5px";
                    dojo.byId("spanBaseMapText" + baseMapLayerCollection[i].Key).style.marginTop = "5px";
                }
            }
            var layer = map.getLayer(baseMapLayerCollection[i].Key);
            ShowHideBaseMapComponent();
            layer.show();
        }
    }
}

function CreateBaseMapLayer(layerURL, layerId, isVisible) {
    var layer = new esri.layers.ArcGISTiledMapServiceLayer(layerURL, { id: layerId, visible: isVisible });
    return layer;
}

function HideMapLayers() {
    for (var i = 0; i < baseMapLayerCollection.length; i++) {
        var layer = map.getLayer(baseMapLayerCollection[i].Key);
        if (layer) {
            layer.hide();
        }
    }
}

function ShowHideBaseMapComponent() {
    var node = dojo.byId('divBaseMapTitleContainer');
    dijit.byId('imgGPSButton').attr("checked", false);
    dojo.byId('imgGPS').src = "images/gps.png";
    var appNode = dojo.byId('divAppContainer');
    if (dojo.coords(appNode).h > 0) {
        dijit.byId('imgapplink').attr("checked", false);
        WipeOutControl(appNode, 500);
    }
    if (dojo.coords(dojo.byId('divAddressContainer')).h > 0) {
        WipeOutControl(dojo.byId('divAddressContainer'), 500);
    }

    if (dojo.coords(node).h > 0) {
        WipeOutControl(node, 500);
    }
    else {
        WipeInControl(node, 500);
    }
}
