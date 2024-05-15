// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

contract CreateExamFactory {
    struct ExamFactory {
        string title;
        string description;
        uint submitStartTime;
        uint submitEndTime;
    }

    ExamFactory[] public examFactories;

    function createExamFactory(string memory _title, string memory _description, uint _submitStartTime, uint _submitEndTime) public {
      require(_submitStartTime < _submitEndTime, "Submit start time must be before submit end time.");
      
      examFactories.push(ExamFactory({
        title: _title,
        description: _description,
        submitStartTime: _submitStartTime,
        submitEndTime: _submitEndTime
      }));
    }

    function getExamFactory(uint _index) public view returns (ExamFactory memory) {
        require(_index < examFactories.length, "Test index out of bounds.");
        return examFactories[_index];
    }
}