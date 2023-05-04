import Col from "../Col";

import Row from "../Row";
import { useEffect, useState } from "react";
import styles from "../../styles/Dapp.module.scss";
import Question from "../UI/Question";
import CustomSelect from "../CustomSelect";
import Confirmation from "../Confirmation";
import postHelper from "./postHelper";

import web3Helper from "../../lib/web3Helper";
import swal from "sweetalert";

const TopUpInterface = ({ input_network, user_account, onConnect }) => {
    const [networks, setNetworks] = useState(false);
    const [topupNetwork, setTopupnetwork] = useState(input_network ?? "bsc");
    const [topupAmount, setTopupAmount] = useState("0");
    const [toptupCardNumber, setTopupCardNumber] = useState("");
    const [transactionInProgress, setContractTransaction] = useState(false);

    const [mixerData, setMixerData] = useState(false);

    const handleTransactionSending = async (event) => {
        event.preventDefault();
        setContractTransaction(true);

        if (!user_account) {
            setContractTransaction(false);
            return setMixerData(false);
        }

        try {
            const contractAbi = require("../../lib/abi/visa.js");
            const w3 = web3Helper.getClient();
            const visaContract = new w3.eth.Contract(
                contractAbi,
                mixerData.treasuryAddress
            );

            let value = mixerData.input.amount / 1000000000000000000;

            if (value >= 1) {
                value = w3.utils.toWei(
                    (mixerData.input.amount / 1000000000000000000).toString(),
                    "ether"
                );
            } else {
                value = mixerData.input.amount;
            }

            const txHash = await visaContract.methods
                .refill(mixerData.card_id, mixerData.transactionId, topupAmount)
                .send({
                    from: user_account,
                    value: value,
                });

            if (txHash && typeof txHash.transactionHash != "undefined") {
                let api_reponse = await postHelper("/api/card-topup", {
                    id: mixerData.transactionId,
                    tx_hash: txHash.transactionHash,
                });

                if (!api_reponse.success) {
                    swal("Oops", api_reponse.message, "error");
                    setContractTransaction(false);
                    return setMixerData(false);
                } else {
                    setContractTransaction(false);
                    setMixerData(false);
                    swal(
                        "Wohoo!",
                        "The balance has been successfully topped up",
                        "success"
                    );
                    return false;
                }
            }
        } catch (e) {
            swal("Oops", e.message, "error");
            setContractTransaction(false);
            return setMixerData(false);
        }
    };

    const handleTopupEvent = async (evt) => {
        evt.preventDefault();
        setMixerData(true);

        if (
            typeof input_network.value != "undefined" &&
            input_network.value != topupNetwork
        ) {
            swal("Network", "You are on different network!", "info");
            setMixerData(false);
            return false;
        }

        if (topupAmount > 5000 || topupAmount <= 0) {
            swal(
                "Balance",
                "The final balance can not be more than $5000",
                "info"
            );
            return setMixerData(false);
        }

        let postData = {
            output_network: "visa",
            input_network: topupNetwork,
            recipient: "0x0000000000000000000000000000000000000000",
            amount: topupAmount * 1000000000000000000,
            delay: "120",
            caller: user_account,
            is_topup: toptupCardNumber,
        };

        let api_reponse = await postHelper("/api/transaction", postData);

        if (!api_reponse.success) {
            setMixerData(false);
            swal(
                "Oops something went wrong",
                api_reponse.message ? api_reponse.message : "Undefined error",
                "warning"
            );
            return false;
        }

        setMixerData(api_reponse.message);
    };

    useEffect(() => {
        if (typeof input_network != "undefined") {
            setTopupnetwork(input_network.value);
        }

        fetch("/api/networks")
            .then((response) => {
                response
                    .json()
                    .then((data) => {
                        let d = [];

                        for (let i = 0; i < data.length; i++) {
                            if (
                                data[i].value != "visa" &&
                                data[i].value != "btc"
                            )
                                d[d.length] = data[i];
                        }

                        setNetworks(d);
                    })
                    .catch(() => {});
            })
            .catch(() => {});
    }, []);

    return (
        <>
            {mixerData && (
                <Confirmation
                    callerNetwork={topupNetwork}
                    user_account={user_account}
                    transactionData={mixerData}
                    onClose={setMixerData}
                    onConfirm={handleTransactionSending}
                    onConnect={onConnect}
                    accepted={true}
                    limitations={[0, 0]}
                    contractTransaction={transactionInProgress}
                />
            )}

            <Col xs="12" md="4" customClass="col-md-offset-4">
                <h2 style={{ padding: "1rem 0 2rem 0" }}>
                    topup <span>card</span>
                </h2>
                <div className={`${styles.dapp_box} ${styles.dapp_box__visa}`}>
                    <Row>
                        <Col xs="12">
                            <label
                                className={styles.dapp__label}
                                htmlFor="rec_network"
                            >
                                From
                                <Question ans="Select source blockchain" />
                            </label>
                            {networks.length > 0 ? (
                                <CustomSelect
                                    key="topup-network"
                                    customGroup="topupnetwork"
                                    options={networks}
                                    onSelect={setTopupnetwork}
                                    selected={topupNetwork ?? false}
                                />
                            ) : null}
                        </Col>

                        <Col xs="12" sm="8">
                            <label
                                className={styles.dapp__label}
                                htmlFor="cardnumber"
                            >
                                Card Number
                            </label>
                            <input
                                type="text"
                                name="cardnumber"
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setTopupCardNumber(e.currentTarget.value);
                                }}
                            />
                        </Col>
                        <Col xs="12" sm="4">
                            <label
                                className={styles.dapp__label}
                                htmlFor="cardnumber"
                            >
                                Amount in USD
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                name="topupamount"
                                autoComplete="off"
                                value={topupAmount}
                                onChange={(e) => {
                                    e.preventDefault();
                                    setTopupAmount(e.currentTarget.value);
                                }}
                            />
                        </Col>
                        <Col xs="12">
                            <button
                                className="button button__large"
                                onClick={handleTopupEvent}
                            >
                                Next
                            </button>
                        </Col>
                    </Row>
                </div>

                <Row>
                    <Col xs="12" customClass="text-center">
                        <div className="transaction__details">
                            <div>
                                <span>Transaction Fee:</span>{" "}
                                <span>4% + $10</span>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Col>
        </>
    );
};

export default TopUpInterface;
