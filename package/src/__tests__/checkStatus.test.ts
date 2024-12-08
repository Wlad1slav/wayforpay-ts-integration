import { Wayforpay } from "..";
import testMerchant from "./test-merchant";

describe('Wayforpay.checkStatus', () => {
    let wayforpay: Wayforpay;

    beforeEach(() => {
        wayforpay = new Wayforpay(testMerchant);
    });
    
    it('should return the transaction', async () => {
        const transaction = await wayforpay.checkStatus('5889_woo_w4p_1731157495');

        console.log(transaction);

        expect(transaction).toBeTruthy();
    });
});