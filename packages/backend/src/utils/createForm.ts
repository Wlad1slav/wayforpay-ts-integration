import createSignature from "./createSignature";
import { TCartElement } from "../types";

const arrayToHtmlArray = (name: string, array: (string | number)[]) =>
    array.map(element => `<input type="hidden" name="${name}[]" value="${element}" />`).join('\n');

const createForm = async (cart: TCartElement[], data: Record<string, string> = {}) => {
    const orderDate = Date.now();

    const { DOMAIN: domain, MERCHANT_LOGIN: merchantLogin, CURRENCY: currency } = process.env;

    // Extract product names, quantities, and prices from the cart
    const names = cart.map(item => item.product.name);
    const quantities = cart.map(item => item.quantity);
    const prices = cart.map(item => item.product.price);

    const totalPrice = prices.reduce((acc, price) => acc + price, 0);

    // Create a signature to securely verify the transaction
    const signature = createSignature({
        totalPrice,
        pricesString: prices.join(';'),
        namesString: names.join(';'),
        quantitiesString: quantities.join(';'),
        orderDate
    });

    // Map additional data fields (if provided) into hidden input fields
    const additionalFields = Object.entries(data)
        .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
        .join('\n');

    return `
    <form id="wayforpayForm" action="https://secure.wayforpay.com/pay" method="POST">
      <!-- Payment form fields: Merchant account details and order information -->
      <input type="hidden" name="merchantAccount" value="${merchantLogin}" />
      <input type="hidden" name="merchantDomainName" value="${domain}" />
      <input type="hidden" name="merchantSignature" value="${signature}" />
      <input type="hidden" name="orderReference" value="${orderDate}" />
      <input type="hidden" name="orderDate" value="${orderDate}" />
      <input type="hidden" name="amount" value="${totalPrice}" />
      <input type="hidden" name="currency" value="${currency}" />
      
      <!-- Dynamic fields for products: Names, Prices, Quantities -->
      ${arrayToHtmlArray('productName', names)}
      ${arrayToHtmlArray('productPrice', prices)}
      ${arrayToHtmlArray('productCount', quantities)}
      
      <!-- Additional dynamic fields passed through 'data' parameter -->
      ${additionalFields}
    </form>
  `;
};

export default createForm;
