import Col from "../Col";
import Row from "../Row";
import Link from "next/link";

import styles from "../../styles/Dapp.module.scss";

import Question from "../UI/Question";
import NetworkSelector from "./NetworkSelector";
import TransactionExtra from "./TransactionExtra";

import { useEffect, useState } from "react";

import Confirmation from "../Confirmation";

import NETWORK_HELPER from "../../lib/networkHelper";
import web3Helper from "../../lib/web3Helper";
import SVGLoader from "./SVGLoader";
import swal from "sweetalert";

const VisaInterface = ({ input_network, user_account, onConnect }) => {
    const [networks, setNetworks] = useState(false);
    const [mixerData, setMixerData] = useState(false);
    const [contractTransaction, setContractTransaction] = useState(false);

    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [isCompleted, setIsCompleated] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");

    const [cardType, setCardType] = useState(1);

    const [recipientNetwork, setRecipientNetwork] = useState("visa");
    const [callerNetwork, setCallerNetwork] = useState(false);
    const [advancedOptions, setAdvancedOptions] = useState(false);
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState(0);
    const [transactionReferal, setTransactionReferal] = useState("");
    const [transactionSecret, setTransactionSecret] = useState("");
    const [transactionDelay, setTransactionDelay] = useState(10);
    const [currency, setCurrency] = useState("BNB");
    const [outputCurrency, setOutputCurrency] = useState("BNB");
    const [selectableAmounts, setSelectableAmounts] = useState([
        100000000000000000,
        1000000000000000000,
        10000000000000000000,
        50000000000000000000,
        false,
    ]);

    const [visaTransaction, setVisaTransaction] = useState(false);

    const [delayOptions, setDelayOptions] = useState([
        { title: "10 minutes", value: 10 },
    ]);

    const [expectedDelivery, setExpnectedDelivery] = useState(
        new Date(Date.now())
    );

    const calculateExpected = () => {
        let a = new Date(
            (Date.now() / 60000 + parseInt(transactionDelay)) * 60000
        );
        let b = 1000 * 60 * 5;
        let c = new Date(Math.ceil(new Date(a).getTime() / b) * b);
        setExpnectedDelivery(c);
    };

    useEffect(calculateExpected, [transactionDelay]);
    useEffect(calculateExpected, []);

    const [changeRate, setChangeRate] = useState(0);

    useEffect(() => {
        let net_w = NETWORK_HELPER.getNetworkData(recipientNetwork);
        setOutputCurrency(net_w.currency);

        setChangeRate(0);
        fetch("/api/rate?from=" + callerNetwork + "&to=" + recipientNetwork)
            .then(async (rate) => {
                let a = await rate.json();
                setChangeRate(a);
            })
            .catch((error) => {
                setChangeRate(0);
            });
    }, [callerNetwork, recipientNetwork]);

    const setVisaDetails = () => {
        setCurrency("USD");

        setSelectableAmounts([
            50000000000000000000, 100000000000000000000, 200000000000000000000,
            500000000000000000000, 750000000000000000000,
            1500000000000000000000,
        ]);
    };

    useEffect(() => {
        if (recipientNetwork == "visa") {
            setVisaDetails();
        } else {
            setCllerNetwoekData();
        }
    }, [recipientNetwork]);

    useEffect(() => {
        if (recipientNetwork == "visa") {
            setVisaDetails();
            return false;
        }

        setCllerNetwoekData();
    }, [callerNetwork]);

    useEffect(() => {
        setCallerNetwork(input_network.value);

        if (recipientNetwork != "visa") {
            setCurrency(input_network.currency);
        }
    }, [input_network]);

    useEffect(() => {
        if (typeof input_network != "undefined") {
            setCallerNetwork(input_network.value);
            if (recipientNetwork != "visa") {
                setCurrency(input_network.currency);
            }
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

                        console.log("d", d);

                        setNetworks(d);
                    })
                    .catch(() => {});
            })
            .catch(() => {});
    }, []);

    const postHelper = (url, postData) => {
        return new Promise((resolve, reject) => {
            fetch(url, {
                body: JSON.stringify(postData),
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
            })
                .then((response) => {
                    response
                        .json(() => {})
                        .then((data) => {
                            resolve(data);
                        })
                        .catch((error) => {
                            resolve({ success: false, message: error });
                        });
                })
                .catch((error) => {
                    resolve({ success: false, message: error });
                });
        });
    };

    const handleSubmitEvent = async (evt) => {
        evt.preventDefault();
        setMixerData(true);

        if (
            typeof input_network.value != "undefined" &&
            input_network.value != callerNetwork &&
            amount != false
        ) {
            swal("Network", "You are on different network!", "info");
            setMixerData(false);
            return false;
        }

        if (recipientNetwork == "visa") {
            recipient = "0x0000000000000000000000000000000000000000";
        }

        let postData = {
            output_network: recipientNetwork,
            input_network: callerNetwork,
            recipient: recipient,
            amount: amount,
            referal: transactionReferal,
            secret: transactionSecret,
            delay: transactionDelay,
            caller: user_account,
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

    const handleTransactionConfirmation = async (event) => {
        event.preventDefault();
        setContractTransaction(true);
        if (!user_account) {
            setContractTransaction(false);
            return setMixerData(false);
        }

        if (mixerData.action == "visa") {
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

            console.log("val" + value);

            try {
                console.log(mixerData, "mixerData");

                let txHash = await visaContract.methods
                    .deposit(
                        parseInt(mixerData.transactionId),
                        mixerData.input.plan
                    )
                    .send({
                        from: user_account,
                        value: value,
                    });

                if (txHash && typeof txHash.transactionHash != "undefined") {
                    let api_reponse = await postHelper("/api/card", {
                        id: mixerData.transactionId,
                        tx_hash: txHash.transactionHash,
                        phone: phoneNumber,
                        card_type: cardType,
                    });

                    if (!api_reponse.success) {
                        swal("Oops", api_reponse.message, "error");
                        setContractTransaction(false);
                        return setMixerData(false);
                    } else {
                        setContractTransaction(false);
                        return setVisaTransaction(api_reponse.message);
                    }
                }
            } catch (e) {
                swal("Oops", e.message, "error");
                setContractTransaction(false);
                return setMixerData(false);
            }

            return false;
        }

        setContractTransaction(false);
        return setMixerData(false);
    };

    const toggleAdvancedOptions = (e) => {
        e.preventDefault();
        setAdvancedOptions(!advancedOptions);
    };

    useEffect(() => {
        setAccepted(false);
        setButtonEnabled(false);
        setIsCompleated(false);
        setVisaTransaction(false);
    }, [mixerData]);

    const [accepted, setAccepted] = useState(false);

    return (
        <>
            {mixerData && (
                <Confirmation
                    setCardType={setCardType}
                    cardType={cardType}
                    setPhoneNumber={setPhoneNumber}
                    phoneNumber={phoneNumber}
                    visaTransaction={visaTransaction}
                    user_account={user_account}
                    transactionData={mixerData}
                    onClose={setMixerData}
                    onConfirm={handleTransactionConfirmation}
                    onConnect={onConnect}
                    limitations={selectableAmounts}
                    contractTransaction={contractTransaction}
                    setButtonEnabled={setButtonEnabled}
                    isCompleted={isCompleted}
                    setIsCompleated={setIsCompleated}
                    buttonEnabled={buttonEnabled}
                    accepted={accepted}
                    setAccepted={setAccepted}
                />
            )}

            <Col xs="12" md="4" customClass="col-md-offset-4">
                <h2 style={{ padding: "1rem 0 2rem 0" }}>
                    crypto to prepaid <span>card</span>
                </h2>
                <div className={`${styles.dapp_box} ${styles.dapp_box__visa}`}>
                    <form onSubmit={handleSubmitEvent}>
                        <Content
                            networks={networks}
                            setTransactionDelay={setTransactionDelay}
                            setRecipient={setRecipient}
                            setAmount={setAmount}
                            setTransactionReferal={setTransactionReferal}
                            setTransactionSecret={setTransactionSecret}
                            currency={currency}
                            callerNetwork={callerNetwork}
                            setCallerNetwork={setCallerNetwork}
                            recipientNetwork={recipientNetwork}
                            selectableAmounts={selectableAmounts}
                            delayOptions={delayOptions}
                            toggleAdvancedOptions={toggleAdvancedOptions}
                            advancedOptions={advancedOptions}
                            setAdvancedOptions={setAdvancedOptions}
                            changeRate={changeRate}
                            outputCurrency={outputCurrency}
                            amount={amount}
                            transactionReferal={transactionReferal}
                            expectedDelivery={expectedDelivery}
                        />
                    </form>
                    <center>
                        <Link href="/card-balance">
                            <a
                                style={{
                                    color: "var(--highlight)",
                                    textDecoration: "none",
                                }}
                            ></a>
                        </Link>
                    </center>
                </div>

                <Row>
                    <Col xs="12" customClass="text-center">
                        <div className="transaction__details">
                            <div>
                                <span>Transaction Fee:</span>
                                <span>4% + $10</span>
                            </div>
                            <div>
                                <span>Monthly Fee:</span>
                                <span>$1.75</span>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Col>
        </>
    );
};

const Content = ({
    networks,
    changeRate,
    setRecipientNetwork,
    setTransactionDelay,
    setRecipient,
    setAmount,
    setTransactionSecret,
    setTransactionReferal,
    currency,
    callerNetwork,
    setCallerNetwork,
    recipientNetwork,
    selectableAmounts,
    delayOptions,
    toggleAdvancedOptions,
    advancedOptions,
    outputCurrency,
    amount,
    transactionReferal,
    setAdvancedOptions,
    expectedDelivery,
}) => {
    if (!networks) {
        return (
            <>
                <center>
                    <SVGLoader></SVGLoader>
                </center>
            </>
        );
    }

    return (
        <>
            <NetworkSelector
                networks={networks}
                selected={recipientNetwork}
                onSelect={setRecipientNetwork}
                callerNetwork={callerNetwork}
                setCallerNetwork={setCallerNetwork}
                isVisa={true}
            />

            {recipientNetwork == "visa" ? null : (
                <Row>
                    <Col xs="12" sm="12">
                        <label
                            className={styles.dapp__label}
                            htmlFor="recipient"
                        >
                            Recipient
                            <Question ans="Input destination wallet address" />
                        </label>
                        <input
                            type="text"
                            name="recipient"
                            autoComplete="off"
                            onChange={(e) =>
                                setRecipient(e.currentTarget.value)
                            }
                        />
                    </Col>
                </Row>
            )}

            <Row>
                <Col xs="12">
                    <label className={styles.dapp__label} htmlFor="rec_network">
                        Amount
                        <Question ans="Choose pre-defined sending amount or input custom" />
                    </label>
                    <AmountSelector
                        setAmount={setAmount}
                        currency={currency}
                        amounts={selectableAmounts}
                    />
                </Col>
            </Row>
            {advancedOptions && (
                <TransactionExtra
                    onSelectDelay={setTransactionDelay}
                    setTransactionSecret={setTransactionSecret}
                    setTransactionReferal={setTransactionReferal}
                    delayOptions={delayOptions}
                ></TransactionExtra>
            )}
            <Row>
                <Col xs="12">
                    <button className="button button__large">Next</button>
                </Col>
            </Row>
        </>
    );
};

const AmountSelector = ({ setAmount, amounts, currency }) => {
    return (
        <div className={styles.amount}>
            {amounts.map((value, key) => (
                <AmountOption
                    key={key}
                    value={value}
                    setAmount={setAmount}
                    currency={currency}
                />
            ))}
        </div>
    );
};

const AmountOption = ({ value, setAmount, currency }) => {
    return (
        <div>
            <input
                type="radio"
                id={"amount-" + value}
                name="input-amount"
                onChange={() => setAmount(value)}
            />
            <label htmlFor={"amount-" + value}>
                {value
                    ? value / 1000000000000000000 > 5
                        ? (currency == "USD" ? "$" : "") +
                          Math.ceil(value / 1000000000000000000) +
                          " " +
                          (currency == "USD" ? "" : currency)
                        : (currency == "USD" ? "$" : "") +
                          value / 1000000000000000000 +
                          " " +
                          (currency == "USD" ? "" : currency)
                    : "Custom"}
            </label>
        </div>
    );
};

export default VisaInterface;
