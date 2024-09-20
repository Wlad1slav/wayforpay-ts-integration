# 💳 wayforpay-ts-integration

![Package version](https://img.shields.io/npm/v/wayforpay-ts-integration)
![MIT License](https://img.shields.io/badge/license-ISC-green.svg)

**wayforpay-ts-integration** is a package for easy integration with the Wayforpay payment system. It allows you to create a redirect to the payment page at any point in the client-side code. After a request to your API, the package generates a form that can be automatically executed on the client-side, redirecting the user to the payment page.

🇺🇦 [Українська README.md](/README-UK.md)

## ✨ Features

- [X] Generation of a form for redirecting to the payment page with the ability to automatically execute it on the client
- [X] Signature generation for secure transaction verification
- [ ] Prohibition of unsafe functions on the client side
- [ ] Order status tracking
- [ ] Ability to cancel an order

![checkout-demo](https://github.com/user-attachments/assets/5ceb9ac8-dcf5-4413-8ad8-9a6ffa1356dc)

## 🚀 Implementation Guide

- Create a store in Wayforpay
- Environment Variables
- Install package
- Usage
  - Form generation
    - Express.js example
    - Next.js example
  - Form execution

### 🏪 Create a store in wayforpay

Log in to the Wayforpay platform through the [official website](https://m.wayforpay.com/account/site/login).

After authorization, go to the `Store settings` section in the side menu. You will see a list of your stores. If there are no stores yet, click `Create a store`. Don't forget to specify the store's domain. If you haven't decided on a domain yet, enter a temporary one.

### 🔑 Environment Variables

After creating the store, go to its settings. There, find the `Merchant details` card, where you will find `Merchant login` and `Merchant secret key`. These data need to be added to the `.env` file in the root directory of your project.

- `DOMAIN` — the domain of your Wayforpay store
- `CURRENCY` — the currency used in your store
- `MERCHANT_LOGIN` — the merchant login from the store settings
- `MERCHANT_SECRET_KEY` — the merchant secret key from the store settings

> [!CAUTION]
> **Do not use** the `createForm` and `createSignature` methods on the client side. This may compromise your secret key. Use these methods only on the server side (for example, in your API).

[Example .env file](https://github.com/Wlad1slav/wayforpay-ts-integration/blob/main/packages/backend/.env.example)

### 📦 Install package

After setting up the store, install the npm package on your Node.js server:

```bash
npm i wayforpay-ts-integration
```
### 🛠 Usage

#### 📝 Form generation

On the server side, you need to generate a form for redirecting the user to the payment page.

##### Express.js example
```typescript
import express, {Request, Response} from 'express';
import dotenv from 'dotenv';

import {
  TCartElement,
  TProduct,
  TUserCartElement,
  createForm
} from "wayforpay-ts-integration";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

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
```

##### Next.js example (with app router)
```typescript
import {
  TCartElement,
  TUserCartElement,
  createForm
} from "wayforpay-ts-integration";
import {Product} from "@/lib/services/woocommerce-api";

export async function POST(request: Request) {
    const {cart: userCart}: {
        cart: TUserCartElement[];
    } = await request.json();

    const cart = await Product.generateCart(userCart);

    const form = await createForm(cart as TCartElement[], {
        deliveryList: "nova;ukrpost;other"
    });

    return new Response(form, {
        headers: {
            'Content-Type': 'text/html',
        },
    });
}
```

The `createForm` function creates a payment form. The second parameter is an object with a configuration where you can pass any field [supported by Wayforpay](https://wiki.wayforpay.com/view/852102).

```typescript
const form = await createForm(cart as TCartElement[], {
  deliveryList: "nova;ukrpost;other"
});

return res.send(form);
```

#### 📤 Form execution
On the client side, the form needs to be inserted into the DOM and automatically executed. Here is an example of a React component that redirects the client to the payment page upon clicking a button:

```tsx
import axios from "axios";

function GoToPaymentButton() {
    const cart = [
        { id: '1', quantity: 1 },
        { id: '4', quantity: 7 },
    ];

    const handleGoToPay = async () => {
        // Here is the domain of your server and the route by which the form is received
        const response = await axios.post('http://localhost:3000/api/wayforpay/checkout', {
            userCart: cart
        });

        // Gets form's HTML from the backend
        const html = await response.data;

        // Check if the container already exists, if not, create it
        let handlePay = document.getElementById('handlePay');
        if (!handlePay) {
            handlePay = document.createElement('div');
            handlePay.id = 'handlePay';
            document.body.appendChild(handlePay);
        }

        // Add the form's HTML to the container
        handlePay.innerHTML = html;

        // Find and submit the form
        const form = document.getElementById('wayforpayForm') as HTMLFormElement;
        if (form) {
            form.submit(); // Completes the form
        }
    };

    return (
        <button onClick={handleGoToPay} type="button">Go to payment</button>
    );
}

export default GoToPaymentButton;
```

## Author

[@Wlad1slav](https://github.com/Wlad1slav)

## License

ISC
