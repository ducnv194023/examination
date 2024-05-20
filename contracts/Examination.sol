// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "./ICreateExamFactory.sol";

contract Examination {
    struct Question {
        bytes32 questionHash;
    }

    struct Answer {
        bytes32 answerHash;
    }

    struct RevealAnswer {
        string revealAnswer;
    }

    struct Exam {
        uint examFactoryId;
        Question[] questions;
        Answer[] answers;
        RevealAnswer[] revealAnswers;
    }

    Exam[] public exams;

    event CreatedExam(uint indexed examId);

    mapping(address => Answer[]) public ownAnswers;

    ICreateExamFactory createExamFactory;

    constructor(address _createExamFactoryAddress) {
        createExamFactory = ICreateExamFactory(_createExamFactoryAddress);
    }

    function addQuestionExam(uint _examFactoryId, bytes32[] memory _questionHashes) public {
        Exam storage newExam = exams.push();
        newExam.examFactoryId = _examFactoryId;
        emit CreatedExam(exams.length - 1);

        for (uint i = 0; i < _questionHashes.length; i++) {
            newExam.questions.push(Question({
                questionHash: _questionHashes[i]
            }));
        }

    }

    function submitAnswerExam(uint _examId, bytes32[] memory _answerHashes) public {
        Exam storage exam = exams[_examId];

        require(exam.answers.length == 0, "You have already submitted your answers.");

        uint examFactoryId = uint(exam.examFactoryId);

        ICreateExamFactory.ExamFactory memory examFactory = createExamFactory.getExamFactory(examFactoryId);

        uint currentTime = block.timestamp;
        uint submitEndTime = uint(examFactory.submitEndTime);
        uint submitStartTime = uint(examFactory.submitStartTime);

        require(currentTime < submitEndTime, "Can not submit anymore.");
        require(submitStartTime < currentTime , "The exam has not started yet.");

        for (uint i = 0; i < _answerHashes.length; i++) {
            exam.answers.push(Answer({
                answerHash: _answerHashes[i]
            }));

            ownAnswers[msg.sender].push(Answer({
                answerHash: _answerHashes[i]
            }));
        }
    }

    function addRevealAnswer(uint _examId, string[] memory _answers) public {
        Exam storage exam = exams[_examId];

        for (uint i = 0; i < _answers.length; i++) {
            exam.revealAnswers.push(RevealAnswer({
                revealAnswer: _answers[i]
            }));
        }
    }

    function verifyCorrectAnswer(bytes32 answerSalt, uint _examId) view public {
        Answer[] memory answers = ownAnswers[msg.sender];
        Exam memory exam = exams[_examId];
        RevealAnswer[] memory revealAnswers = exam.revealAnswers;
        for (uint i = 0; i < revealAnswers.length; i++) {
            string memory revealAnswer = revealAnswers[i].revealAnswer;
            bytes32 hashRevealAnswer = keccak256(abi.encodePacked(revealAnswer, answerSalt));
            require(hashRevealAnswer == answers[i].answerHash, "Answer is not correct.");   
        }
    }

    function getExam(uint _examId) public view returns (Exam memory) {
        require(_examId < exams.length, "Exam index out of bounds.");
        return exams[_examId];
    }
}