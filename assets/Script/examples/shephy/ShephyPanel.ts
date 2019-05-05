import { BehaviorSubject, Subject } from "rxjs";
import { add, always } from "ramda"
import { TypeUnit, Type } from "../../basic/Types";
import { CardType, Card } from "./Card";
import { BaseComponent } from "../../basic/BaseComponent";

const {ccclass, property} = cc._decorator

type TurnState = "TurnStart" | "Select" | "Confirm" | "ExtraSelect" | "ExtraConfirm" | "Settle" | "TurnEnd"


type CardList = Card [];

interface State {
    count: BehaviorSubject<number>;
    hand: BehaviorSubject<CardList>;
    deck: BehaviorSubject<CardList>;
    discardPile: BehaviorSubject<CardList>
    exilePile: BehaviorSubject<CardList>

}

type Action 
    = Type<"PlayCard", number>
    | TypeUnit<"TurnStart">
    | Type<"Select", number>
    | TypeUnit<"Confirm"> 
    | Type<"ExtraSelect", number>
    | TypeUnit<"Settle">

@ccclass
export class ShephyPanel extends BaseComponent<State, Action> {
    start () {
    
    }

    eval(action: Action) {
        switch(action.typeName) {
            case "PlayCard": {
                let hand = this.state.hand.getValue();
                if (hand[action.value]) {
                    // play this card

                }
            }
        }
    }

    playCard(cardType: CardType, index: number) {
        switch (cardType) {
            case "All Purpose": {

            }
        }

    }


}
