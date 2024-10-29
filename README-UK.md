# 💳 wayforpay-ts-integration

![Package version](https://img.shields.io/npm/v/wayforpay-ts-integration)
![MIT License](https://img.shields.io/badge/license-ISC-green.svg)

**wayforpay-ts-integration** пакет для зручної інтеграції з платіжною системою Wayforpay. Він дозволяє створювати редірект на сторінку оплати в будь-якій точці клієнтського коду. Після запиту до вашого API, пакет генерує форму, яку можна автоматично виконати на боці клієнта, перекидаючи його на сторінку оплати.

🇬🇧 [English README.md](/README.md)

## ✨ Features

- [X] Генерація форми для редіректу на сторінку оплати з можливістю автоматичного виконання на клієнті
- [X] Генерація підпису для безпечної перевірки транзакції
- [X] Заборона виконання небезпечних функцій на клієнтському боці
- [ ] Отримання списку транзакцій
- [ ] Регулярні платежі
- [ ] Відстеження статусу замовлення
- [ ] Можливість скасування замовлення

![checkout-demo](https://github.com/user-attachments/assets/5ceb9ac8-dcf5-4413-8ad8-9a6ffa1356dc)

## 🚀 Інструкція з впровадження

- Створити магазин в wayforpay
- Environment Variables
- Install package
- Usage
    - Генерація форми
      - Express.js приклад
      - Next.js приклад
    - Виконання форми

### 🏪 Створити магазин в wayforpay

Авторизуйтесь на платформі Wayforpay через [офіційний сайт](https://m.wayforpay.com/account/site/login).

Після авторизації, у боковому меню перейдіть до розділу `Налаштування магазину`. Ви побачите список ваших магазинів. Якщо магазину ще немає, натисніть `Створити магазин`. Не забудьте вказати домен магазину. Якщо ви ще не визначились з доменом, введіть тимчасовий.

### 🔑 Token

Після створення магазину перейдіть до його налаштувань. Там знайдіть картку з `Реквізитами мерчанта`, де ви знайдете `Merchant login` та `Merchant secret key`. Ці дані потрібно вказати в опціях класу `Wayforpay` або додати до файлу `.env` у кореневій директорії вашого проекту.

- `DOMAIN` — домен вашого Wayforpay магазину
- `MERCHANT_LOGIN` — логін мерчанта з налаштувань магазину
- `MERCHANT_SECRET_KEY` — секретний ключ мерчанта з налаштувань магазину

> [!CAUTION]
> **Не використовуйте** методи цього пакету на клієнтській стороні. Це може скомпрометувати ваш секретний ключ. Використовуйте функціонал лише на сервері (наприклад, у вашому API).

[Приклад файлу .env](https://github.com/Wlad1slav/wayforpay-ts-integration/blob/main/packages/backend/.env.example)

### 📦 Install package

Після налаштування магазину, встановіть npm пакет на ваш сервер Node.js:

```bash
npm i wayforpay-ts-integration
```

### 🛠 Usage

#### 📝 Генерація форми

На серверній частині необхідно згенерувати форму для редіректу користувача на сторінку оплати.

##### Express.js приклад
```typescript
import express, {Request, Response} from 'express';
import dotenv from 'dotenv';

import {Wayforpay, TCartElement, TProduct, TUserCartElement} from "wayforpay-ts-integration";
import createForm from "wayforpay-ts-integration/dist/utils/createForm";

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

        const wayforpay = new Wayforpay({
            merchantLogin: process.env.MERCHANT_LOGIN as string,
            merchantSecret: process.env.MERCHANT_SECRET_KEY as string,
            currency: process.env.CURRENCY as string,
            domain: process.env.DOMAIN as string,
        });

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

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
```

##### Next.js приклад (з app router)
```typescript
import createForm from "wayforpay-ts-integration/dist/utils/createForm";
import {TCartElement, TUserCartElement, Wayforpay} from "wayforpay-ts-integration";
import {Product} from "@/lib/services/woocommerce-api";

export async function POST(request: Request) {
    const {cart: userCart}: {
        cart: TUserCartElement[];
    } = await request.json();

    const cart = await Product.generateCart(userCart);

    const wayforpay = new Wayforpay({
        merchantLogin: process.env.MERCHANT_LOGIN as string,
        merchantSecret: process.env.MERCHANT_SECRET_KEY as string,
        currency: process.env.CURRENCY as string,
        domain: process.env.DOMAIN as string,
    });

    const form = await wayforpay.createForm(cart as TCartElement[], {
        currency: 'UAH',
        deliveryList: ["nova","other"],
    });

    return new Response(form, {
        headers: {
            'Content-Type': 'text/html',
        },
    });
}
```

В клас `Wayforpay` ви вказуєте дані вашого мерчанту.

Метод `createForm` створює форму для оплати. Другий параметр — це об'єкт з конфігурацією, в яку можна передати будь-яке поле, [що підтримується Wayforpay](https://wiki.wayforpay.com/view/852102).

```typescript
import {Wayforpay} from "wayforpay-ts-integration";

const wayforpay = new Wayforpay({
    merchantLogin: process.env.MERCHANT_LOGIN as string,
    merchantSecret: process.env.MERCHANT_SECRET_KEY as string,
    currency: process.env.CURRENCY as string,
    domain: process.env.DOMAIN as string,
});

const form = await wayforpay.createForm(cart as TCartElement[], {
    currency: 'UAH',
    deliveryList: ["nova","other"],
});
```

#### 📤 Виконання форми

На клієнтській стороні форму необхідно вставити в DOM і автоматично виконати. Ось приклад React-компонента, який перекидає клієнта на сторінку оплати при натисненні кнопки:

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
