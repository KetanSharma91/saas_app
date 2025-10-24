"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useRef } from "react";

import { toast } from 'sonner';
// import { checkoutCredits } from "@/lib/actions/transaction.action";

import { Button } from "../ui/button";
import { AlertDialogDemo } from "../ui/PaymentModal";

const Checkout = ({
    plan,
    amount,
    credits,
    buyerId,
}: {
    plan: string;
    amount: number;
    credits: number;
    buyerId: string;
}) => {

    useEffect(() => {
        loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    }, []);

    useEffect(() => {
        // Check to see if this is a redirect back from Checkout
        const query = new URLSearchParams(window.location.search);
        if (query.get("success")) {
            toast(
                <div className='success-toast'>
                    <p className="font-semibold">Order placed!</p>
                    <p className="text-muted-foreground">You will receive an email confirmation</p>
                </div>,
                {
                    duration: 5000
                }
            );
        }

        if (query.get("canceled")) {
            toast(
                <div className='error-toast'>
                    <p className="font-semibold">Order canceled!</p>
                    <p className="text-muted-foreground">Continue to shop around and checkout when you&apos;re ready</p>
                </div>,
                {
                    duration: 5000
                }
            );
        }
    }, []);

    const button2Ref = useRef<HTMLButtonElement>(null);

    const onCheckout = async () => {
        const transaction = {
            plan,
            amount,
            credits,
            buyerId,
        };

        console.log(transaction);

        button2Ref.current?.click();
        // await checkoutCredits(transaction);

    };

    return (
        <form action={onCheckout}>
            <section>
                <Button
                    type="submit"
                    role="link"
                    className="w-full rounded-full bg-purple-gradient bg-cover"
                >
                    Buy Credit
                </Button>
                <AlertDialogDemo button2Ref={button2Ref} buyerId={buyerId} credits={credits} />
            </section>
        </form>
    );
};

export default Checkout;