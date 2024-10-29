export * from './requests';

export type TCartElement = {
    quantity: number;
    product: {
        name: string;
        price: number;
    };
};

export type TUserCartElement = {
    id: string;
    quantity: number;
};

export type TProduct = {
    id: string;
    name: string;
    price: number;
};

export type TWayforpayOptions = {
    domain: string;
    merchantLogin: string;
    merchantSecret: string;
};

export type TSignaturePayment = {
    merchantLogin: string;
    domain: string;
    orderDate: number;
    invoice: string;
    totalPrice: number;
    currency: string;
    namesString: string;
    quantitiesString: string;
    pricesString: string;
}


