import * as crypto from 'crypto';

const createSignature = (data: {
    orderDate: number;
    totalPrice: number;
    namesString: string;
    quantitiesString: string;
    pricesString: string;
}) => {
    const merchantSecret = process.env.MERCHANT_SECRET_KEY as string;
    const { DOMAIN: domain, MERCHANT_LOGIN: merchantLogin, CURRENCY: currency } = process.env;

    const signature = `${merchantLogin};${domain};${data.orderDate};${data.orderDate};${data.totalPrice};${currency};${data.namesString};${data.quantitiesString};${data.pricesString}`;

    return (
        crypto.createHmac('md5', merchantSecret)
            .update(signature)
            .digest('hex')
    );
};

export default createSignature;
