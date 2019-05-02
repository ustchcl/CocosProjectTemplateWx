import { Timer } from "./Timer";
import { BannerAdUnitId, VedioAdUnitId_1 } from "../core/GameData";
import { Maybe } from "./Maybe";

/**
 * Bannder Ad
 */
let bannerAd: BannderAd = null;

let bannerAdIsReady = false;

let timer: Timer = null;

export function initBannerAd() {
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