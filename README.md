## CocosProjectTemplate For WxGame


## **注意**
- child的初始化需要在onLoad中



## Examples
- example1: counter
- example2: TODO list
- example3: Container & Child Component


![](./md_res/example1.gif)


v0.1.1:
加入wxapi的一些借口
- `showBannerAd` 在屏幕下方显示每30s刷新一次的广告
- `getVedioAd :: () => Maybe RewardVedioAd` 获取视频广告 

定时器的实现
```typescript
let timer = new Timer();
let total = 20;
timer.on('ontick', (d: number) => console.log(d))
    .on("onend", () => console.log("end"))
    .start(total);

// ontick需要在start前注册。或者注册后重新start
// start(duration?: number): void;
timer.pause();
timer.start(); // 暂停后可以调用start开始
```

v0.1: 
- 删除actions: Subject<Action>