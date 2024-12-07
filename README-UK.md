# 💳 wayforpay-ts-integration

![Package version](https://img.shields.io/npm/v/wayforpay-ts-integration)
![MIT License](https://img.shields.io/badge/license-ISC-green.svg)

wayforpay-ts-integration — TypeScript SDK для інтеграції з платіжною системою Wayforpay. Пакет забезпечує простий доступ до API Wayforpay для обробки платежів, створення платіжних форм, та отримання списку транзакцій. 

🇬🇧 [English README.md](/README.md)

```bash
npm i wayforpay-ts-integration
```

## ✨ Features

- [X] Платежі
- [Х] Створення посилання на сторінку оплати
- [ ] Оплата в один клік
- [ ] Платіжний віджет
- [ ] Верифікація картки (Verify)
- [ ] Виставлення рахунків (Invoice)
- [ ] Поповнення карт фіз. осіб (Account2card)
- [ ] Переказ коштів на розрахунковий рахунок (Account2account)
- [X] API Отримання Списку транзакцій
- [ ] Онлайн кредитування
- [ ] Онлайн оплата таксі
- [ ] Антифрод API
- [X] Регулярні платежі
- [ ] Платіжні модулі під CMS
- [ ] Створення магазину/партнера
- [ ] Створення платіжного QR-коду
- [ ] PCI DSS
- [ ] Отримання курсів валют

![checkout-demo](https://github.com/user-attachments/assets/5ceb9ac8-dcf5-4413-8ad8-9a6ffa1356dc)

## 🚀 Зміст

- Створення магазину в Wayforpay
- Встановлення пакету
- Використання
    - Платежі
    - Отримання списку транзакцій

## 🏪 Створення магазину в Wayforpay

Авторизуйтесь на платформі Wayforpay через [офіційний сайт](https://m.wayforpay.com/account/site/login).

Після авторизації, у боковому меню перейдіть до розділу **Налаштування магазину**. Ви побачите список ваших магазинів.
Якщо магазину ще немає, натисніть **Створити магазин**. Не забудьте вказати домен магазину. Якщо ви ще не визначились з
доменом, введіть тимчасовий.

### 🔑 Token

Після створення магазину перейдіть до його налаштувань. Там знайдіть картку з **Реквізитами мерчанта**, де ви знайдете *
*Merchant login** та **Merchant secret key**. Ці дані потрібно вказати в опціях класу `Wayforpay` або додати до файлу
`.env` у кореневій директорії вашого проекту.

- `DOMAIN` — домен вашого Wayforpay магазину
- `MERCHANT_LOGIN` — логін мерчанта з налаштувань магазину
- `MERCHANT_SECRET_KEY` — секретний ключ мерчанта з налаштувань магазину

> [!CAUTION]
> **Не використовуйте** методи цього пакету на клієнтській стороні. Це може скомпрометувати ваш секретний ключ.
> Використовуйте функціонал лише на сервері (наприклад, у вашому API).

[Приклад файлу .env](https://github.com/Wlad1slav/wayforpay-ts-integration/blob/main/packages/backend/.env.example)

### 📦 Встановлення пакету

Після налаштування магазину, встановіть npm пакет на ваш сервер Node.js:

```bash
npm i wayforpay-ts-integration
```

## 🛠 Використання

### 📝 Платежі

Для створення платежів, Wayforpay приймає тільки прості HTTP запити з методом POST та унікальним підписом всередині. Те,
як створюється підпис та яка сама необхідна форма вам знати немає потреби, бо це все включено в функціонал цього пакету.

Все що вам варто знати:

1. користувач робить запит на сервер,
2. на сервері через наш пакет генерується HTML форма на основі кошика клієнта,
3. згенерована форма з унікальним підписом відправляється назад користувачу,
4. ви на клієнтській частині автоматично виконуєте форму для користувача АБО перенаправляєте користувача на сторінку з цією формою та скриптом для її виконання,
5. після виконання переданої форми відбувається перенаправлення на сторінку Wayforpay, де проходить оплата за замовлення.

В клас `Wayforpay` ви вказуєте дані вашого мерчанта. Метод `createForm` створює HTML-форму для оплати, яку вам треба
автоматично виконувати на клієнтській частині для користувача.

Перший параметр — це кошик користувача. Параметром повинен передаватися масив об'єктів з типом `TCartElement`.

| Property        | Type   | Опис                      |
|-----------------|--------|---------------------------|
| `quantity`      | number | Кількість товару в кошику |
| `product`       | object | Деталі товару             |
| `product.name`  | string | Назва продукту            |
| `product.price` | number | Ціна продукту             |

Другий параметр — це об'єкт з конфігурацією, в яку можна передати будь-яке
поле, [що підтримується Wayforpay](https://wiki.wayforpay.com/view/852102).

```typescript
import {Wayforpay, TCartElement} from "wayforpay-ts-integration";

const wayforpay = new Wayforpay({
    merchantLogin: 'test_merch_n1',
    merchantSecret: 'flk3409refn54t54t*FNJRET',
    domain: 'www.market.ua',
});

const form = await wayforpay.createForm(cart as TCartElement[], {
    currency: 'UAH'
});
```

#### Додаткова документація
- https://wiki.wayforpay.com/view/852102

#### POST приклад

```typescript
import {Wayforpay, TCartElement, TProduct, TUserCartElement} from "wayforpay-ts-integration";

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
            domain: process.env.DOMAIN as string,
        });

        // Creates a form for a request to wayforpay
        const form = await wayforpay.createForm(cart as TCartElement[], {
            currency: 'UAH',
            deliveryList: ["nova", "other"],
        });

        return res.send(form);
    } else {
        console.error('No product IDs were specified');
    }
});
```

На клієнтській стороні форму необхідно вставити в DOM і автоматично виконати. Ось приклад React-компонента, який
перекидає клієнта на сторінку оплати при натисненні кнопки:

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

#### GET приклад

Якщо ви хочете уникати зайвих POST запитів, то ви можете зробити редірект користувача на сторінку з цією формою. Пакет вже автоматично додає в форму скрипт для її виконання, тому все що вам потрібно зробити - створити GET АПІ маршрут по якому на основі заданих в посилання параметрів буде генеруватися форма та перенаправити користувача на цей маршрут. 

##### Next.js 14 з app router
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
        domain: string;
    };

    const options = await hookOptions('Wayforpay');

    let optionsData: {
        currency: TWayforpayAvailableCurrency,
        [key: string]: string
    } = { currency: 'USD' };

    for (const option of options) {
        optionsData[option.key] = option.value;
    }

    const wfp = new Wayforpay({
        merchantLogin: merchantData.merchantLogin,
        merchantSecret: decrypt(merchant.secret),
        domain: merchantData.domain,
    });

    const {searchParams} = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId)
        return NextResponse.json({message: 'No required parameters found'}, {status: 400});

    const product = await hookProduct(productId);

    const cart: TCartElement[] = [product];

    const form = await wfp.createForm(cart, optionsData as TRequestPayment);

    return new Response(form, {
        headers: { 'Content-Type': 'text/html' }
    });
}
```

Далі вистачить просто перенаправити користувача на цей АПІ. Наприклад `window.location.href = 'https://example.com/api/public/v1/wayforpay?id=12';`.


### 📋 Отримання списку транзакцій
Запит на перелік транзакцій використовується для отримання списку транзакцій магазину за певний період часу.

Максимальний період за який ви можете приймати транзакції, становить 31 день.

#### Додаткова документація
- https://wiki.wayforpay.com/view/1736786

```typescript
const wayforpay = new Wayforpay({
    merchantLogin: 'test_merch_n1',
    merchantSecret: 'flk3409refn54t54t*FNJRET',
    domain: 'www.market.ua',
});

const response = await wayforpay.getTransactions();
const transactions = response.data;
```

### 📋 Отримання статусу регулярного платежу

Метод використовується для перевірки статусу платежу за допомогою `orderReference`.

> [!NOTE]  
> Інтеграція цього функціоналу розглядається індивідуально для кожного магазину. Для цього зв’яжіться з sales@wayforpay.com, вказавши merchant login, опишіть ситуацію та зазначте, що вам потрібен `MerchantPassword`.

#### Додаткова документація
- https://wiki.wayforpay.com/view/852526

```typescript
const status = await wayforpay.checkRegularPayment(orderReference, merchantPassword);
```

## Контриб'ютинг

Вітаю внесок від усіх. 

### Інструкція

Зробіть форк репозиторію

Клонуйте репозиторій

```bash
git clone https://github.com/Wlad1slav/wayforpay-ts-integration.git
```

Створіть нову гілку

```bash
git checkout -b feature/назва-функції
```

Внесіть зміни

Закомітьте зміни

```bash
git commit -m "feat: опис вашої функції"
```

Запуште зміни

```bash
git push origin feature/назва-функції
```

## Автор

[@Wlad1slav](https://github.com/Wlad1slav)

## Ліцензія

ISC
