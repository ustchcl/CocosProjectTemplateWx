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
        this.onTouchEndEffect(this.addButton.node, () => Action("AddTask", this.editbox.string));
        this.state = {
            tasks: new Rx.BehaviorSubject<Array<string>>([])
        };
        this.state.tasks.subscribe({ next: tasks => this.renderTaskItems(tasks)});
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
}