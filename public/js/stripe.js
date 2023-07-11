import axios from "axios";
import { showAlert } from './alerts';
//const Stripe = require("stripe");
//const stripe = require("stripe")('pk_test_51NLQKqSHnyZqmFW5EPy67uJrDFDg8FVQTIbt2VmHQ6K3eqnvoKR9RbdXc5tU7RfZrq73TUE2DXLxBcuKEe7bi7eU003su1uL7L');
import {loadStripe} from '@stripe/stripe-js';

export const bookTour = async tourId => {

    try {
        // 1) Get checkout session from API
        const session = await axios(
            `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
        );
        console.log(session);
        // const stripe = await loadStripe('pk_test_51NLQKqSHnyZqmFW5EPy67uJrDFDg8FVQTIbt2VmHQ6K3eqnvoKR9RbdXc5tU7RfZrq73TUE2DXLxBcuKEe7bi7eU003su1uL7L');

        // // 2) Create checkout from + chanre credit card
        // stripe.redirectToCheckout({
        //     sessionId: session.data.session.id
        // });
        location.assign(session.data.session.url);
    } catch(err) {
        console.log(err);
        showAlert('error', err);
    }
};