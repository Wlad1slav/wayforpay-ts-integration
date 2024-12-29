import { TCartElement, Wayforpay } from "..";
import { secretSpecifiedError } from "../messages";
import testMerchant from "./test-merchant";


describe('Wayforpay.purchase', () => {
    let wayforpay: Wayforpay;

    beforeEach(() => {
        wayforpay = new Wayforpay(testMerchant);
    });

    it('should throw an error if merchantSecret is not specified', async () => {
        const instanceWithoutSecret = new Wayforpay({
            merchantLogin: 'testMerchant',
            merchantSecret: undefined,
        });

        await expect(instanceWithoutSecret.purchase([])).rejects.toThrowError(secretSpecifiedError);
    });

    it('should generate a valid HTML form for the purchase', async () => {
        const cart: TCartElement[] = [
            {
                product: { name: 'Product 1', price: 100 },
                quantity: 2,
            },
            {
                product: { name: 'Product "2"', price: 200 },
                quantity: 1,
            },
        ];

        const form = await wayforpay.purchase(cart, { domain: 'example.com', currency: 'UAH' });

        console.log('Purchase form:\n', form);

        expect(typeof form).toBe('string');
    });

    it('should include additional fields passed in the data parameter', async () => {
        const cart: TCartElement[] = [
            {
                product: { name: 'Product 1', price: 50 },
                quantity: 3,
            },
        ];

        const form = await wayforpay.purchase(cart, {
            domain: 'example.com',
            currency: 'USD',
            deliveryList: ['nova', 'other'],
        });

        expect(form).toContain('<input type="hidden" name="deliveryList" value="nova;other" />');
    });

    it('should calculate the correct total price', async () => {
        const cart: TCartElement[] = [
            {
                product: { name: 'Product 1', price: 50 },
                quantity: 3,
            },
            {
                product: { name: 'Product 2', price: 30 },
                quantity: 2,
            },
        ];

        const form = await wayforpay.purchase(cart, { domain: 'example.com', currency: 'USD' });

        // 50*3 + 30*2 = 150 + 60 = 210
        expect(form).toContain('<input type="hidden" name="amount" value="210" />');
    });
});
