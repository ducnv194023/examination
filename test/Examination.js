const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
//   const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Examination", function () {
    async function development() {
        const CreateExamFactory = await ethers.getContractFactory("CreateExamFactory");
        const examFactory = await CreateExamFactory.deploy();

        const submitStartTime = await time.latest() + 3600;
        const submitEndTime = submitStartTime + 3600;

        await examFactory.createExamFactory('Exam 1', 'Description 1', submitStartTime, submitEndTime);

        const Examination = await ethers.getContractFactory("Examination");
        const examination = await Examination.deploy(examFactory.target);

        const questionHashes = [
            '0x115049a298532be2f181edb03f766770c0db84c22aff39003fec340deaec7545',
            '0x52cb6b5e4a038af1756708f98afb718a08c75b87b2f03dbee4dd9c8139c15c5e',
            '0x88ada72417cc396de87c283ebeb22f3bf014e99cbf4cb8da3009199d2df0dd56',
            '0xee36f2b3049f5ff882ac6d3e6e266c14609919f7a764c21ada69d49dc64a32e6',
            '0x0ef0cdb6d8f4d581689f91426eb0bf6a3fd16416498eaca2d1aca519b5086947'
        ]

        const addQuestionExam = await examination.addQuestionExam(0,questionHashes);

        const exam = await examination.getExam(0);

        return { examination, exam, addQuestionExam, submitStartTime, submitEndTime };
    }

    describe("#addQuestionExam()", function () {
        it("Should create new exam with questions", async function() {
            const { exam } = await loadFixture(development);

            expect(exam.questions.length).to.equal(5);
        });

        it("Should emit event", async function() {
            const { examination, addQuestionExam } = await loadFixture(development);

            await expect(addQuestionExam)
            .to.emit(examination, 'CreatedExam')
            .withArgs(0);
        });
    })

    describe("#submitAnswerExam()", function () {
        it("Should submit answer", async function() {
            const { examination, submitStartTime } = await loadFixture(development);
            
            const answerHashes = [
                '0x5dd272b4f316b776a7b8e3d0894b37e1e42be3d5d3b204b8a5836cc50597a6b1',
                '0x4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
                '0xb27ad06d123c6145fba7e9217a4cfbf2488b4743810ed8c8ff14ad01a5bbe515',
                '0xa991b89eed28e85e1a7238873f922290111049668c680a68ee15201a611219b3',
                '0x30f70a6297be831648a8b24d97de3d4bac57aa5b1c22a780cd8dbf68da9966db'
            ]

            await time.increaseTo(submitStartTime);
            await examination.submitAnswerExam(0, answerHashes)

            const exam = await examination.getExam(0);

            expect(exam.answers.length).to.equal(5);
            expect(exam.questions.length).to.equal(5);
        });

        it("Should revert if already submitted", async function() {
            const { examination, submitStartTime } = await loadFixture(development);
            
            const answerHashes = [
                '0x5dd272b4f316b776a7b8e3d0894b37e1e42be3d5d3b204b8a5836cc50597a6b1',
                '0x4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
                '0xb27ad06d123c6145fba7e9217a4cfbf2488b4743810ed8c8ff14ad01a5bbe515',
                '0xa991b89eed28e85e1a7238873f922290111049668c680a68ee15201a611219b3',
                '0x30f70a6297be831648a8b24d97de3d4bac57aa5b1c22a780cd8dbf68da9966db'
            ]

            await time.increaseTo(submitStartTime);
            await examination.submitAnswerExam(0, answerHashes)

            await expect(examination.submitAnswerExam(0,answerHashes))
            .to
            .be
            .revertedWith('You have already submitted your answers.');
        });

        it("Should revert if can not submit anymore", async function() {
            const { examination, submitStartTime } = await loadFixture(development);
            
            const answerHashes = [
                '0x5dd272b4f316b776a7b8e3d0894b37e1e42be3d5d3b204b8a5836cc50597a6b1',
                '0x4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
                '0xb27ad06d123c6145fba7e9217a4cfbf2488b4743810ed8c8ff14ad01a5bbe515',
                '0xa991b89eed28e85e1a7238873f922290111049668c680a68ee15201a611219b3',
                '0x30f70a6297be831648a8b24d97de3d4bac57aa5b1c22a780cd8dbf68da9966db'
            ]

            await time.increaseTo(submitStartTime+7300);

            await expect(examination.submitAnswerExam(0,answerHashes))
            .to
            .be
            .revertedWith('Can not submit anymore.');
        });

        it("Should revert if can not submit anymore", async function() {
            const { examination, submitStartTime } = await loadFixture(development);

            const answerHashes = [
                '0x5dd272b4f316b776a7b8e3d0894b37e1e42be3d5d3b204b8a5836cc50597a6b1',
                '0x4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
                '0xb27ad06d123c6145fba7e9217a4cfbf2488b4743810ed8c8ff14ad01a5bbe515',
                '0xa991b89eed28e85e1a7238873f922290111049668c680a68ee15201a611219b3',
                '0x30f70a6297be831648a8b24d97de3d4bac57aa5b1c22a780cd8dbf68da9966db'
            ]

            await time.increaseTo(submitStartTime-1000);

            await expect(examination.submitAnswerExam(0,answerHashes))
            .to
            .be
            .revertedWith('The exam has not started yet.');
        });
    });

    describe("#addRevealAnswer()", function () {
        it("Should add reveal answer", async function() {
            const { examination } = await loadFixture(development);

            const answer = [
                'a',
                'b',
                'c',
                'd',
                'e'
            ]

            await examination.addRevealAnswer(0, answer);
        });
    });
});