import {
    TCartElement,
    TRequestListTransactions,
    TRequestPayment,
    TSignatureListTransactions,
    TSignaturePayment,
    TWayforpayOptions
} from "./types";
import {envSpecifiedError} from "./messages";
import crypto from "crypto";
import axios from "axios";

export * from './types';

export class Wayforpay {
    /**
     * The class gets options to provide communication with the Wayforpay API. The options include your store domain, your merchant login, your merchant api token, and the currency you want to use.
     *
     * If options are not passed, then variables from the .env file are used.
     * - `DOMAIN` — the domain of your Wayforpay store
     * - `MERCHANT_LOGIN` — the merchant login from the store settings
     * - `MERCHANT_SECRET_KEY` — the merchant secret key from the store settings
     */
    constructor(private option?: TWayforpayOptions) {
        if (!option) {
            const {
                DOMAIN: domain,
                MERCHANT_LOGIN: merchantLogin,
                MERCHANT_SECRET_KEY: merchantSecret
            } = process.env;
            if (!domain || !merchantLogin || !merchantSecret)
                throw new Error(envSpecifiedError);
            this.option = {domain, merchantLogin, merchantSecret};
        }
    }

    private createSignature(params: string[]) {
        const signature = params.join(';');
        return (
            crypto.createHmac('md5', this.option?.merchantSecret as string)
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
     *     merchantSecret: process.env.MERCHANT_SECRET_KEY as string,
     *     domain: process.env.DOMAIN as string,
     * });
     *
     * // In `form` HTML is a form that should be sent to the front end and executed.
     * const form = await wayforpay.createForm(cart as TCartElement[], {
     *     currency: 'UAH',
     *     deliveryList: ["nova","other"],
     * });
     * ```
     *
     * @param cart
     * @param data
     */
    public async createForm(cart: TCartElement[], data: TRequestPayment = {
        currency: 'UAH'
    }) {
        const orderDate = Date.now();

        // Extract product names, quantities, and prices from the cart
        const names = cart.map(item => item.product.name);
        const quantities = cart.map(item => item.quantity);
        const prices = cart.map(item => item.product.price);

        let totalPrice = prices.reduce((acc, price, i) => acc + price * quantities[i], 0);

        // Create a signature to securely verify the transaction
        const signature = this.createPaymentSignature({
            merchantLogin: this.option?.merchantLogin as string,
            domain: this.option?.domain as string,
            orderDate,
            invoice: orderDate.toString(),
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
              <input type="hidden" name="merchantDomainName" value="${this.option?.domain}" />
              <input type="hidden" name="merchantSignature" value="${signature}" />
              <input type="hidden" name="orderReference" value="${orderDate}" />
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
        `;
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
     *     merchantSecret: process.env.MERCHANT_SECRET_KEY as string,
     *     domain: process.env.DOMAIN as string,
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

        return await axios.post('https://api.wayforpay.com/api', preparedData);
    }
}
