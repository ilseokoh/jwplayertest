/*
 * AkamaiJWPlayerLoader.js
 * Version - 1.2.1
 *
 * This file is part of the Media Analytics, http://www.akamai.com
 * Media Analytics is a proprietary Akamai software that you may use and modify per the license agreement here:
 * http://www.akamai.com/product/licenses/mediaanalytics.html
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS �쏛S IS�� AND ANY EXPRESS OR IMPLIED WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *
 *
 * Created by Vishvesh on 10th June 2016.
 *
 */

function AkamaiJWPlugin(jwPlayer)
{
    var VERSION = "1.2.1";
    var akaPlugin;
    var isPlayStarted = false;
    var pluginObj = this;
    var isSessionInitiated = false;
    var isFQ = false;
    var isMP = false;
    var isTQ = false;
    this.loadMediaAnalytics = function()
    {
        try
        {
            createLibraryInstance();

            jwPlayer().on('beforePlay', function(e){
                if(!isSessionInitiated){
                    //Setting playerType for debugging purposes.
                    akaPlugin.setData("std:playerType", "JWPlayer-" + jwPlayer().getProvider().name);
                    setCustomData();
                    akaPlugin.handleSessionInit();//Must be called only when initiating a new play.
                    isSessionInitiated = true;
                    isPlayStarted = false;
                }
            });

            jwPlayer().on('play', function(e){
                if(!isPlayStarted){
                    pluginObj.setBitrateIndex(jwPlayer().getCurrentQuality());
                }
                isPlayStarted = true;
                akaPlugin.handlePlaying();
            });

            jwPlayer().on('pause', function(e){
                akaPlugin.handlePause();
            });

            jwPlayer().on('buffer', function(e){
                akaPlugin.handleBufferStart();
            });

            jwPlayer().on('complete', function(e){
                akaPlugin.handlePlayEnd("JWPlayer.Complete");
                isSessionInitiated = false;
                isPlayStarted = false;
            });

            jwPlayer().on('error', function(e){
                akaPlugin.handleError("JWPlayer.Error:"+e.message);
                isSessionInitiated = false;
                isPlayStarted = false;
            });

            jwPlayer().on('setupError', function(e){
                akaPlugin.handleError("JWPlayer.SetupError:"+e.message);
                isSessionInitiated = false;
                isPlayStarted = false;
            });

            jwPlayer().on('levelsChanged', function(e) {
                pluginObj.setBitrateIndex(e.currentQuality);
            });

            jwPlayer().on('adImpression', function(e) {
                //JWPlayer provides only one event when Ad starts.
                isFQ = false;isMP = false;isTQ = false;
                akaPlugin.handleAdLoaded({adTitle:e.tag});//Need to send more Ad related custom dimensions.
                akaPlugin.handleAdStarted();
            });

            jwPlayer().on('adTime', function(e) {
                try{
                    if(e.duration > 0){
                        var adPlayPercent = e.position / e.duration;
                        if(!isFQ && adPlayPercent >= 0.25 && adPlayPercent < 0.5){
                            akaPlugin.handleAdFirstQuartile();
                            isFQ = true;
                        }else if(!isMP && adPlayPercent >= 0.5 && adPlayPercent < 0.75){
                            akaPlugin.handleAdMidPoint();
                            isMP = true;
                        }else if(!isTQ && adPlayPercent >= 0.75){
                            akaPlugin.handleAdThirdQuartile();
                            isTQ = true;
                        }
                    }
                }catch(e){}
            });

            jwPlayer().on('adComplete', function(e) {
                akaPlugin.handleAdComplete();
            });

            jwPlayer().on('adError', function(e) {
                akaPlugin.handleAdError();
            });

            jwPlayer().on('remove', function(e){
                akaPlugin.handlePlayEnd("JWPlayer.Browser.Close");
            });
        }
        catch(e){
        }
    }

    this.setData = function(name, value){
        if(akaPlugin){
            akaPlugin.setData(name, value);
        }
    }

    this.setBitrateIndex = function(bitrateIndex){
        //console.log("setBitrateIndex:"+bitrateIndex);
        try{
        var qualityObj = jwplayer().getQualityLevels()[bitrateIndex];
        var bitrate = parseInt(qualityObj.bitrate);
        if(bitrate < 50000){
            bitrate = bitrate*1000;//Converting kbps to bps
        }
        if(isNaN(bitrate) || !(bitrate>0)){
            if(qualityObj.label && qualityObj.label.toLowerCase().indexOf("kbps") > 0){
                bitrate = parseInt(qualityObj.label)*1000;
            }
        }
        if(bitrate > 0){
            this.setBitrate(bitrate);
        }
        }catch(e){}
    }
	
    //Set bitrate in bps
    this.setBitrate = function(bitrate){
        if(akaPlugin){
            //console.log("setBitrate:"+bitrate);
            akaPlugin.handleBitRateSwitch(bitrate);
        }
    }

    this.removeAllListeners = function(){
        akaPlugin.handlePlayEnd("JWPlayer.Browser.Close");
        jwplayer().off('beforePlay');
        jwplayer().off('play');
        jwplayer().off('pause');
        jwplayer().off('buffer');
        jwplayer().off('complete');
        jwplayer().off('error');
        jwplayer().off('setupError');
        jwplayer().off('levelsChanged');
        jwplayer().off('adImpression');
        jwplayer().off('adTime');
        jwplayer().off('adComplete');
        jwplayer().off('adError');
        jwplayer().off('remove');
    }

    function createLibraryInstance(){
        var akaPluginCallBack = {};
        akaPluginCallBack["streamHeadPosition"] = getStreamHeadPosition;
        akaPluginCallBack["streamLength"] = getStreamLength;
        akaPluginCallBack["streamURL"] = getStreamURL;
        akaPluginCallBack["loaderName"] = "JWPlayerLoader";
        akaPluginCallBack["loaderVersion"] = VERSION;

        akaPlugin = new AkaHTML5MediaAnalytics(akaPluginCallBack);
    }
    
    function getStreamHeadPosition(){
        return jwPlayer().getPosition();
    } 

    function getStreamLength(){
        return jwPlayer().getDuration();
    }

    function getStreamURL(){
        var itemIndex = jwPlayer().getPlaylistIndex();
        var item = jwPlayer().getPlaylistItem(itemIndex);
        return item.file;
    }

    function setCustomData(){
        try{
            if(jwPlayer().getPlaylist() && jwPlayer().getPlaylistIndex() > -1){
                var playItem = jwPlayer().getPlaylist()[jwPlayer().getPlaylistIndex()];
                akaPlugin.setData("title", playItem.title);
           }
        }catch(e){
            console.log(e);
        }
    }
    this.loadMediaAnalytics();
}