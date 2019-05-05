import { Shephy } from "./Shephy";

export type CardType
    = "All Purpose"
    | "Be Fruitful"
    | "Crowding"
    | "Dominion"
    | "Falling Rock"
    | "Fill the Earth"
    | "Flourish"
    | "Golden Hooves"
    | "Inspiration"
    | "Lighting"
    | "Meteor"
    | "Plague"
    | "Planning"
    | "Sheep Dog"
    | "Shephion"
    | "Slump"
    | "Storm"
    | "Wolves"


export class Card {
    type: CardType;

    constructor (cardType: CardType) {
        this.type = cardType;
    }

    static gen(cardType: CardType) {
        return new Card(cardType);
    }
}
