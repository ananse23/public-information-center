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
dojo.provide("js.config");
dojo.declare("js.config", null, {

    // This file contains various configuration settings for "Citizen Service Portal" template
    //
    // Use this file to perform the following:

    // 1.  Specify application title                  - [ Tag(s) to look for: ApplicationName ]
    // 2.  Set path for application icon              - [ Tag(s) to look for: ApplicationIcon ]
    // 3.  Set splash screen message                  - [ Tag(s) to look for: SplashScreenMessage ]
    // 4.  Set URL for help page                      - [ Tag(s) to look for: HelpURL ]
    // 5.  Specify URLs for basemaps                  - [ Tag(s) to look for: BaseMapLayers ]
    // 6.  Set initial map extent                     - [ Tag(s) to look for: DefaultExtent ]
    // 7.  Specify URL(s) for operational layers      - [ Tag(s) to look for: DevPlanLayer,CommentLayer]
    // 8.  Customize data formatting                  - [ Tag(s) to look for: ShowNullValueAs]
    // 9.  Customize address search settings          - [ Tag(s) to look for: LocatorURL, LocatorDefaultAddress, LocatorMarkupSymbolPath]
    // 10. Set URL for geometry service               - [ Tag(s) to look for: GeometryService ]

    // 11. Customize info-Window settings             - [ Tag(s) to look for: InfoWindowHeader ]
    // 11a.Customize info-Popup settings              - [ Tag(s) to look for: InfoPopupFieldsCollection]

    // 12. Set the default comment                    - [ Tag(s) to look for: DefaultCmnt]
    // 13. Customize the renderer                     - [  Tag(s) to look for: CustomRenderer, RendererColor]
    // 14. Specify URLs for map sharing               - [ Tag(s) to look for: FacebookShareURL, TwitterShareURL, ShareByMailLink ]
    // 14a.In case of changing the TinyURL service
    //     Specify URL for the new service            - [ Tag(s) to look for: MapSharingOptions (set TinyURLServiceURL, TinyURLResponseAttribute) ]


    // ------------------------------------------------------------------------------------------------------------------------
    // GENERAL SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    //Application name to be displayed in the application header.
    ApplicationName: "<b>Public Information Center</b>",

    //Application icon to be displayed in the application header.
    ApplicationIcon: "images/PubInfoLogo.png",

    //Application start splash screen message.
    SplashScreenMessage: "<b>Welcome to the Public Information Center</b> <br/> <hr/> <br/> The <b>Public Information Center</b> delivers timely and important information about City activities and allows you to interact directly with your local government. <br/> <br/> You can review the status of on-going construction projects, public notices or alerts, main breaks, and out-of-service hydrants; submit requests for service; and finally review social media feeds to see what is being said about your community. <br/> <br /> <b>Contact Us By Phone:</b> <br/> <br/> Naperville Citizen Service Department <br/> Phone: (555) 555-1212 <br/> Open: 8:00 am - 4:00 pm<br/><hr/> <br/>",

    //Path for help file.
    HelpURL: "help.htm",

    //Default initial map extent.
    DefaultExtent: "-9815317.353,5126118.542,-9811259.298,5127735.811",

    //Geometry service url
    GeometryService: "http://localgovtemplates2.esri.com/ArcGIS/rest/services/Geometry/GeometryServer",

    // ------------------------------------------------------------------------------------------------------------------------
    // BASEMAP SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set baseMap layers
    //Basemap layers:Basemap layer collection. (All the basemap’s need to be in the same spatial reference)
    BaseMapLayers:
       [
          {

              Key: "streetMap",
              ThumbnailSource: "images/Parcel map.png",
              Name: "Streets",
              MapURL: "http://localgovtemplates.esri.com/ArcGIS/rest/services/ParcelPublicAccess/MapServer"

          },
          {
              Key: "imageryMap",
              ThumbnailSource: "images/Imagery Hybrid.png",
              Name: "Imagery",
              MapURL: "http://localgovtemplates.esri.com/ArcGIS/rest/services/ImageryHybrid/MapServer"
          }
      ],

    // ------------------------------------------------------------------------------------------------------------------------
    // ADDRESS SEARCH SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------

    // Set default address to search
    LocatorDefaultAddress: "971 Sylvan Cir,Naperville,IL,60540",

    // Set Locator service URL
    LocatorURL: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Locators/TA_Address_NA_10/GeocodeServer",

    // Set Locator fields (fields to be used for searching)
    LocatorFields: "SingleLine",

    // Set pushpin image path
    LocatorMarkupSymbolPath: "images/pushpin.png",

    // Set Locator fields (fields to be used for searching)
    LocatorParams:
        [
            "Address",
            "City",
            "State",
            "ZIP"
        ],

    // Set string value to be shown for null or blank values
    ShowNullValueAs: "N/A",



    DefaultServiceTab: 0,

    TabHeaderText:
        [
            "Information",
            "Request Service",
            "Social Media"
        ],

    // ------------------------------------------------------------------------------------------------------------------------
    // ServiceRequest
    // ------------------------------------------------------------------------------------------------------------------------
    ServiceRequest:
        {
            Instructions: "<br/><b>Submit a Request for Service:</b> <br/> <br/>Please search for an address or click directly on the map to locate your request for service. Then, provide details about the request below and click Submit to initiate your request. You'll be provided a Request # that can be used to track the status of your request. If you find a request has already been submitted by another party, you can click on the existing request, provide additional comments and increase the importance of the request.<br /><br/><b>Please note:</b> Attachments can be used to submit a photo, video or other document related to a service request.<br/>",
            LayerInfo:
               {
                   Key: "serviceRequest",
                   LayerURL: "http://localgovtemplates2.esri.com/ArcGIS/rest/services/CitizenService/ServiceRequest/FeatureServer/0",
                   OutFields: "*",
                   RequestTypeFieldName: "REQUESTTYPE",
                   CommentsLayerURL: "http://localgovtemplates2.esri.com/ArcGIS/rest/services/CitizenService/ServiceRequest/FeatureServer/1",
                   CommentsOutFields: "*"
               },

            // ------------------------------------------------------------------------------------------------------------------------
            // INFO-WINDOW SETTINGS
            // ------------------------------------------------------------------------------------------------------------------------
            InfoPopupFieldsCollection:
                [
                    {
                        DisplayText: "Problem:",
                        AttributeValue: "${REQUESTTYPE}",
                        DataType: "string"
                    },
                    {
                        Id: "description",
                        DisplayText: "Description:",
                        AttributeValue: "${COMMENTS}",
                        DataType: "description"
                    },
                    {
                        DisplayText: "Date Submitted:",
                        AttributeValue: "${REQUESTDATE}",
                        DataType: "date",
                        dateFormat: "MMM dd, yyyy"
                    },
                    {
                        DisplayText: "Status:",
                        AttributeValue: "${STATUS}",
                        DataType: "string"
                    }
               ]
        },

    // ------------------------------------------------------------------------------------------------------------------------
    // Alerts
    // Key: This is a unique value for the layer
    // DisplayText: Text to be displayed as Title in the accordian for the layer
    // LayerURL: Feature/Map service URL which is added to the alerts
    // RippleColor: Ripple color when feature is selected
    // isLayerVisible: true will make the layer visible when application is loaded
    // defaultTabOpen: true will open the accordian open. Only one accordian can be opened at a time.
    // DateFields: Date fields used in displaying data in the applicaiton. This is used for formatting date datetypes
    // ListViewFormat: Formatted text to be displayed for every feature in the layer
    // InfoWindowHeader: Infowindow header text
    // InfoWindowSize: Size of the infowindow to be displayed for the layer
    // InfoWindowFields: infowindow content to be displayed for feature. This is shown when feature is clicked
    // hasDefinitionExpression: true will apply a definition expression (filter condition) to the layer
    // DefinitionExpression: Definition expression (filter) to be applied to the layer. This will be applied only if hasDefinitionExpression is true
    // FilterDays: Permits DefinitionExpression to be dynamic. A date FilterDays before the current day is substituted into DefinitionExpression where it contains the text ${0}. In this case the DefinitionExpression should be of esriFieldTypeDate type field.
    // ------------------------------------------------------------------------------------------------------------------------
    Alerts:
        {
            Instructions: "<br/><b>General Information:</b> <br/> <br/>The location of construction projects, public notices or alerts, out of service hydrants, and main breaks can be found below.  You can turn on and off projects and assets in the left navigation pane.  When you find a project or asset you're interested in, select it from the list and it will be highlighted on the map.  If you click on an individual asset or project on the map, additional detail will be provided.",
            LayerInfo:
              [
                {
                    Key: "capitalProjects",
                    DisplayText: "City Construction Projects",
                    LayerURL: "http://localgovtemplates2.esri.com/ArcGIS/rest/services/CitizenService/InfrastructureAlerts/MapServer/6",
                    RippleColor: "#C35617",
                    isLayerVisible: true,
                    defaultTabOpen: true,
                    OutFields: "*",
                    DateFields: "PLANSTART,PLANEND",
                    ListViewFormat: "<b>Project Name:</b> ${WORKID}<br/><b>Location:</b> ${LOCATION}<br/><b>Planned Start Date:</b> ${PLANSTART}",
                    InfoWindowHeader: "${WORKID}",
                    InfoWindowSize: "350,160",
                    InfoWindowFields: "Location:${LOCATION},Project Status:${WORKSTATUS},Planned Start Date:${PLANSTART},Planned End Date:${PLANEND},Responsible Agency:${ASSIGNEDTO},Supervisor:${SUPERVISOR}",
                    hasDefinitionExpression: false,
                    DefinitionExpression: "",
                    FilterDays: 0
                },
               {
                   Key: "externalAgencyProjects",
                   DisplayText: "Private Utility and Transit Projects",
                   LayerURL: "http://localgovtemplates2.esri.com/ArcGIS/rest/services/CitizenService/InfrastructureAlerts/MapServer/7",
                   RippleColor: "#BCE954",
                   isLayerVisible: false,
                   defaultTabOpen: false,
                   OutFields: "*",
                   DateFields: "STARTDATE,ENDDATE",
                   ListViewFormat: "<b>Project Name:</b> ${PROJNAME}<br/><b>Planned Start Date:</b> ${STARTDATE}",
                   InfoWindowHeader: "${PROJNAME}",
                   InfoWindowSize: "350,160",
                   InfoWindowFields: "Planned Start Date:${STARTDATE},Planned End Date:${ENDDATE},Responsible Agency:${AGENCY},Contact:${CONTACTNAME},Phone:${PHONE},Email:${EMAIL}",
                   hasDefinitionExpression: false,
                   DefinitionExpression: "",
                   FilterDays: 712
               },
              {
                  Key: "infrastructureAlerts",
                  DisplayText: "Public Notices and Alerts",
                  LayerURL: "http://localgovtemplates2.esri.com/ArcGIS/rest/services/CitizenService/InfrastructureAlerts/MapServer/5",
                  RippleColor: "#C11B17",
                  isLayerVisible: false,
                  defaultTabOpen: false,
                  OutFields: "*",
                  DateFields: "START,ALERTEND",
                  ListViewFormat: "<b>Alert Type:</b> ${ALERTTYPE}<br/><b>Description:</b> ${DESCRIPTION}<br/><b>Start:</b> ${START}<br/><b>End:</b> ${ALERTEND}<br/><b>Contact:</b> ${CONTACT}",
                  InfoWindowHeader: "${ALERTTYPE}",
                  InfoWindowSize: "350,160",
                  InfoWindowFields: "Start:${START},End:${ALERTEND},Description:${DESCRIPTION},Contact Name:${CONTACT}",
                  hasDefinitionExpression: false,
                  DefinitionExpression: "",
                  FilterDays: 0
              },
             {
                 Key: "leaksMainBreaks",
                 DisplayText: "Water Main Leaks and Breaks",
                 LayerURL: "http://localgovtemplates2.esri.com/ArcGIS/rest/services/CitizenService/InfrastructureAlerts/MapServer/2",
                 RippleColor: "#C11B17",
                 isLayerVisible: false,
                 defaultTabOpen: false,
                 OutFields: "*",
                 DateFields: "LEAKSTART,LEAKEND",
                 ListViewFormat: "<b>Problem Type:</b> ${LEAKTYPE}<br/><b>Start:</b> ${LEAKSTART}<br/><b>End:</b> ${LEAKEND}<br/><b>Total Gallons Lost:</b> ${TOTALGALL}",
                 InfoWindowHeader: "${LEAKTYPE}",
                 InfoWindowSize: "330,160",
                 InfoWindowFields: "Description:${NOTES},Repair Status:${REPSTATUS},Start:${LEAKSTART},End:${LEAKEND},Total Gallons Lost:${TOTALGALL},Repair Method:${REPAIRMETH},Pipe Condition:${PIPECOND}",
                 hasDefinitionExpression: true,
                 DefinitionExpression: "REPSTATUS = 'In Progress'",
                 FilterDays: null
             },
             {
                 Key: "sanitaryBackup",
                 DisplayText: "Sewer Backups",
                 LayerURL: "http://localgovtemplates2.esri.com/ArcGIS/rest/services/CitizenService/InfrastructureAlerts/MapServer/3",
                 RippleColor: "#4AA02C",
                 isLayerVisible: false,
                 defaultTabOpen: false,
                 OutFields: "*",
                 DateFields: "BACKUPSTART,BACKUPEND",
                 ListViewFormat: "<b>Start:</b> ${BACKUPSTART}<br/><b>End:</b> ${BACKUPEND}<br/><b>Repair Status:</b> ${REPSTATUS}",
                 InfoWindowHeader: "Sewer Backups",
                 InfoWindowSize: "330,160",
                 InfoWindowFields: "Start:${BACKUPSTART},End:${BACKUPEND},Repair Status:${REPSTATUS},Total Gallons Lost:${TOTALGALL}",
                 hasDefinitionExpression: false,
                 DefinitionExpression: "",
                 FilterDays: 0
             },
             {
                 Key: "sanitaryOverflow",
                 DisplayText: "Sewer Overflows",
                 LayerURL: "http://localgovtemplates2.esri.com/ArcGIS/rest/services/CitizenService/InfrastructureAlerts/MapServer/4",
                 RippleColor: "#4AA02C",
                 isLayerVisible: false,
                 defaultTabOpen: false,
                 OutFields: "*",
                 DateFields: "OVRFLWSTART,OVRFLWEND",
                 ListViewFormat: "<b>Start:</b> ${OVRFLWSTART}<br/><b>End:</b> ${OVRFLWEND}<br/><b>Repair Status:</b> ${REPSTATUS}",
                 InfoWindowHeader: "Sewer Overflows",
                 InfoWindowSize: "330,160",
                 InfoWindowFields: "Start:${OVRFLWSTART},End:${OVRFLWEND},Repair Status:${REPSTATUS},Total Gallons Lost:${TOTALGALL}",
                 hasDefinitionExpression: false,
                 DefinitionExpression: "",
                 FilterDays: 0
             }
          ]
        },


    // ------------------------------------------------------------------------------------------------------------------------
    // SocialMedia
    // ------------------------------------------------------------------------------------------------------------------------
    SocialMedia:
       {
           Instructions: "<br/><b>Social Media Feeds:</b> <br/> <br/>You can also discover what is being said about events and activities happening in and around the City of Naperville by looking closer at social media feeds from <b>YouTube, Twitter and Flickr</b>. <br/> <br/><b>Please note:</b> <br/> <br/>This information is being provided directly from YouTube, Twitter and Flickr sources and is not filtered before being displayed in this application.<br/>",
           MediaSearchAttributes: "TIME,POINTY,POINTX,SEARCHTAG",
           LayerInfo:
              [
                {
                    Key: "youtube",
                    DisplayText: "YouTube",
                    imageURL: "images/YouTubePin.png",
                    mediaDetail: 'Geotaggedvideosfilteredby"${0}"fromYouTube',
                    searchTag: "Naperville",
                    requireGeometry: true,
                    FeedURL: "http://gdata.youtube.com/feeds/api/videos?q=${SEARCHTAG}&max-results=50&time=${TIME}&v=2&lr=en&location=${POINTY},${POINTX}&location-radius=30mi&alt=json",
                    UseUTCDate: false,
                    MonthRangeKey: "all_time",
                    DayRangeKey: "today",
                    DateFormat: "",
                    CallBackParamName: "callback",
                    FeedAttribute: "feed.entry",
                    FeedSource: "content.src",
                    FeedTitle: "title.$t",
                    FeedLocation: "georss$where.gml$Point.gml$pos.$t",
                    FeedLocationSplit: " ",
                    CheckValidFeed: "georss$where",
                    CheckHyperLinks: false,
                    InfoWindowSize: "290,220",
                    InfoWindowTemplate: '<div style="text-align:center; margin:0 auto;"><object width="275" height="200"><param name="movie" value= ${CONTENT}></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src=${CONTENT} type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="225" height="144"></embed></object></div>'
                },
                {
                    Key: "twitter",
                    DisplayText: "Twitter",
                    imageURL: "images/TwitterPin.png",
                    mediaDetail: 'Geotaggedtweetsfilteredby"${0}"fromTwitter',
                    searchTag: "Naperville",
                    requireGeometry: true,
                    FeedURL: "http://search.twitter.com/search.json?q=${SEARCHTAG}&since date=${TIME}&geocode=${POINTY}%2c${POINTX}%2c30mi&rpp=100&result_type=mixed",
                    UseUTCDate: true,
                    MonthRangeDays: 4,
                    DateFormat: "yyyy-MM-dd",
                    CallBackParamName: "callback",
                    FeedAttribute: "results",
                    FeedSource: "text",
                    FeedTitle: "from_user",
                    FeedLocation: "location",
                    FeedLocationSplit: ",",
                    CheckHyperLinks: true,
                    InfoWindowSize: "290,220",
                    InfoWindowTemplate: '${TITLE}says: <br/>${CONTENT}'
                },
               {
                   Key: "flickr",
                   DisplayText: "Flickr",
                   imageURL: "images/FlickrPin.png",
                   mediaDetail: 'Geotaggedphotosfilteredby"${0}"fromFlickr',
                   searchTag: "Naperville",
                   requireGeometry: false,
                   FeedURL: "http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=fe7e074f8dad46678841c585f38620b7&tags=${SEARCHTAG}&min_taken_date=${TIME}&accuracy=6&has_geo=1&extras=date_taken%2Call_extras%2Cgeo%2Cowner_name%2Clicense%2Co_dims&per_page=500&format=json",
                   UseUTCDate: true,
                   MonthRangeDays: 30,
                   DateFormat: "yyyy-MM-dd",
                   hasCustomFeedSource: true,
                   CallBackParamName: "jsoncallback",
                   FeedAttribute: "photos.photo",
                   FeedSource: "http://farm${farm}.static.flickr.com/${server}/${id}_${secret}.jpg",
                   FeedTitle: "title",
                   FeedLatitude: "latitude",
                   FeedLongitude: "longitude",
                   CheckValidFeed: "latitude",
                   CheckHyperLinks: false,
                   InfoWindowSize: "290,220",
                   InfoWindowTemplate: '<div style="text-align:center; margin:0 auto;"><img style="width:275px;height:180px;" src=${CONTENT}>'
               }
            ]
       },




    // ------------------------------------------------------------------------------------------------------------------------
    // SETTINGS FOR MAP SHARING
    // ------------------------------------------------------------------------------------------------------------------------
    // Set URL for TinyURL service, and URLs for social media
    TinyURLServiceURL:
              {
                  URL: "http://api.bit.ly/v3/shorten?login=esri&apiKey=R_65fd9891cd882e2a96b99d4bda1be00e&uri=${0}&format=json",
                  ResponseAttribute: "data.url",
                  FacebookShareURL: "http://www.facebook.com/sharer.php?u=${0}&t=Public%20Information%20Portal",
                  TwitterShareURL: "http://twitter.com/home/?status=Public%20Information%20Portal' ${0}",
                  MailShare: "mailto:%20?subject=Public%20Information%20Portal&body=${0}"
              }

});