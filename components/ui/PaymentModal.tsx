import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { checkoutCreditsBy } from "@/lib/actions/transaction.action";
import { ForwardedRef } from "react"
import { redirect } from "next/navigation";

export function AlertDialogDemo({ button2Ref, buyerId, credits }: { button2Ref: ForwardedRef<HTMLButtonElement>, buyerId: string, credits: number }) {

    const onClickBtn = async () => {

        await checkoutCreditsBy({ buyerId, credits });

        redirect('/profile');
    }
    
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button style={{ display: "none" }} ref={button2Ref} variant="outline">Show Dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        The credits will be updated to {credits}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onClickBtn}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
