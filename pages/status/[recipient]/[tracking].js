//UI Imports
import Header from "../../../components/Header";
import Container from "../../../components/Container";
import Row from "../../../components/Row";
import Col from "../../../components/Col";
import styles from "../../../styles/Dapp.module.scss";
import { useEffect, useState } from "react";
import SVGLoader from "../../../components/Mixer/SVGLoader";
import NETWORK_HELPER from "../../../lib/networkHelper";
import Image from "next/image";
import { useRouter } from "next/router";
import swal from "sweetalert";

export default function Status() {
    const router = useRouter();

    const [apiResponse, setApiResponse] = useState(false);

    const [notReported, setNotReported] = useState(false);

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

    const reportTransaction = async () => {
        const { recipient, tracking } = router.query;

        setNotReported(true);

        let response = await postHelper("/api/tracking_report", {
            recipient: recipient,
            tracking: tracking,
        });

        swal(
            "Transaction successfully reported!",
            "Report has been submitted and we will review your transaction soon. Thank you for your patience.",
            "success"
        );
    };

    useEffect(async () => {
        const { recipient, tracking } = router.query;

        let response = await postHelper("/api/status", {
            recipient: recipient,
            tracking: tracking,
        });

        if (response.message.content) {
            setApiResponse(response.message.content[0]);
        }
    }, [router]);

    return (
        <>
            <Header onConnect={false} />
            <Container>
                <Row>
                    <Col xs="12" sm="8" customClass="col-sm-offset-2">
                        <h2>
                            transaction <span>status</span>
                        </h2>
                        <div
                            className={`${styles.dapp_box} ${styles.dapp__box_bridge}`}
                        >
                            <Row>
                                {!apiResponse ? (
                                    <Col xs="12">
                                        <center>
                                            <SVGLoader></SVGLoader>
                                        </center>
                                    </Col>
                                ) : (
                                    <StatusContent
                                        data={apiResponse}
                                        reportTransaction={reportTransaction}
                                        notReported={notReported}
                                    />
                                )}
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

const StatusContent = ({ data, reportTransaction, notReported }) => {
    const network_map = {
        1: "bsc",
        3: "pol",
        4: "avax",
        5: "eth",
        7: "cro",
        8: "ftm",
        9: "pls",
        10: "doge",
    };

    const status_map = {
        1: "Registered",
        2: "Pending",
        3: "Cancelled",
        4: "Success",
        5: "Failed",
    };

    let statusCode = Math.floor(data.status_code / 100);

    const fromNetwork = NETWORK_HELPER.getNetworkData(
        network_map[data.from_network]
    );

    const toNetwork = NETWORK_HELPER.getNetworkData(
        network_map[data.to_network]
    );

    return (
        <>
            <Col xs="12">
                <label className={styles.dapp__label}>Status</label>
                <div>{status_map[statusCode] ?? "Pending"}</div>
            </Col>

            <Col xs="12">
                <label className={styles.dapp__label}>Estimated delivery</label>
                <div>
                    {new Date(
                        Number(data.estimated_sending + "000")
                    ).toLocaleString("en-US")}
                </div>
            </Col>

            <Col xs="12">
                <label className={styles.dapp__label}>From</label>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                        style={{
                            width: "27px",
                            height: "27px",
                            marginRight: "10px",
                            display: "inline-block",
                            position: "relative",
                        }}
                    >
                        <Image
                            src={fromNetwork.image}
                            alt={fromNetwork.title}
                            layout="fill"
                        />
                    </div>
                    {fromNetwork.title} - {data.treasury_address}
                </div>
            </Col>
            <Col xs="12">
                <label className={styles.dapp__label}>To</label>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                        style={{
                            width: "27px",
                            height: "27px",
                            marginRight: "10px",
                            display: "inline-block",
                            position: "relative",
                        }}
                    >
                        <Image
                            src={toNetwork.image}
                            alt={toNetwork.title}
                            layout="fill"
                        />
                    </div>
                    {toNetwork.title} - {data.recipient}
                </div>
            </Col>

            {statusCode == 4 ? (
                <>
                    <Col xs="12">
                        <label className={styles.dapp__label}>
                            Transaction Hash
                        </label>
                        <div>{data.data}</div>
                    </Col>
                    <Col xs="12">
                        <label className={styles.dapp__label}>Timestamp</label>
                        <div>
                            {new Date(
                                Number(data.created_at + "000")
                            ).toLocaleString("en-US")}
                        </div>
                    </Col>
                </>
            ) : null}

            {statusCode > 1 && !notReported ? (
                <Col xs="6">
                    <button onClick={reportTransaction} className="button">
                        Report a Problem
                    </button>
                </Col>
            ) : null}
        </>
    );
};
