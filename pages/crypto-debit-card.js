//UI Imports
import Head from "next/head";
import Header from "../components/Header";
import Container from "../components/Container";
import Row from "../components/Row";
import Col from "../components/Col";
import VisaInterface from "../components/Mixer/VisaInterface";
import TopUpInterface from "../components/Mixer/TopUpInterface";
import NETWORK_HELPER from "../lib/networkHelper";
import styles from "../styles/Dapp.module.scss";

import { useEffect, useState } from "react";

export default function Visa() {
    const [connectedNetwork, setConnectedNetwork] = useState(false);
    const [connectedAddress, setConnectedAddress] = useState(false);
    const [inputNetworkData, setInputNetworkData] = useState(false);

    const [cardBalance, setCardBalance] = useState(false);
    const [cardNumber, setCardNumber] = useState("");

    const onConnect = false;

    useEffect(() => {
        let netD = NETWORK_HELPER.getNetworkByChain(connectedNetwork);
        if (netD) {
            setInputNetworkData(netD);
        }
    }, [connectedNetwork]);

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

    const getBalance = async () => {
        setCardBalance(false);

        if (cardNumber && cardNumber.length > 0) {
            let value = await postHelper("/api/card-balance", {
                card_number: cardNumber,
            });

            if (value.success) {
                setCardBalance(value.message);
            }
        }
    };

    return (
        <>
            <Head>
                <title>Crypto to Prepaid Card - BabyPepe</title>
                <meta
                    property="og:title"
                    content="Crypto to Prepaid Card - BabyPepe"
                    key="og_title"
                />
                <meta
                    name="twitter:title"
                    content="Crypto to Prepaid Card - BabyPepe"
                    key="twitter_title"
                />
            </Head>
            <Header
                networkSetter={setConnectedNetwork}
                accountSetter={setConnectedAddress}
                onConnect={onConnect}
            />
            <Container>
                <Row>
                    <VisaInterface
                        input_network={inputNetworkData}
                        user_account={connectedAddress}
                        onConnect={onConnect}
                    ></VisaInterface>

                    <TopUpInterface
                        input_network={inputNetworkData}
                        user_account={connectedAddress}
                        onConnect={onConnect}
                    ></TopUpInterface>

                    <Col xs="12" md="4" customClass="col-md-offset-4">
                        <h2 style={{ padding: "1rem 0 2rem 0" }}>
                            check card <span>balance</span>
                        </h2>
                        <div
                            className={`${styles.dapp_box} ${styles.dapp_box__visa}`}
                        >
                            <Row>
                                <Col xs="12">
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
                                        value={cardNumber}
                                        onChange={(e) => {
                                            e.preventDefault();
                                            setCardNumber(
                                                e.currentTarget.value
                                            );
                                        }}
                                    />
                                </Col>
                                <Col xs="12">
                                    <button
                                        className="button button__large"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            getBalance();
                                        }}
                                    >
                                        Show Balance
                                    </button>

                                    {cardBalance !== false ? (
                                        <p>Card balance: ${cardBalance}</p>
                                    ) : (
                                        <></>
                                    )}
                                </Col>
                            </Row>
                        </div>
                    </Col>
                    <Col xs="12">
                        <Row
                            customClass={`${styles.dapp__blocks} ${styles.dapp__block_nm}`}
                        >
                            <Col xs="12">
                                <h2>
                                    how does it <span>work?</span>
                                </h2>
                            </Col>
                            <Col xs="12" sm="6">
                                <div>
                                    <h3>Deposit</h3>
                                    <p>
                                        Complete the form and click
                                        &quot;next&quot;. <br />
                                        Confirm the transaction to generate an
                                        Anonymous Prepaid VISA<sup>&reg;</sup> /
                                        Mastercard<sup>&reg;</sup> Card.
                                    </p>
                                </div>
                            </Col>
                            <Col xs="12" sm="6">
                                <div>
                                    <h3>Your Anonymous Crypto Debit Card</h3>
                                    <p>
                                        After your transaction is mined, the
                                        card details will appear on your screen.
                                        Be sure to save this information as
                                        &quot;IT WILL NOT BE DISPLAYED
                                        AGAIN&quot;
                                    </p>
                                    <p>
                                        You can use your card where virtual VISA
                                        <sup>&reg;</sup> / Mastercard
                                        <sup>&reg;</sup> prepaid is accepted.
                                        <br />
                                        The balance on the expired cards are
                                        non-refundable.
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
