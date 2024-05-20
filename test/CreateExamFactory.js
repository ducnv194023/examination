const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
//   const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("CreateExamFactory", function () {
    async function deployment() {
        const CreateExamFactory = await ethers.getContractFactory("CreateExamFactory");
        const examFactory = await CreateExamFactory.deploy();

        return { examFactory };
    }

    describe("#createExamFactory()", function () {
        describe("Validations", function () {
            it("Should revert with the right error if submitStartTime is bigger than submitEndTime", async function () {
            const { examFactory } = await loadFixture(deployment);

            const submitStartTime = await time.latest();
            const submitEndTime = submitStartTime - 3600;

            await expect(examFactory.createExamFactory("Exam title", "Exam description", submitStartTime, submitEndTime)).to.be.revertedWith(
            "Submit start time must be before submit end time."
            );
        });

        it("Should revert with the right error if submitStartTime is smaller than current time", async function () {
            const { examFactory } = await loadFixture(deployment);
                
            await time.latest();
            const submitStartTime = await time.latest()-7200;
            const submitEndTime = submitStartTime + 3600;
            await expect(examFactory.createExamFactory("Exam title", "Exam description", submitStartTime, submitEndTime)).to.be.revertedWith(
                "Submit start time must be in the future."
            );
            });
        });

        describe("Deployment", function () {
            it("Should create an exam factory", async function () {
            const { examFactory } = await loadFixture(deployment);
                
            await time.latest();
            const submitStartTime = await time.latest()+3600;
            const submitEndTime = submitStartTime + 3600;

            await examFactory.createExamFactory("Exam title", "Exam description", submitStartTime, submitEndTime);

            const actualExamFactory = await examFactory.getExamFactory(0);

            expect(actualExamFactory.title).to.equal("Exam title");
            expect(actualExamFactory.description).to.equal("Exam description");
            expect(actualExamFactory.submitStartTime).to.equal(submitStartTime);
            expect(actualExamFactory.submitEndTime).to.equal(submitEndTime);
            });
        });

        describe("Events", function () {
            it("Should emit an event on creating exam factory", async function () {
            const { examFactory } = await loadFixture(deployment);

            await time.latest();
            const submitStartTime = await time.latest()+3600;
            const submitEndTime = submitStartTime + 3600;

            await examFactory.createExamFactory("Exam title", "Exam description", submitStartTime, submitEndTime);

            await expect(examFactory.createExamFactory("Exam title", "Exam description", submitStartTime, submitEndTime))
                .to.emit(examFactory, "CreatedExamFactory")
                .withArgs(1);
            });
        });
    });
});