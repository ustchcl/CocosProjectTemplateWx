import test from "ramda/es/test";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class OnLoadAndStart extends cc.Component {
    @property(cc.String)
    flagValue: string = "";

    onLoad() {
        console.log("onLoad: ", this.name);
    }

    start () {
        console.log("start: ", this.name);
    }

    someFunc() {
        
    }

}
