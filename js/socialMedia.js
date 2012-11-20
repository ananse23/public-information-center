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
var arrFeeds = [];

//function to create socialmedia items
function CreateSocialMediaItems() {
    var tableSocialMedia = dojo.byId('tableSocialServiceMedia');
    for (var index in socialMediaInfo) {
        CreateSocialMediaContent(tableSocialMedia, index);
    }
}

function CreateSocialMediaContent(tableSocialMedia, index) {
    var tr = tableSocialMedia.insertRow(index);
    var td1 = document.createElement("td");
    var td2 = document.createElement("td");
    var td3 = document.createElement("td");

    var chkBox = CreateCheckBox("chk" + socialMediaInfo[index].Key, socialMediaInfo[index].DisplayText, false)
    chkBox.onclick = function (e) {
        map.infoWindow.hide();
        if (this.checked) {
            var socialMediaIndex = GetSocialMediaLayerIndex(this.value);
            td3.style.cursor = "pointer";
            arrFeeds.push(this.value);
            dojo.byId('spanLoadingMessage').innerHTML = "Fetching feeds: " + arrFeeds.join(",");
            dojo.byId('tableSocialMediaStatus').style.display = "block";
            if (socialMediaInfo[socialMediaIndex].requireGeometry) {
                var outSR = new esri.SpatialReference({ wkid: 4326 });
                geometryService.project([map.extent.getCenter()], outSR, function (points) {
                    var projectedPoint = points[0];
                    FetchSocialMediaFeed(projectedPoint, socialMediaIndex);
                });
            }
            else {
                FetchSocialMediaFeed(null, socialMediaIndex);
            }
        }
        else {
            var i = ElementIndexOf(arrFeeds, this.value);
            if (i != -1) arrFeeds.splice(i, 1);
            if (arrFeeds.length > 0) {
                dojo.byId('spanLoadingMessage').innerHTML = "Fetching feeds: " + arrFeeds.join(",");
                dojo.byId('tableSocialMediaStatus').style.display = "block";
            }
            else {
                dojo.byId('tableSocialMediaStatus').style.display = "none";
                td3.style.cursor = "default";
            }
            map.getLayer(socialMediaInfo[index].Key).hide();
            map.getLayer(socialMediaInfo[index].Key).clear();
            dojo.byId("span" + socialMediaInfo[index].Key).innerHTML = "";
        }
    }
    var mediaImage = CreateImage(socialMediaInfo[index].imageURL, '', false, 30, 30);
    td1.appendChild(chkBox);
    td2.appendChild(mediaImage);
    var spanMediaCount = document.createElement("span");
    spanMediaCount.id = "span" + socialMediaInfo[index].Key;
    td3.innerHTML = dojo.string.substitute(socialMediaInfo[index].mediaDetail, [socialMediaInfo[index].searchTag]);
    td3.appendChild(spanMediaCount);
    td3.align = "left";
    td3.style.textDecoration = "underline";

    td3.id = "td" + socialMediaInfo[index].Key;

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);

    CreateGraphicsLayer(socialMediaInfo[index].Key, socialMediaInfo[index].DisplayText);
}

//function to create graphics layer
function CreateGraphicsLayer(id, value) {
    var glayer = new esri.layers.GraphicsLayer();
    glayer.id = id;
    map.addLayer(glayer);
    glayer.hide();

    dojo.connect(glayer, "onClick", function (evt) {
        var layerIndex = GetSocialMediaLayerIndex(value);
        map.infoWindow.setTitle(evt.graphic.attributes.TITLE);
        var infoWindowSize = socialMediaInfo[layerIndex].InfoWindowSize.split(",");
        map.infoWindow.resize(Number(infoWindowSize[0]), Number(infoWindowSize[1]));
        if (socialMediaInfo[layerIndex].CheckHyperLinks) {
            map.infoWindow.setContent(replaceURLWithLinks(dojo.string.substitute(socialMediaInfo[layerIndex].InfoWindowTemplate, evt.graphic.attributes)));
        }
        else {
            map.infoWindow.setContent(dojo.string.substitute(socialMediaInfo[layerIndex].InfoWindowTemplate, evt.graphic.attributes));
        }
        map.infoWindow.show(evt.screenPoint, GetInfoWindowAnchor(evt.screenPoint, Number(infoWindowSize[0])));
    });
}

//function to get index for selected layer
function GetSocialMediaLayerIndex(value) {
    for (var index in socialMediaInfo) {
        if (socialMediaInfo[index].DisplayText == value) {
            return index;
        }
    }
}

//function to hide and clear social media layers
function ClearHideSocialMediaLayers() {
    for (var index in socialMediaInfo) {
        dojo.byId("span" + socialMediaInfo[index].Key).innerHTML = "";
        dojo.byId("chk" + socialMediaInfo[index].Key).checked = false;
        map.getLayer(socialMediaInfo[index].Key).clear();
        map.getLayer(socialMediaInfo[index].Key).hide();
    }
}

//function to update social media feeds
function UpdateSocialMediaFeeds(ctl) {
    map.infoWindow.hide();
    for (var i = 0; i < socialMediaInfo.length; i++) {
        if (dojo.byId("chk" + socialMediaInfo[i].Key).checked) {
            if (dojo.indexOf(arrFeeds, dojo.byId("chk" + socialMediaInfo[i].Key).value) == -1) {
                arrFeeds.push(dojo.byId("chk" + socialMediaInfo[i].Key).value);
            }
            dojo.byId('spanLoadingMessage').innerHTML = "Fetching feeds: " + arrFeeds.join(",");
            dojo.byId('tableSocialMediaStatus').style.display = "block";
            ReloadSocialMediaFeeds(i);
        }
    }
}

//function to refresh fetch social media feeds
function ReloadSocialMediaFeeds(index) {
    dojo.byId('rbShowAllFeeds').checked;
    if (socialMediaInfo[index].requireGeometry) {
        var outSR = new esri.SpatialReference({ wkid: 4326 });
        geometryService.project([map.extent.getCenter()], outSR, function (points) {
            var projectedPoint = points[0];
            FetchSocialMediaFeed(projectedPoint, index);
        });
    }
    else {
        FetchSocialMediaFeed(null, index);
    }
}

//function to fetch SocialMedia feeds
function FetchSocialMediaFeed(projectedPoint, socialMediaIndex) {

    map.getLayer(socialMediaInfo[socialMediaIndex].Key).clear();
    map.getLayer(socialMediaInfo[socialMediaIndex].Key).show();

    if (socialMediaInfo[socialMediaIndex].UseUTCDate) {
        if (dojo.byId('rbShowAllFeeds').checked) {
            socialMediaAttributes["TIME"] = GetUTCDate(socialMediaInfo[socialMediaIndex].MonthRangeDays, socialMediaInfo[socialMediaIndex].DateFormat);
        }
        else {
            socialMediaAttributes["TIME"] = GetUTCDate(1, socialMediaInfo[socialMediaIndex].DateFormat);
        }
    }
    else {
        if (dojo.byId('rbShowAllFeeds').checked) {
            socialMediaAttributes["TIME"] = socialMediaInfo[socialMediaIndex].MonthRangeKey;
        }
        else {
            socialMediaAttributes["TIME"] = socialMediaInfo[socialMediaIndex].DayRangeKey;
        }
    }
    socialMediaAttributes["SEARCHTAG"] = socialMediaInfo[socialMediaIndex].searchTag;
    if (projectedPoint) {
        socialMediaAttributes["POINTX"] = Number(projectedPoint.x);
        socialMediaAttributes["POINTY"] = Number(projectedPoint.y);
    }

    var requestURL = dojo.string.substitute(socialMediaInfo[socialMediaIndex].FeedURL, socialMediaAttributes);

    esri.request({
        url: requestURL,
        callbackParamName: socialMediaInfo[socialMediaIndex].CallBackParamName,
        load: function (results) {
            var items = socialMediaInfo[socialMediaIndex].FeedAttribute.split(".");
            var data = results;

            var graphicAttributes = [];
            var graphicCollection = new esri.geometry.Multipoint(new esri.SpatialReference({ wkid: 4326 }));

            for (var i = 0; i < items.length; i++) {
                data = data[items[i]];
            }
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    var title = data[i];
                    var content = data[i];
                    var point = data[i];

                    if (socialMediaInfo[socialMediaIndex].CheckValidFeed) {
                        if (!title[socialMediaInfo[socialMediaIndex].CheckValidFeed]) {
                            continue;
                        }
                    }

                    if (socialMediaInfo[socialMediaIndex].hasCustomFeedSource) {
                        content = dojo.string.substitute(socialMediaInfo[socialMediaIndex].FeedSource, data[i]);
                    }
                    else {
                        attr = socialMediaInfo[socialMediaIndex].FeedSource.split(".");
                        for (var x = 0; x < attr.length; x++) {
                            content = content[attr[x]];
                        }
                    }

                    attr = socialMediaInfo[socialMediaIndex].FeedTitle.split(".");
                    for (var x = 0; x < attr.length; x++) {
                        title = title[attr[x]];
                    }

                    if (socialMediaInfo[socialMediaIndex].FeedLocationSplit) {
                        var attr = socialMediaInfo[socialMediaIndex].FeedLocation.split(".");
                        for (var x = 0; x < attr.length; x++) {
                            point = point[attr[x]];
                        }
                        if (!point) {
                            continue;
                        }
                        point = point.split(socialMediaInfo[socialMediaIndex].FeedLocationSplit);
                        if (point.length == 2) {
                            var lat = point[1].replace(/[^0-9\\.\-]/g, '').replace(/^(\d*\.\d*)\..*$/, "$1");
                            var long = point[0].replace(/[^0-9\\.\-]/g, '').replace(/^(\d*\.\d*)\..*$/, "$1");
                            if (!(isNaN(lat) || isNaN(long)) && lat != "" && long != "") {
                                var point = new esri.geometry.Point(Number(lat), Number(long), new esri.SpatialReference({ wkid: 4326 }));
                                graphicCollection.addPoint(point);
                                graphicAttributes.push({
                                    CONTENT: content,
                                    TITLE: title
                                });
                            }
                        }
                    }
                    else {
                        var lat = data[i];
                        var long = data[i];

                        var temp = socialMediaInfo[socialMediaIndex].FeedLatitude.split(".");
                        for (var x = 0; x < temp.length; x++) {
                            lat = lat[temp[x]];
                        }

                        temp = socialMediaInfo[socialMediaIndex].FeedLongitude.split(".");
                        for (var x = 0; x < temp.length; x++) {
                            long = long[temp[x]];
                        }

                        var point = new esri.geometry.Point(Number(long), Number(lat), new esri.SpatialReference({ wkid: 4326 }));
                        graphicCollection.addPoint(point);
                        graphicAttributes.push({
                            CONTENT: content,
                            TITLE: title
                        });
                    }
                }
            }
            var symbol = new esri.symbol.PictureMarkerSymbol(socialMediaInfo[socialMediaIndex].imageURL, 35, 35);
            var multiPoint = new esri.geometry.Multipoint(map.spatialReference);
            esriConfig.defaults.io.alwaysUseProxy = true;
            geometryService.project([graphicCollection], map.spatialReference, function (projectedPoints) {
                var pointCounter = 0;
                if (dojo.byId("chk" + socialMediaInfo[socialMediaIndex].Key).checked) {
                    for (i = 0; i < projectedPoints[0].points.length; i++) {
                        var point = projectedPoints[0].getPoint(i);
                        if (map.getLayer('streetMap').fullExtent.contains(point)) {
                            pointCounter++;
                            var graphic = new esri.Graphic(projectedPoints[0].getPoint(i), symbol, graphicAttributes[i], null);
                            map.getLayer(socialMediaInfo[socialMediaIndex].Key).add(graphic);
                            multiPoint.addPoint(projectedPoints[0].getPoint(i));
                        }
                    }
                    dojo.byId("span" + socialMediaInfo[socialMediaIndex].Key).innerHTML = "&nbsp;(" + pointCounter + ")";
                }
                dojo.byId("td" + socialMediaInfo[socialMediaIndex].Key).onclick = function () {
                    if (map.getLayer(socialMediaInfo[socialMediaIndex].Key).graphics.length > 0) {
                        if (multiPoint.getExtent()) {
                            map.setExtent(multiPoint.getExtent().expand(2));
                        }
                    }
                }
                var index = ElementIndexOf(arrFeeds, socialMediaInfo[socialMediaIndex].DisplayText);
                if (index != -1) arrFeeds.splice(index, 1);
                if (arrFeeds.length > 0) {
                    dojo.byId('spanLoadingMessage').innerHTML = "Fetching feeds: " + arrFeeds.join(",");
                    dojo.byId('tableSocialMediaStatus').style.display = "block";
                }
                else {
                    dojo.byId('tableSocialMediaStatus').style.display = "none";
                }
            });
            esriConfig.defaults.io.alwaysUseProxy = false;
        },
        error: function (error) {
            var index = ElementIndexOf(arrFeeds, socialMediaInfo[socialMediaIndex].DisplayText);
            if (index != -1) arrFeeds.splice(index, 1);
            if (arrFeeds.length > 0) {
                dojo.byId('spanLoadingMessage').innerHTML = "Fetching feeds: " + arrFeeds.join(",");
                dojo.byId('tableSocialMediaStatus').style.display = "block";
            }
            else {
                dojo.byId('tableSocialMediaStatus').style.display = "none";


            }
            dojo.byId("span" + socialMediaInfo[socialMediaIndex].Key).innerHTML = "";
            if (dojo.byId('chk' + socialMediaInfo[socialMediaIndex].Key).checked) {
                alert("An error occured while fetching " + socialMediaInfo[socialMediaIndex].Key + " feed.");
            }
        }
    });
}

function replaceURLWithLinks(stuff) {
    var reg_exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;
    return stuff.replace(reg_exp, "<a href='$1' target='_blank'>$1</a>");
}