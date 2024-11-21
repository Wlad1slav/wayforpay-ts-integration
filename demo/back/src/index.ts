import express, {Request, Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// import {
//     TCartElement,
//     TProduct,
//     TUserCartElement,
//     Wayforpay
// } from "wayforpay-ts-integration-test";

import {TCartElement, TProduct, TUserCartElement, Wayforpay} from "./dev";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const products: TProduct[] = [
    {id: '1', name: "Example product 1", price: 0.5},
    {id: '2', name: "Example product 2", price: 15},
    {id: '3', name: "Example product 3", price: 700},
    {id: '4', name: "Example product 4", price: 0.5},
    {id: '5', name: "Example product 5", price: 300},
];

const wayforpay = new Wayforpay({
    merchantLogin: process.env.MERCHANT_LOGIN as string,
    merchantSecret: process.env.MERCHANT_SECRET_KEY as string,
    domain: process.env.DOMAIN as string,
});

app.post('/api/wayforpay/checkout', async (req: Request, res: Response) => {
    const {userCart}: {
        userCart: TUserCartElement[];
    } = req.body;

    if (userCart && userCart.length > 0) {
        const cart = userCart.map(item => {
            const product = products.find(product => product.id === item.id);
            if (product) {
                return {
                    quantity: item.quantity,
                    product
                } as TCartElement;
            } else {
                console.error(`Product with ID ${item.id} does not exist`);
                return null;  // Return null for invalid products
            }
        }).filter(Boolean);  // Filter out null values from the array

        // Creates a form for a request to wayforpay
        const form = await wayforpay.createForm(cart as TCartElement[], {
            currency: 'UAH',
            deliveryList: ["nova","other"],
        });

        return res.send(form);
    } else {
        console.error('No product IDs were specified');
    }
});

app.post('/api/wayforpay/transactions', async (req: Request, res: Response) => {
    const dateBegin = Math.floor(new Date('2023-10-29').getTime() / 1000);
    const dateEnd = Math.floor(Date.now() / 1000);
    console.log({dateBegin, dateEnd});

    const transactions = await wayforpay.getTransactions();
    return res.json(transactions.data);
});

app.get('/api/wayforpay/checkout', async (req: Request, res: Response) => {
    const { id } = req.query;
    let cart: (TCartElement | null)[] = [];

    if (Array.isArray(id)) {
        cart = id.map(item => {
            const product = products.find(product => product.id === item);
            if (product) {
                return {
                    quantity: 1,
                    product
                } as TCartElement;
            } else {
                console.error(`Product with ID ${item} does not exist`);
                return null;
            }
        }).filter(Boolean);
    }

    const form = await wayforpay.createForm(cart as TCartElement[], {
        currency: 'UAH',
        deliveryList: ["nova","other"],
    });

    return res.send(form);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
