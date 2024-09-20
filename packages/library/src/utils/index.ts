export * from "./createSignature";
export * from "./createForm";

const { DOMAIN: domain, MERCHANT_LOGIN: merchantLogin, CURRENCY: currency, MERCHANT_SECRET_KEY: merchantSecret } = process.env;

if (!domain || !merchantSecret || !merchantLogin || !currency) {
    console.error('One of the environment variables required for wayforpay-ts-integration is not specified.')
}
