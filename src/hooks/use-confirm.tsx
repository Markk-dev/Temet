import { useState } from 'react';

import { Button, type ButtonProps } from "@/components/ui/button";
import { Modal } from "@/components/modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const UseConfirm = (
    title: string,
    message: string,
    variant: ButtonProps["variant"] = "primary"

): [() => JSX.Element, () => Promise<unknown>] => {
    const [promise, setPromise] = useState<{ resolve: (value: boolean) => void} | null>(null);

    const confirm = () => {
        return new Promise((resolve) => {
            setPromise({resolve});
        });
    };
    const handleClose = () => {
        setPromise(null);
    };

    const handleConfirm = () => {
        promise?.resolve(true);
        handleClose();   
    };

    const handleCancel = () => {
        promise?.resolve(false);
        handleClose();
    };

    const ConfirmationDialog = () => (
        <Modal open={promise !== null} onOpenChange={handleClose}>
          <Card className="w-full h-full border-none shadow-none">
            <CardContent className='pt-8'>
                <CardHeader className='p-0'>
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        {message}
                    </CardDescription>
                </CardHeader>
              <div className="pt-4 w-full flex flex-row gap-x-2 justify-end items-center">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  variant={variant}
                  className="w-auto"
                >
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </Modal>
      );
      

    return [ConfirmationDialog, confirm];
};
