// import { NextResponse } from "next/server";
// import { createMidtransClient } from "@/lib/midtrans";
// import db from "@/db/drizzle"; // jika ingin simpan order
// import { nanoid } from "nanoid";

// export async function POST(req: Request) {
//   const body = await req.json();
//   const midtrans = createMidtransClient();

//   const orderId = "order-" + nanoid();

//   const parameter = {
//     transaction_details: {
//       order_id: orderId,
//       gross_amount: body.amount,
//     },
//     customer_details: {
//       first_name: body.name,
//       email: body.email,
//     },
//   };

//   const transaction = await midtrans.createTransaction(parameter);

//   return NextResponse.json({
//     token: transaction.token,
//     redirect_url: transaction.redirect_url,
//   });
// }
