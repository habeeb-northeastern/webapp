const bcrypt = require("bcrypt");
const db = require("../models");
const User = db.user;

/**
 * this function currently only checks for empty auth credentials
 *
 * @param {obj} cred
 */
function validateBasicAuth(cred) {

    if ((cred.username == undefined || cred.username == '') ||
        cred.password == undefined || cred.password == '') {

        throw new Error("Auth: username, password cannot be empty");

    }
}


async function getHash(cred) {
    // let hash = null;
    try {
        const data = await User.findAll({
            attributes: ["password"],
            where: {
                username: cred.username,
            },
        });
        if (data === undefined || data.length == 0) {
            console.log(data);
            throw new Error("Auth: Wrong Username!");
        }

        const passHash = data[0].dataValues.password;
        cred.hash = passHash;
        return cred;
    } catch (error) {
        throw error;
    }

}

/**
 * Check if supplied table is empty
 *
 * @param {*} Model Table/model
 */
async function isTableNotEmpty(Model) {
    // try {
    const data = await Model.findAll();
    if (data == undefined || data.length == 0) {
        throw new Error("The table is empty!");
    }
}

/**
 *Main function of this file for getting the header, authenticating the user and returning success/failure
 *
 * @param {*} authHeader
 * @return {*} 
 */
 module.exports = {
    authenticateCredentials: async function (authHeader) {
        //--------check for empty table first--------
        return await isTableNotEmpty(User).then(async () => {

            const cred = getCredentialsFromAuth(authHeader);
            const cred_2 = await getHash(cred);
            try {

                const result = await bcrypt
                    .compare(cred_2.password, cred_2.hash);
                console.log("isValid" + result);
                if (result === true) {
                    let resultObj = {
                        cred: cred,
                        auth: result
                    };
                    return resultObj;
                } else {
                    throw new Error("Auth: Wrong password!");
                }
            } catch (err) {
                throw err;
            }

        }).catch(err => {
            throw err;
        })

    }
}


function getCredentialsFromAuth(authHeader) {
    const b64auth = (authHeader || "").split(" ")[1] || "";
    const strauth = Buffer.from(b64auth, "base64").toString();
    const splitIndex = strauth.indexOf(":");
    const login = strauth.substring(0, splitIndex);
    const password = strauth.substring(splitIndex + 1);
    let cred = {
        username: login,
        password: password,
    };
    validateBasicAuth(cred);
    return cred;
}