//UI Imports
import Header from "../components/Header";
import Container from "../components/Container";
import Row from "../components/Row";
import Col from "../components/Col";
import MixerInterface from "../components/Mixer/MixerInterface";
import NETWORK_HELPER from "../lib/networkHelper";
import styles from "../styles/Dapp.module.scss";

import { useEffect, useState } from "react";

export default function Bridge() {
    const [connectedNetwork, setConnectedNetwork] = useState(false);
    const [connectedAddress, setConnectedAddress] = useState(false);
    const [inputNetworkData, setInputNetworkData] = useState(false);

    const onConnect = false;

    useEffect(() => {
        let netD = NETWORK_HELPER.getNetworkByChain(connectedNetwork);
        if (netD) {
            setInputNetworkData(netD);
        }
    }, [connectedNetwork]);

    return (
        <>
            <Header
                networkSetter={setConnectedNetwork}
                accountSetter={setConnectedAddress}
                onConnect={onConnect}
            />
            <Container>
                <h1 className="page_main_title">Anonymous Bridge</h1>
                <Row>
                    <Col xs="12" sm="8" customClass="col-sm-offset-2">
                        <Row>
                            <MixerInterface
                                input_network={inputNetworkData}
                                user_account={connectedAddress}
                                onConnect={onConnect}
                            ></MixerInterface>
                        </Row>
                    </Col>
                    <Col xs="12" md="8" customClass="col-md-offset-2">
                        <Row customClass={styles.dapp__blocks}>
                            <Col xs="12" sm="6">
                                <div>
                                    <h3>Deposit</h3>
                                    <p>· Choose your blockchain origin and target.</p>
                                    <p>· Enter your target address.</p>
                                    <p>· Enter your amount to bridge.</p>
                                    <p>· To improve your privacy, set a higher delay time, up to 24 hours.</p>
                                </div>
                            </Col>
                            <Col xs="12" sm="6">
                                <div>
                                    <h3>Delivery</h3>
                                    <p>
                                        Your assets will arrive in the wallet of the selected target blockchain as the native tokens, NOT as wrapped tokens.
                                    </p>
                                    <p>
                                        There is never a need to claim your tokens because it will arrive automatically after the timer delay.
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
