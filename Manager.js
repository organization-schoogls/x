var AudioCallBack = {
	beforeShowAd: () => {
		Laya.timer.scale = 0;
		Laya.stage.renderingEnabled = false; //停止渲染
		Laya.updateTimer && Laya.updateTimer.pause(); //停止onUpdate
		Laya.physicsTimer && Laya.physicsTimer.pause(); //停止物理
		Laya.SoundManager.stopMusic();
		Laya.SoundManager.setMusicVolume(0);
		Laya.SoundManager.setSoundVolume(0);
	},
	afterShowAd: () => {
		window.focus();
		Laya.timer.scale = window.factor;		
		Laya.stage.renderingEnabled = true //恢复渲染
		Laya.updateTimer && Laya.updateTimer.resume(); //恢复onUpdate
		Laya.physicsTimer && Laya.physicsTimer.resume(); //恢复物理
		Laya.SoundManager.setMusicVolume(1);
		Laya.SoundManager.setSoundVolume(1);
		Laya.SoundManager.playMusic('res/sound/bgm.mp3');
	}
};
//*-------- Show Interstitial --------*//
function ShowInter(complete) {
	if(ysdk.environment.payload){
		complete && complete();
		return;
	}
	AudioCallBack.beforeShowAd();	
	ysdk.adv.showFullscreenAdv({
		callbacks: {
			onClose: function(wasShown) {
				// some action after close
				AudioCallBack.afterShowAd();
				if(complete)
					complete();
			},
			onError: function(error) {
				// some action on error
				AudioCallBack.afterShowAd();
				if(complete)
					complete();				
			}
		}
	});
}

//*-------- Show Rewarded --------*//
function ShowRewarded(success, failure) {
	if(ysdk.environment.payload){
		return;
	}
	AudioCallBack.beforeShowAd();
	ysdk.adv.showRewardedVideo({
		callbacks: {
			onOpen: () => {
				window.rewardDone = false;
			},
			onRewarded: () => {
				window.rewardDone = true;
			},
			onClose: () => {
				AudioCallBack.afterShowAd();
				if(window.rewardDone)
					success();			
			},
			onError: (e) => {
				AudioCallBack.afterShowAd();
				if(failure)failure();
				if(window.isRussian)
					PromptDialog("Реклама в данный момент недоступна, пожалуйста, попробуйте еще раз позже!");
				else
					PromptDialog("Ads are currently unavailable, please try again later!");
			}
		}
	})
}

function ShowBanner(){
	ysdk.adv.showBannerAdv();
}

function HideBanner(){
	ysdk.adv.hideBannerAdv();
}

function isAfterTime() {
	return window.adState;
}

YaGames
.init()
.then(ysdk => {
	window.ysdk = ysdk;
	window.isRussian = ysdk.environment.i18n.lang == "ru";
	loadLib("index.js");
	window.timeToShow = 1500;
	return ysdk.getFlags();
}).then(flags => {
	window.adState = parseInt(flags.currentState) == 1;
	window.timeToShow = parseInt(flags.timeToShow);
});

function PromptDialog(msg, duration = 3e3) {
	if (!this.prompt_) {
		this.prompt_ = document.createElement('div');
		this.prompt_.style.cssText = "font-family:siyuan;max-width:80%;min-width:320px;padding:10px 10px 10px 10px;min-height:40px;color: rgb(255, 255, 255);line-height: 20px;text-align:center;border-radius: 4px;position: fixed;top: 40%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(0, 0, 0,.7);font-size: 16px;";
		document.body.appendChild(this.prompt_);
	}
	this.prompt_.innerHTML = msg;
	duration = isNaN(duration) ? 3e3 : duration;
	this.prompt_.style.display = "inline";
	this.prompt_.style.opacity = '1';
	setTimeout(function() {
		var d = 0.5;
		this.prompt_.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
		this.prompt_.style.opacity = '0';
		this.prompt_.style.display = "none";
	}.bind(this), duration);
}