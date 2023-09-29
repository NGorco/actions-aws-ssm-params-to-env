const { SSMClient, GetParametersCommand, GetParametersByPathCommand } = require("@aws-sdk/client-ssm");

const getParameters = async (ssmPath, getChildren, decryption, region) => {
    const client = new SSMClient({ region: region });
    let promise;
    
    const subProcess = require('child_process')
    subProcess.exec('aws ssm get-parameters-by-path --path /env/test-be', (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        process.exit(1)
      } else {
        console.log(`The stdout Buffer from shell: ${stdout.toString()}`)
        console.log(`The stderr Buffer from shell: ${stderr.toString()}`)
      }
    });

    if (getChildren) {
        const input = { // GetParametersByPathRequest
            Path: ssmPath,
            WithDecryption: decryption
        };
        const command = new GetParametersByPathCommand(input);
        promise = client.send(command);
    }
    else {
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

module.exports = { getParameters };
