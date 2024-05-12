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

import { toast } from "sonner"
import { ZodError } from "zod";
import { useRouter, useSearchParams } from "next/navigation";

const Page = () => {
    const router = useRouter();

    const searchParams = useSearchParams();
    const isReseller = searchParams.get('as') === "reseller";
    const origin = searchParams.get('origin');

    const continueAsReseller = () => {
        router.push("?as=reseller");
    }

    const continuaAsBuyer = () => {
        router.replace("/login", undefined);
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TAuthCredentialsValidator>({
        resolver: zodResolver(AuthCredentialsValidator),
    })

    const { mutate: signIn, isLoading } = trpc.auth.signIn.useMutation({
        onError: (err) => {
            if (err.data?.code === "UNAUTHORIZED") {
                toast.error('Invalid email or password');
            }
        },
        onSuccess: () => {
            toast.success('Logged In Successfully')
            router.refresh();

            if (origin) {
                router.push(`/${origin}`);
                return;
            }

            if (isReseller) {
                router.push('/sell');
                return;
            }

            router.push('/');
        }
    })

    const onSubmit = ({ email, password }: TAuthCredentialsValidator) => {
        signIn({ email, password })
    }

    const resellers = true;

    return (
        <>
            <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col items-center space-y-2 text-center">
                        <Image src='/logo.png' height='80' width='80' alt="LarkerServices Logo" />
                        <h1 className="text-2xl font-bold">Login to your {isReseller && 'reseller'} account</h1>

                        <Link href='/register' className={buttonVariants({ variant: 'link', className: "gap-1.5" })}>
                            Don&apos;t have an Account? Register
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
                                    {errors?.email && (
                                        <p className="text-sm text-red-500">{errors.email.message}</p>
                                    )}
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
                                    {errors?.password && (
                                        <p className="text-sm text-red-500">{errors.password.message}</p>
                                    )}
                                </div>

                                <Button>Login</Button>
                            </div>
                        </form>

                        {resellers && (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span aria-hidden='true' className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            or
                                        </span>
                                    </div>
                                </div>

                                {isReseller ? (
                                    <Button onClick={continuaAsBuyer} variant='secondary' disabled={isLoading}>Continue as Customer</Button>
                                ) : (
                                    <Button onClick={continueAsReseller} variant='secondary' disabled={isLoading}>Continue as Reseller</Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Page