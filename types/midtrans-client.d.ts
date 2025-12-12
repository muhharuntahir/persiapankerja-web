// types/midtrans-client.d.ts
declare module "midtrans-client" {
  export class Snap {
    constructor(config: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
    createTransaction(params: any): Promise<any>;
    createTransactionToken(params: any): Promise<any>;
    // tambahkan metode lain yang kamu gunakan jika perlu
  }

  const MidtransClient: {
    Snap: typeof Snap;
    Core?: any;
  };

  export default MidtransClient;
}
