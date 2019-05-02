import { Fn } from "./Types";
import { BehaviorSubject, Observable } from "rxjs"
import * as R from "ramda"
import { Maybe } from "./Maybe"

/**
 * 用一个函数更新BehaviorSubject的值，调用其next方法
 * @param subject 想要更新值的BehaviorSubjuect
 * @param func 更新函数
 */
export function modify<T>(subject: BehaviorSubject<T>, func: Fn<T, T>) {
    subject.next(func(subject.getValue()))
}

/**
 * 用一个值覆盖BehaviorSubject的值，调用其next方法
 * @param subject 想要更新值的BehaviorSubjuect
 * @param func 想要设置的值
 */
export function set<T>(subject: BehaviorSubject<T>, val: T) {
    subject.next(val);
}

export function eventToBehavior<T>(
    node: cc.Node, 
    eventType: string, 
    resultSelector: Fn<cc.Event.EventCustom, T>,
    initial: T
): BehaviorSubject<T> {
    let behavior = new BehaviorSubject(initial);
    let handler = (e: cc.Event.EventCustom) => {
        behavior.next(resultSelector(e));
    }
    node.on(eventType, handler);
    return behavior;
}

export function eventToObservable<T>(
    node: cc.Node, 
    eventType: string, 
    resultSelector?: Fn<cc.Event.EventCustom, T>,
): Observable<T> {
    return new Observable<T>(subscriber => {
        let handler = (e: cc.Event.EventCustom) => {
            if (resultSelector == undefined) {
                subscriber.next(null);
            } else {
                subscriber.next(resultSelector(e));
            }
        }
        node.on(eventType, handler);
        subscriber.add(() => node.off(eventType, handler));
    });
}

/**
 * Create flexibly-numbered lists of integers.
 * `range(5); // -> [0, 1, 2, 3, 4]`
 * `range(0, 5, 2); // -> [0, 2, 4]`
 */
export function range(start: number, end?: number, step?: number): number[] {
    if (end == null) {
        end = start || 0;
        start = 0;
    }

    if (!step) step = end < start ? -1 : 1;

    let len = Math.max(Math.ceil((end - start) / step), 0);
    let ret = Array(len);

    for (let i = 0; i < len; i++, start += step) ret[i] = start;
    return ret;
}

/**
 * Produces a random number between min and max(inclusive).
 * `random(1, 5); // -> an integer between 0 and 5`
 * `random(5); // -> an integer between 0 and 5`
 * `random(1.2, 5.2, true); /// -> a floating-point number between 1.2 and 5.2`
 */
export function random(min: number, max?: number, floating?: boolean): number {
    if (max == null) {
        max = min;
        min = 0;
    }
    let rand = Math.random();
    if (floating || min % 1 || max % 1) {
        return Math.min(
            min +
                rand *
                (max - min + parseFloat('1e-' + ((rand + '').length - 1))),
            max
        )
    } else {
        return min + Math.floor(rand * (max - min + 1));
    }
}

/**
 * 将数组长度设置为n
 * `fixLength([1, 2, 3], 2); // [Just 1, Just 2]`
 * `fixLength([1], 2); // [Just 1, Nothing]`
 */
export function fixLength<T>(arr: Array<T>, n: number): Array<Maybe<T>> {
    let result = R.take(n, arr).map(Maybe.Just);
    return R.concat(result, R.repeat(Maybe.Nothing<T>(), n - result.length));
}

/**
 * return anything that you give to it;
 */
export function id<T>(x: T):T {
    return x;
}
