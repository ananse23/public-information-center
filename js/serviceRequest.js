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
var singleClickFlag = true;

//function to add service request layer on map
function AddServiceRequestLayerOnMap() {
    var serviceRequestLayer = new esri.layers.FeatureLayer(serviceRequestLayerInfo.LayerURL, {
        mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        outFields: [serviceRequestLayerInfo.OutFields],
        id: serviceRequestLayerInfo.Key,
        displayOnPan: false,
        visible: false
    });
    map.addLayer(serviceRequestLayer);

    if (defaultServiceTab == 1) {
        ShowLoadingMessage("Loading...");
    }
    var serviceRequestLayerHandle = dojo.connect(serviceRequestLayer, "onUpdateEnd", function (features) {
        AddServiceLegendItem(this);
        PopulateRequestTypes(serviceRequestLayer.fields);
        HideLoadingMessage();
    });

    dojo.connect(serviceRequestLayer, "onClick", function (evt) {
        if (singleClickFlag) {
            ShowServiceRequestDetails(evt.mapPoint, evt.graphic.attributes);
            singleClickFlag = false;
        }
        setTimeout(function () {
            singleClickFlag = true;
        }, 1000);
        //For cancelling event propagation
        evt = (evt) ? evt : event;
        evt.cancelBubble = true;
        if (evt.stopPropagation) {
            evt.stopPropagation();
        }
    });

    dojo.connect(serviceRequestLayer, "onMouseOver", function (evt) {
        map.setMapCursor('pointer');
    });

    dojo.connect(serviceRequestLayer, "onMouseOut", function (evt) {
        map.setMapCursor('crosshair');
    });

    var serviceRequestCommentLayer = new esri.layers.FeatureLayer(serviceRequestLayerInfo.CommentsLayerURL, {
        mode: esri.layers.FeatureLayer.MODE_SELECTION,
        outFields: [serviceRequestLayerInfo.CommentsOutFields],
        id: serviceRequestLayerInfo.Key + "Comments"
    });
    map.addLayer(serviceRequestCommentLayer);
}

//function to showinfowindow
function ShowServiceRequestDetails(mapPoint, attributes) {
    infoWindowDescriptionFields = [];
    selectedServiceStatus = attributes.STATUS;
    if (!attributes.REQUESTID || attributes.REQUESTID == showNullValueAs) {
        attributes.REQUESTID = showNullValueAs;
        map.infoWindow.setTitle("<span id='spanInfoTitle' title='" + attributes.REQUESTID + "' style='color:white; font-size:11px; font-weight:bolder; font-family:Verdana;'> Service Request ID:" + attributes.REQUESTID + "</span>");
    }
    else {
        map.infoWindow.setTitle("<span id='spanInfoTitle' title='" + attributes.REQUESTID + "' style='color:white; font-size:11px; font-weight:bolder; font-family:Verdana;'> Service Request ID: #" + attributes.REQUESTID + "</span>");
    }
    var mainTabContainer = CreateServiceRequestTabContainer(attributes);
    map.infoWindow.setContent(mainTabContainer.domNode);
    mainTabContainer.resize();
    var windowPoint = map.toScreen(mapPoint);
    map.infoWindow.resize(310, 200);
    setTimeout(function () {
        map.infoWindow.show(mapPoint, GetInfoWindowAnchor(windowPoint, 310));
        mainTabContainer.resize();
        for (var index in infoWindowDescriptionFields) {
            CreateScrollbar(dojo.byId(index), dojo.byId(infoWindowDescriptionFields[index]));
        }

        CreateScrollbar(dojo.byId('divDetailsContainer'), dojo.byId('divDetailsContent'));
    }, 1000);

    FetchRequestComments(attributes.REQUESTID);
    FetchAttachmentDetails(attributes[map.getLayer(serviceRequestLayerInfo.Key).objectIdField]);
    RemoveChildren(dojo.byId("divAttachmentsData"));
    RemoveChildren(dojo.byId("divCommentsContent"));

    CreateRatingWidget(dojo.byId('commentRating'));
    ToggleCommentsView(false);
}

//function to fetch attachment details
function FetchAttachmentDetails(objectID) {
    map.getLayer(serviceRequestLayerInfo.Key).queryAttachmentInfos(objectID, function (files) {
        var fileTable = document.createElement("table");
        var fileTBody = document.createElement("tbody");
        fileTable.appendChild(fileTBody);

        for (var i = 0; i < files.length; i++) {
            if (files[i].contentType.indexOf("image") != 0) {
                fileTBody.appendChild(CreateData(files[i].name, files[i].url, files[i].size, files[i].contentType));
            }
        }

        for (var i = 0; i < files.length; i++) {
            if (files[i].contentType.indexOf("image") >= 0) {
                fileTBody.appendChild(CreateData(files[i].name, files[i].url, files[i].size, files[i].contentType));
            }
        }
        fileTable.appendChild(fileTBody);

        if (files.length == 0) {
            var trNoAttachments = document.createElement("tr");
            var tdNoAttachments = document.createElement("td");
            trNoAttachments.appendChild(tdNoAttachments);
            tdNoAttachments.innerHTML = "No attachments found.";
            fileTBody.appendChild(trNoAttachments);
        }
        dojo.byId("divAttachmentsData").appendChild(fileTable);

        if (file.length > 0) {
            CreateScrollbar(dojo.byId("divAttachments"), dojo.byId("divAttachmentsData"));
        }
    });
}

//Function for creating data for the attachments
function CreateData(text, attachmentURL, fileSize, contentType) {
    var filetr = document.createElement("tr");
    var filetd = document.createElement("td");
    if (contentType.indexOf("image") >= 0) {
        var filePreview = dojo.create("img");
        filePreview.style.width = "275px";
        filePreview.style.height = "275px";
        filePreview.style.cursor = "pointer";
        filePreview.src = attachmentURL;
        filePreview.onclick = function () {
            window.open(attachmentURL);
        }
        filetd.appendChild(filePreview);
    }
    else {
        var filespan = document.createElement("span");
        filespan.id = "fileTab";
        filespan.innerHTML = text;
        filespan.onclick = function () {
            window.open(attachmentURL);
        }

        filespan.className = 'spanFileDetails';
        filetd.appendChild(filespan);
    }
    filetr.appendChild(filetd);
    return filetr;
}

//function to fetch service request comments
function FetchRequestComments(requestID) {
    ShowDojoLoading(dojo.byId("divComments"));
    var query = new esri.tasks.Query();
    query.where = "REQUESTID = '" + requestID + "'";
    query.outFields = ["*"];
    //execute query
    map.getLayer(serviceRequestLayerInfo.Key + "Comments").selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function (features) {
        var commentsTable = document.createElement("table");
        commentsTable.style.width = "95%";
        var commentsTBody = document.createElement("tbody");
        commentsTable.appendChild(commentsTBody);
        dojo.byId("divCommentsContent").appendChild(commentsTable);
        if (features.length > 0) {
            features.sort(SortResultFeatures);      //function to sort comments based on submitted date
            for (var i = 0; i < features.length; i++) {
                var trComments = document.createElement("tr");
                var commentsCell = document.createElement("td");
                commentsCell.className = "bottomborder";
                commentsCell.appendChild(CreateCommentRecord(features[i].attributes, i));
                trComments.appendChild(commentsCell);
                commentsTBody.appendChild(trComments);
                CreateRatingWidget(dojo.byId('commentRating' + i));
                SetRating(dojo.byId('commentRating' + i), features[i].attributes.RANK);
            }
        }
        HideDojoLoading();
        CreateCommentsScrollBar();
    }, function (err) {
        HideDojoLoading();
    });
}

//function to create comment record
function CreateCommentRecord(attributes, i) {
    var table = document.createElement("table");
    table.style.width = "100%";
    var tbody = document.createElement("tbody");
    var tr = document.createElement("tr");
    tbody.appendChild(tr);

    var td = document.createElement("td");
    var td3 = document.createElement("td");
    td.innerHTML = "Importance: ";
    td.style.width = "25%";
    td3.appendChild(CreateRatingControl(true, "commentRating" + i, 0, 5));
    td3.style.width = "100px";
    var td1 = document.createElement("td");

    var date = new js.date();
    var utcMilliseconds = Number(attributes.SUBMITDT);

    td1.innerHTML = "Date: " + dojo.date.locale.format(date.utcToLocal(date.utcTimestampFromMs(utcMilliseconds)), { datePattern: "MMM dd, yyyy", selector: "date" });
    td1.style.width = "150px";

    tr.appendChild(td);
    tr.appendChild(td3);
    tr.appendChild(td1);

    var tr1 = document.createElement("tr");
    var td2 = document.createElement("td");
    var divComments = dojo.create("div", { "class": "wordBreakComments" }, td2);
    divComments.style.width = "270px";
    td2.colSpan = 3;
    if (attributes.COMMENTS) {
        divComments.innerHTML = attributes.COMMENTS;
    }
    else {
        divComments.innerHTML = showNullValueAs;
    }
    tr1.appendChild(td2);
    tbody.appendChild(tr1);

    table.appendChild(tbody);
    return table;
}

//function to add service request comment
function AddRequestComment() {
    var text = dojo.byId('txtComments').value.trim();
    if (text == "") {
        dojo.byId('txtComments').focus();
        ShowSpanErrorMessage('spanCommentError', messages.getElementsByTagName("textComment")[0].childNodes[0].nodeValue);
        return;
    }
    if (text.length > 250) {
        dojo.byId('txtComments').focus();
        ShowSpanErrorMessage('spanCommentError', messages.getElementsByTagName("textCommentLimit")[0].childNodes[0].nodeValue);
        return;
    }
    ShowDojoLoading(dojo.byId("divComments"));
    var commentGraphic = new esri.Graphic();
    var date = new js.date();
    var attr = {
        "REQUESTID": dojo.byId('spanInfoTitle').title,
        "COMMENTS": text,
        "SUBMITDT": date.utcMsFromTimestamp(date.localToUtc(date.localTimestampNow())),
        "RANK": Number(dojo.byId('commentRating').value)
    };
    commentGraphic.setAttributes(attr);
    map.getLayer(serviceRequestLayerInfo.Key + "Comments").applyEdits([commentGraphic], null, null, function (msg) {
        if (msg[0].error) {
        }
        else {
            var table = dojo.query('table', dojo.byId("divCommentsContent"));
            if (table.length > 0) {
                var tr = table[0].insertRow(0);
                var commentsCell = document.createElement("td");
                commentsCell.className = "bottomborder";
                commentsCell.title = attr.COMMENTS;
                var index = dojo.query("tr", table[0]).length;
                if (index) {
                    index = 0;
                }
                commentsCell.appendChild(CreateCommentRecord(attr, index));
                tr.appendChild(commentsCell);
                CreateRatingWidget(dojo.byId('commentRating' + index));
                SetRating(dojo.byId('commentRating' + index), attr.RANK);
            }
        }
        ToggleCommentsView(false);
        HideDojoLoading();
        CreateCommentsScrollBar();
    }, function (err) {
        HideDojoLoading();
    });
    ResetCommentFields();
}

//Function for sorting comments according to date
function SortResultFeatures(a, b) {
    var x = a.attributes.SUBMITDT;
    var y = b.attributes.SUBMITDT;
    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
}

//function to create tab layout for Service request
function CreateServiceRequestTabContainer(attributes) {
    var tabContent = document.createElement('div');
    tabContent.id = 'tabContent';

    for (var i in attributes) {
        if (!attributes[i]) {
            attributes[i] = "";
        }
    }

    var dtlTab = new dijit.layout.ContentPane({
        title: "Details",
        content: CreateServiceRequestDetails(attributes)
    }, dojo.byId('tabContent'));
    var cmntTab = new dijit.layout.ContentPane({
        title: "Comments",
        content: CreateCommetsContainer()
    }, dojo.byId('tabContent'));
    var attTab = new dijit.layout.ContentPane({
        title: "Attachments",
        content: CreateAttachmentContainer()
    }, dojo.byId('tabContent'));

    dojo.connect(cmntTab, "onShow", function () {
        CreateCommentsScrollBar();
    });

    dojo.connect(attTab, "onShow", function () {
        CreateScrollbar(dojo.byId("divAttachments"), dojo.byId("divAttachmentsData"));
    });

    var tabContainer = document.createElement('div');
    tabContainer.id = 'divTabContainer';
    var tabs = new dijit.layout.TabContainer({
        style: "width: 300px; height: 162px; vertical-align:middle;",
        tabPosition: "bottom"
    }, dojo.byId('divTabContainer'));
    tabs.addChild(dtlTab);
    tabs.addChild(cmntTab);
    tabs.addChild(attTab);

    tabs.startup();

    return tabs;
}

//function to create CommentsContainer
function CreateCommetsContainer() {
    var divComments = document.createElement("div");
    divComments.id = "divComments";
    divComments.style.overflow = "hidden";

    var divCommentInput = document.createElement("div");
    divCommentInput.id = "divCommentInput";
    var div = document.createElement("div");
    divCommentInput.appendChild(div);

    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    table.style.cursor = "pointer";
    table.style.fontSize = "10px";
    table.onclick = function () { ToggleCommentsView(true); };
    table.appendChild(tbody);
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(CreateImage("images/addcomment.png", "", false, 30, 30));
    var td1 = document.createElement("td");
    td1.innerHTML = "Add Comment";
    tr.appendChild(td);
    tr.appendChild(td1);
    tbody.appendChild(tr);

    div.appendChild(table);

    var divCommentData = document.createElement("div");
    divCommentData.id = "divCommentData";
    divCommentData.style.height = "100%";
    divCommentData.style.width = "100%";
    divCommentData.style.fontSize = "10px";
    divCommentData.style.position = "relative";

    var divCommentsContainer = document.createElement("div");
    divCommentsContainer.id = "divCommentsContainer";
    divCommentsContainer.style.height = "90px";
    divCommentsContainer.style.width = "100%";
    divCommentsContainer.style.position = 'relative';

    var divCommentsContent = document.createElement("div");
    divCommentsContent.id = "divCommentsContent";
    divCommentsContent.style.overflow = "hidden";
    divCommentsContent.style.wordWrap = "break-word";
    divCommentsContent.style.position = "absolute";
    divCommentsContent.style.height = "90px";
    divCommentsContainer.appendChild(divCommentsContent);

    divCommentData.appendChild(divCommentsContainer);

    var divAddComment = document.createElement("div");
    divAddComment.id = "divAddComment";
    divAddComment.style.display = "none";
    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    table.cellpadding = 1;
    table.cellspacing = 2;
    table.style.height = "100%";
    table.style.marginleft = "5px";
    table.style.fontSize = "10px";

    tr = document.createElement("tr");
    td = document.createElement("td");
    td.innerHTML = "Rating:";
    td1 = document.createElement("td");
    td1.appendChild(CreateRatingControl(false, "commentRating", 0, 5));
    tr.appendChild(td);
    tr.appendChild(td1);
    tbody.appendChild(tr);

    tr = document.createElement("tr");
    td = document.createElement("td");
    td.colSpan = 2;
    td.appendChild(document.createTextNode("Comments:"));
    td.appendChild(document.createElement("br"));
    td.appendChild(CreateTextArea("txtComments", "275px", "35px", "txtArea"));
    tr.appendChild(td);
    tbody.appendChild(tr);

    tr = document.createElement("tr");
    td = document.createElement("td");
    td.colSpan = 2;
    td.style.height = "10px";
    var spanCommentError = document.createElement("span");
    spanCommentError.id = "spanCommentError";
    spanCommentError.style.color = "Yellow"
    spanCommentError.style.display = "block";
    td.appendChild(spanCommentError);
    tr.appendChild(td);
    tbody.appendChild(tr);

    tr = document.createElement("tr");
    td = document.createElement("td");
    td.colSpan = 2;
    td.appendChild(CreateCommentAddTable());
    td.align = "center";
    tr.appendChild(td);
    tbody.appendChild(tr);
    divAddComment.appendChild(table);

    divComments.appendChild(divCommentInput);
    divComments.appendChild(divCommentData);
    divComments.appendChild(divAddComment);

    return divComments;
}

//function to create save and cancel button layout
function CreateCommentAddTable() {
    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);

    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.align = "right";
    var spanSubmit = document.createElement("span");
    spanSubmit.className = "rounded";
    spanSubmit.innerHTML = "Submit";
    spanSubmit.onclick = function () { AddRequestComment(); };
    td.appendChild(spanSubmit);

    var td1 = document.createElement("td");
    td1.align = "left";
    var spanCancel = document.createElement("span");
    spanCancel.className = "rounded";
    spanCancel.innerHTML = "Cancel";
    spanCancel.onclick = function () { ToggleCommentsView(false); };
    td1.appendChild(spanCancel);

    tr.appendChild(td);
    tr.appendChild(td1);

    tbody.appendChild(tr);
    return table;
}

//function to create attachments for service request
function CreateAttachmentContainer() {
    var divAttachments = document.createElement("div");
    divAttachments.id = "divAttachments";
    var divAttachmentsData = document.createElement("div");
    divAttachmentsData.id = "divAttachmentsData";
    divAttachments.appendChild(divAttachmentsData);
    return divAttachments;
}

//function to create tablerow
function CreateTableRow(displayName, value) {
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.innerHTML = displayName;
    td.style.height = "15px";
    td.style.width = "100px";

    var td1 = document.createElement("td");
    td1.style.width = "190px";
    td1.innerHTML = value;
    tr.appendChild(td);
    tr.appendChild(td1);
    return tr;
}

//function to create servicerequest details
function CreateServiceRequestDetails(attributes) {
    var divDetails = document.createElement("div");
    divDetails.id = "divDetailsContainer";
    var divContent = document.createElement("div");
    divContent.id = "divDetailsContent";
    var table = document.createElement("table");
    divContent.appendChild(table);

    divDetails.appendChild(divContent);

    table.cellspacing = 2;
    table.cellpadding = 1;
    table.style.fontSize = "11px";
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);

    for (var index in serviceRequestInfoPopupFields) {
        switch (serviceRequestInfoPopupFields[index].DataType) {
            case "string":
                tbody.appendChild(CreateTableRow(serviceRequestInfoPopupFields[index].DisplayText, dojo.string.substitute(serviceRequestInfoPopupFields[index].AttributeValue, attributes)));
                break;
            case "description":
                tr = document.createElement("tr");
                td = document.createElement("td");
                td.colSpan = 2;

                var divDescriptionContainer = document.createElement("div");
                divDescriptionContainer.id = serviceRequestInfoPopupFields[index].Id + "Container";
                divDescriptionContainer.style.height = "55px";
                divDescriptionContainer.style.position = "relative";
                divDescriptionContainer.style.width = "260px";
                divDescriptionContainer.style.border = "1px solid #fff";

                var divDescriptionContent = document.createElement("div");
                divDescriptionContent.id = serviceRequestInfoPopupFields[index].Id + "Content";
                divDescriptionContent.style.width = '95%';
                divDescriptionContent.style.position = "absolute";
                divDescriptionContent.style.height = "55px";
                divDescriptionContent.style.overflow = "hidden";
                divDescriptionContent.className = "wordBreak";

                var spanRequestDesription = document.createElement("span");
                spanRequestDesription.innerHTML = dojo.string.substitute(serviceRequestInfoPopupFields[index].AttributeValue, attributes);

                divDescriptionContainer.appendChild(divDescriptionContent);
                divDescriptionContent.appendChild(spanRequestDesription);
                td.appendChild(divDescriptionContainer);
                tr.appendChild(td);
                tbody.appendChild(tr);
                infoWindowDescriptionFields[divDescriptionContainer.id] = divDescriptionContent.id;
                break;
            case "date":
                var date = new js.date();
                var utcMilliseconds = Number(dojo.string.substitute(serviceRequestInfoPopupFields[index].AttributeValue, attributes));
                tbody.appendChild(CreateTableRow(serviceRequestInfoPopupFields[index].DisplayText, dojo.date.locale.format(date.utcToLocal(date.utcTimestampFromMs(utcMilliseconds)), { datePattern: serviceRequestInfoPopupFields[index].dateFormat, selector: "date" })));
                break;
        }
    }
    return divDetails;
}

//function to create scrollbar for comments
function CreateCommentsScrollBar() {
    CreateScrollbar(dojo.byId("divCommentsContainer"), dojo.byId("divCommentsContent"));
    dojo.byId("divCommentsContainerscrollbar_track").style.top = (dojo.coords(dojo.byId('divCommentsContainer')).t) + "px";
}

//Function for toggling comments view
function ToggleCommentsView(viewStatus) {
    if (viewStatus) {
        if (selectedServiceStatus.toLowerCase() == "Unassigned".toLowerCase()) {
            dojo.byId('divAddComment').style.display = 'block';
            dojo.byId('divCommentInput').style.display = 'none';
            dojo.byId('divCommentData').style.display = 'none';
            dojo.byId('txtComments').focus();
        }
        else {
            ShowDialog('Error', messages.getElementsByTagName("commentUnassigned")[0].childNodes[0].nodeValue);
            return;
        }
    }
    else {
        dojo.byId('divAddComment').style.display = 'none';
        dojo.byId('divCommentInput').style.display = 'block';
        dojo.byId('divCommentData').style.display = 'block';
    }
    ResetCommentFields();
    CreateCommentsScrollBar();

}

//function to reset comments fields
function ResetCommentFields() {
    dojo.byId('txtComments').value = '';
    dojo.byId('spanCommentError').style.display = "none";
    SetRating(dojo.byId('commentRating'), 0);
}

//function to populate Service request types
function PopulateRequestTypes(serviceRequestLayerFields) {
    var serviceRequestFields
    for (var i = 0; i < serviceRequestLayerFields.length; i++) {
        if (serviceRequestLayerFields[i].name == serviceRequestLayerInfo.RequestTypeFieldName) {
            serviceRequestFields = serviceRequestLayerFields[i].domain.codedValues;
            break;
        }
    }

    var serviceRequestTypes = { identifier: "id", items: [] };
    for (var i = 0; i < serviceRequestFields.length; i++) {
        serviceRequestTypes.items[i] = { id: serviceRequestFields[i].name, name: serviceRequestFields[i].name };
    }
    var serviceRequestStore = new dojo.data.ItemFileReadStore({ data: serviceRequestTypes });
    dijit.byId('cbRequestType').attr('store', serviceRequestStore);
}

//function to hide the Request service layer
function ToggleServiceRequestLayer(isLayerVisible) {
    dojo.byId('tableSocialMediaStatus').style.display = "none";
    arrFeeds = [];
    dojo.byId('rbShowAllFeeds').checked = true;
    if (isLayerVisible) {
        dojo.byId('spanServiceErrorMessage').style.display = 'none';
        dojo.byId('divServiceRequestLegend').style.display = "block";
        map.getLayer(serviceRequestLayerInfo.Key).show();
    }
    else {
        dojo.byId('divServiceRequestLegend').style.display = "none";
        map.getLayer(serviceRequestLayerInfo.Key).hide();
    }
}

//function to add Service request legend items
function AddServiceLegendItem(layer) {
    var table = dojo.byId("tableServiceRequestLegend");
    serviceRequestSymbolURL = layer.renderer.infos[0].symbol.url;
    for (var i = 0; i < layer.renderer.infos.length; i++) {
        var tr = table.insertRow(0); //document.createElement("tr");
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

//function to reset values
function ResetRequestValues() {
    map.infoWindow.hide();
    map.setMapCursor('crosshair');
    map.getLayer(tempServiceRequestLayerId).clear();
    RemoveChildren(dojo.byId('tblFileSelect'));
    RemoveChildren(dojo.byId('tblFileList'));
    dojo.byId('tblFileSelect').setAttribute("rowindex", 0);
    dijit.byId('cbRequestType').setValue("");
    dojo.byId('txtDescription').value = "";
    dojo.byId('txtName').value = "";
    dojo.byId('txtMail').value = "";
    dojo.byId('txtPhone').value = "";
    dojo.byId('spanServiceErrorMessage').innerHTML = "";
    dojo.byId('spanServiceErrorMessage').style.display = "none";
    AddFileUpload();
}

//function to add fileupload row
function AddFileUpload() {
    var table = dojo.byId('tblFileSelect');
    var tbody = table.getElementsByTagName("tbody")[0];
    if (!tbody) {
        tbody = document.createElement("tbody");
        table.appendChild(tbody);
    }
    var tr = document.createElement("tr");
    var td = document.createElement("td");

    tr.appendChild(td);
    tbody.appendChild(tr);

    var rowIndex = table.getAttribute("rowindex");
    tr.id = "trUploadFile" + rowIndex;
    var cloneNode = document.getElementById("divFileSelectComponent").cloneNode(true);
    cloneNode.style.display = "block";
    cloneNode.id = null;
    dojo.query("[id='formFileUplaod']", cloneNode)[0].id = "formFileUpload" + rowIndex;
    var fileUplaodControl = dojo.query("[id='fileUploadControl']", cloneNode)[0];
    var relatedElement = dojo.query("[id='txtFileName']", cloneNode)[0];
    fileUplaodControl.onchange = function () {
        if (this.value.lastIndexOf("\\") > 0) {
            relatedElement.value = this.value.substring(this.value.lastIndexOf("\\") + 1);
        }
        else {
            relatedElement.value = this.value;
        }
        tr.style.display = "none";
        AddFileUpload();
        AddFileListItem(relatedElement.value, rowIndex);
    };

    td.appendChild(cloneNode);
    table.setAttribute("rowindex", (Number(rowIndex) + 1));
}

//function to create fileupload list
function AddFileListItem(fileName, index) {
    var table = dojo.byId('tblFileList');
    var tbody = table.getElementsByTagName("tbody")[0];
    if (!tbody) {
        tbody = document.createElement("tbody");
        table.appendChild(tbody);
    }
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    var td1 = document.createElement("td");

    tr.appendChild(td);
    tr.appendChild(td1);
    tbody.appendChild(tr);

    var spanFileName = document.createElement("span");
    spanFileName.innerHTML = fileName.trimString(30);

    td.appendChild(spanFileName);

    var spanDelete = document.createElement("span");
    spanDelete.innerHTML = "(&nbsp;<img style='width: 12px; height:12px;' src='images/delete.png'/>&nbsp;)";
    spanDelete.title = "Remove the selected file";
    td1.appendChild(spanDelete);
    spanDelete.style.cursor = "pointer";
    spanDelete.onclick = function () {
        tbody.removeChild(tr);
        var tblFileSelect = dojo.byId('tblFileSelect');
        var tbodyFileSelect = tblFileSelect.getElementsByTagName("tbody")[0];
        var trFileSelect = dojo.byId('trUploadFile' + index);
        tbodyFileSelect.removeChild(trFileSelect);

        if (dojo.byId('divFileUploadContent').scrollHeight > 75) {
            CreateScrollbar(dojo.byId('divFileUploadList'), dojo.byId('divFileUploadContent'));
            dojo.byId('divFileUploadContent').scrollTop = dojo.byId('divFileUploadContent').scrollHeight;
            dojo.byId("divFileUploadListscrollbar_handle").style.top = dojo.coords(dojo.byId('divFileUploadList')).h - dojo.coords(dojo.byId('divFileUploadListscrollbar_handle')).h + "px"
        }
        else {
            var container = dojo.byId('divFileUploadList');
            if (dojo.byId(container.id + 'scrollbar_track')) {
                RemoveChildren(dojo.byId(container.id + 'scrollbar_track'));
                container.removeChild(dojo.byId(container.id + 'scrollbar_track'));
            }
        }
    }

    if (dojo.byId('divFileUploadContent').scrollHeight > 75) {
        CreateScrollbar(dojo.byId('divFileUploadList'), dojo.byId('divFileUploadContent'));
        dojo.byId('divFileUploadContent').scrollTop = dojo.byId('divFileUploadContent').scrollHeight;
        dojo.byId("divFileUploadListscrollbar_handle").style.top = dojo.coords(dojo.byId('divFileUploadList')).h - dojo.coords(dojo.byId('divFileUploadListscrollbar_handle')).h + "px"
    }
}

//function to validate request type
function ValidateRequestType() {
    if (!dijit.byId('cbRequestType').item) {
        dijit.byId('cbRequestType').setValue("");
    }
}

//function to create service request
function CreateServiceRequest() {
    if (map.getLayer(tempServiceRequestLayerId).graphics.length == 0) {
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("mapLocation")[0].childNodes[0].nodeValue);
        return false;
    }
    if (ValicateRequestData()) {
        ShowLoadingMessage("Creating Service Request...");
        var mapPoint = map.getLayer(tempServiceRequestLayerId).graphics[0].geometry;
        var date = new js.date();
        var serviceRequestAttributes = {
            "REQUESTTYPE": dijit.byId("cbRequestType").getValue(),
            "COMMENTS": dojo.byId('txtDescription').value.trim(),
            "NAME": dojo.byId('txtName').value.trim(),
            "PHONE": dojo.byId('txtPhone').value.trim(),
            "EMAIL": dojo.byId('txtMail').value.trim(),
            "STATUS": "Unassigned",
            "REQUESTDATE": date.utcMsFromTimestamp(date.localToUtc(date.localTimestampNow()))
        };
        var serviceRequestGraphic = new esri.Graphic(mapPoint, null, serviceRequestAttributes, null);
        map.getLayer(serviceRequestLayerInfo.Key).applyEdits([serviceRequestGraphic], null, null, function (addResults) {
            if (addResults[0].success) {
                var objectIdField = map.getLayer(serviceRequestLayerInfo.Key).objectIdField;
                var requestID = { "REQUESTID": String(addResults[0].objectId) };
                requestID[objectIdField] = addResults[0].objectId;
                var requestGraphic = new esri.Graphic(mapPoint, null, requestID, null);
                map.getLayer(serviceRequestLayerInfo.Key).applyEdits(null, [requestGraphic], null, function () {
                    serviceRequestGraphic.attributes["REQUESTID"] = String(addResults[0].objectId);
                    AddAttachments(addResults[0].objectId, mapPoint, requestID.REQUESTID);
                }, function (err) {
                    ResetRequestValues();
                    HideLoadingMessage();
                });
            }
        }, function (err) {
            ResetRequestValues();
            HideLoadingMessage();
        });
    }
}

//function to add attachments
function AddAttachments(objectID, mapPoint, requestId) {
    var attachmentCount = 0;
    var forms = dojo.query('form', dojo.byId('tblFileSelect'));
    if (forms.length == 0) {
        ResetRequestValues();
        ShowServiceRequestID(mapPoint, requestId);
        HideLoadingMessage();
        return;
    }
    for (var i = 0; i < forms.length; i++) {
        var inputFeild = dojo.query("input", forms[i]);
        if (inputFeild[0].value != "") {
            map.getLayer(serviceRequestLayerInfo.Key).addAttachment(objectID, forms[i], function (sucess) {
                attachmentCount++;
                if (attachmentCount == forms.length) {
                    ResetRequestValues();
                    ShowServiceRequestID(mapPoint, requestId);
                    HideLoadingMessage();
                }
            },
            function (error) {
                attachmentCount++;
                if (attachmentCount == forms.length) {
                    ResetRequestValues();
                    ShowServiceRequestID(mapPoint, requestId);
                    HideLoadingMessage();
                }
            });
        }
        else {
            attachmentCount++;
            if (attachmentCount == forms.length) {
                ResetRequestValues();
                ShowServiceRequestID(mapPoint, requestId);
                HideLoadingMessage();
            }
        }
    }
}

//function to show infowindow with service request number
function ShowServiceRequestID(mapPoint, objectID) {
    map.infoWindow.setTitle("Service Request");
    var spanServiceRequestNumber = document.createElement("span");
    spanServiceRequestNumber.innerHTML = "Service Request Id : " + objectID;
    map.infoWindow.setContent(spanServiceRequestNumber);
    var windowPoint = map.toScreen(mapPoint);
    map.infoWindow.resize(250, 75);
    map.infoWindow.show(windowPoint, GetInfoWindowAnchor(windowPoint, 250));
}

//function to validate service request data
function ValicateRequestData() {
    if (dijit.byId("cbRequestType").getValue() == "") {
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgType")[0].childNodes[0].nodeValue);
        return false;
    }
    if (dojo.byId('txtDescription').value.trim().length > 0 && dojo.byId('txtDescription').value.trim().length > 255) {
        dojo.byId('txtDescription').focus();
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgLength")[0].childNodes[0].nodeValue);
        return false;
    }
    if (dojo.byId('txtName').value.trim() != 0) {
        if (dojo.byId('txtName').value.trim().length > 50) {
            dojo.byId('txtName').focus();
            ShowSpanErrorMessage('spanServiceErrorMessage', messages.getElementsByTagName("exceededName")[0].childNodes[0].nodeValue);
            return;
        }
        if (!IsName(dojo.byId('txtName').value.trim())) {
            dojo.byId('txtName').focus();
            ShowSpanErrorMessage('spanServiceErrorMessage', messages.getElementsByTagName("spanErrorMsgText")[0].childNodes[0].nodeValue);
            return;
        }
    }
    if (dojo.byId('txtMail').value.trim() == '' && dojo.byId('txtPhone').value.trim() == '') {
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgPhoneEmail")[0].childNodes[0].nodeValue);
        return;
    }
    if (dojo.byId('txtMail').value.trim() != '') {
        if (!CheckMailFormat(dojo.byId('txtMail').value.trim())) {
            dojo.byId('txtMail').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgValidEmail")[0].childNodes[0].nodeValue);
            return;
        }
    }
    if (dojo.byId('txtPhone').value.trim() == '') {
        if (!CheckMailFormat(dojo.byId('txtMail').value.trim())) {
            dojo.byId('txtMail').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgValidEmail")[0].childNodes[0].nodeValue);
            return false;
        }
        if (dojo.byId('txtMail').value.trim().length > 100) {
            dojo.byId('txtMail').focus();
            ShowSpanErrorMessage('spanServiceErrorMessage', messages.getElementsByTagName("exceededMail")[0].childNodes[0].nodeValue);
            return;
        }
    }
    else if (dojo.byId('txtMail').value.trim() == '') {
        if (isNaN(dojo.byId('txtPhone').value.trim())) {
            dojo.byId('txtPhone').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgValidPhone")[0].childNodes[0].nodeValue);
            return false;
        }
        if (dojo.byId('txtPhone').value.trim().length != 10) {
            dojo.byId('txtPhone').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgValidPhone")[0].childNodes[0].nodeValue);
            return false;
        }
    }
    if (dojo.byId('txtPhone').value.trim().length > 0) {
        if (isNaN(dojo.byId('txtPhone').value.trim())) {
            dojo.byId('txtPhone').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgValidPhone")[0].childNodes[0].nodeValue);
            return false;
        }
        if (dojo.byId('txtPhone').value.trim().length != 10) {
            dojo.byId('txtPhone').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgValidPhone")[0].childNodes[0].nodeValue);
            return false;
        }
    }
    return true;
}