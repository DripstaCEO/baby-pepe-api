import API_HELPER from "../../lib/apiHelper";

export default async function handler(req, res) {
    if (req.method != "POST") {
        res.status(200).json({
            success: false,
            message: "Method not allowed",
        });

        return false;
    }

    let inputs = req.body;

    let form_inputs = ["recipient", "tracking"];

    for (let i = 0; i < form_inputs.length; i++) {
        let k = form_inputs[i];

        if (typeof inputs[k] == "undefined" || !inputs[k]) {
            inputs[k] = "";
        }
    }

    API_HELPER.post("tracking", {
        recipient: inputs["recipient"],
        tracking: inputs["tracking"],
    })
        .then((response) => {
            if (response.error) {
                res.status(200).json({
                    success: false,
                    message: response.message,
                });
                return false;
            }

            if (!response.content) {
                res.status(200).json({
                    success: false,
                    message: "API error!",
                });
                return false;
            }

            res.status(200).json({
                success: true,
                message: response,
            });
        })
        .catch((error) => {
            res.status(200).json({
                success: false,
                message: error,
            });
            return false;
        });
}
