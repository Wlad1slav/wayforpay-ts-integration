import axios from "axios";

function App() {
    const cart = [
        { id: '1', quantity: 1 },
        { id: '4', quantity: 1 },
    ];

    const handleGoToPayPOST = async () => {
        const response = await axios.post('http://localhost:3000/api/wayforpay/checkout', {
            userCart: cart
        });

        // Gets form's HTML from the backend
        const html = await response.data;

        // Check if the container already exists, if not, create it
        let handlePay = document.getElementById('handlePay');
        if (!handlePay) {
            handlePay = document.createElement('div');
            handlePay.id = 'handlePay';
            document.body.appendChild(handlePay);
        }

        // Add the form's HTML to the container
        handlePay.innerHTML = html;

        // Find and submit the form
        const form = document.getElementById('wayforpayForm') as HTMLFormElement;
        if (form) {
            form.submit(); // Completes the form
        }
    };

    const handleGoToPayGET = () => {
        window.location.href = "http://localhost:3000/api/wayforpay/checkout?id=1&id=4";
    }

    return (
        <>
            <button onClick={handleGoToPayPOST} type="button">POST Submit</button>
            <button onClick={handleGoToPayGET} type="button">GET Submit</button>
        </>
    );
}

export default App;
