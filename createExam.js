const hre = require('hardhat')

main = async () => {
    const test = await hre.ethers.getContractAt("CreateExam", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
    await test.createExam("Test Title", "description", 1651369200, 1652369200)
    const result = await test.getTest(0)
    console.log(result)
}

main()
