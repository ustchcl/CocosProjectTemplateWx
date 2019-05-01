
/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskItem extends cc.Component {
    @property(cc.Label)
    taskContentLabel: cc.Label = null;

    render (content: string) {
        this.taskContentLabel.string = content;
    }
}