import { Fn, Fn2 } from "./Types";

// Promise的fmap
export async function pmap<T, U>(pt: Promise<T>, func: Fn<T, U>): Promise<U> {
    return pt.then(func);
}

function foldParams2<T, U, V>(func: Fn2<T, U, V>):Fn<[T, U], V> {
    return arr => func(arr[0], arr[1]);
}

// Promise的lift
export function plift<T, U, V>(pt: Promise<T>, pu: Promise<U>, func: Fn2<T, U, V>): Promise<V> {
    return Promise.all([ pt, pu ]).then(foldParams2(func));
}

// Promise的sequence
export function psequence<T>(pts: Array<Promise<T>>): Promise<Array<T>> {
    return Promise.all(pts);
}