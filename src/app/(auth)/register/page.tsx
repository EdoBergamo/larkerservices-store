"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from 'react-hook-form';

import { AuthCredentialsValidator, TAuthCredentialsValidator } from "@/lib/validators/account-credentials-validator";
import { trpc } from "@/trpc/client";

const Page = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TAuthCredentialsValidator>({
        resolver: zodResolver(AuthCredentialsValidator),
    })

    const { mutate, isLoading } = trpc.auth.createPayloadUser.useMutation({})

    const onSubmit = ({ email, password }: TAuthCredentialsValidator) => {
        mutate({ email, password })       
    }

    return (
        <>
            <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col items-center space-y-2 text-center">
                        <Image src='/logo.png' height='80' width='80' alt="LarkerServices Logo" />
                        <h1 className="text-2xl font-bold">Create an Account</h1>

                        <Link href='/login' className={buttonVariants({ variant: 'link', className: "gap-1.5" })}>
                            Already have an Account? Login
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid gap-6">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid gap-2">
                                <div className="grid gap-1 py-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        {...register("email")}
                                        className={cn({
                                            "focus-visible:ring-red-500": errors.email
                                        })}
                                        placeholder="you@example.com"
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="grid gap-1 py-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        {...register("password")}
                                        className={cn({
                                            "focus-visible:ring-red-500": errors.password
                                        })}
                                        placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                                        type="password"
                                        autoComplete="off"
                                    />
                                </div>

                                <Button>Register</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Page