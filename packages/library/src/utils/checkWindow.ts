import {notSupportedInBrowser} from "../messages";

export function CheckWindow(
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
): PropertyDescriptor {
    if (typeof window !== 'undefined') {
        throw new Error(notSupportedInBrowser);
    }
    return descriptor;
}
