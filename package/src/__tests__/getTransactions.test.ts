import { Wayforpay } from "..";
import testMerchant from "./test-merchant";

describe('Wayforpay.getTransactions', () => {
    let wayforpay: Wayforpay;

    beforeEach(() => {
        wayforpay = new Wayforpay(testMerchant);
    });
    
    it('should return the transaction', async () => {
        const transactionList = await wayforpay.getTransactions();

        console.log(transactionList[0]);

        expect(transactionList[0]).toBeTruthy();
        expect('orderReference' in transactionList[0]).toBe(true);
    });
});