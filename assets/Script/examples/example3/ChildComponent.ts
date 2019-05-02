import * as R from "ramda"
import * as Rx from "rxjs"
import { Type } from "../../basic/Types";
import { BaseComponent } from "../../basic/BaseComponent";
import { modify, set } from "../../basic/BaseFunction";
/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */
type Action = Type<"HandleInput", number>

type State = {
    value: Rx.BehaviorSubject<number>
}

const { ccclass, property } = cc._decorator;


@ccclass
export default class ChildComponent extends BaseComponent<State, Action> {
    @property(cc.Label)
    displayLabel: cc.Label = null;

    onLoad () {
        this.state = {
            value: new Rx.BehaviorSubject<number>(0)
        }
        this.state.value.subscribe({ next: value => this.renderState(value) });
    }

    renderState(value: number) {
        this.displayLabel.string = `My input value is ${String(value)}`;
    }

    eval(action: Action) {
        switch(action.typeName) {
            case "HandleInput": {
                set(this.state.value, action.value);
                break;
            }
        }
    }
}