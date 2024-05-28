const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { expect } = require("chai");

describe("Examination", function () {
    async function deploymentExamination() {
        const [owner] = await ethers.getSigners();
        const Examination = await ethers.getContractFactory("Examination");
        const examination = await Examination.deploy();

        const examArweaveIdHash = "examArweaveIdHash";

        await examination.createExam(examArweaveIdHash);

        return { examination, examArweaveIdHash, owner };
    }

    describe("#createExam()", function() {
        it("Should create a new exam", async function() {
            const { examination, examArweaveIdHash } = await loadFixture(deploymentExamination);

            const actual = await examination.exams(0);

            expect(actual.examArweaveIdHash)
            .to
            .equal(examArweaveIdHash);
        });

        it("Should emit event when created a new exam", async function() {
            const { examination, examArweaveIdHash } = await loadFixture(deploymentExamination);


            await expect(examination.createExam(examArweaveIdHash))
            .to
            .emit(examination, "ExamCreated")
            .withArgs(1);
        });
    });

    describe("#submitQuestion()", function() {
        it("Should submit questions", async function() {
            const { examination } = await loadFixture(deploymentExamination);

            const hashQuestions = [
                "0xc860043b510bc5af22c43c0672895b2d759169baf2e113a4a59a6309c2274cbe",
                "0x0419acb2248c60d3dc65310b4f1da823bf6c5c9a9ab8787dca7f6e5e94fe4314",
                "0x2017c67855b75b31dbb6f0c86d887f54b87b12bd9911c598aa40f535cf4c36a0",
                "0x52599a5fb48012c656f81174a31d9c77f444365254ddc4552693350daa4812b2",
                "0x4feba7169a88ca80227571db83b401753e02d2c947ef74bcc8e72665bc9949e0"
            ]

            await examination.submitQuestion(hashQuestions, 0);

            const actual = await examination.getExam(0);

            expect(actual.hashQuestions.length)
            .to
            .equal(5);   
        });
    });

    describe("#submitAnswer()", function() {
        it("Should submit answers", async function() {
            const { examination, owner } = await loadFixture(deploymentExamination);

            const hashAnswers = [
                "0xc92e10633b981e06689dfcbfdbb8459e69a71e67d3be1221ab00db7cbf08be4b",
                "0xb53328dd12001139298b00e68691b21fa1dde0632e9546540d677e0b7e17c8c4",
                "0x70a792bba1d5d63c72ff5e449dc9003f0d15b058f0c4a591c91b702cbe4db1c1",
                "0x324db05ba159fad96aac101e7274ade09d08f8dddb0b3154e23aa324cecb026a",
                "0x164de273f82f6e5d73bf6ed2898bfbfe013ec3ec805600639031e50661911970"
            ]

            await examination.submitAnswer(hashAnswers, 0);

            const actualExam = await examination.getExam(0);
            const actualUserExam= await examination.getUserExam(owner.address);

            expect(actualExam.hashAnswers.length)
            .to
            .equal(5);
            expect(actualUserExam[0])
            .to
            .equal(0);
        });
    });

    describe("#revealAnswer()", function() {
        it("Should reveal answers", async function() {
            const { examination } = await loadFixture(deploymentExamination);

            const hashQuestions = [
                "0xc860043b510bc5af22c43c0672895b2d759169baf2e113a4a59a6309c2274cbe",
                "0x0419acb2248c60d3dc65310b4f1da823bf6c5c9a9ab8787dca7f6e5e94fe4314",
                "0x2017c67855b75b31dbb6f0c86d887f54b87b12bd9911c598aa40f535cf4c36a0",
                "0x52599a5fb48012c656f81174a31d9c77f444365254ddc4552693350daa4812b2",
                "0x4feba7169a88ca80227571db83b401753e02d2c947ef74bcc8e72665bc9949e0"
            ]

            // submit question
            await examination.submitQuestion(hashQuestions, 0);

            const revealAnswers = [
                "Paris",
                "4",
                "Javascript",
                "1912",
                "Leonardo da Vinci"
            ]

            const questionSalt = "a542faccdfeb08b056ca97452d3bce6d"
            
            const questions = [
                "What is the capital of France?",
                "What is 2+2?",
                "Name a programming language.",
                "What year did the Titanic sink?",
                "Who painted the Mona Lisa?"
            ]

            // reveal answer
            await examination.revealAnswer(revealAnswers,questions,questionSalt, 0);

            const actualExam = await examination.getExam(0);

            expect(actualExam.revealAnswers.length)
            .to
            .equal(5);
        });

        it("Should revert if question is changed", async function() {
            const { examination } = await loadFixture(deploymentExamination);

            const hashQuestions = [
                "0x9999999999999999999999999999999999999999999999999999999999999999",
                "0x1111111111111111111111111111111111111111111111111111111111111111",
                "0x2222222222222222222222222222222222222222222222222222222222222222",
                "0x3333333333333333333333333333333333333333333333333333333333333333",
                "0x4444444444444444444444444444444444444444444444444444444444444444"
            ]

            // submit question
            await examination.submitQuestion(hashQuestions, 0);

            const revealAnswers = [
                "Paris",
                "4",
                "Javascript",
                "1912",
                "Leonardo da Vinci"
            ]

            const questionSalt = "a542faccdfeb08b056ca97452d3bce6d"
            
            const questions = [
                "What is the capital of France?",
                "What is 2+2?",
                "Name a programming language.",
                "What year did the Titanic sink?",
                "Who painted the Mona Lisa?"
            ]

            // reveal answer
            await expect(examination.revealAnswer(revealAnswers,questions,questionSalt, 0))
            .to
            .be
            .revertedWith("You are not allowed to reveal the answer for this question.");
        });
    })

    describe("#isOwnerExam()", function() {
        it("Should return true if the user is the owner of the exam", async function() {
            const { examination, owner } = await loadFixture(deploymentExamination);

            const hashAnswers = [
                "0xc92e10633b981e06689dfcbfdbb8459e69a71e67d3be1221ab00db7cbf08be4b",
                "0xb53328dd12001139298b00e68691b21fa1dde0632e9546540d677e0b7e17c8c4",
                "0x70a792bba1d5d63c72ff5e449dc9003f0d15b058f0c4a591c91b702cbe4db1c1",
                "0x324db05ba159fad96aac101e7274ade09d08f8dddb0b3154e23aa324cecb026a",
                "0x164de273f82f6e5d73bf6ed2898bfbfe013ec3ec805600639031e50661911970"
            ]

            // submit answer
            await examination.submitAnswer(hashAnswers, 0);

            expect(await examination.isOwnerExam(owner.address, 0))
                .to
                .be
                .true;
        });

        it("Should return false if the user is not the owner of the exam", async function() {
            const { examination, owner } = await loadFixture(deploymentExamination);
            
            const hashAnswers = [
                "0xc92e10633b981e06689dfcbfdbb8459e69a71e67d3be1221ab00db7cbf08be4b",
                "0xb53328dd12001139298b00e68691b21fa1dde0632e9546540d677e0b7e17c8c4",
                "0x70a792bba1d5d63c72ff5e449dc9003f0d15b058f0c4a591c91b702cbe4db1c1",
                "0x324db05ba159fad96aac101e7274ade09d08f8dddb0b3154e23aa324cecb026a",
                "0x164de273f82f6e5d73bf6ed2898bfbfe013ec3ec805600639031e50661911970"
            ]

            // submit answer
            await examination.submitAnswer(hashAnswers, 0);

            expect(await examination.isOwnerExam(owner.address, 1))
                .to
                .be
                .false;
        });
    });

    describe("#verifyCorrectAnswer()", function() {
        it("Should pass exam if score is smaller than target score", async function() {
            const { examination } = await loadFixture(deploymentExamination);

            const hashAnswers = [
                "0x6c35a3dd22c3de59e750e7379ebbd4b17f11b4ee4066f4dd25d1f7b2c11743c5",
                "0xb20953ec6dde7237405283ccb46b3c826b9796cb35a6ef292e0496967c20631f",
                "0x32b8758393701b7d5a5c20ef1214191b1a1bc0d5359fac9aa17da88748a136e0",
                "0xc8afa40856140e08b9f91b5513b6f22e76b8bbf6de614f43dbef4b92e3731451",
                "0x51da075f69d2b26c09a2303fb443aa760ad1563dca2c702aeb66e262ada3650d"
            ]

            // submit answer
            await examination.submitAnswer(hashAnswers, 0);

            const hashQuestions = [
                "0xc860043b510bc5af22c43c0672895b2d759169baf2e113a4a59a6309c2274cbe",
                "0x0419acb2248c60d3dc65310b4f1da823bf6c5c9a9ab8787dca7f6e5e94fe4314",
                "0x2017c67855b75b31dbb6f0c86d887f54b87b12bd9911c598aa40f535cf4c36a0",
                "0x52599a5fb48012c656f81174a31d9c77f444365254ddc4552693350daa4812b2",
                "0x4feba7169a88ca80227571db83b401753e02d2c947ef74bcc8e72665bc9949e0"
            ]

            // submit question
            await examination.submitQuestion(hashQuestions, 0);

            const revealAnswers = [
                "Paris",
                "4",
                "Javascript",
                "1912",
                "Leonardo da Vinci"
            ]

            const questionSalt = "a542faccdfeb08b056ca97452d3bce6d"
            
            const questions = [
                "What is the capital of France?",
                "What is 2+2?",
                "Name a programming language.",
                "What year did the Titanic sink?",
                "Who painted the Mona Lisa?"
            ]

            // reveal answer
            await examination.revealAnswer(revealAnswers,questions,questionSalt, 0);
            const answerSalt = "73955cc154c818e3df843cd7e4ea1948"

            await examination.verifyCorrectAnswer(answerSalt,0, 4)

            const actualExam = await examination.getExam(0);

            expect(actualExam.score)
            .to
            .be
            .above(4);
        });

        it("Should fail exam if score is bigger than target score", async function() {
            const { examination } = await loadFixture(deploymentExamination);

            const hashAnswers = [
                "0x6c35a3dd22c3de59e750e7379ebbd4b17f11b4ee4066f4dd25d1f7b2c11743c5",
                "0xb20953ec6dde7237405283ccb46b3c826b9796cb35a6ef292e0496967c20631f",
                "0x32b8758393701b7d5a5c20ef1214191b1a1bc0d5359fac9aa17da88748a136e0",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000000000000000000000000000"
            ]

            // submit answer
            await examination.submitAnswer(hashAnswers, 0);

            const hashQuestions = [
                "0xc860043b510bc5af22c43c0672895b2d759169baf2e113a4a59a6309c2274cbe",
                "0x0419acb2248c60d3dc65310b4f1da823bf6c5c9a9ab8787dca7f6e5e94fe4314",
                "0x2017c67855b75b31dbb6f0c86d887f54b87b12bd9911c598aa40f535cf4c36a0",
                "0x52599a5fb48012c656f81174a31d9c77f444365254ddc4552693350daa4812b2",
                "0x4feba7169a88ca80227571db83b401753e02d2c947ef74bcc8e72665bc9949e0"
            ]

            // submit question
            await examination.submitQuestion(hashQuestions, 0);

            const revealAnswers = [
                "Paris",
                "4",
                "Javascript",
                "1912",
                "Leonardo da Vinci"
            ]

            const questionSalt = "a542faccdfeb08b056ca97452d3bce6d"
            
            const questions = [
                "What is the capital of France?",
                "What is 2+2?",
                "Name a programming language.",
                "What year did the Titanic sink?",
                "Who painted the Mona Lisa?"
            ]

            // reveal answer
            await examination.revealAnswer(revealAnswers,questions,questionSalt, 0);
            const answerSalt = "73955cc154c818e3df843cd7e4ea1948"

            await examination.verifyCorrectAnswer(answerSalt,0, 4)

            const actualExam = await examination.getExam(0);

            expect(actualExam.score)
            .to
            .be
            .below(4);
        });

        it("Should reject if the user is not the owner of the exam", async function() {
            const { examination } = await loadFixture(deploymentExamination);

            const hashAnswers = [
                "0x6c35a3dd22c3de59e750e7379ebbd4b17f11b4ee4066f4dd25d1f7b2c11743c5",
                "0xb20953ec6dde7237405283ccb46b3c826b9796cb35a6ef292e0496967c20631f",
                "0x32b8758393701b7d5a5c20ef1214191b1a1bc0d5359fac9aa17da88748a136e0",
                "0xc8afa40856140e08b9f91b5513b6f22e76b8bbf6de614f43dbef4b92e3731451",
                "0x51da075f69d2b26c09a2303fb443aa760ad1563dca2c702aeb66e262ada3650d"
            ]

            // submit answer
            await examination.submitAnswer(hashAnswers, 0);

            const hashQuestions = [
                "0xc860043b510bc5af22c43c0672895b2d759169baf2e113a4a59a6309c2274cbe",
                "0x0419acb2248c60d3dc65310b4f1da823bf6c5c9a9ab8787dca7f6e5e94fe4314",
                "0x2017c67855b75b31dbb6f0c86d887f54b87b12bd9911c598aa40f535cf4c36a0",
                "0x52599a5fb48012c656f81174a31d9c77f444365254ddc4552693350daa4812b2",
                "0x4feba7169a88ca80227571db83b401753e02d2c947ef74bcc8e72665bc9949e0"
            ]

            // submit question
            await examination.submitQuestion(hashQuestions, 0);

            const revealAnswers = [
                "Paris",
                "4",
                "Javascript",
                "1912",
                "Leonardo da Vinci"
            ]

            const questionSalt = "a542faccdfeb08b056ca97452d3bce6d"
            
            const questions = [
                "What is the capital of France?",
                "What is 2+2?",
                "Name a programming language.",
                "What year did the Titanic sink?",
                "Who painted the Mona Lisa?"
            ]

            // reveal answer
            await examination.revealAnswer(revealAnswers,questions,questionSalt, 0);
            const answerSalt = "73955cc154c818e3df843cd7e4ea1948"

            await expect(examination.verifyCorrectAnswer(answerSalt, 1, 4))
            .to
            .be
            .revertedWith("You are not allowed to verify the answer for this question.");
        });

        it("Should emit the event when the exam is passed", async function() {
            const { examination } = await loadFixture(deploymentExamination);

            const hashAnswers = [
                "0x6c35a3dd22c3de59e750e7379ebbd4b17f11b4ee4066f4dd25d1f7b2c11743c5",
                "0xb20953ec6dde7237405283ccb46b3c826b9796cb35a6ef292e0496967c20631f",
                "0x32b8758393701b7d5a5c20ef1214191b1a1bc0d5359fac9aa17da88748a136e0",
                "0xc8afa40856140e08b9f91b5513b6f22e76b8bbf6de614f43dbef4b92e3731451",
                "0x51da075f69d2b26c09a2303fb443aa760ad1563dca2c702aeb66e262ada3650d"
            ]

            // submit answer
            await examination.submitAnswer(hashAnswers, 0);

            const hashQuestions = [
                "0xc860043b510bc5af22c43c0672895b2d759169baf2e113a4a59a6309c2274cbe",
                "0x0419acb2248c60d3dc65310b4f1da823bf6c5c9a9ab8787dca7f6e5e94fe4314",
                "0x2017c67855b75b31dbb6f0c86d887f54b87b12bd9911c598aa40f535cf4c36a0",
                "0x52599a5fb48012c656f81174a31d9c77f444365254ddc4552693350daa4812b2",
                "0x4feba7169a88ca80227571db83b401753e02d2c947ef74bcc8e72665bc9949e0"
            ]

            // submit question
            await examination.submitQuestion(hashQuestions, 0);

            const revealAnswers = [
                "Paris",
                "4",
                "Javascript",
                "1912",
                "Leonardo da Vinci"
            ]

            const questionSalt = "a542faccdfeb08b056ca97452d3bce6d"
            
            const questions = [
                "What is the capital of France?",
                "What is 2+2?",
                "Name a programming language.",
                "What year did the Titanic sink?",
                "Who painted the Mona Lisa?"
            ]

            // reveal answer
            await examination.revealAnswer(revealAnswers,questions,questionSalt, 0);
            const answerSalt = "73955cc154c818e3df843cd7e4ea1948"

            await expect(examination.verifyCorrectAnswer(answerSalt,0, 4))
            .to
            .emit(examination, "PassedExam");
        });
    });
});