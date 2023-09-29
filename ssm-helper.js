const {
    SSMClient,
    GetParametersCommand,
    GetParametersByPathCommand
} = require("@aws-sdk/client-ssm");

const getParameters = async (ssmPath, getChildren, decryption, region) => {
    const client = new SSMClient({
        region: region
    });
    let promise;

    if (getChildren) {
        const subProcess = require('child_process');
        promise = new Promise((resolve, reject) => {
            subProcess.exec(
                `aws ssm get-parameters-by-path --path ${ssmPath} ${decryption ? '--decryption': ''}`,
                (err, stdout, stderr) => {
                    if (err) {
                        reject(err);
                        process.exit(1);
                    } else {
                        let params = {
                            Parameters: []
                        };
                        try {
                            params = JSON.parse(stdout.toString());
                        } catch (error) {
                            reject(error);
                            process.exit(1);
                        }
                        resolve(params);
                    }
                }
            );
        });
    } else {
        const input = { // GetParametersRequest
            Names: [ // ParameterNameList // required
                ssmPath,
            ],
            WithDecryption: decryption
        };
        const command = new GetParametersCommand(input);
        promise = client.send(command);
    }
    const response = await promise;
    return response.Parameters;
}

module.exports = {
    getParameters
};
