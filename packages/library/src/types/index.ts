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