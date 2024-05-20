// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICreateExamFactory {
    struct ExamFactory {
        string title;
        string description;
        uint submitStartTime;
        uint submitEndTime;
    }

    function getExamFactory(uint _examFactoryId) external view returns (ExamFactory memory);
}