import Footer from "./Footer";

import NodeWalletConnect from "@walletconnect/node";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";

const walletConnector = new NodeWalletConnect(
    {
        bridge: "https://bridge.walletconnect.org", // Required
    },
    {
        clientMeta: {
            description: "WalletConnect for BabyPepe",
            url: process.env.URL,
            name: "Ninja Lounge",
        },
    }
);

const Layout = ({ children }) => {
    return (
        <>
            <main>
                {children}
                {/* <Footer /> */}
            </main>
        </>
    );
};

export default Layout;
