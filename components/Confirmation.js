import Col from "../components/Col";
import Row from "../components/Row";
import styles from "../styles/Confirmation.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCopy } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import SVGLoader from "./Mixer/SVGLoader";
import Countdown from "react-countdown";
import swal from "sweetalert";
import Link from "next/link";
import { useEffect, useState } from "react";

import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";

const toDigit = (time) => {
    if (parseInt(time) < 10) {
        time = "0" + time;
    }

    return time;
};

const Confirmation = ({
    onClose,
    onConfirm,
    transactionData,
    limitations,
    setPhoneNumber,
    phoneNumber,
    contractTransaction,
    buttonEnabled,
    setButtonEnabled,
    isCompleted,
    setIsCompleated,
    accepted,
    setAccepted,
    visaTransaction,
}) => {
    if (typeof transactionData != "object") {
        return <Loading onClose={onClose}></Loading>;
    }

    const countdownRender = ({ days, hours, minutes, seconds, completed }) => {
        if (completed) {
            return <></>;
        }

        return (
            <span>
                {toDigit(hours)}:{toDigit(minutes)}:{toDigit(seconds)}
            </span>
        );
    };

    let min = limitations[1];
    let max = limitations[limitations.length - 1];

    if (transactionData.from_network.currency == "BTC") {
        min = 6000000000000000;
        max = 3000000000000000000;
    }

    if (visaTransaction) {
        let card_number = visaTransaction.card_number;
        card_number = card_number.match(/.{1,4}/g);
        card_number = card_number.join(" ");
        return (
            <div className={styles.dapp_confirmation}>
                <div className={styles.dapp_confirmation__inner}>
                    <header>Card Details</header>
                    <div style={{ paddingLeft: "15px", paddingRight: "15px" }}>
                        <div className={styles.dapp_confirmation__vcc}>
                            <div
                                className={styles.dapp_confirmation__vcc__inner}
                            >
                                <div>
                                    <Row>
                                        <Col xs="12">
                                            <div
                                                className={
                                                    styles.confirmation__label
                                                }
                                            >
                                                Card number
                                            </div>
                                            <div
                                                className={`${styles.confirmation__val} ${styles.vcc__card}`}
                                            >
                                                {card_number}
                                            </div>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col xs="6">
                                            <div
                                                className={
                                                    styles.confirmation__label
                                                }
                                            >
                                                Expiry date
                                            </div>
                                            <div
                                                className={
                                                    styles.confirmation__val
                                                }
                                            >
                                                {visaTransaction.card_exp_mth} /{" "}
                                                {visaTransaction.card_exp_year}
                                            </div>
                                        </Col>

                                        <Col xs="4">
                                            <div
                                                className={
                                                    styles.confirmation__label
                                                }
                                            >
                                                CVV
                                            </div>
                                            <div
                                                className={
                                                    styles.confirmation__val
                                                }
                                            >
                                                {visaTransaction.card_cvv}
                                            </div>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col xs="12">
                                            <div
                                                className={
                                                    styles.confirmation__label
                                                }
                                            >
                                                Name
                                            </div>
                                            <div
                                                className={
                                                    styles.confirmation__val
                                                }
                                            >
                                                {/* {visaTransaction.card_holder_name} Block Blender */}
                                                Block Blender
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Row>
                        <Col xs="12">
                            <button
                                className={"button button__large"}
                                onClick={(e) => {
                                    onClose(false);
                                }}
                            >
                                Close<small>I saved all the data</small>
                            </button>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }

    if (contractTransaction) {
        return (
            <div className={styles.dapp_confirmation}>
                <div className={styles.dapp_confirmation__inner}>
                    <header>Transaction in progress...</header>
                    <Row>
                        <Col xs="12">
                            <center>
                                <SVGLoader></SVGLoader>
                            </center>
                            <center>Please do not close the window!</center>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dapp_confirmation}>
            <div className={styles.dapp_confirmation__inner}>
                <header>
                    Confirmation
                    <button
                        className={styles.closeModal}
                        onClick={() => {
                            onClose(false);
                        }}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </header>
                <Row>
                    {transactionData.action != "visa" ? (
                        <Col xs="12">
                            <div className={styles.confirmation__label}>
                                Recipient
                            </div>
                            <div className={styles.confirmation__val}>
                                {transactionData.transactionRecipient}
                            </div>
                        </Col>
                    ) : null}

                    <Col xs="6">
                        <div classNamemin={styles.confirmation__label}>
                            From
                        </div>
                        <div className={styles.confirmation__val}>
                            <div>
                                <Image
                                    src={transactionData.from_network.image}
                                    alt={transactionData.from_network.title}
                                    layout="fill"
                                />
                            </div>{" "}
                            {transactionData.from_network.title}
                        </div>
                    </Col>
                    <Col xs="6">
                        <div className={styles.confirmation__label}>To</div>
                        <div className={styles.confirmation__val}>
                            <div>
                                <Image
                                    src={transactionData.to_network.image}
                                    alt={transactionData.to_network.title}
                                    layout="fill"
                                />
                            </div>
                            {transactionData.to_network.title}
                        </div>
                    </Col>
                    <Col xs="6">
                        <div className={styles.confirmation__label}>Amount</div>
                        <div className={styles.confirmation__val}>
                            <div>
                                <Image
                                    src={transactionData.input.image}
                                    alt={transactionData.input.currency}
                                    layout="fill"
                                />
                            </div>{" "}
                            {transactionData.input.amount
                                ? transactionData.input.amount /
                                      1000000000000000000 +
                                  " " +
                                  transactionData.input.currency
                                : "min. " +
                                  min / 1000000000000000000 +
                                  ", max. " +
                                  Math.ceil(max / 1000000000000000000)}
                        </div>
                    </Col>

                    {transactionData.action == "visa" ? (
                        <Col xs="12">
                            <div className={styles.confirmation__label}>
                                Would you like Apple Pay/Google Pay support? (only U.S. / Canada)
                            </div>
                            <div className={styles.confirmation__phone}>
                                <PhoneInput
                                    country="US"
                                    value={phoneNumber}
                                    onChange={setPhoneNumber}
                                    placeholder="Enter phone number"
                                ></PhoneInput>
                            </div>
                        </Col>
                    ) : null}

                    {transactionData.action != "visa" ? (
                        <Col xs="6">
                            <div className={styles.confirmation__label}>
                                Estimated delivery*
                            </div>
                            <div className={styles.confirmation__val}>
                                {new Date(
                                    transactionData.expected_delivery
                                ).toLocaleString("en-US")}
                            </div>
                        </Col>
                    ) : null}
                    {!buttonEnabled &&
                    transactionData.action != "contract" &&
                    transactionData.action != "visa" ? (
                        <Col xs="12" customClass="pt-0">
                            <input
                                type="checkbox"
                                id="confirmcheckbox"
                                name="confirmcheckbox"
                                value="confirmcheckbox"
                                checked={buttonEnabled}
                                onChange={() => {
                                    setButtonEnabled(!buttonEnabled);
                                }}
                            ></input>
                            <label
                                htmlFor="confirmcheckbox"
                                className={styles.confirmation__label_cb}
                            >
                                I fully understand that the minimum amount to
                                transfer is {min / 1000000000000000000}{" "}
                                {transactionData.input.currency}.
                            </label>
                        </Col>
                    ) : null}
                    {!buttonEnabled &&
                    transactionData.action != "interact" &&
                    transactionData.action != "visa" ? (
                        ""
                    ) : (
                        <Col xs="12">
                            <label className={styles.confirmation__label}>
                                Please backup your recovery key
                            </label>
                            <div
                                className={styles.confirmation__recovery}
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        transactionData.recovery +
                                            "!" +
                                            transactionData.tracking
                                    );

                                    swal("Copied to clipboard", "", "success", {
                                        buttons: false,
                                        timer: 3000,
                                    });
                                }}
                            >
                                {transactionData.recovery}!
                                {transactionData.tracking}
                            </div>
                            {/* {transactionData.action != "interact" && (
              <p className="text-center mt-05">
                <small>
                  Send only {transactionData.input.currency} to this deposit
                  address.
                </small>
              </p>
            )} */}
                        </Col>
                    )}
                </Row>

                {transactionData.action == "interact" ||
                transactionData.action == "visa" ||
                isCompleted ? (
                    ""
                ) : (
                    <div
                        className={
                            styles.confirmation__sendTo +
                            (!buttonEnabled &&
                            (transactionData.action != "interact" ||
                                transactionData.action == "visa")
                                ? " " + styles.sendToDisabled
                                : "")
                        }
                    >
                        <div className={styles.confirmation__label}>
                            Send {transactionData.input.currency}{" "}
                            <strong>
                                within{" "}
                                <Countdown
                                    key={transactionData.expected_delivery}
                                    date={transactionData.expected_delivery}
                                    renderer={countdownRender}
                                    onComplete={() => {
                                        setIsCompleated(true);
                                    }}
                                ></Countdown>
                            </strong>{" "}
                            to
                        </div>
                        <div
                            className={styles.confirmation__val}
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    transactionData.treasuryAddress
                                );

                                swal("Copied to clipboard", "", "success", {
                                    buttons: false,
                                    timer: 3000,
                                });
                            }}
                        >
                            {transactionData.treasuryAddress}{" "}
                            <button className={styles.confirmation__copy}>
                                <FontAwesomeIcon icon={faCopy} />
                            </button>
                        </div>
                    </div>
                )}
                <Row>
                    <Col xs="12" customClass="pt-0">
                        {transactionData.action == "interact" ||
                        transactionData.action == "visa" ? (
                            <button className="button" onClick={onConfirm}>
                                Confirm transaction
                            </button>
                        ) : (
                            <button
                                className={
                                    "button button__large" +
                                    (!buttonEnabled
                                        ? " " + styles.disabled
                                        : "")
                                }
                                onClick={(e) => {
                                    if (buttonEnabled) {
                                        onConfirm(e);
                                    }
                                }}
                            >
                                Close<small>I saved my recovery key</small>
                            </button>
                        )}
                    </Col>
                </Row>
            </div>
        </div>
    );
};

const Loading = ({ onClose }) => {
    return (
        <div className={styles.dapp_confirmation}>
            <div className={styles.dapp_confirmation__inner}>
                <header>
                    Transaction
                    <button
                        className={styles.closeModal}
                        onClick={() => {
                            onClose(false);
                        }}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </header>
                <Row>
                    <Col xs="12">
                        <center>
                            <SVGLoader></SVGLoader>
                        </center>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Confirmation;
