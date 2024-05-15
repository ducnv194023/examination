const hre = require('hardhat')

async function main() {
    const CreateExam = await hre.ethers.getContractFactory("CreateExam");
    const createExam = await CreateExam.deploy();

    console.log("Quiz deployed to:", createExam.address);
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});