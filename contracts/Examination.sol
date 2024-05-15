// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

import "./CreateExamFactory.sol";

contract Examination {
    struct Question {
        uint questionHash;
    }

    struct Answer {
        uint answerHash;
    }

    struct Exam {
        uint examFactoryId;
        Question[] questions;
        Answer[] answers;
    }

    Exam[] public exams;

    CreateExamFactory private createExamFactory;

    function addQuestionExam(uint _examFactoryId, uint[] memory _questionHashes) public {
        createExamFactory.getExamFactory(_examFactoryId);

        Exam memory newExam = Exam({
            examFactoryId: _examFactoryId,
            questions: new Question[](_questionHashes.length),
            answers: new Answer[](_questionHashes.length)
        });

        // Populate the questions array
        for (uint i = 0; i < _questionHashes.length; i++) {
            newExam.questions[i] = Question({
                questionHash: _questionHashes[i]
            });
        }

        exams.push(newExam);
    }

    function addAnswerExam(uint _examFactoryId, uint[] memory _answerHashes) public {
        createExamFactory.getExamFactory(_examFactoryId);

        Exam storage exam = exams[_examFactoryId];

        for (uint i = 0; i < _answerHashes.length; i++) {
            exam.answers.push(Answer({
                answerHash: _answerHashes[i]
            }));
        }
    }

    function getExam(uint _examId) public view returns (Exam memory) {
        require(_examId < exams.length, "Exam index out of bounds.");
        return exams[_examId];
    }
}