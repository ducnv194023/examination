// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "./CreateExamFactory.sol";

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
        bytes32 examFactoryId;
        Question[] questions;
        Answer[] answers;
        RevealAnswer[] revealAnswers;
    }

    Exam[] public exams;

    mapping(address => Answer[]) public ownAnswers;

    CreateExamFactory private createExamFactory;

    function addQuestionExam(bytes32 _examFactoryId, bytes32[] memory _questionHashes) public {        
        Exam storage newExam = exams.push();
            newExam.examFactoryId = _examFactoryId;

        for (uint i = 0; i < _questionHashes.length; i++) {
            newExam.questions.push(Question({
                questionHash: _questionHashes[i]
            }));
        }
    }

    // function submitAnswerExam(uint _examId, bytes32[] memory _answerHashes) public {
    //     Exam storage exam = exams[_examId];

    //     uint examFactoryId = uint(exam.examFactoryId);
    //     CreateExamFactory.ExamFactory memory examfactory = createExamFactory.getExamFactory(examFactoryId);
    //     uint currentTime = block.timestamp;
    //     uint submitEndTime = uint(examfactory.submitEndTime);
    //     uint submitStartTime = uint(examfactory.submitStartTime);
    //     require(currentTime > submitEndTime, "Can not submit anymore.");
    //     require(currentTime < submitStartTime, "The exam has not started yet.");

    //     for (uint i = 0; i < _answerHashes.length; i++) {
    //         exam.answers.push(Answer({
    //             answerHash: _answerHashes[i]
    //         }));

    //         ownAnswers[msg.sender].push(Answer({
    //             answerHash: _answerHashes[i]
    //         }));
    //     }
    // }

    // function addRevealAnswer(uint _examId, string[] memory _answers) public {
    //     Exam storage exam = exams[_examId];

    //     for (uint i = 0; i < _answers.length; i++) {
    //         exam.revealAnswers.push(RevealAnswer({
    //             revealAnswer: _answers[i]
    //         }));
    //     }
    // }

    // function verifyCorrectAnswer(bytes32 answerSalt, uint _examId) view public {
    //     Answer[] memory answers = ownAnswers[msg.sender];
    //     Exam memory exam = exams[_examId];
    //     RevealAnswer[] memory revealAnswers = exam.revealAnswers;
    //     for (uint i = 0; i < revealAnswers.length; i++) {
    //         string memory revealAnswer = revealAnswers[i].revealAnswer;
    //         bytes32 hashRevealAnswer = keccak256(abi.encodePacked(revealAnswer, answerSalt));
    //         require(hashRevealAnswer == answers[i].answerHash, "Answer is not correct.");   
    //     }
    // }

    function getExam(uint _examId) public view returns (Exam memory) {
        require(_examId < exams.length, "Exam index out of bounds.");
        return exams[_examId];
    }
}