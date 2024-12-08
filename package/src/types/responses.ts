import { TWayforpayAvailableCurrency } from "./requests";

export type TWayforpayRegularPaymentStatuses = 'Active' | 'Suspended' | 'Created' | 'Removed' | 'Confirmed' | 'Completed';

export type TWayforpayResponseRegularPaymentStatus = {
    reasonCode: number; // Код відмови, e.g., 4100
    reason: string; // Причина відмови, e.g., "Ok"
    orderReference: string; // Номер замовлення в системі торговця, e.g., "P21435306374431"
    mode: "once" | string; // Періодичність списання, e.g., "once"
    status: TWayforpayRegularPaymentStatuses; // Статус регулярки
    amount: number; // Сума платежу, e.g., 2
    currency: TWayforpayAvailableCurrency; // Валюта, e.g., "UAH"
    email: string; // Email клієнта, e.g., "dev.test@mail.com"
    dateBegin: number; // Дата першого платежу (Unix timestamp), e.g., 1435698000
    dateEnd: number | null; // Дата закінчення (Unix timestamp or null), e.g., 1436043600
    lastPayedDate: number | null; // Дата останнього платежу (Unix timestamp or null), e.g., null
    lastPayedStatus: string | null; // Статус останнього платежу, e.g., null
    nextPaymentDate: number | null; // Дата наступного платежу (Unix timestamp or null), e.g., null
};

export type TWayforpayResponseTransactionDetails = {
    merchantAccount: string; // Merchant login
    orderReference: string; // Унікальний номер замовлення в системі торговця
    merchantSignature: string; // hash_hmac
    amount: number; // Сума замовлення
    currency: TWayforpayAvailableCurrency; // Валюта замовлення
    authCode: string; // Код авторизації - присвоюється банком
    createdDate: number; // Дата створення запиту в psp
    processingDate: number; // Дата процесування транзакції
    cardPan: string; // Маскування номеру картки
    cardType: string; // Тип карти: Visa / MasterCard
    issuerBankCountry: number; // Країна карти
    issuerBankName: string; // Ім'я Банку емітента карти
    transactionStatus: string; // Статус транзакції
    reason: string; // Причина відмови
    reasonCode: number; // Код відмови
    settlementDate: number; // Дата відшкодування транзакції мерчанту
    settlementAmount: number; // Сума відшкодування
    fee: number; // Комісія psp
    refundAmount: number; // Сума всіх повернутих коштів
};