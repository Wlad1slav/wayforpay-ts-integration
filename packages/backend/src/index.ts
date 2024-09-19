import express, {Request, Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {TCartElement, TProduct, TUserCartElement} from "wayforpay-ts-integration";
import createForm from "wayforpay-ts-integration/dist/utils/createForm";

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

        // Creates a form for a request to wayforpay
        const form = await createForm(cart as TCartElement[], {
            deliveryList: "nova;ukrpost;other"
        });

        return res.send(form);
    } else {
        console.error('No product IDs were specified');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
