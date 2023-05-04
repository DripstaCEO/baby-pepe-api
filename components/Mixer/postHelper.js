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
export default postHelper;
