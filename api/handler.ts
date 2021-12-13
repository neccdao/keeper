import { ethers } from "ethers";
const weiroll = require("@weiroll/weiroll.js");
import tokens from "../src/lib/tokens";
import stakingJSON from "../src/contracts/facets/Bond/StakingFacet.sol/StakingFacet.json";
import readerJSON from "../src/contracts/facets/Reader/ReaderFacet.sol/ReaderFacet.json";
import vaultJSON from "../src/contracts/facets/Vault/VaultFacet.sol/VaultFacet.json";
import testableVMJSON from "../src/contracts/weiroll/TestableVM.sol/TestableVM.json";
import TokenJSON from "../src/contracts/tokens/Token.sol/Token.json";
import getPositionQuery from "../src/lib/getPositionQuery";

const handler = async function () {
    try {
        console.info("*** Keeper handler ***");
        const provider = new ethers.providers.JsonRpcBatchProvider(
            process.env.RPC_URL
        );
        const signer = new ethers.Wallet(
            process.env.KEEPER_PRIVATE_KEY,
            provider
        );
        const vault = new ethers.Contract(
            process.env.EXCHANGE_DIAMOND_ADDRESS,
            vaultJSON.abi,
            signer
        );
        const staking = new ethers.Contract(
            process.env.BOND_DEPOSITORY_ADDRESS,
            stakingJSON.abi,
            signer
        );
        const reader = new ethers.Contract(
            process.env.EXCHANGE_DIAMOND_ADDRESS,
            readerJSON.abi,
            signer
        );
        const token = new ethers.Contract(
            process.env.EXCHANGE_DIAMOND_ADDRESS,
            TokenJSON.abi,
            signer
        );
        //
        const balance = await provider.getBalance(signer.address);

        console.log("Token Balances: ");
        const tokenBalancesMap = tokens.map((token, index) => {
            return {
                [ethers.constants.AddressZero]: balance?.toString(),
            };
        });
        console.log(JSON.stringify(tokenBalancesMap));

        const rebaseTx = await staking.rebase();
        const reciept = await rebaseTx.wait();
        const {
            gasUsed: rebaseGasUsed,
            transactionHash: rebaseTransactionHash,
        } = await provider.getTransactionReceipt(rebaseTx.hash);
        console.info("* rebase gas used: " + rebaseGasUsed.toString());
        console.info(
            "StakingFacet.rebase() transactionHash: ",
            rebaseTransactionHash
        );

        const blockNumber = await provider.getBlockNumber();
        const block = await provider.getBlock(blockNumber);
        console.info("blockNumber: ", blockNumber);
        console.info("block.timestamp: ", block.timestamp);
    } catch (err) {
        console.error("Error occured in handler.ts:handler");
        console.error(err);
    }
};

export default handler;
