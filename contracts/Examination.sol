// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.24;

contract Examination {
    struct Exam {
        string examArweaveIdHash;
        bytes32[] hashQuestions;
        bytes32[] hashAnswers;
        string[] revealAnswers;
        uint score;
    }

    Exam[] public exams;

    mapping(address => uint[]) public ownerExams;

    event ExamCreated(uint examId);
    event PassedExam(address indexed answerer, uint examId);

    function createExam(string memory _examArweaveIdHash) public {
        Exam storage newExam = exams.push();

        newExam.examArweaveIdHash = _examArweaveIdHash;

        emit ExamCreated(exams.length - 1);
    }

    function submitQuestion(bytes32[] memory _hashQuestions, uint _examId) public {
        exams[_examId].hashQuestions = _hashQuestions;
    }


    function submitAnswer(bytes32[] memory _hashAnswers, uint _examId) public {
        exams[_examId].hashQuestions = _hashAnswers;
        ownerExams[msg.sender].push(_examId);
    }

    function revealAnswer(string[] memory _revealAnswers,string[] memory _questions, string memory questionSalt, uint _examId) public {
        for (uint i = 0; i < _questions.length; i++) {
            require(keccak256(abi.encodePacked(_questions[i], questionSalt)) == exams[_examId].hashQuestions[i], "You are not allowed to reveal the answer for this question.");
        }

        exams[_examId].revealAnswers = _revealAnswers;
    }

    function isOwnerExam(address _onwer, uint _examId) view public returns (bool) {
        uint[] memory answers = ownerExams[_onwer];
        for (uint i = 0; i < answers.length; i++) {
            if (answers[i] == _examId) {
                return true;
            }
        }

        return false;
    }

    function verifyCorrectAnswer(string memory answerSalt, uint _examId, uint targetScore) public {
        Exam memory exam = exams[_examId];
        uint correctAnswers = 0;
        require(isOwnerExam(msg.sender, _examId), "You are not allowed to reveal the answer for this question.");
        for (uint i = 0; i < exam.hashAnswers.length; i++) {
            if(keccak256(abi.encodePacked(exam.revealAnswers[i], answerSalt)) == exam.hashAnswers[i]) {
                correctAnswers++;
            }
        }

        exam.score = correctAnswers;

        if (exam.score >= targetScore) {
            emit PassedExam(msg.sender, _examId);
        }
    }
}
