package com.campusvote.campusvote;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/elections")
public class ElectionController {

    private final ElectionRepository electionRepository;

    public ElectionController(ElectionRepository electionRepository) {
        this.electionRepository = electionRepository;
    }

    @GetMapping
    public List<Election> getAllElections() {
        return electionRepository.findAll();
    }
    @PostMapping
public Election createElection(@RequestBody Election election) {
    return electionRepository.save(election);
}
@PutMapping("/{id}/status")
public Election updateElectionStatus(
        @PathVariable String id,
        @RequestBody Map<String, String> data) {

    Election election = electionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Election not found"));

    election.setStatus(data.get("status"));

    return electionRepository.save(election);
}
@PutMapping("/{id}/results")
public Election updateResultsVisibility(
        @PathVariable String id,
        @RequestBody Map<String, Boolean> data) {

    Election election = electionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Election not found"));

    election.setResultsPublished(data.get("published"));

    return electionRepository.save(election);
}
@PutMapping("/{id}/publish")
public Election publishResults(@PathVariable String id) {

    Election election = electionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Election not found"));

    election.setResultsPublished(true);

    return electionRepository.save(election);
}
}