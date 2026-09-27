package com.campusvote.campusvote;

import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    private final VoteRepository voteRepository;

    public VoteController(VoteRepository voteRepository) {
        this.voteRepository = voteRepository;
    }

    @PostMapping
    public Map<String, Object> castVote(@RequestBody Map<String, String> voteData) {

        String studentId = voteData.get("studentId");
        String electionId = voteData.get("electionId");
        String candidateId = voteData.get("candidateId");

        if (studentId == null || electionId == null || candidateId == null) {
            return Map.of(
                "success", false,
                "message", "Missing vote information"
            );
        }

        if (voteRepository.existsByStudentIdAndElectionId(studentId, electionId)) {
            return Map.of(
                "success", false,
                "message", "You have already voted in this election"
            );
        }

        Vote vote = new Vote(
            UUID.randomUUID().toString(),
            studentId,
            electionId,
            candidateId
        );

        voteRepository.save(vote);

        return Map.of(
            "success", true,
            "message", "Vote submitted successfully"
        );
    }

    @GetMapping("/history/{studentId}")
    public List<Vote> getVotingHistory(@PathVariable String studentId) {
        return voteRepository.findByStudentId(studentId);
    }

    @GetMapping("/results/{electionId}")
    public List<Object[]> getElectionResults(@PathVariable String electionId) {
        return voteRepository.countVotesByCandidate(electionId);
    }

    @GetMapping("/voters/count")
    public Map<String, Long> getUniqueVoterCount() {

        long count = voteRepository.countUniqueVoters();

        return Map.of(
            "count", count
        );
    }
}