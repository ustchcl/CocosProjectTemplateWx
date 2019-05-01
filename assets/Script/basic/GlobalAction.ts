import { TypeUnit, Type } from "./Types";

export type GlobalAction 
    = TypeUnit<"GameOver">
    | Type<"Something", number>