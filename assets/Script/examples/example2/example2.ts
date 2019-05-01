import * as R from "ramda"
import * as Rx from "rxjs"
import { BaseComponent } from "../../basic/BaseComponent";
import { Type, Action } from "../../basic/Types";
import { modify } from "../../basic/BaseFunction";
import TaskItem from "./TaskItem";
/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */
type Action
    = Type<"AddTask", string> 

type State = {
    tasks: Rx.BehaviorSubject<Array<string>>
}

const { ccclass, property } = cc._decorator;


@ccclass
export default class Example2 extends BaseComponent<State, Action> {
    @property(cc.EditBox)
    editbox: cc.EditBox = null;
    @property(cc.Button)
    addButton: cc.Button = null;
    @property(cc.Layout)
    taskGroup: cc.Layout = null;
    @property(cc.Prefab)
    taskItem: cc.Prefab = null;
    @property(cc.Label)
    btnLabel: cc.Label = null;


    start () {
        this.actions = new Rx.Subject<Action>();
        this.onTouchEndEffect(this.addButton.node, () => Action("AddTask", this.editbox.string));
        this.state = {
            tasks: new Rx.BehaviorSubject<Array<string>>([])
        };
        this.actions.subscribe({ next: action => this.eval(action) });
        this.state.tasks.subscribe({ next: tasks => this.render(tasks)});
    }

    eval (action: Action) {
        switch(action.typeName) {
            case "AddTask": {
                let value = action.value;
                if (value != "") {
                    modify(this.state.tasks, R.append(value));
                }
                break;
            }
        }
    }

    render(tasks: Array<string>) {
        let genTaskItem = (content: string) => {
            let taskItem = cc.instantiate(this.taskItem).getComponent(TaskItem);
            taskItem.render(content);
            return taskItem;
        }
        this.taskGroup.node.removeAllChildren();
        tasks.map(genTaskItem).forEach(ti => ti.node.parent = this.taskGroup.node);
        this.btnLabel.string = `Add #${tasks.length + 1}`;
    }
}