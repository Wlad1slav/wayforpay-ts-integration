import { TWayforpayAvailableCurrency } from "./requests";

export type TWayforpayRegularPaymentStatuses = 'Active' | 'Suspended' | 'Created' | 'Removed' | 'Confirmed' | 'Completed';

export type TWayforpayTransactionStatus = 'Approved' | 'Expired' | 'Refund' | string;

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
    transactionStatus: TWayforpayTransactionStatus; // Статус транзакції
    reason: string; // Причина відмови
    reasonCode: number; // Код відмови
    settlementDate: number; // Дата відшкодування транзакції мерчанту
    settlementAmount: number; // Сума відшкодування
    fee: number; // Комісія psp
    refundAmount: number; // Сума всіх повернутих коштів
};

export type TWayforpayResponseTransactionListItem = {
    transactionType: string; // Тип транзакції
    orderReference: string; // Унікальний номер замовлення в системі торговця
    createdDate: number; // Дата створення запиту в psp
    amount: number; // Сума замовлення
    currency: string; // Валюта замовлення
    transactionStatus: TWayforpayTransactionStatus; // Статус транзакції
    processingDate: number; // Дата процесування транзакції
    reasonCode?: string; // Причина відмови (може бути необов'язковим)
    reason?: string; // Код відмови (може бути необов'язковим)
    email: string; // Email клієнта
    phone: string; // Номер телефону клієнта
    paymentSystem: string; // Платіжний метод, яким була проведена оплата
    cardPan: string; // Маскувати номер карти
    cardType: string; // Тип карти: Visa / MasterCard
    issuerBankCountry: string; // Країна карти
    issuerBankName: string; // Ім'я Банку емітента карти
    fee: number; // Комісія psp
};