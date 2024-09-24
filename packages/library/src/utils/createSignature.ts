import * as crypto from 'crypto';
import {envSpecifiedError, notSupportedInBrowser} from "../messages";

export const createSignature = (data: {
    orderDate: number;
    totalPrice: number;
    namesString: string;
    quantitiesString: string;
    pricesString: string;
}) => {
    if (typeof window !== 'undefined') {
        throw new Error(notSupportedInBrowser);
    }

    const merchantSecret = process.env.MERCHANT_SECRET_KEY as string;
    const { DOMAIN: domain, MERCHANT_LOGIN: merchantLogin, CURRENCY: currency } = process.env;

    if (!domain || !merchantSecret || !merchantLogin || !currency) {
        console.error(envSpecifiedError);
    }

    const signature = `${merchantLogin};${domain};${data.orderDate};${data.orderDate};${data.totalPrice};${currency};${data.namesString};${data.quantitiesString};${data.pricesString}`;

    return (
        crypto.createHmac('md5', merchantSecret)
            .update(signature)
            .digest('hex')
    );
};
