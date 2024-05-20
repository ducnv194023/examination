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
                '0xd9525faee46eb7e9487c3776ffd4cf96d0123d8eb14403fde3fabc4ddaa217bc',
                '0x9f223518b9b4dd743458fb7b15843da89cd2898210dc10ba292a43e8ff01956f',
                '0x9e2556b52adf762caafc9ed5ab2576b20fa42fe7085c9c25f36b8849bda673a0',
                '0xd5602de74af006a8d4aa2bfd1fea113e2db70860b369732f5f14eb438076cb9d',
                '0x433660e7b20bc0521f797ad4906abae66add18cd21ffb37daca955bf3336692c'
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
                '0xd9525faee46eb7e9487c3776ffd4cf96d0123d8eb14403fde3fabc4ddaa217bc',
                '0x9f223518b9b4dd743458fb7b15843da89cd2898210dc10ba292a43e8ff01956f',
                '0x9e2556b52adf762caafc9ed5ab2576b20fa42fe7085c9c25f36b8849bda673a0',
                '0xd5602de74af006a8d4aa2bfd1fea113e2db70860b369732f5f14eb438076cb9d',
                '0x433660e7b20bc0521f797ad4906abae66add18cd21ffb37daca955bf3336692c'
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
                '0xd9525faee46eb7e9487c3776ffd4cf96d0123d8eb14403fde3fabc4ddaa217bc',
                '0x9f223518b9b4dd743458fb7b15843da89cd2898210dc10ba292a43e8ff01956f',
                '0x9e2556b52adf762caafc9ed5ab2576b20fa42fe7085c9c25f36b8849bda673a0',
                '0xd5602de74af006a8d4aa2bfd1fea113e2db70860b369732f5f14eb438076cb9d',
                '0x433660e7b20bc0521f797ad4906abae66add18cd21ffb37daca955bf3336692c'
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
                '0xd9525faee46eb7e9487c3776ffd4cf96d0123d8eb14403fde3fabc4ddaa217bc',
                '0x9f223518b9b4dd743458fb7b15843da89cd2898210dc10ba292a43e8ff01956f',
                '0x9e2556b52adf762caafc9ed5ab2576b20fa42fe7085c9c25f36b8849bda673a0',
                '0xd5602de74af006a8d4aa2bfd1fea113e2db70860b369732f5f14eb438076cb9d',
                '0x433660e7b20bc0521f797ad4906abae66add18cd21ffb37daca955bf3336692c'
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
                'Paris',
                '4',
                'JavaScript',
                '1912',
                'Leonardo da Vinci'
            ]

            await examination.addRevealAnswer(0, answer);
        });
    });

    describe("#verifyCorrectAnswer()", function () {
        it("Should verify correct answer", async function() {
            const { examination, submitStartTime } = await loadFixture(development);

            const answerHashes = [
                '0xd9525faee46eb7e9487c3776ffd4cf96d0123d8eb14403fde3fabc4ddaa217bc',
                '0x9f223518b9b4dd743458fb7b15843da89cd2898210dc10ba292a43e8ff01956f',
                '0x9e2556b52adf762caafc9ed5ab2576b20fa42fe7085c9c25f36b8849bda673a0',
                '0xd5602de74af006a8d4aa2bfd1fea113e2db70860b369732f5f14eb438076cb9d',
                '0x433660e7b20bc0521f797ad4906abae66add18cd21ffb37daca955bf3336692c'
            ]

            await time.increaseTo(submitStartTime);
            await examination.submitAnswerExam(0, answerHashes)

            const answerSalt = "acce6f1371330a0d29fa5fe62f351351";
            await examination.verifyCorrectAnswer(answerSalt, 0);
        });

        it("Should revert if answer is not correct", async function() {
            const { examination, submitStartTime } = await loadFixture(development);

            const answerHashes = [
                '0xd9525faee46eb7e9487c3776ffd4cf96d0123d8eb14403fde3fabc4ddaa217bc',
                '0x9f223518b9b4dd743458fb7b15843da89cd2898210dc10ba292a43e8ff01956f',
                '0x9e2556b52adf762caafc9ed5ab2576b20fa42fe7085c9c25f36b8849bda673a0',
                '0xd5602de74af006a8d4aa2bfd1fea113e2db70860b369732f5f14eb438076cb9d',
                '0x433660e7b20bc0521f797ad4906abae66add18cd21ffb37daca955bf3336692c'
            ]

            await time.increaseTo(submitStartTime);
            await examination.submitAnswerExam(0, answerHashes)

            const answer = [
                'Paris',
                '4',
                'JavaScript',
                '1912',
                'Leonardo da Vinci'
            ]

            await examination.addRevealAnswer(0, answer);

            const answerSalt = "acce6f1371330a0d29fa5fe62f351352";
            await expect(examination.verifyCorrectAnswer(answerSalt, 0))
            .to
            .be
            .revertedWith('Answer is not correct.');
        });
    });
});