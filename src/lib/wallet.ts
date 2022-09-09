import { Secp256k1HdWallet } from "@cosmjs/launchpad";

export const createWallet = async () => {
  const wallet = await Secp256k1HdWallet.generate(undefined, { prefix: "bls" });
  const [{ address }] = await wallet.getAccounts();

  console.log(
    JSON.stringify({
      mnemonic: wallet.mnemonic,
      address,
    })
  );
};
