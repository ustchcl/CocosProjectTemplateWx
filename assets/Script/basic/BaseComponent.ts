import { Component } from "./Component";
import { Fn, Type, Effect } from "./Types";
import { Subject } from "rxjs";
import { TOUCH_END } from "./Constants";
import { GlobalEnv } from "./GlobalEnv";
import { GlobalAction } from "./GlobalAction";
import { modify } from "./BaseFunction";

const {ccclass, property} = cc._decorator

@ccclass
export class BaseComponent<State, Action extends Type<any, any>> extends cc.Component implements Component<State, Action> {
    state: State;
    // actions: Subject<Action>;


    eval (action: Action) {}

    query<T>(extractor: Fn<State, T>) {
        return extractor(this.state);
    }

    close () {
        if (this.node.parent) {
            this.node.parent.removeChild(this.node);
        }
    }

    onTouchEnd(node: cc.Node, action: Action) {
        node.on(TOUCH_END, () => this.fork(action));
    }


    onTouchEndEffect(node: cc.Node, func: Effect<Action>) {
        node.on(TOUCH_END, () => {
            let action = func();
            if (action) {
                this.fork(action)
            }
        });
    }


    /**
     * 将一个action 作为下一个要处理的Action
     */
    fork (action: Action) {
        if (action) {
            this.eval(action);
        }
    }

    /**
     * 向全局发射事件，关心此事件的地方
     * 可以filter指定事件名字，然后监听
     */
    dispatch(action: GlobalAction) {
        GlobalEnv.getInstance().dispatchAction(action);
    }

}