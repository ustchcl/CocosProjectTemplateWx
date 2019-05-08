import { Timer } from "./Timer";
import { BannerAdUnitId, VedioAdUnitId_1 } from "../core/GameData";
import { Maybe } from "./Maybe";
import { Subject } from "rxjs";

export function initWxApi() {
    initBannerAd();
    initOnShow();
}

/**
 * Bannder Ad
 */
let bannerAd: BannderAd = null;
let bannerAdIsReady = false;
let timer: Timer = null;

function initBannerAd() {
    if (bannerAdIsReady) {
        return;
    }
    timer = new Timer({
        tick: 30,
        ontick: _ => showBannerAd()
    });
    timer.start(Timer.Infinity).pause();
    bannerAdIsReady = true;
}

export function showBannerAd() {
    timer.start();
    _showBannerAd();
}

export function _showBannerAd() {
    bannerAd && bannerAd.destroy();

    let { screenHeight, screenWidth } = wx.getSystemInfoSync();

    bannerAd = wx.createBannerAd({
        adUnitId: BannerAdUnitId,
        style: {
            left: 0,
            top: screenHeight,
            width: 300,
            height: 105
        }
    });

    bannerAd.show();
    bannerAd.style.top = screenHeight - bannerAd.style.realHeight;
    bannerAd.style.left = (screenWidth - bannerAd.style.realWidth) / 2;
}

export function hideBannerAd() {
    timer.stop();
    bannerAd && bannerAd.hide();
}


/**
 * Vedio Ad
 */
export async function getVedioAd(): Promise<Maybe<RewardVedeioAd>> {
    let videoAd = wx.createRewardedVideoAd({
        adUnitId: VedioAdUnitId_1
    });
    try {
        await videoAd.load();
        return Maybe.Just(videoAd);
    } catch(e) {
        console.log(e);
        showMsg("无可用广告");
    }
    return Maybe.Nothing();
}

// toast
type MsgType = "success" | "none"
export function showMsg(msg: string, msgType: MsgType = "none") {
    wx.showToast({
        title: msg,
        icon: msgType,
        duration: 1500
    });
}

// on show

/**
 * onShow: 从其他场景回到小游戏中触发
 */
export const onShow = new Subject<OnShowInfo>();
export type OnShowInfo = {
    scene: string;
    query: any;
    shareTicket: string;
    referrerInfo: {
        appId: string;
        extraData: any;
    }
}

function initOnShow() {
    wx.onShow((info: OnShowInfo) => {
        onShow.next(info);
    })
}


// version 
export type VersionCompare = "Lower" | "Higher" | "Equal"

export function compareVersion(version: string) {
    let systemInfo = wx.getSystemInfoSync();
    let currentSDKVersion = systemInfo.SDKVersion;
    return _doCompareVersion(currentSDKVersion, version);
}

function _doCompareVersion(_v1: string, _v2: string): VersionCompare {
    let v1 = _v1.split('.');
    let v2 = _v2.split('.');
    var len = Math.max(v1.length, v2.length)
    while (v1.length < len) {
        v1.push('0');
    }
    while (v2.length < len) {
        v2.push('0');
    }
    for (var i = 0; i < len; i++) {
        var num1 = parseInt(v1[i]);
        var num2 = parseInt(v2[i]);
        if (num1 > num2) {
            return "Higher";
        } else if (num1 < num2) {
            return "Lower";
        }
    }
    return "Equal";
}


// 菜单按钮位置
export type MenuButtonInfo = {
    width: number,
    height: number,
    top: number,
    right: number,
    bottom: number,
    left: number
}
/**
 * 获取菜单按钮（右上角胶囊按钮）的布局位置信息。坐标信息以屏幕左上角为原点。
 */
export function getMenuButtonInfo(): MenuButtonInfo {
    return wx.getMenuButtonBoundingClientRect();
}

//////////// 
// storage


