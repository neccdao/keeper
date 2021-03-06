require("dotenv").config();
import handler from "./api/handler";
import tokens from "./src/lib/tokens";
import ON_DEATH from "death";
import express from "express";
console.info("*** dotenv config loaded ***");
const app = express();

const main = async () => {
    try {
        console.info("*** STARTING LIQUIDATOR INTERVAL" + "***");
        console.log("RPC_URL: " + process.env.RPC_URL);
        console.log("KEEPER_ADDRESS: " + process.env.KEEPER_ADDRESS);
        console.log(
            "EXCHANGE_DIAMOND_ADDRESS: " + process.env.EXCHANGE_DIAMOND_ADDRESS
        );
        console.log(
            "BOND_DEPOSITORY_ADDRESS: " + process.env.BOND_DEPOSITORY_ADDRESS
        );
        console.log(JSON.stringify({ tokens }));

        const intervalPeriod = process.env.INTERVAL_PERIOD || 1000 * 60 * 5; // 5 minutes
        console.log({ intervalPeriod });
        // First invoke the handler
        await handler();
        const liquidatorTimer = setInterval(async () => {
            await handler();
        }, Number(intervalPeriod));
        // TODO: Change for production :))

        ON_DEATH({
            uncaughtException: true,
        })((signal, deathErr) => {
            console.error(`*** SIGNAL: ${signal} ***`);
            console.error(`*** deathErr: ${deathErr} ***`);

            clearInterval(liquidatorTimer);

            process.exit(0);
        });
    } catch (err) {
        console.error("Error occured in index.ts:main");
        console.error(err);
    }
};

app.get("/", function (_req, res) {
    res.send("Hello World!");
});

app.listen(process.env.PORT, async () => {
    console.info("*** Server started on port " + process.env.PORT + " ***");
    await main();
});
