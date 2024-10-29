export type TWayforpayAvailableLanguages = 'AUTO' | 'UA' | 'RU' | 'EN' | 'DE' | 'ES' | 'IT' | 'PL' | 'FR' | 'RO' | 'LV' | 'SK' | 'CS';
export type TWayforpayAvailableCurrency = 'UAH' | 'USD' | 'EUR';
export type TWayforpayAvailableShippingMethods = 'nova' | 'meest' | 'ukrpost' | 'other';
export type TWayforpayAvailablePaymentPeriods = 'client' | 'none' | 'once' | 'daily' | 'weekly' | 'quarterly' | 'monthly' | 'halfyearly' | 'yearly';
export type TWayforpayAvailablePaymentMethods = 'card' | 'googlePay' | 'applePay' | 'privat24' | 'lpTerminal' | 'delay' | 'bankCash' | 'qrCode' | 'masterPass' | 'visaCheckout' | 'bot' | 'payParts' | 'payPartsMono' | 'payPartsPrivat' | 'payPartsAbank' | 'instantAbank' | 'globusPlus' | 'OnusInstallment' | 'payPartsOtp' | 'payPartsSport';

export type TRequestPayment = {
    merchantTransactionType?: 'AUTO' | 'AUTH' | 'SALE'; // Тип транзакції
    merchantTransactionSecureType?: 'AUTO'; // Тип безпеки для проходження транзакції
    apiVersion?: 1 | 2; // Версія протоколу
    language?: TWayforpayAvailableLanguages; // Мова платіжної сторінки
    returnUrl?: string; // URL для перенаправлення клієнта з результатом платежу
    serviceUrl?: string; // URL для надсилання відповіді з результатом платежу
    orderReference?: string; // Унікальний номер замовлення в системі торговця, по дефолту ставиться дата замовлення
    orderNo?: string; // Номер замовлення в системі продавця
    currency: TWayforpayAvailableCurrency; // Валюта замовлення, обов'язковий
    alternativeAmount?: number; // Альтернативна сума замовлення
    alternativeCurrency?: TWayforpayAvailableCurrency; // Альтернативна валюта замовлення
    holdTimeout?: number; // Час дії блокування коштів в секундах
    orderTimeout?: number; // Інтервал для повторної оплати замовлення
    orderLifetime?: number; // Інтервал для оплати замовлення
    recToken?: string; // Токен карти для рекаррінгових списань
    clientAccountId?: string; // Унікальний ідентифікатор клієнта
    socialUri?: string; // Унікальний ідентифікатор ресурсу
    deliveryList?: TWayforpayAvailableShippingMethods[]; // Блок доставки
    clientFirstName?: string; // Ім'я клієнта
    clientLastName?: string; // Прізвище клієнта
    clientAddress?: string; // Адреса клієнта
    clientCity?: string; // Місто клієнта
    clientState?: string; // Штат / Область клієнта
    clientZipCode?: string; // Поштовий індекс клієнта
    clientCountry?: string; // Країна клієнта в ISO 3166-1-Alpha 3
    clientEmail?: string; // Email клієнта
    clientPhone?: string; // Номер телефону клієнта
    deliveryFirstName?: string; // Ім'я одержувача
    deliveryLastName?: string; // Прізвище одержувача
    deliveryAddress?: string; // Адреса одержувача
    deliveryCity?: string; // Місто одержувача
    deliveryState?: string; // Штат / Область одержувача
    deliveryZipCode?: string; // Поштовий індекс одержувача
    deliveryCountry?: string; // Країна одержувача
    deliveryEmail?: string; // Email отримувача
    deliveryPhone?: string; // Номер телефону одержувача
    aviaDepartureDate?: string; // Час відправлення рейсу
    aviaLocationNumber?: number; // Кількість пунктів пересадок
    aviaLocationCodes?: string; // Коди аеропортів
    aviaFirstName?: string; // Ім'я пасажира
    aviaLastName?: string; // Прізвище пасажира
    aviaReservationCode?: string; // Код резервування
    regularBehavior?: 'preset'; // Налаштування регулярного платежу
    regularMode?: TWayforpayAvailablePaymentPeriods; // Періодичність регулярного списання
    regularAmount?: number; // Сума регулярного платежу
    dateNext?: string; // Дата першого регулярного списання
    dateEnd?: string; // Дата закінчення регулярного списання
    regularCount?: number; // Кількість регулярних списань
    regularOn?: 1; // Чекбокс регулярного платежу активований
    paymentSystems?: TWayforpayAvailablePaymentMethods[]; // Доступні платіжні системи
    defaultPaymentSystem?: TWayforpayAvailablePaymentMethods; // Платіжна система за замовчуванням
};
