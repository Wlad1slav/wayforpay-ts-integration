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
};

export type TSignatureListTransactions = {
    merchantAccount: string;
    dateBegin: number; // timestamp
    dateEnd: number; // timestamp
};
