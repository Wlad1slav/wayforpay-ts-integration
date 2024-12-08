import {
    TCartElement,
    TRequestListTransactions,
    TWayforpayRequestPayment,
    TSignatureListTransactions,
    TSignaturePayment,
    TWayforpayOptions,
    TWayforpayResponseRegularPaymentStatus,
    TRequestRegularPayment,
    TWayforpayResponseTransactionDetails,
    TWayforpayResponseTransactionListItem
} from "./types";
import { envSpecifiedError, merchantPasswordSpecifiedError, secretSpecifiedError } from "./messages";
import crypto from "crypto";
import axios from "axios";

export * from './types';

export class Wayforpay {
    /**
     * The class gets options to provide communication with the Wayforpay API. The options include your store domain, your merchant login, your merchant api token, and the currency you want to use.
     *
     * If options are not passed, then variables from the .env file are used.
     * - `MERCHANT_LOGIN` — the merchant login from the store settings
     * - `MERCHANT_SECRET_KEY` — the merchant secret key from the store settings
     */
    constructor(private option?: TWayforpayOptions) {
        if (!option) {
            const {
                MERCHANT_LOGIN: merchantLogin,
                MERCHANT_SECRET_KEY: merchantSecret,
                MERCHANT_PASSWORD: merchantPassword,
            } = process.env;

            if (!merchantLogin)
                throw new Error(envSpecifiedError);

            this.option = { merchantLogin, merchantSecret, merchantPassword };
        }
    }

    private createSignature(params: string[]) {
        if (!this.option?.merchantSecret)
            throw new Error(secretSpecifiedError);

        const signature = params.join(';');
        return (
            crypto.createHmac('md5', this.option.merchantSecret as string)
                .update(signature)
                .digest('hex')
        );
    }

    // {merchantLogin, domain, orderDate, totalPrice, currency, namesString, quantitiesString, pricesString}
    private createPaymentSignature(params: TSignaturePayment) {
        const stringifyParams = Object.values(params).map(param => param.toString());
        return this.createSignature(stringifyParams);
    }

    private createListTransactionsSignature(params: TSignatureListTransactions) {
        const stringifyParams = Object.values(params).map(param => param.toString());
        return this.createSignature(stringifyParams);
    }

    private arrayToHtmlArray = (name: string, array: (string | number)[]) =>
        array.map(element => `<input type="hidden" name="${name}[]" value="${element}" />`).join('\n');

    /**
     * ## The Purchase request
     * The Purchase request is used to make a payment by the client on the secure wayforpay page.
     *
     * A request with the necessary parameters is formed through a package
     * and transmitted in the form of an HTML form, which should be executed
     * automatically on the front-end side.
     *
     * ### Documentation
     * - https://wiki.wayforpay.com/view/852102
     *
     * ### Example
     * ```typescript
     * const wayforpay = new Wayforpay({
     *     merchantLogin: process.env.MERCHANT_LOGIN as string,
     *     merchantSecret: process.env.MERCHANT_SECRET_KEY as string
     * });
     *
     * // In `form` HTML is a form that should be sent to the front end and executed.
     * const form = await wayforpay.createForm(cart as TCartElement[], {
     *     domain: 'example.com',
     *     currency: 'UAH',
     *     deliveryList: ["nova","other"],
     * });
     * ```
     *
     * @param cart
     * @param data
     */
    public async purchase(cart: TCartElement[], data: TWayforpayRequestPayment = {
        domain: 'example.com',
        currency: 'UAH'
    }) {
        if (!this.option?.merchantSecret)
            throw new Error(secretSpecifiedError);

        const orderDate = Date.now();

        // Extract product names, quantities, and prices from the cart
        const names = cart.map(item => item.product.name);
        const quantities = cart.map(item => item.quantity);
        const prices = cart.map(item => item.product.price);

        let totalPrice = prices.reduce((acc, price, i) => acc + price * quantities[i], 0);

        const invoice = data.orderReference ?? ((Math.random() * (20 - 1 + 1) + 1) * orderDate).toString();

        // Create a signature to securely verify the transaction
        // ! NOTE: very important to be consistent 
        const signature = this.createPaymentSignature({
            merchantLogin: this.option?.merchantLogin as string,
            domain: data.domain,
            invoice,
            orderDate,
            totalPrice,
            currency: data.currency,
            namesString: names.join(';'),
            quantitiesString: quantities.join(';'),
            pricesString: prices.join(';'),
        });

        // Map additional data fields (if provided) into hidden input fields
        const additionalFields = Object.entries(data)
            .map(([key, value]) =>
                `<input type="hidden" name="${key}" value="${Array.isArray(value) ? value.join(';') : value}" />`)
            .join('\n');

        return `
            <form id="wayforpayForm" action="https://secure.wayforpay.com/pay" method="POST">
              <!-- Payment form fields: Merchant account details and order information -->
              <input type="hidden" name="merchantAccount" value="${this.option?.merchantLogin}" />
              <input type="hidden" name="merchantDomainName" value="${data.domain}" />
              <input type="hidden" name="merchantSignature" value="${signature}" />
              ${!data.orderReference ? `<input type="hidden" name="orderReference" value="${invoice}" />` : ''}
              <input type="hidden" name="orderDate" value="${orderDate}" />
              <input type="hidden" name="amount" value="${totalPrice}" />
              <input type="hidden" name="currency" value="${data.currency}" />
              
              <!-- Dynamic fields for products: Names, Prices, Quantities -->
              ${this.arrayToHtmlArray('productName', names)}
              ${this.arrayToHtmlArray('productPrice', prices)}
              ${this.arrayToHtmlArray('productCount', quantities)}
              
              <!-- Additional dynamic fields passed through 'data' parameter -->
              ${additionalFields}
            </form>
            <script>
                const form = document.getElementById('wayforpayForm');
                form.submit();
            </script>
        `;
    }

    /**
     * @deprecated Use `purchase` method instead.
     */
    public createForm = this.purchase;

    public async checkStatus(orderReference: string, apiVersion: 1 | 2 = 1) {
        if (!this.option?.merchantSecret)
            throw new Error(secretSpecifiedError);

        const signature = this.createSignature([
            this.option.merchantLogin,
            orderReference
        ]);

        const response = await axios.post<TWayforpayResponseTransactionDetails>('https://api.wayforpay.com/api', {
            transactionType: 'CHECK_STATUS',
            orderReference,
            merchantAccount: this.option.merchantLogin,
            merchantSignature: signature,
            apiVersion
        });

        return response.data;
    }

    /**
     * ## Transaction list
     * The TRANSACTION LIST query is used to retrieve a list of store transactions for a specific time period.
     *
     * The maximum period for which you can receive transactions is 31 days.
     *
     * ### Documentation
     * - https://wiki.wayforpay.com/view/1736786
     *
     * ### Example
     * ```typescript
     * const wayforpay = new Wayforpay({
     *     merchantLogin: process.env.MERCHANT_LOGIN as string,
     *     merchantSecret: process.env.MERCHANT_SECRET_KEY as string
     * });
     *
     * const response = await wayforpay.getTransactions();
     * const transactions = response.data;
     * ```
     *
     * @param data
     */
    public async getTransactions(data: TRequestListTransactions = {
        apiVersion: 2,
        transactionType: 'TRANSACTION_LIST',
    }) {
        // If no date is specified, the period is set to the last 30 days
        const date = {
            dateBegin: Math.floor(data.dateBegin?.getTime() ?? new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).getTime() / 1000),
            dateEnd: Math.floor(data.dateEnd?.getDate() ?? new Date().getTime() / 1000),
        };

        const preparedData = {
            ...data,
            ...date,
            merchantAccount: this.option?.merchantLogin as string,
            merchantSignature: this.createListTransactionsSignature({
                merchantAccount: this.option?.merchantLogin as string,
                ...date
            })
        };

        const response = await axios.post('https://api.wayforpay.com/api', preparedData);

        return response.data.transactionList as TWayforpayResponseTransactionListItem[];
    }

    /**
     * # Regular payment
     * 
     * The request is generated on the merchant's side and transmitted by the POST method to the URL `https://api.wayforpay.com/regularApi`.
     * 
     * ## Documentation
     * - https://wiki.wayforpay.com/view/852496
     * 
     * * Note: The integration of this functionality is considered individually for each store. To proceed, please contact sales@wayforpay.com, specifying the merchant's name, describing the situation, and mentioning that you need a MerchantPassword.
     * 
     * ## Request types
     * - `STATUS`: Returns the current status of the regular payment.
     * - `SUSPEND`: Suspends the regular payment.
     * - `RESUME`: Resumes the regular payment.
     * - `REMOVE`: Removes the regular payment.
     * 
     * ## Documentation
     * - https://wiki.wayforpay.com/view/852526
     * 
     * ## Example
     * ```typescript
     * const wayforpay = new Wayforpay({
     *     merchantLogin: process.env.MERCHANT_LOGIN as string,
     *     merchantPassword: process.env.MERCHANT_PASSWORD as string
     * });
     * 
     * const regularPayment = await wayforpay.checkRegularPayment(orderReference, 'STATUS');
     * ```
     */
    public async regularPayment(orderReference: string, requestType: TRequestRegularPayment = 'STATUS') {
        if (!this.option?.merchantPassword)
            throw new Error(merchantPasswordSpecifiedError);

        const response = await axios.post("https://api.wayforpay.com/regularApi", {
            requestType,
            merchantAccount: this.option.merchantLogin,
            merchantPassword: this.option.merchantPassword,
            orderReference
        });

        return response.data as TWayforpayResponseRegularPaymentStatus;
    }
}
