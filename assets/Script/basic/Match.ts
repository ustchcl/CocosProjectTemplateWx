import { Type, TypeUnit, Fn } from "./Types";


type Test
    = Type<"A", number>
    | Type<"B", string>
    | TypeUnit<"C">

export function test(t: Test) {
    switch (t.typeName) {
        case "A": return 1;
        case "B": return 2;
        case "C": return 3;
    }
}


let t: Test = {typeName: "B", value: ""};
console.log(test(t));
