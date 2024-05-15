const hre = require('hardhat')

async function main() {
    const ce = await hre.ethers.deployContract("CreateExam");
    await ce.waitForDeployment()
    console.log(ce)

    console.log("Quiz deployed to:", ce.target);
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});