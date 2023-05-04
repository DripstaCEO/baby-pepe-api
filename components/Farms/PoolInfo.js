import Row from "../Row";
import Col from "../Col";
import styles from "../../styles/Farms.module.scss";
import { useEffect, useState } from "react";
import web3Helper from "../../lib/web3Helper";
import priceHelper from "../../lib/price";
import Countdown from "react-countdown";
import swal from "sweetalert";

const PoolInfo = ({
    poolData,
    connectedNetwork,
    connectedAddress,
    networkSetter,
    accountSetter,
    setTotalStaked,
    showpasts,
}) => {
    const toDigit = (time) => {
        if (parseInt(time) < 10) {
            time = "0" + time;
        }

        return time;
    };

    const countdownRender = ({ days, hours, minutes, seconds, completed }) => {
        if (completed) {
            return <> </>;
        }

        return (
            <span>
                {days} days {toDigit(hours)}:{toDigit(minutes)}:
                {toDigit(seconds)}
            </span>
        );
    };

    const onConnectClick = () => {
        web3Helper
            .getCurrentAccount("click", accountSetter, networkSetter)
            .then((wallet) => {
                accountSetter(wallet.address);
                networkSetter(wallet.network);
            })
            .catch(() => {});
    };

    const formatMoney = require("../../lib/price").formatMoney;

    const w3 = web3Helper.getNetworkClient();
    const [poolContract, setPoolContract] = useState(false);
    const [tokenContract, setTokenContract] = useState(false);
    const [APR, setAPR] = useState(false);
    const [stakedTokens, setStakedTokens] = useState(0);
    const [userStakedTokens, setUserStakedTokens] = useState(0);
    const [pendingRewards, setPendingRewards] = useState(0);
    const [tokenBusdPrice, setTokenBusdPrice] = useState(0);
    const [isPoolLive, setPoolLive] = useState(false);
    const [totalRewards, setTotalRewards] = useState(0);
    const [isAllowed, setIsAllowed] = useState(false);
    const [userBalance, setUserBalance] = useState(0);
    const [inputValue, setInputValue] = useState(0);
    const [lastAction, setLastAction] = useState(false);
    const [lastDepositTime, setLastDepositTime] = useState(0);
    const [earlyFeeCountdown, setEarlyFeeCountdown] = useState(0);
    const [endDate, setEndDate] = useState(0);
    const [canSatake, setCanStake] = useState(true);

    const [totalTOKENStaked, setTotalTOKENStaked] = useState(0);

    useEffect(() => {
        if (typeof setTotalStaked != "undefined") {
            setTotalStaked(poolData.id, stakedTokens);
        }
    }, [stakedTokens]);

    useEffect(() => {
        if (typeof setTotalStaked != "undefined" && totalTOKENStaked != 0) {
            setTotalStaked(poolData.id, totalTOKENStaked * 1000000000000000000);
        }
    }, [totalTOKENStaked]);

    const stakePercent = (value) => {
        setInputValue(
            parseInt(Math.floor(parseFloat((userBalance / 100) * value)))
        );
    };

    const aproveToken = async (e) => {
        if (!isPoolLive) {
            return false;
        }

        e.preventDefault();
        const tx_hash = await tokenContract.methods
            .approve(
                poolData.contract,
                "115792089237316195423570985008687907853269984665640564039457584007913129639935"
            )
            .send({ from: connectedAddress });

        if (tx_hash) {
            setTimeout(checkIsAllowed, 20000);
        }
    };

    const onStake = async (e) => {
        if (!isPoolLive && canSatake) {
            return false;
        }

        e.preventDefault();

        if (parseFloat(inputValue) < 1) {
            return false;
        }

        const tx_hash = await poolContract.methods
            .deposit(w3.utils.toWei("" + parseFloat(inputValue).toFixed(0)))
            .send({ from: connectedAddress, value: 0 });

        setLastAction(Date.now());
    };

    const onHarvest = async (e) => {
        e.preventDefault();

        if (parseFloat(pendingRewards) < 1) {
            return false;
        }

        const tx_hash = await poolContract.methods
            .claimRewards()
            .send({ from: connectedAddress, value: 0 });

        setLastAction(Date.now());
    };

    const onUnstake = async (e) => {
        e.preventDefault();

        if (parseFloat(inputValue) < 1) {
            swal(
                "Amount can&apost be zero. If you want to unstake, please set the amount.",
                "",
                "warning"
            );
            return false;
        }

        const tx_hash = await poolContract.methods
            .withdraw(w3.utils.toWei("" + parseFloat(inputValue).toFixed(0)))
            .send({ from: connectedAddress, value: 0 });

        setLastAction(Date.now());
    };

    const checkIsAllowed = async () => {
        const allowed = await tokenContract.methods
            .allowance(connectedAddress, poolData.contract)
            .call();

        if (allowed != 0) {
            setIsAllowed(true);
        }
    };

    const getPendingRewards = async () => {
        if (!connectedAddress) {
            return false;
        }

        const pr = await poolContract.methods
            .pendingRewards(connectedAddress)
            .call();

        setPendingRewards(parseFloat(pr));

        setTimeout(getPendingRewards, 30000);
    };

    const getTokenPrice = async () => {
        if (!poolData.token.price) {
            return false;
        }

        setTokenBusdPrice(0);
        return false;

        let dodgetoken = await tokenContract.methods.getTokenPrice(1).call();

        priceHelper
            .getUSDPrice({
                id: "wbnb",
            })
            .then((price) => {
                let c = price / dodgetoken;
                setTokenBusdPrice(c);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        if (poolData.startTime <= Date.now() || endDate >= Date.now()) {
            setPoolLive(true);
        }
    }, []);

    useEffect(() => {
        const tContract = new w3.eth.Contract(
            poolData.token.abi,
            poolData.token.contract
        );
        setTokenContract(tContract);

        if (poolData.contract.length > 0) {
            const pContract = new w3.eth.Contract(
                poolData.abi,
                poolData.contract
            );
            setPoolContract(pContract);
            return true;
        }

        setPoolContract(false);
        return false;
    }, [connectedNetwork, isPoolLive, lastAction]);

    useEffect(() => {
        setAPR(
            parseInt(
                (totalRewards /
                    1000000000000000000 /
                    (stakedTokens / 1000000000000000000)) *
                    poolData.APR_MULTIPLER *
                    100
            )
        );
    }, [totalRewards]);

    useEffect(() => {
        if (endDate - Date.now() < poolData.early_fee * 86400000) {
            setCanStake(true);
        } else {
            setCanStake(true);
        }
    }, [endDate]);

    useEffect(async () => {
        if (!poolContract || !isPoolLive) {
            return false;
        }

        await getTokenPrice();

        var endblock = await poolContract.methods.endBlock().call();

        var currentBlock = await w3.eth.getBlockNumber();
        let multi = 3;
        const enddate = Date.now() + (endblock - currentBlock) * multi * 1000;

        setEndDate(enddate);

        const balance = await tokenContract.methods
            .balanceOf(poolData.contract)
            .call();

        setStakedTokens(balance);

        setTotalRewards(await poolContract.methods.getTotalRewards().call());

        if (!connectedAddress) {
            return false;
        }

        const user_balance = await tokenContract.methods
            .balanceOf(connectedAddress)
            .call();

        setUserBalance(
            parseFloat(Math.floor(user_balance / 1000000000000000000)).toFixed(
                0
            )
        );

        checkIsAllowed();

        const user_info = await poolContract.methods
            .userInfo(connectedAddress)
            .call();

        const user_info_amount = user_info.amount ?? 0;
        setUserStakedTokens(user_info_amount);

        setLastDepositTime(user_info.lastDepositTime);

        const countdown =
            (user_info.lastDepositTime ?? 0) * 1000 +
            poolData.early_fee * 86400000;
        setEarlyFeeCountdown(countdown + 2 * 3600000);

        getPendingRewards();
    }, [poolContract, isPoolLive]);

    if (poolData.past && typeof showpasts == "undefined") {
        return <></>;
    }

    return (
        <Row>
            <Col xs="12">
                <div
                    className={
                        isPoolLive
                            ? styles.farms__info
                            : styles.farms__info + " " + styles.farms__disabled
                    }
                >
                    <header className={styles.farms__header}>
                        <div className={styles.farms__header_top}>
                            <div className={styles.farms__name}>
                                <h3>
                                    {poolData.name ?? "n/a"}
                                    {!isPoolLive ||
                                    poolData.contract.length == 0
                                        ? null
                                        : "  - APR " + (APR ?? "0") + "%"}
                                </h3>
                            </div>
                        </div>
                        <Row>
                            <Col xs="12" sm="4">
                                <span className={styles.farms__label}>
                                    Total Locked
                                </span>
                                <span className={styles.farms__val}>
                                    {formatMoney(
                                        parseFloat(
                                            stakedTokens /
                                                1000000000000000000 ?? 0
                                        ).toFixed(0)
                                    )}{" "}
                                    {poolData.token.name ?? ""}
                                </span>
                                <span className={styles.farms__label}>
                                    {tokenBusdPrice == 0
                                        ? null
                                        : "$" +
                                          formatMoney(
                                              (totalTOKENStaked != 0
                                                  ? totalTOKENStaked *
                                                    1000000000000000000
                                                  : stakedTokens) *
                                                  tokenBusdPrice,
                                              true
                                          )}
                                </span>
                            </Col>
                            <Col xs="12" sm="4">
                                <span className={styles.farms__label}>
                                    Pool Duration
                                </span>
                                <span className={styles.farms__val}>
                                    {poolData.duration ?? "0"} days
                                </span>
                                {/* <div>
                                    <span className={styles.farms__label}>
                                        <Countdown
                                            key={endDate}
                                            date={endDate}
                                            renderer={countdownRender}
                                        ></Countdown>
                                    </span>
                                </div> */}
                            </Col>
                            <Col xs="12" sm="4">
                                <span className={styles.farms__label}>
                                    Early withdrawal fee
                                </span>
                                <div>
                                    <span className={styles.farms__val}>
                                        {poolData.early_fee ?? "0"} days
                                    </span>
                                </div>
                                <div>
                                    <span className={styles.farms__label}>
                                        <Countdown
                                            key={earlyFeeCountdown}
                                            date={earlyFeeCountdown}
                                            renderer={countdownRender}
                                        ></Countdown>
                                    </span>
                                </div>
                            </Col>
                        </Row>
                    </header>
                    <Row>
                        <Col xs="12" sm="6">
                            <div className={styles.farms__info_block}>
                                <span className={styles.farms__label}>
                                    Staked
                                </span>
                                <span className={styles.farms__val}>
                                    {formatMoney(
                                        parseFloat(
                                            userStakedTokens /
                                                1000000000000000000 ?? 0
                                        ).toFixed(0)
                                    )}{" "}
                                    {poolData.token.name}
                                </span>
                                <span className={styles.farms__label}>
                                    {tokenBusdPrice == 0
                                        ? null
                                        : "$" +
                                          (totalTOKENStaked != 0
                                              ? formatMoney(
                                                    totalTOKENStaked *
                                                        1000000000000000000 *
                                                        tokenBusdPrice *
                                                        (userStakedTokens /
                                                            stakedTokens),
                                                    true
                                                )
                                              : formatMoney(
                                                    userStakedTokens *
                                                        tokenBusdPrice,
                                                    true
                                                ))}
                                </span>
                            </div>

                            <div className={styles.farms__info_block}>
                                <span className={styles.farms__label}>
                                    Share
                                </span>
                                <span className={styles.farms__val}>
                                    {parseFloat(
                                        poolData.contract.length == 0
                                            ? 0
                                            : (userStakedTokens /
                                                  stakedTokens) *
                                                  100
                                    ).toFixed(2) ?? "0"}
                                    %
                                </span>
                            </div>
                        </Col>
                        <Col xs="12" sm="6">
                            <div className={styles.farms__harvest}>
                                <span className={styles.farms__label}>
                                    Pending rewards
                                </span>
                                <span className={styles.farms__val}>
                                    {formatMoney(
                                        (
                                            pendingRewards / 1000000000000000000
                                        ).toFixed(2)
                                    )}{" "}
                                    {poolData.harvestToken
                                        ? poolData.harvestToken
                                        : poolData.rewardToken}
                                </span>
                                <span className={styles.farms__label}>
                                    {tokenBusdPrice == 0
                                        ? null
                                        : "$" +
                                          formatMoney(
                                              pendingRewards * tokenBusdPrice,
                                              true
                                          )}
                                </span>
                                {pendingRewards > 0 ? (
                                    <button
                                        className="button"
                                        onClick={onHarvest}
                                    >
                                        Harvest
                                    </button>
                                ) : null}
                            </div>
                        </Col>
                    </Row>
                </div>
            </Col>
            <Col xs="12">
                <div className={styles.farms__stake}>
                    <h3>Amount</h3>
                    <div className={styles.farms__stake_input}>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => {
                                e.preventDefault();
                                setInputValue(e.currentTarget.value);
                            }}
                        />
                    </div>
                    <div className={styles.farm__stake_btns}>
                        <button
                            onClick={() => {
                                stakePercent(25);
                            }}
                        >
                            25%
                        </button>
                        <button
                            onClick={() => {
                                stakePercent(50);
                            }}
                        >
                            50%
                        </button>
                        <button
                            onClick={() => {
                                stakePercent(100);
                            }}
                        >
                            100%
                        </button>
                    </div>
                    <div className={styles.farms__balance}>
                        Balance:{" "}
                        {formatMoney(parseFloat(userBalance).toFixed(0))}{" "}
                        {poolData.token.name}
                    </div>
                    {isAllowed ? (
                        <>
                            {canSatake ? (
                                <button
                                    className="button button__highlight"
                                    onClick={onStake}
                                >
                                    Stake
                                </button>
                            ) : null}

                            {userStakedTokens > 0 ? (
                                <>
                                    <button
                                        className="button button__warn mt-1"
                                        onClick={onUnstake}
                                    >
                                        Unstake
                                    </button>
                                </>
                            ) : null}
                        </>
                    ) : null}

                    <p className={`text-center ${styles.farms__fee}`}>
                        <small>
                            Early withdrawal fee: {poolData.early_fee_percent} %
                        </small>
                    </p>
                    {poolData.contract.length != 0 ? (
                        connectedAddress ? (
                            isAllowed || !isPoolLive ? null : (
                                <button
                                    className="button mt-1"
                                    onClick={aproveToken}
                                >
                                    Approve
                                </button>
                            )
                        ) : (
                            <button
                                className="button mt-1"
                                onClick={onConnectClick}
                            >
                                Connect
                            </button>
                        )
                    ) : null}
                </div>
            </Col>
        </Row>
    );
};
export default PoolInfo;
