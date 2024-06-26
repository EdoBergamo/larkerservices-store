import { z } from "zod";
import { privateProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { getPayloadClient } from "../get-payload";
import { stripe } from "../lib/stripe";
import type Stripe from "stripe";

export const paymentRouter = router({
    createSession: privateProcedure.input(z.object({ productIds: z.array(z.string()) })).mutation(async ({ ctx, input }) => {
        const { user } = ctx
        const { productIds } = input

        if (productIds.length === 0) {
            throw new TRPCError({ code: "BAD_REQUEST" })
        }

        const payload = await getPayloadClient()

        const { docs: products } = await payload.find({
            collection: "products",
            where: {
                id: {
                    in: productIds
                }
            }
        })

        const filterProducts = products.filter((prod) => Boolean(prod.priceId))

        const order = await payload.create({
            collection: 'orders',
            data: {
                _isPaid: false,
                products: filterProducts.map((prod) => prod.id),
                user: user.id
            }
        })

        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

        filterProducts.forEach((product) => {
            line_items.push({
                price: product.priceId!,
                quantity: 1
            })
        })

        try {
            const stripeSession = await stripe.checkout.sessions.create({
                success_url: `http://localhost:3000/thank-you?orderId=${order.id}`,
                cancel_url: `http://localhost:3000/cart`,
                payment_method_types: ['card', 'paypal'],
                mode: 'payment',
                metadata: {
                    userId: user.id,
                    orderId: order.id
                },
                line_items
            })

            return { url: stripeSession.url }
        } catch (err) {
            console.log(err);
            return { url: null }
        }
    }),
    pollOrderStatus: privateProcedure.input(z.object({ orderId: z.string() })).query(async ({ input }) => {
        const { orderId } = input
        const payload = await getPayloadClient()

        const { docs: orders } = await payload.find({
            collection: "orders",
            where: {
                id: {
                    equals: orderId
                }
            }
        })

        if (!orders.length) throw new TRPCError({ code: "NOT_FOUND" })

        const [order] = orders;

        return { isPaid: order._isPaid }
    })
})