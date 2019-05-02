import * as R from "ramda"
import * as Rx from "rxjs"
import { BaseComponent } from "../../basic/BaseComponent";
import { TypeUnit, ActionUnit, Action } from "../../basic/Types";
import ChildComponent from "./ChildComponent";
import { modify } from "../../basic/BaseFunction";
/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */
type Action
     = TypeUnit<"Inc">
     | TypeUnit<"Dec">

type State = {
    count: Rx.BehaviorSubject<number>
}

const { ccclass, property } = cc._decorator;


@ccclass
export default class ContainerComponent extends BaseComponent<State, Action> {
    @property(ChildComponent)
    child1: ChildComponent = null;
    @property(ChildComponent)
    child2: ChildComponent = null;
    @property(ChildComponent)
    child3: ChildComponent = null;
    @property(cc.Label)
    countLabel: cc.Label = null;
    @property(cc.Button)
    incBtn: cc.Button = null;
    @property(cc.Button)
    decBtn: cc.Button = null;

    start () {
        this.state = {
            count: new Rx.BehaviorSubject(1)
        }
        this.state.count.subscribe({ next: count => this.renderCount(count) });
        this.onTouchEnd(this.incBtn.node, ActionUnit("Inc"));
        this.onTouchEnd(this.decBtn.node, ActionUnit("Dec"));
    }

    eval(action: Action) {
        switch(action.typeName) {
            case "Dec": {
                modify(this.state.count, R.add(-1));
                break;
            }
            case "Inc": {
                modify(this.state.count, R.add(1));
                break;
            }
        }
    }

    renderCount(count: number) {
        this.countLabel.string = `The original value is: ${String(count)}`;
        this.child1.fork(Action("HandleInput", count * 2));
        this.child2.fork(Action("HandleInput", count * 10));
        this.child3.fork(Action("HandleInput", count * count));
    }
}