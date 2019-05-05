import { Type, TypeUnit } from "./basic/Types";

/**
 * 此处为主域和子域通信的类型定义，应保证两边的Message.ts一致
 */

export type Message
    = TypeUnit<"ShowUserInfo">
    | TypeUnit<"HideUserInfo">
