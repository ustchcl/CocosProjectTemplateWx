import { Type, TypeUnit, ActionUnit, Action } from "../basic/Types";
import { BehaviorSubject, Subject } from "rxjs";
import { add, always } from "ramda"
import { modify } from "../basic/BaseFunction";
import { BaseComponent } from "../basic/BaseComponent";

const {ccclass, property} = cc._decorator

interface State {
    count: BehaviorSubject<number>;
}

type Action 
    = TypeUnit<"Inc">
    | TypeUnit<"Dec"> 
    | Type<"Set", number>

@ccclass
export class Example1 extends BaseComponent<State, Action> {
    @property(cc.Button)
    minusButton: cc.Button = null;
    @property(cc.Button)
    plusButton: cc.Button = null;
    @property(cc.Label)
    contentLabel: cc.Label = null;
    @property(cc.Button)
    maxButton: cc.Button = null;

    readonly MAX_SIZE = 999;
    readonly initial = 0;

    start () {
        this.actions = new Subject<Action>();
        this.onTouchEnd(this.minusButton.node, ActionUnit("Dec"));
        this.onTouchEnd(this.plusButton.node, ActionUnit("Inc"));
        this.onTouchEnd(this.maxButton.node, Action("Set", this.MAX_SIZE));
        this.state = {
            count: new BehaviorSubject<number>(this.initial)
        };
        this.actions.subscribe({ next: action => this.eval(action) });
        this.state.count.subscribe({ next: count => this.render(count)});
    }

    render(count: number) {
        this.contentLabel.string = String(count);
    }

    eval (action: Action) {
        switch (action.typeName) {
            case "Dec": {
                modify(this.state.count, add(-1))
                break;
            }
            case "Inc": {
                modify(this.state.count, add(1))
                break;
            }
            case "Set": {
                modify(this.state.count, always(action.value));
                break;
            }
        }
    }
}