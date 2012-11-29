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
//Function to switch to youtube,twitter,email
function ToggleApplication() {

    var bmapNode = dojo.byId('divBaseMapTitleContainer');
    dijit.byId('imgGPSButton').attr("checked", false);
    dojo.byId('imgGPS').src = "images/gps.png";
    if (dojo.coords(bmapNode).h > 0) {
        WipeOutControl(bmapNode, 500);
        dijit.byId('imgBaseMap').attr("checked", false);
    }

    if (dojo.coords(dojo.byId('divAddressContainer')).h > 0) {
        WipeOutControl(dojo.byId('divAddressContainer'), 500);
    }
    var node = dojo.byId('divAppContainer');

    if (node.style.display == 'none') {
        WipeInControl(node, 500);
    }
    else {
        WipeOutControl(node, 500);
    }
}

//Function to show help file
function ShowHelp() {
    dijit.byId('imgGPSButton').attr("checked", false);
    dojo.byId('imgGPS').src = "images/gps.png";
    window.open(helpFileURL, "helpwindow");
    dijit.byId('imgHelp').attr("checked", false);
}

//Dojo function to animate address container
function WipeInControl(node, duration) {
    dojo.fx.wipeIn({
        node: node,
        duration: duration
    }).play();
}

//Dojo function to animate address container
function WipeOutControl(node, duration) {
    dojo.fx.wipeOut({
        node: node,
        duration: duration
    }).play();
}

//Function triggered for creating image
function CreateImage(imageSrc, title, isCursorPointer, imageWidth, imageHeight) {
    var imgLocate = document.createElement("img");
    imgLocate.style.width = imageWidth + 'px';
    imgLocate.style.height = imageHeight + 'px';
    if (isCursorPointer) {
        imgLocate.style.cursor = 'pointer';
    }
    imgLocate.src = imageSrc;
    imgLocate.title = title;
    return imgLocate;
}

//function to create rating control
function CreateRatingControl(readonly, ctlId, intitalValue, numStars) {
    var ratingCtl = document.createElement("ul");
    ratingCtl.setAttribute("readonly", readonly);
    ratingCtl.id = ctlId;
    ratingCtl.setAttribute("value", intitalValue);
    ratingCtl.setAttribute("numStars", numStars);
    ratingCtl.style.padding = 0;
    ratingCtl.style.margin = 0;
    return ratingCtl;
}

//Function triggered for animating address container
function AnimateAdvanceSearch() {
    var node = dojo.byId('divAddressContainer');
    if (node.style.display == "none") {
        WipeInControl(node, 0, 500);
    }
}

//Function for refreshing address container div
function RemoveChildren(parentNode) {
    while (parentNode.hasChildNodes()) {
        parentNode.removeChild(parentNode.lastChild);
    }
}

//Function for Clearing graphics on map
function ClearGraphics() {
    if (map.getLayer(tempPointLayer)) {
        map.getLayer(tempPointLayer).clear();
    }
    if (map.getLayer(tempServiceRequestLayerId)) {
        map.getLayer(tempServiceRequestLayerId).clear();
    }
}

//Function to open login page for flickr,tweet,email
function ShareLink(site) {
    var url = window.location.href;
    var mapExtent = map.extent;
    url += "?extent=" + mapExtent.xmin + "," + mapExtent.ymin + "," + mapExtent.xmax + "," + mapExtent.ymax;
    url = dojo.string.substitute(tinyURLServiceURL.URL, [url]);

    dojo.io.script.get({
        url: url,
        callbackParamName: "callback",
        load: function (data) {
            var tinyUrl = data;
            var attr = tinyURLServiceURL.ResponseAttribute.split(".");
            for (var x = 0; x < attr.length; x++) {
                tinyUrl = tinyUrl[attr[x]];
            }
            switch (site) {
                case "facebook":
                    window.open(dojo.string.substitute(tinyURLServiceURL.FacebookShareURL, [tinyUrl]));
                    break;
                case "twitter":
                    window.open(dojo.string.substitute(tinyURLServiceURL.TwitterShareURL, [tinyUrl]));
                    break;
                case "mail":
                    parent.location = dojo.string.substitute(tinyURLServiceURL.MailShare, [tinyUrl]);
                    //window.open(dojo.string.substitute(tinyURLServiceURL.MailShare, [tinyUrl]));
                    break;
            }
        },
        error: function (error) {
            //            alert(error);
            ShowDialog('Error', messages.getElementsByTagName("tinyURLEngine")[0].childNodes[0].nodeValue);
        }
    });
}

//Function for displaying Standby text
function ShowLoadingMessage(loadingMessage) {
    dojo.byId('divLoadingIndicator').style.display = 'block';
    dojo.byId('loadingMessage').innerHTML = loadingMessage;
}


//Function for hiding Standby text
function HideLoadingMessage() {
    dojo.byId('divLoadingIndicator').style.display = 'none';
}

//Function for showing Alert messages
function ShowDialog(title, message) {
    dojo.byId('divMessage').innerHTML = message;
    var dialog = dijit.byId('dialogAlertMessage');
    dialog.titleNode.innerHTML = title;
    dialog.show();
    dojo.byId('divOKButton').focus();
}

//Function for hiding Alert messages
function CloseDialog() {
    dijit.byId('dialogAlertMessage').hide();
}



//function to create tab container
function CreateTabContainer(containerId) {
    var i, tabContainer, tabContents, title, tabElement;
    var divElement, ulElement, liElement, tabLink, linkText;

    tabContainer = dojo.byId(containerId);

    tabContents = dojo.query(".tabContent", tabContainer);
    if (tabContents.length == 0)
        return;

    divElement = document.createElement("div");
    divElement.className = 'tab-header'
    divElement.id = containerId + '-header';
    ulElement = document.createElement("ul");
    ulElement.className = 'tab-list'

    tabContainer.insertBefore(divElement, tabContents[0]);
    divElement.appendChild(ulElement);

    for (i = 0; i < tabContents.length; i++) {
        title = tabContents[i].getAttribute("header");

        // create the tabs as an unsigned list
        liElement = document.createElement("li");
        liElement.id = containerId + '-tab-' + i;

        tabLink = document.createElement("a");
        linkText = document.createTextNode(title);

        tabLink.className = "tab-item";

        tabLink.setAttribute("href", "javascript://");
        tabLink.setAttribute("title", tabContents[i].getAttribute("headerTitle"));
        tabLink.onclick = new Function("ActivateTab('" + containerId + "', " + i + ", " + true + ")");

        ulElement.appendChild(liElement);
        liElement.appendChild(tabLink);
        tabLink.appendChild(linkText);
    }
}

//function to set active tab
function ActivateTab(containerId, activeTabIndex, isMapInitialized) {
    CloseMapTip();
    var i, tabContainer, tabContents;

    tabContainer = document.getElementById(containerId);

    tabContents = dojo.query(".tabContent", tabContainer);
    if (tabContents[activeTabIndex].style.display == "block") {
        return;
    }
    dojo.disconnect(mapClickHandle);
    if (tabContents.length > 0) {
        for (i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
        }

        tabContents[activeTabIndex].style.display = "block";

        tabList = document.getElementById(containerId + '-list');
        tabs = dojo.query(".tab-item", tabContainer);
        if (tabs.length > 0) {
            for (i = 0; i < tabs.length; i++) {
                tabs[i].className = "tab-item";
            }

            tabs[activeTabIndex].className = "tab-item tab-active";
            tabs[activeTabIndex].blur();
        }
    }

    if (isMapInitialized) {
        map.infoWindow.hide();
        map.getLayer(tempPointLayer).clear();
        //To store the current state of layers info and populate it when clicked on Alerts tab
        if (activeTabIndex == 0) {
            map.getLayer(serviceRequestLayerInfo.Key).hide();

            dojo.byId('divAlertsLegend').style.display = 'block';

            dojo.byId('divServiceRequestLegend').style.display = "none";
            map.getLayer(tempServiceRequestLayerId).clear();
            map.setMapCursor('default');
            RestoreAlertLayers();
            ClearHideSocialMediaLayers();
            ToggleServiceRequestLayer(false);

            var counter = 0;
            dojo.query('[layerID]', dojo.byId("divAlertsLegend")).forEach(function (node, index, arr) {
                if (node.style.display == 'none') {
                    counter++;
                }
                if (counter == arr.length) {
                    dojo.byId('divAlertsLegend').style.display = 'none';
                }
            });

            var selectedTab = dojo.query(".accordionExpand", dojo.byId('divAccordianContainer'));
            if (selectedTab.length > 0) {
                var id = selectedTab[0].getAttribute("key");
                CreateScrollbar(dojo.byId(id), dojo.byId(id + "Content"));
            }
        }
        else if (activeTabIndex == 1) {
            mapClickHandle = dojo.connect(map, "onClick", function (evt) {
                map.getLayer(tempServiceRequestLayerId).clear();

                ShowLoadingMessage('Locating...');
                var locator = new esri.tasks.Locator(locatorURL);
                locator.locationToAddress(evt.mapPoint, 100);
                dojo.connect(locator, "onLocationToAddressComplete", function (candidate) {
                    if (candidate.address) {
                        var symbol = new esri.symbol.PictureMarkerSymbol(serviceRequestSymbolURL, 22, 22);
                        var attr = [];
                        if (candidate.address.Loc_name == "US_Zipcode") {
                            attr = { Address: candidate.address.Zip };
                        }
                        else {
                            var address = [];
                            for (var att in locatorParams) {
                                address.push(candidate.address[locatorParams[att]]);
                            }
                            attr = { Address: address.join(',') };
                        }
                        var graphic = new esri.Graphic(evt.mapPoint, symbol, attr, null);
                        map.getLayer(tempServiceRequestLayerId).add(graphic);
                        HideLoadingMessage();
                    }
                });
            });
            ClearHideSocialMediaLayers();
            ToggleServiceRequestLayer(true);
            ResetRequestValues();
            SaveAlertState();
        }
        else {
            map.getLayer(serviceRequestLayerInfo.Key).hide();

            dojo.byId('divAlertsLegend').style.display = 'block';
            dojo.byId('divServiceRequestLegend').style.display = "none";
            map.getLayer(tempServiceRequestLayerId).clear();
            //dojo.disconnect(mapClickHandle);
            map.setMapCursor('default');
            ToggleServiceRequestLayer(false);
            SaveAlertState();
        }
    }

}

//function to slide left paenl
function AnimateDetailsView() {
    var node = dojo.byId('divLeftPanelBackground');
    if (dojo.coords(node).l == 0) {

        var divBackground = dojo.fx.slideTo({ node: node, duration: 1000, properties: { left: { end: -400, unit: "px"}} });
        var divContent = dojo.fx.slideTo({ node: dojo.byId('divServiceDetailPanel'), duration: 1000, properties: { left: { end: -400, unit: "px"}} });
        var imageToggle = dojo.fx.slideTo({ node: dojo.byId('divToggleDetail'), duration: 1000, properties: { left: { end: 0, unit: "px"}} });
        var esriLogo = dojo.fx.slideTo({ node: dojo.query('.esriLogo', dojo.byId('map'))[0], duration: 1000, properties: { left: { end: 15, unit: "px"}} });
        var mapSlider = dojo.fx.slideTo({ node: dojo.byId('map_zoom_slider'), duration: 1000, properties: { left: { end: 15, unit: "px"}} });
        var combinedAnimation = dojo.fx.combine([divBackground, divContent, imageToggle, esriLogo, mapSlider]);
        dojo.connect(combinedAnimation, "onEnd", function () {
            dojo.byId('divToggleDetail').className = "divToggleDetailCollapse";
            dojo.byId('divToggleDetail').title = "Show Panel";

        });
        combinedAnimation.play();
    }
    else {
        var divBackground = dojo.fx.slideTo({ node: node, duration: 1000, properties: { left: { end: 0, unit: "px"}} });
        var divContent = dojo.fx.slideTo({ node: dojo.byId('divServiceDetailPanel'), duration: 1000, properties: { left: { end: 0, unit: "px"}} });
        var imageToggle = dojo.fx.slideTo({ node: dojo.byId('divToggleDetail'), duration: 1000, properties: { left: { end: 400, unit: "px"}} });
        var esriLogo = dojo.fx.slideTo({ node: dojo.query('.esriLogo', dojo.byId('map'))[0], duration: 1000, properties: { left: { end: 415, unit: "px"}} });
        var mapSlider = dojo.fx.slideTo({ node: dojo.byId('map_zoom_slider'), duration: 1000, properties: { left: { end: 415, unit: "px"}} });
        var combinedAnimation = dojo.fx.combine([divBackground, divContent, imageToggle, esriLogo, mapSlider]);
        dojo.connect(combinedAnimation, "onEnd", function () {
            dojo.byId('divToggleDetail').className = "divToggleDetailExpand";
            dojo.byId('divToggleDetail').title = "Hide Panel";
        });
        combinedAnimation.play();
    }
}

//function to highlight layer
function HighlightFeature(mapPoint, highlightColor) {
    HideRipple();
    var layer = map.getLayer(tempGlowLayerId);
    var i = 20;
    var flag = true;
    var intervalID = setInterval(function () {
        layer.clear();
        if (i == 20) {
            flag = false;
        }
        else if (i == 16) {
            flag = true;
        }
        var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, (i - 1) * 2.5,
                           new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                           new dojo.Color(highlightColor), 5),
                           new dojo.Color([0, 0, 0, 0]));

        var graphic = new esri.Graphic(mapPoint, symbol, null, null);
        layer.add(graphic);
        if (flag) i++;
        else i--;
    }, 100);
    intervalIDs[intervalIDs.length] = intervalID;
}

//Hide the ripple
function HideRipple() {
    ClearAllIntervals();
    map.getLayer(tempGlowLayerId).clear();
}

//Clears all the intervals
function ClearAllIntervals() {
    for (var i = 0; i < intervalIDs.length; i++) {
        clearTimeout(intervalIDs[i]);
        delete intervalIDs[i];
    }
    intervalIDs.length = 0;
}

//function to show error message span
function ShowSpanErrorMessage(controlId, message) {
    dojo.byId(controlId).style.display = "block";
    dojo.byId(controlId).innerHTML = message;
}

//Function for validating Email in comments tab
function CheckMailFormat(emailValue) {
    //    var pattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
    //    var pattern = /^(?:\w+\.?)*\w+@(?:\w+\.)+\w+$/;
    var pattern = /^([a-zA-Z][a-zA-Z0-9\_\-\.]*\@[a-zA-Z0-9\-]*\.[a-zA-Z]{2,4})?$/i
    if (pattern.test(emailValue)) {
        return true;
    } else {
        return false;
    }
}

//function to validate name
function IsName(name) {
    //    var namePattern = /^[A-Za-z\.\-\, ]{1,150}$/;
    var namePattern = /^[A-Za-z\.\-\-', ]{3,100}$/;
    if (namePattern.test(name)) {
        return true;
    } else {
        return false;
    }
}

//function to validate US ZIP code
function isValidZipCode(value) {
    var re = /^\d{5}([\-]\d{4})?$/;
    return re.test(value);
}

//function to trim string
String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, ''); }

//Function to append ... for a string
String.prototype.trimString = function (len) {
    return (this.length > len) ? this.substring(0, len) + "..." : this;
}

//function to create custom scroll bar
function CreateScrollbar(container, content) {
    var yMax;
    var pxLeft, pxTop, xCoord, yCoord;
    var scrollbar_track;
    var isHandleClicked = false;
    this.container = container;
    this.content = content;

    if (dojo.byId(container.id + 'scrollbar_track')) {
        RemoveChildren(dojo.byId(container.id + 'scrollbar_track'));
        container.removeChild(dojo.byId(container.id + 'scrollbar_track'));
    }
    if (!dojo.byId(container.id + 'scrollbar_track')) {
        scrollbar_track = document.createElement('div');
        scrollbar_track.id = container.id + "scrollbar_track";
        scrollbar_track.className = "scrollbar_track";
    }
    else {
        scrollbar_track = dojo.byId(container.id + 'scrollbar_track');
    }

    var containerHeight = dojo.coords(container);
    scrollbar_track.style.height = containerHeight.h + "px";

    var scrollbar_handle = document.createElement('div');
    scrollbar_handle.className = 'scrollbar_handle';
    scrollbar_handle.id = container.id + "scrollbar_handle";

    scrollbar_track.appendChild(scrollbar_handle);
    container.appendChild(scrollbar_track);

    if (content.scrollHeight <= content.offsetHeight) {
        scrollbar_handle.style.display = 'none';
        return;
    }
    else {
        scrollbar_handle.style.display = 'block';
        scrollbar_handle.style.height = Math.max(this.content.offsetHeight * (this.content.offsetHeight / this.content.scrollHeight), 25) + 'px';
        yMax = this.content.offsetHeight - scrollbar_handle.offsetHeight;

        if (window.addEventListener) {
            content.addEventListener('DOMMouseScroll', ScrollDiv, false);
        }

        content.onmousewheel = function (evt) {
            console.log(content.id);
            ScrollDiv(evt);
        }
    }

    function ScrollDiv(evt) {
        var evt = window.event || evt //equalize event object
        var delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta //delta returns +120 when wheel is scrolled up, -120 when scrolled down
        pxTop = scrollbar_handle.offsetTop;

        if (delta <= -120) {
            var y = pxTop + 10;
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 0 // Limit vertical movement
            scrollbar_handle.style.top = y + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
        else {
            var y = pxTop - 10;
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 0 // Limit vertical movement
            scrollbar_handle.style.top = y + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
    }

    //Attaching events to scrollbar components
    scrollbar_track.onclick = function (evt) {
        if (!isHandleClicked) {
            evt = (evt) ? evt : event;
            pxTop = scrollbar_handle.offsetTop // Sliders vertical position at start of slide.
            var offsetY;
            if (!evt.offsetY) {
                var coords = dojo.coords(evt.target);
                offsetY = evt.layerY - coords.t;
            }
            else
                offsetY = evt.offsetY;
            if (offsetY < scrollbar_handle.offsetTop) {
                scrollbar_handle.style.top = offsetY + "px";
                content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
            }
            else if (offsetY > (scrollbar_handle.offsetTop + scrollbar_handle.clientHeight)) {
                var y = offsetY - scrollbar_handle.clientHeight;
                if (y > yMax) y = yMax // Limit vertical movement
                if (y < 0) y = 0 // Limit vertical movement
                scrollbar_handle.style.top = y + "px";
                content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
            }
            else {
                return;
            }
        }
        isHandleClicked = false;
    };

    //Attaching events to scrollbar components
    scrollbar_handle.onmousedown = function (evt) {
        isHandleClicked = true;
        evt = (evt) ? evt : event;
        evt.cancelBubble = true;
        if (evt.stopPropagation) evt.stopPropagation();
        pxTop = scrollbar_handle.offsetTop // Sliders vertical position at start of slide.
        yCoord = evt.screenY // Vertical mouse position at start of slide.
        document.body.style.MozUserSelect = 'none';
        document.body.style.userSelect = 'none';
        document.onselectstart = function () {
            return false;
        }
        document.onmousemove = function (evt) {
            console.log("inside mousemove");
            evt = (evt) ? evt : event;
            evt.cancelBubble = true;
            if (evt.stopPropagation) evt.stopPropagation();
            var y = pxTop + evt.screenY - yCoord;
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 0 // Limit vertical movement
            scrollbar_handle.style.top = y + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
    };

    document.onmouseup = function () {
        document.body.onselectstart = null;
        document.onmousemove = null;
    };

    scrollbar_handle.onmouseout = function (evt) {
        document.body.onselectstart = null;
    };
}

//function to refresh scrollbar
function RefreshScrollBar(container, handle) {
    var container = dojo.byId(container);
    var handle = dojo.byId(handle);
    this.handle.style.height = Math.max(this.container.offsetHeight * (this.container.offsetHeight / this.container.scrollHeight), 25) + 'px';
    //Set scroll height
    yMax = this.container.offsetHeight - this.handle.offsetHeight;
}

//Function for displaying loading image in comments tab
function ShowDojoLoading(target) {
    dijit.byId('dojoStandBy').target = target;
    dijit.byId('dojoStandBy').show();
}

//Function for hiding loading image
function HideDojoLoading() {
    dijit.byId('dojoStandBy').hide();
}

//function to find custom anchor point
function GetInfoWindowAnchor(pt, infoWindowWidth) {
    var verticalAlign;
    if (pt.y < map.height / 2) {
        verticalAlign = "LOWER";
    }
    else {
        verticalAlign = "UPPER";
    }
    if ((pt.x + infoWindowWidth) > map.width) {
        return esri.dijit.InfoWindow["ANCHOR_" + verticalAlign + "LEFT"];
    }
    else {
        return esri.dijit.InfoWindow["ANCHOR_" + verticalAlign + "RIGHT"];
    }
}

//function to create checkbox
function CreateCheckBox(chkBoxId, chkBoxValue, isChecked) {
    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = chkBoxId;
    cb.checked = isChecked;
    cb.value = chkBoxValue;
    return cb;
}

//function to get UTC date for the given days
function GetUTCDate(days, dateFormat) {
    var date = new js.date();
    var today = date.utcTimestampNow();
    today.setDate(today.getDate() - days);
    if (dateFormat) {
        return dojo.date.locale.format(today, { datePattern: dateFormat, selector: "date" });
    }
    else {
        return date.utcMsFromTimestamp(date.localToUtc(date.localTimestampNow()));
    }
}

//Function for toggling the search according to service request or address
function ToggleSearch(control) {
    if (dojo.coords(dojo.byId('divAddressContainer')).h > 0) {
        WipeOutControl(dojo.byId('divAddressContainer'), 500);
    }

    if (control.id == 'spanAddress') {
        dojo.byId('rbAddress').checked = true;
        dojo.byId('rbAddress').className = 'text';
        dojo.byId('spanAddress').className = 'text';
        dojo.byId('spanServiceRequestID').className = 'disabledText';
        dojo.byId('txtAddress').title = 'Enter an address to locate';
        dojo.byId('txtAddress').setAttribute('placeholder', "");
        dojo.byId('txtAddress').value = defaultAddress;

    }
    else {
        dojo.byId('rbServiceRequest').checked = true;
        dojo.byId('rbServiceRequest').className = 'text';
        dojo.byId('spanServiceRequestID').className = 'text';
        dojo.byId('spanAddress').className = 'disabledText';
        dojo.byId('txtAddress').title = 'Enter service request number';
        dojo.byId('txtAddress').setAttribute('placeholder', "Enter service request number");
        dojo.byId("txtAddress").value = '';
    }


}

//function to teggle search from radio button click
function RadioButtonClicked(rbControl) {

    if (dojo.coords(dojo.byId('divAddressContainer')).h > 0) {
        WipeOutControl(dojo.byId('divAddressContainer'), 500);
    }
    if (rbControl.id == 'rbAddress') {
        dojo.byId('spanAddress').className = 'text';
        dojo.byId('spanServiceRequestID').className = 'disabledText';
        dojo.byId('txtAddress').title = 'Enter an address to locate';
        dojo.byId('txtAddress').setAttribute('placeholder', "");
        dojo.byId('txtAddress').value = defaultAddress;

    }
    else {
        dojo.byId('spanAddress').className = 'disabledText';
        dojo.byId('spanServiceRequestID').className = 'text';
        dojo.byId('txtAddress').title = 'Enter service request number';
        dojo.byId('txtAddress').setAttribute('placeholder', "Enter service request number");
        dojo.byId("txtAddress").value = '';
    }
}


//function to create Rating widget
function CreateRatingWidget(rating) {
    var numberStars = Number(rating.getAttribute("numstars"));
    var isReadOnly = String(rating.getAttribute("readonly")).bool();

    for (var i = 0; i < numberStars; i++) {
        var li = document.createElement("li");
        li.value = (i + 1);
        li.className = "ratingStar";
        rating.appendChild(li);

        if (i < rating.value) {
            dojo.addClass(li, "ratingStarChecked");
        }

        li.onmouseover = function () {
            if (!isReadOnly) {
                var ratingValue = Number(this.value);
                var ratingStars = dojo.query(".ratingStar", rating);
                for (var i = 0; i < ratingValue; i++) {
                    dojo.addClass(ratingStars[i], "ratingStarChecked");
                }
            }
        }

        li.onmouseout = function () {
            if (!isReadOnly) {
                var ratings = Number(rating.value);
                var ratingStars = dojo.query(".ratingStar", rating);
                for (var i = 0; i < ratingStars.length; i++) {
                    if (i < ratings) {
                        dojo.addClass(ratingStars[i], "ratingStarChecked");
                    }
                    else {
                        dojo.removeClass(ratingStars[i], "ratingStarChecked");
                    }
                }
            }
        }

        li.onclick = function () {
            if (!isReadOnly) {
                rating.value = Number(this.value);
                var ratingStars = dojo.query(".ratingStar", rating);
                for (var i = 0; i < ratingStars.length; i++) {
                    if (i < this.value) {
                        dojo.addClass(ratingStars[i], "ratingStarChecked");
                    }
                    else {
                        dojo.removeClass(ratingStars[i], "ratingStarChecked");
                    }
                }
            }
        }
    }
}

//Set rating for rating control
function SetRating(control, rating) {
    control.value = rating;
    var ratingStars = dojo.query(".ratingStar", control);
    for (var i = 0; i < ratingStars.length; i++) {
        if (i < rating) {
            dojo.addClass(ratingStars[i], "ratingStarChecked");
        }
        else {
            dojo.removeClass(ratingStars[i], "ratingStarChecked");
        }
    }
}

//function to convert string to bool
String.prototype.bool = function () {
    return (/^true$/i).test(this);
};

//function to return indexof an element
function ElementIndexOf(array, element) {
    for (var index in array) {
        if (array[index] == element) {
            return index;
        }
    }
    return -1;
}

//Function to get the query string value of the provided key if not found the function returns empty string
function GetQuerystring(key) {
    var _default;
    if (_default == null) _default = "";
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if (qs == null)
        return _default;
    else
        return qs[1];
}

//function to create textarea
function CreateTextArea(id, width, height, className) {
    var txtArea = document.createElement("textarea");
    txtArea.id = id;
    txtArea.style.height = height;
    txtArea.style.width = width;
    txtArea.className = className;
    return txtArea;
}

//function to close maptip
function CloseMapTip() {
    if (dijit.byId('toolTipDialog')) {
        dijit.byId('toolTipDialog').destroy();
    }
}

//function to show maptip
function ShowMapTip(evtArgs, content) {
    CloseMapTip();
    var dialog = new dijit.TooltipDialog({
        id: "toolTipDialog",
        content: '<span style="font-size:11px; font-family:Verdana;">' + content + '</span> ',
        style: "position: absolute; z-index:1000;"
    });
    dialog.startup();
    dojo.style(dialog.domNode, "opacity", 0.80);
    dijit.placeOnScreen(dialog.domNode, { x: evtArgs.pageX, y: evtArgs.pageY }, ["BL", "BR"], { x: 5, y: 5 });
}

//function to hide BaseMapWidget onmouseout
function HideBaseMapWidget() {
    dijit.byId('imgBaseMap').attr("checked", false);
    var node = dojo.byId('divBaseMapTitleContainer');
    if (dojo.coords(node).h > 0) {
        WipeOutControl(node, 500);
    }
}

//function to hide application share widget onmouseout
function HideApplicationShareWidget() {
    dijit.byId('imgapplink').attr("checked", false);
    //ToggleApplication();
    var node = dojo.byId('divAppContainer');

    if (dojo.coords(node).h > 0) {
        WipeOutControl(node, 500);
    }
}

//function to hide splashscreen message
function HideSplashScreen() {
    dijit.byId('dialogLoadMessage').hide();
    window.onkeydown = null;
}

var customMouseHandler =
{
    evtHash: [],

    ieGetUniqueID: function (_elem) {
        if (_elem === window) { return 'theWindow'; }
        else if (_elem === document) { return 'theDocument'; }
        else { return _elem.uniqueID; }
    },

    addEvent: function (_elem, _evtName, _fn, _useCapture) {
        if (typeof _elem.addEventListener != 'undefined') {
            if (_evtName == 'mouseenter')
            { _elem.addEventListener('mouseover', customMouseHandler.mouseEnter(_fn), _useCapture); }
            else if (_evtName == 'mouseleave')
            { _elem.addEventListener('mouseout', customMouseHandler.mouseEnter(_fn), _useCapture); }
            else
            { _elem.addEventListener(_evtName, _fn, _useCapture); }
        }
        else if (typeof _elem.attachEvent != 'undefined') {
            var key = '{FNKEY::obj_' + customMouseHandler.ieGetUniqueID(_elem) + '::evt_' + _evtName + '::fn_' + _fn + '}';
            var f = customMouseHandler.evtHash[key];
            if (typeof f != 'undefined')
            { return; }

            f = function () {
                _fn.call(_elem);
            };

            customMouseHandler.evtHash[key] = f;
            _elem.attachEvent('on' + _evtName, f);

            // attach unload event to the window to clean up possibly IE memory leaks
            window.attachEvent('onunload', function () {
                _elem.detachEvent('on' + _evtName, f);
            });

            key = null;
            //f = null;   /* DON'T null this out, or we won't be able to detach it */
        }
        else
        { _elem['on' + _evtName] = _fn; }
    },

    removeEvent: function (_elem, _evtName, _fn, _useCapture) {
        if (typeof _elem.removeEventListener != 'undefined')
        { _elem.removeEventListener(_evtName, _fn, _useCapture); }
        else if (typeof _elem.detachEvent != 'undefined') {
            var key = '{FNKEY::obj_' + customMouseHandler.ieGetUniqueID(_elem) + '::evt' + _evtName + '::fn_' + _fn + '}';
            var f = customMouseHandler.evtHash[key];
            if (typeof f != 'undefined') {
                _elem.detachEvent('on' + _evtName, f);
                delete customMouseHandler.evtHash[key];
            }

            key = null;
            //f = null;   /* DON'T null this out, or we won't be able to detach it */
        }
    },

    mouseEnter: function (_pFn) {
        return function (_evt) {
            var relTarget = _evt.relatedTarget;
            if (this == relTarget || customMouseHandler.isAChildOf(this, relTarget))
            { return; }

            _pFn.call(this, _evt);
        }
    },

    isAChildOf: function (_parent, _child) {
        if (_parent == _child) { return false };

        while (_child && _child != _parent)
        { _child = _child.parentNode; }

        return _child == _parent;
    }
};