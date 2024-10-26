import express, {Request, Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import {
    TCartElement,
    TProduct,
    TUserCartElement,
    Wayforpay
} from "wayforpay-ts-integration-test";

// import {TCartElement, TProduct, TUserCartElement} from "../dev/utils/types";
// import {Wayforpay} from "../dev";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const products: TProduct[] = [
    {id: '1', name: "Example product 1", price: 100},
    {id: '2', name: "Example product 2", price: 15},
    {id: '3', name: "Example product 3", price: 700},
    {id: '4', name: "Example product 4", price: 80},
    {id: '5', name: "Example product 5", price: 300},
];

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

        const wayforpay = new Wayforpay({
            merchantLogin: process.env.MERCHANT_LOGIN as string,
            merchantSecret: process.env.MERCHANT_SECRET_KEY as string,
            currency: process.env.CURRENCY as string,
            domain: process.env.DOMAIN as string,
        })

        // Creates a form for a request to wayforpay
        const form = await wayforpay.createForm(cart as TCartElement[], {
            deliveryList: "nova;other"
        });

        return res.send(form);
    } else {
        console.error('No product IDs were specified');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
