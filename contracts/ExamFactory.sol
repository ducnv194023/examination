// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.24;

contract ExamFactory {
    string[] public examArweaveIdHashes;

    event ExamCreated(uint examId);

    function createExam(string memory _examArweaveIdHash) public {
        examArweaveIdHashes.push(_examArweaveIdHash);

        emit ExamCreated(examArweaveIdHashes.length - 1);
    }

    function getExam(uint _examId) public view returns (string memory) {
        return examArweaveIdHashes[_examId];
    }
}
