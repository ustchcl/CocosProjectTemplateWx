import { Fn } from "../../basic/Types";
import * as R from "ramda"
import { empty } from "rxjs";
import { erase, pop, shuffle } from "../../basic/Array";
import { count } from "../../basic/BaseFunction";

type CardList = Card [];

type GameResult = {
    result: string;
    description: string;
}

export type SheepType 
    = "1" 
    | "3"
    | "10"
    | "30"
    | "100"
    | "300"
    | "1000"

export type FieldType = SheepType | "Empty"

export type Stock = {
    "1": number;
    "3": number;
    "10": number;
    "30": number;
    "100": number;
    "300": number;
    "1000": number;
}



export class Shephy {
    field: FieldType[];
    deck: CardList;
    enemySheepCount: number;
    hand: CardList;
    discardPile: CardList;
    exilePile: CardList
    sheepyStock: Stock;

    // 获得指定等级的一张卡
    gain(rank: SheepType) {
        if (this.sheepyStock[rank] == 0) {
            return;    
        } else if (this.field.filter(x => x != "Empty").length == 7) {
            return;
        } else {
            let findAndUpdate = (oldValue: FieldType, newValue: FieldType, arr: FieldType[]) => {
                let index = R.findIndex(x => x == oldValue, arr);
                return index == -1 ? arr : R.update(index, newValue, arr);
            }
            this.sheepyStock[rank] -= 1;
            this.field = findAndUpdate("Empty", rank, this.field);
        }
    }

    // 释放指定位置的field上的 :sheep:
    release (index: number) {
        if (this.field[index] == "Empty") {
            return;
        }
        this.sheepyStock[this.field[index]] += 1;
        this.field[index] = "Empty";
    }

    // 丢弃手牌中指定的卡牌
    discard(index: number) {
        let card = this.hand[index];
        if (card) {
            this.hand = erase(this.hand, index, 1);
            this.discardPile = R.append(card, this.discardPile);
        }
    }

    // 从游戏中移除卡牌
    exile(index: number) {
        let card = this.hand[index];
        if (card) {
            this.hand = erase(this.hand, index, 1);
            this.exilePile = R.append(card, this.exilePile);
        }
    }

    draw() {
        let re = pop(this.deck);
        this.deck = re.result;
        if (re.value.valid) {
            this.hand = R.append(re.value.val, this.hand);
        }
    }

    remakeDeck() {
        this.deck = shuffle(R.concat(this.deck, this.discardPile));
        this.discardPile = [];
    }

    shouldDraw() {
        return this.hand.length < 5 && this.deck.length > 0;
    }

    judgeGame(): GameResult {
        if (this.field.filter(x => x == "1000").length > 0) {
            return {
                "result": 'win',
                "description": "You win"
            }
        }

        if (this.enemySheepCount == 1000) {
            return {
                "result": "lose",
                "description": "You lose, enemies reached 1000 sheep"
            }
        }

        if (count("Empty", this.field) == 7) {
            return {
                "result": "lose",
                "description": "Yout lost all your sheep - you lose"
            }
        }
    }
}




export function makeInitialWorld () {
    
}
