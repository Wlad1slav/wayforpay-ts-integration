# 💳 wayforpay-ts-integration

![Package version](https://img.shields.io/npm/v/wayforpay-ts-integration)
![MIT License](https://img.shields.io/badge/license-ISC-green.svg)

wayforpay-ts-integration — a TypeScript SDK for integrating with the Wayforpay payment system. The package provides easy
access to the Wayforpay API for processing payments, creating payment forms, retrieving transaction lists, and regular payments.

🇺🇦 [Українська README.md](/README-UK.md)

```bash
npm i wayforpay-ts-integration
```

## ✨ Features

- [X] Payments
- [X] Creating a link to the checkout page
- [ ] One-Click Payment
- [ ] Payment Widget
- [ ] Card Verification (Verify)
- [ ] Invoicing (Invoice)
- [ ] Card Top-Up for Individuals (Account2card)
- [ ] Funds Transfer to Bank Account (Account2account)
- [X] API for Transaction List Retrieval
- [ ] Online Lending
- [ ] Online Taxi Payment
- [ ] Anti-Fraud API
- [X] Regular Payments
- [ ] Payment Modules for CMS
- [ ] Store/Partner Creation
- [ ] Payment QR Code Creation
- [ ] PCI DSS
- [ ] Currency Rates Retrieval

![checkout-demo](https://github.com/user-attachments/assets/5ceb9ac8-dcf5-4413-8ad8-9a6ffa1356dc)

## 🏪 Creating a Store in Wayforpay

Log in to the Wayforpay platform through the [official website](https://m.wayforpay.com/account/site/login).

After logging in, go to the **Store Settings** section in the sidebar. You will see a list of your stores.
If there is no store yet, click **Create Store**. Don't forget to specify the store's domain.
If you haven't decided on a domain yet, enter a temporary one.

### 🔑 Tokens

After creating the store, go to its settings. There, find the **Merchant Details** section, where you will see the
**Merchant login** and **Merchant secret key**. You need to specify these details in the options for the `Wayforpay`
class or add them to the `.env` file in the root directory of your project.

- `MERCHANT_LOGIN` — the merchant login from the store settings
- `MERCHANT_SECRET_KEY` — the merchant secret key from the store settings

> [!CAUTION]
> **Do not use** the methods of this package on the client side. This may compromise your secret key. Use the
> functionality only on the server side (e.g., in your API).

## 📦 Installing the Package

After setting up the store, install the npm package on your Node.js server:

```bash
npm i wayforpay-ts-integration
```

### 🛠 Usage

#### 📝 Payments

To create payments, Wayforpay accepts only simple HTTP requests with the POST method and a unique signature included. You don’t need to worry about how the signature is generated or the specific format required, as this is all handled by this package’s functionality.

Here’s what you need to know:

1. The user sends a request to the server.
2. The server uses our package to generate an HTML form based on the client’s cart.
3. The generated form, with a unique signature, is sent back to the user.
4. You automatically execute the form for the user on the client side OR redirect the user to a page with this form and a script for its execution.
5. After the form is submitted, the user is redirected to the Wayforpay page for order payment.

In the `Wayforpay` class, you specify your merchant’s data. The `purchase` method generates an HTML form for payment, which should be automatically executed on the client side for the user.

The first parameter is the user’s cart. It should be passed as an array of objects with the `TCartElement` type.

| Property        | Type   | Description                        |
|-----------------|--------|------------------------------------|
| `quantity`      | number | Quantity of products in the basket |
| `product`       | object | Product details                    |
| `product.name`  | string | Product name                       |
| `product.price` | number | Product price                      |

The second parameter is a configuration object, where you can pass any field [supported by Wayforpay](https://wiki.wayforpay.com/view/852102).

```typescript
import {Wayforpay, TCartElement} from "wayforpay-ts-integration";

const wayforpay = new Wayforpay({
    merchantLogin: 'test_merch_n1',
    merchantSecret: 'flk3409refn54t54t*FNJRET'
});

const form = await wayforpay.purchase(cart as TCartElement[], {
    domain: 'www.market.ua',
    currency: 'UAH'
});
```

#### Additional documentation
- https://wiki.wayforpay.com/view/852102

#### POST example

```typescript
import {Wayforpay, TCartElement, TProduct, TUserCartElement} from "wayforpay-ts-integration";

const products: TProduct[] = [
  {id: '1', name: "Example product 1", price: 100},
  {id: '2', name: "Example product 2", price: 15}
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
    });

    // Creates a form for a request to wayforpay
    const form = await wayforpay.purchase(cart as TCartElement[], {
      domain: 'example.com',
      currency: 'UAH',
      deliveryList: ["nova", "other"],
    });

    return res.send(form);
  } else {
    console.error('No product IDs were specified');
  }
});
```

On the client side, the form needs to be inserted into the DOM and automatically executed. Here is an example of a React
component that redirects the client to the payment page upon clicking a button:

```tsx
import axios from "axios";

function GoToPaymentButton() {
    const cart = [
        {id: '1', quantity: 1},
        {id: '4', quantity: 7},
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

    return <button onClick={handleGoToPay} type="button">Go to payment</button>;
}
```

#### GET example

If you want to avoid unnecessary POST requests, you can redirect the user to a page with this form. The package automatically adds a script to the form to handle its submission, so all you need to do is create a GET API route that generates the form based on the parameters specified in the URL and redirect the user to this route.

```typescript
import {NextRequest, NextResponse} from "next/server";
import {TCartElement, TRequestPayment, TWayforpayAvailableCurrency, Wayforpay} from "wayforpay-ts-integration";
import {decrypt} from "@/lib/secret";
import { hookMerchant } from "@/lib/api-hooks";

export async function GET(request: NextRequest) {
    const merchant = await hookMerchant('Wayforpay');
    if (!merchant)
        return NextResponse.json({message: 'This merchant does not exist'}, {status: 400});

    const merchantData = merchant.data as {
        merchantLogin: string;
    };

    const options = await hookOptions('Wayforpay');

    let optionsData: {
        currency: TWayforpayAvailableCurrency,
        domain: 'example.com',
        [key: string]: string
    } = { currency: 'USD' };

    for (const option of options) {
        optionsData[option.key] = option.value;
    }

    const wfp = new Wayforpay({
        merchantLogin: merchantData.merchantLogin,
        merchantSecret: decrypt(merchant.secret)
    });

    const {searchParams} = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId)
        return NextResponse.json({message: 'No required parameters found'}, {status: 400});

    const product = await hookProduct(productId);

    const cart: TCartElement[] = [product];

    const form = await wfp.purchase(cart, optionsData as TRequestPayment);

    return new Response(form, {
        headers: { 'Content-Type': 'text/html' }
    });
}
```

Next, it's enough to simply redirect the user to this API. For example: `window.location.href = 'https://example.com/api/public/v1/wayforpay?id=12';`.

### 📋 Retrieving the List of Transactions

A transaction list request is used to obtain a list of store transactions for a specific period.

The maximum period for which you can receive transactions is 31 days.

#### Additional documentation
- https://wiki.wayforpay.com/view/1736786

```typescript
const wayforpay = new Wayforpay({
    merchantLogin: 'test_merch_n1',
    merchantSecret: decrypt(merchant.secret)
});

const response = await wayforpay.getTransactions();
const transactions = response.data;
```

### 📋 Regular Payments

A method for interacting with regular payments.

> [!NOTE]  
> The integration of this functionality is considered individually for each store. To proceed, contact sales@wayforpay.com, specifying the merchant's login, describing the situation, and mentioning that you need a `MerchantPassword`.

#### Request types
- `STATUS`: Returns the current status of the regular payment.
- `SUSPEND`: Suspends the regular payment.
- `RESUME`: Resumes the regular payment.
- `REMOVE`: Removes the regular payment.

#### Additional documentation
- https://wiki.wayforpay.com/view/852496

```typescript
const wayforpay = new Wayforpay({
    merchantLogin: 'test_merch_n1',
    merchantPassword: 'dds0a8dsa-0dasuiodshdsa0udfsn',
});

const regularPayment = await wayforpay.regularPayment(orderReference, 'STATUS');
```

## Contributing

Contributions from everyone are welcome.

### Instructions

Fork the repository

Clone the repository

```bash
git clone https://github.com/Wlad1slav/wayforpay-ts-integration.git
```

Create a new branch

```bash
git checkout -b feature/feature-name
```

Make your changes

Commit your changes

```bash
git commit -m "feat: description of your feature"
```

Push your changes

```bash
git push origin feature/feature-name
```

## Author

[@Wlad1slav](https://github.com/Wlad1slav)

## License

ISC
