import {TCartElement, TRequestPayment, TWayforpayAvailableCurrency, TWayforpayOptions} from "./types";
import {envSpecifiedError} from "./messages";
import crypto from "crypto";

export * from './utils/createSignature';
export * from './utils/createForm';
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

    private createSignature({orderDate, totalPrice, pricesString, quantitiesString, namesString, currency}: {
        orderDate: number;
        totalPrice: number;
        namesString: string;
        quantitiesString: string;
        pricesString: string;
        currency: TWayforpayAvailableCurrency;
    }) {
        const signature = `${this.option?.merchantLogin};${this.option?.domain};${orderDate};${orderDate};${totalPrice};${currency};${namesString};${quantitiesString};${pricesString}`;
        return (
            crypto.createHmac('md5', this.option?.merchantSecret as string)
                .update(signature)
                .digest('hex')
        );
    }

    private arrayToHtmlArray = (name: string, array: (string | number)[]) =>
        array.map(element => `<input type="hidden" name="${name}[]" value="${element}" />`).join('\n');

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
        const signature = this.createSignature({
            // merchantLogin: this.option?.merchantLogin as string,
            // domain: this.option?.domain as string,
            orderDate,
            // invoice: orderDate.toString(),
            totalPrice,
            currency: data.currency,
            pricesString: prices.join(';'),
            namesString: names.join(';'),
            quantitiesString: quantities.join(';'),
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
}
