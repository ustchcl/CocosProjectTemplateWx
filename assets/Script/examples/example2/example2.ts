import * as R from "ramda"
import * as Rx from "rxjs"
import { BaseComponent } from "../../basic/BaseComponent";
import { Type, Action, TypeUnit, ActionUnit } from "../../basic/Types";
import { modify } from "../../basic/BaseFunction";
import TaskItem from "./TaskItem";
import { notifySub } from "../../basic/WxApi";
/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */
type Action
    = Type<"AddTask", string>
    | TypeUnit<"SwitchMode">

type State = {
    tasks: Rx.BehaviorSubject<Array<string>>;
    subcontextState: Rx.BehaviorSubject<boolean>;
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
    @property(cc.Button)
    subButton: cc.Button = null;
    @property(cc.Label)
    subLabel: cc.Label = null;


    start () {
        this.onTouchEndEffect(this.addButton.node, () => Action("AddTask", this.editbox.string));
        this.onTouchEnd(this.subButton.node, ActionUnit("SwitchMode"));

        this.state = {
            tasks: new Rx.BehaviorSubject<Array<string>>([]),
            subcontextState: new Rx.BehaviorSubject<boolean>(false)
        };
        this.state.tasks.subscribe({ next: tasks => this.renderTaskItems(tasks)});
        this.state.subcontextState.subscribe({ next: show => this.renderSubState(show) });
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
            case "SwitchMode": {
                modify(this.state.subcontextState, R.not);
                break;
            }
        }
    }

    /**
     * 类似的web框架，是自己建立一个VDOM， 然后Diff VDOM, 判断哪些需要重新渲染。性能会更好
     * 此处没有实现类似的virtual component, 性能可能会有问题？
     * @param tasks 任务列表
     */
    renderTaskItems(tasks: Array<string>) {
        let genTaskItem = (content: string) => {
            let taskItem = cc.instantiate(this.taskItem).getComponent(TaskItem);
            taskItem.setContent(content);
            return taskItem;
        }
        this.taskGroup.node.removeAllChildren();
        tasks.map(genTaskItem).forEach(ti => ti.node.parent = this.taskGroup.node);
        this.btnLabel.string = `Add #${tasks.length + 1}`;
    }

    renderSubState(show: boolean) {
        notifySub(show ? ActionUnit("ShowUserInfo") : ActionUnit("HideUserInfo"));
        this.subLabel.string = show ? "hide sub" : "show sub";
    }
}
