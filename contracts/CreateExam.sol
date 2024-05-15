// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

contract CreateExam {
    struct Exam {
        string title;
        string description;
        uint submitStartTime;
        uint submitEndTime;
    }

    Exam[] public exams;

    function createExam(string memory _title, string memory _description, uint _submitStartTime, uint _submitEndTime) public {
      require(_submitStartTime < _submitEndTime, "Submit start time must be before submit end time.");
      
      exams.push(Exam({
        title: _title,
        description: _description,
        submitStartTime: _submitStartTime,
        submitEndTime: _submitEndTime
      }));
    }

    function getTest(uint _index) public view returns (Exam memory) {
        require(_index < exams.length, "Test index out of bounds.");
        return exams[_index];
    }
}