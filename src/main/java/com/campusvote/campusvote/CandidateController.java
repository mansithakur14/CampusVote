package com.campusvote.campusvote;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateRepository candidateRepository;

    public CandidateController(CandidateRepository candidateRepository) {
        this.candidateRepository = candidateRepository;
    }

    @GetMapping("/election/{electionId}")
    public List<Candidate> getCandidatesByElection(@PathVariable String electionId) {
        return candidateRepository.findByElectionId(electionId);
    }

    @PostMapping
public Candidate addCandidate(@RequestBody Candidate candidate) {
    return candidateRepository.save(candidate);
}
}